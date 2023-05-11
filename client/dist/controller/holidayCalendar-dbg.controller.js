sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/routing/RouteMatchedHandler"

], function(Controller, Filter, FilterOperator, Route) {
	"use strict";
	return Controller.extend("oft.fiori.controller.holidayCalendar", {

  onInit: function() {
		debugger;
	var oDt = this.getView().byId("idHoliday");
	 oDt.setDateValue(new Date());
	 var oRouter = this.getOwnerComponent().getRouter();
	 oRouter.attachRoutePatternMatched(this.herculis, this);
	 var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				this.getView().byId("idUser").setText(loginUser);
			}
},

herculis:function(){
	debugger;
	this.getView().byId("idHoliday").setDateValue(new Date());
	var todayDay = this.getView().byId("idHoliday").getDateValue(new Date()).getDay();

	switch (todayDay) {
		case 0:
			this.getView().byId("idDay").setValue("Sunday");
			break;
		case 1:
			this.getView().byId("idDay").setValue("Monday");
			break;
		case 2:
			this.getView().byId("idDay").setValue("Tuesday");
			break;
		case 3:
			this.getView().byId("idDay").setValue("Wednesday");
			break;
		case 4:
			this.getView().byId("idDay").setValue("Thursday");
			break;
		case 5:
			this.getView().byId("idDay").setValue("Friday");
			break;
		case 6:
			this.getView().byId("idDay").setValue("Saturday");
			break;
		default:

	}

		this.getModel("local").setProperty("/holidayCalendar/Date", new Date());
		this.currentUser = this.getModel("local").getProperty("/CurrentUser");

		this.fromDate = new Date(2019,0,1);
		this.toDate = new Date(2019,0,31);
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
reloadTasks: function(oEvent) {
		debugger;

		var role=this.getModel("local").getProperty("/Role");
		this.getView().byId("idHolidayTable").bindItems({
				path:"/HolidayCalendars",
				template: new sap.m.ColumnListItem({
			     cells: [
						 new sap.m.Text({text: "{Day}"}),
						 	new sap.m.Text({text: { path: 'Date', type:'sap.ui.model.type.Date', formatOptions:{ pattern:'dd.MM.YYYY' } }}),
							new sap.m.Text({text: "{Occasion}"}),
							new sap.m.Button({text: "Delete", icon: "sap-icon://delete", press: [this.onDelete, this]})
					 ]

				})

			});

},

onUpdateFinished:function(oEvent){
	debugger;
	var oTable= oEvent.getSource();
	var oTableItem = oTable.getItems();
	var noItems=oTableItem.length;
	var cell;

				 var rows =this.getView().byId("idHolidayTable").getBinding("items").getLength();
				 var oBinding =this.getView().byId("idHolidayTable").getBinding("items");
				 var total = 0;
				 for (var i = 0; i < rows; i++) {
					 total = total + parseInt(oBinding.getContexts()[i].oModel.getProperty(oBinding.getContexts()[i].sPath).noOfHours);
				 }
			//	 this.getView().byId("idTxt").setText("Total number of tasks are " + oBinding.getLength() + " and Total number of hours worked are " + total + "");
},

onDateChange: function(oEvent) {
	debugger;
	var role=this.getModel("local").getProperty("/Role");

	var dDateStart = oEvent.getSource().getProperty('dateValue').getDay();

	switch (dDateStart) {
		case 0:
			this.getView().byId("idDay").setValue("Sunday");
			break;
		case 1:
			this.getView().byId("idDay").setValue("Monday");
			break;
		case 2:
			this.getView().byId("idDay").setValue("Tuesday");
			break;
		case 3:
			this.getView().byId("idDay").setValue("Wednesday");
			break;
		case 4:
			this.getView().byId("idDay").setValue("Thursday");
			break;
		case 5:
			this.getView().byId("idDay").setValue("Friday");
			break;
		case 6:
			this.getView().byId("idDay").setValue("Saturday");
			break;
		default:

	}

},


 onDelete: function(oEvent) {
	 	debugger;
	var that = this;
	var oPath = oEvent.getSource().getBindingContext().getPath();
 sap.m.MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
	 if (conf == 'OK') 	{
				 that.ODataHelper.callOData(that.getOwnerComponent().getModel(), oPath, "DELETE", {}, {}, that)
					 .then(function(oData) {
						 sap.m.MessageToast.show("Deleted succesfully");
					 }).catch(function(oError) {
						 that.getView().setBusy(false);
						 that.oPopover = that.getErrorMessage(oError);
						 that.getView().setBusy(false);
					 });
			 }
	}, "Confirmation");

 },

	onSave: function(oEvent) {
			debugger;

  	var that = this;
		var myData = this.getView().getModel("local").getProperty("/holidayCalendar");
		var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "yyyy-MM-dd"});

    myData.Day = this.getView().byId("idDay").getValue();
		myData.Occasion = this.getView().byId("idOccasion").getValue();

		var oDatePicker = this.getView().byId("idHoliday");
			var oNewDate = oDatePicker.getDateValue();
 		// oNewDate.setMinutes(oNewDate.getMinutes() + oNewDate.getTimezoneOffset());
		// oDatePicker.setDateValue(new Date(oNewDate));
		// myData.Date = oDatePicker.getDateValue();

		myData.Date = oNewDate;

		this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/HolidayCalendars",
																"POST", {}, myData, this)
		.then(function(oData) {
		that.getView().setBusy(false);
		sap.m.MessageToast.show("Data Saved Successfully");
		}).catch(function(oError) {
		that.getView().setBusy(false);
		var oPopover = that.getErrorMessage(oError);
		});

	}
});
});
