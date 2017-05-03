(function($) {
    function Countdown($target) {
        this.$countDownItem = $target.find('.js-countdown-item');
        this.counting = '';
        this.startTime = '';
        this.endTime = '';
        this.init();
    }
    Countdown.prototype = {
        init: function() {
            this.main();
        },
        main: function() {
            var self = this;
            self.compare(self);
            self.counting = setInterval(function() {
                self.compare(self);
            }, 1000);
        },
        compare: function(self) {
            var now = parseInt(new Date().getTime() / 1000),
                startTime, endTime, status, dvalue, countingTime;

            $.each(self.$countDownItem, function(i, obj) {
                var countHtml = '';
                startTime = self.getDateString($(obj).data('start'), true);
                endTime = self.getDateString($(obj).data('end'), true);
                if (startTime > now) {
                    status = "距开始";
                    dvalue = startTime - now;
                    countingTime = self.getDateString(dvalue, 'hh-mm-ss', false);
                    countHtml = self.createHtml(status, countingTime);
                } else if (startTime <= now && now < endTime) {
                    status = "距结束";
                    dvalue = endTime - now;
                    countingTime = self.getDateString(dvalue, 'hh-mm-ss', false);
                    countHtml = self.createHtml(status, countingTime);
                } else {
                    status = "已结束";
                    countingTime = '0';
                    countHtml = self.createHtml(status);
                    clearInterval(self.counting);
                }
                $(obj).html(countHtml);
            })

        },
        createHtml: function(status, time) {
            var day, hours, minutes, spanHtml = '',
                arr = [];
            if (time) {
                arr = time.split('-');
                $.each(arr, function(i, obj) {
                    if (i == arr.length - 1) {
                        spanHtml += '<span>' + obj + '</span>';
                    } else {
                        spanHtml += '<span>' + obj + '</span>:'
                    }
                });
            } else {
                spanHtml = '';
            }
            html = '<span class="js-countStatus">' + status + '</span>' + spanHtml;
            return html;
        },
        getDateString: function(time, format, isStamp) {
            var $self = $(this),
                dd, hh, mm, ss;
            if (arguments.length == 2) {
                isStamp = typeof(format) == "string" ? null : format;
            }
            if (time) {
                if (!!isStamp) {
                    formatTime = Date.parse(new Date(time)) / 1000;
                } else {
                    dd = Math.floor(time / 60 / 60 / 24);
                    hh = Math.floor((time - dd * 24 * 60 * 60) / 3600);
                    mm = Math.floor((time - dd * 24 * 60 * 60 - hh * 3600) / 60);
                    ss = Math.floor(time - dd * 24 * 60 * 60 - hh * 3600 - mm * 60);
                    dd = dd >= 10 ? dd : '0' + dd;
                    hh = hh >= 10 ? hh : '0' + hh;
                    mm = mm >= 10 ? mm : '0' + mm;
                    ss = ss >= 10 ? ss : '0' + ss;
                    formatTime = format.replace('dd', dd).replace('hh', hh).replace('mm', mm).replace('ss', ss)
                }
            }
            return formatTime;
        }
    }
    $.fn.countdown = function() {
        return new Countdown($(this));
    };
})(Zepto);