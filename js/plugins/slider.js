(function($) {
    function Slider($el, opts) {
        opts = opts || {};
        this.$el = $el;
        this.$pnl = $el.find(">ul").eq(0);
        this.$li = this.$pnl.find(">li");
        this.$img = this.$li.find("img");
        this.type = opts.type || "slide";
        this.isMove = false;

        // 下面的小点点
        this.indicators = {
            show: true,
            position: "out bottom",
            type: "point"
        };

        if (opts.indicators) {
            if (opts.indicators.show === false) {
                this.indicators.show = false;
            }
            if (opts.indicators.position) {
                this.indicators.position = opts.indicators.position;
            }
            if (opts.indicators.type) {
                this.indicators.type = opts.indicators.type;
            }
        }

        this.init();
    }

    Slider.prototype = {
        init: function() {
            // 初始化宽度
            this.initStyle();
            // 创建下面的小点点
            this.createIndicators();
            // 事件绑定
            this.bind();
        },
        initStyle: function() {
            this.$el.addClass("slider");
            this.$pnl.addClass("slider-pnl");
            this.$img.attr("draggable", false);
            this.initWidth();
        },
        initWidth: function() {
            this.singleWidth = this.$el.width();
            this.$pnl.width(this.singleWidth * this.$li.length);
            this.$li.width(this.singleWidth);
        },
        createIndicators: function() {
            // i 表示 indicators 的简写
            var i = this.indicators;
            if (i.show === false) return;
            var html = this.getIndicatorsHtml(i.type, this.$li.length);
            this.$el.append(html);
            this.$i = this.$el.find(".indicators");
            this.setIndicatorsActive();
        },
        getIndicatorsHtml: function(type, length) {
            var html = "";

            html += '<div class="indicators">';
            for (var i = 0; i < length; i++) {
                switch (type) {
                    case "number":
                        html += '<div class="item">' + util.plusZero(i) + '</div>';
                        break;
                    case "pointer":
                    default:
                        html += '<div class="item"></div>';
                        break;
                }
            }
            html += '</div>';

            return html;
        },
        setIndicatorsActive: function() {
            this.$i.find(".item").eq(this.getIndex()).addClass("active").siblings(".acitve").removeClass(".active");
        },
        bind: function() {
            this.$el.on({
                "touchstart": this.events.onStart.bind(this),
                "touchmove": this.events.onMove.bind(this),
                "touchend": this.events.onEnd.bind(this),
                "touchcancel": this.events.onEnd.bind(this),
                "mousedown": this.events.onStart.bind(this),
            });
            $(document).on({
                "mousemove": this.events.onMove.bind(this),
                "mouseup": this.events.onEnd.bind(this)
            });
            $(window).on("resize", this.events.resetSize.bind(this));
        },
        getIndex: function() {
            var result = "";
            var y = util.getX(this.$el) * -1;
            var index = Math.round(y / this.singleWidth);

            return index;
        },
        destroy: function() {
            this.$el.removeClass("slider");
            this.$pnl.removeClass("slider-pnl");
            this.$pnl.width("auto");
            this.$li.width("auto");
            this.$img.attr("draggable", true);
            this.$el.off({
                "touchstart": Slider.onStart,
                "touchmove": Slider.onMove,
                "touchend": Slider.onEnd,
                "touchcancel": Slider.onEnd,
                "mousedown": Slider.onStart
            });
            $(document).off({
                "mousemove": Slider.onMove,
                "mouseup": Slider.onEnd
            });
            $(window).off("resize", Slider.resetSize);
        }
    }

    Slider.prototype.events = {
        onStart: function(e) {
            e.preventDefault();
            var pageX = e.pageX !== undefined ? e.pageX : e.touches[0].pageX;
            this.pageX = pageX;
            this.startDate = new Date();
            this.startX = util.getX(this.$pnl);
            this.isMove = true;
        },
        onMove: function(e) {
            if (!this.isMove) return;
            e.preventDefault();
            e.stopPropagation();
            var pageX = e.pageX !== undefined ? e.pageX : e.touches[0].pageX;
            var x = util.getX(this.$pnl);
            var final = pageX - this.pageX + x;

            this.$pnl.css({
                "transform": "translate3d(" + final + "px, 0, 0)",
                "transition": ""
            });

            this.pageX = pageX;
        },
        onEnd: function(e) {
            console.log('end');
            var self = this;
            var x = util.getX(this.$pnl);
            var right = this.singleWidth * (this.$li.length - 1) * -1 // 右边界
            var final = util.getX(this.$pnl); // 最终值

            var diffX = this.startX - x;
            var direction = diffX > 0 ? 1 : -1; // 1: right, -1: left
            var page = this.page;
            var dateDiff = new Date - this.startDate;
            var diff = 0; // 矫正差值

            // 矫正差值
            diff = final % this.singleWidth;

            // 快划
            if (dateDiff < 150 && Math.abs(diffX) > this.singleWidth / 6) {
                if (direction > 0) {
                    final -= this.singleWidth
                }
            } else if (Math.abs(diff) > this.singleWidth / 2) { // 矫正
                final -= this.singleWidth;
            }

            // 减去冗余
            final -= diff;

            // 矫正边界
            if (final > 0) {
                final = 0;
            } else if (final < right) {
                final = right;
            }

            // 设置最终位置
            this.$pnl.css({
                "transform": "translate3d(" + final + "px, 0, 0)",
                "transition": "transform 300ms"
            });

            if (this.indicators.show === true) {
                this.setIndicatorsActive();
            }

            this.page = page;
            this.isMove = false;
        },
        resetSize: function() {
            var self = this;
            this.resetTimer = setTimeout(function() {
                if (self.resetTimer) {
                    clearTimeout(self.resetTimer);
                }
                self.initWidth();
                self.singleWidth = self.$el.width();
                self.events.onEnd.apply(self, [null]);
            }, 100);
        }
    }

    var util = {
        getX: function($target) {
            return parseInt($target.css("transform").slice(12)) || 0;
        },
        plusZero: function(num) {
            return num < 10 ? "0" + num : num;
        }
    }

    $.fn.slider = function(options) {
        return this.each(function(i, obj) {
            var $target = $(obj);
            $target.data("slider", new Slider($target, options));
        });
    }
})(Zepto);