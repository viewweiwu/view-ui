(function($) {
    function Validate($target) {
        this.$form = $target;
        this.inputArr = this.$form.find('[data-validate]:visible'); //找到所有绑定validate的input
        this.ruleArr = []; //data-validate检验规则
        this.inputValue = ''; //所有input的值
        this.labelText = ''; //该input对应的label的值
        this.init();
    }
    Validate.prototype = {
            init: function() {
                var self = this;
                var checkresult = true;
                $.each(this.inputArr, function(i, iObj) {
                    self.ruleArr = $(iObj).attr('data-validate').split(','); //找到这些input框的验证值 
                    self.inputValue = iObj.value; //找到这些input框的值
                    self.labelText = $('label[for=' + $(iObj).attr('id') + ']').html().split('：')[0]; //找到这些input框的值
                    $.each(self.ruleArr, function(j, jObj) {
                        checkresult = self.checkbind(jObj, self.inputValue, self.labelText);
                        if (!checkresult) {
                            return false;
                        }
                    })
                    if (!checkresult) {
                        return false;
                    }
                })

            },
            showTip: function(status, label) {
                if (status == 'empty') {
                    $.Toast({
                        position: "center",
                        content: label + '不能为空'
                    });
                    return false;
                } else {
                    $.Toast({
                        position: "center",
                        content: 'lalala'
                    });
                }
            },
            checkbind: function(rule, value, label) {
                var checkempty = true;
                var self = this;
                /**
                 * 文本格式验证正则表达式
                 */
                var regex = {
                    empty: /^.+\S$/, //是否为空
                    email: /^(\w)+(\W\w+)*@(\w)+(\-\w+)*((\.\w+)+)$/, // email
                    phone: /^\(?\d{2,3}[- ]?\d{1,3}\)?[- ]?\d{3,4}[- ]?\d{4}$/, // 手机号码
                    tell: /\d{3}-\d{8}|\d{4}-\d{7,8}/, // 固话
                    number: /^[\-\+]?((\d+)([\.,](\d+))?|([\.,](\d+))+)$/, // 数字
                    integer: /^[\-\+]?((\d+))$/, // 整数
                    url: /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*/, // 链接
                    password: /^[\w~!@#$%^&*()_+{}:"<>?\-=[\];\',.\/]{6,30}$/ // 密码
                };
                var testRule = regex[rule].test(value);
                if (testRule == false) {
                    self.showTip(rule, label);
                    return false;
                } else {
                    return true
                }

            }
        }
        //触发
    $.fn.validate = function() {
        return this.each(function(i, obj) {
            var $target = $(obj);
            $target.data("validate", new Validate($target));
        });
    }
})(Zepto);