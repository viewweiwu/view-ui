(function($) {
  function Nav($el, opts) {
    opts = opts || {};
    this.$el = $el;
    this.$scroll = opts.scrollEl;
    this.init();
  }

  Nav.prototype = {
    init: function() {
      // 创建元素
      this.createEl();
      // 初始化样式
      this.initStyle();
      // 绑定事件
      this.bind();
    },
    /**
     * 名称: 创建元素
     * 作用: 生成 dom 元素
     */
    createEl: function() {
      var $html = $(this.getHtml());
      this.$el.after($html);

      this.$list = $html.find(".nav-list");
      this.$dropdown = $html.find(".nav-dropdown");
      this.$btn = $html.find(".btn");
      this.$content = $html.find(".nav-content")
      this.$btn = $html.find(".nav-ctrl");
      this.$bg = $html.find(".nav-bg")


      this.$list.append(this.$el.find(".item").clone(true));
      this.$dropdown.append(this.$el.find(".item").clone(true));

      this.$el.remove();
      this.$el = $html;
    },
    /**
     * 名称: 创建 html
     * 作用: 生成基础 html
     */
    getHtml: function() {
      var html = "";
      var listHtml = "";

      html +=
        '<div class="nav-container">' +
        '<div class="nav-bg"></div>' +
        '<div class="nav-content">' +
        '<div class="nav-list">' +
        '</div>' +
        '</div>' +
        '<div class="nav-ctrl">' +
        '<button class="btn not-radius not-border">' +
        '<i class="iconfont">&#xe65e;</i>' +
        '</button>' +
        '</div>' +
        ' <div class="nav-dropdown">' +
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
        $target.width("auto"); // 先初始化到自动
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
      this.$scroll.on("scroll", this.events.onScroll.bind(this));
      $(window).on("resize", this.events.onWindowResize.bind(this));
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
    /**
     * 名称: 设置 nav 滚动条的具体位置
     * 作用: 将 nav 滚动到 item === index 的位置
     * @param index
     */
    contentScrollTo: function(index) {
      var totalWidth = -this.$el.width() / 3;
      var $item = this.$content.find(".item");
      for (var i = 0; i < index; i++) {
        totalWidth += $item.eq(i).width();
      }
      this.$content.scrollLeft(totalWidth, 100);
      this.setActive(index);
    },
    /**
     * 名称: 设置 acitve
     * 作用: 给予 nav 的 item 的 index 为 i 的元素 acitve 样式
     * @param i
     */
    setActive: function(i) {
      this.$content.find(".item").eq(i).addClass("active").siblings(".active").removeClass("active");
      this.$dropdown.find(".item").eq(i).addClass("active").siblings(".active").removeClass("active");
    },
    /**
     * 
     */
    scrollTo: function($el) {
      var $target = this.$scroll.find("[data-id=" + $el.data("href") + "]");
      if ($target.length) {
        var top = $target.position().top;
        var scrollTop = this.$scroll.scrollTop();
        var height = this.$list.height();
        var final = top + scrollTop - height;
        this.$scroll.scrollTop(final, 100);
      }
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
      e.preventDefault();
      e.stopPropagation();
      var self = this;
      var $target = $(e.target);
      this.notScroll = true;
      this.contentScrollTo($target.index());
      this.scrollTo($target);
      setTimeout(function() {
        self.notScroll = false;
      }, 200);
      this.close();
    },
    onWindowResize: function() {
      this.resizeTimer && clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(function() {
        this.initStyle();
      }.bind(this), 100);
    },
    onScroll: function(e) {
      if (this.notScroll) return;
      e.stopPropagation();
      this.scrollTimer && clearTimeout(this.scrollTimer);
      this.scrollTimer = setTimeout(function() {
        $.each(this.$scroll.find("[data-id]") || [], function(i, obj) {
          var $target = $(obj);
          var top = $target.position().top;
          var scrollTop = this.$scroll.scrollTop();
          var height = this.$el.height();
          var final = top + scrollTop - height;
          if (final < scrollTop && scrollTop < final + $target.outerHeight()) {
            this.contentScrollTo(i);
            // console.log(~~final, scrollTop, $target.outerHeight(), $target.text().trim());
            return false;
          }
        }.bind(this));
      }.bind(this), 30);
    }
  }


  $.fn.nav = function(options) {
    return this.each(function(i, obj) {
      var $target = $(obj);
      $target.data("nav", new Nav($target, options));
    });
  }
})(Zepto)