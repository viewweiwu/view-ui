(function($) {
	function Picker($target, opts) {
		this.$container = $(".container"); // 最外层容器啦
		this.$target = $target;
		this.id = opts.id ? opts.id : $target.attr("id");
		this.selectText = opts.text;
		this.selectValue = opts.value;
		this.data = opts.data;
		this.list = [];
		this.split = " - ";
		this.defaultText = "请选择";
		this.init();
	}

	Picker.prototype = {
		init: function() {
			this.createEl();
			this.addList(this.data);
			this.initStyle();
			this.bind();
		},
		createEl: function() {
			var html = '';
			var $el = '';
			html += 
        '<div class="picker" id="'+ this.id + '">'+
          '<div class="pnl">'+
          	'<div class="decorate"></div>' +
            '<div class="top">'+
              '<button class="btn not-bg btn-cancel">取消</button>'+
              '<button class="btn not-bg btn-confirm">完成</button>'+
            '</div>'+
            '<div class="content">'+
            '</div>'+
          '</div>'+
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
				"focus": this.onTargetFocus.bind(this),
				"change": this.onTargetChange.bind(this)
			});
			this.$cancelBtn.on("click", this.onCancelBtnClick.bind(this));
			this.$confirmBtn.on("click", this.onConfirmBtnClick.bind(this));
		},
		onTargetFocus: function(e) {
			this.$target.blur();
			this.show();
		},
		onCancelBtnClick: function(e) {
			this.close();
		},
		onConfirmBtnClick: function(e) {
			var self = this;
			var text = "";
			var value = "";
			this.close();
			$.each(this.list, function(i, obj) {
				if(obj.getIndex() === 0) return true;
				if(i !== 0 ) {
					text += self.split;
					value += self.split;
				}
				text += obj.getText();
				value += obj.getValue();
			});
			this.$target.val(text);
			this.$target.attr("data-value", value);
		},
		onTargetChange: function(e, index) {
			if(this.list[index]) {
				var target = this.list[index];
				var data = target.data[target.getIndex() - 1] && target.data[target.getIndex() - 1]["children"];
				
				// 如果选择了初始选项，则销毁兄弟 list
				if(target.getIndex() === 0) {
					$.each(this.list.slice(index + 1), function(i, obj) {
							obj.destroy();
					});
					this.list.length = index + 1;
					this.resetListSize();
					return;
				}
				
				// 如果对象存在，则扩展一层 list
				if(data) {
					// 下层 list 如果已存在，则不销毁元素，而是重新设值, 并销毁下层之后的所有 list
					if(this.list[index + 1]) {
						this.list[index + 1].setData(data);
						$.each(this.list.slice(index + 2), function(i, obj) {
								obj.destroy();
						});
						this.list.length = index + 2;
						this.resetListSize();
					} else {
						// 否则销毁后面所有层的 list，并添加下层
						$.each(this.list.slice(index + 1), function(i, obj) {
								obj.destroy();
						});
						this.list.length = index + 1;
						this.addList(data);
					}
				}
			}
			
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
		addList: function(data) {
			this.list.push(new List(data, this));
			this.resetListSize();
		},
		resetListSize: function() {
			var self = this;
			$.each(this.list, function(i, obj) {
				obj.$parent.width(100 / self.list.length  + "%");
			});
		}
	};

	function List(data, picker) {
		this.$container = picker.$container; // 最外层容器啦
		this.$picker = picker.$el;
		this.$pnl = picker.$pnl;
		this.$content = picker.$content;
		this.$target = picker.$target;
		this.selectText = picker.selectText;
		this.selectValue = picker.selectValue;
		this.defaultText = picker.defaultText;
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
				'<div class="scroll-pnl">'+
					'<ul class="list">' +
						this.getListHtml(data) +
					'</ul>'+
				'</div>';
			return result;
		},
		getListHtml: function(data) {
			var result = "";
			var self = this;
			
			result += '<li class="item">' + this.defaultText + '</li>';
			$.each(data || [], function(i, obj) {
				var text = "";
				var value = "";
				if(typeof obj === "string" || typeof obj === "number") {
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
		bind: function() {
			this.$el.on({
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
			
			// 矫正边界 判断最终值是否超出边界，矫正到顶部边界或者底部边界
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
				
			// 惯性滚动
			if(true) {
				var direction = diffY > 0 ? 1 : -1;
				var d = Math.round(Math.abs(diffY) / this.singleHeight * 2); // 移动单位
				var t = 3 - Math.ceil(dateDiff / 100); // 移动时间
				if(t < 1) t = 0;
				var a = t * d * direction * this.singleHeight;
				
				final -= a;
				
				// 再次矫正
				if(final < bottom + 3 * this.singleHeight) {
					final = bottom + 3 * this.singleHeight;
				} else if(final > this.defalutY) {
					final = this.defalutY;
				}
			}
			
			$target.css({
				"transform": "translateY(" + final + "px)",
				"transition": "width, transform 300ms"
			});
			
			self.timer = setTimeout(function() {
				var index = self.getIndex();
				if(self.timer) {
					clearTimeout(self.timer);
				}
				if(self.currIndex !== index) {
					self.$target.trigger("change", self.$el.parent().index());
				}
			}, 300);
		},
		getIndex: function() {
			var self = this;
			var result = "";
			var y = (util.getY(this.$el) - self.defalutY) * -1;
			var index = Math.round(y / self.singleHeight);

			return index;
		},
		getText: function() {
			return this.$el.find(".item").eq(this.getIndex()).text();
		},
		getValue: function() {
			return this.$el.find(".item").eq(this.getIndex()).data("value");
		},
		setData: function(data) {
			this.data = data;
			if(data.length) {
				this.$el.html(this.getListHtml(data));
				this.initStyle();
				this.resetSingleSize();
			} else {
				this.destroy();
			}
		},
		destroy: function() {
			this.$parent.remove();
		}
	}
	
	var util = {
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