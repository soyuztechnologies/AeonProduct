sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, MessageToast, BusyIndicator, Filter, FilterOperator, Fragment) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.allPrinters", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("allPrinters").attachPatternMatched(this._matchedHandler, this);
			this.oViewSettingsDialog = sap.ui.xmlfragment("ent.ui.ecommerce.fragments.Jobstatuspopup", this);
			this.getView().addDependent(this.oViewSettingsDialog);
		},

		// * root match handler function.
		_matchedHandler: function (oEvent) {
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader", true);
			this.getModel("appView").setProperty("/visibility", true);
			this.getModel("appView").setProperty("/logoutVisibility", true);
			this.getModel("appView").updateBindings();
			this.getUserRoleData();
			this.getJobsData();
			// this.getUserName();
		},

		// * this function will redirect the data of the job to the details page.
		onListItemPress: function (oEvent) {
			
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			var datassss = this.getView().getModel("appView").getProperty(sPath);
			// if(datassss.status==="In-Progress"){
			// 	this.getView().getModel("appView").setProperty('/addJobStatusVis', true);
			// 	this.getView().getModel("appView").setProperty('/modifybtnvis', true);
			// }
			// else{
			// 	this.getView().getModel("appView").setProperty('/addJobStatusVis', false);
			// 	this.getView().getModel("appView").setProperty('/modifybtnvis', false);
			// }
			
			this.getView().getModel("appView").setProperty('/datas', datassss);
			this.getView().getModel("appView").setProperty('/jobId', datassss.jobCardNo);
			this.getModel("appView").updateBindings();
			this.getRouter().navTo("printingDetails", {
				jobId: datassss.jobCardNo
			});
			
		},


		// * this fucntion will get the list of the all jobs in the allPrinters screen.
		getJobsData: function () {
			
			BusyIndicator.show(0);
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			// Perform the read operation
			oModel.read("/Jobs", {
				urlParameters: {
					"$expand" : 'appUser'
				},
				success: function (data) {
					that.getView().getModel("appView").setProperty("/jobsData", data.results);
					BusyIndicator.hide();
				},
				error: function (error) {
					MessageToast.show("Error reading data");
					BusyIndicator.hide();
				}
			});
			
			// BusyIndicator.show(0);
			// var oModel = this.getView().getModel();  //default model get at here
			// var that = this;
			// var sEntitySet = "/Jobs";
			// var sProperties = "JobId, Title, Description, appUser/Name";

            // var sExpand = "appUser";
            // var sUrl = sEntitySet + "?$select=" + sProperties + "&$expand=" + sExpand;
			
			// oModel.read(sUrl, {
			// 	success: function (data) {
			// 		that.getView().getModel("appView").setProperty("/jobsData", data.results);
			// 		BusyIndicator.hide();
			// 	},
			// 	error: function (error) {
			// 		MessageToast.show("Error reading data");
			// 		BusyIndicator.hide();
			// 	}
			// });

		},

		onAfterRendering: function () {
			this.getJobsData();
		},

		onFilterPressJobStatus: function () {
			
			this.oViewSettingsDialog.open();
		},

		onViewSettingsConfirm: function (oEvent) {
			
			var aFilterItems = oEvent.getParameter("filterItems");
			if (aFilterItems.length > 0) {
				var oTable = this.getView().byId("idListAllPrinters");
				var oBinding = oTable.getBinding("items");
				var aFilters = [];
				aFilterItems.forEach(function (oFilterItem) {
					var sKey = oFilterItem.getKey();
					var oFilter = new Filter("status", FilterOperator.EQ, sKey);
					aFilters.push(oFilter);
				});
				oBinding.filter(aFilters);
			}else{
				this.onViewSettingsCancel();
			}
		},
		
		onViewSettingsCancel: function () {
			var oTable = this.getView().byId("idListAllPrinters");
			var oBinding = oTable.getBinding("items");
			oBinding.filter([]);
		},

		//* this function is getting the userName into the Select dialog box.
		getUserName: function(oEvent){
        
		var oModel = this.getView().getModel("appView");
          var oSelectedItem = oEvent.getParameter("value");
           oModel.setProperty("/Username",oSelectedItem);
            // console.log("Selected User ID:", oSelectedItem);
	    },

		// * this fcuntion is working to search the data into the allPrinters screen.
		onSearchJob: function (oEvent) {
			var sValue = oEvent.getParameter("query");
			if (!sValue) {
			    var sValue = oEvent.getParameter("newValue")
			}
			var oFilter1= new Filter("jobCardNo", FilterOperator.Contains, sValue);
			var oFilter2= new Filter("nameOFTheProduct", FilterOperator.Contains, sValue);
			var oFilter3= new Filter("UserName", FilterOperator.Contains, sValue);
			var aFilter = [oFilter1, oFilter2, oFilter3];
			var oFilter = new Filter({
			    filters: aFilter,
			    and: false
			});
			this.getView().byId("idListAllPrinters").getBinding("items").filter(oFilter);
		},


	});
});