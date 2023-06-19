sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, Fragment, MessageToast) {
    "use strict";

    return BaseController.extend("ent.ui.ecommerce.controller.userVerify", {

        onInit: function () {
            this._oRouter = this.getRouter();
            this.getRouter().getRoute("updatePassword").attachPatternMatched(this._matchedHandler, this);
        },
        _matchedHandler: function () {
            
            this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getModel("appView").setProperty("/visibility", false);
            this.getModel("appView").setProperty("/logoutVisibility", false);
            this.getModel("appView").setProperty("/hamburgerVisibility", false);
			this.getModel("appView").setProperty("/visibleHeader",true);
			this.getModel("appView").updateBindings();
            // this.timerText();
            this.verifytokens();
            this.getView().getModel("appView").setProperty("/messagePageTextUpdate","Update Password....");
            this.getView().getModel("appView").setProperty("/timerTextUpdate","");
            this.getView().getModel("appView").setProperty("/updateIcon",'sap-icon://past');
            this.getView().getModel("appView").setProperty("/updateLogout",false);
            // this.loadFragment();
		},

        onMessagePageLogout:function(){
            this.onLogOut();
        },

        verifytokens: function () {
            // Get the URL parameters
            var that = this;
            var oParams = this.getRouter().getHashChanger().getHash().split("updatePassword/")[1];
            var payload = {
                "token": oParams
            };
            
            var oModel = this.getView("appView").getModel("appView"); 
            this.middleWare.callMiddleWare("Forgot/verifyToken", "POST", payload)
                .then(function (data, status, xhr) {
                    
                    that.email = data.email;
                    that.loadFragment();
                    that.getModel("appView").setProperty("/userEmail", data.email);

                })
                .catch(function (jqXhr, textStatus, errorMessage) {
                    
                    that.middleWare.errorHandler(jqXhr, that);
                    oModel.setProperty("/messagePageTextUpdate","Error....");
                    oModel.setProperty("/timerTextUpdate","");
                    oModel.setProperty("/updateIcon",'sap-icon://error');
                    oModel.setProperty("/updateLogout",true);
                    // that.getRouter().navTo("notFound");
                });
        },

        loadFragment: function () {
            var oView = this.getView();
            var that = this;

            if (!this.oFixedSizeDialog) {
                this.oFixedSizeDialog = Fragment.load({
                    id: oView.getId(),
                    name: "ent.ui.ecommerce.fragments.userVerify",
                    controller: this
                }).then(function (oDialog) {
                    // Add dialog to view hierarchy
                    oView.addDependent(oDialog);
                    return oDialog;
                }.bind(this));

            }
            this.oFixedSizeDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCreateUser: function (oEvent) {
            var that = this;
            var pass = this.getModel("appView").getProperty('/setNewPass');
            var Conpass = this.getModel("appView").getProperty('/setConPass');
            // var oRouteName = oEvent.getParameter("name") === "userVerify";
            if (pass !== Conpass) {
                MessageToast.show("Password Does not match")
            }
            else {

                var payload = {
                    "email": this.email,
                    "password": Conpass,
                };
                this.middleWare.callMiddleWare("reset/password", "POST", payload)
                    .then(function (data, status, xhr) {
                        
                        MessageToast.show("Password Reset Successful");
                        that.onReject();
                        that.timerText();
                        oModel.setProperty("/messagePageTextUpdate","Success....");
                        oModel.setProperty("/timerTextUpdate","Redirecting to the login page in ");
                        oModel.setProperty("/verifyIcon",'sap-icon://message-success');

                    })
                    .catch(function (jqXhr, textStatus, errorMessage) {
                        
                        oModel.setProperty("/messagePageTextUpdate","Error....");
                        oModel.setProperty("/timerTextUpdate","R");
                        oModel.setProperty("/updateIcon",'sap-icon://error');
                        oModel.setProperty("/updateLogout",true);
                        that.middleWare.errorHandler(jqXhr, that);
                        // that.getRouter().navTo("notFound");
                    });
            }
        },

        onReject: function () {
            this.oFixedSizeDialog.then(function (oDialog) {
                oDialog.close();
            });
        },
        timerText: function () {
            
            this.emailCount += 1;
            var that = this;
            var countDownDate = new Date().getTime() + 10000; // 60 seconds from now
            var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                var timerText = "Redirecting to login page in " + seconds + "s";

                // Display the timer
                that.getView().getModel('appView').setProperty("/timerText", timerText);
                if (distance < 0) {
                    clearInterval(x);
                    // that.getView().getModel('appView').setProperty("/timerText", "Resend");
                    // that.getView().getModel('appView').setProperty("/onResendOTP", true);
                    that.getRouter().navTo("login",{});
                    // that.getView().getModel('local').setProperty("/ResendMsg", "If OTP not Received ");
                }
            }, 1000);

        },
        onLiveChnagePassValidationForFrogotPassward: function(oEvent){
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
        }
	});
});