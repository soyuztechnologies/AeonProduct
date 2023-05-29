sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
], function (BaseController, MessageToast, JSONModel, Fragment) {
	"use strict";
	var isPono;
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
		onClickPopup: function (oEvent) {
			debugger;
			var oView = this.getView();
			var that = this;
			
			var oModel = this.getView().getModel("appView");


			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();
				that.onReadData();
				that.onReadDataArt();
				isPono =  true;
				oModel.setProperty('/fileUploaderValue', "")
				// oModel.setProperty('/browseVisArtwork', false);
				oModel.setProperty('/browseVis', true);
				oModel.setProperty('/pdfVisibility', false);
				var sUserRole = oModel.getProperty('/UserRole');
				if (sUserRole === 'Customer') {

					oModel.setProperty('/btnVisibility', false);
					oModel.setProperty('/browseVis', false);

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
		
		// * this fucntion will opens the dialog, on to the Artwork filed in job details screen.
		onClickPopupArt: function () {
			var oView = this.getView();
			var that = this;
			var oModel = this.getView().getModel("appView");
			// this.onReadData();
			// this.onReadDataArt();

			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();
				that.onReadData();
				that.onReadDataArt();
				isPono =  false;
				oModel.setProperty('/fileUploaderValue', "")

				oModel.setProperty('/viewPo', false);
				// oModel.setProperty('/browseVisArtwork', true);
				oModel.setProperty('/browseVis', true);
				oModel.setProperty('/pdfVisibility', false);

				var sUserRole = oModel.getProperty('/UserRole');
				if (sUserRole === 'Customer') {
					oModel.setProperty('/btnVisibility', false);
					oModel.setProperty('/browseVis', false);
					// that.getModel('appView').setProperty('/modifybtnvis', false);
					// that.getModel('appView').setProperty('/updBtnVisibility', false);
				}
			});
		},

		// * this fucntion will opens the dialog, for factory manager and admin to update the data.
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

		// * this fucntion will close the dialog of the "onPressAdd" or Add button dialog on status.
		onClose: function () {
			this.Jobstatus.then(function (oDialog) {
				oDialog.close();

			});
		},

		onBrowse : function () {

		},

		onReject: function () {
			this.oUploadDialog.then(function (oDialog) {
				oDialog.clear();
				oDialog.close();

			});
		},

		onUploadPoNo : function(){
			debugger;
			var oModel = this.getView().getModel(); ///default model get at here
			var that = this;
			var ids = this.oArgs
			var poFile = this.getView().getModel('appView').getProperty("/pdfUrl");
			// if(!poFile){
			// 	MessageToast.show("Please Upload The Document");
			// 	return
			// }
				var oUpdatedData = {
					poAttachment: poFile,
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
			MessageToast.show("upload the pono files.")


		},
		onUploadArtWork : function(){
			var oModel = this.getView().getModel(); ///default model get at here
			var that = this;
			var ids = this.oArgs
			var artworkAttachment = this.getView().getModel('appView').getProperty("/pdfArtwork");
			
			var artworkAttachmentimg = this.getView().getModel('appView').getProperty("/imageContentArtwork");
				var poFileimg = this.getView().getModel('appView').getProperty("/imageContent");
				var oUpdatedData = {
					poAttachment: poFileimg,
					artworkAttachment: artworkAttachmentimg
				};

			if(!artworkAttachment){
				MessageToast.show("Please Upload The Document");
				return
			}
				var oUpdatedData = {
					artworkAttachment: artworkAttachment,
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
			MessageToast.show("upload the artwork files.")
		},

		saveAttachments: function (that, cPayload) {
            var firstLine = '--AttachmentBoundary\r\n',
                secondLine = 'Content-Disposition: form-data; name="files"; filename="$$fileName$$.txt"\r\n',
                thirdLine = 'Content-Type: application/pdf\r\n \r\n',
                lastLine = '--AttachmentBoundary--';
            var items = JSON.parse(JSON.stringify(that.local.getProperty("/tableData")));
            var fileExtentionFromMimeType = that.local.getProperty("/fileExtentionFromMieType");
            var newItems = [];
            var checkReqDoc = new Set();
            var confirmMessage = "";
            var infoMessage = "";
            var itemsWithoutAttachment = [];
            var forEmail = "Valid From   |    Valid To   |  Issue Date |    Status   |  Document\r\n\r\n ";
            var vendorId = that.getVendorId();
            for (var i = 0; i < items.length; i++) {
                if ((!items[i].U_AttachByteStreamGA && (items[i].U_Status === null)) && (items[i].U_AttachDescription || items[i].U_IssuedBy)) {
                    // forEmail += items[i].U_Type + " | " + items[i].U_ValidFrom + " | " + items[i].U_ValidTo + " | " + items[i].U_IssuedOn + " | " +
                    //  "Draft" + "\r\n ";
                    // A 'D' Status needs to be added at B1 Side.
                    items[i].U_Status = "D";
                    itemsWithoutAttachment.push(items[i]);
                }
                if ((items[i].U_Status === null || items[i].U_Status === "D") && items[i].U_AttachByteStreamGA) {
                    newItems.push(items[i]);
                    forEmail += formatter.getDateDDMMYYYYFormat2(items[i].U_ValidFrom) + " | " + formatter.getDateDDMMYYYYFormat2(items[i].U_ValidTo) +
                        " | " + formatter.getDateDDMMYYYYFormat2(items[i].U_IssuedOn) +
                        " | " +
                        "Submited" + " | " + items[i].U_Type + "\r\n ";
                }
                if (items[i].U_AttachByteStreamGA) {
                    checkReqDoc.add(items[i].U_Type);
                }
            }
            if (checkReqDoc.size >= that.requiredDocument.size) {
                infoMessage = that.resourceBundle.getText("MasterDataSave");
            } else if (checkReqDoc.size > 0 && checkReqDoc.size < that.requiredDocument.size) {
                infoMessage = "Master data saved. ONLY partial attachments were provided."; //that.resourceBundle.getText("ItemsSave");
            } else {
                infoMessage = "Master data saved. No mandatory attachments were provided"; //that.resourceBundle.getText("MandatoryDocumentMessage");
            }
            if (itemsWithoutAttachment.length > 0 || newItems.length > 0) {
                if (newItems.length > 0) {
                    // that.getView().setBusy(true);
                    var temp = function (newItems2, index) {
                        var content = (firstLine + secondLine.replace("$$fileName$$", (newItems2[index].Code + "_" + cPayload.Name + "_" +
                            newItems2[index]
                                .U_Type + "_" + formatter.uuidv4())) + thirdLine + newItems2[index].U_AttachByteStreamGA +
                            "\r\n" + lastLine);
                        $.ajax("/api/resource/Attachments2", {
                            type: 'POST', // http method
                            contentType: "multipart/form-data; boundary=AttachmentBoundary",
                            data: content, // data to submit
                            success: function (data, status, xhr) {
                                var regex = /data:(\w.*);base64,/gm;
                                var m = regex.exec(newItems2[index].U_AttachByteStreamGA);
                                newItems2[index].U_Status = "S";
                                newItems2[index].U_FileExtension = fileExtentionFromMimeType[m[1]];
                                newItems2[index].U_AttachByteStreamGA = data.value.AbsoluteEntry;
                                if (++index < newItems.length) {
                                    temp(newItems2, index);
                                } else {
                                    that.saveAttachmentData(newItems2.concat(itemsWithoutAttachment), vendorId, infoMessage, that);
                                    that.sendEmail(forEmail);
                                }
                            },
                            error: function (jqXhr, textStatus, errorMessage) {
                                if (++index < newItems.length) {
                                    temp(newItems2, index);
                                } else {
                                    that.saveAttachmentData(newItems2.concat(itemsWithoutAttachment), vendorId, infoMessage, that);
                                }
                            }
                        });
                    };
                    if (newItems.length > 0) {
                        temp(newItems, 0);
                    }
                } else if (itemsWithoutAttachment.length > 0) {
                    that.saveAttachmentData(itemsWithoutAttachment, vendorId, infoMessage, that);
                }
            } else {
                MessageToast.show(this.resourceBundle.getText("MasterDataUpdate"));
    	    }
        },

		onUploadDataPress: function () {
			debugger;
			if(isPono ==  true){
				this.onUploadPoNo();
			}
			else{
				this.onUploadArtWork();
			}
			// var oModel = this.getView().getModel(); ///default model get at here
			// var that = this;
			// var ids = this.oArgs
			// var poFile = this.getView().getModel('appView').getProperty("/pdfUrl");
			// var artworkAttachment = this.getView().getModel('appView').getProperty("/pdfArtwork")
			// if (!poFile) {
			// 	var poFileimg = this.getView().getModel('appView').getProperty("/imageContent");
			// 	var artworkAttachmentimg = this.getView().getModel('appView').getProperty("/imageContentArtwork");

			// 	var oUpdatedData = {
			// 		poAttachment: poFileimg,
			// 		artworkAttachment: artworkAttachmentimg
			// 		// artworkAttachment:artworkFile
			// 	};
			// }
			// if (!artworkAttachment) {
			// 	var artworkAttachmentimg = this.getView().getModel('appView').getProperty("/imageContentArtwork");
			// 	var poFileimg = this.getView().getModel('appView').getProperty("/imageContent");
			// 	var oUpdatedData = {
			// 		poAttachment: poFileimg,
			// 		artworkAttachment: artworkAttachmentimg
			// 		// artworkAttachment:artworkFile
			// 	};
			// }
			// if (poFile || artworkAttachment) {
			// 	var oUpdatedData = {
			// 		poAttachment: poFile,
			// 		artworkAttachment: artworkAttachment
			// 		// artworkAttachment:artworkFile
			// 	};
			// }
			// // Perform the read operation
			// oModel.update(`/Jobs('${ids}')`, oUpdatedData, {
			// 	success: function (data) {
			// 		debugger;
			// 		MessageToast.show("Successfully Uploaded")
			// 	},
			// 	error: function (error) {
			// 		// Error callback
			// 		// that.middleWare.errorHandler(error, that);
			// 		MessageToast.show("Error reading data");
			// 	}
			// });
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
		
		// * this function will read the data of the "PO Attachment's".
		// onReadData: function () {
		// 	debugger;
		// 	var oModel = this.getView().getModel();  //default model get at here
		// 	var that = this;
		// 	var ids = this.oArgs;
		// 	// var pdfArtwork
		// 	oModel.read(`/Jobs('${ids}')`, {
		// 		success: function (data) {
		// 			debugger;
		// 			console.log(data)
		// 			var isImg = data.poAttachment.startsWith("data:image/jpeg;base64,");

		// 			if (isImg) {
		// 				that.getView().getModel("appView").setProperty("/imageBase", data.poAttachment)

		// 			}
		// 			else {
		// 				that.getView().getModel("appView").setProperty("/pdfArtwork", data.poAttachment)
		// 			}

		// 			// that.getView().getModel("appView").setProperty("/pdfUrlartwork", data.artworkAttachment)
		// 			// MessageToast.show("Read Successfully")
		// 		},
		// 		error: function (error) {
		// 			// Error callback
		// 			// that.middleWare.errorHandler(error, that);
		// 			MessageToast.show("Error reading data");
		// 		}
		// 	});

		// },
		
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



		// * this fucntion will use to browse the files in the dialog.
		onFileUploaddChangeArtwork: function (oEvent) {
			debugger;
			var that = this;
			var oFileUploader = oEvent.getSource();
			var oFile = oEvent.getParameter("files");
			debugger;
			var oReader = new FileReader();
			oReader.onload = function (e) {
						var sUploadedFileContent = e.target.result;
						var sEncodedContent = (sUploadedFileContent);
						// var sPdfContent = "data:application/pdf;base64," + sEncodedContent;
						// that.getView().getModel('appView').setProperty('/pdf', sPdfContent);
						// that.getView().getModel("appView").setProperty("/pdfArtwork", sEncodedContent)
						that.getModel("appView").setProperty("/simpleFormVisibility", false);
						that.getModel("appView").setProperty("/pdfVisibility", false);
						that.getModel("appView").setProperty("/uploadButtonVisibility", true);
						that.getModel("appView").setProperty("/imgVisibility", false);
					};
					oReader.readAsDataURL(oFile);
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