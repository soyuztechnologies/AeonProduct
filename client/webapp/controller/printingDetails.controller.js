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
			this.getView().getModel("appView").setProperty("/inputEditable", false);
			this.getView().getModel("appView").setProperty("/pdfVisibility", false);
			this.getView().getModel("appView").setProperty("/imgVisibility", false);
			this.getView().getModel("appView").setProperty("/updBtnVisibility", false);
			this.getView().getModel("appView").setProperty("/onClickModify", false);
			this.getModel("appView").updateBindings();
			debugger;
			this.loadForm();
			this.loadForm2();
			this.getUserRoleData();

			// this.getJobsData();
			var oArgs = oEvent.getParameter("arguments").jobId;
			this.oGetAgru(oArgs);
		},
		oGetAgru: function(oArgs){
			debugger;
			var that = this;
			var oModel= this.getView().getModel();
			oModel.read("/Jobs('" + oArgs +"')", {
				success: function(data) {
					debugger;
				// Success callback
				// MessageToast.show("Data get  successfully");
				that.getView().getModel("appView").setProperty("/Jobs", data);
				// Handle the retrieved data
				// var aEntities = data.results; // Access the array of retrieved entities
				// ...
				
				},
				error: function(error) {
					debugger;
				// Error callback
				that.middleWare.errorHandler(error, that);
				MessageToast.show("Error reading data");
				}
			  });
			},
		onClickModify: function () {

			this.getView().getModel("appView").setProperty("/inputEditable", true)
			this.getView().getModel("appView").setProperty("/updBtnVisibility", true)
			this.getView().getModel("appView").setProperty("/onClickModify", true)
		},
		onClickUpdate: function () {
			debugger;
			this.getView().getModel("appView").setProperty("/inputEditable", false);
		},
		loadForm: function () {
			debugger;
			var oSimpleForm = this.getView().byId('jobDetails')
			// oSimpleForm.setModel('appView');
			oSimpleForm.bindElement('appView>/Jobs');
			// MessageToast.show("Checking...")


		},
		loadForm2: function () {

			var oSimpleForm2 = this.getView().byId('jobStatus');
			oSimpleForm2.bindElement('appView>/Jobs');
		},
		onClickPopup: function () {
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
			this.oUploadDialog.then(function (oDialog) {
				oDialog.open();
			});
		},

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

					// var oPdfFrame = document.getElementById("pdfFrame");
					// oPdfFrame.src = sPdfContent;
					var a = document.createElement('a');
					a.href = sPdfContent;
					var pdfUrl = a.href;
					// console.log('PDF URL:', pdfUrl);
					that.getView().getModel("appView").setProperty("/pdfUrl", sEncodedContent)
					that.getModel("appView").setProperty("/simpleFormVisibility", false);
					that.getModel("appView").setProperty("/pdfVisibility", true);
					that.getModel("appView").setProperty("/uploadButtonVisibility", true);
					that.getModel("appView").setProperty("/imgVisibility", false);

				};

				oReader.readAsBinaryString(oFile);
			}
			if (oFile.type === 'application/msword') {
				var oReader = new FileReader();
				oReader.onload = function (e) {
					var sUploadedFileContent = e.target.result;
					var sEncodedContent = btoa(sUploadedFileContent);
					var sWordContent = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," + sEncodedContent;
					// var oWordFrame = this.getView().byId("wordFrame");
					// oWordFrame.setAttribute("src", sWordContent);
					that.getView().getModel('appView').setProperty('/wordContent', sEncodedContent);
					that.getModel("appView").setProperty("/uploadButtonVisibility", true);
					that.getModel("appView").setProperty("/imgVisibility", false);
				}.bind(this);
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
					that.getModel("appView").setProperty("/imgVisibility", true);
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
		onUploadData: function () {
			debugger;
			var oModel = this.getView().getModel();  //default model get at here
			var that = this; 
			var ids = this.getView().getModel('appView').getProperty("/jobId");
			var poFile = this.getView().getModel('appView').getProperty("/pdfUrl");
			// Perform the read operation
			const oUpdatedData = {
			poAttachment: poFile,
			// artworkAttachment:artworkFile
		  };
			oModel.update(`/Jobs('${ids}')`,oUpdatedData ,{
				success: function(data) {
					debugger;
					MessageToast.show("Successfully Uploaded")
				},
				error: function(error) {
				// Error callback
				// that.middleWare.errorHandler(error, that);
				MessageToast.show("Error reading data");
				}
			});

		},

		// getJobsData: function() {
		// 	debugger;
		// 	var oModel = this.getView().getModel();  //default model get at here
		// 	var that = this; 
		// 	// Perform the read operation
		// 	oModel.read('/Jobs', {
		// 		success: function(data) {
		// 		// Success callback
		// 		console.log(data);
		// 		MessageToast.show("Data read successfully");
		// 		that.getView().getModel("appView").setProperty("/jobsData",data.results);
		// 		},
		// 		error: function(error) {
		// 		that.middleWare.errorHandler(error, that);
		// 		// MessageToast.show("Error reading data");
		// 		}
		// 	});
		// }

	});
});