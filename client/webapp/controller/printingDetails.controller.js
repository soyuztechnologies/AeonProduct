
sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/BusyIndicator",
	"sap/ui/core/util/File",
	"sap/ui/unified/FileUploader",
	"sap/m/Token",
	"sap/m/MessageBox",
	"ent/ui/ecommerce/pdfgen/pdfEngine"

], function (BaseController, MessageToast, JSONModel, Fragment, BusyIndicator, File, FileUploader, Token, MessageBox,pdfEngine) {
	"use strict";
	var isPono;
	return BaseController.extend("ent.ui.ecommerce.controller.printingDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("sideNavallPrinters").attachPatternMatched(this._matchedHandler, this);
			this.getRouter().getRoute("sideNavPaperCutting").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavPrinting").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavCoating").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavFoiling").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavSpotUV").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavEmbossing").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavPunching").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavPasting").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavReadyForDispatch").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavPacking").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavDispatched").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavDelivering").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);
			this.getRouter().getRoute("sideNavOthers").attachPatternMatched(this._sideNavPrintingmatchedHandler, this);

		},


		_sideNavPrintingmatchedHandler: async function (oEvent) {


			var path = this.getRouter().oHashChanger.hash.split("/")[0];
			this.getView().getModel('appView').setProperty('/path', path);
			// var that = this;
			// await this.getUserRoleData().then(
			// 	function (data) {
			// 		var role = data.role.Role
			// 		that.getView().getModel('appView').setProperty('/UserRole', role);
			// 		that.getView().getModel('appView').setProperty('/appUserId', data.role.id);
			// 		that.getView().getModel('appView').setProperty('/UserEmail', data.role.EmailId);
			// 		that.userRole();
			// 		// that.getCompanyName();
			// 	},
			// 	function (oErr) {
			// 		that.middleWare.errorHandler(jqXhr, that);
			// 	}
			// );

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
					// that.getJobsDataByStatusFilter();
				},
				function (oErr) {
					that.middleWare.errorHandler(jqXhr, that);
				}
			);
			const date = new Date();
			this.getView().getModel("appView").setProperty("/dateNow", date)
			// that.getView().getModel("appView").setProperty("/asUrgentVis", false);
			// that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);
			var oModel = this.getModel("appView")
			oModel.setProperty("/layout", "TwoColumnsMidExpanded");
			oModel.setProperty("/visibleHeader", true);
			oModel.setProperty("/hamburgerVisibility", true);
			oModel.setProperty("/downloadButtonVisibility", true);
			oModel.setProperty("/userRoleVis", true);
			oModel.setProperty("/visibility", true);
			oModel.setProperty("/logoutVisibility", true);
			oModel.setProperty("/inputEditable", true);
			oModel.setProperty("/imgVisibility", false);
			oModel.setProperty("/onClickModify", false);
			oModel.setProperty("/addBtnVisible", true);
			oModel.setProperty("/editableFields", false);
			oModel.updateBindings();
			// this.getCompanyName();
			// this.getUserRoleData();
			this.oGetAgru();
			this.onReadJobStatus();
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
					// that.x();
					// that.getJobsDataByCompanyFilter();
				},
				function (oErr) {
					that.middleWare.errorHandler(jqXhr, that);
				}
			);
			const date = new Date();
			this.getView().getModel("appView").setProperty("/dateNow", date)
			// that.getView().getModel("appView").setProperty("/asUrgentVis", false);
			// that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);
			var oModel = this.getModel("appView")
			oModel.setProperty("/layout", "TwoColumnsMidExpanded");
			oModel.setProperty("/visibleHeader", true);
			oModel.setProperty("/hamburgerVisibility", true);
			oModel.setProperty("/userRoleVis", true);
			oModel.setProperty("/visibility", true);
			oModel.setProperty("/logoutVisibility", true);
			oModel.setProperty("/inputEditable", true);
			oModel.setProperty("/imgVisibility", false);
			oModel.setProperty("/onClickModify", false);
			oModel.setProperty("/addBtnVisible", true);
			oModel.setProperty("/editableFields", false);
			// oModel.setProperty("/aeonHeaderVis", true);

			// oModel.setProperty("/btnVisibility", true);
			var sUserRole = oModel.getProperty('/UserRole');
			if (sUserRole === 'Customer') {

				oModel.setProperty('/visibleModify', false);

				oModel.setProperty("/addBtnVisible", false);

				oModel.setProperty("/cancleBtnVis", false);

				oModel.setProperty("/updBtnVisibility", false);

				oModel.setProperty("/editColumnVisible", false);




			} else if (sUserRole === "Artwork Head") {

				oModel.setProperty("/addBtnVisible", false);
				oModel.setProperty("/editColumnVisible", false);
				oModel.setProperty("/updBtnVisibility", false);
				this.getView().getModel("appView").setProperty("/asUrgentVis", false);
				this.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);

			} else {
				oModel.setProperty("/editColumnVisible", true);
			}
			// oModel.setProperty("/visiblePdfViewer", false);
			oModel.updateBindings();
			// this.getCompanyName();
			// this.getUserRoleData();
			this.oGetAgru();
			this.onReadJobStatus();



		},

		//this fragment open when click on remark

		openRemarkJobStatus: function () {

			var oView = this.getView();

			var that = this;

			if (!this.remarkJobStatus) {

				this.remarkJobStatus = Fragment.load({

					id: oView.getId(),

					name: "ent.ui.ecommerce.fragments.printingDetailFragment.RemarkJobStatus",

					controller: this

				}).then(function (oDialog) {

					// Add dialog to view hierarch

					oView.addDependent(oDialog);

					return oDialog;

				}.bind(this));

			}

			return this.remarkJobStatus;

		},

		onRemarkClick: function () {

			

			var that = this;

			that.openRemarkJobStatus().then(function (remarkDialog) {

				remarkDialog.open();

				that.getView().byId("idRemarkDialog").bindElement("appView>/newJobStatus/0");

			});

		},

		//this function hits when we click on update

		onRemarkFragupdate: function () {

			

			var that = this;

			var dModel = this.getView().getModel();

			var oModel = this.getView().getModel("appView");

			var allJobsData = this.getView().getModel("appView").getProperty("/jobsData");

			var remark1Img = oModel.getProperty("/logoRemark1");

			var remark2Img = oModel.getProperty("/logoRemark2");

			var remark3Img = oModel.getProperty("/logoRemark3");

			var jobStatusDatass = oModel.getProperty("/newJobStatus/0");
			this.getView().getModel("appView").setProperty("/jobDataOnWhichRemarkReceived",jobStatusDatass.JobStatusId);
			var filterWithRemark = allJobsData.filter((job) => {

				return job.remark1 !== null;

			});

			var id = jobStatusDatass.id;

			const sEntityPath = `/JobStatus('${id}')`;

			const payload = {

				"remark1": jobStatusDatass.remark1,

				"remark2": jobStatusDatass.remark2,

				"remark3": jobStatusDatass.remark3,

				"remark1Img": remark1Img,

				"remark2Img": remark2Img,

				"remark3Img": remark3Img

			};

			if (!payload.remark1 && !payload.remark1Img && !payload.remark2 && !payload.remark2Img && !payload.remark3 && !payload.remark3Img) {

				MessageToast.show("Please Add Any Remark");

				return;

			}

			dModel.update(sEntityPath, payload, {

				success: function (data) {

					MessageToast.show("successfully Remark uploaded");

					that.getView().byId("idRemarkDialog").bindElement("appView>/newJobStatus/0");
					that.onRemarkFragClose();
					that.emailSendForRemark();
					that.whenProductionStart();
					that.onReadJobStatus();



				},

				error: function (error) {

					that.middleWare.errorHandler(error, that);

					// console.error("PATCH request failed");

				}

			});

		},
				// this function hits when we click on update and a email will go to tarun 	
				emailSendForRemark: function() {
					var oModel = this.getView().getModel('appView')
					var JobData = oModel.getProperty("/jobDataOnWhichRemarkReceived");
					var that = this;
					var payload = {JobData}
					this.middleWare.callMiddleWare("remarkEmailSend", "POST", payload)
						.then(function (data, status, xhr) {
							MessageToast.show("Success")
							// that.onReject();
						})
						.catch(function (jqXhr, textStatus, errorMessage) {
							MessageToast.show("error")
							// that.middleWare.errorHandler(jqXhr, that);
						});
				
				},

		//this function hits when we click on close

		onRemarkFragClose: function () {

			this.openRemarkJobStatus().then(function (remarkDialog) {

				remarkDialog.close();

			});

		},
		handleUploadRemark: function (oEvent) {

			
			var files = oEvent.getParameter("files");
			this.getView().getModel("appView").setProperty("/remarkFileAttached", files);

			var that = this;

			var oModel = this.getView().getModel("appView");

			var selectedButtonName = oEvent.getSource().getId().split('--')[2];
			// var Data = oModel.getProperty("/newJobStatus/0");
			//   this.remark1AlreadyThere =  Data.remark1Img;
			//   this.remark2AlreadyThere =  Data.remark2Img;
			//   this.remark3AlreadyThere =  Data.remark3Img;

			if (!files.length) {

			} else {

				var reader = new FileReader();

				reader.onload = function (e) {

					try {

						var vContent = e.currentTarget.result;

						var stream = that.getImageUrlFromContentforRemark(vContent);

						if (selectedButtonName === "idRemark1") {
							oModel.setProperty("/logoRemark1", vContent)
						}

						if (selectedButtonName === "idRemark2") {
							oModel.setProperty("/logoRemark2", vContent)
						}

						if (selectedButtonName === "idRemark3") {
							oModel.setProperty("/logoRemark3", vContent)
						}

						oModel.updateBindings();

					} catch (jqXhr) {

						that.middleWare.errorHandler(jqXhr, that);

					}

				};

				reader.readAsDataURL(files[0]);

			}

		},



		getImageUrlFromContentforRemark: function (base64Stream) {

			

			if (base64Stream) {

				var b64toBlob = function (dataURI) {

					var byteString = atob(dataURI.split(',')[1]);

					var ab = new ArrayBuffer(byteString.length);

					var ia = new Uint8Array(ab);

					for (var i = 0; i < byteString.length; i++) {

						ia[i] = byteString.charCodeAt(i);

					}

					return new Blob([ab], {

						type: 'image/jpeg'

					});

				};

				var x = b64toBlob(base64Stream);

				return URL.createObjectURL(x);

			}

		},

		// This function hits when click on show logo

		onShowRemark: function (oEvent) {

			
			var oModel = this.getView().getModel('appView')
			this.getRemark1Img = oModel.getProperty("/readedJobdata/0/remark1Img")
			this.getRemark2Img = oModel.getProperty("/readedJobdata/0/remark2Img")
			this.getRemark3Img = oModel.getProperty("/readedJobdata/0/remark3Img")
			var selectedButtonId = oEvent.getParameter('id').split('--')[2]

			var newImgBrowsed1 = this.getModel("appView").getProperty("/logoRemark1");
			var newImgBrowsed2 = this.getModel("appView").getProperty("/logoRemark2");
			var newImgBrowsed3 = this.getModel("appView").getProperty("/logoRemark3");

			if (selectedButtonId === "showRemark1") {
				if (this.getRemark1Img != null) {
					if (newImgBrowsed1) {
						var oLogo = this.getModel("appView").getProperty("/logoRemark1");
					} else {
						var oLogo = this.getRemark1Img;
					}
				} else {

					var oLogo = this.getModel("appView").getProperty("/logoRemark1");
				}
			}

			if (selectedButtonId === "showRemark2") {
				if (this.getRemark2Img != null) {
					if (newImgBrowsed2) {
						var oLogo = this.getModel("appView").getProperty("/logoRemark2");
					} else {
						var oLogo = this.getRemark2Img;
					}
				} else {

					var oLogo = this.getModel("appView").getProperty("/logoRemark2");
				}
			}

			if (selectedButtonId === "showRemark3") {
				if (this.getRemark3Img != null) {
					if (newImgBrowsed3) {
						var oLogo = this.getModel("appView").getProperty("/logoRemark3");
					} else {
						var oLogo = this.getRemark3Img;
					}
				} else {

					var oLogo = this.getModel("appView").getProperty("/logoRemark3");
				}
			}

			var stream = this.formatter.getImageUrlFromContent(oLogo);

			if (!this.lightBox) {

				this.lightBox = new sap.m.LightBox("lightBoxx", {

					imageContent: [new sap.m.LightBoxItem({

						imageSrc: stream

					})]

				});

				this.lightBox.open();

			} else {

				this.lightBox.getImageContent()[0].setImageSrc(stream);

				this.lightBox.open();

			}

		},



		// //this function hits when we click on download remark

		// onDownlodeRemark: function (oEvent) {


		// 	var that = this;
		// 	this.remarkoEvent = oEvent.getParameter('id').split('--')[2]

		// 	that.getCurrentDateAndTime();

		// 	// Function to check if the code is running in Cordova for Android environment

		// 	function isCordovaAndroidEnvironment() {

		// 		return window.cordova;

		// 	}



		// 	// Usage

		// 	if (isCordovaAndroidEnvironment()) {

		// 		// Cordova for Android environment, use Cordova-specific functionality

		// 		that.downloadAttachmentCordova();

		// 	} else {

		// 		// Web browser environment or other platforms, use browser-specific functionality

		// 		that.downloadRemarkWeb();

		// 	}

		// },



		// //this function is for download the remark for web

		// downloadRemarkWeb: function () {
		// 	var oModel = this.getView().getModel("appView");
		// 	this.backendRemark1 = oModel.getProperty("/readedJobdata/0/remark1Img");
		// 	this.backendRemark2 = oModel.getProperty("/readedJobdata/0/remark2Img");
		// 	this.backendRemark3 = oModel.getProperty("/readedJobdata/0/remark3Img");

		// 	var newUploadImgDown1 = oModel.getProperty("/logoRemark1");
		// 	var newUploadImgDown2 = oModel.getProperty("/logoRemark2");
		// 	var newUploadImgDown3 = oModel.getProperty("/logoRemark3");

		// 	if (this.remarkoEvent === "downloadRemark1") {
		// 		if (this.backendRemark1 != null) {
		// 			if (newUploadImgDown1) {
		// 				var remark1Download = oModel.getProperty("/logoRemark1");
		// 			} else {
		// 				var remark1Download = this.backendRemark1;
		// 			}
		// 		} else {
		// 			var remark1Download = oModel.getProperty("/logoRemark1");
		// 		}
		// 	}
		// 	if (this.remarkoEvent === "downloadRemark2") {
		// 		if (this.backendRemark2 != null) {
		// 			if (newUploadImgDown2) {
		// 				var remark2Download = oModel.getProperty("/logoRemark2");
		// 			} else {
		// 				var remark2Download = this.backendRemark2;
		// 			}
		// 		} else {
		// 			var remark2Download = oModel.getProperty("/logoRemark2");
		// 		}
		// 	}
		// 	if (this.remarkoEvent === "downloadRemark3") {
		// 		if (this.backendRemark3 != null) {
		// 			if (newUploadImgDown3) {
		// 				var remark3Download = oModel.getProperty("/logoRemark3");
		// 			} else {
		// 				var remark3Download = this.backendRemark3;
		// 			}
		// 		} else {
		// 			var remark3Download = oModel.getProperty("/logoRemark3");
		// 		}
		// 	}

		// 	var mapping = {
		// 		"remark1Img": remark1Download,
		// 		"remark2Img": remark2Download,
		// 		"remark3Img": remark3Download
		// 	};

		// 	if (mapping.remark1Img != undefined) {
		// 		var files = mapping.remark1Img;
		// 	}
		// 	else if (mapping.remark2Img != undefined) {
		// 		var files = mapping.remark2Img;
		// 	}
		// 	else if (mapping.remark3Img != undefined) {
		// 		var files = mapping.remark3Img;
		// 	}

		// 	// Determine the file extension based on the file name or other logic
		// 	var mimeType = files.split(';')[0].split(':')[1];
		// 	var fileExtension = mimeType.split('/')[1];
		// 	var byteCharacters = atob(files.split(',')[1]);
		// 	var byteNumbers = new Array(byteCharacters.length);
		// 	for (var i = 0; i < byteCharacters.length; i++) {
		// 		byteNumbers[i] = byteCharacters.charCodeAt(i);
		// 	}
		// 	var byteArray = new Uint8Array(byteNumbers);
		// 	var blob = new Blob([byteArray], { type: "application/octet-stream" });
		// 	fileExtension = fileExtension.includes('sheet') ? "xlsx" : fileExtension;

		// 	File.save(blob, 'NewFile', fileExtension);

		// },
		onDownlodeRemark: function (oEvent) {
		
		
					
		
		 
		
					var that = this;
		
					this.remarkoEvent = oEvent.getParameter('id').split('--')[2]
		
		 
		
					that.getCurrentDateAndTime();
		
		 
		
					// Function to check if the code is running in Cordova for Android environment
		
		 
		
					// function isCordovaAndroidEnvironment() {
		
		 
		
					//  return window.cordova;
		
		 
		
					// }
		
		 
		
		 
		
		 
		
					// // Usage
		
		 
		
					// if (isCordovaAndroidEnvironment()) {
		
		 
		
					//  // Cordova for Android environment, use Cordova-specific functionality
		
		 
		
					//  that.downloadAttachmentCordova();
		
		 
		
					// } else {
		
		 
		
						// Web browser environment or other platforms, use browser-specific functionality
		
		 
		
						that.downloadRemarkWeb();
		
		 
		
				//  }
		
		 
		
				},
		
		 
		
		 
		
		 
		
				//this function is for download the remark for web
		
		 
		
				downloadRemarkWeb: function () {
		
					
		
					var oModel = this.getView().getModel("appView");
		
					this.backendRemark1 = oModel.getProperty("/readedJobdata/0/remark1Img");
		
					this.backendRemark2 = oModel.getProperty("/readedJobdata/0/remark2Img");
		
					this.backendRemark3 = oModel.getProperty("/readedJobdata/0/remark3Img");
		
		 
		
					var newUploadImgDown1 = oModel.getProperty("/logoRemark1");
		
					var newUploadImgDown2 = oModel.getProperty("/logoRemark2");
		
					var newUploadImgDown3 = oModel.getProperty("/logoRemark3");
		
		 
		
					if (this.remarkoEvent === "downloadRemark1") {
		
						if (this.backendRemark1 != null) {
		
							if (newUploadImgDown1) {
		
								var remark1Download = oModel.getProperty("/logoRemark1");
		
							} else {
		
								var remark1Download = this.backendRemark1;
		
							}
		
						} else {
		
							var remark1Download = oModel.getProperty("/logoRemark1");
		
						}
		
					}
		
					if (this.remarkoEvent === "downloadRemark2") {
		
						if (this.backendRemark2 != null) {
		
							if (newUploadImgDown2) {
		
								var remark2Download = oModel.getProperty("/logoRemark2");
		
							} else {
		
								var remark2Download = this.backendRemark2;
		
							}
		
						} else {
		
							var remark2Download = oModel.getProperty("/logoRemark2");
		
						}
		
					}
		
					if (this.remarkoEvent === "downloadRemark3") {
		
						if (this.backendRemark3 != null) {
		
							if (newUploadImgDown3) {
		
								var remark3Download = oModel.getProperty("/logoRemark3");
		
							} else {
		
								var remark3Download = this.backendRemark3;
		
							}
		
						} else {
		
							var remark3Download = oModel.getProperty("/logoRemark3");
		
						}
		
					}
		
		 
		
					var mapping = {
		
						"remark1Img": remark1Download,
		
						"remark2Img": remark2Download,
		
						"remark3Img": remark3Download
		
					};
		
		 
		
					if (mapping.remark1Img != undefined) {
		
						var files = mapping.remark1Img;
		
					}
		
					else if (mapping.remark2Img != undefined) {
		
						var files = mapping.remark2Img;
		
					}
		
					else if (mapping.remark3Img != undefined) {
		
						var files = mapping.remark3Img;
		
					}
		
					if(window.cordova){
		
						that.downloadAttachmentCordova();
		
					}else{
		
						// Determine the file extension based on the file name or other logic
		
						if (files){
		
							var mimeType = files.split(';')[0].split(':')[1];
		
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
		
		   
		
						File.save(blob, 'NewFile', fileExtension);
		
						}
		
					}
		
				   
		
				   
		
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

			var that = this;
			var oModel = this.getView().getModel();
			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			oModel.read("/Jobs('" + this.oArgs + "')", {
				success: function (data) {

					if (data.Urgent === "Yes") {
						that.getView().getModel("appView").setProperty("/asUrgentVis", false);
						// that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", true);
					}
					else {
						// that.getView().getModel("appView").setProperty("/asUrgentVis", true);
						that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);
					}
					that.getView().getModel("appView").setProperty("/Jobs", data);
					that.getView().getModel("appView").setProperty("/JobStatusForRemark", data.status);
					that.getView().getModel("appView").setProperty("/foilingData", data.foilBlocks);
					that.getView().getModel("appView").setProperty("/embossingData", data.embossing);
					that.getView().getModel("appView").setProperty("/spotUvData", data.positive);
					that.getView().getModel("appView").setProperty("/coatingData", data.varnishandLamination);
					that.loadForm();
					that.getView().getModel("appView").setProperty("/status", data.status);
					if (!data.status) {
						if (sUserRole == "Admin" || sUserRole == "Raw Material Head" || sUserRole == "Factory Manager") {
							that.getView().getModel("appView").setProperty("/addBtnVisible", true);
						} else {
							that.getView().getModel("appView").setProperty("/addBtnVisible", false);
						}
					} else {
						return;
					}

				},
				error: function (error) {
					MessageToast.show('No Job Found : ' + that.oArgs);
					that.getRouter().navTo("allPrinters");
					// that.middleWare.errorHandler(error.statusText,that);
					// that.middleWare.errorHandler(error, that);
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
			// oModel.setProperty("/visibleModify", false);oGetAgru
			// oModel.updateBindings();
			// this.getUserDataLocal = JSON.parse(JSON.stringify(oModel.getProperty("/jobStatusTabData")));
			// this.whenProductionStart();
		},

		onSaveJobStatus: function () {
			
			var oModel = this.getView().getModel("appView"); // Default model get at here
			var that = this;
			var data = oModel.getProperty("/newJobStatus");
			var oData = this.getView().getModel();
			var pastingValue = oModel.getProperty("/Jobs");

			that.getCurrentDateAndTime();
			that.getRemJobsStatus();
			var sumOfJobStatus = oModel.getProperty("/sumOfJobsData")

			// var selectedjobStatus = this.getView().getModel("appView").getProperty("/selectStatus");


			// if(sUserRole === "Raw Material Head"){

			for (var i = 0; i < data.length; i++) {
				var jobStatus = data[i];
				this.getView().getModel("appView").setProperty("/jobStatusRawMaterialValue", jobStatus);
				var id = jobStatus.id;
				// if(selectedjobStatus){
				// 	jobStatus.status = selectedjobStatus;
				// }
				const sEntityPath = `/JobStatus('${id}')`;

				if (jobStatus.TobeUpdated == "X") {
					// var selectedKey = this.getView().byId('idStatus').getSelectedKey();
					// if(!selectedKey){
					// 	MessageToast.show("Please Select The Required Field");
					// 	return;
					// }
					delete jobStatus.TobeUpdated;
					// jobStatus.CreatedBy = that.getView().getModel('appView').getProperty('/UserRole');
					oData.create("/JobStatus", jobStatus, {

						success: function (data) {

							MessageToast.show("Successfully Uploaded");


							// that.onUploadStatus();

							that.onReadJobStatus();
							that.oGetAgru();

							oModel.updateBindings();

						},

						error: function (error) {
							// Error callback
							that.middleWare.errorHandler(error, that);
							// MessageToast.show("Error reading data");
						}
					});
				} else if (jobStatus.TobeUpdated == true) {
					// var selectedKey = this.getView().byId('idStatus').getSelectedKey();
					// if(!selectedKey){
					// 	MessageToast.show("Please Select The Required Field");
					// 	return;
					// }

					// jobStatus.UpdatedOn = this.getView().getModel("appView").getProperty("/dateAndTime");
					// jobStatus.CreatedBy = that.getView().getModel('appView').getProperty('/UserRole');

					delete jobStatus.TobeUpdated;
					oData.update(sEntityPath, jobStatus, {
						success: function (Data) {
							MessageToast.show("Successfully Update the Entry");
							that.oGetAgru();
						},
						error: function (error) {
							MessageToast.show("Error reading data");
							that.middleWare.errorHandler(error, that);
						}
					});
				}
				
				var parsedPastingValue = parseInt(jobStatus.Pasting)
				var parsedPastingValueQty = parseInt(pastingValue.qtyPcs)
				if (parseInt(sumOfJobStatus.Pasting) < parsedPastingValueQty) {
					if (parseInt(jobStatus.Pasting) < parseInt(pastingValue.qtyPcs) && parsedPastingValue > 0) {
						this.updateStatusValue();
					}
					else {
						this.whenProductionStart();
					}
				} else {
					this.whenProductionStart();
				}

			}

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
					name: "ent.ui.ecommerce.fragments.printingDetailFragment.uploadDoc",
					controller: this
				}).then(function (oDialog) {
					// Add dialog to view hierarchy
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));

			}

			if (sUserRole === "Artwork Head" || sUserRole === "Admin" || sUserRole == "Factory Manager") {
				this.getView().getModel("appView").setProperty("/uploadDocBrowseVis", true);
			} else {
				this.getView().getModel("appView").setProperty("/uploadDocBrowseVis", false);
			}
			return this.oUploadDialog;

		},

		openCustomerAttachmentDialog: function (oEvent) {
			var data = oEvent.getSource().getBindingContext("appView").getObject();
			var clickedrow = oEvent.getSource().getBinding("text").getPath();
			var dModel = this.getView().getModel();
			var invoice = (data.InvNo.split(',').map(item => item.trim()).length>1) ? data.InvNo.split(',')
				.map(item => ({ InvNo: item.trim() })) : data.InvNo;
			var Delivery = (data.DeliveryNo.split(',').map(item => item.trim()).length>1) ? data.DeliveryNo.split(',')
				.map(item => ({ DeliveryNo: item.trim() })) : data.DeliveryNo;
			this.flag=false;
			// var poNo = data.poAttachment;
			// var artwork = data.artworkAttachment;

			var oView = this.getView();
			var that = this;
			if (!this.CustomerAttachment) {
				this.CustomerAttachment = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.printingDetailFragment.CustomerAttachment",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}

			this.CustomerAttachment.then(function (oDialog) {
				if (clickedrow === "DeliveryNo") {
					that.getView().getModel("appView").setProperty("/custInvAttachVis", false)
					that.getView().getModel("appView").setProperty("/custDelAttachVis", true)
				}
				else {
					that.getView().getModel("appView").setProperty("/custInvAttachVis", true)
					that.getView().getModel("appView").setProperty("/custDelAttachVis", false)
				}
				if (clickedrow == "DeliveryNo") {
					var oModel = that.getView().getModel("appView");
					oModel.setProperty("/uploadDocumnetTitle", " Delivery Attachment");
					that.getModel("appView").setProperty("/CustomerAttachment", Delivery);
					oDialog.open();
					// var sUserRole = oModel.getProperty('/UserRole');
					// if(sUserRole === "Accounts Head"){
					// 	oModel.setProperty("/uploadDocBrowseVis", true)
					// }else{
					// 	oModel.setProperty("/uploadDocBrowseVis", false)
					// }
				}
				else if (clickedrow == "InvNo") {
					var oModel = that.getView().getModel("appView");
					oModel.setProperty("/uploadDocumnetTitle", " Invoice Attachment");
					that.getModel("appView").setProperty("/CustomerAttachment", invoice);
					// var sUserRole = oModel.getProperty('/UserRole');
					oDialog.open();
					// if(sUserRole === "Accounts Head"){
					// 	oModel.setProperty("/uploadDocBrowseVis", true)
					// }else{
					// 	oModel.setProperty("/uploadDocBrowseVis", false)
					// }
				}


				if (clickedrow === "clientPONo") {
					var selectedJobDetails = that.getView().getModel("appView").getProperty("/Jobs");
					// oDialog.open();
					if (selectedJobDetails.PoAttach) {
						var url = `/Attachments('${selectedJobDetails.PoAttach + "PoNo"}')`
					}
					// that.getModel("appView").setProperty("/attachmentFiles", selectedJobDetails.poAttachment)
					var oModel = that.getView().getModel("appView");
					oModel.setProperty("/uploadDocumnetTitle", "Po Attachment");
					// oModel.setProperty("/btnVisibility", false);
					that.oDialogOpen().then(function (oDialog) {
						oDialog.open();
						// var sUserRole = oModel.getProperty('/UserRole');
						// if (sUserRole === 'Artwork Head') {

						// 	oModel.setProperty('/uploadDocBrowseVis', true);
						// }else{
						// 	oModel.setProperty('/uploadDocBrowseVis', false);
						// }
					});
				}
				if (clickedrow === "artworkCode") {
					var selectedJobDetails = that.getView().getModel("appView").getProperty("/Jobs");
					if (selectedJobDetails.ArtworkAttach) {
						var url = `/Attachments('${selectedJobDetails.ArtworkAttach + "ArtworkNo"}')`;
						// dModel.read(`/Attachments('${selectedJobDetails.ArtworkAttach+"ArtworkNo"}')`, {
						// 	try: function (data) {
						// 		// that.getModel("appView").setProperty("/attachmentFiles", data.Attachment);
						// 		that.getModel("appView").setProperty("/attachmentFiles", data.Attachment)
						// 	},
						// 	error: function (error) {
						// 		MessageBox.show("Artwork Attachment Is Not Attached")
						// 	}
						// });
					}
					// oDialog.open();
					// that.getModel("appView").setProperty("/attachmentFiles", selectedJobDetails.artworkAttachment)
					var oModel = that.getView().getModel("appView");
					oModel.setProperty("/uploadDocumnetTitle", " Artwork Attachment");
					// oModel.setProperty("/btnVisibility", false);
					that.oDialogOpen().then(function (oDialog) {
						oDialog.open();
						// var sUserRole = oModel.getProperty('/UserRole');
						// if (sUserRole === 'Artwork Head') {	
						// 	oModel.setProperty('/uploadDocBrowseVis', true);
						// }else{
						// 	oModel.setProperty('/uploadDocBrowseVis', false);
						// }
					});
				}
				// else if (clickedrow == "artworkCode") {
				// 	that.getModel("appView").setProperty("/CustomerAttachment", artwork);
				// }

				// var oSimpleForm = that.getView().byId('allJobDetails')
				// oSimpleForm.bindElement('appView>/Jobs');
				// 

				// dModel.read(url, {
				// 	try: function (data) {
				// 		// that.getModel("appView").setProperty("/attachmentFiles", data.Attachment);
				// 		that.getModel("appView").setProperty("/attachmentFiles", data.Attachment)
				// 	},
				// 	catch: function (error) {
				// 		MessageBox.show("Attachment Is Not Attached")
				// 	}
				// });

				// Change by Lakshay
				if (url) {
					dModel.read(url, {
						success: function (data) {
							that.getModel("appView").setProperty("/attachmentFiles", data.Attachment);
						},
						error: function (error) {
							MessageBox.show("Attachment Is Not Attached");
						}
					});
				}

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
			this.isAttachment = false;
			var that = this;
			var oData = oEvent.getSource().getBindingContext("appView").getObject();

			var dModel = this.getView().getModel();
		
			this.clickedLink = oEvent.getSource().getBinding("text").getPath();
			this.jobStatusPath = oEvent.getSource().getBindingContext("appView").sPath;
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/buttonText", "Update");
			oModel.setProperty('/uploadBrowse-BtnVis', false);

			var sUserRole = oModel.getProperty('/UserRole');
			if (sUserRole === 'Customer') {
				oModel.setProperty("/customerTitle", "Customer Attachment");

			} else {
				oModel.setProperty("/customerTitle", "Attachment");
			}


			if (sUserRole === "Customer") {
				if (this.clickedLink === "DeliveryNo") {
					that.getView().getModel("appView").setProperty("/custInvAttachVis", false)
					that.getView().getModel("appView").setProperty("/custDelAttachVis", true)
				}else {
					that.getView().getModel("appView").setProperty("/custInvAttachVis", true)
					that.getView().getModel("appView").setProperty("/custDelAttachVis", false)
				}
				if (this.clickedLink == "DeliveryNo") {
					if(oData.DeliveryNo.split(',').map(item => item.trim()).length>1){
						this.openCustomerAttachmentDialog(oEvent);
						return;
					}
					if (oData.DeliveryNo && oData.DeliveryNo.length) {
						var url = `/Attachments('${oData.DeliveryNo[0].DeliveryNo + "DelNo"}')`
					}
				}
				if (this.clickedLink == "InvNo") {
					if(oData.InvNo.split(',').map(item => item.trim()).length>1){
						this.openCustomerAttachmentDialog(oEvent);
						return;
					}
					if (oData.InvNo && oData.InvNo.length) {
						var url = `/Attachments('${oData.InvNo[0].InvNo + "InvNo"}')`
					}
				}
				if (this.clickedLink === "clientPONo") {
					if (oData.PoAttach) {
						var url = `/Attachments('${oData.PoAttach + "PoNo"}')`
					}
				}
				if (this.clickedLink === "artworkCode") {
					if (oData.ArtworkAttach) {
						var url = `/Attachments('${oData.ArtworkAttach + "ArtworkNo"}')`
					}
				}
				dModel.read(url, {
					success: function (data) {
						that.getModel("appView").setProperty("/attachmentFiles", data.Attachment);
						that.oDialogOpen().then(function(oDialog){
							oDialog.open();
						})
					},
					error: function (error) {
						MessageBox.show("Attachment Is Not Attached")
					}
				});
				// this.openCustomerAttachmentDialog(oEvent);

				// this.getJobsStatusDatas();
			}
			else {
				if (this.clickedLink == "clientPONo") {
					if (oData.PoAttach) {
						var url = `/Attachments('${oData.PoAttach + "PoNo"}')`
					}
					oModel.setProperty("/uploadDocumnetTitle", "Upload Po Document");
					var pofile = oData.poAttachment;
					if (sUserRole === 'Admin' || sUserRole === "Artwork Head" || sUserRole == "Factory Manager") {
						oModel.setProperty('/uploadDocBrowseVis', true);
						oModel.setProperty("/uploadBrowse-BtnVis", true)
						// oModel.setProperty("/btnVisibility", true);
					}
					if (pofile) {
						oModel.setProperty("/buttonText", "Update");
					}
					else {
						oModel.setProperty("/buttonText", "Upload");
					}
				}
				else if (this.clickedLink == "artworkCode") {
					if (oData.ArtworkAttach) {
						var url = `/Attachments('${oData.ArtworkAttach + "ArtworkNo"}')`;
					}
					// this.getModel("appView").setProperty("/attachmentFiles", oData.ArtworkAttachment.Attachment)
					var artfile = oData.artworkAttachment
					oModel.setProperty("/uploadDocumnetTitle", "Upload Artwork Document");
					if (sUserRole === "Admin" || sUserRole === "Artwork Head" || sUserRole == "Factory Manager") {
						oModel.setProperty("/uploadBrowse-BtnVis", true)
					}

					if (artfile) {
						oModel.setProperty("/buttonText", "Update");
					}
					else {
						oModel.setProperty("/buttonText", "Upload");
					}
				}

				if (this.clickedLink == "DeliveryNo") {
					if(oData.DeliveryNo.split(',').map(item => item.trim()).length>1){
						this.openCustomerAttachmentDialog(oEvent);
						return;
					}

					if (oData.DeliveryNo) {
						var url = `/Attachments('${oData.DeliveryNo + "DelNo"}')`
					}

					var Delfile = oData.deliveryAttachment;
					oModel.setProperty("/uploadDocumnetTitle", "Upload Delivery Document");
					// oModel.setProperty("/btnVisibility", false);
					oModel.setProperty("/browseVisArtwork", false);

					if (Delfile) {
						oModel.setProperty("/buttonText", "Update");
					}
					else {
						oModel.setProperty("/buttonText", "Upload");
					}
				}
				if (this.clickedLink == "InvNo") {
					if(oData.InvNo.split(',').map(item => item.trim()).length>1){
						this.openCustomerAttachmentDialog(oEvent);
						return;
					}else{
						if (oData.InvNo) {
							var url = `/Attachments('${oData.InvNo + "InvNo"}')`
						}
						var incFile = oData.incAttachment;
						oModel.setProperty("/uploadDocumnetTitle", "Upload Invoice Document");
						// oModel.setProperty("/btnVisibility", false);
						// oModel.setProperty("/browseVisArtwork", false);
						if (incFile) {
							oModel.setProperty("/buttonText", "Update");
						}
						else {
							oModel.setProperty("/buttonText", "Upload");
						}
					}
				}

				// Change by Lakshay - Validation - Not open attachment fragment if attachment not found.
				dModel.read(url, {
					success: function (data) {
						that.getModel("appView").setProperty("/attachmentFiles", data.Attachment);
						that.oDialogOpen().then(function(oDialog){
							oDialog.open();
						})
					},
					error: function (error) {
						MessageBox.show("Attachment Is Not Attached")
					}
				});

				var oModel = this.getView().getModel("appView");
				// this.oDialogOpen().then(function (oDialog) {
				// 	oDialog.open();

				// 	var sUserRole = oModel.getProperty('/UserRole');
				// 	if (sUserRole === 'Customer') {
				// 		// oModel.setProperty('/browseVis', false);
				// 		// oModel.setProperty("/btnVisibility", false);
				// 	}
				// 	if (sUserRole === "Dispatch Head" || "Accounts Head") {
				// 		// oModel.setProperty('/browseVis', false);
				// 		// oModel.setProperty("/btnVisibility", false);
				// 	}
				// 	if (sUserRole === "Artwork Head") {
				// 		// oModel.setProperty('/browseVis', false);
				// 		// oModel.setProperty("/btnVisibility", true);
				// 	}

				// });




			}
		},
		// getAttachmentForCustomer:function(){
		// 	var that = this;
		// 	var oModel = this.getView().getModel();
		// 	oModel.read(`/Attachments('${id}')`, {
		// 		success: function (data) {
		// 			that.getView().getModel("appView").setProperty("/AttachmentForCustomer", data);
		// 		},
		// 		error: function (error) {

		// 			that.middleWare.errorHandler(error, that);
		// 		}
		// 	});

		// },
		onPressDelete: function (oEvent) {
			

			var that = this;
			var oModel = this.getView().getModel();
			var oItem = oEvent.getSource().getBindingContext('appView').getObject();
			MessageBox.confirm("Are you sure you want to delete?", {
				actions: ["OK", "Close"],
				emphasizedAction: 'OK',
				onClose: function (sAction) {
					if (sAction === "OK") {
						oModel.remove(`/JobStatus('${oItem.id}')`, {
							success: function () {
								// Do something after successful deletion
								MessageToast.show("JobStatus Deleted Successfully");
								that.onReadJobStatus();
							},
							error: function (error) {
								BusyIndicator.hide();
							}
						});
					}
				}
			});
		},

		getCustomerAttachments: function (oEvent) {
			var that = this;
			var oData = oEvent.getSource().getBindingContext("appView").getObject();
			if (oData.InvNo) {
				var id = oData.InvNo + "InvNo";
				var value = "Invoice"
			} else {
				id = oData.DeliveryNo + "DelNo";
				var value = "Delivery"
			}
			var that = this;
			var dModel = this.getView().getModel();
			dModel.read(`/Attachments('${id}')`, {
				success: function (data) {
					that.getModel("appView").setProperty("/attachmentFiles", data.Attachment);
				},
				error: function (error) {
					MessageBox.show(value + " Attachment Not Attached")
				}
			});
			var oModel = this.getView().getModel("appView");
			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();
				var sUserRole = oModel.getProperty('/UserRole');
				if (sUserRole === 'Customer') {
					// oModel.setProperty('/browseVis', false);
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
				var sUserRole = oModel.getProperty('/UserRole');
				if (sUserRole === "Admin" || sUserRole === "Accounts Head" || sUserRole == "Factory Manager") {
					oModel.setProperty("/uploadBrowse-BtnVis", true)
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
					name: "ent.ui.ecommerce.fragments.printingDetailFragment.AllJobs",
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
			var that = this;
			this.oUploadDialog.then(function (oDialog) {
				oDialog.close();
				oModel.setProperty("/clientPONo", "")
				oModel.setProperty("/ArtWork", "")
				oModel.setProperty("/attachmentFiles", "")
				oModel.setProperty('/visibleDownloadButton', false);
				that.clickedLink = null;
				oDialog.updateBindings();

			});
		},

		onnReject: function () {
			this.oJobDialog.then(function (oDialog) {
				oDialog.close();
			})
		},

		getDialogData: function (oEvent) {

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
					name: "ent.ui.ecommerce.fragments.printingDetailFragment.Jobstatusdialog",
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
			// var oMultiInput1 = this.getView().byId("multiInput1");
			this.getRemJobsStatus();
			var date = new Date()
			var formattedDate = date.toLocaleDateString("en-US");
			var oModel = this.getView().getModel("appView");
			var oNewJob = {
				"JobStatusId": this.oArgs,
				"Coating": "",
				"PaperCutting": "",
				"DeliveryNo": "",
				"Embossing": "",
				"Printing": "",
				"InvNo": "",
				"CreatedOn": formattedDate,
				"JobId": "",
				"Packing": "",
				"noOfPiecesToSend": "",
				"noOfBoxPerPieces": "",
				"SecoundarySuppliers": "",
				"SecoundaryPiecesToSend": "",
				"Pasting": "",
				"Punching": "",
				"deliveryAttachment": "",
				"incAttachment": "",
				"rawMaterial": "",
				"spotUV": "",
				"status": ""
			}

			this.getModel('appView').setProperty('/newJob', oNewJob);
			this.getModel('appView').setProperty('/oldnewJob', JSON.parse(JSON.stringify(oNewJob)));
			oModel.updateBindings();
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
				// that.loadForm2();
				var oSimpleForm2 = that.getView().byId('jobStatusDialog');
				oSimpleForm2.bindElement('appView>/newJob');

				// oModel.setProperty('/multiInputInv')
				var oMultiInput = that.getView().byId("multiInput");
				oMultiInput?.addValidator(function (oEvent) {
					return new sap.m.Token({ text: oEvent.text });
				});
				// oModel.setProperty('/multiInputDel')
				var oMultiInput2 = that.getView().byId("multiInput2");
				oMultiInput2?.addValidator(function (oEvent) {
					return new sap.m.Token({ text: oEvent.text });
				});
			});

		},
		onInvMultiInput: function (oEvent) {
			
			var selectedInput = oEvent.getParameter('id').split('--')[2];
			if (selectedInput === 'multiInput') {
				var getTokens = this.getView().byId('multiInput')?.getTokens();
				var invoices = [];
				for (let index = 0; index < getTokens.length; index++) {
					const element = getTokens[index];
					var value = element.getProperty('text');
					invoices.push({
						"Inv": value
					});
				}
				var invValues = invoices.map(item => item.Inv);
				var outputString = "" + invValues.join(",") + "";

				console.log(outputString); // Output: "'500','652','900'"
				this.getView().getModel('appView').setProperty("/InvNo", outputString);
			} else {
				var getTokens = this.getView().byId('multiInput2')?.getTokens();
				var delInvoice = [];
				for (let index = 0; index < getTokens.length; index++) {
					const element = getTokens[index];
					var value = element.getProperty('text');
					delInvoice.push({
						"Del": value
					});
				}
				this.getView().getModel('appView').setProperty("/DeliveryNo", delInvoice[0].Del);
			}

		},

		// * this fucntion will close the dialog of the "onPressAdd" or Add button dialog on status.
		onClose: function () {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/totalShippers", 0)
			oModel.setProperty("/piecePerBox", 0)
			oModel.setProperty("/totalShippingPieces", 0)
			oModel.setProperty("/remainingPiecesPerBox", 0)
			oModel.setProperty("/remainingPiecesToSend", 0)
			this.openJobstatusDialog().then(function (oDialog) {
				oDialog.close();
			});
		},

		// * this fucntion is triger when user click on save in fragment.
		onSubmitData: function () {


			var oModel = this.getView().getModel("appView");
			var invData = oModel.getProperty("/InvNo");
			var delData = oModel.getProperty("/DeliveryNo");

			var totalShippers = oModel.getProperty("/totalShippers");
			var totalPiecesToSend = oModel.getProperty("/totalShippingPieces");
			var totalPiecePerBox = oModel.getProperty("/piecePerBox");
			var SecoundarySuppliers = oModel.getProperty("/remainingPiecesPerBox");
			var SecoundaryPiecesToSend = oModel.getProperty("/remainingPiecesToSend");

			oModel.updateBindings();
			// oModel.getProperty("/")
			// var rawMaterialSelect = this.getView().getModel("appView").getProperty("/rawMaterialSelected");
			var oldData = oModel.getProperty("/newJobStatus");
			var oNewJobData = oModel.getProperty('/newJob');

			oNewJobData.DeliveryNo = delData;
			oNewJobData.InvNo = invData;

			oNewJobData.Packing = totalShippers;
			oNewJobData.noOfPiecesToSend = totalPiecesToSend;
			oNewJobData.noOfBoxPerPieces = totalPiecePerBox;
			oNewJobData.SecoundarySuppliers = SecoundarySuppliers;
			oNewJobData.SecoundaryPiecesToSend = parseInt(SecoundaryPiecesToSend);

			var rawMaterialSelectedKey = oModel.getProperty('/selectedKey');
			if (!rawMaterialSelectedKey) {
				oNewJobData.rawMaterial = oModel.getProperty("/newJobStatus/0/rawMaterial")

			} else {

				oNewJobData.rawMaterial = oModel.getProperty('/selectedKey');
			}

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
		// onSubmitData: function () {
		// 	

		// 	var oModel = this.getView().getModel("appView");
		// 	var invData = oModel.getProperty("/InvNo");
		// 	var delData = oModel.getProperty("/DeliveryNo");
		// 	oModel.updateBindings();
		// 	// oModel.getProperty("/")
		// 	var rawMaterialSelect = this.getView().getModel("appView").getProperty("/rawMaterialSelected");
		// 	// var readJobStatusData = oModel.getProperty("/readedJobdata");
		// 	var oldData = oModel.getProperty("/newJobStatus");
		// 	var oNewJobData = oModel.getProperty('/newJob');
		// 	var rawMaterial = oModel.getProperty("/newJobStatus/0/rawMaterial")

		// 	oNewJobData.DeliveryNo = delData;
		// 	oNewJobData.InvNo = invData;
		// 	oNewJobData.rawMaterial = rawMaterial;

		// 	// this for the attachments files in jobstatus.
		// 	oNewJobData.incAttachment = oModel.getProperty("/statusInvAttachment");
		// 	oNewJobData.deliveryAttachment = oModel.getProperty("/statusDeliveryAttachment");

		// 	if (!this.isEditStatus) {
		// 		oNewJobData.TobeUpdated = "X";
		// 		oldData.push(oNewJobData);

		// 	}

		// 	// var data = oldData.slice(1,0)
		// 	// data.rawMaterial = 
		// 	// oldData.push(oNewJobData)
		// 	// oModel.setProperty("/newJobStatus", data);
		// 	oModel.updateBindings();
		// 	oModel.refresh();
		// 	// this.rawMaterialGet();
		// 	// this.whenProductionStart();		
		// 	this.onClose();

		// },
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
			var sUserRole = this.getView().getModel("appView").getProperty("/UserRole");
			if (sUserRole === "Customer" || sUserRole === "Artwork Head") {
				return;
			}

			this.getView().getModel("appView").setProperty("/selectStatus", undefined);
			this.getRemJobsStatus();

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
			var Packing = this.getView().getModel("appView").getProperty("/newJob/Packing");
			var boxPerPiece = this.getView().getModel("appView").getProperty("/newJob/noOfBoxPerPieces");
			var pieceToSend = this.getView().getModel("appView").getProperty("/newJob/noOfPiecesToSend");
			var remBox = this.getView().getModel("appView").getProperty("/newJob/SecoundarySuppliers");
			var remPieces = this.getView().getModel("appView").getProperty("/newJob/SecoundaryPiecesToSend");
			// oModel.setProperty("/btnVisibility", true);
			// oModel.setProperty("/newJob", JSON.parse(JSON.stringify(rowdata)));
			// oModel.setProperty("/oldJobs",JSON.parse(JSON.stringify(rowdata)))
			var invNoEditGrag = rowdata.InvNo;
			var delEditFrag = rowdata.DeliveryNo;
			oModel.setProperty("/InvNo", invNoEditGrag);
			oModel.setProperty("/DeliveryNo", delEditFrag);
			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			this.openJobstatusDialog().then(function (oDialog) {
				oModel.setProperty("/addJobStatusdialogTitle", "Edit Job Status ");
				oModel.setProperty("/addJobStatusSave", "Update");
				oDialog.open();
				var oSimpleForm2 = that.getView().byId('jobStatusDialog');
				oSimpleForm2.bindElement('appView>/newJob');
				oModel.setProperty("/totalShippers", Packing,)
				oModel.setProperty("/piecePerBox", boxPerPiece,)
				oModel.setProperty("/totalShippingPieces", pieceToSend,)
				oModel.setProperty("/remainingPiecesPerBox", remBox,)
				oModel.setProperty("/remainingPiecesToSend", remPieces,)

				var oMultiInput = that.getView().byId("multiInput");
				oMultiInput?.addValidator(function (oEvent) {
					return new sap.m.Token({ text: oEvent.text });
				});
				// oModel.setProperty('/multiInputDel')
				var oMultiInput2 = that.getView().byId("multiInput2");
				oMultiInput2?.addValidator(function (oEvent) {
					return new sap.m.Token({ text: oEvent.text });
				});


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
			var that = this;
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
					MessageToast.show("Successfully Uploaded");
					that.onReject();
				},
				error: function (error) {
					that.middleWare.errorHandler(error, that);
				}
			});
		},
		onDownloadFiles: function () {
			var pdfBase64 = this.getView().getModel('appView').getProperty("/attachmentFiles");
			// var pdfBase64 = '<your base64 string>'; // Replace with your actual base64 strin


			var pdfBlob = new Blob([pdfBase64], { type: 'application/pdf' });

			var pdfURL = URL.createObjectURL(pdfBlob);



			var link = document.createElement('a');

			link.href = pdfURL;

			link.download = 'myfile.pdf';

			link.target = '_blank';

			link.click();

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
					MessageToast.show("Successfully Uploaded");
					that.onReject();

				},
				error: function (error) {
					that.middleWare.errorHandler(error, that);
				}
			});
		},




		getCurrentDateAndTime: function () {
			var currentDate = new Date();
			var year = currentDate.getFullYear();
			var month = currentDate.getMonth() + 1; // Note: Months are 0-based, so add 1 to get the correct month
			var day = currentDate.getDate();
			var hours = currentDate.getHours();
			var minutes = currentDate.getMinutes();
			var seconds = currentDate.getSeconds();
			// Formatting the output as desired
			var formattedDate = year + "-" + addLeadingZero(month) + "-" + addLeadingZero(day);
			var formattedTime = addLeadingZero(hours) + ":" + addLeadingZero(minutes) + ":" + addLeadingZero(seconds);
			// console.log("Current Date: " + formattedDate);
			// console.log("Current Time: " + formattedTime);
			this.getView().getModel("appView").setProperty("/dateAndTime", formattedDate + formattedTime)

			// Helper function to add leading zero if single-digit
			function addLeadingZero(number) {
				return number < 10 ? "0" + number : number;
			}

		},
		downloadAttachments: function () {

			var that = this;
			that.getCurrentDateAndTime();
			// Function to check if the code is running in Cordova for Android environment
			function isCordovaAndroidEnvironment() {
				return window.cordova && cordova.platformId === "android";
			}

			// Usage
			if (isCordovaAndroidEnvironment()) {
				// Cordova for Android environment, use Cordova-specific functionality
				that.downloadAttachmentCordova();
			} else {
				// Web browser environment or other platforms, use browser-specific functionality
				that.downloadAttachmentWeb();
			}
		},
		downloadAttachmentCordova: function () {

			var that = this;
			that.savebase64AsImageFile(cordova.file.externalRootDirectory);

		},
		// For Web App (Browser)
		downloadAttachmentWeb: function () {

			var oModel = this.getView().getModel("appView");
			var jsonPath = '';
			var files = '';
			var mapping = {
				"clientPONo": "/clientPONo",

				"artworkCode": "/ArtWork",

				"InvNo": "/InvNo",

				"DeliveryNo": "/DeliveryNo"
			};
			if (this.clickedLink && mapping.hasOwnProperty(this.clickedLink)) {
				jsonPath = mapping[this.clickedLink];
				files = oModel.getProperty("/attachmentFiles");
				if (!files) {
					MessageToast.show("No Files Attached");
					return;
				}
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

		// 		//************ Function to save a Base64 image in the form of File in the Specified Directory  **************//
		savebase64AsImageFile: function (folderpath, albumName, filename) {
			var date = this.getView().getModel("appView").getProperty("/dateAndTime");
			var formattedDate = date.replace(/[:-]/g, "");
			var albumName = "Download"
			var filename = "myTest.png"
			var oModel = this.getView().getModel("appView");
			var content = oModel.getProperty("/attachmentFiles");
			var fileExtension = content.split('/')[1];
			var ext = fileExtension.split(';')[0];
			if (ext.startsWith('vnd')) {
				ext = 'xlsx'
			} else {
			}
			var filename = "myTest.png"
			var filename = "File" + formattedDate + "." + ext;
			var DataBlob = this.convertFileToUrl(content)
			window.resolveLocalFileSystemURL(folderpath, function (dirEntry) {
				console.log("Access to the emulated storage directory granted succesfully");
				dirEntry.getDirectory(albumName, {
					create: true,
					exclusive: false
				}, function (dir) {

					console.log("Access to the Download directory granted succesfully");
					dir.getFile(filename, {
						create: true,
						exclusive: false
					},
						function (file) {

							// console.log("File created succesfully.");
							file.createWriter(function (fileWriter) {

								// console.log("Writing content to file");
								fileWriter.write(DataBlob);
								console.log("Picture save in Download Directory.");
								MessageToast.show("File saved successfully in download directory")
							}, function (oErr2) {

								console.log("Unable to save picture in Download Due to: " + JSON.stringify(oErr2));
							});
						}, function (oErr1) {

							console.log("File Not created due to: " + JSON.stringify(oErr1));
						});
				}, function (oErr) {

					console.log("No Access to the Directory: " + JSON.stringify(oErr));
				});
			},);
		},
		// //************ Function to convert a Base64 string to a Blob URL / File URL **************//

		convertFileToUrl: function (b64Data, contentType, sliceSize) {

			contentType = contentType || '';
			sliceSize = sliceSize || 512;
			var byteCharacters = atob(b64Data.split(",")[1]);
			var byteArrays = [];
			for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
				var slice = byteCharacters.slice(offset, offset + sliceSize);
				var byteNumbers = new Array(slice.length);
				for (var i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}
				var byteArray = new Uint8Array(byteNumbers);
				byteArrays.push(byteArray);
			}
			var blob = new Blob(byteArrays, { type: contentType });
			return blob;
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

					oModel.setProperty("/rawMaterialData", "notInstock");
					if (!data) {
						return
					}
					data.forEach(item => {
						item.TobeUpdated = false;
						if (item.rawMaterial === "In Stock") {

							oModel.setProperty("/rawMaterialData", "isInstock");
							return;
						}

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


		// getJobsStatusDatas:function(){
		// 	var oModel = this.getView().getModel("appView");  //default model get at here
		// 	var that = this;
		// 	var ids = this.oArgs;
		// 	var payload = {
		// 		"jobId": ids
		// 	}
		// 	this.middleWare.callMiddleWare("jobStatusData", "POST", payload)
		// 		.then(function (data) {
		// 			oModel.setProperty("/getJobsStatusDatasForCustomer",data)
		// 		})	
		// 		.catch(function (jqXhr, textStatus, errorMessage, error) {

		// 			MessageToast.show("Error");
		// 		});
		// },

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
					oModel.setProperty("/submitEnable", true);
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
			var updatedJobStatus = this.getView().getModel("appView").getProperty("/newJobStatus/0");
			var isCoating = this.getView().getModel('appView').getProperty('/coatingData');
			var isFoiling = this.getView().getModel('appView').getProperty('/foilingData');
			var isSpotUV = this.getView().getModel('appView').getProperty('/spotUvData');
			var isEmbossing = this.getView().getModel('appView').getProperty('/embossingData');
			var oUpdatedData = {
				status: ""
			};
			let isFlag = false;

			//* For select box********************************************
			// var selectedjobStatus = this.getView().getModel("appView").getProperty("/selectStatus");

			// var updatedJobStatus = this.getView().getModel("appView").getProperty("/newJobStatus/0")

			// if(selectedjobStatus){

			//             oUpdatedData.status = selectedjobStatus

			//         }
			//*select box ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
			if (isCoating != 0 && isFoiling != 0 && isSpotUV != 0 && isEmbossing != 0) {
				isFlag = true;
				if (updatedJobStatus.rawMaterial === "In Stock") {
					oUpdatedData.status = "Paper Cutting";
				}
				if (updatedJobStatus.PaperCutting) {
					oUpdatedData.status = "Printing";
				}
				if (updatedJobStatus.Printing) {
					oUpdatedData.status = "Coating";
				}

				if (updatedJobStatus.Coating) {
					oUpdatedData.status = "Foiling";
				}

				if (updatedJobStatus.Foiling) {
					oUpdatedData.status = "SpotUV";
				}

				if (updatedJobStatus.spotUV) {
					oUpdatedData.status = "Embossing";
				}
				if (updatedJobStatus.Embossing) {
					oUpdatedData.status = "Punching";
				}

				if (updatedJobStatus.Punching) {
					oUpdatedData.status = "Pasting";
				}

				if (updatedJobStatus.Pasting) {
					oUpdatedData.status = "Ready For Dispatch";
				}
				if (updatedJobStatus.InvNo) {
					oUpdatedData.status = "Dispatched";
				}
			}
			if (isCoating != 0 && isFoiling != 0 && isSpotUV == 0 && isEmbossing != 0) {
				isFlag = true;
				if (updatedJobStatus.rawMaterial === "In Stock") {
					oUpdatedData.status = "Paper Cutting";
				}
				if (updatedJobStatus.PaperCutting) {
					oUpdatedData.status = "Printing";
				}
				if (updatedJobStatus.Printing) {
					oUpdatedData.status = "Coating";
				}

				if (updatedJobStatus.Coating) {
					oUpdatedData.status = "Foiling";
				}

				if (updatedJobStatus.Foiling) {
					oUpdatedData.status = "Embossing";
				}
				if (updatedJobStatus.Embossing) {
					oUpdatedData.status = "Punching";
				}

				if (updatedJobStatus.Punching) {
					oUpdatedData.status = "Pasting";
				}

				if (updatedJobStatus.Pasting) {
					oUpdatedData.status = "Ready For Dispatch";
				}
				if (updatedJobStatus.InvNo) {
					oUpdatedData.status = "Dispatched";
				}
			}
			if (isCoating != 0 && isFoiling == 0 && isSpotUV == 0 && isEmbossing != 0) {
				isFlag = true;
				if (updatedJobStatus.rawMaterial === "In Stock") {
					oUpdatedData.status = "Paper Cutting";
				}
				if (updatedJobStatus.PaperCutting) {
					oUpdatedData.status = "Printing";
				}
				if (updatedJobStatus.Printing) {
					oUpdatedData.status = "Coating";
				}

				if (updatedJobStatus.Coating) {
					oUpdatedData.status = "Embossing";
				}

				if (updatedJobStatus.Embossing) {
					oUpdatedData.status = "Punching";
				}

				if (updatedJobStatus.Punching) {
					oUpdatedData.status = "Pasting";
				}

				if (updatedJobStatus.Pasting) {
					oUpdatedData.status = "Ready For Dispatch";
				}
				if (updatedJobStatus.InvNo) {
					oUpdatedData.status = "Dispatched";
				}
			}
			if (isCoating != 0 && isFoiling != 0 && isSpotUV != 0 && isEmbossing == 0) {
				isFlag = true;
				if (updatedJobStatus.rawMaterial === "In Stock") {
					oUpdatedData.status = "Paper Cutting";
				}
				if (updatedJobStatus.PaperCutting) {
					oUpdatedData.status = "Printing";
				}
				if (updatedJobStatus.Printing) {
					oUpdatedData.status = "Coating";
				}

				if (updatedJobStatus.Coating) {
					oUpdatedData.status = "Foiling";
				}

				if (updatedJobStatus.Foiling) {
					oUpdatedData.status = "SpotUV";
				}

				if (updatedJobStatus.spotUV) {
					oUpdatedData.status = "Punching";
				}

				if (updatedJobStatus.Punching) {
					oUpdatedData.status = "Pasting";
				}

				if (updatedJobStatus.Pasting) {
					oUpdatedData.status = "Ready For Dispatch";
				}
				if (updatedJobStatus.InvNo) {
					oUpdatedData.status = "Dispatched";
				}
			}
			if (isCoating != 0 && isFoiling == 0 && isSpotUV == 0 && isEmbossing == 0) {
				isFlag = true;
				if (updatedJobStatus.rawMaterial === "In Stock") {
					oUpdatedData.status = "Paper Cutting";
				}
				if (updatedJobStatus.PaperCutting) {
					oUpdatedData.status = "Printing";
				}
				if (updatedJobStatus.Printing) {
					oUpdatedData.status = "Coating";
				}

				if (updatedJobStatus.Coating) {
					oUpdatedData.status = "Punching";
				}

				if (updatedJobStatus.Punching) {
					oUpdatedData.status = "Pasting";
				}

				if (updatedJobStatus.Pasting) {
					oUpdatedData.status = "Ready For Dispatch";
				}
				if (updatedJobStatus.InvNo) {
					oUpdatedData.status = "Dispatched";
				}
			}
			if (!isFlag) {
				if (updatedJobStatus.rawMaterial === "In Stock") {
					oUpdatedData.status = "Paper Cutting";
				}
				if (updatedJobStatus.PaperCutting) {
					oUpdatedData.status = "Printing";
				}
				if (updatedJobStatus.Printing) {
					oUpdatedData.status = "Coating";
				}
				if (updatedJobStatus.Coating) {
					oUpdatedData.status = "Foiling";
				}

				if (updatedJobStatus.Foiling) {
					oUpdatedData.status = "SpotUV";
				}
				if (updatedJobStatus.Coating) {
					oUpdatedData.status = "Embossing";
				}

				if (updatedJobStatus.Coating) {
					oUpdatedData.status = "Punching";
				}

				if (updatedJobStatus.Punching) {
					oUpdatedData.status = "Pasting";
				}

				if (updatedJobStatus.Pasting) {
					oUpdatedData.status = "Ready For Dispatch";
				}
				if (updatedJobStatus.InvNo) {
					oUpdatedData.status = "Dispatched";
				}
			}
			var selectedjobStatus = this.getView().getModel("appView").getProperty("/selectStatus");

			// var updatedJobStatus = this.getView().getModel("appView").getProperty("/newJobStatus/0")

			if (selectedjobStatus) {

				oUpdatedData.status = selectedjobStatus

			}


			var sEntityPath = `api/Jobs`;
			oUpdatedData.jobCardNo = ids;
			this.middleWare.callMiddleWare(sEntityPath, "patch", oUpdatedData)
				.then(function (data, status, xhr) {
					that.getJobsDataByCompanyFilter();

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
		},

		updateStatusValue: function () {
			var oModel = this.getView().getModel();
			var that = this;
			var ids = this.oArgs;
			var sEntityPath = `api/Jobs`;
			const oUpdatedData = {
				status: "Value Mismatched"

			};
			oUpdatedData.jobCardNo = ids;
			this.middleWare.callMiddleWare(sEntityPath, "patch", oUpdatedData)
				.then(function (data, status, xhr) {
					that.getJobsDataByCompanyFilter();

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
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
			var readDates = this.openYearPickar();
			var id = this.getModel('appView').getProperty('/UserId');
			var oState = this.getModel('appView').getProperty('/oState');
			var payLoad = {
				id,
			}
			var oFilter = encodeURIComponent('{"where":{"CompanyId":{"neq": null}}}');
			var url = 'api/Jobs?filter=' + oFilter
			var that = this;
			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			var selectedYear = this.getView().getModel("appView").getProperty('/getYearForFilterJobs');
			var maxDate = this.getView().getModel("appView").getProperty('/getMaxDateForFilterJobs');
			var minDate = this.getView().getModel("appView").getProperty('/getMinDateForFilterJobs');
			var payload = {
				"selectedYear": selectedYear,
				"maxDate": maxDate,
				"minDate": minDate,
				"State": oState ? oState : false
			}
			if (sUserRole === "Customer") {
				this.middleWare.callMiddleWare("JobsCustomer", "POST", payLoad)
					.then(function (data, status, xhr) {

						that.getView().getModel("appView").setProperty("/jobsData", data);
						that.getView().getModel("appView").setProperty("/countJobs", data.length);
						var isDescenting = that.getView().getModel("appView").getProperty('/isDescending');
						if (isDescenting === true) {
							that.onSortDescending();
						}
						else {
							that.onSortAscending();
						}




					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr, that);
					});
			}
			else {

				this.middleWare.callMiddleWare("getJobsWithCompany", "POST", payload)
					.then(function (data, status, xhr) {
						that.getView().getModel("appView").setProperty("/jobsData", data);
						that.getView().getModel("appView").setProperty("/countJobs", data.length);
						var isDescenting = that.getView().getModel("appView").getProperty('/isDescending');
						if (isDescenting === true) {
							that.onSortDescending();
						}
						else {
							that.onSortAscending();
						}
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr, that);
					});
			}
		},

		// Ascending Sort Jobs List

		onSortAscending: function () {
			var oModel = this.getView().getModel("appView");
			if (!oModel) {
				console.error("Model 'appView' not found.");
				return;
			}

			var oList = oModel.getProperty("/jobsData");
			if (!Array.isArray(oList)) {
				console.error("Property 'jobsData' is not an array or is not defined in the model.");
				return;
			}

			oList.sort(function (a, b) {
				return a.jobCardNo.localeCompare(b.jobCardNo, undefined, { numeric: true });
			});

			oModel.setProperty('/jobsData', oList);
			oModel.updateBindings();
		},


		//* Descending Sort Jobs List

		onSortDescending: function () {


			var oModel = this.getView().getModel("appView");
			if (!oModel) {
				console.error("Model 'appView' not found.");
				return;
			}

			var oList = oModel.getProperty("/jobsData");
			if (!Array.isArray(oList)) {
				console.error("Property 'jobsData' is not an array or is not defined in the model.");
				return;
			}

			oList.sort(function (a, b) {
				return b.jobCardNo.localeCompare(a.jobCardNo, undefined, { numeric: true });
			});

			oModel.setProperty('/jobsData', oList);
			oModel.updateBindings();
		},
		//this function hits when year select for filter jobs
		openYearPickar: function (oEvent) {

			var that = this;
			var oModel = this.getView().getModel("appView");
			if (oEvent) {
				if (!this._oPopover) {
					var oDateRangeSelection = new sap.m.DateRangeSelection({
						width: "100%",

						dateValue: new Date(), // Set to January 1st of the current year
						displayFormat: "yyyy", // Display only the year
						change: function (oDateChangeEvent) {
							var getYear = oDateChangeEvent.getParameter("from").getFullYear();
							var maxDate = new Date(getYear + 1, 2, 31);
							const uploadDateMaxDate = maxDate;
							var minDate = new Date(getYear, 3, 1);
							const uploadDateMinDate = minDate;
							oModel.setProperty("/getMaxDateForFilterJobs", uploadDateMaxDate);
							oModel.setProperty("/getMinDateForFilterJobs", uploadDateMinDate);
							oModel.setProperty("/getYearForFilterJobs", getYear);
							that.getJobsDataByCompanyFilter();
						},
					});

					this._oPopover = new sap.m.Popover({
						title: "Select a Year",
						contentWidth: "290px",
						placement: sap.m.PlacementType.Auto,
						content: oDateRangeSelection, // Set the DateRangeSelection as the popover's content
					});

					this.getView().addDependent(this._oPopover);
				}
				// Open the popover
				this._oPopover.openBy(oEvent.getSource());

			} else {
				var currentDate = new Date();
				var currentYear = currentDate.getFullYear();

				if (currentDate.getMonth() < 3 || (currentDate.getMonth() === 3 && currentDate.getDate() < 1)) {
					currentYear = currentYear - 1;
				}
				var financialYearStart = new Date(currentYear, 3, 1);

				var financialYearEnd = new Date(currentYear + 1, 2, 31);
				oModel.setProperty("/getMaxDateForFilterJobs", financialYearEnd);
				oModel.setProperty("/getMinDateForFilterJobs", financialYearStart);
				oModel.setProperty("/getYearForFilterJobs", currentYear);
			}

		},
		paperCuttingLiveChange: function (oEvent) {
			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var allRemPrinting = this.getView().getModel("appView").getProperty("/allRemainingDatas").PaperCutting
			// this.getView().getModel("appView").setProperty("/Printing", intNewValue);
			if (allRemPrinting >= intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStatePaperCutting", "None");
				// this.getView().getModel("appView").setProperty("/totalPrintingSheets", "");
				this.getView().getModel("appView").setProperty("/PaperCutting", newValue);
				this.getView().getModel("appView").setProperty("/newJob/PaperCutting", newValue);
				// this.getView().getModel("appView").getProperty("/newJob/Printing")
			} else {
				this.getView().getModel("appView").setProperty("/valueStatePaperCutting", "Error");
				this.getView().getModel("appView").setProperty("/PaperCutting", 0);
				// this.getView().getModel("appView").setProperty("/newJob/Printing", 0);
				this.getView().getModel("appView").setProperty("/VSTTPaperCutting", "Value Can't be More than " + allRemPrinting);
			}
		},

		printingLiveChange: function (oEvent) {

			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var allRemPrinting = this.getView().getModel("appView").getProperty("/allRemainingDatas").Printing
			// this.getView().getModel("appView").setProperty("/Printing", intNewValue);
			if (allRemPrinting >= intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStateTotalPrintingSheets", "None");
				// this.getView().getModel("appView").setProperty("/totalPrintingSheets", "");
				this.getView().getModel("appView").setProperty("/Printing", newValue);
				this.getView().getModel("appView").setProperty("/newJob/Printing", newValue);
				// this.getView().getModel("appView").getProperty("/newJob/Printing")
			} else {
				this.getView().getModel("appView").setProperty("/valueStateTotalPrintingSheets", "Error");
				this.getView().getModel("appView").setProperty("/Printing", 0);
				// this.getView().getModel("appView").setProperty("/newJob/Printing", 0);
				this.getView().getModel("appView").setProperty("/VSTTPrintingSheets", "Value Can't be More than " + allRemPrinting);
			}
		},
		coatingLiveChange: function (oEvent) {

			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			// this.getView().getModel("appView").updateBindings();
			var totalRemCoating = this.getView().getModel("appView").getProperty("/allRemainingDatas").Coating
			var livePrintingValue = this.getView().getModel("appView").getProperty('/Printing')
			if (!livePrintingValue) {
				livePrintingValue = 0;
			}
			var totalRemJobValues = totalRemCoating;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);


			if (totalRemJobValues >= intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStateCoating", "None");
				this.getView().getModel("appView").setProperty("/Coating", newValue);
				this.getView().getModel("appView").setProperty("/newJob/Coating", newValue);

			} else {
				this.getView().getModel("appView").setProperty("/valueStateCoating", "Error");
				this.getView().getModel("appView").setProperty("/Coating", 0);
				// this.getView().getModel("appView").setProperty("/newJob/Coating", 0);
				this.getView().getModel("appView").setProperty("/VSTCoating", "Value Can't be More than " + totalRemJobValues);
			}


		},
		foilingLiveChange: function (oEvent) {

			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var totalRemFoiling = this.getView().getModel("appView").getProperty("/allRemainingDatas").Foiling
			var liveCoatingValue = this.getView().getModel("appView").getProperty('/Coating')
			if (!liveCoatingValue) {
				liveCoatingValue = 0;
			}
			var totalRemJobValues = totalRemFoiling;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);
			if (totalRemJobValues >= intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStateFoiling", "None");
				this.getView().getModel("appView").setProperty("/Foiling", newValue);
				this.getView().getModel("appView").setProperty("/newJob/Foiling", newValue);
			} else {
				this.getView().getModel("appView").setProperty("/valueStateFoiling", "Error");
				this.getView().getModel("appView").setProperty("/Foiling", 0);
				// this.getView().getModel("appView").setProperty("/newJob/Foiling", 0);
				this.getView().getModel("appView").setProperty("/VSTFoiling", "Value Can't be More than " + totalRemJobValues);
			}

		},
		spotUVLiveChange: function (oEvent) {

			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var totalRemSpotUV = this.getView().getModel("appView").getProperty("/allRemainingDatas").spotUV
			var liveSpotUVValue = this.getView().getModel("appView").getProperty('/Foiling')
			if (!liveSpotUVValue) {
				liveSpotUVValue = 0;
			}
			var totalRemJobValues = totalRemSpotUV;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);

			if (totalRemJobValues >= intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStatespotUV", "None");
				this.getView().getModel("appView").setProperty("/spotUV", newValue);
				this.getView().getModel("appView").setProperty("/newJob/spotUV", newValue);
			} else {
				this.getView().getModel("appView").setProperty("/valueStatespotUV", "Error");
				this.getView().getModel("appView").setProperty("/spotUV", 0);
				// this.getView().getModel("appView").setProperty("/newJob/spotUV", 0);
				this.getView().getModel("appView").setProperty("/VSTspotUV", "Value Can't be More than " + totalRemJobValues);
			}


		},
		embossingLiveChange: function (oEvent) {

			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var totalRemEmbossing = this.getView().getModel("appView").getProperty("/allRemainingDatas").Embossing
			var livespotUVValue = this.getView().getModel("appView").getProperty('/spotUV')
			if (!livespotUVValue) {
				livespotUVValue = 0;
			}
			var totalRemJobValues = totalRemEmbossing;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);


			if (totalRemJobValues >= intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStateEmbossing", "None");
				this.getView().getModel("appView").setProperty("/Embossing", newValue);
				this.getView().getModel("appView").setProperty("/newJob/Embossing", newValue);
			} else {
				this.getView().getModel("appView").setProperty("/valueStateEmbossing", "Error");
				this.getView().getModel("appView").setProperty("/Embossing", 0);
				// this.getView().getModel("appView").setProperty("/newJob/Embossing", 0);
				this.getView().getModel("appView").setProperty("/VSTEmbossing", "Value Can't be More than " + totalRemJobValues);
			}

		},
		punchingLiveChange: function (oEvent) {

			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			var totalRemPunching = this.getView().getModel("appView").getProperty("/allRemainingDatas").Punching
			var liveEmbossingValue = this.getView().getModel("appView").getProperty('/Embossing')
			if (!liveEmbossingValue) {
				liveEmbossingValue = 0;
			}
			var totalRemJobValues = totalRemPunching;
			this.getView().getModel("appView").setProperty("/intNewValue", intNewValue);

			if (totalRemJobValues >= intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStatePunching", "None");
				this.getView().getModel("appView").setProperty("/Punching", newValue);
				this.getView().getModel("appView").setProperty("/newJob/Punching", newValue);
			} else {
				this.getView().getModel("appView").setProperty("/valueStatePunching", "Error");
				this.getView().getModel("appView").setProperty("/Punching", 0);
				// this.getView().getModel("appView").setProperty("/newJob/Punching", 0);
				this.getView().getModel("appView").setProperty("/VSTPunching", "Value Can't be More than " + totalRemJobValues);
			}


		},
		pastingLiveChange: function (oEvent) {

			var newValue = parseInt(oEvent.getParameter("newValue"));
			var intNewValue = newValue;
			var PunchingValue = this.getView().getModel("appView").getProperty("/allRemainingDatas").Punching;
			// var totalRemPasting = this.getView().getModel("appView").getProperty("/allRemainingDatas")
			// var totalNoPasting = this.getView().getModel("appView").getProperty("/totalPastingPcs").Pasting
			// var totalNoOfUpsInJob = this.getView().getModel("appView").getProperty("/totalNoOfUpsInJob");
			var totalNoOfPcs = this.getView().getModel("appView").getProperty("/totalNoOfPcs");
			// var livePunchingValue = this.getView().getModel("appView").getProperty('/Punching')x	
			if (!PunchingValue) {
				PunchingValue = 0;
			}
			this.getView().getModel("appView").setProperty("/pastingNewValue", intNewValue);


			if (totalNoOfPcs > intNewValue || totalNoOfPcs === intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStatePasting", "Error");
				this.getView().getModel("appView").setProperty("/Pasting", newValue);
				this.getView().getModel("appView").setProperty("/newJob/Pasting", newValue);
				this.getView().getModel("appView").setProperty("/VSTPasting", "Value Can't be less than " + totalNoOfPcs);
			} else {
				this.getView().getModel("appView").setProperty("/valueStatePasting", "None");
				this.getView().getModel("appView").setProperty("/Pasting", 0);
				// this.getView().getModel("appView").setProperty("/VSTPasting", "Value Can't be less than " + totalNoOfPcs);
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
				this.getView().getModel("appView").setProperty("/remainingPiecesToSend", 0);
				this.getView().getModel("appView").setProperty("/remainingPiecesPerBox", 0);
				this.getView().getModel("appView").setProperty("/remainingNoOfShippers", 0);

			}

			else if (newPiecePerBox <= totalShippingPeices) {

				this.getView().getModel("appView").setProperty("/valueStatePiecePerBox", "None");

				this.getView().getModel("appView").setProperty("/VSTPiecePerBox", "");

				this.getView().getModel("appView").setProperty("/piecePerBox", tempPiecePerBox);

				this.getView().getModel("appView").setProperty("/valuePiecePerBox", newPiecePerBox);

				var noOfShippers = Math.floor(totalShippingPeices / tempPiecePerBox);

				this.getView().getModel("appView").setProperty("/totalShippers", noOfShippers);

				var noOfShippersFloat = totalShippingPeices / tempPiecePerBox;

				this.getView().getModel("appView").setProperty("/totalShippersFloat", noOfShippersFloat);

				var remainingPiecesToSendFloat = noOfShippersFloat - noOfShippers;
				var remainingPiecesToSend = remainingPiecesToSendFloat * tempPiecePerBox;
				this.getView().getModel("appView").setProperty("/remainingPiecesToSend", remainingPiecesToSend);
				var remainingPiecesPerBox = 1;
				if (remainingPiecesToSend === 0) {
					this.getView().getModel("appView").setProperty("/remainingPiecesPerBox", remainingPiecesPerBox);
				}
				var remainingNoOfShippers = noOfShippers + remainingPiecesPerBox;
				this.getView().getModel("appView").setProperty("/remainingNoOfShippers", remainingNoOfShippers);
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

			// if (oEvent) {
			// 	var newValue = parseInt(oEvent.getParameter("newValue"));
			// } else {
			// 	var newValue = this.getView().getModel("appView").getProperty("/totalShippingPieces");
			// }
			// var intNewValue = newValue;
			// var totalPrintedPieces =  this.getView().getModel("appView").getProperty("/Pasting");

			// this.getView().getModel("appView").setProperty("/totalShippingPieces", intNewValue);
			// // totalPrintedPieces = 14000;
			// if (intNewValue.toString() === 'NaN' || totalPrintedPieces >= intNewValue) {
			// 	this.getView().getModel("appView").setProperty("/valueStatePieceToSend", "None");

			// 	this.getView().getModel("appView").setProperty("/VSTPieceToSend", "");

			// 	this.getView().getModel("appView").setProperty("/totalShippingPieces", newValue);
			// } else {

			// 	this.getView().getModel("appView").setProperty("/valueStatePieceToSend", "Error");

			// 	this.getView().getModel("appView").setProperty("/totalShippingPieces", 0);

			// 	this.getView().getModel("appView").setProperty("/VSTPieceToSend", "Pieces can't be more than " + totalPrintedPieces);

			// }

			// this.onLiveChnagePiecePerBox();

			// this.getView().getModel("appView").updateBindings();

			var newValue1 = oEvent.getParameter("value");
			var newValue = parseInt(newValue1);
			var intNewValue = newValue;
			// var PastingValue = oEvent.getSource().getParent().getParent().getBindingContext("appView").getObject().Pasting;
			var PastingValue = this.getView().getModel("appView").getProperty("/noOfPastingFromBackend");
			var remainingPieces = this.getView().getModel("appView").getProperty("/noOfPiecesFrombackend");
			var newPastingValue = this.getView().getModel("appView").getProperty("/pastingNewValue");
			// var totalRemPasting = this.getView().getModel("appView").getProperty("/allRemainingDatas")
			// var totalNoPasting = this.getView().getModel("appView").getProperty("/totalPastingPcs").Pasting
			// var totalNoOfUpsInJob = this.getView().getModel("appView").getProperty("/totalNoOfUpsInJob")
			// var noOfPiecesToSend = this.getView().getModel("appView").getProperty('/Pasting')
			if (!PastingValue) {
				PastingValue = newPastingValue
			}
			if (!remainingPieces) {
				remainingPieces = 0;
			}
			if (remainingPieces === null) {
				var totalRemJobValues = PastingValue;
			} else {
				var totalRemJobValues = PastingValue;
				totalRemJobValues = isNaN(totalRemJobValues) ? 0 : totalRemJobValues;
			}
			this.getView().getModel("appView").setProperty("/piecesToSendNewValue", intNewValue);


			if (totalRemJobValues >= intNewValue) {
				this.getView().getModel("appView").setProperty("/valueStatePieceToSend", "None");

				this.getView().getModel("appView").setProperty("/VSTPieceToSend", "");

				this.getView().getModel("appView").setProperty("/totalShippingPieces", newValue);
			} else {
				this.getView().getModel("appView").setProperty("/valueStatePieceToSend", "Error");

				this.getView().getModel("appView").setProperty("/totalShippingPieces", 0);

				this.getView().getModel("appView").setProperty("/VSTPieceToSend", "Value Can't be More than " + totalRemJobValues);
			}
		},
		getRemJobsStatus: function () {




			var oModel = this.getView().getModel("appView");

			var allJobs = this.getView().getModel("appView").getProperty("/Jobs");

			var totalNoOfUps = allJobs.noOfUps3;
			var totalNoOfPcs = allJobs.qtyPcs;

			var totalprintingsheets = allJobs.noOfSheets1;

			var oSumOfData = {

				"Coating": 0,
				"PaperCutting": 0,
				"Printing": 0,
				"Punching": 0,
				"Foiling": 0,
				"Embossing": 0,
				"Pasting": 0,
				"spotUV": 0,
				"Packing": 0,
				"noOfBoxPerPieces": 0,
				"noOfPiecesToSend": 0,
				"SecoundarySuppliers": 0,
				"SecoundaryPiecesToSend": 0,
				"rawMaterial": "",
				"InvNo": "",
				"DeliveryNo": ""
			}
			var printingsheet = oModel.getProperty("/newJobStatus");
			for (let i = 0; i < printingsheet.length; i++) {

				var paperCutting = printingsheet[i].PaperCutting;
				var printing = printingsheet[i].Printing;
				var coating = printingsheet[i].Coating;
				var foiling = printingsheet[i].Printing;
				var spotUV = printingsheet[i].spotUV;
				var embossing = printingsheet[i].Embossing;
				var punching = printingsheet[i].Punching;
				var pasting = printingsheet[i].Pasting;
				var noOfBoxPerPieces = printingsheet[i].noOfBoxPerPieces;
				var noOfPiecesToSend = printingsheet[i].noOfPiecesToSend;
				var SecoundarySuppliers = printingsheet[i].SecoundarySuppliers;
				var SecoundaryPiecesToSend = printingsheet[i].SecoundaryPiecesToSend;

				var parsePaperCutting = parseInt(paperCutting)
				var integerNumber = parseInt(printing);
				var noOfCoating = parseInt(coating);
				var noOfFoiling = parseInt(foiling);
				var noOfSpotUV = parseInt(spotUV);
				var noOfEmbossing = parseInt(embossing);
				var noOfPunching = parseInt(punching);
				var noOfPasting = parseInt(pasting);
				var noOfBoxPerPieces = parseInt(noOfBoxPerPieces);
				var noOfPiecesToSend = parseInt(noOfPiecesToSend);
				noOfBoxPerPieces = isNaN(noOfBoxPerPieces) ? "" : noOfBoxPerPieces;


				oSumOfData.PaperCutting += parsePaperCutting;
				oSumOfData.Printing += integerNumber;
				oSumOfData.Coating += noOfCoating;
				oSumOfData.Foiling += noOfFoiling;
				oSumOfData.spotUV += noOfSpotUV;
				oSumOfData.Embossing += noOfEmbossing;
				oSumOfData.Punching += noOfPunching;
				oSumOfData.Pasting += noOfPasting;
				oSumOfData.noOfBoxPerPieces += noOfBoxPerPieces;
				oSumOfData.noOfPiecesToSend += noOfPiecesToSend;


			}

			var remData = {
				"Printing": totalprintingsheets,
				"PaperCutting": totalprintingsheets,
				"Coating": totalprintingsheets,
				"Foiling": totalprintingsheets,
				"spotUV": totalprintingsheets,
				"Embossing": totalprintingsheets,
				"Punching": totalprintingsheets,
				// "Pasting": oSumOfData.Punching
				"noOfPiecesToSend": oSumOfData.noOfPiecesToSend,
				"noOfBoxPerPieces": oSumOfData.noOfBoxPerPieces,
				"SecoundaryPiecesToSend": oSumOfData.SecoundaryPiecesToSend,
				"SecoundarySuppliers": oSumOfData.SecoundarySuppliers
			}

			var totalPrintedSheets = oSumOfData.Printing

			// var totalPrintedPieces = (totalPrintedSheets*noOfUps).toString();

			oModel.setProperty("/sumOfJobsData", oSumOfData)
			oModel.setProperty("/allRemainingDatas", remData)
			oModel.setProperty("/totalPrintCompleted", totalPrintedSheets)
			oModel.setProperty("/totalPrintedSheetsTillNow", totalPrintedSheets * totalNoOfUps);
			oModel.setProperty("/totalNoOfUpsInJob", totalNoOfUps);
			oModel.setProperty("/totalNoOfPcs", totalNoOfPcs);
			oModel.setProperty("/noOfPastingFromBackend", noOfPasting);
			oModel.setProperty("/noOfPiecesFrombackend", noOfPiecesToSend);

		},
		onClickMarkAsUrgent: function () {
			
			var customerAllJobs = this.getView().getModel("appView").getProperty("/jobsData");
			var that = this;
			var selectedJob = this.getView().getModel("appView").getProperty("/Jobs");
			var maxUrgentJobs = Math.ceil(customerAllJobs.length / 5)
			var oModel = this.getView().getModel();
			var filterWithMarkAsUrgent = customerAllJobs.filter((job) => {
				return job.Urgent === "Yes"
			});
			var alreadyUrgentJobs = filterWithMarkAsUrgent.length
			if (alreadyUrgentJobs < maxUrgentJobs) {
				// selectedJob.Urgent = "Yes"
				var id = this.oArgs;
				const sEntityPath = `/Jobs('${id}')`;
				var payload = {
					"Urgent": "Yes"
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
			else {
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
					name: "ent.ui.ecommerce.fragments.printingDetailFragment.MarkedAsUrgent",
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


		onClickRemoveAsUrgent: function (oEvent) {

			var oModel = this.getView().getModel();
			var that = this;
			// var data = that.getView().getModel("appView").getProperty("/Jobs");
			if (!oEvent.getSource().getBindingContext("appView")) {
				var data = that.getView().getModel("appView").getProperty("/Jobs");
				var id = data.jobCardNo;
				var sPath = `/Jobs('${id}')`
			}
			else {
				var isSelectedJob = oEvent.getSource().getBindingContext("appView").getObject();
				var id = isSelectedJob.jobCardNo;
				var sPath = `/Jobs('${id}')`
			}
			// var sPath = `/Job/('${id}')`;
			var payload = {
				"Urgent": "No"
			}
			oModel.update(sPath, payload, {
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


		},

		// modelData : {
		// 	orderNo: "2023-24/198",
		// 	date: "28-Oct-24",
		// 	deliveryAddress: {
		// 		name: "Aeon Products - NEW ADDRESS",
		// 		address: "Gala No 1/13, Shree Shankar Industrial Estate No. 1, Behind Burma Shell Bharat Petroleum Pump, Naka Pada, N.H. No. 8, Vasai (E)."
		// 	},
		// 	items: [
		// 		{
		// 			description: "Tulsi - Satin Chrome White Back",
		// 			quantity: "1147 Kg",
		// 			rate: "₹ 47.75",
		// 			value: "₹ 54,769.25"
		// 		}
		// 	],
		// 	total: "₹ 54,769.25",
		// 	sgst: "₹ 3,286.16",
		// 	cgst: "₹ 3,286.16",
		// 	grandTotal: "₹ 61,341.56"
		// },

		onPDFGenerate: async function () {


			// let oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		//    const jsonData = {
		// 	"language": "",
		// 	"clientData":{
		// 		"company": "Royal Umzug GmbH",
		// 		"name": "Mhidin Eskandar",
		// 		"emailId": "info@royal-umzug.ch",
		// 		"contactNo": "+41 43 433 80 87",
		// 		"street": "Seebergstrasse 1",
		// 		"postal": "8952",
		// 		"city": "Schlieren",
		// 		"country": "Schweiz",
		// 		"status": 10,
		// 		"comments": "Bezahlung on Rechnung.",
		// 		"Website": "www.royal-umzug.ch"
		// 	},
		// 	"orderData":{
		// 				"orderedDate"       : "01.02.2024",
		// 				"orderedItems"     :[{
		// 					"item" : "Umzug",
		// 					"date": "01.03.2024 - 08:30",
		// 					"description":"Umzug 1 von: Seebergstr. 1, 8952 Schlieren, Schweiz - Haus - 5. Etage mit Lift \nnach: Badenestrasse 240, 8008 Zürich, Schweiz - Wohnung - 5. Etage mit Lift.",
		// 					"remarks":" Umzugsgegenstände :40x standard Umzugskisten, 1x 4. schiebtüriges Schrank Schrank , 1x klein Kommode, 1x klein Sessel, 1x klein Doppelbett - Volumen ca. 10.7 (m3) - Gewicht: ca 1130 (Kg)."
		// 				},{
		// 					"item" : "Umzug",
		// 					"date": "02.03.2024 - 08:30",
		// 					"description":"Umzug 2- von: Dättnauerstrase 151, 8400 Winterthur, Schweiz - Wohnung - 2. Etage mit Lift \nnach: Badenestrasse 240, 8008 Zürich, Schweiz - Wohnung - 5. Etage mit Lift.",
		// 					"remarks":" Umzugsgegenstände :40x standard Umzugskisten, 1x 4. schiebtüriges Schrank Schrank , 1x klein Kommode, 1x klein Sessel, 1x klein Doppelbett - Volumen ca. 10.7 (m3) - Gewicht: ca 1130 (Kg)."
		// 				},{
		// 					"item" : "Einlagerung",
		// 					"date": "02.03.2024 - 08:30",
		// 					"description":" von: Dättnauerstrase 151, 8400 Winterthur, Schweiz - Wohnung - 2. Etage mit Lift nach: Royal Umzug GmbH, Lager in Schlieren",
		// 					"remarks":" Lagerunggegenstände :40x standard Umzugskisten, 1x 4. schiebtüriges Schrank Schrank , 1x klein Kommode, 1x klein Sessel, 1x klein Doppelbett - Volumen ca. 10 (m3) - Gewicht: ca 1130 (Kg)."
		// 				},{
		// 					"item" : "Einpakung",
		// 					"date": "29.02.2024 - 14:30",
		// 					"description":"Einpaken von Mäbel und Content",
		// 					"remarks":"Umzugsgegenstände :40x standard Umzugskisten, 1x 4. schiebtüriges Schrank Schrank , 1x klein Kommode, 1x klein Sessel, 1x klein Doppelbett - Volumen ca. 10.7 (m3) - Gewicht: ca 1130 (Kg)."
		// 				},{
		// 					"item" : "Reinigung",
		// 					"date": "03.03.2024 - 07:30",
		// 					"description":"Reinigung 1 at: Seebergstr. 1, 8952 Schlieren, Schweiz - Haus -5 Zimmer 150 m2 mit Keller",
		// 					"remarks":"Reinigungsmaterial sind nicht inklusive."
		// 				},{
		// 					"item" : "Reinigung",
		// 					"date": "04.03.2024 - 15:30",
		// 					"description":"Abagbe grantie at Seebergstr. 1 ",
		// 					"remarks":"Reinigungsmaterial inklusive."
		// 				},
		// 				{
		// 					"item" : "Reinigung",
		// 					"date": "02.03.2024 - 07:30",
		// 					"description":"Reinigung 2 at: Dättnauerstrase 151, 8400 Winterthur, Schweiz - Wohnung -5 Zimmer 70 m2 mit Keller",
		// 					"remarks":"Reinigungsmaterial inklusive."
		// 				},
		// 				{
		// 					"item" : "Reinigung",
		// 					"date": "02.03.2024 - 07:30",
		// 					"description":"Reinigung 2 at: Dättnauerstrase 151, 8400 Winterthur, Schweiz - Wohnung -5 Zimmer 70 m2 mit Keller",
		// 					"remarks":"Reinigungsmaterial inklusive."
		// 				},
		// 				{
		// 					"item" : "Reinigung",
		// 					"date": "02.03.2024 - 07:30",
		// 					"description":"Reinigung 2 at: Dättnauerstrase 151, 8400 Winterthur, Schweiz - Wohnung -5 Zimmer 70 m2 mit Keller",
		// 					"remarks":"Reinigungsmaterial inklusive."
		// 				},
		// 				{
		// 					"item" : "Reinigung",
		// 					"date": "02.03.2024 - 07:30",
		// 					"description":"Reinigung 2 at: Dättnauerstrase 151, 8400 Winterthur, Schweiz - Wohnung -5 Zimmer 70 m2 mit Keller",
		// 					"remarks":"Reinigungsmaterial inklusive."
		// 				},
		// 				{
		// 					"item" : "Reinigung",
		// 					"date": "02.03.2024 - 07:30",
		// 					"description":"Reinigung 2 at: Dättnauerstrase 151, 8400 Winterthur, Schweiz - Wohnung -5 Zimmer 70 m2 mit Keller",
		// 					"remarks":"Reinigungsmaterial inklusive."
		// 				},
		// 				{
		// 					"item" : "Reinigung",
		// 					"date": "02.03.2024 - 07:30",
		// 					"description":"Reinigung 2 at: Dättnauerstrase 151, 8400 Winterthur, Schweiz - Wohnung -5 Zimmer 70 m2 mit Keller",
		// 					"remarks":"Reinigungsmaterial inklusive."
		// 				},
		// 				{
		// 					"item" : "Reinigung",
		// 					"date": "02.03.2024 - 07:30",
		// 					"description":"Reinigung 2 at: Dättnauerstrase 151, 8400 Winterthur, Schweiz - Wohnung -5 Zimmer 70 m2 mit Keller",
		// 					"remarks":"Reinigungsmaterial inklusive."
		// 				},
   
		// 				{
		// 					"item" : "Verpackungs material",
		// 					"date": "15.02.2024 - 07:30",
		// 					"description":"10x Standardkarton, 20x Bücherkarton,2x Weinkarton and 10mx Strechfoilie",
		// 					"remarks":"zur Miete"
		// 				}
   
		// 				]
		// 			 },
		// 	"offerData" :
		// 		 {
		// 			"offerDate": "03.02.2024",
		// 			"offerRef": "2024-10001",
		// 			"offerComments": "Grobofferte",
		// 			"isDiscount"  : true,
		// 			"discount"  : "10%",
		// 			"isVAT"  : true,
		// 			"Resources":"1 LKW and 2 Movers",
		// 			"VAT": "8.1%",
		// 			"offerItems": [
		// 				{
		// 				"item"        : "Umzug",
		// 				"description" :"Anfahrt/ Rückfahrt",
		// 				"rate"        : "150.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 1,
		// 				"unit"        : "Stunde",
		// 				"subtotal"    : "150.00"
		// 				 },
   
		// 			 {
		// 				"item"        : "Umzug",
		// 				"description" :"Ort 2-Aufwand bei Verfladen,Entladen und Fahrt",
		// 				"rate"        : "150.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : "2.00",
		// 				"unit"        : "Stunde",
		// 				"subtotal"    : "300.00"
		// 			 },
		// 			 {
		// 				"item"        : "Einlagerung",
		// 				"description" :"Ort 2-Aufwand bei Verfladen,Entladen und Fahrt",
		// 				"rate"        : "150.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 2,
		// 				"unit"        : "Stunde",
		// 				"subtotal"    : "300.00"
		// 			 },
		// 			 {
		// 				"item"        : "Einlagerung",
		// 				"description" : "Lagerungsvolumen",
		// 				"rate"        : "15.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 10,
		// 				"unit"        : "m3",
		// 				"subtotal"    : "150.00"
		// 			 },
		// 			 {
		// 				"item"        : "Einpakung",
		// 				"description" :"Ort 1 Demontage und Einpacken ",
		// 				"rate"        : "150.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 2,
		// 				"unit"        : "Stunde",
		// 				"subtotal"    : "300.00"
		// 			 },
		// 			 {
		// 				"item"        : "Reinigung",
		// 				"description" :"Ort 1 Reinigung 4 Zimmer",
		// 				"rate"        : "700.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 1,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "700.00"
		// 			 },
		// 			 {
		// 				"item"        : "Reinigung",
		// 				"description" :"Ort 1 Reinigung 4 Zimmer",
		// 				"rate"        : "700.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 1,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "700.00"
		// 			 },
   
		// 			 {
		// 				"item"        : "Reinigung",
		// 				"description" :"Ort 2 Reinigung 5 Zimmer",
		// 				"rate"        : "900.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 1,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "700.00"
		// 			 },
		// 			 {
		// 				"item"        : "Entsorung",
		// 				"description" :"Entsorgungsvolumen",
		// 				"rate"        : "50.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 5,
		// 				"unit"        : "m3.",
		// 				"subtotal"    : "250.00"
		// 			 } ,
		// 			 {
		// 				"item"        : "Entsorung",
		// 				"description" :"Ort 2- Doppelbett und Kommode",
		// 				"rate"        : "50.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 6,
		// 				"unit"        : "m3.",
		// 				"subtotal"    : "300.00"
		// 			 },
		// 			 {
		// 				"item"        : "Entsorung",
		// 				"description" :"Aufwand bei Entsorgungsstelle",
		// 				"rate"        : "150.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 1,
		// 				"unit"        : "LKW",
		// 				"subtotal"    : "150.00"
		// 			 } ,
		// 			 {
		// 				"item"        : "Verpackungs material",
		// 				"description" :"Standardkarton zu Miete",
		// 				"rate"        : "3.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 10,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "30.00"
		// 			 },
		// 			 {
		// 				"item"        : "Verpackungs material",
		// 				"description" :"Bücherkarton zu Miete",
		// 				"rate"        : "3.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 20,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "60.00"
		// 			 },
		// 			 {
		// 				"item"        : "Verpackungs material",
		// 				"description" :"Bücherkarton zu Miete",
		// 				"rate"        : "3.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 20,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "60.00"
		// 			 },
		// 			 {
		// 				"item"        : "Verpackungs material",
		// 				"description" :"Bücherkarton zu Miete",
		// 				"rate"        : "3.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 20,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "60.00"
		// 			 },
		// 			 {
		// 				"item"        : "Verpackungs material",
		// 				"description" :"Bücherkarton zu Miete",
		// 				"rate"        : "3.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 20,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "60.00"
		// 			 },
		// 			 {
		// 				"item"        : "Verpackungs material",
		// 				"description" :"Bücherkarton zu Miete",
		// 				"rate"        : "3.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 20,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "60.00"
		// 			 },
		// 			 {
		// 				"item"        : "Verpackungs material",
		// 				"description" :"Bücherkarton zu Miete",
		// 				"rate"        : "3.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 20,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "60.00"
		// 			 },
		// 			 {
		// 				"item"        : "Verpackungs material",
		// 				"description" :"Weinkarton zu Miete",
		// 				"rate"        : "8.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 2,
		// 				"unit"        : "Stck.",
		// 				"subtotal"    : "16.00"
		// 			 },
		// 			 {
		// 				"item"        :"Verpackungs material",
		// 				"description" :"Strechfoilie zu Kauf",
		// 				"rate"        : "14.00",
		// 				"currency"    : "CHF",
		// 				"qty"         : 1,
		// 				"unit"        : "Rol.",
		// 				"subtotal"    : "15.00"
		// 			 }
		// 			 ]
		// 		 }
   
   
		// 	};

		// var oParameter = oEvent.getParameter('listItem');	//getting selected row item object
		// var omodel = this.getView().getModel("appView");
		// var sData = oParameter.getBindingContext('appView').getObject();
		// let updatedData = this.updateFragmentData(sData);
		// omodel.setProperty('/currentJobCardNo', sData.jobCardNo);
		// omodel.setProperty('/jobsAttachmentData', updatedData);
		var oView = this.getView();
		// var that = this;
		// omodel.updateBindings();
		// this.pdfDetails();
		let oPaylaod = {
			pdfDataOrderNo : '',
			pdfDeliveryDate : '',
			pdfDataDeliveryAddress : '',
			tableData : [{
				"ItemName": "",
				"ItemSize": "",
				"ItemInches": "",
				"GSM": "",
				"Sheets": "",
				"ProductCode": "",
				"DeliveryDate": "",
				"Quantity": "",
				"Rate": ""
			}]
		};
		this.getModel("appView").setProperty("/pdfItems",oPaylaod);
		this.pdfDetails().then(function (oDialog) {
			oDialog.open();
		});


   
			// let model = this.getView().getModel("i18n");
			// let jsonData = this.getView().getModel("appView").getProperty("/Jobs");
			// let companyId = jsonData.CompanyId;
			// var oModel = this.getView().getModel();
			// let aeonCompanyId = "64d31c348c30b08f885c2c0e";
			// let newJson = {};
			// let aeonCompany = await oModel.read("/Company('" + aeonCompanyId + "')", {
			// 	success: function (data) {
			// 		newJson = {
			// 			SenderCompanyName : data.CompanyName,
			// 			SenderCompanyAddress : data.CompanyAddress,
			// 			SenderGstNumber : data.GstNumber,
			// 			SenderPhoneNumber : data.PhoneNo,
			// 			SenderEmail : data.EmailAddress
			// 		}
			// 	}
			// });
			// await oModel.read("/Company('" + companyId + "')", {
			// 	success: function (data) {
			// 		// console.log(data);
			// 		let reciverJSON = {
			// 			companyName : data.CompanyName,
			// 			companyAddress : data.CompanyAddress,
			// 			gstNumber : data.GstNumber,
			// 			phoneNumber : data.PhoneNo,
			// 			email : data.EmailAddress
			// 		}
			// 		Object.assign(newJson,reciverJSON);
			// 		const binary =  pdfEngine.pdf(newJson, 'download','A4',model);
			// 	},
			// 	error: function (error) {
			// 		MessageToast.show('No Job Found : ' + that.oArgs);
			// 		that.getRouter().navTo("allPrinters");
			// 		// that.middleWare.errorHandler(error.statusText,that);
			// 		// that.middleWare.errorHandler(error, that);
			// 	}
			// });



		//    const binary = await pdfEngine.pdf(jsonData, 'download','A4',model);

		 },

		 pdfDetails: function () {
			var oView = this.getView();
			if (!this.pdfdetails) {
				this.pdfdetails = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.createInvoicePDF",
					controller: this
				}).then(function (oDialog) {
					// Add dialog to view hierarchy
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			return this.pdfdetails;
		},
		onCloseValDialog: function () {
			this.pdfDetails().then(function (oDialog) {
				oDialog.close();
			});
		},

		onSavePDFData : async function(){
			// Getting data from fragment for PDF body area.
			let tableData = this.getModel("appView").getProperty("/pdfItems");

			let model = this.getView().getModel("i18n");
			let jsonData = this.getView().getModel("appView").getProperty("/Jobs");
			let companyId = jsonData.CompanyId;
			var oModel = this.getView().getModel();
			let aeonCompanyId = "64d31c348c30b08f885c2c0e";
			let newJson = {};
			let selfCompany = await oModel.read("/Company('" + aeonCompanyId + "')", {
				success: function (data) {
					newJson = {
						SenderCompanyName : data.CompanyName,
						SenderCompanyAddress : data.CompanyAddress,
						SenderGstNumber : data.GstNumber,
						SenderPhoneNumber : data.PhoneNo,
						SenderEmail : data.EmailAddress
					}
					oModel.read("/Company('" + companyId + "')", {
						success: function (data) {
							// console.log(data);
							let reciverJSON = {
								companyName : data.CompanyName,
								companyAddress : data.CompanyAddress,
								gstNumber : data.GstNumber,
								phoneNumber : data.PhoneNo,
								email : data.EmailAddress
							}
							Object.assign(newJson,reciverJSON);
							Object.assign(newJson,tableData);
							const binary =  pdfEngine.pdf(newJson, 'download','A4',model);
						},
						error: function (error) {
							MessageToast.show('No Job Found : ' + that.oArgs);
							that.getRouter().navTo("allPrinters");
						}
					});
				}
			});



		//    const binary = await pdfEngine.pdf(jsonData, 'download','A4',model);





		},

		onAddItemsPDF: function () {
			var oData = this.getModel("appView").getProperty("/pdfItems/tableData");
			var oPaylaod = {
				"ItemName": "",
				"ItemSize": "",
				"ItemInches": "",
				"GSM": "",
				"Sheets": "",
				"ProductCode": "",
				"DeliveryDate": "",
				"Quantity": "",
				"Rate": ""
			};
			oData.push(oPaylaod);
			this.getModel("appView").setProperty("/pdfItems/tableData", oData);
		}




	});
});