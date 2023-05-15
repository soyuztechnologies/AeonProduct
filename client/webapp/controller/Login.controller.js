sap.ui.define([
	"./BaseController", "sap/ui/core/Fragment", "sap/m/MessageBox", 'sap/m/MessageToast',
], function (
	BaseController,
	Fragment,
	MessageBox,
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
			// debugger;
			// var oModel = this.getView().getModel();  //default model get at here
			var that = this; 
			var oEmail = this.getView().getModel('appView').getProperty("/Email");
			var payload = {
				"email" : oEmail
			}; 	
			debugger;
			// $.ajax({
			// 	type: 'POST',
			// 	url: 'signup',
			// 	data: {
			// 		email: oEmail,
			// 	},
			// 	success: function (data) {
			// 		MessageToast.show(' Successfully ');
			// 	},
			// 	error: function (xhr, status, error) {
			// 		console.error(error);
			// 		MessageToast.show('Error s');
			// 	}
			// });

			this.middleWare.callMiddleWare("signup", "POST", payload)
				.then( function (data, status, xhr) {
					debugger;
					MessageToast.show("signup  Success");

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					debugger;
					that.middleWare.errorHandler(jqXhr, that);
				});
		},

	});

});