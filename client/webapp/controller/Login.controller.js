sap.ui.define([
	"./BaseController", "sap/m/MessageBox","sap/ui/core/Fragment", 'sap/m/MessageToast','sap/m/MessageStrip'
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
			oModel.setProperty("/ResendStatusSignup",false);
			oModel.setProperty("/showError",false);
		},

		Login: function () {
			
			// * for cookie session expire.
			var allCookies = document.cookie.split(';');
			// The "expire" attribute of every cookie is
			// Set to "Thu, 01 Jan 1970 00:00:00 GMT"
			for (var i = 0; i < allCookies.length; i++) {
				document.cookie = allCookies[i] + "=;expires=" + new Date(0).toUTCString();
				document.cookie = allCookies[i] + "=;expires=" + new Date(0).toUTCString()+";path=/api";
			}

			var that = this;
			var userName = this.getView().byId("userid").getValue();
			var password = this.getView().byId("pwd").getValue();
			var payload = {
				"email": userName,
				"password": password
			};
			if(userName===password){
				that.getRouter().navTo("");
			};
			this.middleWare.callMiddleWare("login", "POST", payload)
				.then( function (data, status, xhr) {
										// MessageToast.show("Login Success");
					that.UserRole = data.Role
					if(data.Blocked=="Yes"){
						MessageBox.information("Your Account has been blocked by Administrator, For Further Details Contact Admin");
					}
					else if(data.Status === "Pending"){
						MessageBox.information("Your Account Status is Pending, so please contact Admin for further Details");
					}
					else if(data.Status === "Reject"){
						MessageBox.information("Your Account Status is Reject, For Further Details Contact Admin");
					}
					else if(data.temp === true){
						that.openUpdateDialog();
					}
					else if(data.Role==="Customer"){
						that.getModel("appView").setProperty("/visibleHeader", true);
						that.getModel("appView").setProperty("/userRole", that.UserRole);
						that.getView().byId("userid").setValueState('None');
						that.getView().byId("pwd").setValueState('None');
						that.getModel("appView").updateBindings();
						that.getRouter().navTo("allPrinters");
					}
					else if(data.Role==="Factory Manager"){
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
					
					
					uId = data.userId;

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.getView().byId("userid").setValueState('Error');
					that.getView().byId("pwd").setValueState('Error');
					that.middleWare.errorHandler(jqXhr, that);
				});
				
			// this.middleWare.callMiddleWare("api/Users/login", "POST", payload)
			// 	.then( function (data, status, xhr) {
			// 		
			// 		MessageToast.show("Login Success");
			// 		that.getModel("appView").setProperty("/visibleHeader", true);
			// 		that.getView().byId("userid").setValueState('None');
			// 		that.getView().byId("pwd").setValueState('None');
			// 		that.getModel("appView").updateBindings();
			// 		that.getRouter().navTo("Carborator");

			// 	})
			// 	.catch(function (jqXhr, textStatus, errorMessage) {
			// 		that.getView().byId("userid").setValueState('Error');
			// 		that.getView().byId("pwd").setValueState('Error');
			// 		that.middleWare.errorHandler(jqXhr, that);
			// 	});
		},

		

		openUpdateDialog : function(){
			// debugger
			var oView = this.getView();
            var that = this;
			
            if (!this.passUpdateDialog) {
                this.passUpdateDialog = Fragment.load({
                    id: oView.getId(),
                    name: "ent.ui.ecommerce.fragments.updateTempPass",
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

		onUpdatePassOk : function(){
			// Regular expression to check for password validation
 			 var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
			 var oModel = this.getView().getModel("appView");
			 var passValue =  oModel.getProperty("/Pass");
			 var conPassValue = oModel.getProperty("/NewPass");
			 var prevPass = oModel.getProperty("/prevPass");
			 var userName = this.getView().byId("userid").getValue();

			 if (!passwordRegex.test(passValue) || !passwordRegex.test(conPassValue)) {
				MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");
				return;
			  }

			if(!conPassValue || !passValue) {
				MessageToast.show("Enter the Password");
			}
			else if(conPassValue !== passValue){
				MessageToast.show("Your Entered Password is not similar");
			}
			var payload = {
				email:userName, 
				password:prevPass, 
				newPassword:conPassValue
			}
	
			this.middleWare.callMiddleWare("updatePassword", "POST", payload)
				.then( function (data, status, xhr) {
					
					MessageToast.show(" Success");

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});

					

		},
		openDialog : function(){
			var oView = this.getView();
			var that = this;
			if (!this.signupDialog) {
				this.signupDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.Signup",
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
            this.openDialog().then(function (oDialog) {
				oDialog.close();
				oModel.setProperty("/Email","");
				oModel.setProperty("/showError",false);
				// oModel.setProperty("/errorMessage","You will receive a Email to update your Password.");
				oModel.setProperty("/submitEnable",true);
			})
        },

		SignUp : function (){
			var that=this;
			var oModel = that.getView().getModel('appView');
			this.openDialog().then(function (oDialog) {
				oDialog.open();
				oModel.setProperty("/Title","Signup");
				isSignupButton =true;
			})
        },

		ForgotPasswprd : function(){
			var oModel = this.getView().getModel('appView');
			var that=this;
			this.openDialog().then(function (oDialog) {
				oModel.setProperty("/ResendStatusSignup",false);
				oDialog.open();
				oModel.setProperty("/Title","Forgot Password");
				isSignupButton = false;
			})
        },

		onSignupEmailVerifyCall : function(){
			var that = this; 
			var oEmail = this.getView().getModel('appView').getProperty("/Email");
			var oModel = that.getView().getModel('appView');
			oModel.setProperty("/showError",false);
			oModel.setProperty("/submitEnable",true);

			var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			if (oEmail && !oEmail.match(emailRegex)) {
				MessageToast.show("Please enter a valid email address");
				return;
			}
			else if(!oEmail) {
				MessageToast.show("Please enter a email address");
				return;
			};

			var payload = {
				"email" : oEmail
			}; 	
			this.middleWare.callMiddleWare("signup/verifyEmail", "POST", payload)
				.then( function (data, status, xhr) {
					
					MessageToast.show("Verfication Email Sent to Your Mail");
					oModel.setProperty("/ResendStatusSignup",true);
					// that.getView().getModel('appView').setProperty("/EmailEditable", false);
					
					// oModel.setProperty("/errorMessage","You will receive a Email to update your Password.");
					oModel.setProperty("/submitEnable",false);
					that.ResendEmailSend();
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					
					that.middleWare.errorHandler(jqXhr, that);
			});
		},

		onForgotPasswordEmailVerfiyCall : function(){
			var that = this; 
			var oEmail = this.getView().getModel('appView').getProperty("/Email");
			var oModel = this.getView().getModel('appView')

			var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			if (oEmail && !oEmail.match(emailRegex)) {
				MessageToast.show("Please enter a valid email address");
				return;
			}
			else if(!oEmail) {
				MessageToast.show("Please enter a email address");
				return;
			};
			var payload = {
				"email" : oEmail
			};
			this.middleWare.callMiddleWare("forgotPasswordEmailVerify", "POST", payload)
				.then( function (data, status, xhr) {
					
					// MessageToast.show("forgot Password Email Sent to Your Mail");
					// that.getView().getModel('appView').setProperty("/EmailEditable", false);
					oModel.setProperty("/ResendStatusSignup",false);
					oModel.setProperty("/showError",true);
					oModel.setProperty("/errorMessage","You will receive a Email to update your Password.");
					oModel.setProperty("/submitEnable",false);
					
					// MessageBox.information("You will receive a Email to update your Password.")
					// that.onReject();
					// that.OtpSend();

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					
					that.middleWare.errorHandler(jqXhr, that);
			});
		},

		onEmailLiveChange : function(oEvent){
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

		onSubmit : function () {
			if(isSignupButton == true){
				this.onSignupEmailVerifyCall();
			}
			else{
				this.onForgotPasswordEmailVerfiyCall();
			}
		},

		

		resetFrag:function(){
			var oView = this.getView();
            var that = this;
			
            if (!this.oDialog) {
                this.oDialog = Fragment.load({
                    id: oView.getId(),
                    name: "ent.ui.ecommerce.fragments.Reset",
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
		onResetPassword:function(){
			this.resetFrag();
		},
		resendOTP:function(){
			this.onSubmit();
		},
		ResendEmailSend: function () {
            
            this.emailCount += 1;
            var that = this;
            var countDownDate = new Date().getTime() + 10000; 
            var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                var timerText = "Resend OTP in " + seconds + "s";

                // Display the timer
                that.getView().getModel('appView').setProperty("/timerText", timerText);
                if (distance < 0) {
                    clearInterval(x);
                    that.getView().getModel('appView').setProperty("/timerText", "Resend");
                    that.getView().getModel('appView').setProperty("/onResendOTP", true);
                    // that.getView().getModel('local').setProperty("/ResendMsg", "If OTP not Received ");
                }
            }, 1000);

        },
	});

});