sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.welcomePrinter", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("welcomePrinter").attachPatternMatched(this._matchedHandler, this);
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
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
			// var oModel = this.getView().getModel();  //default model get at here
			var that = this; 

			// Odata call for get the data 
			this.middleWare.callMiddleWare("api/Jobs", "GET")
			.then( function (data) {
			//   debugger;
			//   MessageToast.show("Job find successfully");
			  that.getModel("appView").setProperty("/jobsData",data);

			  // Create a JSON model with the data
			//   var jobsModel = new JSONModel(data);
			//   // Set the model to the view
			//   that.getView().setModel(jobsModel, "jobsModel");
			//   // Bind the list items to the model
			//   var list = that.getView().byId("listId"); // Replace 'listId' with the ID of your list control
			//   list.bindItems({
			// 	path: "jobsModel", // Replace 'jobsModel' with the name you assigned to the model
			// 	template: new sap.m.ObjectListItem({
			// 	  title: "{jobsModel>/title}" // Replace 'title' with the corresponding property name in your data
			// 	})
			//   });

			//   that.getView().getModel("jobsModel").refresh(true);
			  
			})
			.catch(function (jqXhr, textStatus, errorMessage,error) {
			  that.middleWare.errorHandler(error, that);
			  MessageToast.show("Error:");
			});
		}
	});
});