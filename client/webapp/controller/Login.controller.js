sap.ui.define([
	"./BaseController", "sap/m/MessageBox","sap/ui/core/Fragment", 'sap/m/MessageToast',
], function (
	BaseController,
	MessageBox,
	Fragment,
	MessageToast
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
			this.getModel("appView").setProperty("/visibleHeader", false);
			this.getModel("appView").setProperty("/visibility", false);
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/hamburgerVisibility", false);
			this.getModel("appView").setProperty("/logoutVisibility", false);
		},

		Login: function () {
			debugger;
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
					debugger;
					// MessageToast.show("Login Success");
					if(data.Blocked=="Yes"){
						MessageBox.information("Your Account has been blocked by Administrator, For Further Details Contact Admin");
					}
					else if(data.temp === true){
						that.openUpdateDialog();
					}
					else if(data.Role==="Customer"){
						that.getModel("appView").setProperty("/visibleHeader", true);
						that.getView().byId("userid").setValueState('None');
						that.getView().byId("pwd").setValueState('None');
						that.getModel("appView").updateBindings();
						that.getRouter().navTo("allPrinters");
					}
					else if(data.Role==="Factory Manager"){
						that.getModel("appView").setProperty("/visibleHeader", true);
						that.getView().byId("userid").setValueState('None');
						that.getView().byId("pwd").setValueState('None');
						that.getModel("appView").updateBindings();
						that.getRouter().navTo("allPrinters");
					}
					else {
						that.getModel("appView").setProperty("/visibleHeader", true);
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
			// 		debugger;
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
			debugger
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
					debugger;
					MessageToast.show(" Success");

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});

					

		},
		openDialog : function(){
			debugger
			var oView = this.getView();
            var that = this;
			
            if (!this.oDialog) {
                this.oDialog = Fragment.load({
                    id: oView.getId(),
                    name: "ent.ui.ecommerce.fragments.Signup",
                    controller: this
                }).then(function (oDialog) {    
                    // Add dialog to view hierarchy
                    oView.addDependent(oDialog);
                    return oDialog;
                }.bind(this));
               
            }
            this.oDialog.then(function (oDialog) {
				if(isSignupButton==true){
					oDialog.open();
					that.getView().getModel('appView').setProperty("/Title","Signup");
				}
				else{
					oDialog.open();
					var oModel = that.getView().getModel('appView')
					oModel.setProperty("/Title","Forgot Password");
					oModel.setProperty("/Email","");
					oModel.updateBindings();
				}
            });
		},

		SignUp : function (){
			debugger
			isSignupButton = true;
			this.openDialog();
        },

		ForgotPasswprd : function(){
			debugger
			isSignupButton = false;
			this.openDialog();
        },

		onSubmit : function () {
			var that = this; 
			var oEmail = this.getView().getModel('appView').getProperty("/Email");
			var payload = {
				"email" : oEmail
			}; 	
			if(isSignupButton == true){
				// debugger;
				this.middleWare.callMiddleWare("signup/verifyEmail", "POST", payload)
					.then( function (data, status, xhr) {
						debugger;
						MessageToast.show("Verfication Email Sent to Your Mail");
						that.getView().getModel('appView').setProperty("/EmailEditable", false);
						that.OtpSend();
	
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						debugger;
						that.middleWare.errorHandler(jqXhr, that);
					});
			}
			else{
				this.middleWare.callMiddleWare("forgotPasswordEmailVerify", "POST", payload)
				.then( function (data, status, xhr) {
					debugger;
					MessageToast.show("forgot Password Email Sent to Your Mail");
					that.getView().getModel('appView').setProperty("/EmailEditable", false);
					that.OtpSend();

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					debugger;
					that.middleWare.errorHandler(jqXhr, that);
				});
			}



		},

		onReject: function () {
            this.oDialog.then(function (oDialog) {
                oDialog.close();
            });
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
		OtpSend: function () {
            
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