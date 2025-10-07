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
			let defaultselectedValues = ['Client_PO', 'Artwork', 'Delivery_No', 'Invoice_No']
			var oAppViewModel = this.getOwnerComponent().getModel('appView');
			if (oAppViewModel) {
				oAppViewModel.setProperty('/defaultAttachmentTypes', defaultselectedValues);
			} else {
				console.error("appView model not found!");
			}

			var today = new Date();
            var startDate = new Date();
            startDate.setMonth(today.getMonth() - 3);

            var formatDate = function(date) {
                var d = date.getDate().toString().padStart(2, '0');
                var m = (date.getMonth() + 1).toString().padStart(2, '0');
                var y = date.getFullYear();
                return y + "-" + m + "-" + d;
            };

            this._sDefaultStartDate = formatDate(startDate);
            this._sDefaultEndDate = formatDate(today);

            // Set default value in DateRangeSelection
            var oDateRange = this.byId("dateRangeSelector");
            if (oDateRange) {
                oDateRange.setValue(this._sDefaultStartDate + " - " + this._sDefaultEndDate);
            }													
		},

		_matchedHandler: function (oEvent) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/layout", "OneColumn");
			this.getModel('appView').setProperty('/UserRole', "Admin");		//As by user role as admin all sidenavigation - navigation list items will visible.
			// this.jobsWithAtleastAttachment();
			this.getCompanyData();
			this.aFilters = [];
			this.getModel("appView").updateBindings();
			var that = this;
			this.getUserRoleData().then((data) => {
				that.getView().getModel('appView').setProperty('/UserEmail', data.role.EmailId);
			});
			this.selectAttachmentType();
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
		jobsWithAtleastAttachment: function (url) {
			var that = this;
			this.middleWare.callMiddleWare(url, "GET")		//Calling Server.js/API endpoint /Jobs
				.then(function (data, status, xhr) {
					if (typeof (data) == 'string') {
						that.getView().getModel('appView').setProperty('/JobsData', [])
						that.getView().getModel('appView').setProperty('/countJobsAttachment', '');
						that.getModel('appView').setProperty('/currentItems', '');
						MessageToast.show(data);		//If not getting any job with attachement then server send only response as string.
					} else {
						data.forEach(data => {
							data.date = data.date.split('T')[0]		//Chnage date in DD-MM-YYYY format.
						});
						that.getView().getModel('appView').setProperty('/JobsData', data);		//Data set in model to show in UI in form of table.
						that.getView().getModel('appView').setProperty('/countJobsAttachment', data.length);
						that.getModel('appView').setProperty('/currentItems', data.length);
					}
					// that.serverPayload(data);		//Send coming data from /Jobs endpoint to function.

					var oDateRange = that.byId("dateRangeSelector");
                    if (oDateRange) {
                        that.onDateRangeChange({ getSource: () => oDateRange });
                    }
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});

		},

		selectAttachmentType: function (oEvent) {
			var that = this;
			
			if(!oEvent){
				var selectedValues = this.getView().getModel('appView').getProperty('/defaultAttachmentTypes')
				var queryParam = selectedValues.join(','); 
				var url = "Jobs?selectedValues=" + encodeURIComponent(queryParam);
				this.showAttachmentTypes(selectedValues)
			}
			if(oEvent){
				var selectedItems = oEvent.getParameter("selectedItems");
   				var selectedValues = selectedItems.map(item => item.getText());
				this.getView().getModel('appView').setProperty('/defaultAttachmentTypes', selectedValues)
				var queryParam = selectedValues.join(','); 
				var url = "Jobs?selectedValues=" + encodeURIComponent(queryParam);
				this.showAttachmentTypes(selectedValues)
			}
			this.jobsWithAtleastAttachment(url)
			if(selectedValues.length === 0){
				MessageToast.show('Please select atleast one attachment type')
			}
		},

		showAttachmentTypes: function(data) {
			var defaultSelectedTypes = {
				'Client_PO' : false,
				'Artwork' : false,
				'Delivery_No' : false,
				'Invoice_No' : false
			}
			data.forEach(function(value) {
				if (value === 'Client PO' || value === 'Client_PO') {
					defaultSelectedTypes['Client_PO'] = true;
				} else if (value === 'Artwork') {
					defaultSelectedTypes['Artwork'] = true;
				} else if (value === 'Delivery No' || value === 'Delivery_No') {
					defaultSelectedTypes['Delivery_No'] = true;
				} else if (value === 'Invoice No' || value === 'Invoice_No') {
					defaultSelectedTypes['Invoice_No'] = true;
				}
			});
			this.getView().getModel('appView').setProperty('/selectedAttachmentTypes', defaultSelectedTypes)
		},

		// Function used at only once for finding attachemnets without Job's.
		// orphanDemoFunction: function () {
		// 	var that = this;
		// 	this.middleWare.callMiddleWare("orphansDelete", "POST").then(function (data) {
		// 		console.log(data);
		// 		MessageBox.show('Orphans : ' + data);
		// 	}).catch(function (data) {
		// 		console.log(data);
		// 	});
		// },

		// Date Filter function
		// onDateRangeChange: function (oEvent) {
		// 	// Get the selected date range
		// 	var sDateRange = oEvent.getSource().getValue().split(" - ");
		// 	if (sDateRange) {
		// 		this.tableFilter("date", FilterOperator.BT, sDateRange[0], sDateRange[1]);
		// 	}
		// 	else {
		// 		this.tableFilter("date", FilterOperator.BT, sDateRange);
		// 	}
		// },

		 onDateRangeChange: function(oEvent) {
            var oDateRange = oEvent.getSource();
            var sDateRange = oDateRange.getValue().split(" - ");

            // If empty or invalid, use default last 3 months
            if (!sDateRange[0] || !sDateRange[1]) {
                oDateRange.setValue(this._sDefaultStartDate + " - " + this._sDefaultEndDate);
                this.tableFilter("date", FilterOperator.BT, this._sDefaultStartDate, this._sDefaultEndDate);
            } else {
                // User selected a date → overwrite previous filter
                this.tableFilter("date", FilterOperator.BT, sDateRange[0], sDateRange[1]);
            }
        },

		// Company Filter
		selectedCompany: function (oEvent) {
			let selectedKey = oEvent.getSource().getSelectedKey();
			this.tableFilter("companyId", FilterOperator.EQ, selectedKey);
		},

		// Filter data acc to job card no.
		onSearchCardCode: function (oEvent) {
			var sSearchValue = this.getView().byId('searchField').getValue();
			sSearchValue = sSearchValue.split(',');
			this.tableFilter("jobCardNo", FilterOperator.Contains, sSearchValue);
		},

		// Function triggers on pressing/selecting table row
		rowItemsPressJobs: function (oEvent) {
			var oParameter = oEvent.getParameter('listItem');	//getting selected row item object
			var omodel = this.getView().getModel("appView");
			var sData = oParameter.getBindingContext('appView').getObject();
			let updatedData = this.updateFragmentData(sData);
			omodel.setProperty('/currentJobCardNo', sData.jobCardNo);
			omodel.setProperty('/jobsAttachmentData', updatedData);
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
			sData.PoAttach && aItems.push({
				attachmentName: 'Client_PO Code',
				attachmentCode: sData.PoAttach
			});
			sData.artworkCode && aItems.push({
				attachmentName: 'Artwork Attchment',
				attachmentCode: sData.artworkCode
			});
			let aInvNos = sData.InvNo && sData.InvNo;
			let aDeliveryNos = sData.DeliveryNo && sData.DeliveryNo;
			if(aInvNos) {
				for (let i = 0; i < aInvNos.length; i++) {
					aItems.push({
						attachmentName: 'Invoice_No',
						attachmentCode: aInvNos[i]
					});
				}
			}
			if(aDeliveryNos){
				for (let i = 0; i < aDeliveryNos.length; i++) {
					aItems.push({
						attachmentName: 'Delivery_No',
						attachmentCode: aDeliveryNos[i]
					});
				}
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

			if (oData.attachmentName == "Client_PO Code") {
				var url = `/Attachments('${oData.attachmentCode}')`
				oModel.setProperty("/uploadDocumnetTitle", "Po Attachment");
			}
			if (oData.attachmentName == "Artwork Attchment") {
				var url = `/Attachments('${oData.attachmentCode}')`;
				oModel.setProperty("/uploadDocumnetTitle", "Artwork Attachment");
			}
			if (oData.attachmentName == "Delivery_No") {
				var url = `/Attachments('${oData.attachmentCode}')`
				oModel.setProperty("/uploadDocumnetTitle", "Delivery Attachment");
			}
			if (oData.attachmentName == "Invoice_No") {
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

		// Function to delete selected attachments from fragment
		onDeleteAttachment: function () {
			let tableOject = this.getModel('appView').getProperty('/JobsData');		//Get Table data with binding is from /JobsData
			var oTable = this.byId("idJobTable");  		// get table by id
			var that = this;
			let AttachmentDeletion = this.getView().byId('idJobHasAttachment').getSelectedContextPaths();	//selected attachments
			if (AttachmentDeletion.length == 0) {	//Attachment Not found condition
				MessageToast.show("Please select a Attachment to delete");
				return;
			}

			let payload = [];		//push all the attachents in form attachment table id's

			for (let i = 0; i < AttachmentDeletion.length; i++) {
				let data = this.getModel('appView').getProperty(AttachmentDeletion[i]);
				if (data.attachmentName == "Client_PO Code") {
					payload.push(data.attachmentCode);
				}
				if (data.attachmentName == "Artwork Attchment") {
					payload.push(data.attachmentCode);
				}
				if (data.attachmentName == "Delivery_No") {
					payload.push(data.attachmentCode);
				}
				if (data.attachmentName == "Invoice_No") {
					payload.push(data.attachmentCode);

				}
			}
			let currentJob = this.getModel('appView').getProperty('/currentJobCardNo');
			let newPayloadData = [];
			newPayloadData.push({
					jobCardNo: currentJob,
					attachments: payload
				})

			// let currentJob = this.getModel('appView').getProperty('/currentJobCardNo');
			// let duplicateJobs = [];
			// for (let i = 0; i < tableOject.length; i++) {
			// 	if (!(tableOject[i].jobCardNo === currentJob)) {		//No selected row here to show duplicates on which row 
			// 		let presentedAttachmentInJob = [];
			// 		presentedAttachmentInJob.push(tableOject[i].PoAttach, tableOject[i].artworkCode, ...tableOject[i].InvNo, ...tableOject[i].DeliveryNo);
			// 		let isAnyPresent = presentedAttachmentInJob.some(item => payload.includes(item));
			// 		if (isAnyPresent) {
			// 			let jobCardNo = this.getModel('appView').getProperty('/JobsData/' + i);
			// 			duplicateJobs.push(jobCardNo.jobCardNo);
			// 		}
			// 	}
			// }
			// if (duplicateJobs.length > 0) {
			// 	MessageToast.show('Found Same attachments in Job : ' + duplicateJobs);
			// 	return;
			// }

			// let newPayloadData = [];	//payload send to server
			// newPayloadData.push({
			// 	jobCardNo: currentJob,
			// 	attachments: payload
			// })
			var that = this;
			MessageBox.confirm("Are you sure you want to delete Attachments", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
				onClose: function (sAction) {
					if (sAction === "OK") {
						that.middleWare.callMiddleWare("deleteAttachments", "POST", newPayloadData)		//delete attachment api call
							.then(function (data, status, xhr) {
								// that.jobsWithAtleastAttachment();
								that.selectAttachmentType();
								MessageToast.show(data);
								that.ojobValidation().then(data => {
									data.close();
								})

							})
							.catch(function (jqXhr, textStatus, errorMessage) {
								that.middleWare.errorHandler(jqXhr, that);
							});
					}
				}
			});


		},

		tableFilters: {},
		tableFilter: function (filterProperty, operator, value, value2) {
			var oTable = this.getView().byId("idJobTable");
			if (value) {
				if (filterProperty === "jobCardNo") {	//jobCardNo
						var filters = value.map(function(jobCardNo) {
							return new sap.ui.model.Filter(filterProperty, operator, jobCardNo);
						});
	
						// Combine the filters with OR condition (and: false)
						this.tableFilters[filterProperty] = new sap.ui.model.Filter({
							filters: filters,
							and: false // OR condition to filter acc to multiple values
						});
				}else if (filterProperty === 'date') {		//date
						this.tableFilters[filterProperty] = new Filter(filterProperty, operator, value, value2);
				}else if(filterProperty === 'companyId'){					
					this.tableFilters[filterProperty] = new Filter(filterProperty,operator,value);		
				}
			} else {
				delete this.tableFilters[filterProperty];
			}
			oTable.getBinding("items").filter(Object.values(this.tableFilters));

			let currentItems = oTable.getBinding('items').getCurrentContexts();
			this.getModel('appView').setProperty('/currentItems', currentItems.length);
		},

		// Delete Attachments from dispatched screen table
		onDeleteAttachmentTable: function () {
			let tableOject = this.getModel('appView').getProperty('/JobsData');		//Get Table data with binding is from /JobsData
			var oTable = this.byId("idJobTable");  		// get table by id
			// var oBinding = oTable.getBinding('items');	//get table data
			// let jobIds = [];

			// Selected Paths-----for deletion
			let selectedPath = oTable.getSelectedContextPaths();

			if (selectedPath.length == 0) {	//Attachment Not found condition
				MessageToast.show("Please select Attachment to delete");
				return;
			}

			// Storing the attachments that we want to delete.
			// let attachments = [];
			// selectedPath.forEach(data => {
			// 	data = this.getModel('appView').getProperty(data);
			// 	// jobIds.push(data.jobCardNo);
			// 	attachments.push(...data.DeliveryNo);
			// 	attachments.push(...data.InvNo);
			// 	attachments.push(data.PoAttach);
			// 	attachments.push(data.artworkCode);
			// })

			let newPayloadData = [];
			let usedIndexes = [];
			selectedPath.forEach(data => {
				usedIndexes.push(data.split('/')[data.split('/').length - 1])
			})
			for (let i = 0; i < tableOject.length; i++) {
					if (usedIndexes.includes(i.toString())) {		//No selected row here to show duplicates on which row 
						let data = tableOject[i];
						let attachArray = [];
						if (data.PoAttach) {
							attachArray.push(data.PoAttach);
						}
						if (data.artworkCode) {
							attachArray.push(data.artworkCode);
						}
						if (data.InvNo && data.InvNo.length > 0) {
							attachArray.push(...data.InvNo);
						}
						if (data.DeliveryNo && data.DeliveryNo.length > 0) {
							attachArray.push(...data.DeliveryNo);
						}
						newPayloadData.push({		//Payload sended to server
							jobCardNo: data.jobCardNo,
							attachments: attachArray
						})
					} 
				}

			// Selected Indexes/rows by user to delete
			// let usedIndexes = [];
			// selectedPath.forEach(data => {
			// 	usedIndexes.push(data.split('/')[data.split('/').length - 1])
			// })

			// let duplicateJobs = [];
			// let newPayloadData = [];	//Final Payload
			// Finding Duplicate Attachments with other jobs.
			// for (let i = 0; i < tableOject.length; i++) {
			// 	if (!usedIndexes.includes(i.toString())) {		//No selected row here to show duplicates on which row 
			// 		let presentedAttachmentInJob = [];
			// 		presentedAttachmentInJob.push(tableOject[i].PoAttach, tableOject[i].artworkCode, ...tableOject[i].InvNo, ...tableOject[i].DeliveryNo);
			// 		let isAnyPresent = presentedAttachmentInJob.some(item => attachments.includes(item));
			// 		if (isAnyPresent) {
			// 			let jobCardNo = this.getModel('appView').getProperty('/JobsData/' + i);
			// 			duplicateJobs.push(jobCardNo.jobCardNo);
			// 		}
			// 	} else {
			// 		let data = tableOject[i];
			// 		let attachArray = [];
			// 		attachArray.push(data.PoAttach, data.artworkCode, ...data.InvNo, ...data.DeliveryNo);
			// 		newPayloadData.push({		//Payload sended to server
			// 			jobCardNo: data.jobCardNo,
			// 			attachments: attachArray
			// 		})
			// 	}
			// }

			// if (duplicateJobs.length > 0) {
			// 	MessageToast.show('Found Job with same attachments : ' + duplicateJobs);
			// 	return;
			// }

			var that = this;
			MessageBox.confirm("Are you sure you want to delete Attachments", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
				onClose: function (sAction) {
					if (sAction === "OK") {
						that.middleWare.callMiddleWare("deleteAttachments", "POST", newPayloadData)		//delete attachment api call
							.then(function (data, status, xhr) {
								// that.jobsWithAtleastAttachment();
								that.selectAttachmentType();
								MessageToast.show(data);
								oTable.setSelectedContextPaths(false);
							})
							.catch(function (jqXhr, textStatus, errorMessage) {
								that.middleWare.errorHandler(jqXhr, that);
							});
					}
				}
			});
		}
	});
});