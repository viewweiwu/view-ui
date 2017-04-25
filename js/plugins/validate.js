(function($) {
    function Validate($target) {
        this.$form = $target;
        this.inputArr = this.$form.find('*[data-validate]'); //找到所有绑定validate的input
        this.ruleArr = []; //data-validate检验规则
        this.testRule = true; //验证结果
        this.init();
    }

    Validate.prototype = {
        init: function() {
            this.getCheckResult();
        },
        getCheckResult: function() {
            var result = this.setCheck();
            return result;
        },
        onFocus: function($input) {
            this.$form.on('focus', 'input', function() {
                $(this).parents('.bg-warning').removeClass('bg-warning');
            })
        },
        setCheck: function() {
            //返回验证结果
            var self = this;
            var checkResult = true;
            $.each(self.inputArr, function(i, iObj) {
                var $target = $(iObj);
                self.ruleArr = $target.data('validate').split(','); //找到这些input框的验证值 
                if (self.ruleArr[0] != '') {
                    $.each(self.ruleArr, function(j, jObj) {
                        checkResult = self.checkBind(jObj, $target);
                        return checkResult;
                    })
                }
                return checkResult;
            })
            return checkResult
        },
        showTip: function(status, label) {
            var tip = this.setTips(status, label);
            $.Toast({
                position: "center",
                content: tip,
            });
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
                orCheck: '请正确输入' + label,
                idCard: '请正确输入您的身份证号码',
                custom: label || '格式错误',
                select: label || '格式错误',
                andCheck: label || '格式错误',
                max: '请输入少于' + label + '的字符',
                min: '请输入不少于' + label + '的字符',
            }
            return validateTips[status];
        },
        checkBox: function(rule, $input) {
            if (rule == "checkbox") {
                return $input.is(':checked');
            } else {
                var selectEle = /select\((.*)\)/.exec(rule)[1], //取出必选几个
                    $inputName = $input.attr('name'),
                    sCount = 0,
                    $input = $('input[name=' + $inputName + ']');
                $.each($input, function(i, obj) {
                        if (obj.checked == true) {
                            sCount++;
                        }
                    })
                    //如果填写的参数大于选项数则默认为选项数
                if (selectEle >= $input.length) {
                    selectEle = $input.length;
                }
                return sCount < Number(selectEle) ? false : true;
            }
        },
        checkText: function(rule, $input) {
            var result = true,
                inputValue = $input.val(); //找到这些input框的值
            inputValue = $.trim(inputValue); //去掉首尾空格
            //文本格式验证正则表达式
            var regex = {
                email: /^(\w)+(\W\w+)*@(\w)+(\-\w+)*((\.\w+)+)$/, // email
                phone: /^1[3|4|5|7|8]\d{9}$/, // 手机号码
                tell: /\d{3}-\d{8}|\d{4}-\d{7,8}/, // 固话
                number: /^[\-\+]?((\d+)([\.,](\d+))?|([\.,](\d+))+)$/, // 数字
                integer: /^[\-\+]?((\d+))$/, // 整数
                url: /^[a-zA-z]+:\/\/(\w+(-\w+)*)(\.(\w+(-\w+)*))*/, // 链接
                password: /^[\w~!@#$%^&*()_+{}:"<>?\-=[\];\',.\/]{6,30}$/, // 密码
                postCode: /^\d{6}$/, //邮编
                idCard1: /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/, //15位身份证
                idCard2: /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/, //18位身份证
            };
            if (rule.search(/confpwd/) > -1) {
                var ele = /confpwd\((.*)\)/.exec(rule)[1];
                return inputValue == $(ele).val();
            } else if (rule == 'empty') {
                return inputValue != '';;
            } else if (rule.search(/max/) > -1) {
                var maxEle = /max\((.*)\)/.exec(rule)[1];
                return inputValue.length > 0 && inputValue.length <= maxEle ? true : false;
            } else if (rule.search(/min/) > -1) {
                var maxEle = /min\((.*)\)/.exec(rule)[1];
                return inputValue.length > 0 && inputValue.length >= maxEle ? true : false;
            } else if (rule == 'idCard') {
                result = regex['idCard1'].test(inputValue) || regex['idCard2'].test(inputValue);
                return result;
            } else if (rule == 'custom') {
                var customRule = RegExp($input.data('rule'));
                result = customRule ? customRule.test(inputValue) : true;
                return result;
            } else {
                result = regex[rule].test(inputValue);
                return result;
            }
        },
        check: function(rule, $input) {
            var self = this,
                labelType = $input.attr('type'); //找到这些input框的类型
            //先做类型判断
            if (labelType == "checkbox") {
                return self.checkBox(rule, $input);
            } else {
                return self.checkText(rule, $input);
            }
        },
        checkBind: function(rule, $input) {
            var self = this,
                ruleOption = [], //或判断
                labelText = $input.data("label") || '', //找到这些input框的label值
                testRule = true;
            if (rule.indexOf('|') > 0) {
                var orCount = 0,
                    orResult = true;
                ruleOption = rule.split('|');

                $.each(ruleOption, function(i, iObj) {
                    orResult = self.check(iObj, $input);
                    if (orResult) {
                        orCount++; //通过验证则累加
                    }
                })
                rule = 'orCheck';
                testRule = orCount > 0 ? true : false;
            } else if (rule.indexOf('&') > 0) {
                var andCount = 0,
                    andResult = true;
                ruleOption = rule.split('&');

                $.each(ruleOption, function(i, iObj) {
                    andResult = self.check(iObj, $input);
                    if (andResult) {
                        andCount++; //通过验证则累加
                    }
                })
                rule = 'andCheck';
                testRule = andCount == ruleOption.length ? true : false;
            } else {
                testRule = self.check(rule, $input);
                if (rule.search(/confpwd/) > -1) {
                    rule = 'confpwd';
                } else if (rule.search(/select/) > -1) {
                    rule = 'select';
                } else if (rule.search(/max/) > -1) {
                    rule = 'max';
                } else if (rule.search(/min/) > -1) {
                    rule = 'min';
                }
            }
            if (!testRule) {
                self.showTip(rule, labelText);
                $input.parents('.field').addClass('bg-warning');
                self.onFocus($input);
                return false;
            } else {
                $input.parents('.field').removeClass('bg-warning');
                return true;
            }
        },
    }

    //触发
    $.fn.validate = function() {
        var Vali = new Validate($(this));
        return Vali.getCheckResult();
    }
})(Zepto);