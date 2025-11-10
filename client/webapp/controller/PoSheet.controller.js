sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Dialog"

], function (BaseController, MessageToast, JSONModel, Fragment, BusyIndicator, MessageBox, Filter, FilterOperator, Dialog) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.PoSheet", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("PoSheet").attachPatternMatched(this._matchedHandler, this);													
		},

		_matchedHandler: function (oEvent) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/layout", "OneColumn");
			this.getModel('appView').setProperty('/UserRole', "Admin");		//As by user role as admin all sidenavigation - navigation list items will visible.
			this.getModel("appView").updateBindings();
			var that = this;
			this.getUserRoleData();
			this.onGetAllPo();
			this.loadDropdownOptions()
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
			this.middleWare.callMiddleWare("getPoSheet", "GET")
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/PoSheet", data);
					that.getModel("appView").setProperty("/PoSheetCount", data.length);
					that.calculateTotals(data)
					that.getModel("appView").updateBindings();
				}
				)
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});

			// oModel.read('/PoTables', {
			// 	success: function (data) {
			// 		that.getModel("appView").setProperty("/PoSheet", data.results);
			// 		that.getModel("appView").setProperty("/PoSheetCount", data.results.length);
			// 		that.getModel("appView").updateBindings();
			// 	},
			// 	error: function (error) {
			// 		that.middleWare.errorHandler(error, that);
			// 	}
			// });
		},

		calculateTotals: function(data) {

			const oModel = this.getView().getModel("appView");
			let totals = {
				openingWeight: 0,
				openingStock: 0,
				closingStock: 0,
				finalPrice: 0,
				closingWeight: 0
			};

			for (let i = 0; i < data.length; i++){
				let currentItem = data[i]
				let UsedSheets = currentItem.UsedSheets || []

				let OpeningWeight = +((currentItem.Height/1000) * (currentItem.Width/1000) * (currentItem.GSM/1000) * currentItem.OpeningStock).toFixed(2); 
				let OpeningStock = currentItem.OpeningStock;
				let ClosingStock = OpeningStock + UsedSheets?.map(item => item.QuantityOfSheets).reduce((prev, curr) => prev + curr, 0)
				let ClosingWeight = +((currentItem.Height/1000) * (currentItem.Width/1000) * (currentItem.GSM/1000) * ClosingStock).toFixed(2);
				let FinalPrice = +(currentItem.Rate * ClosingWeight).toFixed(2)

				totals.openingWeight = (((totals.openingWeight + OpeningWeight) * 1).toFixed(2)) * 1;
				totals.openingStock = (((totals.openingStock + OpeningStock) * 1).toFixed(2)) * 1;
				totals.closingStock = (((totals.closingStock + ClosingStock) * 1).toFixed(2)) * 1;
				totals.finalPrice = (((totals.finalPrice + FinalPrice) * 1).toFixed(2)) * 1;
				totals.closingWeight = (((totals.closingWeight + ClosingWeight) * 1).toFixed(2)) * 1;
			}

			oModel.setProperty("/totals", totals);
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
			var userId = this.getModel('appView').getProperty('/UserId');

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

			if(!inpPoNo){
				MessageBox.show("Please fill PO No. field");
				return;
			}
			else if(!inpRate){
				MessageBox.show("Please fill Rate fields");
				return;
			} else if (!inpGSM){
				MessageBox.show('Please fill GSM field')
				return;
			} else if (!inpHeightInMm){
				MessageBox.show('Please fill Height field')
				return;
			} else if (!inpWidthInMm){
				MessageBox.show('Please fill Width field')
				return;
			} else if (!inpOpeningStock){
				MessageBox.show('Please fill Opening Stock field')
				return;
			}

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
				"CreatedBy": userId
			};

			this.middleWare.callMiddleWare("savePoSheet", "POST", payload)
				.then(function (data, status, xhr) {
					that.onGetAllPo();
					that.onClose();
					MessageToast.show("PO Added Successfully");
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					// Check status properly
					if(jqXhr.status === 500 || jqXhr.responseJSON?.error?.statusCode === 500){
						MessageBox.show("PO No. already exists", {
							icon: MessageBox.Icon.ERROR,
							title: "Error",
							actions: [MessageBox.Action.OK],
							onClose: function (oAction) {
								if (oAction === MessageBox.Action.OK) {
									that.onClose();
								}
							}
						});
					} else {
						that.middleWare.errorHandler(jqXhr, that);
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
			this._rowSelectedData = sData;
			oModel.setProperty("/selectedPoNo", sData.PoNo);
			oModel.setProperty("/selectedPoSheet", sData.UsedSheets);
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
			var selectedRowData = this._rowSelectedData;

			if(usedSheetsFields.length === 0){
				MessageBox.error("Please add at least one Used Sheets entry.");
				return;
			}
			var PoNo = this.getModel("appView").getProperty("/selectedPoNo");
			var closingStock = (selectedRowData.OpeningStock + (selectedRowData.UsedSheets ? selectedRowData.UsedSheets.reduce(function(acc, item) {
						var q = Number(item.QuantityOfSheets) || 0;
						return acc + (q < 0 ? q : 0);
						}, 0) : 0));
			var currentUsedSheetsData = usedSheetsFields.reduce((acc, curr) => acc + Math.abs(curr.QuantityOfSheets), 0);
			if(closingStock < currentUsedSheetsData){
				MessageBox.error("Not have enough Sheets for use");
				return;
			}

			// var payload = {
			// 	"PoNo" : PoNo,
			// 	"QuantityOfSheets" : -usedSheetsFields[0].QuantityOfSheets,
			// 	"JobCardNo": usedSheetsFields[0].JobCardNo ? usedSheetsFields[0].JobCardNo : ""
			// }

			 var payload = usedSheetsFields.map(function(item) {
				return {
					PoNo: PoNo,
					QuantityOfSheets: -Math.abs(item.QuantityOfSheets || 0),  // keep negative
					JobCardNo: item.JobCardNo ? item.JobCardNo : "",
					Type: "UsedSheets"
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
			var selectedPoSheet = this.getModel('appView').getProperty('/selectedPoSheet');
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
								for (var i = 0; i < selectedPoSheet.length; i++) {
									if (selectedPoSheet[i].id === selectedUsedSheet.id) {
										selectedPoSheet.splice(i, 1);
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

			if(sSelectedKey === "Received"){
				this.openReceivedSheets()
				this._currentPayload = payload
			} else {
				this.saveStatus(payload)
			}
			
		},

		saveStatus: function(payload){
			this.middleWare.callMiddleWare("onUpdatePoStatus", "POST", payload)
				.then( (data, status, xhr)=> {
					MessageToast.show("Status Updated Successfully")	
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
		},


		openReceivedSheets: function () {
			if(!this.ReceivedSheetsDialog) {
				this.ReceivedSheetsDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Received Sheets", 
					content: new sap.m.Input({
						placeholder: "Enter Received Sheets",
						type: sap.m.InputType.Number,
						id: this.createId("inpReceivedSheets")
					}),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Positive,
						text: "Submit",
						press: () => {
							var sReceivedSheets = this.byId('inpReceivedSheets').getValue()
							var payload = this._currentPayload
							payload.ReceivedSheets = sReceivedSheets ? sReceivedSheets : 0

							this.saveStatus(payload)
							this.onGetAllPo()
							this.ReceivedSheetsDialog.close()
						}
					}),
					endButton: new sap.m.Button({
						type: sap.m.ButtonType.Reject, 
						text: "Cancel",
						press: () => {
							this.ReceivedSheetsDialog.close()
						}
					}),
					styleClass: "appDialog"
				})
			}
			this.ReceivedSheetsDialog.open()
		},

		// onSearchPoSheet: function(oEvent) {
		// 	var sValue = oEvent.getParameter("query");
		// 	if(!sValue){
		// 		var sValue = oEvent.getParameter("newValue");
		// 	}
		// 	var oFilter1 = new Filter("PoNo", FilterOperator.Contains, sValue);
		// 	var oFilter2 = new Filter("SupplierName", FilterOperator.Contains, sValue);
		// 	var oFilter3 = new Filter("Mill", FilterOperator.Contains, sValue);
		// 	var oFilter4 = new Filter("QualityOfMaterial", FilterOperator.Contains, sValue);
		// 	var oFilter5 = new Filter("TypeOfBoard", FilterOperator.Contains, sValue);
		// 	var oFilter6 = new Filter("OpeningStock", FilterOperator.EQ, Number(sValue));
		// 	var oFilter7 = new Filter("GSM", FilterOperator.EQ, Number(sValue));
		// 	var oFilter8 = new Filter("Height", FilterOperator.EQ, Number(sValue));
		// 	var oFilter9 = new Filter("Weight", FilterOperator.EQ, Number(sValue));


		// 	var oCombinedFilter = new Filter({
		// 		filters: [oFilter1, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7, oFilter8, oFilter9],
		// 		and: false
		// 	});
		// 	var oTable = this.getView().byId("tablePoSheet");
		// 	var oBinding = oTable.getBinding("items");
		// 	oBinding.filter(oCombinedFilter);

		// 	var aFilteredContexts = oBinding.getContexts();
		// 	this.getModel("appView").setProperty("/PoSheetCount", aFilteredContexts.length);
		// },

		// filterBySupplierName: function(oEvent){
		// 	let oSelectedSupplerItem = oEvent.getParameter("value")
		// 	if(!oSelectedSupplerItem){
		// 		var oFilter = new Filter("SupplierName", FilterOperator.NEQ, oSelectedSupplerItem);
		// 		var oTable = this.getView().byId("tablePoSheet");
		// 		var oBinding = oTable.getBinding("items");
		// 		oBinding.filter([oFilter]);
		// 	}else{
		// 		var oFilter = new Filter("SupplierName", FilterOperator.EQ, oSelectedSupplerItem);
		// 		var oTable = this.getView().byId("tablePoSheet");
		// 		var oBinding = oTable.getBinding("items");
		// 		oBinding.filter([oFilter]);
		// 	}
		// },

		// filterByMill: function(oEvent){
		// 	let oSelectedMill = oEvent.getParameter("value")
		// 	if(!oSelectedMill){
		// 		var oFilter = new Filter("Mill", FilterOperator.NEQ, oSelectedMill);
		// 		var oTable = this.getView().byId("tablePoSheet");
		// 		var oBinding = oTable.getBinding("items");
		// 		oBinding.filter([oFilter]);
		// 	}else{
		// 		var oFilter = new Filter("Mill", FilterOperator.EQ, oSelectedMill);
		// 		var oTable = this.getView().byId("tablePoSheet");
		// 		var oBinding = oTable.getBinding("items");
		// 		oBinding.filter([oFilter]);
		// 	}
		// },
		
		// filterByQualityOfMaterial: function(oEvent){
		// 	let oSelectedQualityOfMaterial = oEvent.getParameter("value")
		// 	if(!oSelectedQualityOfMaterial){
		// 		var oFilter = new Filter("QualityOfMaterial", FilterOperator.NEQ, oSelectedQualityOfMaterial);
		// 		var oTable = this.getView().byId("tablePoSheet");
		// 		var oBinding = oTable.getBinding("items");
		// 		oBinding.filter([oFilter]);
		// 	}else{
		// 		var oFilter = new Filter("QualityOfMaterial", FilterOperator.EQ, oSelectedQualityOfMaterial);
		// 		var oTable = this.getView().byId("tablePoSheet");
		// 		var oBinding = oTable.getBinding("items");
		// 		oBinding.filter([oFilter]);
		// 	}
		// },
		
		// filterByTypeOfBoard: function(oEvent){
		// 	let oSelectedTypeOfBoard = oEvent.getParameter("value")
		// 	if(!oSelectedTypeOfBoard){
		// 		var oFilter = new Filter("TypeOfBoard", FilterOperator.NEQ, oSelectedTypeOfBoard);
		// 		var oTable = this.getView().byId("tablePoSheet");
		// 		var oBinding = oTable.getBinding("items");
		// 		oBinding.filter([oFilter]);
		// 	}else{
		// 		var oFilter = new Filter("TypeOfBoard", FilterOperator.EQ, oSelectedTypeOfBoard);
		// 		var oTable = this.getView().byId("tablePoSheet");
		// 		var oBinding = oTable.getBinding("items");
		// 		oBinding.filter([oFilter]);
		// 	}
		// },	

		onSearch: function(oEvent) {
			const oFilterBar = oEvent.getSource();
			const oTable = this.getView().byId("tablePoSheet");
			const oBinding = oTable.getBinding("items");
			const oAppViewModel = this.getView().getModel("appView");

			const sSearchValue = this.byId("searchPo").getValue().trim();
			const sGSMValue = this.byId("searchGSM").getValue().trim();
			const sHeightValue = this.byId("searchHeight").getValue().trim();
			const sWidthValue = this.byId("searchWidth").getValue().trim();
			const sSupplier = oFilterBar.determineControlByName("Supplier Name").getValue();
			const sMill = oFilterBar.determineControlByName("Mill").getValue();
			const sQuality = oFilterBar.determineControlByName("Quality Of Material").getValue();
			const sBoard = oFilterBar.determineControlByName("Type Of Board").getValue();

			const aFilters = [];

			// if (sSearchValue) {
			// 	aFilters.push(new Filter({
			// 		filters: [
			// 			new Filter("PoNo", FilterOperator.Contains, sSearchValue),
			// 			new Filter("SupplierName", FilterOperator.Contains, sSearchValue),
			// 			new Filter("Mill", FilterOperator.Contains, sSearchValue),
			// 			new Filter("QualityOfMaterial", FilterOperator.Contains, sSearchValue),
			// 			new Filter("TypeOfBoard", FilterOperator.Contains, sSearchValue),
			// 			new Filter("OpeningStock", FilterOperator.EQ, Number(sSearchValue))
			// 		],
			// 		and: false
			// 	}));
			// }

			if (sSearchValue) {
				aFilters.push(new Filter("PoNo", FilterOperator.EQ, sSearchValue))
			}

			if (sSupplier) {
				aFilters.push(new Filter("SupplierName", FilterOperator.EQ, sSupplier));
			}

			if (sMill) {
				aFilters.push(new Filter("Mill", FilterOperator.EQ, sMill));
			}

			if (sQuality) {
				aFilters.push(new Filter("QualityOfMaterial", FilterOperator.EQ, sQuality));
			}

			if (sBoard) {
				aFilters.push(new Filter("TypeOfBoard", FilterOperator.EQ, sBoard));
			}

			if (sGSMValue) {
				aFilters.push(new Filter("GSM", FilterOperator.EQ, Number(sGSMValue)));
			}

			if (sHeightValue) {
				aFilters.push(new Filter("Height", FilterOperator.EQ, Number(sHeightValue)));
			}

			if (sWidthValue) {
				aFilters.push(new Filter("Width", FilterOperator.EQ, Number(sWidthValue)));
			}

			const oCombinedFilter = new Filter(aFilters, true); 
			oBinding.filter(oCombinedFilter);

			const aFilteredContexts = oBinding.getContexts();
			oAppViewModel.setProperty("/PoSheetCount", aFilteredContexts.length);
		},

		
		onClearFilters: function(oEvent) {
			const oFilterBar = oEvent.getSource();
			const oTable = this.getView().byId("tablePoSheet");
			const oBinding = oTable.getBinding("items");

			const aFilterItems = oFilterBar.getAllFilterItems();
			aFilterItems.forEach(item => {
				const oControl = item.getControl();
				if (oControl instanceof sap.m.ComboBox) {
					oControl.setSelectedKey("");  
				} else if (oControl instanceof sap.m.Input || oControl instanceof sap.m.SearchField) {
					oControl.setValue("");       
				}
			});

			oBinding.filter([]);

			this.getView().getModel("appView").setProperty("/PoSheetCount", oBinding.getContexts().length);
		},

		beforeGeneratePDF: function (oEvent) {
			var oView = this.getView();
			var that = this;
			var oItem = oView.byId("tablePoSheet").getSelectedItem();
			if (!oItem) {
				sap.m.MessageToast.show("Please select a Purchase Order first.");
				return;
			}

			var oPoSheet = oItem.getBindingContext("appView").getObject();

			this._currentPoSheet = oPoSheet;
			
			if (!this.PDFinfoDialog) {
				this.PDFinfoDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.PDFInfo",
					controller: that
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.open();  
					return oDialog;
				}.bind(this));
			} else {
				this.PDFinfoDialog.then(function(oDialog) {
					oDialog.open();
				});
			}
			
			return this.PDFinfoDialog;
		},

		onCloseGeneratePDF: function () {
			var that = this;
			this.PDFinfoDialog.then(function (oDialog) {
				oDialog.close();
				that.getView().byId("tablePoSheet").removeSelections();
			})
		},

		onGeneratePDF: async function (oEvent) {
			var that = this;
			// var oItem = this.getView().byId("tablePoSheet").getSelectedItem();
			// if (!oItem) {
			// 	sap.m.MessageToast.show("Please select a Purchase Order first.");
			// 	return;
			// }

			// var oPoSheet = oItem.getBindingContext("appView").getObject();
			var oPoSheet = this._currentPoSheet;
			oPoSheet.Transport = this.byId('inpTransport').getValue()
			oPoSheet.PaymentTerms = this.byId('inpPaymentTerms').getValue()
			oPoSheet.Discount = this.byId('inpDiscount').getValue()
			oPoSheet.Transportation = this.byId('inpTransportaion').getValue()
			oPoSheet.Remarks = this.byId('inpRemarks').getValue()
			oPoSheet.PreparedBy = this.byId('inpPreparedBy').getValue()
			oPoSheet.CheckedBy = this.byId('inpCheckedBy').getValue()

			// if (!oPoSheet.Transport || !oPoSheet.PaymentTerms || !oPoSheet.Discount || !oPoSheet.Transportation || !oPoSheet.Remarks || !oPoSheet.PreparedBy || !oPoSheet.CheckedBy) {
			// 	sap.m.MessageToast.show("Please fill all the fields");
			// 	return;
			// }

			// --- Create PDF Document ---
			var doc = new PDFDocument({ margin: 40 });
			var stream = doc.pipe(blobStream());

			//  Fetch image and convert to Base64
			var sLogoPath = jQuery.sap.getModulePath("ent.ui.ecommerce") + "/img/Po_header.png";
			const response = await fetch(sLogoPath);
			const blob = await response.blob();

			// Calculations
			const HeightInInches = +((oPoSheet.Height / 25.4).toFixed(2));
			const WidthInInches = +((oPoSheet.Width / 25.4).toFixed(2));
			const OpeningWeight = +(((oPoSheet.Height / 1000) * (oPoSheet.Width / 1000) * (oPoSheet.GSM / 1000) * oPoSheet.OpeningStock).toFixed(2));
			const ClosingStock = (oPoSheet.OpeningStock + (oPoSheet.UsedSheets ? oPoSheet.UsedSheets.reduce(function(acc, item) {
						var q = Number(item.QuantityOfSheets) || 0;
						return acc + (q < 0 ? q : 0);
						}, 0) : 0));
			const ClosingWeight = +(((oPoSheet.Height / 1000) * (oPoSheet.Width / 1000) * (oPoSheet.GSM / 1000) * ClosingStock).toFixed(2));
			const FinalPrice = +((oPoSheet.Rate * ClosingWeight).toFixed(2));

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

				doc.fillColor("black").fontSize(11).text(`Purchase Order No: ${oPoSheet.PoNo}`, 40, orderDetailsTop)
				doc.fontSize(11).text(`Date: ${formattedDate}`, 240, orderDetailsTop)
				doc.fontSize(11).text(`Delivery Date:`, 400, orderDetailsTop)

				// vertical lines
				doc.moveTo(230, orderDetailsTop - 5).lineTo(230, orderDetailsTop + 50).stroke();
				doc.moveTo(390, orderDetailsTop - 5).lineTo(390, orderDetailsTop + 50).stroke();

				// Order details
				doc.moveTo(LEFT_MARGIN, orderDetailsTop + 12).lineTo(RIGHT_MARGIN, orderDetailsTop + 12).stroke();
				doc.fontSize(11).text("To,", 40, orderDetailsTop + 17).text(`${oPoSheet.SupplierName}`, 40, orderDetailsTop + 32);
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
				doc.fontSize(12).text("Sr.No", 20, tableTop + 25);
				doc.text("Mill", 75, tableTop + 25);
				doc.text("Quality", 135, tableTop + 25);
				doc.text("GSM", 210, tableTop + 25);
				doc.text("Size", 290, tableTop + 25);
				doc.text("Weight/Sheets", 360, tableTop + 25);
				doc.text("Rate", 460, tableTop + 25);
				doc.text("Total", 540, tableTop + 25);
				doc.font("Helvetica");

				
				// vertical lines
				doc.moveTo(55, tableTop + 20).lineTo(55, tableTop + 120).stroke();
				doc.moveTo(120, tableTop + 20).lineTo(120, tableTop + 120).stroke();
				doc.moveTo(190, tableTop + 20).lineTo(190, tableTop + 120).stroke();
				doc.moveTo(260, tableTop + 20).lineTo(260, tableTop + 120).stroke();
				doc.moveTo(350, tableTop + 20).lineTo(350, tableTop + 120).stroke();
				doc.moveTo(450, tableTop + 20).lineTo(450, tableTop + 120).stroke();
				doc.moveTo(515, tableTop + 20).lineTo(515, tableTop + 120).stroke();

				// const currecySymbol = '₹';
				// const currecySymbol = '\u20B9'; 
				const currecySymbol = 'Rs.'; 

				// --- TABLE ROW (Example) ---
				doc.moveTo(LEFT_MARGIN, tableTop + 40).lineTo(RIGHT_MARGIN, tableTop + 40).stroke();
				doc.fontSize(11).text("1", 30, tableTop + 45);
				doc.text(oPoSheet.Mill, 60, tableTop + 45, {  width: 60 });
				doc.text(oPoSheet.QualityOfMaterial, 125, tableTop + 45, { width: 70 });
				doc.text(`${oPoSheet.GSM} GSM`, 200, tableTop + 45, { width: 60 });
				doc.text(`${oPoSheet.Height}x${oPoSheet.Width} mm`, 270, tableTop + 45, { width: 90 }).text(`${HeightInInches}x${WidthInInches} '`, 270, tableTop + 60, { width: 90 });
				doc.text(`${OpeningWeight} KG`, 370, tableTop + 45, { width: 80 }).text(`${oPoSheet.OpeningStock} Sheets`, 370, tableTop + 60, { width: 80});
				doc.text(`${currecySymbol} ${oPoSheet.Rate}`, 455, tableTop + 45, { width: 60 });
				const price = +((oPoSheet.Rate * OpeningWeight).toFixed(2));
				doc.text(`${currecySymbol} ${price}`, 520, tableTop + 45, { width: 70 });
				doc.moveTo(LEFT_MARGIN, tableTop + 120).lineTo(RIGHT_MARGIN, tableTop + 120).stroke();

				doc.moveDown(1);

				doc.text('Transport: ', 30, tableTop + 130).text('Payment Terms: ', 30 , tableTop + 145);
				doc.text(`${oPoSheet.Transport}`, 140, tableTop + 130).text(`${oPoSheet.PaymentTerms}`, 140 , tableTop + 145);

				// calculations
				const discount = +(oPoSheet.Discount) || 0.00;
				const transportation = +(oPoSheet.Transportation) || 0.00;
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
				doc.text('Remarks: ', 30, tableTop + 240).text(`${oPoSheet.Remarks}`, 100, tableTop + 240, { width: 250});
				doc.text('For AEON Products', 460, tableTop + 240);
				doc.text('Authorised Signatory', 460, tableTop + 300);
				doc.moveTo(LEFT_MARGIN, tableTop + 315).lineTo(RIGHT_MARGIN, tableTop + 315).stroke();

				// vertical line
				doc.moveTo(300, tableTop + 235).lineTo(300, tableTop + 315).stroke();

				// --- FOOTER ---
				doc.moveDown(4);
				doc.text("Prepared By: ___________________", 50, 700).text(`${oPoSheet.PreparedBy}`, 120, 695);
				doc.text("Checked By: ___________________", 350, 700).text(`${oPoSheet.CheckedBy}`, 420, 695);

				// --- END & DOWNLOAD ---
				// doc.end();
				// stream.on("finish", function () {
				// const blob = stream.toBlob("application/pdf");
				// const url = stream.toBlobURL("application/pdf");
				// const a = document.createElement("a");
				// a.href = url;
				// a.download = `PO_${oPoSheet.PoNo}.pdf`;
				// a.click();

				doc.end();
				stream.on("finish", async () => {
				const blobPDF = stream.toBlob('application/pdf');
				const reader2 = new FileReader();
				reader2.onloadend = async () => {
					const base64PDF = reader2.result; 

					this.getView().getModel("appView").setProperty("/GeneratedPDF", base64PDF);
					this.getView().getModel("appView").setProperty("/PDFPoNo", oPoSheet.PoNo);

					if (!this._pPDFViewerDialog) {
						this._pPDFViewerDialog = Fragment.load({
							id: this.getView().getId(),
							name: "ent.ui.ecommerce.fragments.PoSheetPDFViewer",
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

				this.getView().byId("tablePoSheet").removeSelections();
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
			this.getView().byId("tablePoSheet").removeSelections();
			this.onCloseGeneratePDF()
			this.onGetAllPo()
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
			payload.userId = this.getModel('appView').getProperty('/UserId')
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

					that.middleWare.callMiddleWare("onUpdatePoStatus", "POST", statusPayload)
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
		},

		loadDropdownOptions: function () {
			var oModel = this.getView().getModel();        
			var oAppViewModel = this.getView().getModel('appView'); 
			var that = this;

			oModel.read("/DropdownOptions", {
				success: function (oData) {
					var aAll = oData.results || [];

					// var aSupplier = aAll.filter(i => i.Type === "Supplier_Name");
					// var aMill = aAll.filter(i => i.Type === "Mill");
					// var aQuality = aAll.filter(i => i.Type === "Quality_Of_Material");
					// var aBoard = aAll.filter(i => i.Type === "Type_Of_Board");

					// oAppViewModel.setProperty("/DropdownSupplier", aSupplier);
					// oAppViewModel.setProperty("/DropdownMill", aMill);
					// oAppViewModel.setProperty("/DropdownQuality", aQuality);
					// oAppViewModel.setProperty("/DropdownBoard", aBoard);

					let aSupplier = [];
					let aMill = [];
					let aQuality = [];
					let aBoard = [];

					for(let i = 0; i < aAll.length; i++){
						let item = aAll[i];

						if(item.Type === "Supplier_Name"){
							aSupplier.push(item);
						}
						else if(item.Type === "Mill"){
							aMill.push(item);
						}
						else if(item.Type === "Quality_Of_Material"){
							aQuality.push(item);
						}
						else if(item.Type === "Type_Of_Board"){
							aBoard.push(item);
						}
					}

					oAppViewModel.setProperty("/DropdownSupplier", aSupplier);
					oAppViewModel.setProperty("/DropdownMill", aMill);
					oAppViewModel.setProperty("/DropdownQuality", aQuality);
					oAppViewModel.setProperty("/DropdownBoard", aBoard);

				},
				error: function (oError) {
					that.middleWare.errorHandler(oError, that);
				}
			});
		},



		selectSupplierName: function (oEvent) {
			var oSource = oEvent.getSource();
			var sKey = oSource.getSelectedKey();           
			var sValue = oSource.getValue().trim();          

			if (sKey) {
				return;
			}

			if (sValue) {
				var supplierName = sValue.charAt(0).toUpperCase() + sValue.slice(1).toLowerCase();
				this.handleSaveDropdownOption("Supplier_Name", supplierName)
			}
		},

		selectMill: function (oEvent) {
			var oSource = oEvent.getSource();
			var sKey = oSource.getSelectedKey();           
			var sValue = oSource.getValue().trim();          

			if (sKey) {
				return;
			}

			if (sValue) {
				var MillName = sValue.charAt(0).toUpperCase() + sValue.slice(1).toLowerCase();
				this.handleSaveDropdownOption("Mill", MillName)
			}
		},
		selectQualityOfMaterial: function (oEvent) {
			var oSource = oEvent.getSource();
			var sKey = oSource.getSelectedKey();           
			var sValue = oSource.getValue().trim();          

			if (sKey) {
				return;
			}

			if (sValue) {
				var QualityOfMaterialName = sValue.charAt(0).toUpperCase() + sValue.slice(1).toLowerCase();
				this.handleSaveDropdownOption("Quality_Of_Material", QualityOfMaterialName)
			}
		},
		selectTypeOfBoard: function (oEvent) {
			var oSource = oEvent.getSource();
			var sKey = oSource.getSelectedKey();           
			var sValue = oSource.getValue().trim();          

			if (sKey) {
				return;
			}

			if (sValue) {
				var TypeOfBoardName = sValue.charAt(0).toUpperCase() + sValue.slice(1).toLowerCase();
				this.handleSaveDropdownOption("Type_Of_Board", TypeOfBoardName)
			}
		},


		handleSaveDropdownOption: function (type,  optionName) {
			var oModel = this.getView().getModel();  
			var that = this;
			var payload = {
				Type: type,
				OptionName: optionName
			};

			MessageBox.confirm(
				"This Supplier Name does not exist. Do you want to create it?",
				{
					actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
					onClose: function (sAction) {
						if (sAction === MessageBox.Action.OK) {
							oModel.create("/DropdownOptions", payload, {
								success: function () {
									MessageToast.show("Created successfully!");
									that.loadDropdownOptions(); 
								},
								error: function (oError) {
									that.middleWare.errorHandler(oError, that);
								}
							});
						}
					}
				}
			);
		},

		onNavigateToJob: function(oEvent){
			var oItem = oEvent.getSource();
			var oBindingContext = oItem.getBindingContext("appView");
			var jobCardNo = oBindingContext.getObject().JobCardNo;
			
			if(jobCardNo) {
				this.getRouter().navTo("sideNavallPrinters", {
					jobId: jobCardNo  
				});
				// this.getModel("appView").setProperty("/navigationKey", 'allPrinters');
			} else {
				MessageToast.show("No Job Card Number available");
			}
		},

		onTransferPoSheets: function () {
			var oView = this.getView();
			var oItem = oView.byId("tablePoSheet").getSelectedItem();
			if (!oItem) {
				MessageToast.show("Please select a Purchase Order first.");
				return;
			}

			var selectedPo = oItem.getBindingContext("appView").getObject();
			this.selectedPo = selectedPo;
			var allPoData = this.getModel("appView").getProperty("/PoSheet");
			
			// Find matching jobs based on height and width
			var matchingPos = allPoData.filter(function(po) {
				return po.PoNo !== selectedPo.PoNo && 
					po.Height === selectedPo.Height && 
					po.Width === selectedPo.Width;
			});

			if (matchingPos.length === 0) {
				MessageToast.show("No matching PO found with same dimensions");
				oView.byId("tablePoSheet").removeSelections();
				return;
			}

			this.getModel("appView").setProperty("/TransferablePoList", matchingPos);
			this.getModel("appView").setProperty("/selectedPoNo", selectedPo.PoNo);
			
			if (!this._oMatchingJobsDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.PoTransfer",
					controller: this
				}).then(function(oDialog) {
					this._oMatchingJobsDialog = oDialog;
					oView.addDependent(oDialog);
					oDialog.open();
				}.bind(this));
			} else {
				this._oMatchingJobsDialog.open();
			}
		},

		onTransferPo: function () {
			var oView = this.getView();
			var that = this;
			var oItem = oView.byId("TransferablePo").getSelectedItem();
			if (!oItem) {
				MessageToast.show("Please select a Purchase Order first.");
				return;
			}

			var TransferPoTo = oItem.getBindingContext("appView").getObject();
			var TransferPoFrom = this.selectedPo;

			if(!this.TransferPoDialog) {
				this.TransferPoDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "",
					content: new sap.m.Input({
						placeholder: "Enter Transfer Sheets",
						type: sap.m.InputType.Number,
						id: this.createId("inpTransferSheets")
					}),
					beginButton: new sap.m.Button({
						type: sap.m.ButtonType.Emphasized,
						text: "Transfer",
						press: function() {
							var sTransferSheets = that.byId('inpTransferSheets').getValue();
							
							if(!sTransferSheets) {
								MessageToast.show("Please enter Transfer Sheets");
								return;
							}
							var payload = {
								FromPoNo: TransferPoFrom.PoNo,
								ToPoNo: TransferPoTo.PoNo,
								TransferSheets: sTransferSheets
							};
							that.middleWare.callMiddleWare("onTransferPoSheets", "POST", payload)
								.then(function (data, status, xhr) {
									MessageToast.show("Sheets Transferred Successfully");
									that.onGetAllPo();
									that.onClosePoTransfer();
									that.TransferPoDialog.close();
								})
								.catch(function (jqXhr, textStatus, errorMessage) {
									that.middleWare.errorHandler(jqXhr, that);
								});
							that.TransferPoDialog.close();
							oView.byId("TransferablePo").removeSelections();
						}
					}),
					endButton: new sap.m.Button({
						type: sap.m.ButtonType.Reject, 
						text: "Cancel",
						press: function() {
							that.TransferPoDialog.close();
							oView.byId("TransferablePo").removeSelections();
						}
					}),
					afterClose: function() {
						that.byId('inpTransferSheets').setValue("");
						oView.byId("TransferablePo").removeSelections();
					},
					styleClass: "appDialog"
				});
			}
			
			this.TransferPoDialog.setTitle(`Transfer Sheets to ${TransferPoTo.PoNo}`);
						
			this.byId('inpTransferSheets').setValue("");
			
			this.TransferPoDialog.open();
		},
		 
		onClosePoTransfer: function () {
			var oView = this.getView();
			if (this._oMatchingJobsDialog) {
				this._oMatchingJobsDialog.close();
				oView.byId("tablePoSheet").removeSelections();
				this.getModel("appView").setProperty("/TransferablePoList", []);
			}
		},

		onSpiltPoSheets: function () {
			var oView = this.getView();
			var oItem = oView.byId("tablePoSheet").getSelectedItem();
			var userId = this.getModel('appView').getProperty('/UserId');

			if (!oItem) {
				MessageToast.show("Please select a Purchase Order first.");
				return;
			}

			var selectedPo = oItem.getBindingContext("appView").getObject();

			var OpeningStock = selectedPo.OpeningStock || 0;
			var UsedSheets = selectedPo.UsedSheets || [];
			var ClosingStock =
				OpeningStock +
				(UsedSheets.length
					? UsedSheets.reduce(function(acc, item) {
						var q = Number(item.QuantityOfSheets) || 0;
						return acc + (q < 0 ? q : 0);
						}, 0)
					: 0);

			if (ClosingStock <= 0) {
				MessageToast.show("No Sheets Available to Split");
				oView.byId("tablePoSheet").removeSelections();
				return;
			}

			var allPos = this.getModel("appView").getProperty("/PoSheet") || [];
			var basePoNo = selectedPo.PoNo;
			var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

			var existingChildren = allPos
				.map(p => p.PoNo)
				.filter(p => {
					if (!p.startsWith(basePoNo)) return false;
					
					var suffix = p.substring(basePoNo.length);
					
					return suffix.length === 1 && alphabet.includes(suffix);
				});

			var nextSuffixIndex = 0;

			if (existingChildren.length > 0) {
				var suffixes = existingChildren.map(poNo => {
					var suffix = poNo.substring(basePoNo.length);
					return alphabet.indexOf(suffix);
				}).filter(index => index !== -1); 

				if (suffixes.length > 0) {
					var maxSuffixIndex = Math.max(...suffixes);
					nextSuffixIndex = maxSuffixIndex + 1;
				}
			}

			if (nextSuffixIndex >= alphabet.length - 1) {
				MessageToast.show("Maximum split limit reached for this PO.");
				return;
			}

			var newPoNo1 = basePoNo + alphabet[nextSuffixIndex];
			var newPoNo2 = basePoNo + alphabet[nextSuffixIndex + 1];

			this.getModel("appView").setProperty("/SplitSheet", {
				SelectedPo: selectedPo,
				NewPoNo: [newPoNo1, newPoNo2],    
				QuantityOfSheets: ClosingStock,
				Height: [selectedPo.Height, 0],   
				Width: [selectedPo.Width, 0], 
				originalHeight: selectedPo.Height,
				originalWidth: selectedPo.Width,
				MaxSplitQuantity: ClosingStock,
				userId: userId
			});

			if (!this._oSplitDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.SplitSheets",
					controller: this
				}).then(function (oDialog) {
					this._oSplitDialog = oDialog;
					oView.addDependent(oDialog);
					oDialog.open();
				}.bind(this));
			} else {
				this._oSplitDialog.open();
			}
		},

		onLiveChangeQuantityOfSheetsToSplit: function (oEvent) {
			var inputValue = oEvent.getParameter("value");
			var preValue = this._lastSheetValue || ""; // previous cached value

			var maxSplitQuantity = this.getModel("appView").getProperty("/SplitSheet/MaxSplitQuantity");

			if (inputValue > maxSplitQuantity) {
				MessageToast.show("Quantity exceeds available sheets to split");
				oEvent.getSource().setValue(preValue); // revert field
				this.getModel("appView").setProperty("/SplitSheet/QuantityOfSheets", preValue);
				return;
			}

			this.getModel("appView").setProperty("/SplitSheet/QuantityOfSheets", inputValue);
			this._lastSheetValue = inputValue; // cache new value
		},

		onLiveChangeHeight1: function (oEvent) {
			var inputValue = oEvent.getParameter("value");

			var originalHeight = this.getModel("appView").getProperty("/SplitSheet/originalHeight");
			if(inputValue > originalHeight) {
				MessageToast.show("Height exceeds original height");
				oEvent.getSource().setValue(originalHeight); 
				this.getModel("appView").setProperty("/SplitSheet/Height/0", originalHeight);
				this.getModel("appView").setProperty("/SplitSheet/Height/1", 0);
				return;
			}else {
				var remainingHeight = originalHeight - inputValue;
				this.getModel("appView").setProperty("/SplitSheet/Height/1", remainingHeight);
			}
		},

		onLiveChangeHeight2: function (oEvent) {
			var inputValue = oEvent.getParameter("value");

			var originalHeight = this.getModel("appView").getProperty("/SplitSheet/originalHeight");
			if(inputValue > originalHeight) {
				MessageToast.show("Height exceeds original height");
				oEvent.getSource().setValue(originalHeight); 
				this.getModel("appView").setProperty("/SplitSheet/Height/0", originalHeight);
				this.getModel("appView").setProperty("/SplitSheet/Height/1", 0);
				return;
			}else {
				var remainingHeight = originalHeight - inputValue;
				this.getModel("appView").setProperty("/SplitSheet/Height/1", remainingHeight);
			}
		},

		onLiveChangeWidth1: function (oEvent) {
			var inputValue = oEvent.getParameter("value");

			var originalWidth = this.getModel("appView").getProperty("/SplitSheet/originalWidth");
			if(inputValue > originalWidth) {
				MessageToast.show("Width exceeds original width");
				oEvent.getSource().setValue(originalWidth); 
				this.getModel("appView").setProperty("/SplitSheet/Width/0", originalWidth);
				this.getModel("appView").setProperty("/SplitSheet/Width/1", 0);
				return;
			}else {
				var remainingWidth = originalWidth - inputValue;
				this.getModel("appView").setProperty("/SplitSheet/Width/1", remainingWidth);
			}
		},

		onLiveChangeWidth2: function (oEvent) {
			var inputValue = oEvent.getParameter("value");

			var originalWidth = this.getModel("appView").getProperty("/SplitSheet/originalWidth");
			if(inputValue > originalWidth) {
				MessageToast.show("Width exceeds original width");
				oEvent.getSource().setValue(originalWidth); 
				this.getModel("appView").setProperty("/SplitSheet/Width/1", originalWidth);
				this.getModel("appView").setProperty("/SplitSheet/Width/0", 0);
				return;
			}else {
				var remainingWidth = originalWidth - inputValue;
				this.getModel("appView").setProperty("/SplitSheet/Width/0", remainingWidth);
			}
		},

		onSubmitSplitSheets: function () {
			var that = this;
			var splitData = this.getModel("appView").getProperty("/SplitSheet");

			if (!splitData.QuantityOfSheets || splitData.QuantityOfSheets <= 0) {
				MessageToast.show("Please enter valid Quantity of Sheets to split");
				return;
			}
			if(!splitData.Height[0] || splitData.Height[0] <=0 || !splitData.Height[1] || splitData.Height[1] <=0 || !splitData.Width[0] || splitData.Width[0] <=0 || !splitData.Width[1] || splitData.Width[1] <=0) {
				MessageToast.show("Please enter valid dimensions for both sheets");
				return;
			}

			this.middleWare.callMiddleWare("onSplitPoSheets", "POST", splitData)
				.then(function (data, status, xhr) {
					MessageToast.show("Sheets Split Successfully");
					that.onGetAllPo();
					that.onCloseSplitSheets();
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
		},

		onCloseSplitSheets: function () {
			var oView = this.getView();
			if (this._oSplitDialog) {
				this._oSplitDialog.close();
				oView.byId("tablePoSheet").removeSelections();
				this.getModel("appView").setProperty("/SplitSheet", {} )
			}
		},

	});
});