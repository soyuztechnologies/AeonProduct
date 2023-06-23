sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/util/File"
], function (BaseController, MessageToast, JSONModel, Fragment, BusyIndicator, File) {
	"use strict";
	var isPono;
	return BaseController.extend("ent.ui.ecommerce.controller.printingDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("printingDetails").attachPatternMatched(this._matchedHandler, this);

		},

		_matchedHandler: async function (oEvent) {
			debugger;
			this.oArgs = oEvent.getParameter("arguments").jobId;
			var that = this;

			await this.getUserRoleData().then(
				function (data) {
					var role = data.role.Role
					that.getView().getModel('appView').setProperty('/UserRole', role);
					that.getView().getModel('appView').setProperty('/appUserId', data.role.id);
					that.getView().getModel('appView').setProperty('/UserEmail', data.role.EmailId);
					that.userRole();
					// that.getJobsData();
					that.getJobsDataByCompanyFilter();
				},
				function (oErr) {
					that.middleWare.errorHandler(jqXhr, that);
				}
			);
			const date = new Date();
			this.getView().getModel("appView").setProperty("/dateNow",date)
			// that.getView().getModel("appView").setProperty("/asUrgentVis", false);
			// that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);
			var oModel = this.getModel("appView")
			oModel.setProperty("/layout", "TwoColumnsMidExpanded");
			oModel.setProperty("/visibleHeader", true);
			oModel.setProperty("/visibility", true);
			oModel.setProperty("/logoutVisibility", true);
			oModel.setProperty("/inputEditable", true);
			oModel.setProperty("/imgVisibility", false);
			oModel.setProperty("/onClickModify", false);
			oModel.setProperty("/addBtnVisible", true);
			oModel.setProperty("/editableFields", false);

			oModel.setProperty("/btnVisibility", true);
			var sUserRole = oModel.getProperty('/UserRole');
			if (sUserRole === 'Customer') {

                oModel.setProperty('/visibleModify', false);

                oModel.setProperty("/addBtnVisible", false);

                oModel.setProperty("/cancleBtnVis", false);

                oModel.setProperty("/updBtnVisibility", false);

                oModel.setProperty("/editColumnVisible", false);




            }else if(sUserRole === "Artwork Head"){

                oModel.setProperty("/addBtnVisible", false);
				this.getView().getModel("appView").setProperty("/asUrgentVis", false);
				this.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);

            }
			// oModel.setProperty("/visiblePdfViewer", false);
			oModel.updateBindings();
			// this.getUserRoleData();
			this.oGetAgru();
			this.onReadJobStatus();


		},

		showAddedFields: function () {
			var oTable = this.getView().byId("jobStatusTable");
			var aColumns = oTable.getColumns();
			var aItems = oTable.getItems();
			var oLastItem = aItems[aItems.length - 1];

			// Hide all columns except the last column (header)
			for (var i = 0; i < aColumns.length - 1; i++) {
				var oColumn = aColumns[i];
				oColumn.setVisible(false);
			}

			// Show the added column (last column)
			aColumns[aColumns.length - 1].setVisible(true);

			// Show the added item (last item) and check cell values
			var oItemCells = oLastItem.getCells();
			Object.keys(oItemCells).forEach(function (sKey) {
				var oCell = oItemCells[sKey];
				var sCellValue = oCell.getText();

				if (typeof sCellValue === 'undefined' || sCellValue === null) {
					oCell.setVisible(false);
				}
			});
		},


		// * this funtion is getting the job data in to the page.
		oGetAgru: function () {
			debugger;
			var that = this;
			var oModel = this.getView().getModel();
			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			oModel.read("/Jobs('" + this.oArgs + "')", {
				success: function (data) {
					if(data.Urgent === "Yes"){
						that.getView().getModel("appView").setProperty("/asUrgentVis", false);
						// that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", true);
					}
					else{
						// that.getView().getModel("appView").setProperty("/asUrgentVis", true);
						that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);
					}
					that.getView().getModel("appView").setProperty("/Jobs", data);
					that.loadForm();
					that.getView().getModel("appView").setProperty("/status", data.status);
					if (!data.status) {
						if (sUserRole == "Admin" || sUserRole == "Raw Material Head") {
							that.getView().getModel("appView").setProperty("/addBtnVisible", true);
						} else {
							that.getView().getModel("appView").setProperty("/addBtnVisible", false);
						}
					} else {
						return;
					}

				},
				error: function (error) {

					that.middleWare.errorHandler(error, that);
				}
			});
		},

		// * these fucnion will chnage the visibility of the buttons and the files.
		onModify: function () {
			
			// var oModel = this.getView().getModel("appView");
			// oModel.setProperty("/inputEditable", true)
			// oModel.setProperty("/updBtnVisibility", true)
			// oModel.setProperty("/onClickModify", true)
			// oModel.setProperty("/modifybtnvis", false)
			// oModel.setProperty("/cancleBtnVis", true);
			// oModel.setProperty("/visibleModify", false);
			// oModel.updateBindings();
			// this.getUserDataLocal = JSON.parse(JSON.stringify(oModel.getProperty("/jobStatusTabData")));
			// this.whenProductionStart();
		},

		onSaveJobStatus: function () {
			debugger;
			var oModel = this.getView().getModel("appView"); // Default model get at here
			var that = this;
			var data = oModel.getProperty("/newJobStatus");
			var oData = this.getView().getModel();

			for (var i = 0; i < data.length; i++) {
				var jobStatus = data[i];
				var id = jobStatus.id;
				const sEntityPath = `/JobStatus('${id}')`;

				if (jobStatus.TobeUpdated == "X") {
					delete jobStatus.TobeUpdated;
					oData.create("/JobStatus", jobStatus, {
						success: function (data) {
							MessageToast.show("Successfully Uploaded");
							// that.onUploadStatus();
							oModel.updateBindings();
						},
						error: function (error) {
							// Error callback
							that.middleWare.errorHandler(error, that);
							// MessageToast.show("Error reading data");
						}
					});
				} else if (jobStatus.TobeUpdated == true) {
					delete jobStatus.TobeUpdated;
					oData.update(sEntityPath, jobStatus, {
						success: function (Data) {
							MessageToast.show("Successfully Update the Entry");
						},
						error: function (error) {
							MessageToast.show("Error reading data");
							// Error callback
							that.middleWare.errorHandler(error, that);
						}
					});
				}
			}
			this.whenProductionStart();
		},

		onClickCancel: function () {
			
			var oModel = this.getView().getModel("appView");
			var oldData = oModel.getProperty("/newJobStatus");
			oModel.setProperty("/statusInvAttachment", "");
			oModel.setProperty("/statusDeliveryAttachment", "");
			oModel.setProperty("/attachmentFile", "");
			var data = oModel.getProperty("/readedJobdata");

			// oModel.setProperty("/newJobStatus",this.jobStatusData);
			oModel.updateBindings();
		},


		onUpdatePress: function () {
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.getView().getModel('appView').getProperty("/jobId");
			const oUpdatedData = {
			};
			oModel.update(`/JobStatus('${ids}')`, oUpdatedData, {
				success: function (data) {

					MessageToast.show("Successfully Uploaded")
				},
				error: function (error) {
					// Error callback
					that.middleWare.errorHandler(error, that);
					// MessageToast.show("Error reading data");
				}
			});
			this.getView().getModel("appView").setProperty("/onClickModify", false);
		},

		loadForm: function () {

			var oSimpleForm = this.getView().byId('jobDetails')
			// oSimpleForm.setModel('appView');
			oSimpleForm.bindElement('appView>/Jobs');
			// MessageToast.show("Checking...")
		},

		// * this will opens the dialog for the multiple roles.
		oDialogOpen: function () {

			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');

			var oView = this.getView();

			var that = this;

			if (!this.oUploadDialog) {

				this.oUploadDialog = Fragment.load({

					id: oView.getId(),

					name: "ent.ui.ecommerce.fragments.uploadDoc",

					controller: this

				}).then(function (oDialog) {

					// Add dialog to view hierarchy

					oView.addDependent(oDialog);

					return oDialog;

				}.bind(this));




			}

			if (sUserRole === "Admin" || sUserRole === "Artwork Head") {

				this.getView().getModel("appView").setProperty("/browseVisArtwork", true);

				this.getView().getModel("appView").setProperty("/btnVisibility", true);

			}else if(sUserRole === "Artwork Head"){
				this.getView().getModel("appView").setProperty("/browseVisArtwork", true);
			} 
			else {

				this.getView().getModel("appView").setProperty("/browseVisArtwork", false);

				this.getView().getModel("appView").setProperty("/btnVisibility", false);

			}

			return this.oUploadDialog;

		},

		openCustomerAttachmentDialog: function (oEvent) {
			
			var data = oEvent.getSource().getBindingContext("appView").getObject();
			var clickedrow = oEvent.getSource().getBinding("text").getPath();
			var invoice = data.InvNo;
			var Delivery = data.InvNo;

			var oView = this.getView();
			var that = this;
			if (!this.CustomerAttachment) {
				this.CustomerAttachment = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.CustomerAttachment",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}

			this.CustomerAttachment.then(function (oDialog) {
				oDialog.open();
				if (clickedrow == "DeliveryNo") {
					that.getModel("appView").setProperty("/CustomerAttachment", invoice);
				}
				else if (clickedrow == "InvNo") {
					that.getModel("appView").setProperty("/CustomerAttachment", Delivery);
				}
				// var oSimpleForm = that.getView().byId('allJobDetails')
				// oSimpleForm.bindElement('appView>/Jobs');
				// 
			});
		},

		onRejectCustomerDialog: function () {
			var that = this;
			this.CustomerAttachment.then(function (oDialog) {
				// that.getView().getModel("appView").setProperty("/attachmentFiles", "")
				oDialog.close();
			});
		},




		clickedLink: null,
		jobStatusPath: null,
		onClickPopup: function (oEvent) {
			var that = this;
			var oData = oEvent.getSource().getBindingContext("appView").getObject();
			this.clickedLink = oEvent.getSource().getBinding("text").getPath();
			this.jobStatusPath = oEvent.getSource().getBindingContext("appView").sPath;
			var oModel = this.getView().getModel("appView");
			var sUserRole = oModel.getProperty('/UserRole');
			if (sUserRole === 'Customer') {
				this.openCustomerAttachmentDialog(oEvent);
				return;
			};

			if (this.clickedLink == "clientPONo") {
				this.getModel("appView").setProperty("/attachmentFiles", oData.poAttachment)
				oModel.setProperty("/uploadDocumnetTitle", "Upload Po Document");
				var pofile = oData.poAttachment;
				if (pofile) {
					oModel.setProperty("/buttonText", "Update");
				}
				else {
					oModel.setProperty("/buttonText", "Upload");
				}
			}
			else if (this.clickedLink == "artworkCode") {
				this.getModel("appView").setProperty("/attachmentFiles", oData.artworkAttachment)
				var artfile = oData.artworkAttachment
				oModel.setProperty("/uploadDocumnetTitle", "Upload Artwork Document");

				if (artfile) {
					oModel.setProperty("/buttonText", "Update");
				}
				else {
					oModel.setProperty("/buttonText", "Upload");
				}
			}
			else if (this.clickedLink == "DeliveryNo") {
				this.getModel("appView").setProperty("/attachmentFiles", oData.deliveryAttachment)
				var Delfile = oData.deliveryAttachment;
				oModel.setProperty("/uploadDocumnetTitle", "Upload Delivery Document");
				oModel.setProperty("/btnVisibility", false);
				oModel.setProperty("/browseVisArtwork", false);

				if (Delfile) {
					oModel.setProperty("/buttonText", "Update");
				}
				else {
					oModel.setProperty("/buttonText", "Upload");
				}
			}
			else if (this.clickedLink == "InvNo") {
				this.getModel("appView").setProperty("/attachmentFiles", oData.incAttachment)
				var incFile = oData.incAttachment;
				oModel.setProperty("/uploadDocumnetTitle", "Upload Invoice Document");
				oModel.setProperty("/btnVisibility", false);
				oModel.setProperty("/browseVisArtwork", false);
				if (incFile) {
					oModel.setProperty("/buttonText", "Update");
				}
				else {
					oModel.setProperty("/buttonText", "Upload");
				}
			}


			var oModel = this.getView().getModel("appView");
			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();
				var sUserRole = oModel.getProperty('/UserRole');
				if (sUserRole === 'Customer') {
					oModel.setProperty('/browseVis', false);
				}

			});
		},

		// * this fucntion opens the dialog onto the addJobFragmentDialog.
		onClickAddStatusAttachment: function (oEvent) {
			this.jobAttachmentId = oEvent.getSource().getId();
			var that = this;
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/attachmentFiles", "");
			this.oDialogOpen().then(function (oDialog) {
				oModel.setProperty("/buttonText", "Update");
				oModel.setProperty("/uploadDocumnetTitle", "Upload  Document");
				oDialog.open();
				// oDialog.attachAfterClose(function () {
				// 	
				// 	oDialog.unbindProperty();
				// });
				
				var sUserRole = oModel.getProperty('/UserRole');
				if (sUserRole === 'Customer') {
					oModel.setProperty('/browseVis', false);
				}

			});
		},

		allJobDialog: function () {
			
			this.allJob();
		},
		allJob: function () {
			var oView = this.getView();
			var that = this;

			if (!this.oJobDialog) {
				this.oJobDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.AllJobs",
					controller: this
				}).then(function (oDialog) {
					// Add dialog to view hierarchy
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));

			}
			this.oJobDialog.then(function (oDialog) {
				oDialog.open();
				var oSimpleForm = that.getView().byId('allJobDetails')
				oSimpleForm.bindElement('appView>/Jobs');
				
			});
		},

		// * this function will close the add Attachment dialog.
		onReject: function () {
			var oModel = this.getView().getModel("appView");
			this.oUploadDialog.then(function (oDialog) {
				oDialog.close();
				oModel.setProperty("/clientPONo", "")
				oModel.setProperty("/ArtWork", "")
				oModel.setProperty('/visibleDownloadButton', false);
				oDialog.updateBindings();

			});
		},

		onnReject: function () {
			this.oJobDialog.then(function (oDialog) {
				oDialog.close();
			})
		},

		getDialogData: function (oEvent) {
			debugger
		},

		onSelectKeyRawMaterial: function (oEvent) {

			var selectedText = oEvent.getParameter("selectedItem").getText();
			this.getView().getModel("appView").setProperty("/selectedKey", selectedText);
		},
		onSelectKeyStatus: function (oEvent) {

			var selectStatus = oEvent.getParameter("selectedItem").getText();
			this.getView().getModel("appView").setProperty("/selectStatus", selectStatus);
		},


		// * this openDialog function will open the add status dialog in edit button in table row and add icon button .
		openJobstatusDialog: function () {
			var oView = this.getView();
			var that = this;
			if (!this.addJobstatusDialog) {
				this.addJobstatusDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.Jobstatusdialog",
					controller: this
				}).then(function (oDialog) {
					// Add dialog to view hierarch
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			return this.addJobstatusDialog;
		},


		// * this fucntion will opens the dialog, for factory manager and admin to update the data.
		isEditStatus: null,
		onPressAdd: function () {
			var that = this;
			this.getRemJobsStatus();
			var oModel = this.getView().getModel("appView");
			var oNewJob = {
				"JobStatusId": this.oArgs,
				"Coating": "",
				"DeliveryNo": "",
				"Embossing": "",
				"Foiling": "",
				"InvNo": "",
				"CreatedOn": new Date(),
				"JobId": "",
				"Packing": "",
				"Pasting": "",
				"Printing": "",
				"Punching": "",
				"deliveryAttachment": "",
				"incAttachment": "",
				"rawMaterial": "",
				"spotUV": "",
				"status": ""
			}

			this.getModel('appView').setProperty('/newJob', oNewJob);
			// this.getView().getModel("appView").setProperty("/piecePerBoxEdit", false);
			
			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			this.openJobstatusDialog().then(function (oDialog) {
				oModel.setProperty("/addJobStatusdialogTitle", "Add Job Status ");
				oModel.setProperty("/addJobStatusSave", "Add");
				oModel.setProperty("/DeliveryNo", "")
				oModel.setProperty("/InvNo", "")

				that.isEditStatus = false;
				oDialog.open();
				oModel.setProperty("/uploadFileName", "")
				//Editability for Admin
				if (sUserRole === 'Admin') {
					oModel.setProperty("/rawMaterialHeadVis", true);
					oModel.setProperty("/printingHeadVis", true);
					oModel.setProperty("/postPressHeadVis", true);
					oModel.setProperty("/dispatchHeadVis", true);
					oModel.setProperty("/accountHeadVis", true);
					oModel.setProperty("/jobStatusVis", true);
					oModel.setProperty("/dateFalseforallhead", true);
					// oModel.setProperty("/addBtnVisible", true);
				}
				//Editability for Ram Material Head
				if (sUserRole === 'Raw Material Head') {
					oModel.setProperty("/rawMaterialHeadVis", true);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", false);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/dateFalseforallhead", false);
					// oModel.setProperty("/addBtnVisible", false);
				}
				//Editability for Printing Head
				if (sUserRole === 'Printing Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", true);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", false);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/dateFalseforallhead", false);
				}
				//Editability for Post Press Head
				if (sUserRole === 'Post Press Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", true);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", false);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/dateFalseforallhead", false);
				}
				//Editability for Dispatch Head
				if (sUserRole === 'Dispatch Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", true);
					oModel.setProperty("/accountHeadVis", false);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/dateFalseforallhead", false);
				}
				//Editability for Accounts Head
				if (sUserRole === 'Accounts Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", true);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/dateFalseforallhead", false);
				}
				// that.loadForm2();
				var oSimpleForm2 = that.getView().byId('jobStatusDialog');
				oSimpleForm2.bindElement('appView>/newJob');
			});

		},

		// * this fucntion will close the dialog of the "onPressAdd" or Add button dialog on status.
		onClose: function () {
			debugger;	
			// var oSimpleForm2 = this.getView().byId('jobStatusDialog');
			// 	oSimpleForm2.bindElement('appView>/oldJobs');
			this.openJobstatusDialog().then(function (oDialog) {
				oDialog.close();

			});
		},

		// * this fucntion is triger when user click on save in fragment.
		onSubmitData: function () {
			debugger;
			
			var oModel = this.getView().getModel("appView");
			var invData = oModel.getProperty("/InvNo");
			var delData = oModel.getProperty("/DeliveryNo");
			oModel.updateBindings();
			// oModel.getProperty("/")
			// var rawMaterialSelect = this.getView().getModel("appView").getProperty("/rawMaterialSelected");
			var oldData = oModel.getProperty("/newJobStatus");
			var oNewJobData = oModel.getProperty('/newJob');

			oNewJobData.DeliveryNo = delData;
			oNewJobData.InvNo = invData;
			oNewJobData.rawMaterial = oModel.getProperty('/selectedKey');

			// this for the attachments files in jobstatus.
			oNewJobData.incAttachment = oModel.getProperty("/statusInvAttachment");
			oNewJobData.deliveryAttachment = oModel.getProperty("/statusDeliveryAttachment");

			if (!this.isEditStatus) {
				oNewJobData.TobeUpdated = "X";
				oldData.push(oNewJobData);

			}
			oModel.setProperty("/newJobStatus", oldData);
			oModel.updateBindings();
			oModel.refresh();
			// this.rawMaterialGet();
			// this.whenProductionStart();		
			this.onClose();

		},
		// rawMaterialGet: function () {
		// 	
		// 	var oModel = this.getView().getModel("appView");
		// 	var sUserRole = this.getView().getModel("appView").getProperty("/UserRole");
		// 	var oNewJobData = oModel.getProperty('/newJob');
		// 	oNewJobData.rawMaterial = oModel.getProperty('/selectedKey');
		// 	var ids = this.oArgs;
		// 	var sEntityPath = "/Jobs('" + ids + "')";
		//     var oData = this.getView().getModel();
		// 	oData.read(sEntityPath, {
		// 		success: function (data) {
		// 			if(oNewJobData.rawMaterial !== "In Stock"){
		// 				if (sUserRole === 'Printing Head') {
		// 					oModel.setProperty("/printingHeadEdit", false);
		// 				}
		// 					MessageToast.show("Raw material is Out of Stock");
		// 				}else{
		// 					oModel.setProperty("/printingHeadEdit", true);
		// 				}
		// 		},
		// 		error: function (oError) {
		// 			that.middleWare.errorHandler(oError, that);
		// 		}
		// 	});
		// },
		// * this funciton will upload the data, of the job status.
		onUploadData: function () {
			var that = this;
			var oData = this.getView().getModel();
			var oModel = this.getView().getModel("appView");
			var element = oModel.getProperty("/jobStatusTabData")
			var id = element[0].id;
			const sEntityPath = `/JobStatus('${id}')`;
			const oUpdatedData = {
				element
			};
			oData.update(sEntityPath, oUpdatedData.element[0], {
				success: function (Data) {
					MessageToast.show("Successfully Update the Entry");
				},
				error: function (error) {
					// Error callback
					that.middleWare.errorHandler(error, that);
				}
			});
		},

		// * at here we are going to edit the row data for the entries.
		editJobstatusEntry: function (oEvent) {
			this.getRemJobsStatus();
			debugger	
			this.isEditStatus = true;
			
			var that = this;
			var oModel = this.getView().getModel('appView');
			var rowdata = oEvent.getSource().getParent().getBindingContext("appView").getObject();
			if (rowdata.TobeUpdated == "X") {
				rowdata.TobeUpdated = "X";
			}
			else if (!rowdata.TobeUpdated) {
				rowdata.TobeUpdated = true;
			}

			// rowdata.TobeUpdated = true;
			oModel.setProperty("/newJob", rowdata);
			oModel.setProperty("/newJob", JSON.parse(JSON.stringify(rowdata)));
			// oModel.setProperty("/oldJobs",JSON.parse(JSON.stringify(rowdata)))
			var invNoEditGrag = rowdata.InvNo;
			var delEditFrag = rowdata.DeliveryNo;
			oModel.setProperty("/InvNo",invNoEditGrag);
			oModel.setProperty("/DeliveryNo",delEditFrag);
			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			this.openJobstatusDialog().then(function (oDialog) {
				oModel.setProperty("/addJobStatusdialogTitle", "Edit Job Status ");
				oModel.setProperty("/addJobStatusSave", "Update");
				oDialog.open();
				//Editability for Admin
				if (sUserRole === 'Admin') {
					oModel.setProperty("/rawMaterialHeadVis", true);
					oModel.setProperty("/printingHeadVis", true);
					oModel.setProperty("/postPressHeadVis", true);
					oModel.setProperty("/dispatchHeadVis", true);
					oModel.setProperty("/accountHeadVis", true);
					oModel.setProperty("/jobStatusVis", true);
					oModel.setProperty("/falseforallhead", true);
					// oModel.setProperty("/addBtnVisible", true);
				}
				//Editability for Ram Material Head
				if (sUserRole === 'Raw Material Head') {
					oModel.setProperty("/rawMaterialHeadVis", true);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", false);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/falseforallhead", false);
					// oModel.setProperty("/addBtnVisible", false);
				}
				//Editability for Printing Head
				if (sUserRole === 'Printing Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", true);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", false);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/falseforallhead", false);
				}
				//Editability for Post Press Head
				if (sUserRole === 'Post Press Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", true);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", false);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/falseforallhead", false);
				}
				//Editability for Dispatch Head
				if (sUserRole === 'Dispatch Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", true);
					oModel.setProperty("/accountHeadVis", false);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/falseforallhead", false);
				}
				//Editability for Accounts Head
				if (sUserRole === 'Accounts Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", true);
					oModel.setProperty("/jobStatusVis", false);
					oModel.setProperty("/falseforallhead", false);
				}
				var oSimpleForm2 = that.getView().byId('jobStatusDialog');
				oSimpleForm2.bindElement('appView>/newJob');
			});

		},


		// * these funciton is handling the upload attachment files in backend.

		onUploadDataPress: function () {
			var idbtn = this.jobAttachmentId;
			var oModel = this.getView().getModel("appView");
			if (this.clickedLink == "clientPONo") {
				this.onUploadAttachmentfiles("/clientPONo");
			}
			else if (this.clickedLink == "artworkCode") {
				this.onUploadAttachmentfiles("/ArtWork",);
			}
			else if (this.clickedLink == "DeliveryNo") {
				this.onUploadJobStatusAttachmentFiles("/DeliveryNo",);
			}
			else if (this.clickedLink == "InvNo") {
				this.onUploadJobStatusAttachmentFiles("/InvNo",);
			}
			else if (idbtn.includes("DeliveryStatus")) {
				// oModel.setProperty("/statusDeliveryAttachment", vContent);
				this.onReject();
			}
			else if (idbtn.includes("Invstatus")) {
				// oModel.setProperty("/statusInvAttachment", vContent);
				this.onReject();

			}
		},
		onUploadJobStatusAttachmentFiles: function (attachmentPath) {
			var oModel = this.getView().getModel("appView");
			var element = oModel.getProperty(this.jobStatusPath)
			var id = element.id;
			var oData = this.getView().getModel();
			var file = this.getView().getModel('appView').getProperty("/attachmentFiles");
			var payload = file ? file.attachmentPdfFiles : "";
			BusyIndicator.show(0);
			if (attachmentPath == "/DeliveryNo") {
				var oUpdatedData = {
					deliveryAttachment: payload,
				};
			}
			else if (attachmentPath == "/InvNo") {
				var oUpdatedData = {
					incAttachment: payload,
				};
			}

			oData.update(`/JobStatus('${id}')`, oUpdatedData, {
				success: function (data) {
					BusyIndicator.hide();
					MessageToast.show("Successfully Uploaded")
				},
				error: function (error) {
					that.middleWare.errorHandler(error, that);
				}
			});
		},

		onUploadAttachmentfiles: function (attachmentPath) {
			var oModel = this.getView().getModel(); ///default model get at here
			var that = this;
			var ids = this.oArgs
			var artworkFile = this.getView().getModel('appView').getProperty("/attachmentFiles");
			var payload = artworkFile ? artworkFile : "";
			BusyIndicator.show(0);
			if (attachmentPath == "/clientPONo") {
				this.getModel("appView").setProperty("/Jobs/poAttachment", payload);
				var oUpdatedData = {

					poAttachment: payload,
				};
			}
			else if (attachmentPath == "/ArtWork") {
				var oUpdatedData = {
					artworkAttachment: payload,
				};
			}
			oModel.update(`/Jobs('${ids}')`, oUpdatedData, {
				success: function (data) {
					BusyIndicator.hide();
					MessageToast.show("Successfully Uploaded")
				},
				error: function (error) {
					that.middleWare.errorHandler(error, that);
				}
			});
		},


		downloadAttachments: function () {
			var oModel = this.getView().getModel("appView");
			var jsonPath = '';
			var files = '';

			var mapping = {
				"clientpoNo": "/clientPONo",
				"artworkCode": "/ArtWork",
				"InvNo": "/InvNo",
				"DeliveryNo": "/DeliveryNo"
			};

			if (this.clickedLink && mapping.hasOwnProperty(this.clickedLink)) {
				jsonPath = mapping[this.clickedLink];
				files = oModel.getProperty("/attachmentFiles");

				var mimeType = files.split(';')[0].split(':')[1];
				var fileExtension = mimeType.split('/')[1];
				var byteCharacters = atob(files.split(',')[1]);
				var byteNumbers = new Array(byteCharacters.length);

				for (var i = 0; i < byteCharacters.length; i++) {
					byteNumbers[i] = byteCharacters.charCodeAt(i);
				}

				var byteArray = new Uint8Array(byteNumbers);
				var blob = new Blob([byteArray], { type: "application/octet-stream" });
				fileExtension = fileExtension.includes('sheet') ? "xlsx" : fileExtension;
				// var url = URL.createObjectURL(blob);
				//  jQuery.sap.addUrlWhitelist("blob");
				//  window.open(url, "file",fileExtension);

				File.save(blob, 'NewFile', fileExtension);
			}
		},

		getFileTypes: function (base64Url) {
			var mimeType = base64Url.split(';')[0].split(':')[1];
			var fileExtension = mimeType.split('/')[1];
			var oModel = this.getView().getModel("appView");

			if (fileExtension === 'pdf') {
				return 'pdf';
			} else if (mimeType.startsWith('image')) {
				return 'image';
			} else {
				return 'other';
			}
		},



		// * this fucntion will read the data for job status and shows into the table.
		onReadJobStatus: function () {
			var oModel = this.getView().getModel("appView");  //default model get at here
			var that = this;
			var ids = this.oArgs;
			var jobId = oModel.getProperty("/postId")
			var payload = {
				"jobId": ids
			}
			var sUserRole = oModel.getProperty('/UserRole');
			if (sUserRole === "Customer") {
				var endPoint = "getSumOfJobStatus";
			} else {
				endPoint = "jobStatusData"
			}
			this.middleWare.callMiddleWare(endPoint, "POST", payload)
				.then(function (data) {
					if (!data) {
						return
					}
					data.forEach(item => {
						item.TobeUpdated = false;
					});
					oModel.setProperty("/readedJobdata", data);
					debugger;
					oModel.setProperty("/newJobStatus", data);
					// that.showAddedFields();
					// that.jobStatusData = oModel.getProperty("/readedJobdata");
				})
				.catch(function (jqXhr, textStatus, errorMessage, error) {

					MessageToast.show("Error");
				});
		},

		// * this fucntion will trigerr the onChange event for the fileuploader.
		onChangeFileUploader: function (oEvent) {
			
			var files = oEvent.getParameter("files");

			if (this.clickedLink == "clientPONo") {
				this.getView().getModel("appView").setProperty("/uploadFileName", files.name)
				this.onFileUploader(files)
			}
			else if (this.clickedLink == "artworkCode") {
				this.getView().getModel("appView").setProperty("/uploadFileName", files.name)
				this.onFileUploader(files);
			}
			else if (this.clickedLink == "InvNo") {

				this.onFileUploader(files);
			}
			else if (this.clickedLink == "DeliveryNo") {
				// this.getView().getModel("appView").setProperty("/uploadFileName",files[0].name)
				this.onFileUploader(files);
			}
			else {

				this.onFileUploader(files);


			}
		},

		// * this will handling the fileupload on different phase like pono, artwork,incno,delvieryno.
		onFileUploader: function (files, bindingPath) {
			var that = this;
			var oModel = this.getView().getModel('appView');

			if (!files.length) {
				return;
			}

			var reader = new FileReader();
			reader.onload = function (e) {
				try {
					var vContent = e.currentTarget.result;
					// var fileType = files[0].type;

					oModel.setProperty("/attachmentFiles", vContent);
					// oModel.updateBindings();

					var idbtn = that.jobAttachmentId;
					if (!idbtn) {
						return;
					}
					else if (idbtn.includes("DeliveryStatus")) {
						oModel.setProperty("/statusDeliveryAttachment", vContent);
						const fullName = files[0].name;
						const parts = fullName.split("_");
						const name = parts[0];
						oModel.setProperty("/DeliveryNo", name)

					}
					else if (idbtn.includes("Invstatus")) {
						oModel.setProperty("/statusInvAttachment", vContent);
						const fullName = files[0].name;
						const parts = fullName.split("_");
						const name = parts[0];
						oModel.setProperty("/InvNo", name)

					}
					oModel.updateBindings();
				} catch (jqXhr) {
					that.middleWare.errorHandler(jqXhr, that);
				}
			};

			reader.readAsDataURL(files[0]);
		},






		onUploadStatus: function () {
			var oModel = this.getView().getModel();
			var that = this;
			var ids = this.oArgs;
			const sEntityPath = `/Jobs('${ids}')`;
			var selectedStatus = this.getView().getModel("appView").getProperty("/selectStatus");
			const oUpdatedData = {
				status: selectedStatus
			};
			oModel.update(sEntityPath, oUpdatedData, {
				success: function (oUpdatedData) {
					MessageToast.show("Successfully Uploaded Status")
				},
				error: function (error) {
					that.middleWare.errorHandler(error, that);
					// MessageToast.show("Error reading Status");
				}
			});
		},

		// Start Production Button Pressed

		whenProductionStart: function () {
			
			var oModel = this.getView().getModel();
			var that = this;
			var ids = this.oArgs;
			const sEntityPath = `/Jobs('${ids}')`;
			const oUpdatedData = {
				status: "In-Progress"
			};
			oModel.update(sEntityPath, oUpdatedData, {
				success: function (data) {
					MessageToast.show("Job Production Started")
					that.getJobsDataByCompanyFilter();
				},

				error: function (error) {
					// Error callback
					that.middleWare.errorHandler(error, that);
					// MessageToast.show("Something is Wrong");
				}
			});
		},





		// getJobsData: function () {
		// 	var sUserRole = this.getView().getModel('appView').getProperty('/UserRole');
		// 	if (sUserRole === "Customer") {
		// 		var id = this.getView().getModel('appView').getProperty('/appUserId');
				// sPath = `/AppUsers('${id}')/job`;
		// 		var sPath = `/Jobs`
		// 	} else {
		// 		var sPath = `/Jobs`
		// 	}
		// 	// 
		// 	var that = this;
		// 	var oModel = this.getView().getModel();
		// 	oModel.read(sPath, {
		// 		success: function (data) {
		// 			that.getView().getModel("appView").setProperty("/jobsData", data.results);
		// 		},
		// 		error: function (error) {
		// 			that.middleWare.errorHandler(error, that);
		// 			MessageToast.show("Something is Wrong");
		// 		}
		// 	});
		// 	// this.middleWare.callMiddleWare("getJobsData", "get").then(function (data, status, xhr) {
		// 	//     that.getView().getModel("appView").setProperty("/jobsData", data);
		// 	// })
		// 	// .catch(function (jqXhr, textStatus, errorMessage) {
		// 	//   that.middleWare.errorHandler(jqXhr, that);
		// 	// });

		// },
		getJobsDataByCompanyFilter: function () {
			
			var id = this.getModel('appView').getProperty('/UserId');
			var payLoad = {
				id,
			}
			var oFilter = encodeURIComponent('{"where":{"CompanyId":{"neq": null}}}');
			var url = 'api/Jobs?filter=' + oFilter
			var that = this;
			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			if (sUserRole === "Customer") {
				this.middleWare.callMiddleWare("JobsCustomer", "POST", payLoad)
					.then(function (data, status, xhr) {
						
						that.getView().getModel("appView").setProperty("/jobsData", data);




					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr, that);
					});
			} else {

				this.middleWare.callMiddleWare(url, "get")
					.then(function (data, status, xhr) {
						that.getView().getModel("appView").setProperty("/jobsData", data);
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr, that);
					});
			}
		},
		onLiveChange: function (oEvent) {
			debugger;
			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var allRemPrinting = this.getView().getModel("appView").getProperty("/allRemainingDatas").Printing
			// this.getView().getModel("appView").setProperty("/Printing", intNewValue);
			if (allRemPrinting >= intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStateTotalPrintingSheets", "None");
				// this.getView().getModel("appView").setProperty("/totalPrintingSheets", "");
				this.getView().getModel("appView").setProperty("/Printing", newValue);
			} else {
				this.getView().getModel("appView").setProperty("/valueStateTotalPrintingSheets", "Error");
				this.getView().getModel("appView").setProperty("/Printing", 0);
				this.getView().getModel("appView").setProperty("/VSTTPrintingSheets", "Value Can't be More than " + allRemPrinting);
			}
		},
		coatingLiveChange: function (oEvent) {
			debugger;
			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			// this.getView().getModel("appView").updateBindings();
			var totalRemCoating = this.getView().getModel("appView").getProperty("/allRemainingDatas").Coating
			var livePrintingValue = this.getView().getModel("appView").getProperty('/Printing')
			if(!livePrintingValue){
				livePrintingValue = 0;
			}
			var totalRemJobValues = totalRemCoating +livePrintingValue;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);
			

				if (totalRemJobValues >= intNewValue) {
					this.getView().getModel("appView").setProperty("/valueStateCoating", "None");
					this.getView().getModel("appView").setProperty("/Coating", newValue);

				} else {
					this.getView().getModel("appView").setProperty("/valueStateCoating", "Error");
					this.getView().getModel("appView").setProperty("/Coating", 0);
					this.getView().getModel("appView").setProperty("/VSTCoating", "Value Can't be More than " + totalRemJobValues);
				}
			
			
		},
		foilingLiveChange: function (oEvent) {
			debugger;
			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var totalRemFoiling = this.getView().getModel("appView").getProperty("/allRemainingDatas").Foiling
			var liveCoatingValue = this.getView().getModel("appView").getProperty('/Coating')
			if(!liveCoatingValue){
				liveCoatingValue = 0;
			}
			var totalRemJobValues = totalRemFoiling + liveCoatingValue;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);
				if (totalRemJobValues >= intNewValue ) {
					this.getView().getModel("appView").setProperty("/valueStateFoiling", "None");
					this.getView().getModel("appView").setProperty("/Foiling", newValue);
				} else {
					this.getView().getModel("appView").setProperty("/valueStateFoiling", "Error");
					this.getView().getModel("appView").setProperty("/Foiling", 0);
					this.getView().getModel("appView").setProperty("/VSTFoiling", "Value Can't be More than " + totalRemJobValues);
				}
			
		},
		spotUVLiveChange: function (oEvent) {
			debugger;
			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var totalRemSpotUV = this.getView().getModel("appView").getProperty("/allRemainingDatas").spotUV
			var liveSpotUVValue = this.getView().getModel("appView").getProperty('/Foiling')
			if(!liveSpotUVValue){
				liveSpotUVValue = 0;
			}
			var totalRemJobValues = totalRemSpotUV + liveSpotUVValue;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);

				if (totalRemJobValues >= intNewValue ) {
					this.getView().getModel("appView").setProperty("/valueStatespotUV", "None");
					this.getView().getModel("appView").setProperty("/spotUV", newValue);
				} else {
					this.getView().getModel("appView").setProperty("/valueStatespotUV", "Error");
					this.getView().getModel("appView").setProperty("/spotUV", 0);
					this.getView().getModel("appView").setProperty("/VSTspotUV", "Value Can't be More than " + totalRemJobValues);
				}
			
			
		},
		embossingLiveChange: function (oEvent) {
			debugger;
			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var totalRemEmbossing = this.getView().getModel("appView").getProperty("/allRemainingDatas").Embossing
			var livespotUVValue = this.getView().getModel("appView").getProperty('/spotUV')
			if(!livespotUVValue){
				livespotUVValue = 0;
			}
			var totalRemJobValues = totalRemEmbossing + livespotUVValue;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);
		

				if (totalRemJobValues >= intNewValue ) {
					this.getView().getModel("appView").setProperty("/valueStateEmbossing", "None");
					this.getView().getModel("appView").setProperty("/Embossing", newValue);
				} else {
					this.getView().getModel("appView").setProperty("/valueStateEmbossing", "Error");
					this.getView().getModel("appView").setProperty("/Embossing", 0);
					this.getView().getModel("appView").setProperty("/VSTEmbossing", "Value Can't be More than " + totalRemJobValues);
				}
			
		},
		punchingLiveChange: function (oEvent) {
			debugger;
			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var totalRemPunching = this.getView().getModel("appView").getProperty("/allRemainingDatas").Punching
			var liveEmbossingValue = this.getView().getModel("appView").getProperty('/Embossing')
			if(!liveEmbossingValue){
				liveEmbossingValue = 0;
			}
			var totalRemJobValues = totalRemPunching + liveEmbossingValue;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);

				if (totalRemJobValues >= intNewValue ) {
					this.getView().getModel("appView").setProperty("/valueStatePunching", "None");
					this.getView().getModel("appView").setProperty("/Punching", newValue);
				} else {
					this.getView().getModel("appView").setProperty("/valueStatePunching", "Error");
					this.getView().getModel("appView").setProperty("/Punching", 0);
					this.getView().getModel("appView").setProperty("/VSTPunching", "Value Can't be More than " + totalRemJobValues);
				}
			
			
		},
		pastingLiveChange: function (oEvent) {
			debugger;
			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var totalRemPasting = this.getView().getModel("appView").getProperty("/allRemainingDatas").Pasting
			var livePunchingValue = this.getView().getModel("appView").getProperty('/Punching')
			if(!livePunchingValue){
				livePunchingValue = 0;
			}
			var totalRemJobValues = totalRemPasting + livePunchingValue;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);
			

				if (totalRemJobValues >= intNewValue ) {
					this.getView().getModel("appView").setProperty("/valueStatePasting", "None");
					this.getView().getModel("appView").setProperty("/Pasting", newValue);
				} else {
					this.getView().getModel("appView").setProperty("/valueStatePasting", "Error");
					this.getView().getModel("appView").setProperty("/Pasting", 0);
					this.getView().getModel("appView").setProperty("/VSTPasting", "Value Can't be More than " + totalRemJobValues);
				}
			
			
			
		},












		onLiveChnagePiecePerBox: function (oEvent) {
			var newPiecePerBox = parseInt(oEvent.getParameter("newValue"));

			var tempPiecePerBox = newPiecePerBox;

			var totalShippingPeices = this.getView().getModel("appView").getProperty("/totalShippingPieces");

			if (newPiecePerBox.toString() === 'NaN') {

				this.getView().getModel("appView").setProperty("/valueStatePiecePerBox", "None");

				this.getView().getModel("appView").setProperty("/VSTPiecePerBox", "");

				this.getView().getModel("appView").setProperty("/totalShippers", 0);

			}

			else if (newPiecePerBox <= totalShippingPeices) {

				this.getView().getModel("appView").setProperty("/valueStatePiecePerBox", "None");

				this.getView().getModel("appView").setProperty("/VSTPiecePerBox", "");

				this.getView().getModel("appView").setProperty("/piecePerBox", tempPiecePerBox);

				var noOfShippers = Math.floor(totalShippingPeices / tempPiecePerBox);

				this.getView().getModel("appView").setProperty("/totalShippers", noOfShippers);

			}

			else {

				this.getView().getModel("appView").setProperty("/valueStatePiecePerBox", "Error");

				this.getView().getModel("appView").setProperty("/piecePerBox", 0);

				this.getView().getModel("appView").setProperty("/VSTPiecePerBox", "Pieces can't be more than " + totalShippingPeices);

				this.getView().getModel("appView").setProperty("/totalShippers", 0);

			}

			this.getView().getModel("appView").updateBindings();





		},

		onLiveChnagePieceToSend: function (oEvent) {




			if (oEvent) {

				var newValue = parseInt(oEvent.getParameter("newValue"));

			} else {

				var newValue = this.getView().getModel("appView").getProperty("/totalShippingPieces");

			}

			var intNewValue = newValue;




			var totalPrintedPieces = this.getView().getModel("appView").getProperty("/totalPrintedSheetsTillNow");

			this.getView().getModel("appView").setProperty("/totalShippingPieces", intNewValue);

			totalPrintedPieces = 14000;

			if (intNewValue.toString() === 'NaN' || totalPrintedPieces >= intNewValue) {




				this.getView().getModel("appView").setProperty("/valueStatePieceToSend", "None");

				this.getView().getModel("appView").setProperty("/VSTPieceToSend", "");

				this.getView().getModel("appView").setProperty("/totalShippingPieces", newValue);





			} else {

				this.getView().getModel("appView").setProperty("/valueStatePieceToSend", "Error");

				this.getView().getModel("appView").setProperty("/totalShippingPieces", 0);

				this.getView().getModel("appView").setProperty("/VSTPieceToSend", "Pieces can't be more than " + totalPrintedPieces);

			}

			this.onLiveChnagePiecePerBox();

			this.getView().getModel("appView").updateBindings();





		},

		getRemJobsStatus: function () {

			debugger;


            var oModel = this.getView().getModel("appView");

            var allJobs = this.getView().getModel("appView").getProperty("/Jobs");

            var noOfUps = allJobs.noOfUps3;

            var totalprintingsheets = allJobs.noOfSheets1;

            var oSumOfData = {

                "Coating": 0,
                "Printing": 0,
                "Punching": 0,
                "Foiling": 0,
                "Embossing": 0,
                "Pasting": 0,
                "spotUV": 0,
                "Packing": 0,
                "rawMaterial": "",
                "InvNo": "",
                "DeliveryNo": ""
            }
            var printingsheet = oModel.getProperty("/newJobStatus");
            for (let i = 0; i < printingsheet.length; i++) {

                var stringNum = printingsheet[i].Printing;
                var coating = printingsheet[i].Coating;
                var foiling = printingsheet[i].Foiling;
                var spotUV = printingsheet[i].spotUV;
                var embossing = printingsheet[i].Embossing;
                var punching = printingsheet[i].Punching;
                var pasting = printingsheet[i].Pasting;


                var integerNumber = parseInt(stringNum);
                var noOfCoating = parseInt(coating);
                var noOfFoiling = parseInt(foiling);
                var noOfSpotUV = parseInt(spotUV);
                var noOfEmbossing = parseInt(embossing);
                var noOfPunching = parseInt(punching);
                var noOfPasting = parseInt(pasting);


                oSumOfData.Printing += integerNumber;
                oSumOfData.Coating += noOfCoating;
                oSumOfData.Foiling += noOfFoiling;
                oSumOfData.spotUV += noOfSpotUV;
                oSumOfData.Embossing += noOfEmbossing;
                oSumOfData.Punching += noOfPunching;
                oSumOfData.Pasting += noOfPasting;

            }

            var remData = {

                "Printing": totalprintingsheets - oSumOfData.Printing,
				"Coating": oSumOfData.Printing - oSumOfData.Coating,
				"Foiling": oSumOfData.Coating - oSumOfData.Foiling,
				"spotUV": oSumOfData.Foiling - oSumOfData.spotUV,
				"Embossing": oSumOfData.spotUV - oSumOfData.Embossing,
				"Punching": oSumOfData.Embossing - oSumOfData.Punching,
				"Pasting": oSumOfData.Punching - oSumOfData.Pasting
            }

            var totalPrintedSheets = oSumOfData.Printing

            // var totalPrintedPieces = (totalPrintedSheets*noOfUps).toString();

            oModel.setProperty("/allRemainingDatas", remData)
            oModel.setProperty("/totalPrintCompleted", totalPrintedSheets)
            oModel.setProperty("/totalPrintedSheetsTillNow", totalPrintedSheets * noOfUps);

        },
		onClickMarkAsUrgent:function(){
			
			var customerAllJobs = this.getView().getModel("appView").getProperty("/jobsData");
			var that = this;
			var selectedJob = this.getView().getModel("appView").getProperty("/Jobs");
			var maxUrgentJobs = Math.ceil(customerAllJobs.length/5)
			var oModel = this.getView().getModel();
			var filterWithMarkAsUrgent = customerAllJobs.filter((job) => {
            return job.Urgent === "Yes"
          });
            var alreadyUrgentJobs = filterWithMarkAsUrgent.length
			if(alreadyUrgentJobs < maxUrgentJobs){
				// selectedJob.Urgent = "Yes"
			var id = this.oArgs;
			const sEntityPath = `/Jobs('${id}')`;
			var payload = {
				"Urgent" : "Yes"
			}
			oModel.update(sEntityPath, payload, {
				success: function (oUpdatedData) {
					MessageToast.show("Marked as Urgent Successfully")
					that.getView().getModel("appView").setProperty("/asUrgentVis", false);
					that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", true);
					that.getJobsDataByCompanyFilter();
				},
				error: function (error) {
					that.middleWare.errorHandler(error, that);
				}
			});
				
			}
			else{
				// MessageToast.show("You Have already assigned "+ maxUrgentJobs + " jobs as Urgent")
				that.onGetDialog(); 	
			}

		},
		ifMarkedAsUrgent: function () {
			var oView = this.getView();
			var that = this;
			if (!this.markasurgentdialog) {
			  this.markasurgentdialog = Fragment.load({
				id: oView.getId(),
				name: "ent.ui.ecommerce.fragments.MarkedAsUrgent",
				controller: this
			  }).then(function (oDialog) {
				// Add dialog to view hierarchy
				oView.addDependent(oDialog);
				return oDialog;
			  }.bind(this));
			}
			return this.markasurgentdialog;
		  },
		  onGetDialog: function (oEvent) {
			// var excelData = oEvent.getSource().getBindingContext("appView").getObject();
			// this.getView().getModel("appView").setProperty("/excelDataUplode", excelData);
			var that = this;
			that.ifMarkedAsUrgent().then(function (oDialog) {
			  oDialog.open();
			 
			});
		  },
		  onCloseMarkAsUrgentDialog: function () {

			this.ifMarkedAsUrgent().then(function (oDialog) {
				var that = this;
				// that.getView().getModel("appView").updateBindings();
				oDialog.close();
			})
		  },


		  onClickRemoveAsUrgent:function(oEvent){
			debugger;
			var oModel = this.getView().getModel();
			var that=this;
			// var data = that.getView().getModel("appView").getProperty("/Jobs");
			if(!oEvent.getSource().getBindingContext("appView")){
			var data = that.getView().getModel("appView").getProperty("/Jobs");
			var id = data.jobCardNo;
			var sPath = `/Jobs('${id}')`
			}
			else{
			var isSelectedJob = oEvent.getSource().getBindingContext("appView").getObject();
			var id = isSelectedJob.jobCardNo;
			var sPath = `/Jobs('${id}')`
			}
			// var sPath = `/Job/('${id}')`;
			var payload ={
				"Urgent":"No"
			}
				oModel.update(sPath,payload, {
							success: function (data) {
								MessageToast.show("Successfully Removed")
								that.getJobsDataByCompanyFilter();
								that.getView().getModel("appView").setProperty("/asUrgentVis", true);
								that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);
								
							},
							error: function (error) {
								that.middleWare.errorHandler(error, that);
								
							}
						});
			

		  }


	});
});