sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function (BaseController ,MessageToast, JSONModel) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.printingDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("printingDetails").attachPatternMatched(this._matchedHandler, this);
			
		},
		_matchedHandler:function(){
			debugger;
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel("appView").setProperty("/visibleHeader",true);
			this.getModel("appView").setProperty("/visibility", true);
			this.getModel("appView").setProperty("/logoutVisibility", true);
			this.getView().getModel("appView").setProperty("/inputEditable",false);
			this.getModel("appView").updateBindings();
			this.loadForm();
			this.loadForm2();

			// this.getJobsData();
		},
		onClickModify:function(){

			this.getView().getModel("appView").setProperty("/inputEditable",true)
		},
		onClickUpdate:function(){
			debugger;
			this.getView().getModel("appView").setProperty("/inputEditable",false);
		},
		loadForm:function(){
			debugger;
			var oSimpleForm = this.getView().byId('SimpleForm-1')
			// oSimpleForm.setModel('appView');
			oSimpleForm.bindElement('appView>/datas');

			
		},
		loadForm2:function(){
			var oSimpleForm2 = this.getView().byId('SimpleForm2');
			oSimpleForm2.bindElement('appView>/datas')
		}
		
		// getJobsData: function() {
		// 	debugger;
		// 	var oModel = this.getView().getModel();  //default model get at here
		// 	var that = this; 
		// 	// Perform the read operation
		// 	oModel.read('/Jobs', {
		// 		success: function(data) {
		// 		// Success callback
		// 		console.log(data);
		// 		MessageToast.show("Data read successfully");
		// 		that.getView().getModel("appView").setProperty("/jobsData",data.results);
		// 		},
		// 		error: function(error) {
		// 		that.middleWare.errorHandler(error, that);
		// 		// MessageToast.show("Error reading data");
		// 		}
		// 	});
		// }
		
	});
});