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
            this.getRouter().getRoute("userVerify").attachPatternMatched(this._matchedHandler, this);
        },
        _matchedHandler: function () {
            
            this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getModel("appView").setProperty("/visibility", false);
            this.getModel("appView").setProperty("/logoutVisibility", false);
            this.getModel("appView").setProperty("/hamburgerVisibility", false);
			this.getModel("appView").setProperty("/visibleHeader",true);
			this.getModel("appView").updateBindings();
            this.getView().getModel("appView").setProperty("/messagePageText","Verifying....");
            this.getView().getModel("appView").setProperty("/timerText","");
            this.getView().getModel("appView").setProperty("/verifyIcon",'sap-icon://past');
            this.getView().getModel("appView").setProperty("/verifyLogout",false);

            // this.timerText();
            this.verifytokens();
		},

        verifytokens: function () {
            // Get the URL parameters
            var that = this;
            var oParams = this.getRouter().getHashChanger().getHash().split("userVerify/")[1];
            var payload = {
                "token": oParams
            };
            
            var oModel = this.getView("appView").getModel("appView"); 
            this.middleWare.callMiddleWare("signup/verifyToken", "POST", payload)
                .then(function (data, status, xhr) {
                    
                    that.email = data.email;
                    that.loadFragment();
                    that.getModel("appView").setProperty("/userEmail", data.email);

                })
                .catch(function (jqXhr, textStatus, errorMessage) {
                    
                    that.middleWare.errorHandler(jqXhr, that);
                    oModel.setProperty("/messagePageText","Error....");
                    oModel.setProperty("/timerText","");
                    oModel.setProperty("/verifyIcon",'sap-icon://error');
                    oModel.setProperty("/verifyLogout",true);
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
        onMessagePageLogout:function(){
            this.onLogOut();
        },

        onCreateUser: function (oEvent) {
            var that = this;
            var pass = this.getModel("appView").getProperty('/setNewPass');
            var Conpass = this.getModel("appView").getProperty('/setConPass');
            var oModel = this.getView("appView").getModel("appView");
            var oRouteName = oEvent.getParameter("name") === "userVerify";
            if (pass !== Conpass) {
                MessageToast.show("Password Does not match")
            }
            else {

                var payload = {
                    "email": this.email,
                    "password": Conpass,
                };
                this.middleWare.callMiddleWare("signup/createUser", "POST", payload)
                    .then(function (data, status, xhr) {
                        
                        MessageToast.show("User Register Successful");
                        that.onReject();
                        that.timerText();
                        oModel.setProperty("/messagePageText","Success....");
                        oModel.setProperty("/timerText","Redirecting to the login page in ");
                        oModel.setProperty("/verifyIcon",'sap-icon://message-success');

                    })
                    .catch(function (jqXhr, textStatus, errorMessage) {
                        
                        oModel.setProperty("/messagePageText","Error....");
                        oModel.setProperty("/timerText","R");
                        oModel.setProperty("/verifyIcon",'sap-icon://error');
                        oModel.setProperty("/verifyLogout",true);
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
	});
});