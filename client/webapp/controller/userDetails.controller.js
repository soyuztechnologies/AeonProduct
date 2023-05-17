sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
	
], function (BaseController,MessageToast, JSONModel,Fragment) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.userDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("userDetails").attachPatternMatched(this._matchedHandler, this);
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader",true);
			this.getModel("appView").updateBindings();
		},
		AddUserDialog : function(){
			MessageToast.show("this add user function is in under Progress.....🙂")
			// var oView = this.getView();
            // var that = this;

            // if (!this.ouserDialog) {
            //     this.ouserDialog = Fragment.load({
            //         id: oView.getId(),
            //         name: "ent.ui.ecommerce.fragments.CompanyDetails",
            //         controller: this
            //     }).then(function (ouserDialog) {
            //         // Add dialog to view hierarchy
            //         oView.addDependent(ouserDialog);
            //         return ouserDialog;
            //     }.bind(this));

            // }
            // this.ouserDialog.then(function (ouserDialog) {
            //     ouserDialog.open();
            // });
		},
		getUserData:function(){
			debugger;
			var oModel = this.getView().getModel();  //default model get at here
			var that = this; 
			// Perform the read operation
			oModel.read('/AppUsers', {
				success: function(data) {
				// Success callback
				MessageToast.show("Data read successfully");
				that.getView().getModel("appView").setProperty("/userDetails",data.results);
				// Handle the retrieved data
				// var aEntities = data.results; // Access the array of retrieved entities
				// ...
				},
				error: function(error) {
				// Error callback
				that.middleWare.errorHandler(error, that);
				MessageToast.show("Error reading data");
				}
			});
		}
		
	});
});