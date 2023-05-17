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
			var that = this;
			var userName = this.getView().byId("userid").getValue();
			var password = this.getView().byId("pwd").getValue();
			var payload = {
				"email": userName,
				"password": password
			}
			if(userName===password){
				that.getRouter().navTo("");
			}
			this.middleWare.callMiddleWare("api/Users/login", "POST", payload)
				.then( function (data, status, xhr) {
					debugger;
					MessageToast.show("Login Success");
					that.getModel("appView").setProperty("/visibleHeader", true);
					that.getView().byId("userid").setValueState('None');
					that.getView().byId("pwd").setValueState('None');
					that.getModel("appView").updateBindings();
					that.getRouter().navTo("Carborator");

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.getView().byId("userid").setValueState('Error');
					that.getView().byId("pwd").setValueState('Error');
					that.middleWare.errorHandler(jqXhr, that);
				});
		},

		SignUp : function (){
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
                oDialog.open();
                // that.onRefresh(/);
                
                // that.getView().getModel('local').refresh();
            });
        },

		onSubmit : function () {
			var that = this; 
			var oEmail = this.getView().getModel('appView').getProperty("/Email");
			var payload = {
				"email" : oEmail
			}; 	
			// debugger;
			this.middleWare.callMiddleWare("signup/verifyEmail", "POST", payload)
				.then( function (data, status, xhr) {
					debugger;
					MessageToast.show("signup  Success");
					that.getView().getModel('appView').setProperty("/EmailEditable", false);
					that.OtpSend();

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					debugger;
					that.middleWare.errorHandler(jqXhr, that);
				});
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