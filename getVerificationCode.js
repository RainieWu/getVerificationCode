/*
	author: 吴颖琳
	contact: ng.winglam@qq.com
	date: 2018.01.12-2018.03.24
	ps: 依赖jQuery，若需要设置弹窗则配合setAlertBox.css使用
*/



/*
	功能：完成手机号码或邮箱地址的基本验证及获取验证码
	参数：必选，对象，获取验证码所用到的表单、ajax和弹窗的相关设置
		{
			form: {							// 必选，对象，获取验证码的表单设置
				targetType: "",				// 可选，字符串，目标类型，取值为"phone"或"email"，默认为"phone"
				inputName: "",				// 可选，字符串，填写手机号码或邮箱地址的input标签的name属性值，默认为"phone"
				getCodeClass: "",			// 可选，字符串，获取验证码按钮的button标签的class，默认为"getCode"
				countdown: 0,				// 可选，数值，重新获取验证码的等待时间，默认为60
				countdownText: ""			// 可选，字符串，等待重新获取验证码时按钮的文本内容，默认为"重新发送"
			},
			ajax: {							// 必选，对象，获取验证码的ajax设置
				url: "",					// 必选，字符串，获取验证码的请求地址
				type: "",					// 可选，字符串，请求方式，默认为"POST"
				dataType: "",				// 可选，字符串，返回的数据类型，默认为"json"
				dataName: "",				// 可选，字符串，发送给服务器的数据对象中名值对的名，默认为填写手机号码或邮箱地址的input标签的name属性值
				resultCodeName: "",			// 可选，字符串，返回数据的状态码名称，默认为"code"
				resultMsgName: "",			// 可选，字符串，返回数据的消息名称，默认为"msg"
				successCode: ""				// 可选，字符串或数值，返回数据的成功状态码，使用严格比较运算符进行比较，默认为1
			},
			alertBox: {						// 可选，对象，弹窗显示获取验证码的结果，不弹窗显示时可访问全局变量getCodeMsg以获取ajax返回信息
				className: "",				// 可选，字符串，弹窗额外的类名
				close: true,				// 可选，布尔值，是否有关闭按钮，默认为false
				title: "",					// 可选，字符串，标题文本，默认无标题
				buttons: [{					// 可选，数组，默认为一个“确定”按钮
					value: "",				// 必选，字符串，按钮文本
					callback: function() {}	// 可选，函数，点击按钮的回调函数，默认操作为关闭弹窗
				}]
			}
		}
		参数示例1：
			{
				form: {
					targetType: "phone",
					inputName: "phone",
					getCodeClass: "getCode",
					countdown: 60,
					countdownText: "重新发送"
				},
				ajax: {
					url: "getCode.do",
					type: "POST",
					dataType: "json",
					dataName: "phone",
					resultCodeName: "code",
					resultMsgName: "msg",
					successCode: 1
				},
				alertBox: {
					className: "my-alert-box",
					close: true,
					title: "标题",
					buttons: [{
						value: "确定",
						callback: function() {
							console.log("确定");
						}
					}, {
						value: "取消",
						callback: function() {
							console.log("取消");
						}
					}]
				}
			}
		参数示例2：
			{
				form: {},
				ajax: {
					url: "getCode.do"
				}
			}
*/
var getCodeMsg = "";
function getCode(param) {
	if(!param.form.targetType) {
		param.form.targetType = "phone";
	}
	if(!param.form.inputName) {
		param.form.inputName = "phone";
	}
	if(!param.form.getCodeClass) {
		param.form.getCodeClass = "getCode";
	}
	if(!param.form.countdown) {
		param.form.countdown = 60;
	}
	if(!param.form.countdownText) {
		param.form.countdownText = "重新发送";
	}

	if(!param.ajax.type) {
		param.ajax.type = "POST";
	}
	if(!param.ajax.dataType) {
		param.ajax.dataType = "json";
	}
	if(!param.ajax.dataName) {
		param.ajax.dataName = param.form.inputName;
	}
	if(!param.ajax.resultCodeName) {
		param.ajax.resultCodeName = "code";
	}
	if(!param.ajax.resultMsgName) {
		param.ajax.resultMsgName = "msg";
	}
	if(!param.ajax.successCode) {
		param.ajax.successCode = 1;
	}


	var getCodeElement = $("." + param.form.getCodeClass);
	var normalText = getCodeElement.text();
	getCodeElement.click(function(e) {
		e.preventDefault();
		var target = $("input[name='" + param.form.inputName + "']").val();
		var countdown = param.form.countdown;
		if((param.form.targetType == "phone" && phoneNumValid(target).isCorrect) || (param.form.targetType == "email" && emailAddressValid(target).isCorrect)) {
			getCodeElement.attr("disabled", "disabled").text(param.form.countdownText + "(" + countdown + ")");
			var timer;
			clearInterval(timer);
			timer = setInterval(function() {
				if(countdown == 1) {
					clearInterval(timer);
					getCodeElement.removeAttr("disabled").text(normalText);
				} else {
					countdown--;
					getCodeElement.text(param.form.countdownText + "(" + countdown +")");
				}
			}, 1000);

			var data = {};
			data[param.ajax.dataName] = target;
			$.ajax({
				url: param.ajax.url,
				type: param.ajax.type,
				dataType: param.ajax.dataType,
				data: data,
				success: function(result) {
					if(result[param.ajax.resultCodeName] !== param.ajax.successCode) {
						clearInterval(timer);
						getCodeElement.removeAttr("disabled").text(normalText);
						if(param.alertBox) {
							param.alertBox.message = result.msg;
							setAlertBox(param.alertBox);
						}
					}
					getCodeMsg = result[param.ajax.resultMsgName];
				},
				error: function(result) {
					clearInterval(timer);
					getCodeElement.removeAttr("disabled").text(normalText);
					getCodeMsg = "发送验证码失败";
					if(param.alertBox) {
						param.alertBox.message = getCodeMsg;
						setAlertBox(param.alertBox);
					}
				}
			});
		} else {
			if(param.form.targetType == "phone") {
				getCodeMsg = phoneNumValid(target).msg;
			} else {
				getCodeMsg = emailAddressValid(target).msg;
			}
			if(param.alertBox) {
				param.alertBox.message = getCodeMsg;
				setAlertBox(param.alertBox);
			}
		}
	});
}


// 依赖函数

// 设置弹窗
function setAlertBox(param) {
	if(!param.buttons) {
		param.buttons = [{
			value: "确定",
			callback: function() {
				$(".alert-box").remove();
			}
		}];
	}

	var html = "";
	if(param.className) {
		html += "<div class='alert-box " + param.className +"'>";
	} else {
		html += "<div class='alert-box'>";
	}
	html += "<div class='box'>";
	if(param.close) {
		html += "<span class='close'></span>";
	}
	if(param.title) {
		html += "<p class='title'>" + param.title +"</p>";
	}
	html += "<div class='message'>" + param.message + "</div>"
		 + "<div class='buttons'>";
	for(var i = 0; i < param.buttons.length; i++) {
		html += "<button index=" + (i + 1) +" class='btn" + (i + 1) +"'>" + param.buttons[i].value +"</button>";
		if(!param.buttons[i].callback) {
			param.buttons[i].callback = function() {
				$(".alert-box").remove();
			}
		}
	}
	html += "</div>" + "</div>" + "</div>";
	$("body").append(html);
	$(".alert-box").hide().fadeIn();

	if(param.close) {
		$(".alert-box .close").click(function() {
			$(".alert-box").remove();
		});
	}
	if(param.maskClose) {
		$(".alert-box").click(function(e) {
			if($(e.target).parent().is(("body"))) {
				$(".alert-box").remove();
			}
		});
	}
	$(".alert-box .buttons button").click(function(e) {
		param.buttons[$(e.target).attr("index") - 1].callback();
	});
}

// 手机号码验证
function phoneNumValid(num) {
    var result = {
        isCorrect: true,
        msg: "手机号码格式正确"
    };
    if(!num) {
    	result.isCorrect = false;
    	result.msg = "手机号码为空";
	} else if(num.length != 11) {
    	result.isCorrect = false;
		result.msg = "手机号码位数错误";
	} else if(!/^1[0-9]{10}$/.test(num)) {
    	result.isCorrect = false;
		result.msg = "手机号码格式错误";
	}
    return result;
}

// 邮箱地址验证
function emailAddressValid(email) {
    var result = {
        isCorrect: true,
        msg: "邮箱地址格式正确"
    };
    if(!email) {
    	result.isCorrect = false;
    	result.msg = "邮箱地址为空";
	} else if(!/^([0-9A-Za-z\-_\.]+)@([0-9a-z]+\.[a-z]{2,3}(\.[a-z]{2})?)$/.test(email)) {
    	result.isCorrect = false;
		result.msg = "邮箱地址格式错误";
	}
    return result;
}