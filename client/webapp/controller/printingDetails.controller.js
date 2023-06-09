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
			this.oArgs = oEvent.getParameter("arguments").jobId;
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

			}
			// oModel.setProperty("/visiblePdfViewer", false);
			oModel.updateBindings();
			this.getUserRoleData();
			this.oGetAgru();
			this.onReadJobStatus();
			
			
		},
		showAddedFields: function() {
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
			Object.keys(oItemCells).forEach(function(sKey) {
			  var oCell = oItemCells[sKey];
			  var sCellValue = oCell.getText();
		  
			  if (typeof sCellValue === 'undefined' || sCellValue === null) {
				oCell.setVisible(false);
			  }
			});
		  },
		  
		  
		// * this funtion is getting the job data in to the page.
		oGetAgru: function () {

			var that = this;
			var oModel = this.getView().getModel();
			oModel.read("/Jobs('" + this.oArgs + "')", {
				success: function (data) {

					that.getView().getModel("appView").setProperty("/Jobs", data);
					that.loadForm();
				},
				error: function (error) {

					that.middleWare.errorHandler(error, that);
				}
			});
		},

		// * these fucnion will chnage the visibility of the buttons and the files.
		onModify: function () {
			debugger;
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

		onSaveJobStatus: function() {
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
				  success: function(data) {
					MessageToast.show("Successfully Uploaded");
					// that.onUploadStatus();
					oModel.updateBindings();
				  },
				  error: function(error) {
					// Error callback
					that.middleWare.errorHandler(error, that);
					// MessageToast.show("Error reading data");
				  }
				});
			  } else if (jobStatus.TobeUpdated == true) {
				delete jobStatus.TobeUpdated;
				oData.update(sEntityPath, jobStatus, {
				  success: function(Data) {
					MessageToast.show("Successfully Update the Entry");
				  },
				  error: function(error) {
					MessageToast.show("Error reading data");
					// Error callback
					that.middleWare.errorHandler(error, that);
				  }
				});
			  }
			}
		  },
		  
		onClickCancel: function () {
			debugger;
			var oModel = this.getView().getModel("appView");
			var oldData = oModel.getProperty("/newJobStatus");
			oModel.setProperty("/statusInvAttachment", "");
			oModel.setProperty("/statusDeliveryAttachment", "");
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
			return this.oUploadDialog;
		},

		clickedLink: null,
		jobStatusPath: null,
		onClickPopup: function (oEvent) {
			var that = this;
			var oData = oEvent.getSource().getBindingContext("appView").getObject();
			this.clickedLink = oEvent.getSource().getBinding("text").getPath();
			this.jobStatusPath = oEvent.getSource().getBindingContext("appView").sPath;
			var oModel = this.getView().getModel("appView");
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


		onClickAddStatusAttachment: function (oEvent) {
			this.jobAttachmentId = oEvent.getSource().getId();
			var that = this;
			var oModel = this.getView().getModel("appView");
			this.oDialogOpen().then(function (oDialog) {
				oModel.setProperty("/buttonText", "Update");
				oModel.setProperty("/uploadDocumnetTitle", "Upload  Document");
				oDialog.open();
				var sUserRole = oModel.getProperty('/UserRole');
				if (sUserRole === 'Customer') {
					oModel.setProperty('/browseVis', false);
				}

			});
		},

		allJobDialog: function () {
			debugger;
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
				debugger;
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
				"spotUV": ""
			}

			this.getModel('appView').setProperty('/newJob', oNewJob);
			// debugger;
			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			this.openJobstatusDialog().then(function (oDialog) {
				oModel.setProperty("/addJobStatusdialogTitle", "Add Job Status ");
				oModel.setProperty("/addJobStatusSave", "Add");
				that.isEditStatus = false;
				oDialog.open();
				//Editability for Admin
				if (sUserRole === 'Admin') {
					oModel.setProperty("/rawMaterialHeadVis", true);
					oModel.setProperty("/printingHeadVis", true);
					oModel.setProperty("/postPressHeadVis", true);
					oModel.setProperty("/dispatchHeadVis", true);
					oModel.setProperty("/accountHeadVis", true);
					oModel.setProperty("/jobStatusVis", true);
				}
				//Editability for Ram Material Head
				if (sUserRole === 'Raw Material Head') {
					oModel.setProperty("/rawMaterialHeadVis", true);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", false);
					oModel.setProperty("/jobStatusVis", false);
				}
				//Editability for Printing Head
				if (sUserRole === 'Printing Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", true);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", false);
				    oModel.setProperty("/jobStatusVis", false);
				}
				//Editability for Post Press Head
				if (sUserRole === 'Post Press Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", true);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", false);
				    oModel.setProperty("/jobStatusVis", false);
				}
				//Editability for Dispatch Head
				if (sUserRole === 'Dispatch Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", true);
					oModel.setProperty("/accountHeadVis", false);
				    oModel.setProperty("/jobStatusVis", false);
				}
				//Editability for Accounts Head
				if (sUserRole === 'Accounts Head') {
					oModel.setProperty("/rawMaterialHeadVis", false);
					oModel.setProperty("/printingHeadVis", false);
					oModel.setProperty("/postPressHeadVis", false);
					oModel.setProperty("/dispatchHeadVis", false);
					oModel.setProperty("/accountHeadVis", true);
				    oModel.setProperty("/jobStatusVis", false);
				}
				// that.loadForm2();
				var oSimpleForm2 = that.getView().byId('jobStatusDialog');
				oSimpleForm2.bindElement('appView>/newJob');
			});
		},

		// * this fucntion will close the dialog of the "onPressAdd" or Add button dialog on status.
		onClose: function () {
			this.openJobstatusDialog().then(function (oDialog) {
				oDialog.close();

			});
		},

		// * this fucntion is triger when user click on save in fragment.
		onSubmitData: function () {
			// debugger;
			var oModel = this.getView().getModel("appView");  //default model get at here

			var oldData = oModel.getProperty("/newJobStatus");

			var oNewJobData = oModel.getProperty('/newJob');
			oNewJobData.rawMaterial = oModel.getProperty('/selectedKey');
			// this for the attachments files in jobstatus.
			oNewJobData.incAttachment = oModel.getProperty("/statusInvAttachment");
			oNewJobData.deliveryAttachment = oModel.getProperty("/statusDeliveryAttachment");
			


			if (!this.isEditStatus) {
				oNewJobData.TobeUpdated = "X";
				oldData.push(oNewJobData);

			}
			// oNewJobData.TobeUpdated = true;
			oModel.setProperty("/newJobStatus", oldData);

			// oModel.setProperty("/newJobStatus", oldData);

			// var data = oModel.getProperty('/newJobStatus');
			// var id = oldData[0].id;
			// const sEntityPath = `/JobStatus('${id}')`;
			// var oData = this.getView().getModel();

			// if (this.isEditStatus == true) {
			// 	oData.update(sEntityPath, oldData[0], {
			// 		success: function (Data) {
			// 			MessageToast.show("Successfully Update the Entry");
			// 		},
			// 		error: function (error) {
			// 			// Error callback
			// 			that.middleWare.errorHandler(error, that);
			// 		}
			// 	});
			// }
			oModel.updateBindings();
			oModel.refresh();
			this.onClose();

		},

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
			this.isEditStatus = true;
			debugger;
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

			this.openJobstatusDialog().then(function (oDialog) {
				oModel.setProperty("/addJobStatusdialogTitle", "Edit Job Status ");
				oModel.setProperty("/addJobStatusSave", "Update");
				oDialog.open();
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
					if(!data){
						return
					}
					data.forEach(item => {
						item.TobeUpdated = false;
					});
					oModel.setProperty("/readedJobdata", data);
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
				this.onFileUploader(files);
			}
			else if (this.clickedLink == "artworkCode") {

				this.onFileUploader(files);
			}
			else if (this.clickedLink == "InvNo") {

				this.onFileUploader(files);
			}
			else if (this.clickedLink == "DeliveryNo") {

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
					oModel.updateBindings();

					var idbtn = that.jobAttachmentId;
					if (!idbtn) {
						return;
					}
					else if (idbtn.includes("DeliveryStatus")) {
						oModel.setProperty("/statusDeliveryAttachment", vContent);
					}
					else if (idbtn.includes("Invstatus")) {
						oModel.setProperty("/statusInvAttachment", vContent);

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
				success: function (oUpdatedData) {

					MessageToast.show("Job Production Started")
					// that.getView().getModel("appView").setProperty("/addJobStatusVis",false)
					// that.getView().getModel("appView").setProperty("/modifybtnvis",false)
					that.getJobsData();
				},

				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Something is Wrong");
				}
			});
		},




		getJobsData: function () {
			var sUserRole = this.getView().getModel('appView').getProperty('/UserRole');
			if (sUserRole === "Customer") {
				var id = this.getView().getModel('appView').getProperty('/appUserId');
				sPath = `/AppUsers('${id}')/job`;
			} else {
				var sPath = `/Jobs`
			}
			// debugger;
			var that = this;
			var oModel = this.getView().getModel();
			oModel.read(sPath, {
				success: function(data){
					that.getView().getModel("appView").setProperty("/jobsData", data.results);
				},
				error: function(error){
					that.middleWare.errorHandler(error, that);
					MessageToast.show("Something is Wrong");
				}
			});
            // this.middleWare.callMiddleWare("getJobsData", "get").then(function (data, status, xhr) {
            //     that.getView().getModel("appView").setProperty("/jobsData", data);
            // })
            // .catch(function (jqXhr, textStatus, errorMessage) {
            //   that.middleWare.errorHandler(jqXhr, that);
			// });
		
		},
		onLiveChange: function (event) {
			var newValue = event.getParameter("value");
            var value = this.getView().getModel("appView").getProperty("/allRemainingDatas");
            var maxValue = value.Printing;
            var maxLength = 4;
            var isValid = this.isValueValid(newValue, maxValue);
            var inputControl = event.getSource();
            if (!isValid) {
                inputControl.setValueState("Error");
                //   if (parseInt(event.getParameter('value')) > maxValue) {
                //  // event.getSource().setValue(event.getParameter('value').substring(0, maxLength))
                //   }
                inputControl.setValueStateText("Value cannot exceed more than:" + maxValue);

                this.getView().getModel("appView").setProperty("/saveEnabled", false)

            } else {

                inputControl.setValueState("None");

                this.getView().getModel("appView").setProperty("/saveEnabled", true)

            }

        },

        isValueValid: function (value, maxValue) {

            return value <= maxValue;




        },




        // getremainingJobData: function () {




        //  var oModel = this.getView().getModel();  //default model get at here




        //  var that = this;




        //  var ids = this.oArgs;




        //  var jobId = this.getView().getModel("appView").getProperty("/postId")




        //  var payload = {




        //      "jobId": ids




        //  }




        //  this.middleWare.callMiddleWare("getRemJobStatus", "POST", payload)




        //      .then(function (data) {




        //          debugger;




        //          that.getView().getModel("appView").setProperty("/remJobData", data);




        //      })




        //      .catch(function (jqXhr, textStatus, errorMessage, error) {




                   




        //          MessageToast.show("Error");




        //      });




        // },

        getRemJobsStatus: function(){

            debugger;

            var oModel = this.getView().getModel("appView");

            var allJobs = this.getView().getModel("appView").getProperty("/Jobs");

            var totalprintingsheets = allJobs.noOfSheets1;

            var oSumOfData = {

                "Coating":0,

                "Printing":0,

                "Punching":0,

                "Foiling":0,

                "Embossing":0,

                "Pasting":0,

                "spotUV":0,

                "Packing":0,

                "rawMaterial":"",

                "InvNo":"",

                "DeliveryNo":""

            }

            var printingsheet = oModel.getProperty("/newJobStatus");

            for (let i = 0; i < printingsheet.length; i++) {

                var stringNum = printingsheet[i].Printing;

                var integerNumber = parseInt(stringNum);

                oSumOfData.Printing += integerNumber;

            }

            var remData = {

                "Printing": totalprintingsheets - oSumOfData.Printing

            }

            oModel.setProperty("/allRemainingDatas",remData)

        }


	});
});