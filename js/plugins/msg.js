(function($) {
    function Msg(opts) {
        this.isString = typeof opts === "string" ? true : false;
        this.content = this.isString ? opts : opts.content; // 判断是否为 string
        this.type = opts.type || "normal"; // 类型有 alert confirm normal 实际上并没用
        this.hasCancelBtn = opts.hasCancelBtn; // 是否拥有取消按钮
        this.hasCtrls = opts.hasCtrls; // 是否拥有按钮
        this.cancelText = opts.cancelText || "取消"; // 取消按钮显示的文本
        this.confirmText = opts.confirmText || "确认"; // 确认按钮显示的文本
        this.onConfirm = opts.onConfirm; // 确认按钮回调事件，点击确认按钮会执行此事件
        this.onCancel = opts.onCancel; // 取消按钮回调事件，点击取消按钮会执行此事件
        this.$container = $(".container"); // 最外层容器啦
        this.init();
    }

    Msg.prototype = {
        init: function() {
            // 创建元素
            this.createEl();
            // 事件绑定
            this.bind();
            // 初始化样式
            this.initStyle();
        },
        /**
         * 名称: 创建元素
         * 作用: 根据设置创建弹窗，执行完成后提供几个$元素
         * 描述: 
         *      $el: 整个弹窗，包括黑色阴影部分
         *      $pnl: 整个白色的部分
         *      $content: 弹窗显示内容的部分
         *      $cancelBtn: 取消按钮
         *      $comfirmBtn: 确认按钮
         */
        createEl: function() {
            var html = '';
            var ctrls = '';
            var content = '';
            var cancelBtn = '';
            var $el = '';

            // 是否有取消按钮？
            if (this.hasCancelBtn) {
                cancelBtn += '<button class="btn btn-big not-bg btn-cancel">' + this.cancelText + '</button>';
            }

            // 是否有按钮？
            if (this.hasCtrls) {
                ctrls +=
                    '<div class="ctrls">' +
                    cancelBtn +
                    '<button class="btn btn-big not-bg btn-confirm">' + this.confirmText + '</button>' +
                    '</div>'
            }

            content += '<div class="content">' + this.content + '</div>';

            html +=
                '<div class="msg">' +
                '<div class="pnl">' +
                content +
                ctrls +
                '</div>' +
                '</div>';

            $el = $(html);
            this.$container.append($el);

            this.$el = $el;
            this.$pnl = $el.find(".pnl");
            this.$content = $el.find(".content");
            this.$cancelBtn = $el.find(".btn-cancel");
            this.$confirmBtn = $el.find(".btn-confirm");
        },
        bind: function() {
            this.$cancelBtn.on("click", this.onCancelBtnClick.bind(this));
            this.$confirmBtn.on("click", this.onConfirmBtnClick.bind(this));
        },
        initStyle: function() {
            if (this.type === "normal") {
                this.$content.css({
                    "margin": 0,
                    "padding": 0
                });
                this.$pnl.css({
                    "overflow": "auto",
                    "border-radius": 0
                });
            }
        },
        /**
         * 名称: 取消按钮点击事件
         * 作用: 关闭 msgbox, 并回调 onCancel 函数
         */
        onCancelBtnClick: function(e) {
            this.close(this.onCancel);
        },
        /**
         * 名称: 确认按钮点击事件
         * 作用: 关闭 msgbox, 并回调 onConfirm 函数
         */
        onConfirmBtnClick: function(e) {
            this.close(this.onConfirm);
        },
        /**
         * 名称: 关闭 msgbox
         * 传参: callback
         * 作用: 执行关闭动画, 并执行 callback 回调函数
         */
        close: function(callback) {
            this.$el.animate({
                "opacity": 0
            }, 300, function() {
                $(this).remove();
                if (typeof callback === "function") {
                    callback();
                }
            });
        }
    }

    $.Msg = function(opts) {
        return new Msg(opts);
    }

    /**
     * alert 语法糖
     */
    $.alert = function(opts) {
        var isString = typeof opts === "string" ? true : false;
        var config = {
            content: isString ? opts : opts.content,
            hasCancelBtn: false,
            hasCtrls: true,
            onConfirm: opts.onConfirm,
            cancel: opts.cancelText,
            confirmText: opts.confirmText,
            type: "alert"
        }
        return new Msg(config);
    };
    /**
     * confirm 语法糖
     */
    $.confirm = function(opts) {
        var isString = typeof opts === "string" ? true : false;
        var config = {
            content: isString ? opts : opts.content,
            inCenter: true,
            hasCancelBtn: true,
            hasCtrls: true,
            onConfirm: opts.onConfirm,
            onCancel: opts.onCancel,
            cancel: opts.cancelText,
            confirmText: opts.confirmText,
            type: "confirm"
        }
        return new Msg(config);
    };
})(Zepto);