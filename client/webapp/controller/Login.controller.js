sap.ui.define([
	"./BaseController", "sap/m/MessageBox", "sap/ui/core/Fragment", 'sap/m/MessageToast', 'sap/m/MessageStrip'
], function (
	BaseController,
	MessageBox,
	Fragment,
	MessageToast,
	MessageStrip
) {
	"use strict";
	// try {
	var isSignupButton = false; // Global flag variable
	var uId;
	return BaseController.extend("ent.ui.ecommerce.controller.Login", {
		onInit: function onInit(oEvent) {
			this.getRouter()
				.getRoute("login")
				.attachPatternMatched(this._matchedHandler, this);
		},

		_matchedHandler: function (oEvent) {
			var oModel = this.getView().getModel('appView');
			oModel.setProperty("/visibleHeader", false);
			oModel.setProperty("/userRoleVis", false);
			oModel.setProperty("/visibility", false);
			oModel.setProperty("/otpVis", false);
			oModel.setProperty("/validateOTPVis", false);
			oModel.setProperty("/layout", "OneColumn");
			oModel.setProperty("/hamburgerVisibility", false);
			oModel.setProperty("/logoutVisibility", false);
			oModel.setProperty("/ResendStatusSignup", false);
			oModel.setProperty("/showError", false);
			// oModel.setProperty("/aeonHeaderVis", false);
			this.getUserRoleData();
		},



		getCurrentDateAndTimeWithExtraTime: function () {
			var currentDate = new Date();
		  
			// Add 30 minutes to the current date and time
			var extraTime = 30; // 30 minutes
			currentDate.setMinutes(currentDate.getMinutes() + extraTime);
		  
			var year = currentDate.getFullYear();
			var month = currentDate.getMonth() + 1; // Note: Months are 0-based, so add 1 to get the correct month
			var day = currentDate.getDate();
			var hours = currentDate.getHours();
			var minutes = currentDate.getMinutes();
			var seconds = currentDate.getSeconds();
		  
			// Formatting the output as desired
			var formattedDate = year + "-" + addLeadingZero(month) + "-" + addLeadingZero(day);
			var formattedTime = addLeadingZero(hours) + ":" + addLeadingZero(minutes) + ":" + addLeadingZero(seconds);
		  
			// Output the result with an additional 30 minutes
			this.getView().getModel("appView").setProperty("/dateAndTimeWithExtraTime", formattedDate + " " + formattedTime);
			console.log(formattedDate + " " + formattedTime);
			// Helper function to add leading zero if single-digit
			function addLeadingZero(number) {
			  return number < 10 ? "0" + number : number;
			}
		  },

		Login: function () {

			// * for cookie session expire.
			var allCookies = document.cookie.split(';');
			// The "expire" attribute of every cookie is
			// Set to "Thu, 01 Jan 1970 00:00:00 GMT"
			for (var i = 0; i < allCookies.length; i++) {
				document.cookie = allCookies[i] + "=;expires=" + new Date(0).toUTCString();
				document.cookie = allCookies[i] + "=;expires=" + new Date(0).toUTCString() + ";path=/api";
			}

			var that = this;
			var userName = this.getView().byId("userid").getValue();
			var password = this.getView().byId("pwd").getValue();
			var payload = {
				"email": userName,
				"password": password
			};
			if (userName === password) {
				that.getRouter().navTo("");
			};
			this.middleWare.callMiddleWare("login", "POST", payload)
				.then(function (data, status, xhr) {
					// MessageToast.show("Login Success");
					that.UserRole = data.Role
					if (data.Blocked == "Yes") {
						MessageBox.information("Your Account has been blocked by Administrator, For Further Details Contact Admin");
					}
					else if (data.Status === "Pending") {
						MessageBox.information("Your Account Status is Pending, so please contact Admin for further Details");
					}
					else if (data.Status === "Reject") {
						MessageBox.information("Your Account Status is Reject, For Further Details Contact Admin");
					}
					else if (data.temp === true) {
						that.openUpdateDialog();
					}
					else if (data.Role === "Admin" ||data.Role == "Factory Manager") {
						that.getModel("appView").setProperty("/visibleHeader", true);
						that.getModel("appView").setProperty("/userRole", that.UserRole);
						that.getView().byId("userid").setValueState('None');
						that.getView().byId("pwd").setValueState('None');
						that.getModel("appView").updateBindings();
						that.getRouter().navTo("Carborator");
					}
					else if (data.Role === "Customer") {
						that.getModel("appView").setProperty("/visibleHeader", true);
						that.getModel("appView").setProperty("/userRole", that.UserRole);
						that.getView().byId("userid").setValueState('None');
						that.getView().byId("pwd").setValueState('None');
						that.getModel("appView").updateBindings();
						that.getRouter().navTo("allPrinters");
					}
					else if (data.Role === "Factory Manager") {
						that.getModel("appView").setProperty("/visibleHeader", true);
						that.getModel("appView").setProperty("/userRole", that.UserRole);
						that.getView().byId("userid").setValueState('None');
						that.getView().byId("pwd").setValueState('None');
						that.getModel("appView").updateBindings();
						that.getRouter().navTo("allPrinters");
					}
					else if (data.Role === "Raw Material Head" || "Printing Head" || "Post Press Head" || "Dispatch Head" || "Accounts Head" || "Artwork Head") {
						that.getModel("appView").setProperty("/visibleHeader", true);
						that.getModel("appView").setProperty("/userRole", that.UserRole);
						that.getView().byId("userid").setValueState('None');
						that.getView().byId("pwd").setValueState('None');
						that.getModel("appView").updateBindings();
						that.getRouter().navTo("allPrinters");
					}
					else {
						that.getModel("appView").setProperty("/visibleHeader", true);
						that.getModel("appView").setProperty("/userRole", that.UserRole);
						that.getView().byId("userid").setValueState('None');
						that.getView().byId("pwd").setValueState('None');
						that.getModel("appView").updateBindings();
						that.getRouter().navTo("Carborator");
					}
					that.getModel().setHeaders({
						"Authorization": data.id
					});

					uId = data.userId;
					if(window.cordova){

						Cookies.set("soyuz_session", data.id, { expires: 7 });
					}

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.getView().byId("userid").setValueState('Error');
					that.getView().byId("pwd").setValueState('Error');
					that.middleWare.errorHandler(jqXhr, that);
				});

		},
		onLiveChnagePassValidationForUpdateNewPassward: function (oEvent) {
			var newValue = oEvent.getParameter("newValue");
			this.getView().getModel("appView").setProperty("/updateNewPassValue" , newValue);
			var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
			if (newValue === "") {
				this.getView().getModel("appView").setProperty("/newPassValueState", "None");
				this.getView().getModel("appView").setProperty("/VSTNewPass", "");
			} else if (!passwordRegex.test(newValue)) {
				// MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");
				this.getView().getModel("appView").setProperty("/newPassValueState", "Error");
				this.getView().getModel("appView").setProperty("/VSTNewPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");
				return;
			}else {
				this.getView().getModel("appView").setProperty("/newPassValueState", "None");
				this.getView().getModel("appView").setProperty("/VSTNewPass", "");
			}
		},
		onLiveChnagePassValidationForUpdateComfPassward: function (oEvent) {
			var newPassValue = this.getView().getModel("appView").getProperty("/updateNewPassValue");
			var newValue = oEvent.getParameter("newValue");
			this.getView().getModel("appView").setProperty("/updateComfPassValue" , newValue);
			var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
			if (newValue === "") {
				this.getView().getModel("appView").setProperty("/confPassValueState", "None");
				this.getView().getModel("appView").setProperty("/VSTConfPass", "");
			} else if (!passwordRegex.test(newValue)) {
				// MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");
				this.getView().getModel("appView").setProperty("/confPassValueState", "Error");
				this.getView().getModel("appView").setProperty("/VSTConfPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");
				return;
			} else if (newPassValue !== newValue){
				this.getView().getModel("appView").setProperty("/confPassValueState", "Error");
			    this.getView().getModel("appView").setProperty("/VSTConfPass", "Value is not Matching");
			return;
			}
			else {
				this.getView().getModel("appView").setProperty("/confPassValueState", "None");
				this.getView().getModel("appView").setProperty("/VSTConfPass", "");
			}
		},


		openUpdateDialog: function () {
			var oView = this.getView();
			var that = this;

			if (!this.passUpdateDialog) {
				this.passUpdateDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.loginScreenFragment.updateTempPass",
					controller: this
				}).then(function (oDialog) {
					// Add dialog to view hierarchy
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));

			}
			this.passUpdateDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		onUpdatePassOk: function () {
			
			// Regular expression to check for password validation
			//  var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
			var oModel = this.getView().getModel("appView");
			var that = this;
			var prevPass = this.getView().getModel("appView").getProperty("/prevPassword");
			var passValue = this.getView().getModel("appView").getProperty("/newPassword");
			var conPassValue = this.getView().getModel("appView").getProperty("/confirmPassword");
			var userName = this.getView().byId("userid").getValue();

			//  if (!passwordRegex.test(passValue) || !passwordRegex.test(conPassValue)) {
			// 	MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");
			// 	return;
			//   }

			
			if (conPassValue !== passValue) {
				MessageToast.show("Your Entered Password is not Matched");
				return;
			}
			else if (!conPassValue){
				MessageToast.show("Enter the confirm password");
				return;
			}
			else if(!passValue){
				MessageToast.show("Enter the Password");
				return;
			}
			// else if (!conPassValue)
			var payload = {
				email: userName,
				password: prevPass,
				newPassword: conPassValue
			}
			if(passValue===conPassValue){
				this.middleWare.callMiddleWare("updatePassword", "POST", payload)
				.then(function (data, status, xhr) {

					MessageToast.show(" Success");
					that.passUpdateDialog.then(function (oDialog) {
						oDialog.close();
					});

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
			}
			else{
				MessageToast.show("please check your fields")
			}

			



		},
		onRejectCan: function () {
			
			this.passUpdateDialog.then(function (oDialog) {
				oDialog.close();
			});
		},

		openDialog: function () {
			var oView = this.getView();
			var that = this;
			if (!this.signupDialog) {
				this.signupDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.loginScreenFragment.Signup",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			return this.signupDialog;
		},

		onReject: function () {
			
			var oModel = this.getView().getModel('appView');
			var that = this;
			clearInterval(this.x);
			this.openDialog().then(function (oDialog) {
				oDialog.close();
				that.getView().getModel('appView').setProperty("/timerText", "");
				oModel.setProperty("/Email", "");
				oModel.setProperty("/otpValue","");
				oModel.setProperty("/showError", false);
				oModel.setProperty("/EmailEditable", true);
				oModel.setProperty("/onResendOTP", false);
				oModel.setProperty("/validateOTPVis", false);
				oModel.setProperty("/otpVis", false);
				// that.getView().getModel('appView').setProperty("/onResendOTP", false);
				// oModel.setProperty("/errorMessage","You will receive a Email to update your Password.");
				oModel.setProperty("/ResendStatusSignup", false);
				oModel.setProperty("/submitEnable", true);
				oModel.setProperty("/signUpValueState", 'None');
			})
		},

		SignUp: function () {
			var that = this;
			var oModel = that.getView().getModel('appView');
			this.openDialog().then(function (oDialog) {
				oDialog.open();
				oModel.setProperty("/Title", "Signup");
				isSignupButton = true;
			})
		},

		ForgotPasswprd: function () {
			var oModel = this.getView().getModel('appView');
			var that = this;
			this.openDialog().then(function (oDialog) {
				oModel.setProperty("/ResendStatusSignup", false);
				oDialog.open();
				oModel.setProperty("/Title", "Forgot Password");
				oModel.setProperty("/ResendStatusSignup", false);
				isSignupButton = false;
			})
		},

		onSignupEmailVerifyCall: function () {
			var that = this;
			var oEmail = this.getView().getModel('appView').getProperty("/Email");
			var oModel = that.getView().getModel('appView');
			oModel.setProperty("/showError", false);
			oModel.setProperty("/submitEnable", true);

			var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			if (oEmail && !oEmail.match(emailRegex)) {
				MessageToast.show("Please enter a valid email address");
				return;
			}
			else if (!oEmail) {
				MessageToast.show("Please enter a email address");
				return;
			};

			var payload = {
				"email": oEmail
			};
			this.middleWare.callMiddleWare("signup/verifyEmail", "POST", payload)
				.then(function (data, status, xhr) {

					MessageToast.show("Verfication Email Sent to Your Mail (If not : Please Check Spam Folder)");
					oModel.setProperty("/ResendStatusSignup", true);
					oModel.setProperty("/validateOTPVis", true);
					oModel.setProperty("/submitEnable", false)
					oModel.setProperty("/otpVis", true)

					oModel.setProperty("/EmailEditable", false)
					// that.getView().getModel('appView').setProperty("/EmailEditable", false);

					// oModel.setProperty("/errorMessage","You will receive a Email to update your Password.");
					oModel.setProperty("/submitEnable", false);
					that.ResendEmailSend();
				})
				.catch(function (jqXhr, textStatus, errorMessage) {

					that.middleWare.errorHandler(jqXhr, that);
				});
		},

		onForgotPasswordEmailVerfiyCall: function () {
			
			var that = this;
			var oEmail = this.getView().getModel('appView').getProperty("/Email");
			var oModel = this.getView().getModel('appView')

			var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			if (oEmail && !oEmail.match(emailRegex)) {
				MessageToast.show("Please enter a valid email address");
				return;
			}
			else if (!oEmail) {
				MessageToast.show("Please enter a email address");
				return;
			};
			var payload = {
				"email": oEmail
			};
			this.middleWare.callMiddleWare("forgotPasswordEmailVerify", "POST", payload)
				.then(function (data, status, xhr) {

					// MessageToast.show("forgot Password Email Sent to Your Mail");
					// that.getView().getModel('appView').setProperty("/EmailEditable", false);
					oModel.setProperty("/ResendStatusSignup", false);
					oModel.setProperty("/showError", true);
					oModel.setProperty("/validateOTPVis", true);
					oModel.setProperty("/otpVis", true);
					oModel.setProperty("/errorMessage", "OTP sent to your Mail.");
					oModel.setProperty("/submitEnable", false);

					// MessageBox.information("You will receive a Email to update your Password.")
					// that.onReject();
					// that.OtpSend();

				})
				.catch(function (jqXhr, textStatus, errorMessage) {

					that.middleWare.errorHandler(jqXhr, that);
				});
		},

		onEmailLiveChange: function (oEvent) {
			var emailInput = oEvent.getSource();
			var email = emailInput.getValue();
			var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

			if (!emailPattern.test(email)) {
				// Invalid email format
				emailInput.setValueState('Error');
				emailInput.setValueStateText("Enter a valid email address");
			} else {
				// Valid email format
				emailInput.setValueState('None');
			}
		},

		OnEnter : function (oEvent) {  //* this function is call onEnter event in signup fragment and forgot password fragment.
			
			if (isSignupButton == true) {
				this.onSignupEmailVerifyCall();
			}
			else {
				this.onForgotPasswordEmailVerfiyCall();
			}
		},

		onSubmit: function () {
			
			if (isSignupButton == true) {
				this.onSignupEmailVerifyCall();
			}
			else {
				this.onForgotPasswordEmailVerfiyCall();
			}
		},
		onVerifyOtp:function(){
			
			var oModel = this.getView().getModel('appView')
			var inputOtpValue = oModel.getProperty("/otpValue");
			var email = oModel.getProperty("/Email");
			var that = this;
			var payload = {inputOtpValue,email}
			if(!inputOtpValue){
				MessageToast.show("Please Enter a OTP!");
				return;
			}
			this.middleWare.callMiddleWare("verifyOtp", "POST", payload)
				.then(function (data, status, xhr) {
					MessageToast.show("Success")
					that.onGetDialog();
					that.deleteOtp();
					oModel.setProperty("/otpValue","");
					// that.onReject();
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					if(jqXhr === "OTP has expired"){

						MessageToast.show("OTP has Expired!")
					}else{

						MessageToast.show("Please Enter a Valid OTP")
					}
					oModel.setProperty("/otpValue","");
					// that.middleWare.errorHandler(jqXhr, that);
				});
		},

		deleteOtp:function(){
			
			var oModel = this.getView().getModel('appView')
			var inputOtpValue = oModel.getProperty("/otpValue");
			var that = this;
			var payload = inputOtpValue
			this.middleWare.callMiddleWare("deleteotp", "POST", payload)
				.then(function (data, status, xhr) {
					// MessageToast.show("Success")
					// that.onReject();
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					// MessageToast.show("Please Enter a Valid OTP")
					// that.middleWare.errorHandler(jqXhr, that);
				});
		},


		//*-----------------------------------------------------------------------------------------//
		validateotp: function () {
			var oView = this.getView();
			var that = this;
			if (!this.validatedialog) {
			  this.validatedialog = Fragment.load({
				id: oView.getId(),
				name: "ent.ui.ecommerce.fragments.userVerify",
				controller: this
			  }).then(function (oDialog) {
				// Add dialog to view hierarchy
				oView.addDependent(oDialog);
				return oDialog;
			  }.bind(this));
			}
			return this.validatedialog;
		  },
		  onGetDialog: function (oEvent) {
			var that = this;
			that.validateotp().then(function (oDialog) {
			  oDialog.open();
			 
			});
		  },
		  onClose: function () {
			  this.onReject();
			  this.getView().getModel("appView").setProperty("/setNewPass","")
			  this.getView().getModel("appView").setProperty("/setConPass","")
			  this.getView().getModel("appView").setProperty("/newPassValueState","None")
			  this.getView().getModel("appView").setProperty("/confirmPassValueState","None")
				this.validateotp().then(function (oDialog) {
				var that = this;
				oDialog.close();
			})
		  },

//*------------------------------------------------------------------------------------------------------------

		resetFrag: function () {
			var oView = this.getView();
			var that = this;

			if (!this.oDialog) {
				this.oDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.loginScreenFragment.Reset",
					controller: this
				}).then(function (oDialog) {
					// Add dialog to view hierarchy
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));

			}
			this.oDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

		onResetPassword: function () {
			this.resetFrag();
		},
		resendOTP: function () {
			this.onSubmit();
		},
		ResendEmailSend: function () {
			this.emailCount += 1;
			var that = this;
			var countDownDate = new Date().getTime() + 60000;
			 this.x= setInterval(function () {
				var now = new Date().getTime();
				var distance = countDownDate - now;
				var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
				var seconds = Math.floor((distance % (1000 * 60)) / 1000);
				var timerText = "Resend OTP in " + seconds + "s";

				// Display the timer
				that.getView().getModel('appView').setProperty("/timerText", timerText);
				if (distance < 0) {
					clearInterval(this.x);
					that.getView().getModel('appView').setProperty("/timerText", "Resend");
					that.getView().getModel('appView').setProperty("/onResendOTP", true);
					// that.getView().getModel('local').setProperty("/ResendMsg", "If OTP not Received ");
				}
			}, 1000);

		},

//*-------------USER Verify----------------------------


onLiveChnagePassValidationForForgotPassward: function(oEvent){
	var newValue = oEvent.getParameter("newValue");

	var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

	if (newValue === "") {

		this.getView().getModel("appView").setProperty("/newPassValueState", "None");

		this.getView().getModel("appView").setProperty("/VSTNewPass", "");

	} else if (!passwordRegex.test(newValue)) {

		// MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");

		this.getView().getModel("appView").setProperty("/newPassValueState", "Error");

		this.getView().getModel("appView").setProperty("/VSTNewPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");

		return;

	} else {

		this.getView().getModel("appView").setProperty("/newPassValueState", "None");

		this.getView().getModel("appView").setProperty("/VSTNewPass", "");

	}

},
onLiveChnagePassValidationForFrogotConfirmPassValidation: function (oEvent) {

	var newValue = oEvent.getParameter("newValue");

	var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

	if (!passwordRegex.test(newValue)) {

		// MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");

		this.getView().getModel("appView").setProperty("/confirmPassValueState", "Error");

		this.getView().getModel("appView").setProperty("/VSTConfirmPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");

		return;

	} else {

		this.getView().getModel("appView").setProperty("/confirmPassValueState", "None");

		this.getView().getModel("appView").setProperty("/VSTConfirmPass", "");

	}

	this.getView().getModel("appView").updateBindings();




},

onSubmitDetails:function(){
	if(isSignupButton){
		this.onCreateUser();
	}
	else{
		this.onUpdateUser();
	}
},

onCreateUser: function (oEvent) {
	var that = this;
	var email = this.getModel("appView").getProperty('/Email');
	var pass = this.getModel("appView").getProperty('/setNewPass');
	var Conpass = this.getModel("appView").getProperty('/setConPass');
	// var oModel = this.getView("appView").getModel("appView");
	// var oRouteName = oEvent.getParameter("name") === "userVerify";
	var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
	if (pass !== Conpass) {
		MessageToast.show("Password Does not match")
		return;
	}
	if (!passwordRegex.test(pass)||!passwordRegex.test(Conpass)) {
		MessageToast.show("Password is not Validate")
		return;
	}
	else {

		var payload = {
			"email": email,
			"password": Conpass,
		};
		this.middleWare.callMiddleWare("signup/createUser", "POST", payload)
			.then(function (data, status, xhr) {
				
				MessageToast.show("User Register Successful");
				that.onClose();
				that.onReject();
				// that.timerText();
				// oModel.setProperty("/messagePageText","Success....");
				// oModel.setProperty("/timerText","Redirecting to the login page in ");
				// oModel.setProperty("/verifyIcon",'sap-icon://message-success');

			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				
				// oModel.setProperty("/messagePageText","Error....");
				// oModel.setProperty("/timerText","R");
				// oModel.setProperty("/verifyIcon",'sap-icon://error');
				// oModel.setProperty("/verifyLogout",true);
				that.middleWare.errorHandler(jqXhr, that);
				// that.getRouter().navTo("notFound");
			});
	}
},
onUpdateUser: function (oEvent) {
	var oModel = this.getView().getModel("appView");
	var that = this;
	var email = this.getModel("appView").getProperty('/Email');
	var pass = this.getModel("appView").getProperty('/setNewPass');
	var Conpass = this.getModel("appView").getProperty('/setConPass');
	var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
	// var oRouteName = oEvent.getParameter("name") === "userVerify";
	if (pass !== Conpass) {
		MessageToast.show("Password Does not match")
		return;
	}
	if (!passwordRegex.test(pass)||!passwordRegex.test(Conpass)) {
		MessageToast.show("Password is not Validate")
		return;
	}
	else {

		var payload = {
			"email": email,
			"password": Conpass,
		};
		this.middleWare.callMiddleWare("reset/password", "POST", payload)
			.then(function (data, status, xhr) {
				
				MessageToast.show("Password Reset Successful");
				that.onClose();
				// that.timerText();
				// oModel.setProperty("/messagePageTextUpdate","Success....");
				// oModel.setProperty("/timerTextUpdate","Redirecting to the login page in ");
				// oModel.setProperty("/verifyIcon",'sap-icon://message-success');

			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				
				// oModel.setProperty("/messagePageTextUpdate","Error....");
				// oModel.setProperty("/timerTextUpdate","R");
				// oModel.setProperty("/updateIcon",'sap-icon://error');
				// oModel.setProperty("/updateLogout",true);
				that.middleWare.errorHandler(jqXhr, that);
				// that.getRouter().navTo("notFound");
			});
	}
},






	});

});




