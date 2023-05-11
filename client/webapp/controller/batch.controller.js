var oGuid;

sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter"
], function(Controller, MessageBox, MessageToast, Formatter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.batch", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		 expandStartDate: function(startDate) {
			 var month = new Array();
				   month[0] = "JAN";
				   month[1] = "FEB";
				   month[2] = "MAR";
				   month[3] = "APR";
				   month[4] = "MAY";
				   month[5] = "JUN";
				   month[6] = "JUL";
				   month[7] = "AUG";
				   month[8] = "SEP";
				   month[9] = "OCT";
				   month[10] = "NOV";
				   month[11] = "DEC";

	var str = startDate.split(".");
	var date = str[1] + "/" + str[0] + "/" + str[2];
 	//var mon = month[str[1]];
	//var year = str[2];
 var d = new Date(date);
 var mon = month[d.getMonth()];
 var year = d.getFullYear();
 return mon + "_" + year;
 		},

		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);

		},


		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},

		onDeleteBatch: function(oEvent) {

				var that = this;
				MessageBox.confirm("Do you want to delete the selected batch?", function(conf) {
					if (conf == 'OK') {
						//var items = that.getView().byId('manageSubsTable').getSelectedContexts();
						// that.totalCount = that.totalCount - items.length;
						// for (var i = 0; i < items["length"]; i++) {
						debugger;
						var sPath = "/Courses('" + oGuid + "')";
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), sPath, "DELETE", {}, {}, that)
							.then(function(oData) {
								//that.getView().byId("idDelete").setEnabled(false);
								sap.m.MessageToast.show("Batch Deleted succesfully");
								that.onClearScreen();
							}).catch(function(oError) {
								that.getView().setBusy(false);
								that.oPopover = that.getErrorMessage(oError);
								that.getView().setBusy(false);
							});
						// }
					}
				}, "Confirmation");

		},

		onSave: function(oEvent) {
			//TODO: Save to Coustomer Reg. table
			console.log(this.getView().getModel("local").getProperty("/newBatch"));
			var oLocal = oEvent;
			var that = this;
			var batchData = this.getView().getModel("local").getProperty("/newBatch");
			//busy indicator
		//	that.getView().setBusy(true);
			// if(!this.getView().byId("inqDate").getDateValue()){
			// 	sap.m.MessageToast.show("Enter a valid Date");
			// 	return "";
			// }
			debugger;
			var payload = {
				"BatchNo": batchData.batchName,
			//	"Name": batchData.batchName,
				"CourseId": batchData.courseId,
				"TrainerId": batchData.trainerId,
				"DemoStartDate": this.getView().byId("idDemoDate").getDateValue(),
				"StartDate": this.getView().byId("idStartDate").getDateValue(),
				"EndDate": this.getView().byId("idEndDate").getDateValue(),
			//	"BlogEndDate": this.getView().byId("idBlogEnd").getDateValue(),
			//	"Link": batchData.link,
				"Weekend": batchData.weekend,
				"hidden": String(batchData.hidden),
				"StartTime": batchData.startTime,
				"EndTime": batchData.endTime,
				"Fee": batchData.courseFee,
				"CreatedOn": new Date(),
			//	"CalendarId": batchData.CalendarId,
			//	"EventId": batchData.EventId,
			//	"DriveId": batchData.DriveId,
				"status": batchData.status
			//	"analysis": batchData.analysis
			};


			if (this.flag === "batchid") {
				//alert("Updated");
				//that.getView().setBusy(false);
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Courses('" + oGuid + "')", "PUT", {},
						payload, this)
					.then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageToast.show("Course Updated successfully");
						that.destroyMessagePopover();
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
						// sap.m.MessageToast.show(oError.statusText);
					});

			} else {


				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Courses", "POST", {},
						payload, this)
					.then(function(oData) {
						that.getView().setBusy(false);
						sap.m.MessageToast.show("New Course Saved successfully");
						that.destroyMessagePopover();
					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
						// sap.m.MessageToast.show(oError.statusText);

					});
			}


			//	that.getView().setBusy(false);
		},

		onStartChange: function(oEvent) {
			var dateString = oEvent.getSource().getValue();
			var from = dateString.split(".");
			var dateObject = new Date(from[2], from[1] - 1, from[0]);
			var endDate = this.formatter.getIncrementDate(dateObject, 2.5);
			this.getView().getModel("local").setProperty("/newBatch/endDate", endDate);
			//dateObject = new Date(from[2], from[1] - 1, from[0]);
			//var blogDate = this.formatter.getIncrementDate(dateObject, 8);
			//this.getView().getModel("local").setProperty("/newBatch/blogDate", blogDate);
			console.log(endDate);
			//console.log(blogDate);
			this.updateBatchName();

		},

		onTimeChange: function(oEvent) {
			// var dateString = oEvent.getSource().getValue();
			// var from = dateString.split(".");
			// var dateObject = new Date(from[2], from[1] - 1, from[0]);
			// var endDate = this.formatter.getIncrementDate(dateObject, 2.5);
			// this.getView().getModel("local").setProperty("/newBatch/endDate", endDate);

		},

		herculis: function(oEvent) {
			if(oEvent.getParameter("name") !== "batch"){
				return;
			}
			this.getView().getModel("local").setProperty("/newBatch/startDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newBatch/demoStartDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newBatch/endDate", this.formatter.getFormattedDate(2.5));
			this.getView().getModel("local").setProperty("/newBatch/blogDate", this.formatter.getFormattedDate(8));
			///TODO: Fill the Customer Set and Course Set from REST API

		},
		onChange: function() {
			debugger;
			alert("HELLOOO");
		},
		// setBatchId: function(oValue){
		// 	var oModel = this.getView().getModel("local");
		// 	var batchId = oModel.getProperty("/newBatch/courseName") + "_" +
		// 								oModel.getProperty("/newBatch/trainerName");
		// 	this.getView().byId("idCourseId").setValue(batchId);
		// },
		onSelect: function(oEvent) {

			this.flag = "courseName";
			this.getCustomerPopup();
			var title = this.getView().getModel("i18n").getProperty("course");
			this.searchPopup.setTitle(title);
			this.searchPopup.bindAggregation("items", {
				path: "/CoursesMst",
				template: new sap.m.DisplayListItem({
					label: "{CourseName}",
					value: "{Category}"
				})
			});
		},

		onTrainerSelect: function(oEvent) {

			this.flag = "trainerName";
			this.getCustomerPopup();
			var title =  "Trainer Name";//this.getView().getModel("i18n").getProperty("trainer");
			this.searchPopup.setTitle(title);
			this.searchPopup.bindAggregation("items", {
				path: "/Trainers",
				template: new sap.m.DisplayListItem({
					label: "{FirstName} {LastName}",
					value: "{city}"

				})
			});
		},

		updateBatchName: function() {
			var batchData = this.getModel("local").getProperty("/newBatch");
			debugger;
			var startDate = this.expandStartDate(batchData.startDate);

			//9/25/2019 Anubhav confirmed that we dont need time as part of Batch Id
			// var time = batchData.startTime.split(":").join("");
			// var startTime = time[0] + time[1];
			batchData.batchName = batchData.courseName + "_" + startDate + "_" + batchData.trainerName;
			batchData.batchName = batchData.batchName.split(" ").join("");
			//COURSENAME-MON-YEAR-TIME-TRAINER
		},

		onConfirm: function(oEvent) {
			if (this.flag === "courseName") {

				var courseName = oEvent.getParameter("selectedItem").getLabel();
				this.getView().getModel("local").setProperty("/newBatch/courseName", courseName);
				var courseId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
				this.getView().getModel("local").setProperty("/newBatch/courseId", courseId);

				this.updateBatchName();
			}
			if (this.flag === "trainerName") {

				var trainerName = oEvent.getParameter("selectedItem").getLabel();
				this.getView().getModel("local").setProperty("/newBatch/trainerName", trainerName);
				var trainerId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
				this.getView().getModel("local").setProperty("/newBatch/trainerId", trainerId);

				this.updateBatchName();
			}

			if (this.flag === "batchid") {
				debugger;

				var data = this.getSelectedKey(oEvent);
				//Sample value for data["11:50", "SAPUI4X_SEP_2019_1150_SakshiPradhan", "5d8c58de26aac54ffcce73c0"]

				this.getView().byId("idCourseId").setValue(data[1]);
				this.getView().byId("idCourseId").setEnabled(false);
				var oCourseId = 'Courses(\'' + data[2] + '\')';
				var oModel = this.getView().getModel().oData[oCourseId];
				var that = this;
				var odata = this.getView().getModel().oData;

				if (oModel) {

					// Display Course Name
				//	var oCourseName = oModel.Name;

				var courseId = oModel.CourseId;
				var oCourseId1 = 'CoursesMst(\'' + courseId + '\')';
				var courseName = odata[oCourseId1].CourseName;
				var CourseName = this.getView().byId("batch");
				CourseName.setValue(courseName);
				CourseName.setEnabled(false);

				debugger;
					var trainerId = oModel.TrainerId;
			     var oTrainerId = 'Trainers(\'' + trainerId + '\')';
					 var TrainerName = this.getView().byId("idTrainer");
					 if (odata[oTrainerId]) {
						 var trainerName = odata[oTrainerId].FirstName + " " + odata[oTrainerId].LastName;
						 TrainerName.setValue(trainerName);
					 }

						TrainerName.setEnabled(false);
					//Display Demo Start Date
					var FormattedDate = this.onDateFormatted(oModel.DemoStartDate);
					var oStartDate = this.getView().byId("idDemoDate");
					oStartDate.setValue(FormattedDate);

					//Display Start Date
					//var StartDate = oModel.StartDate;

					var FormattedDate1 = this.onDateFormatted(oModel.StartDate);
					var oStartDate1 = this.getView().byId("idStartDate");
					oStartDate1.setValue(FormattedDate1);
					oStartDate1.setEnabled(false);
					// Display End Date
					// var endDate = oModel.EndDate;

					var FormattedDate2 = this.onDateFormatted(oModel.EndDate);
					var oStartDate2 = this.getView().byId("idEndDate");
					oStartDate2.setValue(FormattedDate2);

					//Display Blog End Date
					// var BlogEndDate = oModel.BlogEndDate;
					// var FormattedDate3 = this.onDateFormatted(oModel.BlogEndDate);
					// var oStartDate3 = this.getView().byId("idBlogEnd");
					// oStartDate3.setValue(FormattedDate3);

					// Display Min Fee
					var oFee = oModel.Fee;
					var Fee = this.getView().byId("idFee");
					Fee.setValue(oFee);

					//Display Link
					// var oLink = oModel.Link;
					// var Link = this.getView().byId("idLink");
					// Link.setValue(oLink);

					//Display Timing
					var oTiming = oModel.StartTime;
					var timing = this.getView().byId("idStartTime");
					timing.setValue(oTiming);

					oTiming = oModel.EndTime;
					var timing = this.getView().byId("idEndTime");
					timing.setValue(oTiming);

					//Guid
					oGuid = oModel.id;
					//Display Weekend checkbox
					var oWeekend = oModel.Weekend;
					// if ((oWeekend === true)||(oWeekend === "true")){
					if (oWeekend === true) {
						var Weekend = this.getView().byId("idWeekend").setSelected(true);
					} else {
						var Weekend = this.getView().byId("idWeekend").setSelected(false);
					}

					//--- BOC - VCHIKKAM
					var bHidden = oModel.hidden;
          var bBatchHide;
					if (bHidden === true) {
						bBatchHide = this.getView().byId("idChkBtcHid").setSelected(true);
					} else {
						bBatchHide = this.getView().byId("idChkBtcHid").setSelected(false);
					}
					//--- EOC - VCHIKKAM

					//Set status
					var status = oModel.status;
					var oStatus = this.getView().byId("idStatus");
					oStatus.setSelectedKey(status);


 					// var oAnalysis = oModel.analysis;
					// if (oAnalysis === true) {
					// 	var analysis = this.getView().byId("idAnalysis").setSelected(true);
					// } else {
					// 	var analysis = this.getView().byId("idAnalysis").setSelected(false);
					// }
					//
					//
					// this.getView().byId("idCalId").setValue(oModel.CalendarId);
					// this.getView().byId("idEvent").setValue(oModel.EventId);
					// this.getView().byId("idDrive").setValue(oModel.DriveId);
					// this.getView().byId("idStatus").setValue(oModel.status);


				}

			}

		},

		onClearScreen: function() {
			// alert("Hello");
			this.getView().byId("idCourseId").setValue("");
			this.getView().byId("idCourseId").setEnabled(true);
			this.getView().byId("batch").setValue("");
			this.getView().byId("batch").setEnabled(true);
			this.getView().byId("idTrainer").setValue("");
			this.getView().byId("idTrainer").setEnabled(true);
			this.getView().byId("idStartTime").setValue("");

			this.getView().byId("idEndTime").setValue("");
			this.getView().byId("idDemoDate").setValue("");
			this.getView().byId("idStartDate").setValue("");
			this.getView().byId("idStartDate").setEnabled(true);
			this.getView().byId("idEndDate").setValue("");
			this.getView().byId("idFee").setValue("");
			this.getView().byId("idStatus").setValue("");
			this.getView().byId("idWeekend").setSelected("");
			this.getView().byId("idChkBtcHid").setSelected("");


		},

		onBatchSelect: function() {
			this.flag = "batchid";
			this.getCustomerPopup();
			var title = this.getView().getModel("i18n").getProperty("batch");
			this.searchPopup.setTitle(title);
			this.searchPopup.bindAggregation("items", {
				path: "/Courses",
				template: new sap.m.DisplayListItem({
					label: "{BatchNo}",
					value: "{StartTime}"
				})
			});

		},

		onLiveSearch: function(oEvent) {
			//updated
			var queryString = oEvent.getParameter("query");
			if (!queryString) {
				queryString = oEvent.getParameter("value");
			}

			if (oEvent.getSource().getTitle() === this.getView().getModel("i18n").getProperty("course")) {
				if (queryString) {
					var oFilter1 = new sap.ui.model.Filter("courseName", sap.ui.model.FilterOperator.Contains, queryString);

					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1],
						and: false
					});
					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);
				} else {
					this.searchPopup.bindAggregation("items", {
						path: "local>/courses",
						template: new sap.m.DisplayListItem({
							label: "{local>courseName}"
						})
					});
					this.searchPopup.getBinding("items").filter([]);
				}

			}
			if (oEvent.getSource().getTitle() === this.getView().getModel("i18n").getProperty("batch")) {
				if (queryString) {
					var oFilter1 = new sap.ui.model.Filter("BatchNo", sap.ui.model.FilterOperator.Contains, queryString);

					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1],
						and: false
					});
					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);
				} else {
					this.searchPopup.bindAggregation("items", {
						path: "local>/Courses",
						template: new sap.m.DisplayListItem({
							label: "{local>BatchNo}",
							value: "{local>StartTime}"
						})
					});
					this.searchPopup.getBinding("items").filter([]);
				}

			}

				if (oEvent.getSource().getTitle() === "Trainer Name") {
					if (queryString) {
						var oFilter1 = new sap.ui.model.Filter("FirstName", sap.ui.model.FilterOperator.Contains, queryString);
						var oFilter2 = new sap.ui.model.Filter("LastName", sap.ui.model.FilterOperator.Contains, queryString);
						var oFilter = new sap.ui.model.Filter({
							filters: [oFilter1, oFilter2],
							and: false
						});
						var aFilter = [oFilter];
						this.searchPopup.getBinding("items").filter(aFilter);
					} else {
						this.searchPopup.bindAggregation("items", {
							path: "local>/Trainers",
							template: new sap.m.DisplayListItem({
								label: "{FirstName} {LastName}",
								value: "{city}"
							})
						});
						this.searchPopup.getBinding("items").filter([]);
					}

				}
		}

	});
});
