sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function ( BaseController, JSONModel, Fragment) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.userVerify", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("userVerify").attachPatternMatched(this._matchedHandler, this);
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getModel("appView").setProperty("/visibility", false);
            this.getModel("appView").setProperty("/logoutVisibility", false);
            this.getModel("appView").setProperty("/hamburgerVisibility", false);
			this.getModel("appView").setProperty("/visibleHeader",true);
			this.getModel("appView").updateBindings();
            this.timerText();
		},

        loadFragment:function(){
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
                // that.onRefresh(/);
                
                // that.getView().getModel('local').refresh();
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