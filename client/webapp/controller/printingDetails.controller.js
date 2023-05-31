sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/BusyIndicator"
], function (BaseController, MessageToast, JSONModel, Fragment, BusyIndicator) {
	"use strict";
	var isPono;
	return BaseController.extend("ent.ui.ecommerce.controller.printingDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("printingDetails").attachPatternMatched(this._matchedHandler, this);

		},
		_matchedHandler: function (oEvent) {
			debugger;
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
			oModel.setProperty("/modifybtnvis", true);
			// oModel.setProperty("/visiblePdfViewer", false);
			oModel.updateBindings();
			this.getUserRoleData();
			this.loadForm();

			this.oArgs = oEvent.getParameter("arguments").jobId;
			this.oGetAgru();
			this.onReadJobStatus();

		},

		// * this funtion is getting the job data in to the page.
		oGetAgru: function () {
			// debugger;
			var that = this;
			var oModel = this.getView().getModel();
			oModel.read("/Jobs('" + this.oArgs + "')", {
				success: function (data) {
					// debugger;
					that.getView().getModel("appView").setProperty("/Jobs", data);
				},
				error: function (error) {
					debugger;
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
			oModel.setProperty("/cancleBtnVis", true)
			this.getUserDataLocal = JSON.parse(JSON.stringify(oModel.getProperty("/jobStatusTabData")));
		},
		onClickUpdate: function () {
			debugger;
			this.getView().getModel("appView").setProperty("/onClickModify", false);
			this.getView().getModel("appView").setProperty("/modifybtnvis", true);
			this.getView().getModel("appView").setProperty("/cancleBtnVis", false);
			this.getView().getModel("appView").setProperty("/updBtnVisibility", false);
			this.onUploadData();
		},
		onClickCancle: function () {
			this.getView().getModel("appView").setProperty("/onClickModify", false);
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
					// debugger;
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
			debugger;
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

		//* Opens the PO No. Popup
		onClickPopup: function (oEvent) {
			debugger;
			var oView = this.getView();
			var that = this;
			BusyIndicator.show(0);
			var oModel = this.getView().getModel("appView");
			this.onReadData();
			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();

				BusyIndicator.hide();
				isPono = true;
				// oModel.setProperty('/browseVis', true);
				oModel.setProperty('/pdfVisibility', false);
				var sUserRole = oModel.getProperty('/UserRole');
				if (sUserRole === 'Customer') {

					oModel.setProperty('/btnVisibility', false);
					// oModel.setProperty('/browseVis', false);

				}
			});
		},
		onSelectKeyRawMaterial: function (oEvent) {
			// debugger;
			var selectedText = oEvent.getParameter("selectedItem").getText();
			this.getView().getModel("appView").setProperty("/selectedKey", selectedText);
		},
		onSelectKeyStatus: function (oEvent) {
			// debugger;
			var selectStatus = oEvent.getParameter("selectedItem").getText();
			this.getView().getModel("appView").setProperty("/selectStatus", selectStatus);
		},

		// * this fucntion will opens the dialog, on to the Artwork filed in job details screen.
		onClickPopupArt: function () {
			var oView = this.getView();
			var that = this;
			var oModel = this.getView().getModel("appView");
			BusyIndicator.show(0);
			this.onReadData();
			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();
				BusyIndicator.hide();
				isPono = false;

				oModel.setProperty('/viewPo', false);
				// this.getModel("appView").setProperty("/visiblePdfViewer", false);
				oModel.setProperty("/visiblePdfViewer", true);

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



		onUploadPoNo: function () {
			debugger;
			var oModel = this.getView().getModel(); ///default model get at here
			var that = this;
			var ids = this.oArgs
			var poFile = this.getView().getModel('appView').getProperty("/PONo");
			var payload = poFile ? poFile.attachmentPdfFiles : "";
			// if(!poFile){
			// 	MessageToast.show("Please Upload The Document");
			// 	return;
			// };
			var oUpdatedData = {
				poAttachment: payload,
				// artworkAttachment:artworkFile
			};
			oModel.update(`/Jobs('${ids}')`, oUpdatedData, {
				success: function (data) {
					debugger;
					MessageToast.show("Successfully Uploaded")
				},
				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});
		},

		onUploadArtWork: function () {
			debugger;
			var oModel = this.getView().getModel(); ///default model get at here
			var that = this;
			var ids = this.oArgs
			var artworkFile = this.getView().getModel('appView').getProperty("/ArtWork");
			var payload = artworkFile ? artworkFile.attachmentPdfFiles : "";


			// if(!artworkAttachment){
			// 	MessageToast.show("Please Upload The Document");
			// 	return
			// }
			var oUpdatedData = {
				artworkAttachment: payload,
			};
			oModel.update(`/Jobs('${ids}')`, oUpdatedData, {
				success: function (data) {
					debugger;
					MessageToast.show("Successfully Uploaded")
				},
				error: function (error) {
					that.middleWare.errorHandler(error, that);
				}
			});
		},



		onUploadDataPress: function () {
			debugger;
			if (isPono == true) {
				this.onUploadPoNo();
			}
			else {
				this.onUploadArtWork();
			}
		},

		onSubmitData: function () {
			debugger;
			var oNewJobData = this.getModel('appView').getProperty('/newJob');
			 oNewJobData.rawMaterial = this.getModel('appView').getProperty('/selectedKey');
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.getView().getModel('appView').getProperty("/jobId");
			const oUpdatedData = {
			};
			oModel.create(`/JobStatus`, oNewJobData, {
				success: function (data) {
					debugger;
					MessageToast.show("Successfully Uploaded");
					that.onClose();
				},
				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});

		},

		// * this function will read the data of the "PO Attachment's".
		onReadData: function () {
			debugger;
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.oArgs;
			var appModel = this.getView().getModel("appView");
			BusyIndicator.show(0);
			// var pdfArtwork
			oModel.read(`/Jobs('${ids}')`, {
				success: function (data) {
					debugger;
					var oJson = {
						"attachmentPdfFiles": data.poAttachment
					}
					var oJson2 = {
						"attachmentPdfFiles": data.artworkAttachment
					}

					if (isPono == true) {
						appModel.setProperty("/PONo", oJson);
						that.oDialogOpen().then(function (oDailog) {
							oDailog.bindElement('appView>/PONo');
						})
					}
					else {
						appModel.setProperty("/ArtWork", oJson2);
						that.oDialogOpen().then(function (oDailog) {
							oDailog.bindElement('appView>/ArtWork');
						})
					}
					appModel.updateBindings();
					BusyIndicator.hide();
				},
				error: function (error) {
					// Error callback
					BusyIndicator.hide();
					that.middleWare.errorHandler(error, that);
					// MessageToast.show("Error reading data");
				}
			});

		},

		// * this function will read the data of the "Artwork Attachment's".
		// onReadDataArt: function () {
		// 	debugger;
		// 	var oModel = this.getView().getModel();  //default model get at here
		// 	var that = this;
		// 	var ids = this.oArgs;
		// 	oModel.read(`/Jobs('${ids}')`, {
		// 		success: function (data) {
		// 			debugger;
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
			debugger;
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
					debugger;
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
			debugger;
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
					debugger
					// MessageToast.show("Success")
				})
				.catch(function (jqXhr, textStatus, errorMessage, error) {
					debugger;
					MessageToast.show("Error");
				});
		},


		// * this fucntion will trigerr the onChange event for the fileuploader.
		onChangeFileUploader: function (oEvent) {
			var files = oEvent.getParameter("files");
			debugger;
			if (isPono == true) {
				this.onFileUploaderPoNoField(files);
			}
			else {

				this.onFileUploaderArtWork(files);
			}
		},

		onFileUploaderArtWork: function (files) {
			var that = this;

			var ojson = {
				"attachmentPdfFiles": ""
			};

			if (!files.length) {
				// No files selected
			}
			var reader = new FileReader();
			reader.onload = function (e) {
				try {
					var vContent = e.currentTarget.result;
					var fileType = files[0].type;

					ojson.attachmentPdfFiles = vContent;
					that.getView().getModel('appView').setProperty('/ArtWork', ojson);
					that.oDialogOpen().then(function (oDialog) {
						oDialog.bindElement("appView>/ArtWork");
					});
					//   oUploadDoc.getModel().updateBindings();
					that.getModel("appView").updateBindings();
				} catch (jqXhr) {
					that.middleWare.errorHandler(jqXhr, that);
				}
			};
			reader.readAsDataURL(files[0]);
		},

		// * this fucntion will use to browse the files for the pono filed in the dialog.
		onFileUploaderPoNoField: function (files) {
			debugger;
			// var files = oEvent.getParameter("files");
			var that = this;

			var ojson = {
				"attachmentPdfFiles": ""
			};

			if (!files.length) {
				// No files selected
			} else {
				var reader = new FileReader();
				reader.onload = function (e) {
					try {
						var vContent = e.currentTarget.result;
						var fileType = files[0].type;


						ojson.attachmentPdfFiles = vContent;
						that.getView().getModel('appView').setProperty('/PONo', ojson);
						that.oDialogOpen().then(function (oDialog) {
							if (fileType.startsWith('image/')) {

							}
							else if (fileType === 'application/pdf') {

							}
							else {

							}
							oDialog.bindElement("appView>/PONo");
						});
						//   oUploadDoc.getModel().updateBindings();
						that.getModel("appView").updateBindings();
					} catch (jqXhr) {
						that.middleWare.errorHandler(jqXhr, that);
					}
				};
				reader.readAsDataURL(files[0]);
			}
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
		// 		// debugger;
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
		// 	debugger;
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

		// 		// debugger;
		// 		// Do something with the parsed data
		// 		// console.log(aData);
		// 	};

		// 	oReader.readAsBinaryString(oFile);
		// }
		// },


	});
});