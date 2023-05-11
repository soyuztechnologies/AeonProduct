sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, MessageToast, Formatter, Filter) {
	"use strict";
	return Controller.extend("oft.fiori.controller.createLeave", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var dateFrom = new Date();
			this.getModel("local").setProperty("/LeaveStatic/dateValueDRS1",this.startDate);
			this.getModel("local").setProperty("/LeaveStatic/secondDateValueDRS1",this.startDate);
			this.getModel("local").setProperty("/newLeaveRequest/DateFrom", this.formatter.getFormattedDate(0));
//			this.getView().byId("idDPlblday").setDateValue(new Date());
			this.getView().byId("idDPlblday").setVisible(false);
			//this.getView().byId("idMessage").setVisible(false);

			this.getView().byId("idDatePicker").setVisible(false);
			var dateTo = new Date();
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
				if (currentUser) {
					var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
					this.getView().byId("idUser").setText(loginUser);
				}
				this.getView().byId("idSave").setEnabled(false);

	},
	onSelchange: function(oEvent){
		var sel = oEvent.getParameters("selectedItem");
		if (sel.selectedItem.mProperties.key === "Full Day"){
	 	this.getView().byId("idlblday").setVisible(true);
		this.getView().byId("idDate").setVisible(true);
// Set false
		this.getView().byId("idDPlblday").setVisible(false);
		this.getView().byId("idDatePicker").setVisible(false);
		this.getView().getModel("local").setProperty("/newLeaveRequest/Days",0)
		}else{
			this.getView().byId("idDPlblday").setVisible(true);
			this.getView().byId("idDatePicker").setVisible(true)
			this.getView().byId("idlblday").setVisible(false);
			this.getView().byId("idDate").setVisible(false);
			this.getView().getModel("local").setProperty("/newLeaveRequest/Days",0.5)
			this.getView().getModel("local").setProperty("/newLeaveRequest/LeaveType","Half Day");
			this.getView().getModel("local").setProperty("/newLeaveRequest/DateFrom","")
		}

	},
onBeforeRendering: function(){
},
		onBack: function() {
			this.oRouter.navTo("leaveRequest");
		},
		herculis: function(oEvent) {

			debugger;
			this.reloadTasks();

		},
		reloadTasks: function(){
		debugger;
		//var nInteractiveDates = this.getView().byId("idCreateLeaveCalendar")._$interactiveDates.length;
		var role=this.getModel("local").getProperty("/Role");
		var userId = this.getModel("local").getProperty("/CurrentUser");
		var currentMonth = new Date();
		this.getView().byId("idCreateLeaveCalendar").setCurrentDate(currentMonth);

		var payload = {
			"date":currentMonth,
			"EmpId":userId
		};

				$.post('/getLeaveValidator',payload).done(this.successCallBack2.bind(this)).
				fail(function(xhr,status,error){

					sap.m.MessageBox.console.error("Something is wrong in your Code");

				});
		},
		successCallBack2:function(data,status){

					if (data.length) {

						for (var i = 0; i <data.length; i++) {
							var offSetDate =  data[i].Date;
								offSetDate = new Date(offSetDate);
							//	offSetDate.setMinutes(offSetDate.getMinutes() + offSetDate.getTimezoneOffset());
								data[i].Date = offSetDate;
						}

						var calDateLength = document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay").length;
								for (var i = 0; i <data.length;i++) {

										var empDate = data[i].Date;

												for (var j = 7; j <calDateLength ; j++) {

											var calDate = new Date(document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].id.split("--")[2].split("idCreateLeaveCalendar-")[1]);
												if( (empDate.getMonth() == calDate.getMonth()) && (empDate.getDate() == calDate.getDate()) && (empDate.getFullYear() == calDate.getFullYear()) ){
												if (data[i].Mark === "PH") {
													//	console.log("red--" + data[j].hours);Green#ffff4d
												document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#ffff4d";
														//i++;
												}
												else if (data[i].Holiday === "Holiday") {
													//console.log("Yellow--" + data[j].hours );#666699#666699
												document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#666699";
													//i++;
												}else if (data[i].Mark === "LEAVE") {
													//console.log("Blue--" + data[j].hours);blue#4d79ff
													if (data[i].LeaveType == "Full Day") {
																document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#4d79ff";
													}else {
															document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#4d79ff";
															document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.borderLeftWidth = "45px";
													}

													//i++;
												}
												// else {
												// 			document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#38b099";
												// }
												}
												}
											//	break;


												}

					}else {
						sap.m.MessageToast.show("You Don't hava Data recorded for this Month");
					}
				debugger;
				//document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[7].id.split("--")[2].split("idCreateLeaveCalendar-")[1];
	},
	onChangeCurrentDate:function(oEvent){
		debugger;
		setTimeout(this.afterCalChange.bind(this), 1000);
},
afterCalChange: function() {

	var userId = this.getModel("local").getProperty("/CurrentUser");
	var currentMonth = new Date(this.getView().byId("idCreateLeaveCalendar").getCurrentDate());

	var payload = {
		"date":currentMonth,
		"EmpId":userId
	};

			$.post('/getLeaveValidator',payload).done(function(data,status){

				if (data.length) {

					for (var i = 0; i <data.length; i++) {
						var offSetDate =  data[i].Date;
							offSetDate = new Date(offSetDate);
						//	offSetDate.setMinutes(offSetDate.getMinutes() + offSetDate.getTimezoneOffset());
							data[i].Date = offSetDate;
					}

				//	var tDays = document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay").length;
					//var calDateLength = tDays/2;
					var calDateLength  = document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay").length;
							for (var i = 0; i <data.length;i++) {

									var empDate = data[i].Date;

											for (var j = 7; j <calDateLength ; j++) {

										var calDate = new Date(document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].id.split("--")[2].split("idCreateLeaveCalendar-")[1]);
									if( (empDate.getMonth() == calDate.getMonth()) && (empDate.getDate() == calDate.getDate()) && (empDate.getFullYear() == calDate.getFullYear()) ){
											if (data[i].Mark === "PH") {
												//	console.log("#666699--" + data[j].hours);Green#ffff4d
												document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#ffff4d";
												//	i++;
												break;
											}
											else if (data[i].Holiday === "Holiday") {
												//console.log("Yellow--" + data[j].hours );#666699#666699
												document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#666699";
											//	i++;
											break;
											}else if (data[i].Mark === "LEAVE") {
												//console.log("Blue--" + data[j].hours);blue#4d79ff
												if (data[i].LeaveType == "Full Day") {
															document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#4d79ff";
												}else {
														document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#4d79ff";
														document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.borderLeftWidth = "45px";
												}
											//	i++;
											break;
										}
										// else {
										// 			document.getElementById("__component0---idcreateLeave--idCreateLeaveCalendar").getElementsByClassName("sapMeCalendarMonthDay")[j].style.backgroundColor = "#38b099";
										// }
											}
											}
										//	break;


											}

				}else {
					sap.m.MessageToast.show("You Don't hava Data recorded for this Month");
				}


			}).
			fail(function(xhr,status,error){

				sap.m.MessageBox.console.error("Something is wrong in your Code");


			})


},
	onChangeRange:function(oEvent){
		debugger;
	//	this.callLeaveValidator();
	var currentUser = this.getModel("local").getProperty("/CurrentUser");
	var oDate = new Date(oEvent.getParameters().fromDate);

	var payload = {
		"date":oDate,
		"EmpId":currentUser
	};
	var that = this;
	//since i was not able to access "this" variable inside asychronous function,i've used a seperate callback funcion and bind this varibale with it.
	$.post('/getLeaveValidator',payload).done(this.sparta.bind(this)).
	fail(function(xhr,status,error){
		sap.m.MessageBox.console.error("Something is wrong in your Code");
	});
// 		var oLeaveRequest={};
// 		var sfrom = {};
// 		var sTo = {};
// 	//	sfrom = oEvent.getParameter("from");
// 			sfrom = new Date(oEvent.getParameters().fromDate);
//
// 		var nextdate = new Date(new Date(sfrom).getFullYear(),new Date(sfrom).getMonth(),new Date(sfrom).getDate()+1);
// 		//sTo = oEvent.getParameter("to");
// 			sTo = new Date(oEvent.getParameters().toDate);
// 		var diff = sTo - sfrom;
// 		var days =  diff / (1000 * 3600 * 24);
// // to get the correct count add 1 to the days
// 		 days = days + 1;
// 		 if (days == 0) {
// 			this.getView().getModel("local").setProperty("/newLeaveRequest/Days",1);
// 		}else {
// 		 this.getView().getModel("local").setProperty("/newLeaveRequest/Days",days);
// 	 }
// 	 if (this.getView().byId("idlType")._getSelectedItemText()== "Half Day") {
// 		 var sValue = new Date(oEvent.getParameters().fromDate);
// 		 var bValid = oEvent.getParameter("valid");
// 		 this.getView().getModel("local").setProperty("/newLeaveRequest/Days",0.5)
// 		 this.getView().getModel("local").setProperty("/newLeaveRequest/DateFrom",sValue);
// 		 this.getView().getModel("local").setProperty("/newLeaveRequest/DateTo",sValue);
// 	 }else {
// 		 var bValid = oEvent.getParameter("valid");
// 		 this.getView().getModel("local").setProperty("/newLeaveRequest/DateFrom",sfrom);
// 		 this.getView().getModel("local").setProperty("/newLeaveRequest/DateTo",sTo);
// 	 }

	},

	sparta:function(data,status){

			if (data.length) {
				 for (var i = 0; i <data.length; i++) {
					 data[i].Date = new Date(data[i].Date);
				}
			}

			var leaveType = this.getView().byId("idlType").getSelectedKey();
			var dFrom = new Date(this.getView().byId("idCreateLeaveCalendar").getSelectedDates()[0]);
			var dTo = new Date(this.getView().byId("idCreateLeaveCalendar").getSelectedDates()[this.getView().byId("idCreateLeaveCalendar").getSelectedDates().length-1]);
			if (dFrom > dTo) {

				sap.m.MessageBox.show("Please Select a valid Date Range...DateFrom can not be greater than DateTo",{onClose: this.onMessageBoxClose.bind(this)});

			}else if(dFrom == null && dTo == null) {
					this.getView().byId("idSave").setEnabled(false);
			}
			var flag = 0;
			if (leaveType === "Full Day") {


				this.getView().byId("idDate").setFrom(new Date(dFrom));
				this.getView().byId("idDate").setTo(new Date(dTo));
				this.getView().getModel("local").setProperty("/newLeaveRequest/DateFrom",dFrom);
				this.getView().getModel("local").setProperty("/newLeaveRequest/DateTo",dTo);

					if ( dFrom != null && dTo != null ) {
							var d2 = dTo;
							var d1 = dFrom;
							var nDays = (d2-d1)/(1000*3600*24);
							var pubHoli = 0;
							var nHol = 0;
						for (var i = 0; i < data.length; i++) {
							if (  (dFrom.getDate() == new Date(data[i].Date).getDate()) && (dFrom.getMonth() == new Date(data[i].Date).getMonth()) && (dFrom.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
								for (var j = 0; j < nDays; j++) {
										if (data[i].Mark == 'PH') {
											pubHoli = pubHoli + 1;
										}
										else if (data[i].Holiday == "Holiday") {
											if (data[i].Mark !=='PH') {
												nHol = nHol+1;
											}
										}
										i++;
								}

							}
							}
					 nDays =  nDays - (pubHoli + nHol )+1;
					 this.getView().getModel("local").setProperty("/newLeaveRequest/Days",nDays);


						for (var i = 0; i < data.length; i++) {
							if ( (data[i].Mark == 'LEAVE') && (dFrom.getDate() == new Date(data[i].Date).getDate()) && (dFrom.getMonth() == new Date(data[i].Date).getMonth()) && (dFrom.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
								sap.m.MessageBox.show("You have already applied leave for " + dFrom.toDateString() +" Date,Please select another Date");
								this.getView().byId("idSave").setEnabled(false);
								flag = 1;
								break;
							}
							else if ((data[i].Mark == 'LEAVE') && (dTo.getDate() == new Date(data[i].Date).getDate()) && (dTo.getMonth() == new Date(data[i].Date).getMonth()) && (dTo.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
								sap.m.MessageBox.show("You have already applied leave for " + dTo.toDateString() +" Date,Please select another Date");
								this.getView().byId("idSave").setEnabled(false);
									flag = 1;
									break;
							}
							else if ( ( data[i].Mark == 'LEAVE') && (dFrom < data[i].Date) && (dTo > data[i].Date) ) {
								sap.m.MessageBox.show("You have already applied leave in between Selected Range,Please Create two seperate leaves from "+dFrom.toDateString()+" To " +data[i-1].Date.toDateString()+" and From "+data[i+1].Date.toDateString()+" To "+dTo.toDateString());
								this.getView().byId("idSave").setEnabled(false);
									flag = 1;
									break;
							}
							else if ( (data[i].Mark == 'PH' ) &&  (dFrom.getDate() == new Date(data[i].Date).getDate()) && (dFrom.getMonth() == new Date(data[i].Date).getMonth()) && (dFrom.getFullYear() == new Date(data[i].Date).getFullYear()) )  {
								sap.m.MessageBox.show("The Selected Date " + dFrom.toDateString() +" is A public Holiday- " +  data[i].Occasion + "- Please select another Date");
								this.getView().byId("idSave").setEnabled(false);
									flag = 1;
									break;
							}
							else if (  (data[i].Mark == 'PH')  && (dTo.getDate() == new Date(data[i].Date).getDate()) && (dTo.getMonth() == new Date(data[i].Date).getMonth()) && (dTo.getFullYear() == new Date(data[i].Date).getFullYear())) {
								sap.m.MessageBox.show("The Selected Date " + dTo.toDateString() +" is A public Holiday- " +  data[i].Occasion + "- Please select another Date");
								this.getView().byId("idSave").setEnabled(false);
									flag = 1;
									break;
							}
							else if ( (data[i].Holiday == 'Holiday') && (dFrom.getDate() == new Date(data[i].Date).getDate()) && (dFrom.getMonth() == new Date(data[i].Date).getMonth()) && (dFrom.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
								sap.m.MessageBox.show("The Selected Date " + dFrom.toDateString() +" is a already a holiday for you, Please select another Date");
								this.getView().byId("idSave").setEnabled(false);
									flag = 1;
									break;
							}
							else if ( (data[i].Holiday == 'Holiday') && (dTo.getDate() == new Date(data[i].Date).getDate()) && (dTo.getMonth() == new Date(data[i].Date).getMonth()) && (dTo.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
								sap.m.MessageBox.show("The Selected Date " + dTo.toDateString() +" is a already a holiday for you, Please select another Date");
								this.getView().byId("idSave").setEnabled(false);
									flag = 1;
									break;
							}
						}
										if (flag == 0) {
											this.getView().byId("idSave").setEnabled(true);
										}else {
											this.getView().byId("idSave").setEnabled(false);
										}
					}
					else {
						this.getView().byId("idSave").setEnabled(false);
					}
				}
				else if (leaveType == "Half Day") {
					var selectedDate = new Date(this.getView().byId("idCreateLeaveCalendar").getSelectedDates()[0]);
					this.getView().getModel("local").setProperty("/newLeaveRequest/Days",0.5);
					this.getView().getModel("local").setProperty("/newLeaveRequest/LeaveType","Half Day");
 		 		 	this.getView().getModel("local").setProperty("/newLeaveRequest/DateFrom",selectedDate);
				 	this.getView().byId("idDatePicker").setDateValue(new Date(selectedDate));
 		 		 	this.getView().getModel("local").setProperty("/newLeaveRequest/DateTo",selectedDate);

		 	//	 var bValid = oEvent.getParameter("valid");
						var flag = 0
						if (selectedDate != null) {
							for (var i = 0; i < data.length; i++) {

								if ( (data[i].Mark == 'LEAVE') && (selectedDate.getDate() == new Date(data[i].Date).getDate()) && (selectedDate.getMonth() == new Date(data[i].Date).getMonth()) && (selectedDate.getFullYear() == new Date(data[i].Date).getFullYear())) {
										sap.m.MessageBox.show("You have already applied leave for " + selectedDate.toDateString() +" Date,Please select another Date");
										this.getView().byId("idSave").setEnabled(false);
										flag = 1;
										break;
									}
									else if ((data[i].Mark == 'PH') && (selectedDate.getDate() == new Date(data[i].Date).getDate()) && (selectedDate.getMonth() == new Date(data[i].Date).getMonth()) && (selectedDate.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
									sap.m.MessageBox.show("The Selected Date " + selectedDate.toDateString() +" is A public Holiday- " +  data[i].Occasion + "- Please select another Date");
									this.getView().byId("idSave").setEnabled(false);
										flag = 1;
										break;
									}
								else if ( (data[i].Holiday =="Holiday") && (selectedDate.getDate() == new Date(data[i].Date).getDate()) && (selectedDate.getMonth() == new Date(data[i].Date).getMonth()) && (selectedDate.getFullYear() == new Date(data[i].Date).getFullYear())) {
									sap.m.MessageBox.show("The Selected Date " + selectedDate.toDateString() +" is a already a holiday for you, Please select another Date");
									this.getView().byId("idSave").setEnabled(false);
										flag = 1;
										break;
								}
							}
							if (flag == 0) {
								this.getView().byId("idSave").setEnabled(true);
							}else {
								this.getView().byId("idSave").setEnabled(false);
							}
						}
						else {
							this.getView().byId("idSave").setEnabled(false);
						}
				}

	},
	onMessageBoxClose:function(oEvent){
		this.getView().byId("idSave").setEnabled(false);
	},
		onhandleChange: function (oEvent) {
			debugger;
			this.callLeaveValidator();
			var oLeaveRequest={};
			var sfrom = {};
			var sTo = {};
			sfrom = oEvent.getParameter("from");
			var nextdate = new Date(new Date(sfrom).getFullYear(),new Date(sfrom).getMonth(),new Date(sfrom).getDate()+1);
			sTo = oEvent.getParameter("to");
			var diff = sTo - sfrom;
			var days =  diff / (1000 * 3600 * 24);
// to get the correct count add 1 to the days
			 days = days + 1;
			 if (days == 0) {
			 	this.getView().getModel("local").setProperty("/newLeaveRequest/Days",1);
			}else {
			 this.getView().getModel("local").setProperty("/newLeaveRequest/Days",days);
		 }
			var bValid = oEvent.getParameter("valid");
			this.getView().getModel("local").setProperty("/newLeaveRequest/DateFrom",sfrom);
			this.getView().getModel("local").setProperty("/newLeaveRequest/DateTo",sTo);
				//this.getView().byId("idDate").setBusy(false);
		},
		callLeaveValidator:function(){
			debugger;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var oDate = new Date();
			var payload = {
				"date":oDate,
				"EmpId":currentUser
			};
			$.post('/getLeaveValidator',payload).done(this.successCallBack.bind(this)).
			fail(function(xhr,status,error){
				sap.m.MessageBox.console.error("Something is wrong in your Code");
			});
		},
		successCallBack: function(data,status){
					debugger;
				if (data.length) {
					 for (var i = 0; i <data.length; i++) {
						 data[i].Date = new Date(data[i].Date);
					}
				}

				var leaveType = this.getView().byId("idlType").getSelectedKey();
				var dFrom = this.getView().byId("idDate").getFrom();
				var dTo = this.getView().byId("idDate").getTo();
				var flag = 0;
				if (leaveType === "Full Day") {
						if ( dFrom != null && dTo != null ) {
								var d2 = dTo;
								var d1 = dFrom;
								var nDays = (d2-d1)/(1000*3600*24);
								var pubHoli = 0;
								var nHol = 0;
							for (var i = 0; i < data.length; i++) {
								if (  (dFrom.getDate() == new Date(data[i].Date).getDate()) && (dFrom.getMonth() == new Date(data[i].Date).getMonth()) && (dFrom.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
									for (var j = 0; j < nDays; j++) {
											if (data[i].Mark == 'PH') {
												pubHoli = pubHoli + 1;
											}
											else if (data[i].Holiday == "Holiday") {
												if (data[i].Mark !=='PH') {
													nHol = nHol+1;
												}
											}
											i++;
									}

								}
								}
						 nDays =  nDays - (pubHoli + nHol )+1;
						 this.getView().getModel("local").setProperty("/newLeaveRequest/Days",nDays);


							for (var i = 0; i < data.length; i++) {
								if ( (data[i].Mark == 'LEAVE') && (dFrom.getDate() == new Date(data[i].Date).getDate()) && (dFrom.getMonth() == new Date(data[i].Date).getMonth()) && (dFrom.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
									sap.m.MessageBox.show("You have already applied leave for " + dFrom +" Date,Please select another Date");
									this.getView().byId("idSave").setEnabled(false);
									flag = 1;
									break;
								}
								else if ((data[i].Mark == 'LEAVE') && (dTo.getDate() == new Date(data[i].Date).getDate()) && (dTo.getMonth() == new Date(data[i].Date).getMonth()) && (dTo.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
									sap.m.MessageBox.show("You have already applied leave for " + dTo +" Date,Please select another Date");
									this.getView().byId("idSave").setEnabled(false);
										flag = 1;
										break;
								}
								else if ( ( data[i].Mark == 'LEAVE') && (dFrom < data[i].Date) && (dTo > data[i].Date) ) {
									sap.m.MessageBox.show("You have already applied leave in between " + dFrom.toLocaleDateString() + " and " + dTo.toLocaleDateString() +  " , Please Create two seperate leaves from "+dFrom.toLocaleDateString()+" To " +data[i-1].Date.toLocaleDateString()+" and From "+data[i+1].Date.toLocaleDateString()+" To "+dTo.toLocaleDateString());
									this.getView().byId("idSave").setEnabled(false);
										flag = 1;
										break;
								}
								else if ( (data[i].Mark == 'PH' ) &&  (dFrom.getDate() == new Date(data[i].Date).getDate()) && (dFrom.getMonth() == new Date(data[i].Date).getMonth()) && (dFrom.getFullYear() == new Date(data[i].Date).getFullYear()) )  {
									sap.m.MessageBox.show("The Selected Date " + dFrom +" is A public Holiday- " +  data[i].Occasion + "- Please select another Date");
									this.getView().byId("idSave").setEnabled(false);
										flag = 1;
										break;
								}
								else if (  (data[i].Mark == 'PH')  && (dTo.getDate() == new Date(data[i].Date).getDate()) && (dTo.getMonth() == new Date(data[i].Date).getMonth()) && (dTo.getFullYear() == new Date(data[i].Date).getFullYear())) {
									sap.m.MessageBox.show("The Selected Date " + dTo +" is A public Holiday- " +  data[i].Occasion + "- Please select another Date");
									this.getView().byId("idSave").setEnabled(false);
										flag = 1;
										break;
								}
								else if ( (data[i].Holiday == 'Holiday') && (dFrom.getDate() == new Date(data[i].Date).getDate()) && (dFrom.getMonth() == new Date(data[i].Date).getMonth()) && (dFrom.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
									sap.m.MessageBox.show("The Selected Date " + dFrom +" is a already a holiday for you, Please select another Date");
									this.getView().byId("idSave").setEnabled(false);
										flag = 1;
										break;
								}
								else if ( (data[i].Holiday == 'Holiday') && (dTo.getDate() == new Date(data[i].Date).getDate()) && (dTo.getMonth() == new Date(data[i].Date).getMonth()) && (dTo.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
									sap.m.MessageBox.show("The Selected Date " + dTo +" is a already a holiday for you, Please select another Date");
									this.getView().byId("idSave").setEnabled(false);
										flag = 1;
										break;
								}
							}
											if (flag == 0) {
												this.getView().byId("idSave").setEnabled(true);
											}else {
												this.getView().byId("idSave").setEnabled(false);
											}
						}
						else {
							this.getView().byId("idSave").setEnabled(false);
						}
					}
					else if (leaveType == "Half Day") {
							var selectedDate = this.getView().byId("idDatePicker").getDateValue();
							var flag = 0
							if (selectedDate != null) {
								for (var i = 0; i < data.length; i++) {

									if ( (data[i].Mark == 'LEAVE') && (selectedDate.getDate() == new Date(data[i].Date).getDate()) && (selectedDate.getMonth() == new Date(data[i].Date).getMonth()) && (selectedDate.getFullYear() == new Date(data[i].Date).getFullYear())) {
											sap.m.MessageBox.show("You have already applied leave for " + selectedDate +" Date,Please select another Date");
											this.getView().byId("idSave").setEnabled(false);
											flag = 1;
											break;
										}
										else if ((data[i].Mark == 'PH') && (selectedDate.getDate() == new Date(data[i].Date).getDate()) && (selectedDate.getMonth() == new Date(data[i].Date).getMonth()) && (selectedDate.getFullYear() == new Date(data[i].Date).getFullYear()) ) {
										sap.m.MessageBox.show("The Selected Date " + selectedDate +" is A public Holiday- " +  data[i].Occasion + "- Please select another Date");
										this.getView().byId("idSave").setEnabled(false);
											flag = 1;
											break;
										}
									else if ( (data[i].Holiday =="Holiday") && (selectedDate.getDate() == new Date(data[i].Date).getDate()) && (selectedDate.getMonth() == new Date(data[i].Date).getMonth()) && (selectedDate.getFullYear() == new Date(data[i].Date).getFullYear())) {
										sap.m.MessageBox.show("The Selected Date " + selectedDate +" is a already a holiday for you, Please select another Date");
										this.getView().byId("idSave").setEnabled(false);
											flag = 1;
											break;
									}
								}
								if (flag == 0) {
									this.getView().byId("idSave").setEnabled(true);
								}else {
									this.getView().byId("idSave").setEnabled(false);
								}
							}
							else {
								this.getView().byId("idSave").setEnabled(false);
							}
					}

					},

		onDPhandleChange:function(oEvent){
			debugger;
			this.callLeaveValidator();
			var oDP = oEvent.getSource();
			var sValue = oEvent.getParameter("value");
			var bValid = oEvent.getParameter("valid");
			this.getView().getModel("local").setProperty("/newLeaveRequest/Days",0.5)
			this.getView().getModel("local").setProperty("/newLeaveRequest/DateFrom",sValue);
			this.getView().getModel("local").setProperty("/newLeaveRequest/DateTo",sValue);

		},

		onCancel:function(oEvent){
			this.getView().getModel("local").setProperty("/newLeaveRequest/DateFrom", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newLeaveRequest/DateTo", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newLeaveRequest/Remarks", null)

		},
		onSave:function(oEvent){
			debugger;
		//	this.callLeaveValidator();
			var oLocal = oEvent;
			var that = this;
			var that2 = this;
			that.getView().setBusy(true);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var leadData = this.getView().getModel("local").getProperty("/newLeaveRequest");
			var oStatic = this.getView().getModel("local").getProperty("/LeaveStatic");

			if (leadData.DateFrom >  leadData.DateTo){
			that.getView().setBusy(false);
			sap.m.MessageBox.error("Date From Cannot be greater than Date To");
			return;
			}
			var tdate = new Date(leadData.DateFrom);
			var yearFrom = tdate.getFullYear();
			tdate = new Date(leadData.DateTo);
			var yearTo = tdate.getFullYear();
			if (yearFrom != yearTo) {
				that.getView().setBusy(false);
				sap.m.MessageBox.error("Please do not span leaves over multiple years");
				return;
			}
			if (leadData.Days > oStatic.Available) {
			//	MessageBox.confirm("You can only apply for" + oStatic.Available +"days.Do you still want to proceed?", function(conf) {
				MessageBox.confirm("Do you want to proceed with leave Creation ?", function(conf) {
			if (conf == 'OK') {
				var payload ={
					"AppUserId": currentUser,
					 "DateFrom": leadData.DateFrom,
					 "DateTo": leadData.DateTo,
					 "Days": leadData.Days,
					 "LeaveType":leadData.LeaveType,
					 "Status": "Not Approved",
					 "ApproverId": "",
					 "ApprovedOn": new Date(),
					 "RequestedOn": new Date(),
					 "Remarks": leadData.Remarks,
					 "ChangedOn": new Date(),
					 "ChangedBy": currentUser
				};
				var that3 = that2;
				that2.ODataHelper.callOData(that2.getOwnerComponent().getModel(),"/LeaveRequests","POST",{},
					payload, that2)
					.then(function(oData){
						that.getView().setBusy(false);
						sap.m.MessageToast.show("Leave Request send for Approval");

						debugger;
						var userName = that3.getModel("local").getProperty("/UserName");
						var MobileNo = that3.getModel("local").getProperty("/MobileNo");
						var loginPayload = {};
						loginPayload.msgType =  "leaveRequest";
						loginPayload.userName =  userName;
						loginPayload.requested =   payload.Days ;
						loginPayload.balance =  "?";
						loginPayload.Number =  MobileNo;
						$.post('/requestMessage', loginPayload)
							.done(function(data, status) {
								sap.m.MessageToast.show("Message sent successfully");
							})
							.fail(function(xhr, status, error) {
								that.passwords = "";
								sap.m.MessageBox.error(xhr.responseText);
							});

						that.destroyMessagePopover();
					}).catch(function(oError){
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});

			}else { that.getView().setBusy(false); }
		},"Confirmation");
		}else{
			var payload ={
				"AppUserId": currentUser,
				 "DateFrom": leadData.DateFrom,
				 "DateTo": leadData.DateTo,
				 "Days": leadData.Days,
				 "LeaveType":leadData.LeaveType,
				 "Status": "Not Approved",
				 "ApproverId": "",
				 "ApprovedOn": new Date(),
				 "RequestedOn": new Date(),
				 "Remarks": leadData.Remarks,
				 "ChangedOn": new Date(),
				 "ChangedBy": currentUser
			};
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/LeaveRequests","POST",{},
				payload, this)
				.then(function(oData){
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Leave Request send for Approval");
					var userName = that2.getModel("local").getProperty("/UserName");
					var MobileNo = that2.getModel("local").getProperty("/MobileNo");
					var loginPayload = {};
					loginPayload.msgType =  "leaveRequest";
					loginPayload.userName =  userName;
					loginPayload.requested =   payload.Days ;
					loginPayload.balance =  "?";
					loginPayload.Number =  MobileNo;
					$.post('/requestMessage', loginPayload)
						.done(function(data, status) {
							sap.m.MessageToast.show("Message sent successfully");
						})
						.fail(function(xhr, status, error) {
							that.passwords = "";
							sap.m.MessageBox.error(xhr.responseText);
						});
					that.destroyMessagePopover();
				}).catch(function(oError){
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});

			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rende#ffff4d
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf oft.fiori.view.View2
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf oft.fiori.view.View2
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/*
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf oft.fiori.view.View2
		 */
		//	onExit: function() {
		//
		//	}

	});

});
