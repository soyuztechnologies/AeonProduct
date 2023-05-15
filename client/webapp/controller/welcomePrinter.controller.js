sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.welcomePrinter", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("welcomePrinter").attachPatternMatched(this._matchedHandler, this);
		},
		_matchedHandler:function(){
			// var  PrintingId = oEvent.getParameter("arguments").PrintingId;
            // var spath = '/PrintingId/' + PrintingId;
			// var oList = this.getView().byId("idMyList");
            // var aItems = oList.getItems();
            // for (let i = 0; i < aItems.length; i++) {
            //     const element = aItems[i];
            //     if(element.getBindingContextPath()===spath){
            //         var oItemObject = element;
            //         break;
            //     }
            // }
            // oList.setSelectedItem(oItemObject);


			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader",true);
			this.getModel("appView").setProperty("/visibility", true);
			this.getModel("appView").setProperty("/logoutVisibility", true);
			this.getModel("appView").updateBindings();
			this.getJobsData();
		},
		onListItemPress:function(){
			// debugger;
			this.getRouter().navTo("printingDetails");
		},

		getJobsData: function() {
			// debugger;
			var oModel = this.getView().getModel();  //default model get at here
			var that = this; 
			// Perform the read operation
			oModel.read('/Jobs', {
				success: function(data) {
				// Success callback
				MessageToast.show("Data read successfully");
				that.getModel("appView").setProperty("/jobsData",data.results);
				// Handle the retrieved data
				// var aEntities = data.results; // Access the array of retrieved entities
				// ...
				},
				error: function(error) {
				// Error callback
				// that.middleWare.errorHandler(error, that);
				MessageToast.show("Error reading data");
				}
			});
  
			// Ajax  call for get the data 
			// this.middleWare.callMiddleWare("api/Jobs", "GET")
			// .then( function (data) {
			// //   debugger;
			// //   MessageToast.show("Job find successfully");
			//   that.getModel("appView").setProperty("/jobsData",data);
			// })
			// .catch(function (jqXhr, textStatus, errorMessage,error) {
			//   that.middleWare.errorHandler(error, that);
			//   MessageToast.show("Error:");
			// });
		}
	});
});