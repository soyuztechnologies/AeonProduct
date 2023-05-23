sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
	"use strict";
	// global variables
	var userId;
	var userRole;
	return BaseController.extend("ent.ui.ecommerce.controller.CustomerProfile", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("Profile").attachPatternMatched(this._matchedHandler, this);
		},

		_matchedHandler: function (oEvent) {
			debugger;
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader", true);
			this.getModel("appView").updateBindings();
			var oPath = oEvent.getParameter("name");
			if(oPath == "Profile"){
				this.getModel('appView').setProperty('/editableFields', false);
				this.getModel('appView').setProperty('/EmailVisible', false);
				this.getModel('appView').setProperty('/updateVisible', false);
			};
			this.getUserRoleData();
			this.getUserData();
			this.getModel("appView").updateBindings();
		},

		getUserData: function () {
			var that = this;
			this.middleWare.callMiddleWare("getUserRole", "get")
				.then(function (data, status, xhr) {
					debugger;
					// MessageToast.show("Data Reading......."+ data.role);
					var omodel = that.getView().getModel("appView").setProperty("/CustomerData", data.role);
					var osimples = that.getView().byId("profile_Id");
					osimples.bindElement("appView>/CustomerData");
					that.getModel('appView').setProperty('/editableFields', false);
					userId = data.role.id;
					userRole = data.role.Role;
					if(userRole == "Admin"){
						that.getModel('appView').setProperty('/Passwordfield', false);
					};
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					debugger;
					that.middleWare.errorHandler(jqXhr, that);
				});
		},

		updateCustomerData: function () {
			debugger;
			var that = this;
			const oModel = this.getView().getModel();
			var datamodel = this.getView().getModel("appView").getProperty("/CustomerData");
			const sEntityPath = `/AppUsers('${userId}')`; // Replace with the appropriate entity set name and ID

			oModel.update(sEntityPath, datamodel, {
				success: function (data) {
					sap.m.MessageToast.show("Customer updated successfully");
					that.getModel('appView').setProperty('/updateVisible', false);
					that.getModel('appView').setProperty('/editVisible', true);
				},
				error: function (error) {
					console.error("PATCH request failed");
				}
			});
		},

		onEditCustomerProfile: function () {
			var that = this;
			this.getModel('appView').setProperty('/editableFields', true);
			this.getModel('appView').setProperty('/updateVisible', true);
			this.getModel('appView').setProperty('/editVisible', false);
		},


	});
});