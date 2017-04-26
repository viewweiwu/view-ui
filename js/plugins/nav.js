(function($) {
    function Nav($el, opts) {
        opts = opts || {};
        this.$el = $el;
        this.init();
    }

    Nav.prototype = {
        init: function() {
            // 获取数据
            this.getData();
            // 创建标签
            this.createEl();
            // 初始化样式
            this.initStyle();
            // 绑定事件
            this.bind();
        },
        /**
         * 名称: 获取数据
         * 作用: 根据传入标签生成数据
         */
        getData: function() {
            var data = [];
            $.each(this.$el.find(".item"), function(i, obj) {
                data.push($(obj).text());
            });
            this.data = data;
        },
        /**
         * 名称: 创建标签
         * 作用: 根据数据生成标签
         */
        createEl: function() {
            var $html = $(this.getHtml(this.data));
            this.$el.after($html);
            this.$el.remove();
            this.$el = $html;
            this.$btn = this.$el.find(".btn");
            this.$content = this.$el.find(".nav-content")
            this.$list = this.$content.find(".nav-list");
            this.$dropdown = this.$el.find(".nav-dropdown");
            this.$btn = this.$el.find(".nav-ctrl");
            this.$bg = this.$el.find(".nav-bg")
        },
        /**
         * 名称: 创建html
         * 作用: 根据数据生成html
         */
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
        /**
         * 名称: 初始化样式
         * 作用: 关闭下拉菜单
         */
        initStyle: function() {
            this.initWidth();
            this.close();
        },
        /**
         * 名称: 初始化宽度
         * 作用: 重新计算滚动空间的高度
         */
        initWidth: function() {
            var width = 0;

            $.each(this.$list.find(".item"), function(i, obj) {
                var $target = $(obj);
                $target.width($target.width() + 1);
                width += $target.width();
            });

            this.$list.width(width);

            this.$content.width(this.$el.width() - this.$btn.width());
        },
        /**
         * 名称: 事件绑定
         * 作用: 绑定事件
         */
        bind: function() {
            this.$btn.on("click", this.events.onBtnClick.bind(this));
            this.$content.on("click", ".item", this.events.onItemClick.bind(this));
            this.$dropdown.on("click", ".item", this.events.onItemClick.bind(this));
            $(window).on("resize", this.onWindowResize.bind(this));
        },
        /**
         * 名称: 打开面板
         * 作用: 显示 dropdown，显示 bg，设置 isOpen 为 true
         */
        open: function() {
            this.$dropdown.css("transform", "translateY(0%)");
            this.$bg.css("opacity", "1");
            // this.$btn.find(".btn").css("transform", "rotate(180deg)");
            this.$el.height("100%");
            this.isOpen = true;
        },
        /**
         * 名称: 关闭面板
         * 作用: 隐藏 dropdown，隐藏 bg，设置 isOpen 为 false
         */
        close: function() {
            this.$dropdown.css("transform", "translateY(-200%)");
            this.$bg.css("opacity", "0");
            this.closeTimer && clearTimeout(this.closeTimer);
            this.closeTimer = setTimeout(function() {
                this.$el.height(this.$content.height());
            }.bind(this), 300);
            // this.$btn.find(".btn").css("transform", "rotate(0deg)");
            this.isOpen = false;
        },
        /**
         * 名称: 切换面板
         * 作用: 如果 isOpen 为 true，就关闭面板，否则显示面板
         */
        toggle: function() {
            this.isOpen === true ? this.close() : this.open();
        },
        scrollTo: function(index) {
            var totalWidth = -this.$el.width() / 3;
            var $item = this.$content.find(".item");
            for (var i = 0; i < index; i++) {
                totalWidth += $item.eq(i).width();
            }
            this.$content.scrollLeft(totalWidth);
            console.log(totalWidth);
        },
        setActive: function(i) {
            this.$content.find(".item").eq(i).addClass("active").siblings(".active").removeClass("active");
            this.$dropdown.find(".item").eq(i).addClass("active").siblings(".active").removeClass("active");
        }
    }

    Nav.prototype.events = {
        /**
         * 名称: 控制按钮点击事件
         * 作用: 切换面板
         */
        onBtnClick: function() {
            this.toggle();
        },
        onItemClick: function(e) {
            var $target = $(e.target);
            this.setActive($target.index());
            this.scrollTo($target.index());
            this.close();
        },
        onWindowResize: function() {}
    }


    $.fn.nav = function(options) {
        return this.each(function(i, obj) {
            var $target = $(obj);
            $target.data("nav", new Nav($target, options));
        });
    }
})(Zepto)