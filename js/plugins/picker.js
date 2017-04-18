(function($) {
    function Picker($target, opts) {
        opts = opts || {};
        this.$container = $(".container"); // 最外层容器啦
        this.$target = $target;
        this.id = opts.id ? opts.id : $target.attr("id");
        this.selectText = opts.text || "text";
        this.selectValue = opts.value || "value";
        this.selectList = opts.list || "children";
        this.data = opts.data;
        this.list = [];
        this.split = " - ";
        this.init();
    }

    Picker.prototype = {
        init: function() {
            this.createEl();
            this.addList(this.data);
            this.onListChange(null, this.list[0]);
            this.initStyle();
            this.bind();
        },
        createEl: function() {
            var html = '';
            var $el = '';
            html +=
                '<div class="picker" id="' + this.id + '">' +
                '<div class="pnl">' +
                '<div class="decorate"></div>' +
                '<div class="top">' +
                '<button class="btn not-bg btn-cancel">取消</button>' +
                '<button class="btn not-bg btn-confirm">完成</button>' +
                '</div>' +
                '<div class="content">' +
                '</div>' +
                '</div>' +
                '</div>';
            $el = $(html);
            this.$container.append($el);

            this.$el = $el;
            this.$pnl = $el.find(".pnl");
            this.$content = $el.find(".content");
            this.$cancelBtn = $el.find(".btn-cancel");
            this.$confirmBtn = $el.find(".btn-confirm");
            this.$decorate = $el.find(".decorate");
        },
        initStyle: function() {
            this.$decorate.height(this.list[0].getSingleHeight());
        },
        bind: function() {
            this.$target.on({
                "focus": this.onTargetFocus.bind(this)
            });
            this.$cancelBtn.on("tap", this.onCancelBtnClick.bind(this));
            this.$confirmBtn.on("tap", this.onConfirmBtnClick.bind(this));
            this.$el.on("touchstart", this.preventDefault.bind(this));
            this.$content.on("change", ".list", this.onListChange.bind(this));
        },
        preventDefault: function(e) {
            e.preventDefault();
        },
        onTargetFocus: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.$target.blur();
            this.show();
        },
        onCancelBtnClick: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.close();
        },
        onConfirmBtnClick: function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.setTargetData();
            this.close();
        },
        onListChange: function(e, targetList) {
            var data = targetList.data[targetList.getIndex()][this.selectList];
            if (data) {
                var next = targetList.$parent.index() + 1;
                var nextList = this.list[next];
                if (nextList) {
                    nextList.setData(data);
                } else {
                    this.addList(data);
                    nextList = this.list[next];
                }
                this.onListChange(e, nextList);
            } else {
                var next = targetList.$parent.index() + 1;
                $.each(this.list.slice(next), function(i, obj) {
                    obj.destroy();
                });
                this.list.length = next;
                this.resetListSize();
            }
        },
        show: function() {
            this.$el.css({
                "background-color": "rgba(0, 0, 0, .5)",
                "transform": "translateX(0)"
            });
            this.$pnl.css({
                "transform": "translateY(0)"
            });
        },
        close: function() {
            var self = this;
            this.$el.css({
                "background-color": "rgba(0, 0, 0, 0)"
            });
            this.$pnl.css({
                "transform": "translateY(100%)"
            });
            setTimeout(function() {
                self.$el.css({
                    "transform": "translateX(100%)"
                })
            }, 300);
        },
        addList: function(data) {
            this.list.push(new List(data, this));
            this.resetListSize();
        },
        resetListSize: function() {
            var self = this;
            $.each(this.list, function(i, obj) {
                obj.$parent.width(100 / self.list.length + "%");
            });
        },
        setTargetData: function() {
            var self = this;
            var text = "";
            var value = "";
            this.close();
            $.each(this.list, function(i, obj) {
                if (obj.getIndex() === 0 && obj.getText === self.defaultText) return true;
                if (i !== 0) {
                    text += self.split;
                    value += self.split;
                }
                text += obj.getText();
                value += obj.getValue();
            });
            this.$target.val(text);
            this.$target.attr("data-value", value);
        },
        setData: function(d, type) {
            var list = d.split(this.split);
            var data = this.data;

            $.each(this.data, function(i, obj) {

            });

            // 将值赋值到文本框
            this.setTargetData();
        },
        setValue: function(value) {
            this.setData(value, "value");
        },
        setText: function(text) {
            this.setData(text, "text");
        }
    };

    function List(data, picker, type) {
        this.$container = picker.$container; // 最外层容器啦
        this.$picker = picker.$el;
        this.$pnl = picker.$pnl;
        this.$content = picker.$content;
        this.$target = picker.$target;
        this.selectText = picker.selectText;
        this.selectValue = picker.selectValue;
        this.type = type; // 判断 datepicker 是什么类型的
        this.data = data;
        this.init();
    }

    List.prototype = {
        init: function() {
            this.createEl();
            this.initStyle();
            this.bind();
        },
        createEl: function() {
            var $html = $(this.getHtml(this.data));
            this.$content.append($html);
            this.$parent = $html;
            this.$el = $html.find(".list");
            this.singleHeight = this.$el.find(".item").height(); // 1 个单位 = 单个 li 的 height
            this.resetSingleSize();
        },
        resetSingleSize: function() {
            this.$el.find(".item").height(this.singleHeight);
        },
        getSingleHeight: function() {
            return this.singleHeight;
        },
        getHtml: function(data) {
            var result = "";
            var self = this;
            result +=
                '<div class="scroll-pnl">' +
                '<ul class="list">' +
                this.getListHtml(data) +
                '</ul>' +
                '</div>';
            return result;
        },
        getListHtml: function(data) {
            var result = "";
            var self = this;
            $.each(data || [], function(i, obj) {
                var text = "";
                var value = "";
                if (typeof obj === "string" || typeof obj === "number") {
                    result += '<li class="item" data-index="' + i + '">' + obj + '</li>';
                } else {
                    result += '<li class="item" data-index="' + i + '" data-value=' + obj[self.selectValue] + '>' + obj[self.selectText] + '</li>';
                }
            });

            return result;
        },
        /**
         * 名称: 初始化样式
         * 作用: 将所有 list 向下移动 3 个单位
         */
        initStyle: function() {
            var defalutY = this.singleHeight * 3;
            this.$el.css("transform", "translateY(" + defalutY + "px)");
            this.defalutY = defalutY;
        },
        refresh: function() {
            var $target = this.$el;
            var totalHeight = $target.find("li").length * this.singleHeight; // 获取所有 li 的总高度
            var bottom = (totalHeight - this.singleHeight) * -1; // 底部边界
            var y = util.getY($target) - this.defalutY; // 获取本身偏移了多少 Y
            var final = y + this.defalutY; // 默认值最终值
            if (y < bottom) {
                final = bottom + this.defalutY;
            }
            this.$el.css("transform", "translateY(" + final + "px)");
        },
        bind: function() {
            this.$parent.on({
                "touchstart": this.onStart.bind(this),
                "touchmove": this.onMove.bind(this),
                "touchend": this.onEnd.bind(this),
                "touchcancel": this.onEnd.bind(this)
            });
        },
        /**
         * 名称: 鼠标 touchstart 事件
         * 作用: 标记当前 list 的 pageY
         */
        onStart: function(e) {
            var pageY = e.touches[0].pageY;
            this.pageY = pageY;
            this.startDate = new Date();
            this.startY = util.getY(util.getTarget(e)) - this.defalutY;
            this.currIndex = this.getIndex();
        },
        /**
         * 名称: 鼠标 touchmove 事件
         * 作用: 计算跟之前标记的 pageY 的差值，并累加到 translateY 上
         */
        onMove: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $target = util.getTarget(e);
            var pageY = e.touches[0].pageY;
            var y = util.getY($target); // 获取之前的 translateY
            var final = pageY - this.pageY + y; // 比较差值并累加，计算出最终值
            $target.css({
                "transform": "translateY(" + final + "px)",
                "transition": "width 300ms"
            });
            this.pageY = pageY; // 重新标记 pageY
        },
        /**
         * 名称: 鼠标 touchend 事件
         * 作用: 矫正最终的滚动值
         */
        onEnd: function(e) {
            var self = this;
            var $target = util.getTarget(e);
            var $li = $target.find("li");
            var totalHeight = $li.length * this.singleHeight; // 获取所有 li 的总高度
            var y = util.getY($target) - this.defalutY; // 获取本身偏移了多少 Y
            var bottom = (totalHeight - this.singleHeight) * -1; // 底部边界
            var final = y + this.defalutY; // 默认值最终值
            var diff = 0; // 矫正差值
            var dateDiff = new Date() - this.startDate; // 于开始的滚动时间做判断 
            var diffY = this.startY - y; // 计算滚动惯性
            var direction = diffY > 0 ? 1 : -1; // 计算滚动方向 -1:up 1:down

            // 矫正边界 判断最终值是否超出边界，矫正到顶部边界或者底部边界
            if (y > 0) {
                final = this.defalutY;
            } else if (y < bottom) {
                final = bottom + this.defalutY;
            }

            // 计算需要矫正的差
            diff = final % this.singleHeight;

            // 矫正未移动到正确位置的最终值，如果差值大于一半，则最终值加上一个单位
            if (Math.abs(diff) > this.singleHeight / 2) {
                if (final < 0) {
                    final -= this.singleHeight;
                } else {
                    final += this.singleHeight;
                }
            }

            // 减去冗余
            final -= diff;

            // 惯性滚动，滚动超过两格才做处理
            if (Math.abs(diffY) > this.singleHeight * 2) {
                var d = Math.round(Math.abs(diffY) / this.singleHeight * 2); // 移动单位
                var t = 3 - Math.ceil(dateDiff / 100); // 移动时间
                if (t < 1) t = 0;
                var a = t * d * direction * this.singleHeight;

                final -= a;

                // 再次矫正
                if (final < bottom + 3 * this.singleHeight) {
                    final = bottom + 3 * this.singleHeight;
                } else if (final > this.defalutY) {
                    final = this.defalutY;
                }
            }

            // 进行滚动
            $target.css({
                "transform": "translateY(" + final + "px)",
                "transition": "width, transform 300ms"
            });

            // 发布事件
            self.timer = setTimeout(function() {
                var index = self.getIndex();
                if (self.timer) {
                    clearTimeout(self.timer);
                }
                if (self.currIndex !== index) {
                    self.$el.trigger("change", self);
                }
            }, 300);
        },
        getIndex: function() {
            var result = "";
            var y = (util.getY(this.$el) - this.defalutY) * -1;
            var index = Math.round(y / this.singleHeight);

            return index;
        },
        getText: function() {
            return this.$el.find(".item").eq(this.getIndex()).text();
        },
        getValue: function() {
            return this.$el.find(".item").eq(this.getIndex()).data("value");
        },
        setIndex: function(index) {
            var y = this.defalutY + (index + 1) * this.singleHeight * -1;
            this.$el.css("transform", "translateY(" + y + "px)");
        },
        setText: function(text) {
            var self = this;
            $.each(this.data, function(i, obj) {
                if (obj[self.selectText] === text) {
                    self.setIndex(i);
                    return false;
                }
            });
        },
        setValue: function(value) {
            var self = this;
            $.each(this.data, function(i, obj) {
                if (obj[self.selectValue] === value) {
                    self.setIndex(i);
                    return false;
                }
            });
        },
        setData: function(data, refresh) {
            this.data = data;
            if (data.length) {
                this.$el.html(this.getListHtml(data));
                if (refresh) {
                    this.refresh();
                } else {
                    this.initStyle();
                }
                this.resetSingleSize();
            } else {
                // this.destroy();
            }
        },
        destroy: function() {
            this.$parent.remove();
        }
    }

    function DatePicker($target, opts) {
        opts = opts || {};
        this.$container = $(".container"); // 最外层容器啦
        this.$target = $target;
        this.opts = opts;
        this.type = opts.type || "date";
        this.id = opts.id ? opts.id : $target.attr("id");
        this.selectText = opts.text || "text";
        this.selectValue = opts.value || "value";
        this.selectList = opts.list || "children";
        this.formatStr = opts.formatStr || "yyyy-MM-dd hh:mm:ss";
        this.split = "-";
        this.list = [];
        this.data = [];
        this.init();
    }

    DatePicker.prototype = {
        init: function() {
            // 拷贝 picker 的大部分 function ！！！！
            this.copyFunction();
            // 获取时间 上限 和 下限
            this.getRangeData();
            // 获取数据
            this.getData();
            // 创建元素
            this.createEl();
            // 创建 picker
            this.createPicker();
            // 绑定事件
            this.bind();
        },
        copyFunction: function() {
            var picker = Picker.prototype;
            this.preventDefault = picker.preventDefault.bind(this);
            this.onTargetFocus = picker.onTargetFocus.bind(this);
            this.onCancelBtnClick = picker.onCancelBtnClick.bind(this);
            this.onConfirmBtnClick = picker.onConfirmBtnClick.bind(this);
            this.show = picker.show.bind(this);
            this.close = picker.close.bind(this);
            this.createEl = picker.createEl.bind(this);
            this.resetListSize = picker.resetListSize.bind(this);
            this.initStyle = picker.initStyle.bind(this);
            this.setValue = picker.setValue.bind(this);
            this.setText = picker.setText.bind(this);
        },
        bind: function() {
            this.$target.on({
                "focus": this.onTargetFocus.bind(this),
            });
            this.$cancelBtn.on("tap", this.onCancelBtnClick.bind(this));
            this.$confirmBtn.on("tap", this.onConfirmBtnClick.bind(this));
            this.$el.on("touchstart", this.preventDefault.bind(this));
            this.$content.on("change", ".list", this.onListChange.bind(this));
        },
        onListChange: function(e, targetList) {
            var type = targetList.type;

            // 如果是月份变化，则需要改变
            if (type === 'month') {
                var yearList = this.getList('year');
                var monthList = targetList;
                var dayList = this.getList('day');
                this.data["day"] = this.getDayData(yearList.getValue(), monthList.getValue());
                dayList.setData(this.data['day'], true);
            } else if (type === 'year') {
                var yearList = targetList;
                var monthList = this.getList('month');
                var dayList = this.getList('day');
                this.data["day"] = this.getDayData(yearList.getValue(), monthList.getValue());
                dayList.setData(this.data['day'], true);
            }
        },
        getRangeData: function() {
            // 默认向前 20 年
            if (!this.opts.start) {
                var date = new Date();
                date.setFullYear(date.getFullYear() - 20);
                this.start = date;
            }

            // 默认向后 20 年
            if (!this.opts.end) {
                var date = new Date();
                date.setFullYear(date.getFullYear() + 20);
                this.end = date;
            }
        },
        getData: function() {
            var data = {};
            switch (this.type) {
                case "date":
                    data["year"] = this.getYearData();
                    data["month"] = this.getMonthData();
                    data["day"] = this.getDayData(this.start.getFullYear(), 1); // 默认 1 月份
                    break;
                case "time":
                    data["hour"] = this.getHourData();
                    data["minute"] = this.getMinuteData();
                    break;
                case "datetime":
                    data["year"] = this.getYearData();
                    data["month"] = this.getMonthData();
                    data["day"] = this.getDayData(this.start.getFullYear(), 1); // 默认 1 月份
                    data["hour"] = this.getHourData();
                    data["minute"] = this.getMinuteData();
                    break;
            }
            this.data = data;
        },
        getYearData: function() {
            var startYear = this.start.getFullYear();
            var endYear = this.end.getFullYear();
            return this.getListByMax(endYear, startYear);
        },
        getMonthData: function() {
            return this.getListByMax(12);
        },
        getDayData: function(year, month) {
            var max = this.getDayMax(year, month);
            return this.getListByMax(max);
        },
        getHourData: function() {
            return this.getListByMax(23, 0);
        },
        getMinuteData: function() {
            return this.getListByMax(59, 0);
        },
        getSecondData: function() {
            return this.getListByMax(59, 0);
        },
        getListByMax: function(max, min) {
            var result = [];
            if (min === undefined) {
                min = 1;
            }
            for (var i = min; i <= max; i++) {
                var temp = {
                    text: this.plusZero(i),
                    value: i
                }
                result.push(temp);
            }
            return result;
        },
        isLeapYear: function(year) {
            var d = new Date(year, 1, 29);
            return d.getDate() === 29;
        },
        getDayMax: function(year, month) {
            var d = new Date(year, month, 1, 0, 0, 0);
            var prevDay = new Date(d - 1000);
            return prevDay.getDate();
        },
        plusZero: function(num) {
            return num < 10 ? "0" + num : num;
        },
        getList: function(type) {
            for (var i = 0; i < this.list.length; i++) {
                var targetList = this.list[i];
                if (type === targetList.type) {
                    return targetList;
                }
            }
            return;
        },
        addList: function(data, type) {
            this.list.push(new List(data, this, type));
            this.resetListSize();
        },
        createPicker: function() {
            for (var key in this.data) {
                var value = this.data[key];
                this.addList(value, key);
            }
        },
        setData: function(d, type) {
            var list = d.split(this.split);
            var data = this.data;

            // 寻找第一层
            for (var i = 0; i < list.length; i++) {
                var targetList = this.list[i];

                // 如果不存在那一层，则添加那一层
                if (!targetList) {
                    this.addList(data);
                    targetList = this.list[i];
                }

                // 滚动到指定位置
                if (type === "text") {
                    targetList.setText(list[i]);
                } else {
                    targetList.setValue(list[i]);
                }

                // 将数据指向到下一层
                if (data[targetList.getIndex() - 1]) {
                    data = data[targetList.getIndex() - 1][this.selectList];
                }

                // 展开下一层
                if (data) {
                    var nextList = this.list[i + 1];

                    // 如果不存在下一层，则添加下一层
                    if (!nextList) {
                        this.addList(data);
                        nextList = this.list[i + 1];
                    }
                }
            }

            // 将值赋值到文本框
            this.setTargetData();
        },
        setTargetData: function() {
            this.$target.val(this.getText());
            this.$target.data("data-value", this.getValue());
        },
        getValue: function() {
            var date = new Date();
            $.each(this.list, function(i, obj) {
                var targetList = obj;
                if (targetList.type === "year") {
                    date.setFullYear(targetList.getValue());
                }
                if (targetList.type === "month") {
                    date.setMonth(targetList.getValue() + 1);
                }
                if (targetList.type === "day") {
                    date.setDate(targetList.getValue());
                }
                if (targetList.type === "hour") {
                    date.setHours(targetList.getValue());
                }
                if (targetList.type === "minute") {
                    date.setMinutes(targetList.getValue());
                }
                if (targetList.type === "second") {
                    date.setSeconds()(targetList.getValue());
                }
            });
            return date;
        },
        getText: function() {
            var str = this.formatStr;
            var date = this.getValue();

            str = str.replace(/yyyy|YYYY/g, date.getFullYear());
            str = str.replace(/MM/g, this.plusZero(date.getMonth() + 1));
            str = str.replace(/dd|DD/g, this.plusZero(date.getDate()));
            str = str.replace(/hh|HH/g, this.plusZero(date.getHours()));
            str = str.replace(/mm/g, this.plusZero(date.getMinutes()));
            str = str.replace(/ss/g, this.plusZero(date.getSeconds()));

            return str;
        }
    }

    var util = {
        /**
         * 名称: 获取目标
         * 作用: 获取 $list 正确的 $target
         */
        getTarget: function(e) {
            var $target = $(e.target);
            if ($target.is(".scroll-pnl")) {
                $target = $target.find(".list");
            } else if ($target.is(".item")) {
                $target = $target.parent();
            }
            return $target;
        },
        /**
         * 名称: 获取 translateY 数值
         * 作用: 获取 translateY 数值，如果没有就是 0
         */
        getY: function($target) {
            return parseInt($target.css("transform").slice(11)) || 0;
        }
    }

    $.fn.picker = function(options) {
        return this.each(function(i, obj) {
            var $target = $(obj);
            $target.data("picker", new Picker($target, options));
        });
    }

    $.fn.datepicker = function(options) {
        return this.each(function(i, obj) {
            var $target = $(obj);
            $target.data("picker", new DatePicker($target, options));
        });
    }
})(Zepto);