(function($) {
    function Nav($el, opts) {
        opts = opts || {};
        this.$el = $el;
        this.init();
    }

    Nav.prototype = {
        init: function() {
            this.getData();
            this.createEl();
            this.initStyle();
        },
        getData: function() {
            var data = [];
            $.each(this.$el.find(".item"), function(i, obj) {
                data.push($(obj).text());
            });
            this.data = data;
        },
        createEl: function() {
            var $html = $(this.getHtml(this.data));
            this.$el.after($html);
            this.$el.remove();
            this.$el = $html;
            this.$btn = this.$el.find(".btn");
            this.$content = this.$el.find(".nav-content")
            this.$list = this.$content.find(".nav-list");
        },
        getHtml: function(data) {
            var html = "";
            var listHtml = "";

            $.each(data || [], function(i, obj) {
                listHtml += '<div class="item">' + obj + '</div>';
            });

            html +=
                '<div class="nav-container">' +
                '<div class="nav-bg"></div>' +
                '<div class="nav-content">' +
                '<div class="nav-list">' +
                listHtml +
                '</div>' +
                '</div>' +
                '<div class="nav-ctrl">' +
                '<button class="btn not-radius not-border">' +
                '<i class="iconfont">&#xe65e;</i>' +
                '</button>' +
                '</div>' +
                ' <div class="nav-dropdown">' +
                listHtml +
                '</div>' +
                '</div>';

            return html;
        },
        initStyle: function() {
            var width = 0;

            $.each(this.$list.find(".item"), function(i, obj) {
                var $target = $(obj);
                $target.width($target.width() + 1);
                width += $target.width();
            });

            this.$list.width(width);

            this.$content.width(this.$el.width() - this.$btn.width());
        }
    }


    $.fn.nav = function(options) {
        return this.each(function(i, obj) {
            var $target = $(obj);
            $target.data("nav", new Nav($target, options));
        });
    }
})(Zepto)