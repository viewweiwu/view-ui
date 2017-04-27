(function($) {
    function Slider($el, opts) {
        opts = opts || {};
        this.$el = $el;
        this.$pnl = this.$el.find(">ul").eq(0);
        this.$li = this.$pnl.find(">li");
        this.$img = this.$li.find("img");
        this.type = opts.type || "slide"; // 默认动画类型 slider
        this.isMove = false; // 处于移动状态？

        // 自动循环
        this.loop = {
            enabled: true,
            time: 2000,
            speed: this.type === 'fade' ? 1000 : 300
        }

        // 读取 opts 的 loop 配置
        if (opts.loop) {
            var l = opts.loop;
            if (l.enabled === false) {
                this.loop.enabled = false;
            }
            if (l.time >= 0) {
                this.loop.time = l.time;
            }
            if (l.speed >= 0) {
                this.loop.speed = l.speed;
            }
        }

        // 下面的小点点
        this.indicators = {
            show: true,
            position: "out bottom",
            type: "point",
            canClick: false
        };

        // 读取 opts 的 indicators 配置
        if (opts.indicators) {
            var i = opts.indicators;
            if (i.show === false) {
                this.indicators.show = false;
            }
            if (i.position) {
                this.indicators.position = i.position;
            }
            if (i.type) {
                this.indicators.type = i.type;
            }
        }

        // 初始化
        this.init();
    }

    Slider.prototype = {
        init: function() {
            // 初始化样式
            this.initStyle();
            // 创建下面的小点点
            this.createIndicators();
            // 跳到第一页
            this.setIndex(0);
            // 事件绑定
            this.bind();
            // 是否需要循环？
            this.doAutoLoop();
        },
        /**
         * 名称: 初始化样式
         * 作用: 添加需要的 class 样式之后，初始化宽度
         */
        initStyle: function() {
            this.$el.addClass("slider");
            this.$pnl.addClass("slider-pnl");
            this.$img.attr("draggable", false);
            this.initWidth();
            if (this.type === 'fade') {
                this.$pnl.addClass('fade');
            }
        },
        /**
         * 名称: 初始化宽度
         * 作用: 初始化每一副画面的 宽度
         * 其他: 计算出单个 width, 并作为单位 - singleWidth 
         */
        initWidth: function() {
            if (this.type === 'fade') return;
            this.singleWidth = this.$el.width();
            this.$pnl.width(this.singleWidth * this.$li.length);
            this.$li.width(this.singleWidth);
        },
        /**
         * 名称: 创建 indicators
         * 作用: 在页面添加一个 indicators 并且默认定向到第一页
         */
        createIndicators: function() {
            // i 表示 indicators 的简写
            var i = this.indicators;
            if (i.show === false) return;
            var html = this.getIndicatorsHtml(i.type, this.$li.length);
            this.$el.append(html);
            this.$i = this.$el.find(".indicators");
            this.indicators.type === "number" && this.$i.addClass("number");
            this.indicators.canClick === true && this.$i.find(".item").css("cursor", "pointer")
            this.setIndicatorsPosition(this.indicators.position);
            this.setIndicatorsActive();
        },
        /**
         * 名称: 获取 indicators 的 html
         * 作用: 返回由 indicators config 生成的 html
         * return: html(stirng)
         */
        getIndicatorsHtml: function(type, length) {
            var html = "";

            html += '<div class="indicators">';
            html += '<div class="indicators-list">';
            for (var i = 0; i < length; i++) {
                switch (type) {
                    case "number":
                        html += '<div class="item">' + (i + 1) + '</div>';
                        break;
                    case "pointer":
                    default:
                        html += '<div class="item"></div>';
                        break;
                }
            }
            html += '</div>';
            html += '</div>';

            return html;
        },
        /**
         * 名称: 设定 indicators 的 active 样式
         * 作用: 取得当前页数，并给当前页数对应的 indicators 添加 active 样式
         */
        setIndicatorsActive: function() {
            this.$el.trigger("select", this.getIndex());
            if (this.indicators.show !== true) return;
            this.$i.find(".item").eq(this.getIndex()).addClass("active").siblings(".active").removeClass("active");
        },
        /**
         * 名称: 设定 indicators 的 position
         * 作用: 根据 indicators 的 config 来决定位置
         */
        setIndicatorsPosition: function(position) {
            var self = this;
            var $i = this.$i;
            var list = position.split(" ");
            var style = {};
            var listStyle = {};
            var changeItemStyle = false;
            var size = $i.height() > $i.width() ? $i.width() : $i.height();

            var config = {
                top: function() {
                    style.top = 0;
                    style.bottom = 0;
                    style.width = "100%";
                    style.height = size;
                    $i.prependTo(self.$el);
                    listStyle = {
                        'top': '50%',
                        'left': '50%',
                        'right': 'auto',
                        'bottom': 'auto',
                        'transform': 'translate(-50%, -50%)'
                    }
                },
                left: function() {
                    style.top = 0;
                    style.left = 0;
                    style.width = size;
                    style.height = "100%";
                    style.position = 'absolute';
                    listStyle = {
                        'top': '50%',
                        'left': '50%',
                        'right': 'auto',
                        'bottom': 'auto',
                        'transform': 'translate(-50%, -50%)'
                    }
                },
                right: function() {
                    style.top = 0;
                    style.left = 'auto';
                    style.right = 0;
                    style.width = size;
                    style.height = "100%";
                    style.position = 'absolute';
                    listStyle = {
                        'top': '50%',
                        'left': '50%',
                        'right': 'auto',
                        'bottom': 'auto',
                        'transform': 'translate(-50%, -50%)'
                    }
                },
                bottom: function() {
                    style.top = 'auto';
                    style.left = 0;
                    style.bottom = 0;
                    style.width = "100%";
                    style.height = size;
                    $i.appendTo(self.$el);
                    listStyle = {
                        'top': '50%',
                        'left': '50%',
                        'right': 'auto',
                        'bottom': 'auto',
                        'transform': 'translate(-50%, -50%)'
                    }
                },
                topLeft: function() {
                    this.top();
                    style.position = 'absolute';
                    listStyle = {
                        'top': '0',
                        'left': '0',
                        'transform': 'translate3d(0, 0, 0)'
                    };
                },
                topRight: function() {
                    this.top();
                    style.position = 'absolute';
                    listStyle = {
                        'top': '0',
                        'left': 'auto',
                        'right': '0',
                        'transform': 'translate3d(0, 0, 0)'
                    };
                },
                leftTop: function() {
                    this.left();
                    style.position = 'absolute';
                    listStyle = {
                        'top': '0',
                        'left': '0',
                        'transform': 'translate3d(0, 0, 0)'
                    }
                },
                leftBottom: function() {
                    this.left();
                    style.position = 'absolute';
                    listStyle = {
                        'top': 'auto',
                        'left': '0',
                        'bottom': '0',
                        'transform': 'translate3d(0, 0, 0)'
                    }
                },
                rightTop: function() {
                    this.right();
                    style.position = 'absolute';
                    listStyle = {
                        'top': '0',
                        'left': 'auto',
                        'right': '0',
                        'transform': 'translate3d(0, 0, 0)'
                    }
                    changeItemStyle = true;
                },
                rightBottom: function() {
                    this.right();
                    style.position = 'absolute';
                    listStyle = {
                        'top': 'auto',
                        'left': 'auto',
                        'right': '0',
                        'bottom': '0',
                        'transform': 'translate3d(0, 0, 0)'
                    }
                    changeItemStyle = true;
                },
                bottomLeft: function() {
                    this.bottom();
                    style.position = 'absolute';
                    listStyle = {
                        'top': 'auto',
                        'left': '0',
                        'bottom': '0',
                        'transform': 'translate3d(0, 0, 0)'
                    };
                },
                bottomRight: function() {
                    this.bottom();
                    style.position = 'absolute';
                    listStyle = {
                        'top': 'auto',
                        'left': 'auto',
                        'right': '0',
                        'bottom': '0',
                        'transform': 'translate3d(0, 0, 0)'
                    };
                }
            }

            $.each(list || [], function(i, obj) {
                switch (obj) {
                    case "inset":
                        style.position = 'absolute';
                        break;
                    case "out":
                        style.position = 'relative';
                        break;
                    case "top":
                        config.top();
                        break;
                    case "right":
                        config.right();
                        break;
                    case "left":
                        config.left();
                        break;
                        break;
                    case "bottom":
                        config.bottom();
                        break;
                    case "top-left":
                        config.topLeft();
                        break;
                    case "top-right":
                        config.topRight();
                        break;
                    case "left-top":
                        config.leftTop();
                        break;
                    case "left-bottom":
                        config.leftBottom();
                        break;
                    case "right-top":
                        config.rightTop();
                        break;
                    case "right-bottom":
                        config.rightBottom();
                        break;
                    case "bottom-left":
                        config.bottomLeft();
                        break;
                    case "bottom-right":
                        config.bottomRight();

                }
            });

            $i.css(style);
            $i.find('.indicators-list').css(listStyle).find('.item')[changeItemStyle === true ? 'addClass' : 'removeClass']('right');
        },
        /**
         * 名称: 事件绑定
         * 作用: 根据不同的动画类型绑定不同的事件
         */
        bind: function() {
            this.type !== 'fade' ? this.events.bind.call(this) : this.fadeEvents.bind.call(this);
            if (this.indicators.canClick === true) {
                this.$i.on("click", ".item", this.events.onIndicatorsClick.bind(this));
                this.$i.on("tap", ".item", this.events.onIndicatorsClick.bind(this));
            }
        },
        /**
         * 名称: 获取页数
         * 作用: 计算出当前第几页
         * return:  number (0 - max)
         */
        getIndex: function() {
            var index = 0;
            if (this.type === 'fade') {
                $.each(this.$li, function(i, obj) {
                    var $target = $(obj);
                    if ($target.css("z-index") === "1") {
                        index = $target.index();
                        return false;
                    }
                })
            } else {
                var y = util.getX(this.$pnl) * -1;
                index = Math.round(y / this.singleWidth);
            }
            return index;
        },
        /**
         * 名称: 跳转到的页数
         * 作用: 跳转的指定页数，并执行动画
         * 参数: i (0 - max), speed 执行翻页的时间 
         */
        setIndex: function(i, speed) {
            this.clearLoop();
            if (this.type === 'fade') {
                var index = i;
                $.each(this.$li, function(i, obj) {
                    var $target = $(obj);
                    if (i === index) {
                        $target.css({
                            "z-index": 1,
                            "opacity": 1,
                            "transition": "opacity " + speed + "ms"
                        });
                    } else {
                        $target.css({
                            "z-index": 0,
                            "opacity": 0,
                            "transition": "opacity 0"
                        });
                    }
                });
            } else {
                var final = i * this.singleWidth * -1;
                speed = speed >= 0 ? speed : 0;
                // 设置位置
                this.$pnl.css({
                    "transform": "translate3d(" + final + "px, 0, 0)",
                    "transition": "transform " + speed + "ms"
                });
            }
            // 设置点的样式
            this.setIndicatorsActive();
            this.doAutoLoop();
        },
        /**
         * 名称: 上一页
         * 作用: 把当前的页数定位到上一页，如果到末页则定向到最后一页
         */
        prevPage: function() {
            var page = this.getIndex();
            // 往下翻页
            page -= 1;
            // 最后一页就滚到第一页
            if (page < 0) {
                page = this.$li.length - 1;
            }
            // 设置页数
            this.setIndex(page, this.loop.speed);
        },
        /**
         * 名称: 下一页
         * 作用: 把当前的页数定位到下一页，如果到末页则定向到第一页
         */
        nextPage: function() {
            var page = this.getIndex();
            // 往下翻页
            page += 1;
            // 最后一页就滚到第一页
            if (page > this.$li.length - 1) {
                page = 0;
            }
            // 设置页数
            this.setIndex(page, this.loop.speed);
        },
        /**
         * 名称: 跳到具体某一页
         * 作用: 把当前的页数定位到下一页，如果到末页则定向到第一页
         */
        jumpPage: function(page) {
            // 最后一页就滚到第一页
            if (page > this.$li.length - 1) {
                page = 0;
            }
            if (page < 0) {
                page = this.$li.length - 1;
            }
            // 设置页数
            this.setIndex(page, this.loop.speed);
        },
        /**
         * 名称: 开始自动播放
         * 作用: 如果当前 config 里开启了 loop 则会调 autoLoop 函数
         */
        doAutoLoop: function() {
            if (this.loop.enabled === false || this.isMove) return;
            this.clearLoop();
            this.loopTimer = setTimeout(this.autoLoop.bind(this), this.loop.time + this.loop.speed);
        },
        /**
         * 名称: 自动播放
         * 作用: 如果当前 config 里开启了 loop 则会调 nextPage 函数
         */
        autoLoop: function() {
            if (this.loop.enabled === false || this.isMove) return;
            this.nextPage();
            this.loopTimer = setTimeout(this.autoLoop.bind(this), this.loop.time + this.loop.speed);
        },
        /**
         * 名称: 清除自动播放
         * 作用: 清除自动播放的定时器
         */
        clearLoop: function() {
            if (this.loopTimer) clearTimeout(this.loopTimer);
        },
        /**
         * 名称: 销毁
         * 作用: 销毁掉所有绑定事件，并且清除所有设定样式，结束自动播放
         */
        destroy: function() {
            this.type !== 'fade' ? this.events.destroy.call(this) : this.fadeEvents.destroy.call(this);
            if (this.indicators.show === true) {
                this.$i.remove();
            }
            this.$el.removeClass("slider");
            this.$pnl.removeClass("slider-pnl");
            this.$img.attr("draggable", true);
            this.clearLoop();
        }
    }

    Slider.prototype.events = {
        /**
         * 名称: slide 类型绑定事件
         * 作用: 被绑定的事件在 Slider.events 里面
         */
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
            this.$pnl.width("auto");
            this.$li.width("auto");
        },
        /**
         * 名称: 开始拖动
         * 作用: 记录当前的时间、位置、并且标记现在正处于拖动状态，暂停自动播放
         */
        onStart: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var pageX = e.pageX !== undefined ? e.pageX : e.touches[0].pageX;
            this.pageX = pageX;
            this.startDate = new Date();
            this.startX = util.getX(this.$pnl);
            this.isMove = true;
            // 取消自动播放
            this.clearLoop();
        },
        /**
         * 名称: 拖动 ing
         * 作用: 根据记录时间、位置，将 slider 跟随手指移动到具体位置
         * 其他: 如果不处于拖动状态，则不会执行内部逻辑
         */
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
        /**
         * 名称: 拖动结束
         * 作用: 1: 矫正位置; 2: 矫正边界; 3: 快划翻页; 4: 继续自动播放; 5: 更新 indicator 的位置; 6: 取消拖动状态
         * 其他: 如果不处于拖动状态，则不会执行内部逻辑
         */
        onEnd: function(e) {
            if (!this.isMove) return;
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

            // 继续自动播放
            this.doAutoLoop();
            // 更新 indicators acitve 样式
            this.setIndicatorsActive();
            // 取消拖动状态
            this.isMove = false;
        },
        /**
         * 名称: 重设大小
         * 作用: 浏览器改变大小时，重调大小，
         * 其他: 控制了节流
         */
        resetSize: function() {
            var self = this;
            this.resetTimer = setTimeout(function() {
                if (self.resetTimer) {
                    clearTimeout(self.resetTimer);
                }
                self.initWidth();
                self.clearLoop();
                self.isMove = true;
                self.events.onEnd.apply(self, [null]);
            }, 100);
        },
        onIndicatorsClick: function(e) {
            var $target = $(e.target);
            this.jumpPage($(e.target).index());
        }
    }

    Slider.prototype.fadeEvents = {
        /**
         * 名称: slide 类型绑定事件
         * 作用: 被绑定的事件在 Slider.events 里面
         */
        bind: function() {
            this.$el.on({
                "touchstart": this.fadeEvents.onStart.bind(this),
                "touchmove": this.fadeEvents.onMove.bind(this),
                "touchend": this.fadeEvents.onEnd.bind(this),
                "touchcancel": this.fadeEvents.onEnd.bind(this),
                "mousedown": this.fadeEvents.onStart.bind(this),
            });
            $(document).on({
                "mousemove": this.fadeEvents.onMove.bind(this),
                "mouseup": this.fadeEvents.onEnd.bind(this)
            });
        },
        destroy: function() {
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
            this.$pnl.removeClass('fade');
            this.$li.css({
                'z-index': 'auto',
                'opacity': 'inherit',
                'width': 'auto'
            });
        },
        onStart: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var pageX = e.pageX !== undefined ? e.pageX : e.touches[0].pageX;
            this.pageX = pageX;
            this.endPageX = pageX;
            this.startDate = new Date();
            this.isMove = true;
            // 取消自动播放
            this.clearLoop();
        },
        onMove: function(e) {
            if (!this.isMove) return;
            e.preventDefault();
            e.stopPropagation();
            var pageX = e.pageX !== undefined ? e.pageX : e.touches[0].pageX;

            this.endPageX = pageX;
        },
        onEnd: function() {
            if (!this.isMove) return;
            var diffX = this.endPageX - this.pageX;
            var direction = diffX > 0 ? 1 : -1; // 1: right, -1: left
            var dateDiff = new Date - this.startDate;
            var singleWidth = this.$pnl.width();

            if (dateDiff < 150 && Math.abs(diffX) > singleWidth / 6) {
                direction < 0 ? this.nextPage() : this.prevPage();
            }

            // 继续自动播放
            this.doAutoLoop();
            // 更新 indicators acitve 样式
            this.setIndicatorsActive();
            // 取消拖动状态
            this.isMove = false;
        }
    }

    var util = {
        /**
         * 名称: 获取 traslateX
         * 作用: 获取目标的 traslateX 值
         * return: translateX (int)
         */
        getX: function($target) {
            return parseInt($target[0].style.transform.slice(12)) || 0;
        },
        /**
         * 名称: 补 0
         * 作用: 如果数字小于 0, 则在前面补个 0
         * return: num (stirng)
         */
        plusZero: function(num) {
            return num < 10 ? "0" + num : "" + num;
        }
    }

    $.fn.slider = function(options) {
        return this.each(function(i, obj) {
            var $target = $(obj);
            $target.data("slider", new Slider($target, options));
        });
    }
})(Zepto);