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
		_matchedHandler: function (oEvent) {
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


			// var oShift = oEvent.getParameter("arguments").oShift;
			// var sPath = '/printingDetails/' + oShift;
			// var oList = this.getView().byId("idWelcomeP");
			// debugger;
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader", true);
			this.getModel("appView").setProperty("/visibility", true);
			this.getModel("appView").setProperty("/logoutVisibility", true);
			this.getModel("appView").updateBindings();
			this.getUserRoleData();
			this.getJobsData();
			// this.getUserName();
			

		},
		onListItemPress: function (oEvent) {
			debugger;
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			// var oAppcon = this.getView().getParent();
			// var oV2 = oAppcon.getPages()[0];
			// oV2.bindElement(sPath);

			var datassss = this.getView().getModel("appView").getProperty(sPath);
			debugger;
			this.getView().getModel("appView").setProperty('/datas', datassss);
			this.getView().getModel("appView").setProperty('/jobId', datassss.jobCardNo);
			this.getModel("appView").updateBindings();
			this.getRouter().navTo("printingDetails", {
				jobId: datassss.jobCardNo
			});
			debugger;
			// this.getRouter().navTo("printingDetails");
		},

		getJobsData: function () {
			debugger;
			BusyIndicator.show(0);
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			// Define the entity set and properties you want to retrieve
			var sEntitySet = "/Jobs";
			var sProperties = "JobId, Title, Description, appUser/Name";

			// Build the expand query option
            var sExpand = "appUser";
			// Build the request URL with the entity set, properties, and expand option
            var sUrl = sEntitySet + "?$select=" + sProperties + "&$expand=" + sExpand;
			
			// Perform the read operation
			oModel.read(sUrl, {
				success: function (data) {
					// Success callback
					// MessageToast.show("Data read successfully");
					that.getView().getModel("appView").setProperty("/jobsData", data.results);
					BusyIndicator.hide();
					// Handle the retrieved data
					// var aEntities = data.results; // Access the array of retrieved entities
					// ...
				},
				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
					BusyIndicator.hide();
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
		getUserName: function(oEvent){
        debugger;
		var oModel = this.getView().getModel("appView");
          var oSelectedItem = oEvent.getParameter("value");
           oModel.setProperty("/Username",oSelectedItem);
            console.log("Selected User ID:", oSelectedItem);
	    },		
	    onViewSettingsCancel: function () {
			var oTable = this.getView().byId("idListAllPrinters");
			var oBinding = oTable.getBinding("items");
			oBinding.filter([]);
		},
		onSearchJob: function (oEvent) {
			//here have to take search value from searchField
			var sValue = oEvent.getParameter("query");
			//for live change we need to fire if condition
			if (!sValue) {
			    var sValue = oEvent.getParameter("newValue")
			}
			//now we have to create a filter for the search value so that the ui can understand what we want
			// var oFilter1 = new Filter("PRODUCT_ID", FilterOperator.Contains, sValue);
			var oFilter1= new Filter("jobCardNo", FilterOperator.Contains, sValue);
			var oFilter2= new Filter("nameOFTheProduct", FilterOperator.Contains, sValue);
			var oFilter3= new Filter("UserName", FilterOperator.Contains, sValue);
			// var oFilter3 = new Filter("price", FilterOperator.Contains, sValue);
			// var oFilter4 = new Filter("status", FilterOperator.Contains, sValue);
			var aFilter = [oFilter1, oFilter2, oFilter3];
			//so for searching 2 items together so we have to do this
			var oFilter = new Filter({
			    filters: aFilter,
			    and: false
			});
			//now we have to bind the items in list control
			this.getView().byId("idListAllPrinters").getBinding("items").filter(oFilter);
		}
	});
});