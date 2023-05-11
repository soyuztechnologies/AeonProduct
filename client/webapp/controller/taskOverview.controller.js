sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/m/routing/RouteMatchedHandler",
	"sap/ui/table/Table",
	"oft/fiori/models/formatter"

], function(Controller, Filter, FilterOperator, Route,Table, Formatter,FilterType) {
	"use strict";
	return Controller.extend("oft.fiori.controller.taskOverview", {
		aFilters:[],
		onInit: function() {
			debugger;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				this.getView().byId("idUserl").setText(loginUser);
			}
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);

		},
		herculis: function(oEvent) {
			this.getView().byId("idCoDate1").setDateValue(new Date());
			if(oEvent.getParameter("name") !== "taskoverview"){
				return;
			}
			this.getModel("local").setProperty("/tasks/CrDate", new Date());
			this.currentUser = this.getModel("local").getProperty("/CurrentUser");
			this.fromDate = new Date();
			this.toDate = new Date();
			this.fromDate.setMilliseconds(0);
			this.fromDate.setSeconds(0);
			this.fromDate.setMinutes(0);
			this.fromDate.setHours(0);

			this.toDate.setMilliseconds(0);
			this.toDate.setSeconds(59);
			this.toDate.setMinutes(59);
			this.toDate.setHours(23);
			this.reloadTasks();

		},
		reloadTasks: function(){
			debugger;
			var role=this.getModel("local").getProperty("/Role");
			this.getView().byId("idCoTable").bindItems({
				path: "/tasks",
				template: new sap.m.ColumnListItem({
					cells: [
						new sap.m.Text({text: { path: 'CrDate', type:'sap.ui.model.type.Date', formatOptions:{ pattern:'dd.MM.YYYY' } }}),
						// new sap.m.Text({text: "{CrDate}"}),
						new sap.m.Text({text: "{CreatedBy}"}),
						new sap.m.Text({text: {path: 'taskType',
						formatter: '.formatter.getTaskText'}}),
						new sap.m.Text({text: "{taskWorkedOn}"}),
						new sap.m.Text({text: "{noOfHours}"})
					]
				})
			});

			if(role=='Admin'){
				var filters = [new sap.ui.model.Filter(
					"CrDate",
					FilterOperator.BT,
					this.fromDate,
					this.toDate
				)];
				this.getView().byId("idCoTable").getBinding("items").filter(filters);
			}
			else {
				this.getView().byId("idUser").setVisible(false);
				var filters = [new sap.ui.model.Filter(
					'CreatedBy',
					'EQ',
					"'" + this.currentUser + "'"
				),new sap.ui.model.Filter(
					"CrDate",
					FilterOperator.BT,
					this.fromDate,
					this.toDate
				)];
				this.getView().byId("idCoTable").getBinding("items").filter(filters);
			}


		},
		onUpdateFinished:function(oEvent){
			debugger;
			var oTable= oEvent.getSource();
			var oTableItem = oTable.getItems();
			var noItems=oTableItem.length;
			var cell;
			for(var i=0; i < noItems; i++){
				var userId=oTable.getItems()[i].getCells()[1].getText();
				var userData=this.allMasterData.AppUsers[userId];
				// oTable.getItems()[i].getCells()[1].setText(userData.UserName);
				oTable.getItems()[i].getCells()[1].setText(userId);
			}
			var oKey=this.getView().byId("idUser").getValue();
			// 	if(oKey){
			// 	this.getView().byId("idCoTable").getBinding("items").filter([
			// 		new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + oKey + "'"),
			// 	]);
			// }
			var rows =this.getView().byId("idCoTable").getBinding("items").getLength();
			var oBinding =this.getView().byId("idCoTable").getBinding("items");
			var total = 0;
			debugger;
			for (var i = 0; i < rows; i++) {
				total = total + parseFloat(oBinding.getContexts()[i].oModel.getProperty(oBinding.getContexts()[i].sPath).noOfHours);

			}
			this.getView().byId("idTxt").setText("Total number of tasks are " + oBinding.getLength() + " and Total number of hours worked are " + total + "");

		},
		formatter: Formatter,
		onSelect:function(oEvent){
			debugger;
			var techId=oEvent.getSource().getSelectedKey();
			var dDateStart=this.getView().byId("idCoDate1").getDateValue();
			var dDateEnd = new Date(dDateStart + 1);
			dDateStart.setMilliseconds(0);
			dDateStart.setSeconds(0);
			dDateStart.setMinutes(0);
			dDateStart.setHours(0);

			dDateEnd.setMilliseconds(0);
			dDateEnd.setSeconds(59);
			dDateEnd.setMinutes(59);
			dDateEnd.setHours(23);

			// this.reloadTasks();

			var oFilter1 = new Filter([
				new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.BT, dDateStart, dDateEnd)
			], true);

			var oFilter2 = new Filter([
				new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + techId + "'")
			]);

			var oFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: true
			});
			this.getView().byId("idCoTable").getBinding("items").filter(oFilter,true);


		},
		onDateChange: function(oEvent) {
			// this.reloadTasks();
			debugger;
			var role=this.getModel("local").getProperty("/Role");
			// var oVal=this.getView().byId("idUser").getValue();
			var oVal=this.getView().byId("idUser").getSelectedKey();
			var dDateStart = oEvent.getSource().getProperty('dateValue');
			var dDateEnd = new Date(dDateStart + 1);
			var isValidDate = oEvent.getParameter("valid");
			var oFilter = [];
			var oFilter1 = null;
			var oFilter2 = null;

			// if( isValidDate ) {
			dDateStart.setMilliseconds(0);
			dDateStart.setSeconds(0);
			dDateStart.setMinutes(0);
			dDateStart.setHours(0);

			dDateEnd.setMilliseconds(0);
			dDateEnd.setSeconds(59);
			dDateEnd.setMinutes(59);
			dDateEnd.setHours(23);

			// aFilters.push(new Filter({
			//    path: "CrDate",
			//    operator: FilterOperator.BT,
			//    value1: dDateStart,
			//    value2: dDateEnd

			if(role=='Admin'){

				oFilter1 = new Filter([
					new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.BT, dDateStart, dDateEnd)
				], true);
				if(!oVal == "" ){
					oFilter2 = new Filter([
						new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + oVal + "'")
					]);
					oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: true
					});
					this.getView().byId("idCoTable").getBinding("items").filter(oFilter,true);
				}
				else {
					oFilter = new sap.ui.model.Filter({
						filters: [oFilter1]

					});
					this.getView().byId("idCoTable").getBinding("items").filter(oFilter,true);
				}
			}

			else{
				oFilter1 = new Filter([
					new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.BT, dDateStart, dDateEnd)
				], true);

				oFilter2 = new Filter([
					new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + this.currentUser + "'")
				]);

				oFilter = new sap.ui.model.Filter({
					filters: [oFilter1, oFilter2],
					and: true
				});
				this.getView().byId("idCoTable").getBinding("items").filter(oFilter,true);
			}
		}

	});
});
// this.oModel.read("/Products", {
//   filters: [InputFilter],
//   success: jQuery.proxy(this._fnSuccessGet, this),
//   error: jQuery.proxy(this._fnErrorGet, this)
// });
// var filters = [new sap.ui.model.Filter(
// 				 "CrDate",
// 				 FilterOperator.BT,
// 				 dDateStart,
// 				 dDateEnd
// 			),
// 			new sap.ui.model.Filter(
// 							 'CreatedBy',
// 							 'EQ',
// 							  oVal
// 						)];
// var filters = [new sap.ui.model.Filter(
// 				 "CrDate",
// 				 FilterOperator.BT,
// 				 dDateStart,
// 				 dDateEnd
// 			)];

// }

// this.byId("idCoTable").getBinding("items").filter(aFilters);


// var dateString = oEvent.getSource().getValue();
// var from = dateString.split(".");
// var dateObject = new Date(from[2], from[1] - 1, from[0]);
// var newDate = new Date(from[2], from[1] - 1, from[0]);
// var PaymentDueDate = this.formatter.getIncrementDate(dateObject, 1);
// this.getView().getModel("local").setProperty("/newRegistration/PaymentDueDate", PaymentDueDate);
//
//
// newDate.setHours(0, 0, 0, 0);
// // var oSorter = new sap.ui.model.Sorter("PaymentDate", false);
// var oSorter = new sap.ui.model.Sorter("CreatedOn", true);
// // var oFilter1 = new sap.ui.model.Filter("PaymentDate", "LE", newDate);
// var oFilter2 = new sap.ui.model.Filter("PaymentDate", "GE", newDate);
// // var oFilter = new sap.ui.model.Filter({
// // 	filters: [oFilter1, oFilter2],
// // 	and: true
// // });
// var oTable = this.getView().byId("idCoTable");
// var itemList = oTable.getItems();
//
// // var noOfItems = itemList.length;
// oTable.getBinding("items").filter(oFilter2); //oFilter
// oTable.getBinding("items").sort(oSorter);
//
