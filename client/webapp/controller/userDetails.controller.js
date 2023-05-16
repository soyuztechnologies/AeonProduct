sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
	
	
], function (BaseController,MessageToast, JSONModel) {
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