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
			this.getModel('appView').setProperty('/UserRole',"Admin");
			this.jobsWithAtleastAttachment();
		},


		jobsWithAtleastAttachment: function () {
			var that = this;
			this.middleWare.callMiddleWare("Jobs", "GET")
				.then(function (data, status, xhr) {
					that.serverPayload(data);
					// data = data.filter(element => element !== null);
					// that.getView().getModel('appView').setProperty('/jobsData', data);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});

		},

		serverPayload : function(data){
			data = data.filter(element => element !== null);
			data.forEach(data =>{
				data.date = data.date.split('T')[0]
			});
			this.getView().getModel('appView').setProperty('/jobsData', data);

		},

		onDateRangeChange: function (oEvent) {
			// Get the selected date range
			var sDateRange = oEvent.getSource().getValue().split(" - ");
			if(sDateRange){
				var aFilters = [];
				aFilters.push(new Filter("date", FilterOperator.BT, sDateRange[0], sDateRange[1]));
	
				// Get the binding of the table and apply the filters
				var oTable = this.getView().byId("idJobTable");
				var oBinding = oTable.getBinding("items");			
				oBinding.filter(aFilters);
			}
		},

		onSearchCardCode: function (oEvent) {
			var sSearchValue = this.getView().byId('searchField').getValue();
			var aFilters = [];

			if (sSearchValue) {
				aFilters.push(new Filter("jobCardNo", FilterOperator.Contains, sSearchValue));
			}
			// Get the binding of the table and apply the filters
			var oTable = this.getView().byId("idJobTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},

		rowItemsPressJobs: function (oEvent) {

			var oParameter = oEvent.getParameter('listItem');
			var oPath = oEvent.getParameter("listItem").getBindingContextPath();
			this.bindingPath = oPath;
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
		//* This function will open the dialog to check if the job is already present or not and which job u want to keep or not
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

		showAttachment: function (oEvent) {
			var dModel = this.getView().getModel();
			var that = this;
			var oData = oEvent.getSource().getBindingContext("appView").getObject();
			var oModel = this.getView().getModel("appView");
			var url = "";

			debugger;
			if (oData.attachmentName == "Client PO Code") {
				var url = `/Attachments('${oData.attachmentCode + "PoNo"}')`
				oModel.setProperty("/uploadDocumnetTitle", "Po Attachment");
			}
			if (oData.attachmentName == "Artwork Attchment") {
				var url = `/Attachments('${oData.attachmentCode + "ArtworkNo"}')`;
				oModel.setProperty("/uploadDocumnetTitle", "Artwork Attachment");
			}
			if (oData.attachmentName == "Delivery No") {
				var url = `/Attachments('${oData.attachmentCode + "DelNo"}')`
				oModel.setProperty("/uploadDocumnetTitle", "Delivery Attachment");
			}
			if (oData.attachmentName == "Invoice No") {
				var url = `/Attachments('${oData.attachmentCode + "InvNo"}')`
				oModel.setProperty("/uploadDocumnetTitle", "Invoice Attachment");
			}

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
		onReject: function () {
			this.oDialogOpen().then(function (oDialog) {
				oDialog.close();
			})
		},

		onDeleteAttachment: function () {
			var that = this;
			let AttachmentDeletion = this.getView().byId('idJobHasAttachment')._aSelectedPaths;
			if (AttachmentDeletion.length == 0) {
				MessageToast.show("Please select a Attachment to delete");
			} else {
				let payload = [];
				if (AttachmentDeletion.length > 0) {
					for (let i = 0; i < AttachmentDeletion.length; i++) {
						let data = this.getModel('appView').getProperty(AttachmentDeletion[i]);
						if (data.attachmentName == "Client PO Code") {
							let str = data.attachmentCode + "PoNo";
							payload.push(str);
						}
						if (data.attachmentName == "Artwork Attchment") {
							let str = data.attachmentCode + "ArtworkNo";
							payload.push(str);
						}
						if (data.attachmentName == "Delivery No") {
							let str = data.attachmentCode + "DelNo";
							payload.push(str);
						}
						if (data.attachmentName == "Invoice No") {
							let str = data.attachmentCode + "InvNo";
							payload.push(str);
						}
					}
				}
				MessageBox.confirm("Are you sure you want to delete Attachments", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
					onClose: function (sAction) {
						if (sAction === "OK") {
							payload.forEach(data => {
								that.middleWare.callMiddleWare("deleteAttachments", "POST", data)
									.then(function (data, status, xhr) {
										//
										MessageToast.show(data);
									})
									.catch(function (jqXhr, textStatus, errorMessage) {
										that.middleWare.errorHandler(jqXhr, that);
									});
							})
						}
					}
				});
			}

		}

	});
});