(function($) {
    function Toast(opts) {
        this.isString = typeof opts === "string" ? true : false;
        this.content = this.isString ? opts : opts.content;
        this.position = opts.position || "bottom";
        this.duration = opts.duration || "3000";
        this.$container = $(".container");
        this.init();
    }

    Toast.prototype = {
        init: function() {
            // 移除旧元素
            this.removeOldEl();
            // 创建新元素
            this.createEl();
            // 初始化样式
            this.initStyle();
            // 一段时间后自动移除
            this.timeOut();
        },
        removeOldEl: function() {
            $(".toast").remove();
        },
        createEl: function() {
            var $el = $('<div class="toast">' + this.content + '</div>');
            this.$container.append($el);
            this.$el = $el;

        },
        initStyle: function() {
            switch (this.position) {
                case "header":
                case "top":
                    this.$el.css("top", "1.5rem");
                    break;
                case "middle":
                case "center":
                    this.$el.css({
                        "top": "50%",
                        "tranform": "translate(-50%, -50%)"
                    });
                    break;
                case "footer":
                case "bottom":
                default:
                    this.$el.css({
                        "top": "auto",
                        "bottom": "1.5rem"
                    });
                    break;
            }
        },
        timeOut: function() {
            setTimeout(function() {
                this.$el.animate({
                    "opacity": "0"
                }, 300, this.close.bind(this));
            }.bind(this), this.duration);
        },
        close: function() {
            this.$el.remove();
        }
    }

    $.Toast = function(opts) {
        return new Toast(opts);
    };

})(Zepto);