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
		}
	});

});