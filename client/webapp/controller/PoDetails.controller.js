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

	return BaseController.extend("ent.ui.ecommerce.controller.PoDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("PoDetails").attachPatternMatched(this._matchedHandler, this);													
		},

		_matchedHandler: function (oEvent) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/layout", "OneColumn");
			this.getModel('appView').setProperty('/UserRole', "Admin");		//As by user role as admin all sidenavigation - navigation list items will visible.
			this.getModel("appView").updateBindings();
			var that = this;
			this.getUserRoleData();
			this.onGetAllPo();
			this.getView().getModel('appView').setProperty('/UsedSheetsFields', []);
		},

		onAddUsedSheetFields: function() {
			var usedSheetsFields = this.getView().getModel('appView').getProperty('/UsedSheetsFields');

			if (usedSheetsFields.length === 0) {
				usedSheetsFields.push({});
			} else {
				var lastItem = usedSheetsFields[usedSheetsFields.length - 1];
				var hasData =
					(lastItem.QualityOfSheets && lastItem.QualityOfSheets.trim() !== "") ||
					(lastItem.JobCardNo && lastItem.JobCardNo.trim() !== "");

				if (hasData) {
					usedSheetsFields.push({});
				} else {
					MessageToast.show("Please fill data before adding a new row.");
				}
			}
			// usedSheetsFields.push({});
			this.getView().getModel('appView').setProperty('/UsedSheetsFields', usedSheetsFields);
			this.getView().getModel('appView').updateBindings();
			this.getView().getModel('appView').refresh(true);
		},

		onDeleteUsedSheetFields: function(oEvent) {
			var usedSheetsFields = this.getView().getModel('appView').getProperty('/UsedSheetsFields');
			var path = oEvent.getParameter("listItem").getBindingContext("appView").getPath();
			var index = parseInt(path.split("/").pop());
			usedSheetsFields.splice(index, 1);
			this.getView().getModel('appView').setProperty('/UsedSheetsFields', usedSheetsFields);
			this.getView().getModel('appView').updateBindings();
			this.getView().getModel('appView').refresh(true);
		},

		onGetAllPo: function() {
			var that = this;
			this.middleWare.callMiddleWare("getPoDetails", "GET")
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/poDetails", data);
					that.getModel("appView").setProperty("/poDetailsCount", data.length);
					that.getModel("appView").updateBindings();
				}
				)
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});

			// oModel.read('/PoTables', {
			// 	success: function (data) {
			// 		that.getModel("appView").setProperty("/poDetails", data.results);
			// 		that.getModel("appView").setProperty("/poDetailsCount", data.results.length);
			// 		that.getModel("appView").updateBindings();
			// 	},
			// 	error: function (error) {
			// 		that.middleWare.errorHandler(error, that);
			// 	}
			// });
		},

		onAddPO: function() {
			var that = this;
			this.oDialogOpen().then(function (oDialog) {
				oDialog.open();
			});
		},

		onSubmitData: function() {
			var oModel = this.getView().getModel();
			var that = this;

			var inpPoNo = this.getView().byId("inpPoNo").getValue();
			var inpSupplierName = this.getView().byId("inpSupplierName").getValue();
			var inpMill = this.getView().byId("inpMill").getValue();
			var inpQualityOfMaterial = this.getView().byId("inpQualityOfMaterial").getValue();
			var inpTypeOfBoard = this.getView().byId("inpTypeOfBoard").getValue();
			var inpRate = this.getView().byId("inpRate").getValue();
			var inpGSM = this.getView().byId("inpGSM").getValue();
			var inpHeightInMm = this.getView().byId("inpHeightInMm").getValue();
			var inpWidthInMm = this.getView().byId("inpWidthInMm").getValue();
			var inpOpeningStock = this.getView().byId("inpOpeningStock").getValue();



			var payload = {
				"PoNo" : inpPoNo,
				"SupplierName" : inpSupplierName,
				"Mill": inpMill,
				"QualityOfMaterial" : inpQualityOfMaterial,
				"TypeOfBoard" : inpTypeOfBoard,
				"Rate": inpRate ? parseFloat(inpRate) : 0,
				"GSM": inpGSM ? parseFloat(inpGSM) : 0,
				"Height": inpHeightInMm ? parseFloat(inpHeightInMm) : 0,
				"Width": inpWidthInMm ? parseFloat(inpWidthInMm) : 0,
				"OpeningStock": inpOpeningStock ? parseFloat(inpOpeningStock) : 0,
				"Status": "Pending",
			}

			oModel.create('/PoTable', payload, {
              success: function (data) {
				that.onGetAllPo();
				that.onClose();
				MessageToast.show("PO Added Successfully");
              },
              error: function (error) {
                that.middleWare.errorHandler(error, that);
              }
            });
		},

		clearFields: function() {
			this.getView().byId("inpPoNo").setValue("");
			this.getView().byId("inpSupplierName").setValue("");
			this.getView().byId("inpMill").setValue("");
			this.getView().byId("inpQualityOfMaterial").setValue("");
			this.getView().byId("inpTypeOfBoard").setValue("");
			this.getView().byId("inpRate").setValue("");
			this.getView().byId("inpGSM").setValue("");
			this.getView().byId("inpHeightInMm").setValue("");
			this.getView().byId("inpWidthInMm").setValue("");
			this.getView().byId("inpOpeningStock").setValue("");
		},

		oDialogOpen: function () {
			var oView = this.getView();
			var that = this;
			if (!this.oPoDialog) {
				this.oPoDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.AddPo",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));

			}
			return this.oPoDialog;
		},

		onClose: function () {
			var that = this;
			this.oDialogOpen().then(function (oDialog) {
				oDialog.close();
				that.clearFields();
			})
		},
		

		onRowPress: function(oEvent){
			var that = this;
			var oParameter = oEvent.getParameter('listItem');
			var sData = oParameter.getBindingContext('appView').getObject();
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/selectedPoNo", sData.PoNo);
			oModel.setProperty("/selectedPoDetails", sData.UsedSheets);
			oModel.updateBindings();
			this.oUsedSheetsOpen().then(function (oDialog) {
				oDialog.open();
			});
		},	

		oUsedSheetsOpen: function () {
			var oView = this.getView();
			var that = this;
			if (!this.oUsedSheetsDialog) {
				this.oUsedSheetsDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.UsedSheets",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));

			}
			return this.oUsedSheetsDialog;
		},

		onUsedSheetsClose: function () {
			var that = this;
			this.oUsedSheetsOpen().then(function (oDialog) {
				oDialog.close();
				// that.getView().byId("inpQuantityOfSheets").setValue("");
				that.getView().getModel('appView').setProperty('/UsedSheetsFields', []);
			})
		},

		onSubmitUsedSheetsData: function() {
			var that = this;
			// var usedSheetsValue = this.getView().byId("inpQuantityOfSheets").getValue();
			// var inpJobCardNo = this.getView().byId("inpJobCardNo").getValue();
			var usedSheetsFields = this.getView().getModel('appView').getProperty('/UsedSheetsFields');

			if(usedSheetsFields.length === 0){
				MessageBox.error("Please add at least one Used Sheets entry.");
				return;
			}
			var PoNo = this.getModel("appView").getProperty("/selectedPoNo");
			// var payload = {
			// 	"PoNo" : PoNo,
			// 	"QuantityOfSheets" : -usedSheetsFields[0].QuantityOfSheets,
			// 	"JobCardNo": usedSheetsFields[0].JobCardNo ? usedSheetsFields[0].JobCardNo : ""
			// }

			 var payload = usedSheetsFields.map(function(item) {
				return {
					PoNo: PoNo,
					QuantityOfSheets: -Math.abs(item.QuantityOfSheets || 0),  // keep negative
					JobCardNo: item.JobCardNo ? item.JobCardNo : ""
				};
			});


			this.middleWare.callMiddleWare("onSaveUsedSheets", "POST", payload)
				.then( (data, status, xhr)=> {
					MessageToast.show("Used Sheets Updated Successfully");
					that.onGetAllPo();
					that.getView().getModel('appView').setProperty('/UsedSheetsFields', []);
					that.getView().getModel('appView').updateBindings();				
					that.getView().getModel('appView').refresh(true);
					that.onUsedSheetsClose();
					
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
			// oModel.create('/UsedSheets', payload, {
            //   success: function (data) {
			// 	MessageToast.show("Used Sheets Updated Successfully");
			// 	that.onGetAllPo();
			// 	that.getView().getModel('appView').setProperty('/UsedSheetsFields', []);
			// 	that.getView().getModel('appView').updateBindings();				
			// 	that.getView().getModel('appView').refresh(true);
			// 	that.onUsedSheetsClose();
            //   },
            //   error: function (error) {
            //     that.middleWare.errorHandler(error, that);
            //   }
            // });
		},

		onDeleteUsedSheet: function(oEvent){
			var that = this;
			var oModel = this.getView().getModel();
			var selectedPoDetails = this.getModel('appView').getProperty('/selectedPoDetails');
			var selectedUsedSheet = oEvent.getParameter("listItem").getBindingContext('appView').getObject();
			MessageBox.confirm("Are you sure you want to delete?", {
				actions: ["OK", "Close"],
				emphasizedAction: 'OK',
				onClose: function (sAction) {
					if (sAction === "OK") {
						oModel.remove(`/UsedSheets('${selectedUsedSheet.id}')`, {
							success: function() {
								MessageToast.show("UsedSheet entry deleted successfully");
								that.onGetAllPo();
								oModel.refresh();
								// This will remove the deleted entry from the properties array
								for (var i = 0; i < selectedPoDetails.length; i++) {
									if (selectedPoDetails[i].id === selectedUsedSheet.id) {
										selectedPoDetails.splice(i, 1);
										that.getView().getModel('appView').updateBindings(true);
										break;
									}
								}
							},
							error: function(error) {
								that.middleWare.errorHandler(error, that);
							}
						});
					}
				}
			});
			
		},

		onSelectPoStatus: function(oEvent) {
			var sSelectedKey = oEvent.getSource().getSelectedKey();
			var oContext = oEvent.getSource().getBindingContext("appView");
			var oRowData = oContext.getObject();

			var payload = {
				PoNo : oRowData.PoNo,
				Status : sSelectedKey
			}

			this.middleWare.callMiddleWare("onUpdatePoStatus", "POST", payload)
				.then( (data, status, xhr)=> {
					MessageToast.show("Status Updated Successfully")	
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
			
		},

		onSearchPoDetails: function(oEvent) {
			var sValue = oEvent.getParameter("query");
			if(!sValue){
				var sValue = oEvent.getParameter("newValue");
			}
			var oFilter1 = new Filter("PoNo", FilterOperator.Contains, sValue);
			var oFilter2 = new Filter("SupplierName", FilterOperator.Contains, sValue);
			var oFilter3 = new Filter("Mill", FilterOperator.Contains, sValue);
			var oFilter4 = new Filter("QualityOfMaterial", FilterOperator.Contains, sValue);
			var oFilter5 = new Filter("TypeOfBoard", FilterOperator.Contains, sValue);
			var oFilter6 = new Filter("OpeningStock", FilterOperator.EQ, Number(sValue));


			var oCombinedFilter = new Filter({
				filters: [oFilter1, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6],
				and: false
			});
			var oTable = this.getView().byId("tablePoDetails");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(oCombinedFilter);

		},

		onGeneratePDF: async function (oEvent) {
			var that = this;
			var oItem = this.getView().byId("tablePoDetails").getSelectedItem();
			if (!oItem) {
				sap.m.MessageToast.show("Please select a Purchase Order first.");
				return;
			}

			var oPoDetails = oItem.getBindingContext("appView").getObject();

			// --- Create PDF Document ---
			var doc = new PDFDocument({ margin: 40 });
			var stream = doc.pipe(blobStream());

			//  Fetch image and convert to Base64
			var sLogoPath = jQuery.sap.getModulePath("ent.ui.ecommerce") + "/img/Po_header.png";
			const response = await fetch(sLogoPath);
			const blob = await response.blob();

			// Calculations
			const HeightInInches = +((oPoDetails.Height / 25.4).toFixed(2));
			const WidthInInches = +((oPoDetails.Width / 25.4).toFixed(2));
			const OpeningWeight = +(((oPoDetails.Height / 1000) * (oPoDetails.Width / 1000) * (oPoDetails.GSM / 1000) * oPoDetails.OpeningStock).toFixed(2));
			const ClosingStock = (oPoDetails.OpeningStock + (oPoDetails.UsedSheets ? oPoDetails.UsedSheets.reduce((acc, curr) => acc + Math.abs(curr.QuantityOfSheets), 0) : 0));
			const ClosingWeight = +(((oPoDetails.Height / 1000) * (oPoDetails.Width / 1000) * (oPoDetails.GSM / 1000) * ClosingStock).toFixed(2));
			const FinalPrice = +((oPoDetails.Rate * ClosingWeight).toFixed(2));

			const reader = new FileReader();

			reader.onloadend = () => {
				const base64Logo = reader.result; // Base64 image

				// --- HEADER ---
				doc.image(base64Logo, 50, 40, { width: 500, align: "center" }); 

				const LEFT_MARGIN = 20; 
				const RIGHT_MARGIN = 600;
				doc.moveDown(0.3);
				doc.moveTo(LEFT_MARGIN, 140)   // line start point
					.lineTo(RIGHT_MARGIN, 140)   // line end point
					.stroke();        // draw the line
				doc.fontSize(14).text("Purchase Order", { align: "center" });
				doc.moveTo(LEFT_MARGIN, 165)   
				.lineTo(RIGHT_MARGIN, 165)   
				.stroke();        

				doc.moveDown(0.6);
				// --- IMPORTANT NOTE ---
				doc.fillColor("red").fontSize(11).text("Kindly mention Purchase Order No. in your Invoice or else the Invoice will not be accepted.", { align: "center", underline: true });
				
				
				// --- ORDER DETAILS ---
				const currentDate = new Date();
				const formattedDate = currentDate.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
				const orderDetailsTop = 200;
				// Header for Order details table
				doc.moveTo(LEFT_MARGIN, orderDetailsTop - 5).lineTo(RIGHT_MARGIN, orderDetailsTop - 5).stroke();

				doc.fillColor("black").fontSize(11).text(`Purchase Order No: ${oPoDetails.PoNo}`, 40, orderDetailsTop)
				doc.fontSize(11).text(`Date: ${formattedDate}`, 240, orderDetailsTop)
				doc.fontSize(11).text(`Delivery Date:`, 400, orderDetailsTop)

				// vertical lines
				doc.moveTo(230, orderDetailsTop - 5).lineTo(230, orderDetailsTop + 50).stroke();
				doc.moveTo(390, orderDetailsTop - 5).lineTo(390, orderDetailsTop + 50).stroke();

				// Order details
				doc.moveTo(LEFT_MARGIN, orderDetailsTop + 12).lineTo(RIGHT_MARGIN, orderDetailsTop + 12).stroke();
				doc.fontSize(11).text("To,", 40, orderDetailsTop + 17).text(`${oPoDetails.SupplierName}`, 40, orderDetailsTop + 32);
				doc.fontSize(11).text(`Ship To,`, 240, orderDetailsTop + 17)
				doc.fontSize(11).text(`Bill To,`, 400, orderDetailsTop + 17).text(`AEON Products`, 400, orderDetailsTop + 32)
				doc.moveDown(2);

				doc.moveTo(LEFT_MARGIN, orderDetailsTop + 50).lineTo(RIGHT_MARGIN, orderDetailsTop + 50).stroke();

				

				// --- TABLE HEADER ---
				const tableTop = 300;
				doc.moveTo(LEFT_MARGIN, tableTop).lineTo(RIGHT_MARGIN, tableTop).stroke();
				doc.fontSize(14).text("Item Description", 255 , tableTop + 5);
				doc.font("Helvetica-Bold");
				doc.moveTo(LEFT_MARGIN, tableTop + 20).lineTo(RIGHT_MARGIN, tableTop + 20).stroke();
				doc.fontSize(12).text("Sr.No", 30, tableTop + 25);
				doc.text("Mill", 85, tableTop + 25);
				doc.text("Quality", 145, tableTop + 25);
				doc.text("GSM", 220, tableTop + 25);
				doc.text("Size", 290, tableTop + 25);
				doc.text("Weight/Sheets", 360, tableTop + 25);
				doc.text("Rate", 460, tableTop + 25);
				doc.text("Total", 540, tableTop + 25);
				doc.font("Helvetica");

				
				// vertical lines
				doc.moveTo(65, tableTop + 20).lineTo(65, tableTop + 120).stroke();
				doc.moveTo(130, tableTop + 20).lineTo(130, tableTop + 120).stroke();
				doc.moveTo(200, tableTop + 20).lineTo(200, tableTop + 120).stroke();
				doc.moveTo(270, tableTop + 20).lineTo(270, tableTop + 120).stroke();
				doc.moveTo(350, tableTop + 20).lineTo(350, tableTop + 120).stroke();
				doc.moveTo(450, tableTop + 20).lineTo(450, tableTop + 120).stroke();
				doc.moveTo(515, tableTop + 20).lineTo(515, tableTop + 120).stroke();

				// const currecySymbol = '₹';
				// const currecySymbol = '\u20B9'; 
				const currecySymbol = 'Rs.'; 

				// --- TABLE ROW (Example) ---
				doc.moveTo(LEFT_MARGIN, tableTop + 40).lineTo(RIGHT_MARGIN, tableTop + 40).stroke();
				doc.fontSize(11).text("1", 40, tableTop + 45);
				doc.text(oPoDetails.Mill, 70, tableTop + 45);
				doc.text(oPoDetails.QualityOfMaterial, 140, tableTop + 45);
				doc.text(`${oPoDetails.GSM} GSM`, 210, tableTop + 45);
				doc.text(`${oPoDetails.Height}x${oPoDetails.Width} mm`, 280, tableTop + 45).text(`${HeightInInches}x${WidthInInches} '`, 280, tableTop + 60);
				doc.text(`${OpeningWeight} KG`, 370, tableTop + 45).text(`${oPoDetails.OpeningStock} Sheets`, 370, tableTop + 60);
				doc.text(`${currecySymbol} ${oPoDetails.Rate}`, 455, tableTop + 45);
				const price = +((oPoDetails.Rate * OpeningWeight).toFixed(2));
				doc.text(`${currecySymbol} ${price}`, 520, tableTop + 45);
				doc.moveTo(LEFT_MARGIN, tableTop + 120).lineTo(RIGHT_MARGIN, tableTop + 120).stroke();

				doc.moveDown(1);

				doc.text('Transport: ', 30, tableTop + 130).text('Payment Terms: ', 30 , tableTop + 145);
				doc.text('Door Delivery', 140, tableTop + 130).text('60 Days', 140 , tableTop + 145);

				// calculations
				const discount = 0.00;
				const transportation = 0.00;
				const SGST = 6;
				const CGST = 6;
				const SGSTAmount = (price + transportation) * SGST / 100;
				const CGSTAmount = price * CGST / 100;
				const grandTotal = (price + discount + transportation + SGSTAmount + CGSTAmount) * 1;

				doc.text('Total: ', 400, tableTop + 130).text(`${currecySymbol} ${price}`, 500, tableTop + 130);
				doc.text('Discount: ', 400, tableTop + 145).text(`${currecySymbol} ${discount.toFixed(2)}`, 500, tableTop + 145);
				doc.text('Transportation: ', 400, tableTop + 160).text(`${currecySymbol} ${transportation.toFixed(2)}`, 500, tableTop + 160);
				doc.text(`SGST ${SGST}%: `, 400, tableTop + 175).text(`${currecySymbol} ${SGSTAmount.toFixed(2)}`, 500, tableTop + 175);
				doc.text(`CGST ${CGST}%: `, 400, tableTop + 190).text(`${currecySymbol} ${CGSTAmount.toFixed(2)}`, 500, tableTop + 190);
				doc.text('Grand Total: ', 400, tableTop + 205).text(`${currecySymbol} ${grandTotal.toFixed(2)}`, 500, tableTop + 205);

				doc.moveTo(LEFT_MARGIN, tableTop + 220).lineTo(RIGHT_MARGIN, tableTop + 220).stroke();


				doc.moveTo(LEFT_MARGIN, tableTop + 235).lineTo(RIGHT_MARGIN, tableTop + 235).stroke();
				doc.text('Remarks: ', 30, tableTop + 240);
				doc.text('For AEON Products', 460, tableTop + 240);
				doc.text('Authorised Signatory', 460, tableTop + 300);
				doc.moveTo(LEFT_MARGIN, tableTop + 315).lineTo(RIGHT_MARGIN, tableTop + 315).stroke();

				// vertical line
				doc.moveTo(300, tableTop + 235).lineTo(300, tableTop + 315).stroke();

				// --- FOOTER ---
				doc.moveDown(4);
				doc.text("Prepared By: ___________________", 50, 700);
				doc.text("Checked By: ___________________", 350, 700);

				// --- END & DOWNLOAD ---
				// doc.end();
				// stream.on("finish", function () {
				// const blob = stream.toBlob("application/pdf");
				// const url = stream.toBlobURL("application/pdf");
				// const a = document.createElement("a");
				// a.href = url;
				// a.download = `PO_${oPoDetails.PoNo}.pdf`;
				// a.click();

				doc.end();
				stream.on("finish", async () => {
				const blobPDF = stream.toBlob();
				const reader2 = new FileReader();
				reader2.onloadend = async () => {
					const base64PDF = reader2.result; 

					this.getView().getModel("appView").setProperty("/GeneratedPDF", base64PDF);
					this.getView().getModel("appView").setProperty("/PDFPoNo", oPoDetails.PoNo);

					if (!this._pPDFViewerDialog) {
						this._pPDFViewerDialog = Fragment.load({
							id: this.getView().getId(),
							name: "ent.ui.ecommerce.fragments.PoDetailPDFViewer",
							controller: this
						}).then(function (oDialog) {
							this.getView().addDependent(oDialog);
							oDialog.open();
							return oDialog;
						}.bind(this));
					} else {
						(await this._pPDFViewerDialog).open();
					}
				};
				reader2.readAsDataURL(blobPDF);
			});

				this.getView().byId("tablePoDetails").removeSelections();
			};

			reader.readAsDataURL(blob); 
		},

		onDownloadReceipt: function () {
			const base64PDF = this.getView().getModel("appView").getProperty("/GeneratedPDF");
			const PoNo = this.getView().getModel("appView").getProperty("/PDFPoNo");

			if (!base64PDF) {
				MessageToast.show("No PDF available to download.");
				return;
			}

			// Convert Base64 to Blob for download
			const link = document.createElement("a");
			link.href = base64PDF;
			link.download = `PO_${PoNo}.pdf`;
			link.click();
		},


		onClosePoPDF: async function () {
			if (this._pPDFViewerDialog) {
				const oDialog = await this._pPDFViewerDialog;
				oDialog.close();
			}
			this.getView().getModel("appView").setProperty("/GeneratedPDF", null);
			this.getView().getModel("appView").setProperty("/PDFPoNo", null);
			this.getView().byId("tablePoDetails").removeSelections();
		},

		onSendEmail: async function () {
			var oView = this.getView();
			this.getView().getModel("appView").setProperty("/Email", {})

			if (!this.oSendEmailDialog) {
				this.oSendEmailDialog = Fragment.load({
					name: "ent.ui.ecommerce.fragments.Email", 
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();
					MessageToast.show("Po_Reciept is attached with Email")
					return oDialog;
				}.bind(this));
			}else {
				this.oSendEmailDialog.then(function (oDialog) {
					oDialog.open();
				});
			}
		},

		handleCloseMail: function () {
			this.oSendEmailDialog.then(function (oDialog) {
				oDialog.close();
			});
		},

		handleSendMail: function () {
			var that = this;			
			var payload = this.getView().getModel("appView").getProperty("/Email");
			payload.GENERATED_PDF = this.getView().getModel("appView").getProperty("/GeneratedPDF");
			var PDF_PONo = this.getView().getModel("appView").getProperty("/PDFPoNo");
			payload.PDF_PONo = PDF_PONo

			if (!payload.EMAIL_TO || !payload.EMAIL_SUBJECT || !payload.EMAIL_BODY) {
				MessageToast.show("Please fill all required fields");
				return;
			}
			var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(payload.EMAIL_TO)) {
				MessageToast.show("Please enter a valid email address");
				return;
			}

			let ccEmails = [];
			if (payload.EMAIL_CC) {
				ccEmails = payload.EMAIL_CC.split(",").map(e => e.trim());
				for (let email of ccEmails) {
					if (!emailRegex.test(email)) {
						MessageToast.show("Please enter a valid CC email address");
						return;
					}
				}
			}

			let bccEmails = [];
			if (payload.EMAIL_BCC) {
				bccEmails = payload.EMAIL_BCC.split(",").map(e => e.trim());
				for (let email of bccEmails) {
					if (!emailRegex.test(email)) {
						MessageToast.show("Please enter a valid BCC email address");
						return;
					}
				}
			}


			payload.EMAIL_CC = ccEmails;
    		payload.EMAIL_BCC = bccEmails;
			
			this.middleWare.callMiddleWare("onSendPoEmail", "POST", payload)
				.then( (data, status, xhr)=> {
					MessageToast.show(`Email Sent Successfully`);		
					that.handleCloseMail();			

					var statusPayload = {
						PoNo : PDF_PONo,
						Status : "Sent"
					}

					this.middleWare.callMiddleWare("onUpdatePoStatus", "POST", statusPayload)
						.then( (data, status, xhr)=> {
							// MessageToast.show("Status Updated Successfully")	
						})
						.catch(function (jqXhr, textStatus, errorMessage) {
							that.middleWare.errorHandler(jqXhr, that);
						});
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
		}


	});
});