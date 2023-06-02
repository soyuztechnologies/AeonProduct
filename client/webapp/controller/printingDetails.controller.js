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
                function (data){
                    var role = data.role.Role
                    that.getView().getModel('appView').setProperty('/UserRole', role);
                    that.getView().getModel('appView').setProperty('/appUserId', data.role.id);
                    that.getView().getModel('appView').setProperty('/UserEmail', data.role.EmailId);
                    that.userRole();
                    that.getJobsData();
                },
                function (oErr){
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
            oModel.setProperty("/updBtnVisibility", false);
            oModel.setProperty("/onClickModify", false);
            oModel.setProperty("/cancleBtnVis", false);
            // oModel.setProperty("/modifybtnvis", true);
            oModel.setProperty('/visibleImageViewer', false);
            oModel.setProperty('/visibleDownloadButton', false);
            oModel.setProperty('/visiblePdfViewer', false);
            // oModel.setProperty("/visiblePdfViewer", false);
            oModel.updateBindings();
            this.getUserRoleData();
            this.oGetAgru();
            this.onReadJobStatus();
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
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/inputEditable", true)
			oModel.setProperty("/updBtnVisibility", true)
			oModel.setProperty("/onClickModify", true)
			oModel.setProperty("/modifybtnvis", false)
			oModel.setProperty("/cancleBtnVis", true);
			oModel.setProperty("/visibleModify", false);
			oModel.updateBindings();
			this.getUserDataLocal = JSON.parse(JSON.stringify(oModel.getProperty("/jobStatusTabData")));
		},
		onClickUpdate: function () {
			
			this.getView().getModel("appView").setProperty("/onClickModify", false);
			this.getView().getModel("appView").setProperty("/modifybtnvis", true);
			this.getView().getModel("appView").setProperty("/cancleBtnVis", false);
			this.getView().getModel("appView").setProperty("/updBtnVisibility", false);
			this.onUploadData();
		},
		onClickCancle: function () {
			this.getView().getModel("appView").setProperty("/onClickModify", false);
			this.getView().getModel("appView").setProperty("/visibleModify", true);
			this.getView().getModel("appView").setProperty("/modifybtnvis", true);
			this.getView().getModel("appView").setProperty("/cancleBtnVis", false);
			this.getView().getModel("appView").setProperty("/updBtnVisibility", false)
			this.getView().getModel("appView").setProperty("/jobStatusTabData", this.getUserDataLocal)
			this.getModel("appView").updateBindings();
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
		clickedLink:null,
		//* Opens the PO No. Popup
		onClickPopup: function (oEvent) {
			var oData=oEvent.getSource().getBindingContext("appView").getObject();
			
			this.clickedLink=oEvent.getSource().getBinding("text").getPath();
			if (this.clickedLink == "poNo") {
				this.getModel("appView").setProperty("/attachmentFiles",oData.poAttachment)
			}
			else if(this.clickedLink == "artworkCode") {
				this.getModel("appView").setProperty("/attachmentFiles",oData.artworkAttachment)
			}
			var oView = this.getView();
			var that = this;
			// var id = this.oArgs;
			// BusyIndicator.show(0);

			// if (this.clickedLink == "poNo") {
			// 	this.onReadDatadd("/Jobs",id,"/PONo","poAttachment")
			// }
			// else if(this.clickedLink == "artworkCode") {
			// 	this.onReadDatadd("/Jobs",id,"/ArtWork","artworkAttachment");
			// }
			
			

			// this.onReadDatadd("/Jobs",id,"/PONo","poAttachment");

			var oModel = this.getView().getModel("appView");
			// this.onReadData();
			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();

				// BusyIndicator.hide();
				// isPono = true;
				// oModel.setProperty('/browseVis', true);
				// oModel.setProperty('/pdfVisibility', false);
				// var sUserRole = oModel.getProperty('/UserRole');
				// if (sUserRole === 'Customer') {

				// 	oModel.setProperty('/btnVisibility', false);
				// 	// oModel.setProperty('/browseVis', false);

				// }
			});
		},
		allJobDialog:function(){
			debugger;
			this.allJob();
		},
		allJob:function(){
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
				that.getDialogData();
            });
		},
		
		onnReject: function () {
            this.oJobDialog.then(function (oDialog) {
				oDialog.close();
				
				
			})
        },

		getDialogData:function(oEvent){
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

		// * this fucntion will opens the dialog, on to the Artwork filed in job details screen.
		jobStatusPath: null,
		onClickPopupJobStatus: function (oEvent) {
			debugger;
			this.jobStatusPath = oEvent.getSource().getBindingContext("appView").sPath;
			this.clickedLink=oEvent.getSource().getBinding("text").getPath();
			var oView = this.getView();
			var that = this;
			var oModel = this.getView().getModel("appView");
			var element = oModel.getProperty(this.jobStatusPath);
			var id = element.id;

			BusyIndicator.show(0);
			if(this.clickedLink == "DeliveryNo") {
				this.onReadDatadd("/JobStatus",id,"/DeliveryNo","deliveryAttachment");
			}
			else if(this.clickedLink == "InvNo") {
				this.onReadDatadd("/JobStatus",id,"/InvNo","incAttachment");
			}
			// this.onReadDatadd("/JobStatus",id,"/InvNo","incAttachment");

			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();
				BusyIndicator.hide();
				// isPono = false;

				oModel.setProperty('/viewPo', false);
				// this.getModel("appView").setProperty("/visiblePdfViewer", false);
				// oModel.setProperty("/visiblePdfViewer", true);

				var sUserRole = oModel.getProperty('/UserRole');
				if (sUserRole === 'Customer') {
					oModel.setProperty('/browseVis', false);
				}
			});
		},
		// * this function will close the add Attachment dialog.
		onReject: function () {
			var oModel = this.getView().getModel("appView");
			this.oUploadDialog.then(function (oDialog) {
				oDialog.close();
				oModel.setProperty("/PONo", "")
				oModel.setProperty("/ArtWork", "")
				oModel.setProperty('/visibleDownloadButton', false);
				oDialog.updateBindings();

			});
		},

		// * this fucntion will opens the dialog, for factory manager and admin to update the data.
		onPressAdd: function () {
			var oView = this.getView();
			var that = this;

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

			if (!this.Jobstatus) {
				this.Jobstatus = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.Jobstatusdialog",
					controller: this
				}).then(function (oDialog) {
					// Add dialog to view hierarchy
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));

			}
			this.Jobstatus.then(function (oDialog) {
				oDialog.open();
				// that.loadForm2();
				var oSimpleForm2 = that.getView().byId('jobStatusDialog');
				oSimpleForm2.bindElement('appView>/newJob');
			});
		},

		// * this fucntion will close the dialog of the "onPressAdd" or Add button dialog on status.
		onClose: function () {
			this.Jobstatus.then(function (oDialog) {
				oDialog.close();

			});
		},

		onBrowse: function () {

		},

		// * these funciton is handling the upload attachment files in backend.

		onUploadDataPress: function () {
			if (this.clickedLink == "poNo") {
				this.onUploadAttachmentfiles("/PONo");
			}
			else if(this.clickedLink == "artworkCode") {
				this.onUploadAttachmentfiles("/ArtWork",);
			}
			else if(this.clickedLink == "DeliveryNo") {
				this.onUploadJobStatusAttachmentFiles("/DeliveryNo",);
			}
			else if(this.clickedLink == "InvNo") {
				this.onUploadJobStatusAttachmentFiles("/InvNo",);
			}
		},
		onUploadJobStatusAttachmentFiles: function (attachmentPath) {
			var oModel = this.getView().getModel("appView");
			var oData = this.getView().getModel();
			var element = oModel.getProperty(this.jobStatusPath)
			var id = element.id;
			var file = this.getView().getModel('appView').getProperty(attachmentPath);
			var payload = file ? file.attachmentPdfFiles : "";
			BusyIndicator.show(0);
			if(attachmentPath == "/DeliveryNo"){
				var oUpdatedData = {
					deliveryAttachment: payload,
				};
			}
			else if(attachmentPath =="/InvNo"){
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
			var artworkFile = this.getView().getModel('appView').getProperty(attachmentPath);
			var payload = artworkFile ? artworkFile.attachmentPdfFiles : "";
			BusyIndicator.show(0);
			if(attachmentPath == "/PONo"){
				var oUpdatedData = {
					poAttachment: payload,
				};
			}
			else if(attachmentPath =="/ArtWork"){
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

		onSubmitData: function () {
			
			var oNewJobData = this.getModel('appView').getProperty('/newJob');
			oNewJobData.rawMaterial = this.getModel('appView').getProperty('/selectedKey');
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.getView().getModel('appView').getProperty("/jobId");
			const oUpdatedData = {
			};
			oModel.create(`/JobStatus`, oNewJobData, {
				success: function (data) {
					
					MessageToast.show("Successfully Uploaded");
					that.onUploadStatus();
					that.onClose();
				},
				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});

		},

		onReadDatadd: function (endpoint,id, jsonPath, attachmentField) {
			var oModel = this.getView().getModel(); // Default model
			var appModel = this.getView().getModel('appView')
			var that = this;
			var appModel = this.getView().getModel("appView");
			// var ids = this.oArgs;
			// var element = appModel.getProperty(this.jobStatusPath);
			// var id = element.id;
			BusyIndicator.show(0);
		
			oModel.read(`${endpoint}('${id}')`, {
				success: function (data) {
					var oJson = {
						"attachmentPdfFiles" : data[attachmentField]
					};
					// oJson[attachmentPdfFiles] = data[attachmentField];
		
					var type = that.getFileTypes(oJson.attachmentPdfFiles);
					if (type === 'pdf') {
						appModel.setProperty('/visibleImageViewer', false);
						appModel.setProperty('/visibleDownloadButton', false);
						appModel.setProperty('/visiblePdfViewer', true);
					} else if (type === 'image') {
						appModel.setProperty('/visiblePdfViewer', false);
						appModel.setProperty('/visibleImageViewer', true);
						appModel.setProperty('/visibleDownloadButton', true);
					} else {
						appModel.setProperty('/visiblePdfViewer', false);
						appModel.setProperty('/visibleImageViewer', false);
						appModel.setProperty('/visibleDownloadButton', true);
					}
		
					appModel.setProperty(jsonPath, oJson);
					that.oDialogOpen().then(function (oDailog) {
						oDailog.bindElement(`appView>${jsonPath}`);
					});
		
					appModel.updateBindings();
					BusyIndicator.hide();
				},
				error: function (error) {
					BusyIndicator.hide();
					that.middleWare.errorHandler(error, that);
				}
			});
		},
		

		// * this function will read the data of the "PO Attachment's".
		// onReadData: function () {
			
		// 	var oModel = this.getView().getModel();  //default model get at here
		// 	var that = this;
		// 	var ids = this.oArgs;
		// 	var appModel = this.getView().getModel("appView");
		// 	BusyIndicator.show(0);
		// 	// var pdfArtwork
		// 	oModel.read(`/Jobs('${ids}')`, {
		// 		success: function (data) {
					
		// 			var oJson = {
		// 				"attachmentPdfFiles": data.poAttachment
		// 			}
		// 			var oJson2 = {
		// 				"attachmentPdfFiles": data.artworkAttachment
		// 			}
		// 			// var oJson3 = {
		// 			// 	"attachmentPdfFiles": data.deliveryAttachment
		// 			// }
		// 			// var oJson4 = {
		// 			// 	"attachmentPdfFiles": data.incAttachment
		// 			// }

		// 			if (that.clickedLink == "poNo") {
		// 				var type = that.getFileTypes(data.poAttachment);
		// 				if (type == 'pdf') {
		// 					appModel.setProperty('/visibleImageViewer', false);
		// 					appModel.setProperty('/visibleDownloadButton', false);
		// 					appModel.setProperty('/visiblePdfViewer', true);
		// 				}
		// 				else if (type == 'image') {
		// 					appModel.setProperty('/visiblePdfViewer', false);
		// 					appModel.setProperty('/visibleImageViewer', true);
		// 					appModel.setProperty('/visibleDownloadButton', true);
		// 				}
		// 				else {
		// 					appModel.setProperty('/visiblePdfViewer', false);
		// 					appModel.setProperty('/visibleImageViewer', false);
		// 					appModel.setProperty('/visibleDownloadButton', true);
		// 				}
		// 				appModel.setProperty("/PONo", oJson);
		// 				that.oDialogOpen().then(function (oDailog) {
		// 					oDailog.bindElement('appView>/PONo');
		// 				})
		// 			}
		// 			else if(that.clickedLink == "artworkCode") {
		// 				var type = that.getFileTypes(data.artworkAttachment);
		// 				if (type == 'pdf') {
		// 					appModel.setProperty('/visibleImageViewer', false);
		// 					appModel.setProperty('/visibleDownloadButton', false);
		// 					appModel.setProperty('/visiblePdfViewer', true);

		// 				}
		// 				else if (type == 'image') {
		// 					appModel.setProperty('/visiblePdfViewer', false);
		// 					appModel.setProperty('/visibleImageViewer', true);
		// 					appModel.setProperty('/visibleDownloadButton', true);
		// 				}
		// 				else {
		// 					appModel.setProperty('/visiblePdfViewer', false);
		// 					appModel.setProperty('/visibleImageViewer', false);
		// 					appModel.setProperty('/visibleDownloadButton', true);
		// 				}
		// 				// that.getFileTypes(oJson2.attachmentPdfFiles);
		// 				appModel.setProperty("/ArtWork", oJson2);
		// 				that.oDialogOpen().then(function (oDailog) {
		// 					oDailog.bindElement('appView>/ArtWork');
		// 				})
		// 			}
		// 			appModel.updateBindings();
		// 			BusyIndicator.hide();
		// 		},
		// 		error: function (error) {
		// 			// Error callback
		// 			BusyIndicator.hide();
		// 			that.middleWare.errorHandler(error, that);
		// 			// MessageToast.show("Error reading data");
		// 		}
		// 	});

		// },
		downloadAttachments: function () {
			var oModel = this.getView().getModel("appView");
			if ((isPono == true)) {
				var filesartwork = oModel.getProperty("/ArtWork").attachmentPdfFiles;
				var mimeType = filesartwork.split(';')[0].split(':')[1];
				var fileExtension = mimeType.split('/')[1];
				var ponofiles = oModel.getProperty("/PONo").attachmentPdfFiles;	// Convert base64 to a Blob object
				var byteCharacters = atob(ponofiles.split(',')[1]);
				var byteNumbers = new Array(byteCharacters.length);
				for (var i = 0; i < byteCharacters.length; i++) {
					byteNumbers[i] = byteCharacters.charCodeAt(i);
				}
				var byteArray = new Uint8Array(byteNumbers);
				var blob = new Blob([byteArray], { type: "application/octet-stream" });

				fileExtension = fileExtension.includes('sheet') ? "xlsx" : fileExtension;
				File.save(blob, 'NewFile', fileExtension);
			}
			else {
				var filesartwork = oModel.getProperty("/ArtWork").attachmentPdfFiles;
				var mimeType = filesartwork.split(';')[0].split(':')[1];
				var fileExtension = mimeType.split('/')[1];
				var byteCharacters = atob(filesartwork.split(',')[1]);
				var byteNumbers = new Array(byteCharacters.length);
				for (var i = 0; i < byteCharacters.length; i++) {
					byteNumbers[i] = byteCharacters.charCodeAt(i);
				}
				var byteArray = new Uint8Array(byteNumbers);
				var blob = new Blob([byteArray], { type: "application/octet-stream" });


				fileExtension = fileExtension.includes('sheet') ? "xlsx" : fileExtension;
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
		// * this function will read the data of the "Artwork Attachment's".
		// onReadDataArt: function () {
		// 	
		// 	var oModel = this.getView().getModel();  //default model get at here
		// 	var that = this;
		// 	var ids = this.oArgs;
		// 	oModel.read(`/Jobs('${ids}')`, {
		// 		success: function (data) {
		// 			
		// 			var isImgArtwork = data.artworkAttachment.startsWith("data:image/jpeg;base64,");
		// 			if (isImgArtwork) {
		// 				that.getView().getModel("appView").setProperty("/imageBaseArtwork", data.artworkAttachment)
		// 			}
		// 			else {
		// 				console.log(data)

		// 				that.getView().getModel("appView").setProperty("/pdfArtwork", data.artworkAttachment)
		// 			}

		// 			// MessageToast.show("Read Successfully")
		// 		},
		// 		error: function (error) {
		// 			// Error callback
		// 			// that.middleWare.errorHandler(error, that);
		// 			MessageToast.show("Error reading data");
		// 		}
		// 	});

		// },
		// * this funciton will upload the data, of the job status.
		onUploadData: function () {
			
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.oArgs;
			const sEntityPath = `/JobStatus('${ids}')`;
			var rawmaterial = this.getView().getModel('appView').getProperty("/jobStatusTabData/rawMaterial");
			var punching = this.getView().getModel('appView').getProperty("/jobStatusTabData/Punching");
			var foiling = this.getView().getModel('appView').getProperty("/jobStatusTabData/Foiling");
			var coating = this.getView().getModel('appView').getProperty("/jobStatusTabData/Coating");
			var delivery_no = this.getView().getModel('appView').getProperty("/jobStatusTabData/DeliveryNo");
			var embossing = this.getView().getModel('appView').getProperty("/jobStatusTabData/Embossing");
			var inv_no = this.getView().getModel('appView').getProperty("/jobStatusTabData/InvNo");
			var job_id = this.getView().getModel('appView').getProperty("/jobStatusTabData/JobId");
			var jobstatus_id = this.getView().getModel('appView').getProperty("/jobStatusTabData/JobStatusId");
			var packing = this.getView().getModel('appView').getProperty("/jobStatusTabData/Packing");
			var pasting = this.getView().getModel('appView').getProperty("/jobStatusTabData/Pasting");
			var printing = this.getView().getModel('appView').getProperty("/jobStatusTabData/Printing");
			var delivery_att = this.getView().getModel('appView').getProperty("/jobStatusTabData/deliveryAttachment");
			var inc_att = this.getView().getModel('appView').getProperty("/jobStatusTabData/incAttachment");
			var spot_uv = this.getView().getModel('appView').getProperty("/jobStatusTabData/spotUV");
			// var date = new Date()
			// this.getView().getModel('appView').setProperty("/latestDate",date)
			// Perform the read operation
			const oUpdatedData = {
				Coating: coating,
				DeliveryNo: delivery_no,
				Embossing: embossing,
				Foiling: foiling,
				InvNo: inv_no,
				CreatedOn: new Date(),
				JobId: job_id,
				JobStatusId: jobstatus_id,
				Packing: packing,
				Pasting: pasting,
				Printing: printing,
				Punching: punching,
				deliveryAttachment: delivery_att,
				incAttachment: inc_att,
				rawMaterial: rawmaterial,
				spotUV: spot_uv
			};
			oModel.update(sEntityPath, oUpdatedData, {
				success: function (oUpdatedData) {
					
					MessageToast.show("Successfully Uploaded")
					// console.log("Data updated successfully:", oUpdatedData);
					// this.onReadJobStatus();
				},
				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});

		},

		// * this fucntion will read the data for job status and shows into the table.
		onReadJobStatus: function () {
			
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.oArgs;
			var jobId = this.getView().getModel("appView").getProperty("/postId")
			var payload = {
				"jobId": ids
			}

			this.middleWare.callMiddleWare("jobStatusData", "POST", payload)
				.then(function (data) {
					that.getView().getModel("appView").setProperty("/jobStatusTabData", data);
					// debugger
					// MessageToast.show("Success")
				})
				.catch(function (jqXhr, textStatus, errorMessage, error) {
					
					MessageToast.show("Error");
				});
		},

		// * this fucntion will trigerr the onChange event for the fileuploader.
		onChangeFileUploader: function (oEvent) {
			var files = oEvent.getParameter("files");
			
			if (this.clickedLink == "poNo") {
				this.onFileUploader(files,'/PONo');
			}
			else if(this.clickedLink == "artworkCode") {

				this.onFileUploader(files,"/ArtWork");
			}
			else if(this.clickedLink == "InvNo") {

				this.onFileUploader(files,"/InvNo");
			}
			else if(this.clickedLink == "DeliveryNo") {

				this.onFileUploader(files,"/DeliveryNo");
			}
		},

		// * this will handling the fileupload on different phase like pono, artwork,incno,delvieryno.
		onFileUploader: function (files, bindingPath) {
			var that = this;
			var oModel = this.getView().getModel('appView');
			var ojson = {
				"attachmentPdfFiles": ""
			};
		
			if (!files.length) {
				// No files selected
				return;
			}
		
			var reader = new FileReader();
			reader.onload = function (e) {
				try {
					var vContent = e.currentTarget.result;
					var fileType = files[0].type;
		
					if (fileType.startsWith('image/')) {

						oModel.setProperty('/visiblePdfViewer', false);
						oModel.setProperty('/visibleDownloadButton', true);
						oModel.setProperty('/visibleImageViewer', true);

					} else if (fileType === 'application/pdf') {
						oModel.setProperty('/visiblePdfViewer', true);
						oModel.setProperty('/visibleDownloadButton', false);
					} else {
						oModel.setProperty('/visiblePdfViewer', false);
						oModel.setProperty('/visibleImageViewer', false);
						oModel.setProperty('/visibleDownloadButton', true);
					}
		
					ojson.attachmentPdfFiles = vContent;
					that.getView().getModel('appView').setProperty(bindingPath, ojson);
					that.oDialogOpen().then(function (oDialog) {
						oDialog.bindElement("appView>" + bindingPath);
					});
					that.getModel("appView").updateBindings();
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
			// var date = new Date()
			// this.getView().getModel('appView').setProperty("/latestDate",date)
			// Perform the read operation
			const oUpdatedData = {
				status: selectedStatus
			};
			oModel.update(sEntityPath, oUpdatedData, {
				success: function (oUpdatedData) {
					
					MessageToast.show("Successfully Uploaded Status")
					// conole.log("Data updated successfully:", oUpdatedData);
					// thisonReadJobStatus();
				},
				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading Status");
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




		getJobsData:function(){
            var sUserRole = this.getView().getModel('appView').getProperty('/UserRole');
            if(sUserRole ==="Customer"){
                var id =this.getView().getModel('appView').getProperty('/appUserId');
                sPath = `/AppUsers('${id}')/job`;
            }else{
                var sPath = `/Jobs`
            }
            // debugger;
            var that = this;
            var oModel = this.getView().getModel();
            oModel.read(sPath, {
                success: function (data) {
                    that.getView().getModel("appView").setProperty("/jobsData", data.results);
                },
                error: function (error) {
                  // Error callback
                //   that.middleWare.errorHandler(error, that);
                  MessageToast.show("Error reading data");
                }
              });
        },



		// if (oFile.type === "application/pdf") {
		// 	var oReader = new FileReader();
		// 	oReader.onload = function (e) {
		// 		var sUploadedFileContent = e.target.result;
		// 		var sEncodedContent = btoa(sUploadedFileContent);
		// 		var sPdfContent = "data:application/pdf;base64," + sEncodedContent;
		// 		that.getView().getModel('appView').setProperty('/pdf', sPdfContent);
		// 		that.getView().getModel("appView").setProperty("/pdfArtwork", sEncodedContent)
		// 		that.getModel("appView").setProperty("/simpleFormVisibility", false);
		// 		that.getModel("appView").setProperty("/pdfVisibility", false);
		// 		that.getModel("appView").setProperty("/uploadButtonVisibility", true);
		// 		that.getModel("appView").setProperty("/imgVisibility", false);
		// 	};
		// 	oReader.readAsDataURL(oFile);
		// }
		// if (oFile.type === 'image/jpeg') {
		// 	var oReader = new FileReader();
		// 	oReader.onload = function (e) {
		// 		
		// 		var sUploadedFileContent = e.target.result;
		// 		var sEncodedContent = btoa(sUploadedFileContent);
		// 		var sImageContent = "data:image/jpeg;base64," + sEncodedContent; // Update the MIME type accordingly if your image is of a different format
		// 		that.getView().getModel('appView').setProperty('/imageContentArtwork', sImageContent);
		// 		that.getModel("appView").setProperty("/uploadButtonVisibility", true);
		// 		that.getModel("appView").setProperty("/showImgArt", true);
		// 	}.bind(this);
		// 	oReader.readAsDataURL(oFile);
		// }
		// var fileExtension = oFile.name.split(".").pop().toLowerCase();

		// if (fileExtension === "xlsx" || fileExtension === "csv") {
		// // File extension is either xlsx or csv
		// // Proceed with the file reading and parsing logic
		// var oReader = new FileReader();
		// oReader.onload = function(e) {
		// 	var sFileContent = e.target.result;

		// 	if (fileExtension === "xlsx") {
		// 	// Parse the Excel file
		// 	var oWorkbook = XLSX.read(sFileContent, { type: "binary" });
		// 	var oWorksheet = oWorkbook.Sheets[oWorkbook.SheetNames[0]];
		// 	var aData = XLSX.utils.sheet_to_json(oWorksheet, { header: 1 });

		// 	// Process the Excel data
		// 	processData(aData);
		// 	} 
		// 	// Update visibility properties
		// 	that.getModel("appView").setProperty("/pdfVisibility", false);
		// 	that.getModel("appView").setProperty("/simpleFormVisibility", true);
		// 	that.getModel("appView").setProperty("/uploadButtonVisibility", false);
		// 	that.getModel("appView").setProperty("/imgVisibility", false);
		// };

		// oReader.readAsDataURL(oFile);
		// }


		//   function processData(aData) {
		// 	// Do something with the parsed data
		// 	console.log(aData);
		// 	// ...
		//   }

		// if (oFile.type.includes("xlxs")) {
		// 	
		// 	var oReader = new FileReader();
		// 	oReader.onload = function (e) {
		// 		var sFileContent = e.target.result;

		// 		// Parse the Excel file
		// 		var oWorkbook = XLSX.read(sFileContent, { type: "binary" });
		// 		var oWorksheet = oWorkbook.Sheets[oWorkbook.SheetNames[0]];
		// 		var aData = XLSX.utils.sheet_to_json(oWorksheet, { header: 1 });
		// 		that.extracDbFields(aData);
		// 		that.getModel("appView").setProperty("/pdfVisibility", false);
		// 		that.getModel("appView").setProperty("/simpleFormVisibility", true);
		// 		that.getModel("appView").setProperty("/uploadButtonVisibility", false);
		// 		that.getModel("appView").setProperty("/imgVisibility", false);

		// 		
		// 		// Do something with the parsed data
		// 		// console.log(aData);
		// 	};

		// 	oReader.readAsBinaryString(oFile);
		// }
		// },


	});
});