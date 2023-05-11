sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/m/routing/RouteMatchedHandler",
	"sap/ui/table/Table",
	"oft/fiori/models/formatter",
	"oft/fiori/utils/dateFormatter",
	"sap/m/MessageToast"

], function(Controller, Filter, FilterOperator, Route,Table, Formatter,FilterType,DateFormatter,MessageToast) {
	"use strict";
	return Controller.extend("oft.fiori.controller.performanceAnalysis", {
   aFilters:[],
  onInit: function() {
		debugger;
		var currentUser = this.getModel("local").getProperty("/CurrentUser");
		var role=this.getModel("local").getProperty("/Role");
			// if (currentUser) {
			// 	var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			// 	this.getView().byId("idUserl").setText(loginUser);
			// }
			// if (role =="Admin") {
			// 		this.getView().byId("idUser").setVisible(true);
			//
			// }else {
			// 	this.getView().byId("idUser").setVisible(false);
			// }
			// this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// this.oRouter.attachRoutePatternMatched(this.herculis, this);

},
herculis: function(oEvent) {

		if(oEvent.getParameter("name") !== "timeTracker"){
			return;
		}

		this.currentUser = this.getModel("local").getProperty("/CurrentUser");
		var today = new Date();

		this.reloadTasks();

	},
	reloadTasks: function(){
	debugger;
	//var nInteractiveDates = this.getView().byId("idTimeTrackerCalendar")._$interactiveDates.length;
	var role=this.getModel("local").getProperty("/Role");
	var userId = this.getModel("local").getProperty("/CurrentUser");
	var currentMonth = new Date();
	this.getView().byId("idTimeTrackerCalendar").setCurrentDate(currentMonth);

	var payload = {
		"Month":currentMonth,
		"EmpId":this.currentUser
	};
		if(role=='Admin'){
		setTimeout(this.afterCalLoad.bind(this), 1000);
		}
		else {
			setTimeout(this.afterCalLoad.bind(this), 1000);

		}
	},
	afterCalLoad: function(){

		var userId = this.getModel("local").getProperty("/CurrentUser");
		var currentMonth = new Date();
		this.getView().byId("idTimeTrackerCalendar").setCurrentDate(currentMonth);

		var payload = {
			"Month":currentMonth,
			"EmpId":this.currentUser
		};


		$.post('/getTimeTracker',payload).done(function(data,status){

				if (data.length) {

					for (var i = 0; i <data.length; i++) {
						var offSetDate =  data[i].Date;
							offSetDate = new Date(offSetDate);
						//	offSetDate.setMinutes(offSetDate.getMinutes() + offSetDate.getTimezoneOffset());
							data[i].Date = offSetDate;
					}

					var calDateLength = document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay").length;
							for (var i = 7; i <= calDateLength; i++) {
									var calDate = parseInt(document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].id.split("--")[2].split("idTimeTrackerCalendar-")[1].split("-")[2]);
								//	var empDate = parseInt(data[1].date.split("-")[2].split("T")[0]);
									var empDate = data[0].Date.getDate();

										if(empDate === calDate){

											for (var j = 0; j < data.length; j++) {
												if (data[j].remark === "PH") {
														document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#ffff4d";
														i++;
												}
										else if (data[j].hours === 8) {
												//	console.log("Green--" + data[j].hours);Green

													if (data[j].Date <= new Date() ) {
															document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#99e699";
													}
													i++;
											}
											else if (data[j].hours === "Holiday") {
												//console.log("Yellow--" + data[j].hours );gray
												document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#666699";
												i++;
												//j--;
											}else if (data[j].hours < 8 ) {
												//console.log("Red--"+ data[j].hours);red
												if (data[j].Date <= new Date() ) {
													document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#ff3333";

												}
												i++;

											}else if (data[j].hours === 'LEAVE') {
												//console.log("Blue--" + data[j].hours);blue
												if (data[j].LeaveType == "Full Day") {
															document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor = "#4d79ff";
												}else {
														document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor = "#4d79ff";
														document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.borderLeftWidth = "45px";
												}
												i++;
												//j--;
											}else if (data[j].hours >8) {
												//console.log("Pink--" + data[j].hours);
												document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#99e699";
												i++;
											}

											}
											break;
										}

											}

				}else {
					sap.m.MessageToast.show("You Don't hava Data recorded for this Month");
				}
			debugger;
			//document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[7].id.split("--")[2].split("idTimeTrackerCalendar-")[1];

		}).fail(function(xhr,status,error){

			sap.m.MessageBox.console.error("Something is wrong in your Code");

		});


	},
	onSelect:function(oEvent){
		debugger;
		var techId=oEvent.getSource().getSelectedKey();
		this.currentUser = techId;
		setTimeout(this.loadCurrentUserData.bind(this), 1000);

	//	this.reloadTasks();
	},
	loadCurrentUserData:function(){
		debugger;
		var userId = this.getModel("local").getProperty("/CurrentUser");
		var currentMonth = new Date(this.getView().byId("idTimeTrackerCalendar").getCurrentDate());
		var payload = {
			"Month":currentMonth,
			"EmpId":this.currentUser
		};

		$.post('/getTimeTracker',payload).done(function(data,status){

			//document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[7].id.split("--")[2].split("idTimeTrackerCalendar-")[1];
			if (data.length) {

				for (var i = 0; i <data.length; i++) {
					var offSetDate =  data[i].Date;
						offSetDate = new Date(offSetDate);
					//	offSetDate.setMinutes(offSetDate.getMinutes() + offSetDate.getTimezoneOffset());
						data[i].Date = offSetDate;
				}

				var calDateLength = document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay").length;
						for (var i = 7; i <= calDateLength; i++) {

								var calDate = parseInt(document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].id.split("--")[2].split("idTimeTrackerCalendar-")[1].split("-")[2]);

							//	var empDate = parseInt(data[1].date.split("-")[2].split("T")[0]);
										var empDate = data[0].Date.getDate();
									if(empDate === calDate){

										for ( var j = 0; j < data.length; j++) {
											if (data[j].remark ==="PH") {
													document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#ffff4d";
														i++;
											}
											else if (data[j].hours === 8 ) {
											//	console.log("Green--" + data[i].hours);Green
											if (data[j].Date <= new Date() ) {
												document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#99e699";

											}
												i++;
										}
										else if (data[j].hours === "Holiday") {
											//console.log("Yellow--" + data[j].hours );DimGray
											document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#666699";
											i++;

										}else if (data[j].hours < 8 ) {
											//console.log("Red--"+ data[j].hours);Red
											if (data[j].Date <= new Date() ) {
												document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#ff3333";

											}
											i++;
										}else if (data[j].hours === 'LEAVE') {
											//console.log("Blue--" + data[j].hours);SlateBlue
											if (data[j].LeaveType == "Full Day") {
														document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor = "#4d79ff";
											}else {
													document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor = "#4d79ff";
													document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.borderLeftWidth = "45px";
											}
											i++;

										}else if (data[j].hours > 8) {
											//console.log("Pink--" + data[j].hours);
											document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#99e699";
											i++;
										}

										}
										break;
									}

								}

			}else {
				sap.m.MessageToast.show("You Don't have Data recorded for this month");
			}


		}).fail(function(xhr,status,error){
			sap.m.MessageBox.console.error("Something is wrong in your Code");

		});


	},

	onChangeCurrentDate:function(oEvent){
		debugger;
		var role=this.getModel("local").getProperty("/Role");
		var oVal=this.getView().byId("idUser").getValue();

if(role=='Admin'){
	setTimeout(this.afterCalChange.bind(this), 1000);

	}
else{
	setTimeout(this.afterCalChange.bind(this), 1000);

}
},
afterCalChange: function() {
		debugger;

		var userId = this.getModel("local").getProperty("/CurrentUser");
		var currentMonth = new Date(this.getView().byId("idTimeTrackerCalendar").getCurrentDate());
		var payload = {
			"Month":currentMonth,
			"EmpId":this.currentUser
		};

		$.post('/getTimeTracker',payload).done(function(data,status){

			//document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[7].id.split("--")[2].split("idTimeTrackerCalendar-")[1];
			if (data.length) {

				for (var i = 0; i <data.length; i++) {
					var offSetDate =  data[i].Date;
						offSetDate = new Date(offSetDate);
					//	offSetDate.setMinutes(offSetDate.getMinutes() + offSetDate.getTimezoneOffset());
						data[i].Date = offSetDate;
				}

				var calDateLength = document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay").length;
						for (var i = 7; i <= calDateLength; i++) {

								var calDate = parseInt(document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].id.split("--")[2].split("idTimeTrackerCalendar-")[1].split("-")[2]);
							//	var empDate = parseInt(data[1].date.split("-")[2].split("T")[0]);
										var empDate = data[0].Date.getDate();
									if(empDate === calDate){

										for ( var j = 0; j < data.length; j++) {

											if (data[j].remark ==="PH") {
													document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#ffff4d";
														i++;
											}
											else if (data[j].hours === 8 ) {
											//	console.log("Green--" + data[i].hours);Green
												if (data[j].Date <= new Date() ) {
													document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#99e699";
												}
												i++;
										}
										else if (data[j].hours === "Holiday") {
											//console.log("Yellow--" + data[j].hours );DimGray
											document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#666699";
											i++;

										}else if (data[j].hours < 8 ) {
											//console.log("Red--"+ data[j].hours);Red
											if (data[j].Date <= new Date() ) {
												document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#ff3333";
											}
											i++;
										}else if (data[j].hours === 'LEAVE') {
											//console.log("Blue--" + data[j].hours);SlateBlue
											if (data[j].LeaveType == "Full Day") {
														document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor = "#4d79ff";
											}else {
													document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor = "#4d79ff";
													document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.borderLeftWidth = "45px";
											}
											i++;

										}else if (data[j].hours > 8) {
											//console.log("Pink--" + data[j].hours);
											document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay")[i].style.backgroundColor="#99e699";
											i++;
										}

										}
										break;
									}

								}

			}else {
				sap.m.MessageToast.show("You Don't have Data recorded for this month");
			}


		}).fail(function(xhr,status,error){
			sap.m.MessageBox.console.error("Something is wrong in your Code");

		});

//	console.log(document.getElementById("__component0---idTimeTracker--idTimeTrackerCalendar").getElementsByClassName("sapMeCalendarMonthDay"));
}

});

});
