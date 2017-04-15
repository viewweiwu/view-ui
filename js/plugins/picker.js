(function($) {
	function Picker($target, opts) {
		this.$container = $(".container"); // 最外层容器啦
		this.$target = $target;
		this.id = opts.id ? opts.id : $target.attr("id");
		this.data = opts.data;
		this.init();
	}

	Picker.prototype = {
		init: function() {
			this.createEl();
			this.initStyle();
			this.bind();
		},
		createEl: function() {
			var html = '';
			var $el = '';
			var list = this.getListEl(this.data);
			html += 
        '<div class="picker" id="'+ this.id + '">'+
          '<div class="pnl">'+
            '<div class="top">'+
              '<button class="btn not-bg btn-cancel">取消</button>'+
              '<button class="btn not-bg btn-confirm">完成</button>'+
            '</div>'+
            '<div class="content">'+
            	list +
            '</div>'+
          '</div>'+
        '</div>';
			$el = $(html);
			this.$container.append($el);

			this.$el = $el;
			this.$pnl = $el.find(".pnl");
			this.$cancelBtn = $el.find(".btn-cancel");
			this.$confirmBtn = $el.find(".btn-confirm");
			this.$list = $el.find(".list");
			this.singleHeight = this.$list.find(".item").height(); // 1 个单位 = 单个 li 的 height
		},
		getListEl: function(data) {
			var result = '';
			if($.isArray(data)) {
				result += `
          <div class="scroll-pnl">
            <ul class="list">
        `;
				$.each(data || [], function(i, obj) {
					result += '<li class="item">' + obj + '</li>';
				});
				result += ` 
            </ul>
          </div>
        `;
			}
			return result;
		},
		/**
		 * 名称: 初始化样式
		 * 作用: 将所有 list 向下移动 3 个单位
		 */
		initStyle: function() {
			var defalutY = this.singleHeight * 3;
			this.$list.css("transform", "translateY(" + defalutY + "px)");
			this.defalutY = defalutY;
		},
		bind: function() {
			this.$target.on("focus",  this.onTargetFocus.bind(this));
			this.$cancelBtn.on("click", this.onCancelBtnClick.bind(this));
			this.$confirmBtn.on("click", this.onConfirmBtnClick.bind(this));
			this.$list.on({
				"touchstart": this.onStart.bind(this),
				"touchmove": this.onMove.bind(this),
				"touchend": this.onEnd.bind(this)
			});
		},
		/**
		 * 名称: 鼠标 touchstart 事件
		 * 作用: 标记当前 list 的 pageY
		 */
		onStart: function(e) {
			var pageY = e.touches[0].pageY;
			this.pageY = pageY;
		},
		/**
		 * 名称: 鼠标 touchmove 事件
		 * 作用: 计算跟之前标记的 pageY 的差值，并累加到 translateY 上
		 */
		onMove: function(e) {
			e.preventDefault();
			e.stopPropagation();
			var $target = this.getTarget(e);
			var pageY = e.touches[0].pageY;
			var y = this.getY($target); // 获取之前的 translateY
			var final = pageY - this.pageY + y; // 比较差值并累加，计算出最终值
			$target.css({
				"transform": "translateY(" + final + "px)",
				"transition": ""
			});
			this.pageY = pageY; // 重新标记 pageY
		},
		/**
		 * 名称: 鼠标 touchend 事件
		 * 作用: 矫正最终的滚动值
		 */
		onEnd: function(e) {
			var $target = this.getTarget(e);
			var $li = $target.find("li");
			var totalHeight = $li.length * this.singleHeight; // 获取所有 li 的总高度
			var y = this.getY($target) - this.defalutY; // 获取本身偏移了多少 Y
			var bottom = (totalHeight - this.singleHeight) * -1; // 底部边界
			var final = y + this.defalutY; // 默认值最终值
			var diff = 0;
			// 判断最终值是否超出边界，矫正到顶部边界或者底部边界
			if(y > 0) {
				final = this.defalutY;
			} else if(y < bottom) {
				final = bottom + this.defalutY;
			}

			// 计算需要矫正的差
			diff = final % this.singleHeight;

			// 矫正未移动到正确位置的最终值，如果差值大于一半，则最终值加上一个单位，反之减去一个单位
			if(diff < this.singleHeight / 2) {
				final = final - diff;
			} else {
				final = final - diff + this.singleHeight;
			}

			$target.css({
				"transform": "translateY(" + final + "px)",
				"transition": "transform 300ms"
			});
		},
		onTargetFocus: function(e) {
			this.$target.blur();
			this.show();
		},
		onCancelBtnClick: function(e) {
			this.close();
		},
		onConfirmBtnClick: function(e) {
			this.close();
			this.$target.val(this.getText());
		},
		show: function() {
			var self = this;
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
			self.$el.css({
				"background-color": "rgba(0, 0, 0, 0)"
			});
			self.$pnl.css({
				"transform": "translateY(100%)"
			});
			setTimeout(function() {
				self.$el.css({
					"transform": "translateX(100%)"
				})
			}, 300);
		},
		getText: function(e) {
			var self = this;
			var result = "";

			$.each(this.$list, function(i, obj) {
				var $list = $(obj);
				var y = (self.getY($list) - self.defalutY) * -1;
				var index = y / self.singleHeight;
				var $target = $list.find(".item").eq(index);
				result += $target.text();
			});

			return result;
		},
		/**
		 * 名称: 获取目标
		 * 作用: 获取 $list 正确的 $target
		 */
		getTarget: function(e) {
			var $target = $(e.target);
			if($target.is(".item")) {
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
})(Zepto);