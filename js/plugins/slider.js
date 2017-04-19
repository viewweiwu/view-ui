(function($) {
    function Slider($el, opts) {
        opts = opts || {};
        this.$el = $el;
        this.$pnl = $el.find(">ul").eq(0);
        this.$li = this.$pnl.find(">li");
        this.$img = this.$li.find("img");
        this.isMove = false;
        this.init();
    }

    Slider.prototype = {
        init: function() {
            this.initStyle();
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
            var self = this;
            var x = util.getX(this.$pnl);
            var right = this.singleWidth * (this.$li.length - 1) * -1 // 右边界
            var final = util.getX(this.$pnl); // 最终值

            var diffX = this.startX - x;
            var direction = diffX > 0 ? 1 : -1; // 1: right, -1: left
            var page = this.page;
            var dateDiff = new Date - this.startDate;
            var diff = 0; // 矫正差值

            // 快划
            if (dateDiff < 150 && Math.abs(diffX) > this.singleWidth / 6) {
                final -= this.singleWidth * direction;
            }

            // 矫正边界
            if (final > 0) {
                final = 0;
            } else if (final < right) {
                final = right;
            }

            // 矫正差值
            diff = final % this.singleWidth;

            if (Math.abs(diff) > this.singleWidth / 2) {
                final -= this.singleWidth;
            }
            // 减去冗余
            final -= diff;

            // 设置最终位置
            this.$pnl.css({
                "transform": "translate3d(" + final + "px, 0, 0)",
                "transition": "transform 300ms"
            });

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
                self.onEnd();
            }, 100);
        }
    }

    var util = {
        getX: function($target) {
            return parseInt($target.css("transform").slice(12)) || 0;
        }
    }

    $.fn.slider = function(options) {
        return this.each(function(i, obj) {
            var $target = $(obj);
            $target.data("slider", new Slider($target, options));
        });
    }
})(Zepto);