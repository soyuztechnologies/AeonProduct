sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"sap/ui/core/Fragment",

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
		_matchedHandler: async function (oEvent) {

			var that = this;
			await this.getUserRoleData().then(
				function (data) {
					var role = data.role.Role
					that.getView().getModel('appView').setProperty('/UserRole', role);
					that.getView().getModel('appView').setProperty('/appUserId', data.role.id);
					that.getView().getModel('appView').setProperty('/UserEmail', data.role.EmailId);
					that.userRole();
					that.getJobsData();
				},
				function (oErr) {
					that.middleWare.errorHandler(jqXhr, that);
				}
			);
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader", true);
			this.getModel("appView").setProperty("/visibility", true);
			this.getModel("appView").setProperty("/logoutVisibility", true);
			this.getModel("appView").updateBindings();
			// this.getUserName();
		},

		// * this function will redirect the data of the job to the details page.
		onListItemPress: function (oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			var datassss = this.getView().getModel("appView").getProperty(sPath);
			this.getView().getModel("appView").setProperty('/datas', datassss);
			this.getView().getModel("appView").setProperty('/jobId', datassss.jobCardNo);
			debugger;
			this.getModel("appView").updateBindings();
			this.getRouter().navTo("printingDetails", {
				jobId: datassss.jobCardNo

			});

		},


		// * this fucntion will get the list of the all jobs in the allPrinters screen.
		// getJobsData: function () {
		// 	BusyIndicator.show(0);
		// 	var oModel = this.getView().getModel();  //default model get at here
		// 	var that = this;
		// 	// Perform the read operation
		// 	oModel.read("/Jobs", {
		// 		urlParameters: {
		// 			"$expand" : 'appUser'
		// 		},
		// 		success: function (data) {
		// 			that.getView().getModel("appView").setProperty("/jobsData", data.results);
		// 			BusyIndicator.hide();
		// 		},
		// 		error: function (error) {
		// 			MessageToast.show("Error reading data");
		// 			BusyIndicator.hide();
		// 		}
		// 	});

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

		// },

		onAfterRendering: function () {
			// this.getJobsData();
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
			} else {
				this.onViewSettingsCancel();
			}
		},


		getJobsData: function () {
			var sUserRole = this.getView().getModel('appView').getProperty('/UserRole');
			if (sUserRole === "Admin") {
				var sPath = `/Jobs`
			} else {

				var id = this.getView().getModel('appView').getProperty('/appUserId');
				sPath = `/AppUsers('${id}')/job`;
			}
			var that = this;
			var oModel = this.getView().getModel();
			this.middleWare.callMiddleWare("getJobsData", "get").then(function (data, status, xhr) {
				that.getView().getModel("appView").setProperty("/jobsData", data);
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
			  that.middleWare.errorHandler(jqXhr, that);
			});
		},

		onViewSettingsCancel: function () {
			var oTable = this.getView().byId("idListAllPrinters");
			var oBinding = oTable.getBinding("items");
			oBinding.filter([]);
		},

		//* this function is getting the userName into the Select dialog box.
		getUserName: function (oEvent) {
            debugger;
			var oModel = this.getView().getModel("appView");
			var oSelectedItem = oEvent.getParameter("value");
			oModel.setProperty("/Username", oSelectedItem);
			console.log("Selected User ID:", oSelectedItem);
		},

		// * this fcuntion is working to search the data into the allPrinters screen.
		onSearchJob: function (oEvent) {
			debugger;
			var sValue = oEvent.getParameter("query");
			if (!sValue) {
				var sValue = oEvent.getParameter("newValue")
			}
			var oFilter1 = new Filter("jobCardNo", FilterOperator.Contains, sValue);
			var oFilter2 = new Filter("nameOFTheProduct", FilterOperator.Contains, sValue);
			var oFilter3 = new Filter("status", FilterOperator.Contains, sValue);
			var oUserNameFilter = new Filter({
				path: "UserName",
				operator: sap.ui.model.FilterOperator.Contains,
				value1: sValue
			  });
			
			  var oFullNameFilter = new Filter({
				filters: [
				  new Filter("FirstName", FilterOperator.Contains, sValue),
				  new Filter("LastName", FilterOperator.Contains, sValue)
				],
				and: false
			  });
			// var oFilter4 = new Filter("userName", FilterOperator.Contains, sValue);
			// var oFilter5 = new Filter("LastName", FilterOperator.Contains, sValue);
			var aFilters = [oFilter1, oFilter2, oFilter3, oUserNameFilter, oFullNameFilter];
			// var oFilter = new Filter({
			// 	filters: aFilter,
			// 	and: false
			// });
			var oCombinedFilter = Filter(aFilters, false);
			var oList = this.getView().byId("idListAllPrinters");
			var oBinding = oList.getBinding("items");
			oBinding.filter(oCombinedFilter);
		},


	});
});