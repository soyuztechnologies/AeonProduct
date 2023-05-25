sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
], function (BaseController, MessageToast, JSONModel, Fragment) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.printingDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("printingDetails").attachPatternMatched(this._matchedHandler, this);

		},
		_matchedHandler: function (oEvent) {
			debugger;
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel("appView").setProperty("/visibleHeader", true);
			this.getModel("appView").setProperty("/visibility", true);
			this.getModel("appView").setProperty("/logoutVisibility", true);
			this.getView().getModel("appView").setProperty("/inputEditable", true);
			this.getView().getModel("appView").setProperty("/pdfVisibility", false);
			this.getView().getModel("appView").setProperty("/imgVisibility", false);
			this.getView().getModel("appView").setProperty("/updBtnVisibility", false);
			this.getView().getModel("appView").setProperty("/onClickModify", false);
			this.getView().getModel("appView").setProperty("/cancleBtnVis", false);
			this.getView().getModel("appView").setProperty("/modifybtnvis", true);
			this.getModel("appView").updateBindings();
			this.getUserRoleData();
			this.loadForm();

			this.oArgs = oEvent.getParameter("arguments").jobId;
			this.oGetAgru();
			this.onReadJobStatus();

		},
		oGetAgru: function () {
			debugger;
			var that = this;
			var oModel = this.getView().getModel();
			oModel.read("/Jobs('" + this.oArgs + "')", {
				success: function (data) {
					debugger;
					// Success callback
					// MessageToast.show("Data get  successfully");
					that.getView().getModel("appView").setProperty("/Jobs", data);
					// Handle the retrieved data
					// var aEntities = data.results; // Access the array of retrieved entities
					// ...
				},
				error: function (error) {
					debugger;
					// Error callback
					that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});
		},
		onModify: function () {

			this.getView().getModel("appView").setProperty("/inputEditable", true)
			this.getView().getModel("appView").setProperty("/updBtnVisibility", true)
			this.getView().getModel("appView").setProperty("/onClickModify", true)
			this.getView().getModel("appView").setProperty("/modifybtnvis", false)
			this.getView().getModel("appView").setProperty("/cancleBtnVis", true)
			this.getUserDataLocal = JSON.parse(JSON.stringify(this.getModel("appView").getProperty("/jobStatusTabData")));
		},
		onClickUpdate: function () {
			debugger;
			this.getView().getModel("appView").setProperty("/onClickModify", false);
			this.getView().getModel("appView").setProperty("/modifybtnvis", true)
			this.getView().getModel("appView").setProperty("/cancleBtnVis", false)
			this.getView().getModel("appView").setProperty("/updBtnVisibility", false)

			this.onUploadData();
		},
		onClickCancle: function () {
			this.getView().getModel("appView").setProperty("/onClickModify", false);
			this.getView().getModel("appView").setProperty("/modifybtnvis", true);
			this.getView().getModel("appView").setProperty("/cancleBtnVis", false);
			this.getView().getModel("appView").setProperty("/updBtnVisibility", false)
			this.getView().getModel("appView").setProperty("/jobStatusTabData", this.getUserDataLocal)
			this.getModel("appView").updateBindings();
			// this.getView().getModel("appView").refresh();

			// this.onReadJobStatus();

		},
		onUpdatePress: function () {
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.getView().getModel('appView').getProperty("/jobId");
			const oUpdatedData = {
			};
			oModel.update(`/JobStatus('${ids}')`, oUpdatedData, {
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
			this.getView().getModel("appView").setProperty("/onClickModify", false);
		},
		loadForm: function () {
			debugger;
			var oSimpleForm = this.getView().byId('jobDetails')
			// oSimpleForm.setModel('appView');
			oSimpleForm.bindElement('appView>/Jobs');
			// MessageToast.show("Checking...")
		},
		// loadForm2: function () {

		// 	var oSimpleForm2 = this.getView().byId('jobStatusDialog');
		// 	oSimpleForm2.bindElement('appView>/jobStatusTabData');
		// },
		// var oSimpleForm2 = this.getView().byId('jobStatus');
		// oSimpleForm2.bindElement('appView>/Jobs');
		// },



		//* Opens the PO No. Popup
		onClickPopup: function () {
			var oView = this.getView();
			var that = this;
			this.onReadData();
			this.onReadDataArt();


			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();
				that.getView().getModel('appView').setProperty('/viewPo', true);
				that.getView().getModel('appView').setProperty('/browseVisArtwork', false);
				that.getView().getModel('appView').setProperty('/browseVis', true);
				that.getView().getModel('appView').setProperty('/viewArt', false);
				that.getView().getModel('appView').setProperty('/pdfartworkVisibility', false);
				that.getView().getModel('appView').setProperty('/pdfVisibility', false);
				var sUserRole = that.getView().getModel('appView').getProperty('/UserRole');
				if (sUserRole === 'Customer') {

					that.getModel('appView').setProperty('/btnVisibility', false);
					that.getModel('appView').setProperty('/browseVis', false);

				}
			});
		},
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
		// ######################################################################

		//      Opens the Artwork Popup

		//  #####################################################################

		onClickPopupArt: function () {
			var oView = this.getView();
			var that = this;
			this.onReadData();
			this.onReadDataArt();

			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();
				that.getView().getModel('appView').setProperty('/viewPo', false);
				that.getView().getModel('appView').setProperty('/viewArt', true);
				that.getView().getModel('appView').setProperty('/browseVisArtwork', true);
				that.getView().getModel('appView').setProperty('/browseVis', false);
				that.getView().getModel('appView').setProperty('/pdfVisibility', false);
				that.getView().getModel('appView').setProperty('/pdfartworkVisibility', false);
				that.getView().getModel('appView').setProperty('/showImg', false);

				// var pdfView1 = that.getView().getModel('appView').getProperty('/pdfartworkVisibility');
				// if(!pdfView1){
				// 	that.getView().getModel('appView').setProperty('/pdfartworkVisibility',false);
				// }
				// else{
				// 	that.getView().getModel('appView').setProperty('/pdfartworkVisibility',true);
				// }


				var sUserRole = that.getView().getModel('appView').getProperty('/UserRole');
				if (sUserRole === 'Customer') {

					that.getModel('appView').setProperty('/btnVisibility', false);
					that.getModel('appView').setProperty('/browseVis', false);
					// that.getModel('appView').setProperty('/modifybtnvis', false);
					// that.getModel('appView').setProperty('/updBtnVisibility', false);

				}
			});
		},







		// ######################################################################

		//      Opens Fragment for Job Status 

		//  #####################################################################
		onPressAdd: function () {
			var oView = this.getView();
			var that = this;

			var oNewJob = {
				"JobStatusId" : this.oArgs,
				"Coating": "",
				"DeliveryNo": "",
				"Embossing": "",
				"Foiling": "",
				"InvNo": "",
				"CreatedOn":new Date(),
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

			this.getModel('appView').setProperty('/newJob',oNewJob);

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
		onClose: function () {
			this.Jobstatus.then(function (oDialog) {
				oDialog.close();

			});
		},






		// ######################################################################

		//      Upload the PO No. Attachment

		//  #####################################################################
		onFileUploaddChange: function (oEvent) {
			var that = this;
			var oFileUploader = oEvent.getSource();
			var oFile = oEvent.getParameter("files")[0];
			debugger;
			if (oFile.type === "application/pdf") {
				var oReader = new FileReader();
				oReader.onload = function (e) {
					var sUploadedFileContent = e.target.result;
					var sEncodedContent = btoa(sUploadedFileContent);
					var sPdfContent = "data:application/pdf;base64," + sEncodedContent;
					that.getView().getModel('appView').setProperty('/pdf', sPdfContent);
					that.getView().getModel("appView").setProperty("/pdfUrl", sEncodedContent)
					that.getModel("appView").setProperty("/simpleFormVisibility", false);
					that.getModel("appView").setProperty("/pdfVisibility", true);
					that.getModel("appView").setProperty("/uploadButtonVisibility", true);
					that.getModel("appView").setProperty("/imgVisibility", false);
					that.getModel("appView").setProperty("/showImg", false);
					var data = that.getModel("appView").getProperty("/pdfVisibility");
					if (!data) {
						that.getModel("appView").setProperty("/viewPo", true);
					}
					else {
						that.getModel("appView").setProperty("/viewPo", false);
					}


				};

				oReader.readAsBinaryString(oFile);
			}
			if (oFile.type === 'image/jpeg') {
				var oReader = new FileReader();
				oReader.onload = function (e) {
					var sUploadedFileContent = e.target.result;
					var sEncodedContent = btoa(sUploadedFileContent);
					var sImageContent = "data:image/jpeg;base64," + sEncodedContent; // Update the MIME type accordingly if your image is of a different format
					that.getView().getModel('appView').setProperty('/imageContent', sImageContent);
					that.getModel("appView").setProperty("/uploadButtonVisibility", true);
					that.getModel("appView").setProperty("/viewPo", false);
					that.getModel("appView").setProperty("/imgVisibility", true);
					that.getModel("appView").setProperty("/showImg", false);
				}.bind(this);
				oReader.readAsBinaryString(oFile);
			}
			if (oFile.type.includes("xml")) {
				debugger;
				var oReader = new FileReader();
				oReader.onload = function (e) {
					var sFileContent = e.target.result;

					// Parse the Excel file
					var oWorkbook = XLSX.read(sFileContent, { type: "binary" });
					var oWorksheet = oWorkbook.Sheets[oWorkbook.SheetNames[0]];
					var aData = XLSX.utils.sheet_to_json(oWorksheet, { header: 1 });
					that.extracDbFields(aData);
					that.getModel("appView").setProperty("/pdfVisibility", false);
					that.getModel("appView").setProperty("/simpleFormVisibility", true);
					that.getModel("appView").setProperty("/uploadButtonVisibility", false);
					that.getModel("appView").setProperty("/imgVisibility", false);

					// debugger;
					// Do something with the parsed data
					// console.log(aData);
				};

				oReader.readAsBinaryString(oFile);
			}
		},
		onReject: function () {
			this.oUploadDialog.then(function (oDialog) {
				oDialog.close();

			});
		},








		onUploadDataPress: function () {
			debugger;
			var oModel = this.getView().getModel(); ///default model get at here
			var that = this;
			var ids = this.oArgs
			var poFile = this.getView().getModel('appView').getProperty("/pdfUrl");
			var artworkAttachment = this.getView().getModel('appView').getProperty("/pdfArtwork")

			if (!poFile) {
				var poFileimg = this.getView().getModel('appView').getProperty("/imageContent");
				var artworkAttachmentimg = this.getView().getModel('appView').getProperty("/imageContentArtwork");

				var oUpdatedData = {
					poAttachment: poFileimg,
					artworkAttachment: artworkAttachmentimg
					// artworkAttachment:artworkFile
				};
			}
			if (!artworkAttachment) {
				var artworkAttachmentimg = this.getView().getModel('appView').getProperty("/imageContentArtwork");
				var poFileimg = this.getView().getModel('appView').getProperty("/imageContent");
				var oUpdatedData = {
					poAttachment: poFileimg,
					artworkAttachment: artworkAttachmentimg
					// artworkAttachment:artworkFile
				};
			}
			if (poFile || artworkAttachment) {
				var oUpdatedData = {
					poAttachment: poFile,
					artworkAttachment: artworkAttachment
					// artworkAttachment:artworkFile
				};
			}
			// Perform the read operation
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








		onFileUploaddChangeArtwork: function (oEvent) {
			var that = this;
			var oFileUploader = oEvent.getSource();
			var oFile = oEvent.getParameter("files")[0];
			debugger;
			if (oFile.type === "application/pdf") {
				var oReader = new FileReader();
				oReader.onload = function (e) {
					var sUploadedFileContent = e.target.result;
					var sEncodedContent = btoa(sUploadedFileContent);
					var sPdfContent = "data:application/pdf;base64," + sEncodedContent;
					that.getView().getModel('appView').setProperty('/pdf', sPdfContent);
					that.getView().getModel("appView").setProperty("/pdfArtwork", sEncodedContent)
					that.getModel("appView").setProperty("/simpleFormVisibility", false);
					that.getModel("appView").setProperty("/pdfVisibility", false);
					that.getModel("appView").setProperty("/pdfartworkVisibility", true);
					that.getModel("appView").setProperty("/uploadButtonVisibility", true);
					that.getModel("appView").setProperty("/imgVisibility", false);
					that.getModel("appView").setProperty("/showImg", false);


					var data = that.getModel("appView").getProperty("/pdfartworkVisibility");
					if (!data) {
						that.getModel("appView").setProperty("/viewArt", true);
					}
					else {
						that.getModel("appView").setProperty("/viewArt", false);
					}
				};
				oReader.readAsBinaryString(oFile);
			}
			if (oFile.type === 'image/jpeg') {
				var oReader = new FileReader();
				oReader.onload = function (e) {
					var sUploadedFileContent = e.target.result;
					var sEncodedContent = btoa(sUploadedFileContent);
					var sImageContent = "data:image/jpeg;base64," + sEncodedContent; // Update the MIME type accordingly if your image is of a different format
					that.getView().getModel('appView').setProperty('/imageContentArtwork', sImageContent);
					that.getModel("appView").setProperty("/uploadButtonVisibility", true);
					that.getModel("appView").setProperty("/viewArt", false);
					that.getModel("appView").setProperty("/showImgArt", true);
				}.bind(this);
				oReader.readAsBinaryString(oFile);
			}
			if (oFile.type.includes("xml")) {
				debugger;
				var oReader = new FileReader();
				oReader.onload = function (e) {
					var sFileContent = e.target.result;

					// Parse the Excel file
					var oWorkbook = XLSX.read(sFileContent, { type: "binary" });
					var oWorksheet = oWorkbook.Sheets[oWorkbook.SheetNames[0]];
					var aData = XLSX.utils.sheet_to_json(oWorksheet, { header: 1 });
					that.extracDbFields(aData);
					that.getModel("appView").setProperty("/pdfVisibility", false);
					that.getModel("appView").setProperty("/simpleFormVisibility", true);
					that.getModel("appView").setProperty("/uploadButtonVisibility", false);
					that.getModel("appView").setProperty("/imgVisibility", false);

					// debugger;
					// Do something with the parsed data
					// console.log(aData);
				};

				oReader.readAsBinaryString(oFile);
			}
		},
		onReject: function () {
			this.oUploadDialog.then(function (oDialog) {
				oDialog.close();

			});
		},
		onSubmitData: function () {
			debugger;
				var oNewJobData = this.getModel('appView').getProperty('/newJob');
				var oModel = this.getView().getModel();  //default model get at here
				var that = this;
				var ids = this.getView().getModel('appView').getProperty("/jobId");
				const oUpdatedData = {
				};
				oModel.create(`/JobStatus`, oNewJobData, {
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
		// ######################################################################

		//      Upload the Document to the Backend

		//  #####################################################################

		onUploadData: function () {
			debugger;
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.oArgs;
			const sEntityPath = `/JobStatus('${ids}')`;
			var rowmaterial = this.getView().getModel('appView').getProperty("/jobStatusTabData/rawMaterial");
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
				rawMaterial: rowmaterial,
				spotUV: spot_uv
			};
			oModel.update(sEntityPath, oUpdatedData, {
				success: function (oUpdatedData) {
					debugger;
					MessageToast.show("Successfully Uploaded")
					console.log("Data updated successfully:", oUpdatedData);
					// this.onReadJobStatus();
				},
				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});

		},
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
					MessageToast.show("Success")
				})
				.catch(function (jqXhr, textStatus, errorMessage, error) {
					debugger;
					MessageToast.show("Error");
				});
			// var oModel = this.getView().getModel(); //default model get at here
			// var that = this;
			// var ids = this.oArgs;
			// // var readParam = "/JobStatus" + ids;
			// const sEntityPath = `/JobStatus('${ids}')`;
			// oModel.read(sEntityPath, {
			// 	success: function (data) {
			// 		debugger;
			// 		// console.log(data)
			// 		// MessageToast.show("Successfully Uploaded")

			// 		that.getView().getModel("appView").setProperty("/jobStatusTabData", data);
			// 		// that.getView().getModel('appView').updateBindings();
			// 		// that.getView().getModel('appView').refresh();
			// 	},
			// 	error: function (error) {
			// 		// Error callback
			// 		// that.middleWare.errorHandler(error, that);
			// 		MessageToast.show("Error reading data");
			// 	}
			// });
		},

		// ######################################################################

		//      Read the PO No. Attachment

		//  #####################################################################
		onReadData: function () {
			debugger;
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.oArgs;
			oModel.read(`/Jobs('${ids}')`, {
				success: function (data) {
					debugger;
					console.log(data)
					var isImg = data.poAttachment.startsWith("data:image/jpeg;base64,");

					if (isImg) {
						that.getView().getModel("appView").setProperty("/imageBase", data.poAttachment)
						that.getView().getModel("appView").setProperty("/viewPo", false)

					}
					else {
						that.getView().getModel("appView").setProperty("/pdfUrldec", data.poAttachment)
					}

					// that.getView().getModel("appView").setProperty("/pdfUrlartwork", data.artworkAttachment)
					that.getView().getModel("appView").setProperty('/showImgArt', false);
					MessageToast.show("Read Successfully")
				},
				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});

		},
		// ######################################################################

		//      Read the Artwork Attachment

		//  #####################################################################
		onReadDataArt: function () {
			debugger;
			var oModel = this.getView().getModel();  //default model get at here
			var that = this;
			var ids = this.oArgs;
			oModel.read(`/Jobs('${ids}')`, {
				success: function (data) {
					debugger;
					var isImgArtwork = data.artworkAttachment.startsWith("data:image/jpeg;base64,");
					if (isImgArtwork) {
						that.getView().getModel("appView").setProperty("/imageBaseArtwork", data.artworkAttachment)
					}
					else {
						console.log(data)

						that.getView().getModel("appView").setProperty("/pdfUrlartwork", data.artworkAttachment)
					}

					MessageToast.show("Read Successfully")
				},
				error: function (error) {
					// Error callback
					// that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});

		},

	});
});