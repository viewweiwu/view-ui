(function($) {
    function Validate($target) {
        this.$form = $target;
        this.inputArr = this.$form.find('input[data-validate]'); //找到所有绑定validate的input
        this.ruleArr = []; //data-validate检验规则
        this.inputValue = ''; //所有input的值
        this.labelText = ''; //该input对应的label的值
        this.labelType = ''; //该input对应的type类型
        this.init();
    }

    Validate.prototype = {
        init: function() {
            this.getCheckResult();
            this.onfocus();

        },
        getCheckResult: function() {
            var result = this.setCheck();
            return result;
        },
        onfocus: function($target) {
            var self = this;
            $.each(self.inputArr, function(i, iObj) {
                var $target = $(iObj);
                if ($target.parents('.bg-warning')) {
                    $target.bind('focus', function() {
                        $target.parents('.bg-warning').removeClass('bg-warning');
                    });
                }
            })
        },
        setCheck: function() {
            //返回验证结果
            var self = this;
            var checkResult = true;
            $.each(self.inputArr, function(i, iObj) {
                var $target = $(iObj);
                self.ruleArr = $target.data('validate').split(','); //找到这些input框的验证值 
                self.inputValue = $target.val(); //找到这些input框的值
                self.labelText = $target.data("label") || ''; //找到这些input框的label值
                self.labelType = $target.attr('type'); //找到这些input框的类型
                if (self.ruleArr[0] != '') {
                    $.each(self.ruleArr, function(j, jObj) {
                        checkResult = self.checkBind(jObj, self.inputValue, self.labelText, $target, self.labelType);
                        return !checkResult ? false : true;
                    })
                }
                return !checkResult ? false : true;
            })
            return checkResult
        },
        showTip: function(status, label) {
            var tip = this.setTips(status, label);
            $.Toast({
                position: "center",
                content: tip,
            });
            return false;
        },
        setTips: function(status, label) {
            validateTips = {
                empty: label + '不能为空',
                phone: '请输入正确的手机格式',
                email: '请输入正确的邮箱格式',
                tel: '请输入正确的固话格式',
                number: '请输入正确的数字',
                integer: '请输入整数',
                url: '请输入链接',
                password: '请输入6到30位密码',
                confpwd: '两次输入的密码不一致',
                postCode: '请输入正确的邮编',
                checkbox: '请同意' + label,
            }
            return validateTips[status];
        },
        checkBind: function(rule, value, label, input, type) {
            var self = this;

            if (type == 'text') {
                value = $.trim(value); //去掉首尾空格
                var testRule = value != ''; //是否通过,默认判断是否为空
                /**
                 * 文本格式验证正则表达式
                 */
                var regex = {
                    email: /^(\w)+(\W\w+)*@(\w)+(\-\w+)*((\.\w+)+)$/, // email
                    phone: /^\(?\d{2,3}[- ]?\d{1,3}\)?[- ]?\d{3,4}[- ]?\d{4}$/, // 手机号码
                    tell: /\d{3}-\d{8}|\d{4}-\d{7,8}/, // 固话
                    number: /^[\-\+]?((\d+)([\.,](\d+))?|([\.,](\d+))+)$/, // 数字
                    integer: /^[\-\+]?((\d+))$/, // 整数
                    url: /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*/, // 链接
                    password: /^[\w~!@#$%^&*()_+{}:"<>?\-=[\];\',.\/]{6,30}$/, // 密码
                    postCode: /^\d{6}$/ //邮编
                };
                if (testRule) {
                    if (rule.search(/confpwd/) > -1) {
                        var ele = /confpwd\((.*)\)/.exec(rule)[1];
                        testRule = value == $(ele).val();
                        rule = 'confpwd';
                    } else if (rule.search(/empty/) > -1) {
                        rule = 'empty';
                    } else {
                        testRule = regex[rule].test(value);
                    }
                } else {
                    rule = 'empty';
                }

            } else if (type == "checkbox") {
                testRule = input.is(':checked');
                rule = 'checkbox';
            }


            if (testRule == false) {
                self.showTip(rule, label);
                input.parents('.field').addClass('bg-warning');
                return false;
            } else {
                input.parents('.field').removeClass('bg-warning');
                return true
            }
        },
    }

    //触发
    $.fn.validate = function() {
        return this.each(function(i, obj) {
            var $target = $(obj);
            $target.data("validate", new Validate($target));
        });

    }
    $.fn.getResult = function() {
        return this.data("validate").getCheckResult();
    }
})(Zepto);