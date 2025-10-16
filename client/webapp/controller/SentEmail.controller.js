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

	return BaseController.extend("ent.ui.ecommerce.controller.SentEmail", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("SentEmail").attachPatternMatched(this._matchedHandler, this);													
		},

		_matchedHandler: function (oEvent) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/layout", "OneColumn");
			this.getModel('appView').setProperty('/UserRole', "Admin");		//As by user role as admin all sidenavigation - navigation list items will visible.
			this.getModel("appView").updateBindings();
			var that = this;
			this.getUserRoleData();
			this.getSentEmailData();
		},

		getSentEmailData: function() {
			var that = this;

			this.middleWare.callMiddleWare("getSentEmails", "GET")
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/sentEmails", data);
					that.getModel("appView").setProperty("/sentEmailCount", data.length);
					that.getModel("appView").updateBindings();
				}
				)
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
		},

		onEmailRowPress: function (oEvent) {
			var that = this;
			var oView = this.getView();
			var oParameter = oEvent.getParameter('listItem');
			var sData = oParameter.getBindingContext('appView').getObject();
			sData.ReadOnly = true
			this.getView().getModel("appView").setProperty("/Email", sData)

			if (!this.oSendEmailDialog) {
				this.oSendEmailDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.Email", 
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					return oDialog;
				}.bind(this));
			}else {
				this.oSendEmailDialog.then(function (oDialog) {
					oDialog.open();
				});
			}
		},

		handleCloseMail: function () {
			var that = this;
			this.oSendEmailDialog.then(function (oDialog) {
				oDialog.close();
				that.getView().getModel("appView").setProperty("/Email", {})
			});
		},

		showPoAttachment: function (oEvent) {
			var that = this;
			var dModel = this.getView().getModel();
			var oData = oEvent.getSource().getBindingContext("appView").getObject();
			var oModel = this.getView().getModel("appView");
			
			var url = `/Attachments('${oData.Attachment}')`
			oModel.setProperty("/uploadDocumnetTitle", "PoReciept Attachment");
			oModel.setProperty("/PDFPoNo", oData.Attachment);

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

		downloadAttachments: function () {
			const base64PDF = this.getView().getModel("appView").getProperty("/attachmentFiles");
			const PoNo = this.getView().getModel("appView").getProperty("/PDFPoNo");

			if (!base64PDF) {
				MessageToast.show("No PDF available to download.");
				return;
			}

			// Convert Base64 to Blob for download
			const link = document.createElement("a");
			link.href = base64PDF;
			link.download = `${PoNo}.pdf`;
			link.click();
		},
	});
});