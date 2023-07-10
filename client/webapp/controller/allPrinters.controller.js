sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"sap/ui/core/Fragment",
	"sap/ui/core/library",
	"sap/ui/core/date/UI5Date",
	'sap/ui/export/Spreadsheet'

], function (BaseController, JSONModel, MessageToast, BusyIndicator, Filter, FilterOperator, Fragment,CoreLibrary,UI5Date, Spreadsheet) {
	"use strict";
	var ValueState = CoreLibrary.ValueState;
	return BaseController.extend("ent.ui.ecommerce.controller.allPrinters", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("allPrinters").attachPatternMatched(this._matchedHandler, this);
			this.oViewSettingsDialog = sap.ui.xmlfragment("ent.ui.ecommerce.fragments.allPrinterScreenFragment.Jobstatuspopup", this);
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
					that.getJobsDataByCompanyFilter();
					// that.getCompanyName();
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
			this.getCompanyName();
			// this.getUserName();
			// this.getJobAccordingCustomer();
		},

		// * this function will redirect the data of the job to the details page.
		onListItemPress: function (oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			var datassss = this.getView().getModel("appView").getProperty(sPath);
			this.getView().getModel("appView").setProperty('/datas', datassss);
			this.getView().getModel("appView").setProperty('/jobId', datassss.jobCardNo);
			
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


		// getJobsData: function () {
		// 	var sUserRole = this.getView().getModel('appView').getProperty('/UserRole');
		// 	// if (sUserRole === "Admin") {
		// 		var sPath = `/Jobs`
		// 	// }
		// 	// else{

		// 	// 	var id =this.getView().getModel('appView').getProperty('/appUserId');
		// 	// 	// var id = this.getView().getModel('appView').getProperty('/appUserId');
		// 	// 	sPath = `/AppUsers('${id}')/job`;
		// 	// }
		// 	var that = this;
		// 	var oModel = this.getView().getModel();
		// 	oModel.read(sPath, {
				// urlParameters: {
				// 	"$expand": "appUser"
				// },
		// 		success: function (data) {
		// 			that.getView().getModel("appView").setProperty("/jobsData", data.results);
		// 			// MessageToast.show("Jobs Data Successfully Uploded");
		// 		},
		// 		error: function (error) {
		// 		  // Error callback
		// 		//   that.middleWare.errorHandler(error, that);
		// 		  MessageToast.show("Error reading data");
		// 			// Error callback
		// 			//   that.middleWare.errorHandler(error, that);
		// 			// MessageToast.show("Error reading data");
		// 		}
		// 	});
		// },

		onViewSettingsCancel: function () {
			var oTable = this.getView().byId("idListAllPrinters");
			var oBinding = oTable.getBinding("items");
			oBinding.filter([]);
		},

		//* this function is getting the userName into the Select dialog box.
		getUserName: function (oEvent) {
            
			var oModel = this.getView().getModel("appView");
			var oSelectedItem = oEvent.getParameter("value");
			oModel.setProperty("/Username", oSelectedItem);
			console.log("Selected User ID:", oSelectedItem);
		},

		//* this fcuntion is working to search the data into the allPrinters screen.
		onSearchJob: function (oEvent) {
			
			var sValue = oEvent.getParameter("query");
			if (!sValue) {
				var sValue = oEvent.getParameter("newValue")
			}
			var oFilter1 = new Filter("jobCardNo", FilterOperator.Contains, sValue);
			var oFilter2 = new Filter("nameOFTheProduct", FilterOperator.Contains, sValue);
			var oFilter3 = new Filter("jobCode", FilterOperator.Contains, sValue);
			var oFilter4 = new Filter("Company/CompanyName", FilterOperator.Contains, sValue);
			// var oFilter4 = new Filter("userName", FilterOperator.Contains, sValue);
			// var oFilter5 = new Filter("LastName", FilterOperator.Contains, sValue);
			var aFilters = [oFilter1, oFilter2, oFilter3, oFilter4];
			var oFilter = new Filter({
				filters: aFilters,
				and: false
			});
			var oList = this.getView().byId("idListAllPrinters");
			var oBinding = oList.getBinding("items");
			oBinding.filter(oFilter);
		},
       // this function filter the job by company id and also send job as to spacific user
       getJobsDataByCompanyFilter: function(){
		
		var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
		var id = this.getModel('appView').getProperty('/UserId');
		var payLoad = {
			id,
		}
		var oFilter = encodeURIComponent('{"where":{"CompanyId":{"neq": null}}}');
		var url = 'api/Jobs?filter='+oFilter
		// sPath = `/Jobs('${id}')/Company`;
		var that = this;
		if(sUserRole === "Customer"){
			this.middleWare.callMiddleWare("JobsCustomer", "POST" , payLoad)
			.then(function (data, status, xhr) {
			  debugger;
			  that.getView().getModel("appView").setProperty("/jobsData", data);						
		  })
			.catch(function (jqXhr, textStatus, errorMessage) {
			  that.middleWare.errorHandler(jqXhr, that);
			});
		}else{

			this.middleWare.callMiddleWare("getJobsWithCompany", "get")
			.then(function (data, status, xhr) {
				that.getView().getModel("appView").setProperty("/jobsData", data);
				// that.getJobStatus();
				// var jobData = 
				// for (let i = 0; i < data.length; i++) {
				//   const element = data[i].jobCardNo;
				//   jobData.push(element)
				// }
				// that.getView().getModel("appView").setProperty("/jobsId", data);
			})
			.catch(function (jqXhr, textStatus, errorMessage) {
				that.middleWare.errorHandler(jqXhr, that);
			});
		}
	   },
	   getJobStatus:function(){
				
		var oModel = this.getView().getModel();
		var that = this;
		const sEntityPath = `/JobStatus`;
		oModel.read(sEntityPath,{
			success: function (data) {
				// MessageToast.show("success")
				// that.getJobsDataByCompanyFilter();
				that.getView().getModel("appView").setProperty("/allJobStatus", data.results);
			},

			error: function (error) {
				// Error callback
				that.middleWare.errorHandler(error, that);
				// MessageToast.show("Something is Wrong");
			}
		});
	   },


	   
	onPressExportData: function () {	
	this.exportData();
	},
	exportData: function () {
		var oView = this.getView();
		var that = this;
		if (!this.oExportData) {
			this.oExportData = Fragment.load({
				id: oView.getId(),
				name: "ent.ui.ecommerce.fragments.allPrinterScreenFragment.ExportExcel",
				controller: this
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				return oDialog;
			}.bind(this));
		}
		this.oExportData.then(function (oDialog) {
			oDialog.open();
		});
	},
	onReject: function () {
		this.oExportData.then(function (oDialog) {
			oDialog.close();
		})
	},
	handleChange: function (oEvent) {
		debugger;
		var selectedFromDate = oEvent.getParameter("from");
		var selectedtoDate = oEvent.getParameter("to");
		// const formattedDate = selectedDate.toISOString().split('T')[0];
		this.getView().getModel("appView").setProperty("/selectedDate",selectedFromDate)
		this.getView().getModel("appView").setProperty("/selectedFromDate",selectedFromDate)
		this.getView().getModel("appView").setProperty("/selectedToDate",selectedtoDate)
	},
	// formatDate: function (){
	// 	var date = this.getView().getModel("appView").getProperty("/selectedDate")
	// 	// const dates = date.split(" - ");
	// 	// var dateString = dates[0];	
	// },
	selectCompanyName : function (oEvent) {
		debugger
		var selectedCompanyName = oEvent.getSource().getSelectedItem().getKey();
		this.getView().getModel("appView").setProperty("/selectedCompanyName",selectedCompanyName);
	},
	onSubmit:function(){
		debugger;
		// this.formatDate();
		var that = this
		var startDate = this.getView().getModel("appView").getProperty("/selectedFromDate")
		var endDate = this.getView().getModel("appView").getProperty("/selectedToDate")
		var company = this.getView().getModel("appView").getProperty("/selectedCompanyName");
		// const dates = date.split(" - ");
		// var startDate = dates[0];
		// var endDate = dates[1];
		
		var payload = {
			"CreatedOnStart":startDate,
			"CreatedOnEnd":endDate,
			"cId": company
		}
		this.middleWare.callMiddleWare("selectedDateJobStatus", "POST" , payload)
			.then(function (data, status, xhr) {
			  debugger;
			  that.getView().getModel("appView").setProperty("/jobStatusDate", data);	
			  that.onExport();					
		  })
			.catch(function (jqXhr, textStatus, errorMessage) {
			  that.middleWare.errorHandler(jqXhr, that);
			});
	},
	createColumnConfig: function() {
		return [
			{
				label: 'Job Card No.',
				property: 'JobStatusId',
				scale: 0
			},
			{
				label: 'Raw Material',
				property: 'rawMaterial',
				width: '25'
			},
			{
				label: 'Printing',
				property: 'Printing',
				width: '25'
			},
			{
				label: 'Coating',
				property: 'Coating',
				width: '25'
			},
			{
				label: 'Inc No.',
				property: 'InvNo',
				width: '25'
			},
			{
				label: 'Foiling',
				property: 'Foiling',
				width: '18'
			},
			{
				label: 'Embossing',
				property: 'Embossing',
				width: '18'
			},
			{
				label: 'Pasting',
				property: 'Pasting',
				width: '18'
			},
			{
				label: 'SpotUV',
				property: 'spotUV',
				width: '18'
			},
			{
				label: 'Punching',
				property: 'Punching',
				width: '18'
			},
			{
				label: 'Packing',
				property: 'Packing',
				width: '18'
			},
			{
				label: 'No. Of Box Per Pieces',
				property: 'noOfBoxPerPieces',
				width: '18'
			},
			{
				label: 'No Of Pieces To Send',
				property: 'noOfPiecesToSend',
				width: '18'
			},
			
			];
	},

	onExport: function() {
		debugger
		var aCols, oBinding, oSettings, oSheet, oTable,data;
		var newArr = [];

		oTable = this.byId('exportTable');
		data = this.getView().getModel("appView").getProperty("/jobStatusDate");

		for(var i =0 ; i<data.length;i++){
			oBinding = data[i].JobStatus;
			aCols = this.createColumnConfig();
			
			oSettings = {
				workbook: { columns: aCols },
				dataSource: oBinding,
				// __filename : oBinding.jobCardNo
			};
			
			
		}
			// newArr.push(oSheet);
			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then(function() {
					MessageToast.show('Spreadsheet export has finished');
				}).finally(function() {
					oSheet.destroy();
				});
		}



});

});
	// //  At here we are getting  the company Name. 
	// 		getCompanyName: function () {
	// 			debugger;
	// 			// var ids = oEvent.getSource().getBindingContext("appView").getObject().id;
	// 			var oModel = this.getView().getModel();
	// 			var id = "033";
	// 			var that = this;
	// 			oModel.read(`/Jobs('${id}')/Company`, {
	// 				// urlParameters: {
	// 				// 	"$expand": "company"
	// 				// },
	// 				success: function (data) {
	// 					that.getView().getModel("appView").setProperty("/companyName", data.CompanyName);
	// 				},
	// 				error: function (error) {
	// 				that.middleWare.errorHandler(error, that);
	// 				MessageToast.show("Error reading data");
	// 				}
	// 			});
	// 		},

	//    getJobAccordingCustomer : function(){
	// 	
	// 	// step1. get the id property and set into one variable;
	// 	var id = this.getModel('appView').getProperty('/UserId');
	// 	var payLoad = {
	// 		id,
	// 	}
	// 	// step 2 : make a  middleware call
	// 	this.middleWare.callMiddleWare("JobsCustomer", "POST" , payLoad)
    //       .then(function (data, status, xhr) {
	// 		
	// 		that.getView().getModel("appView").setProperty("/jobsAccordingCustomer", data);						
	// 	})
    //       .catch(function (jqXhr, textStatus, errorMessage) {
    //         that.middleWare.errorHandler(jqXhr, that);
    //       });
	// 	// send the payload to backend 
	// 	// check into the node debugger
	// 	// if the call hits or not.
	// 	// if hit then check the appuser is similar to the login user.
	// 	// if user found then update the call in server for finding jobs.
	//    },

// 	});
// });