sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"

], function (BaseController, MessageToast, JSONModel, Fragment, BusyIndicator, MessageBox, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.userDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("dispatchedList").attachPatternMatched(this._matchedHandler, this);
		},

		_matchedHandler: function (oEvent) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/layout", "OneColumn");
			this.getModel('appView').setProperty('/UserRole', "Admin");		//As by user role as admin all sidenavigation - navigation list items will visible.
			this.jobsWithAtleastAttachment();
			this.getCompanyData();
			this.aFilters = [];
			this.getModel("appView").updateBindings();
		},

		getCompanyData: function () {
			var that = this;
			this.middleWare.callMiddleWare("Companies", "GET")
				.then(function (data, status, xhr) {
					let newData = {
						"CompanyName": "None",
						"id": null
					};
					data.unshift(newData);
					that.getView().getModel('appView').setProperty('/CompanyDetails', data);
				}
				)
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
		},


		//Function to find job with atleast 1 attachment
		jobsWithAtleastAttachment: function () {
			var that = this;
			this.middleWare.callMiddleWare("Jobs", "GET")		//Calling Server.js/API endpoint /Jobs
				.then(function (data, status, xhr) {
					if (typeof (data) == 'string') {
						MessageToast.show(data);		//If not getting any job with attachement then server send only response as string.
					} else {
						data.forEach(data => {
							data.date = data.date.split('T')[0]		//Chnage date in DD-MM-YYYY format.
						});
						that.getView().getModel('appView').setProperty('/JobsData', data);		//Data set in model to show in UI in form of table.
					}
					// that.serverPayload(data);		//Send coming data from /Jobs endpoint to function.
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});

		},

		// Function used at only once for finding attachemnets without Job's.
		orphanDemoFunction: function () {
			var that = this;
			this.middleWare.callMiddleWare("orphansDelete", "POST").then(function (data) {
				console.log(data);
			}).catch(function (data) {
				console.log(data);
			});
		},

		// Custumize data accoring to requiremnt.
		// serverPayload : function(data){
		// 	if(data){
		// 		if(typeof(data) == 'string'){
		// 			MessageToast.show(data);		//If not getting any job with attachement then server send only response as string.
		// 		}else{
		// 			data = data.filter(element => element !== null);	//filter the data with null data.
		// 			data.forEach(data =>{
		// 				data.date = data.date.split('T')[0]		//Chnage date in DD-MM-YYYY format.
		// 			});
		// 			this.getView().getModel('appView').setProperty('/jobsData', data);		//Data set in model to show in UI in form of table.
		// 		}
		// 	}

		// },

		// Date Filter function
		onDateRangeChange: function (oEvent) {
			// Get the selected date range
			var sDateRange = oEvent.getSource().getValue().split(" - ");	//split start and end date.
			// if (sDateRange) {
			// 	// var aFilters = [];
			// 	this.aFilters.push(new Filter("date", FilterOperator.BT, sDateRange[0], sDateRange[1]));	//push filter

			// 	// Get the binding of the table and apply the filter
			// 	var oTable = this.getView().byId("idJobTable");
			// 	var oBinding = oTable.getBinding("items");
			// 	oBinding.filter(this.aFilters);		//Filter items acc to selected date
			// } else {
			// 	let index = this.aFilters.findIndex(item => item.sPath === 'date');
			// 	delete this.aFilters[index];
			// }
			if (sDateRange) {
				this.tableFilter("date", FilterOperator.BT, sDateRange[0], sDateRange[1]);
			}
			else {
				this.tableFilter("date", FilterOperator.BT, sDateRange);
			}
		},


		selectedCompany: function (oEvent) {
			let selectedKey = oEvent.getSource().getSelectedKey();
			// var aFilters = [];

			// if (selectedKey) {
			// 	this.aFilters.push(new Filter("companyId", FilterOperator.EQ, selectedKey));
			// } else {
			// 	let index = this.aFilters.findIndex(item => item.sPath === 'companyId');
			// 	delete this.aFilters[index];
			// }
			// // Get the binding of the table and apply the filters
			// var oTable = this.getView().byId("idJobTable");
			// var oBinding = oTable.getBinding("items");
			// oBinding.filter(this.aFilters);	//Filter items acc to job card data

			this.tableFilter("companyId", FilterOperator.EQ, selectedKey);
		},

		// Filter data acc to job card no.
		onSearchCardCode: function (oEvent) {
			var sSearchValue = this.getView().byId('searchField').getValue();
			// var aFilters = [];

			// if (sSearchValue) {
			// 	this.aFilters.push(new Filter("jobCardNo", FilterOperator.Contains, sSearchValue));
			// } else {
			// 	let index = this.aFilters.findIndex(item => item.sPath === 'jobCardNo');
			// 	delete this.aFilters[index];
			// }
			this.tableFilter("jobCardNo", FilterOperator.Contains, sSearchValue);

			// // Get the binding of the table and apply the filters
			// var oTable = this.getView().byId("idJobTable");
			// var oBinding = oTable.getBinding("items");
			// oBinding.filter(this.aFilters);	//Filter items acc to job card data
		},

		// Function triggers on pressing/selecting table row
		rowItemsPressJobs: function (oEvent) {

			var oParameter = oEvent.getParameter('listItem');	//getting selected row item object
			var omodel = this.getView().getModel("appView");
			var sData = oParameter.getBindingContext('appView').getObject();
			let updatedData = this.updateFragmentData(sData);
			omodel.setProperty('/jobsAttachmentData', updatedData)
			var oView = this.getView();
			var that = this;

			omodel.updateBindings();
			this.ojobValidation().then(function (oDialog) {
				oDialog.open();
			});

		},

		// Modifying data acc to fragment send data of row in array to bind with fragment.
		updateFragmentData: function (sData) {
			let aItems = [];
			aItems.push({
				attachmentName: 'Client PO Code',
				attachmentCode: sData.PoAttach
			});
			aItems.push({
				attachmentName: 'Artwork Attchment',
				attachmentCode: sData.artworkCode
			});
			let aInvNos = sData.InvNo;
			let aDeliveryNos = sData.DeliveryNo;
			for (let i = 0; i < aInvNos.length; i++) {
				aItems.push({
					attachmentName: 'Invoice No',
					attachmentCode: aInvNos[i]
				});
			}
			for (let i = 0; i < aDeliveryNos.length; i++) {
				aItems.push({
					attachmentName: 'Delivery No',
					attachmentCode: aDeliveryNos[i]
				});
			}

			return aItems;
		},
		//* This function will open a fragment and shows their attachments
		ojobValidation: function () {
			var oView = this.getView();
			if (!this.jobsvalidatioin) {
				this.jobsvalidatioin = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.jobsHasAttachment",
					controller: this
				}).then(function (oDialog) {
					// Add dialog to view hierarchy
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			return this.jobsvalidatioin;
		},
		onCloseValDialog: function () {
			this.ojobValidation().then(function (oDialog) {
				oDialog.close();
			});
		},

		// Set attachment data and endpoint in form of url for attachment call
		showAttachment: function (oEvent) {
			var dModel = this.getView().getModel();
			var that = this;
			var oData = oEvent.getSource().getBindingContext("appView").getObject();
			var oModel = this.getView().getModel("appView");
			var url = "";

			if (oData.attachmentName == "Client PO Code") {
				var url = `/Attachments('${oData.attachmentCode}')`
				oModel.setProperty("/uploadDocumnetTitle", "Po Attachment");
			}
			if (oData.attachmentName == "Artwork Attchment") {
				var url = `/Attachments('${oData.attachmentCode}')`;
				oModel.setProperty("/uploadDocumnetTitle", "Artwork Attachment");
			}
			if (oData.attachmentName == "Delivery No") {
				var url = `/Attachments('${oData.attachmentCode}')`
				oModel.setProperty("/uploadDocumnetTitle", "Delivery Attachment");
			}
			if (oData.attachmentName == "Invoice No") {
				var url = `/Attachments('${oData.attachmentCode}')`
				oModel.setProperty("/uploadDocumnetTitle", "Invoice Attachment");
			}

			//getting api attachment data
			dModel.read(url, {
				success: function (data) {
					that.getModel("appView").setProperty("/attachmentFiles", data.Attachment);
					that.oDialogOpen().then(function (oDialog) {
						oDialog.open();
					});
				},
				error: function (error) {
					MessageBox.show("Attachment Is Not Attached")
				}
			});


		},

		// Open the dialog to display the attachment in PDF form.
		oDialogOpen: function () {
			var oView = this.getView();
			var that = this;
			if (!this.oUploadDialog) {
				this.oUploadDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.printingDetailFragment.uploadDoc",
					controller: this
				}).then(function (oDialog) {
					// Add dialog to view hierarchy
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));

			}
			return this.oUploadDialog;
		},

		// Close the pdf format.
		onReject: function () {
			this.oDialogOpen().then(function (oDialog) {
				oDialog.close();
			})
		},

		// Function to delete selected attachments
		onDeleteAttachment: function () {
			var that = this;
			let AttachmentDeletion = this.getView().byId('idJobHasAttachment').getSelectedContextPaths();
			if (AttachmentDeletion.length == 0) {
				MessageToast.show("Please select a Attachment to delete");
			} else {
				let payload = [];		//push all the attachents in form attachment table id's
				if (AttachmentDeletion.length > 0) {
					for (let i = 0; i < AttachmentDeletion.length; i++) {
						let data = this.getModel('appView').getProperty(AttachmentDeletion[i]);
						if (data.attachmentName == "Client PO Code") {
							payload.push(data.attachmentCode);
						}
						if (data.attachmentName == "Artwork Attchment") {
							payload.push(data.attachmentCode);
						}
						if (data.attachmentName == "Delivery No") {
							payload.push(data.attachmentCode);
						}
						if (data.attachmentName == "Invoice No") {
							payload.push(data.attachmentCode);
						}
					}
				}
				MessageBox.confirm("Are you sure you want to delete Attachments", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
					onClose: function (sAction) {
						if (sAction === "OK") {
							that.middleWare.callMiddleWare("deleteAttachments", "POST", payload)		//delete attachment api call
								.then(function (data, status, xhr) {
									MessageToast.show(data);
								})
								.catch(function (jqXhr, textStatus, errorMessage) {
									that.middleWare.errorHandler(jqXhr, that);
								});
						}
					}
				});
			}

		},

		tableFilters: {},
		tableFilter: function (filterProperty, operator, value, value2) {
			var oTable = this.getView().byId("idJobTable");
			if (value) {
				if (typeof (value) === 'object') {
					this.tableFilters[filterProperty] = value;
				} else if (filterProperty === 'date') {
					this.tableFilters[filterProperty] = new Filter(filterProperty, operator, value, value2);
				} else {
					this.tableFilters[filterProperty] = new Filter(filterProperty, operator, value);
				}
			} else {
				delete this.tableFilters[filterProperty];
			}
			oTable.getBinding("items").filter(Object.values(this.tableFilters));
		},
	});
});