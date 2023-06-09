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
			oModel.setProperty("/visibility", false);
			oModel.setProperty("/layout", "OneColumn");
			oModel.setProperty("/hamburgerVisibility", false);
			oModel.setProperty("/logoutVisibility", false);
			oModel.setProperty("/ResendStatusSignup", false);
			oModel.setProperty("/showError", false);
			this.getUserRoleData();
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
					else if (data.Role === "Admin") {
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
			debugger
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
			debugger;
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
			debugger;
			var oModel = this.getView().getModel('appView');
			var that = this;
			clearInterval(this.x);
			this.openDialog().then(function (oDialog) {
				oDialog.close();
				that.getView().getModel('appView').setProperty("/timerText", "");
				oModel.setProperty("/Email", "");
				oModel.setProperty("/showError", false);
				oModel.setProperty("/EmailEditable", true);
				oModel.setProperty("/onResendOTP", false);
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

					MessageToast.show("Verfication Email Sent to Your Mail");
					oModel.setProperty("/ResendStatusSignup", true);
					oModel.setProperty("/submitEnable", false)

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
					oModel.setProperty("/errorMessage", "You will receive a Email to update your Password.");
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
	});

});
