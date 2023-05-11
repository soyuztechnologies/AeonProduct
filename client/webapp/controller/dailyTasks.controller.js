sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/routing/RouteMatchedHandler",
	'sap/ui/Device'

], function(Controller, Filter, FilterOperator, Route, Devise) {
	"use strict";
	return Controller.extend("oft.fiori.controller.dailyTasks", {
		allMasterData:{
			"Tasks":[]
		},

		onInit: function() {
			var oDt = this.getView().byId("idCoDate1");
			oDt.setDateValue(new Date());
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.attachRoutePatternMatched(this.herculis, this);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				this.getView().byId("idUser").setText(loginUser);
			}
			// ---------------Sreedhara------------------------PIE chart
			debugger;
			var that = this;
			var oDt = that.getView().byId("idCoDate1");

			// var oChart = that.getView().byId("idVizFrame");
			// var vizPopover = new sap.viz.ui5.controls.Popover({});
			// oChart.connect(vizFrame.getVizUid());
			// oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
			$.post('/getWorkAggregate', {currentDate: oDt.getDateValue(), userId: currentUser})
			.done(function(data, status) {
				// console.log(data);
				//you write code to render chart based on masterData
				var oPieChartModel = new sap.ui.model.json.JSONModel();
				oPieChartModel.setData({
					PieData: data
				});
				debugger;
				for (var i = 0; i < data.length; i++){

					if ( data[i].taskType === 'GB' ) {
						data[i].taskType = 'Google Business Post';
					}
					if ( data[i].taskType === 'LP' ) {
						data[i].taskType = 'Linkedin Post';
					}
					if ( data[i].taskType === 'FP' ) {
						data[i].taskType = 'Facebook Post';
					}
					if ( data[i].taskType === 'TW' ) {
						data[i].taskType = 'Tweets';
					}
					if ( data[i].taskType === 'ST' ) {
						data[i].taskType = 'SEO Tools MR,GSA';
					}
					if ( data[i].taskType === 'AB' ) {
						data[i].taskType = 'Anu Bot';
					}
					if ( data[i].taskType === 'CK' ) {
						data[i].taskType = 'Competitor Kill';
					}
					if ( data[i].taskType === 'CI' ) {
						data[i].taskType = 'Customer Interaction Calls/Mails';
					}
					if ( data[i].taskType === 'PT' ) {
						data[i].taskType = 'Pinetrust Post';
					}
					if ( data[i].taskType === 'SW' ) {
						data[i].taskType = 'SAP Server Work';
					}
					if ( data[i].taskType === 'WD' ) {
						data[i].taskType = 'Website Development';
					}
					if ( data[i].taskType === 'WR' ) {
						data[i].taskType = 'Website Review posts';
					}
					if ( data[i].taskType === 'TR' ) {
						data[i].taskType = 'Trainings';
					}
					if ( data[i].taskType === 'TM' ) {
						data[i].taskType = 'Team Meeting';
					}
					if ( data[i].taskType === 'TE' ) {
						data[i].taskType = 'Team Event';
					}
					if ( data[i].taskType === 'SE' ) {
						data[i].taskType = 'Self Learning';
					}
					if ( data[i].taskType === 'OT' ) {
						data[i].taskType = 'Others';
					}
					}
				that.getView().setModel(oPieChartModel, "PieChartModel");
         debugger;

   		})
			.fail(function(xhr, status, error) {

			});


			// ---------------Sreedhara------------------------
			// this.setTaskModel();

			// var oJSONModel = this.chartDataModel();
			// this.getView().setModel(oJSONModel, "chart");
			// debugger;
		},

		// chartDataModel : function() {
		// 	var masterData = {
		// 		tasks1 : [
		// 			{
		// 				// "CrDate": "2019-12-20T04:20:29.561Z",
		// 				// "taskWorkedOn": "string",
		// 				"taskType": "string",
		// 				// "remarks": "string",
		// 				// "link": "string",
		// 				"noOfHours": "string",
		// 				// "CreatedOn": "null",
		// 				// "CreatedBy": "string",
		// 				// "ChangedOn": "null",
		// 				// "ChangedBy": "null",
		// 				// "id": "string"
		// 			}
		// 		]
		// 	};
		// 	var aCourses = [];
		// 	var oJsonModel = new sap.ui.model.json.JSONModel();
		// 	this.ODataHelper.callOData( this.getOwnerComponent().getModel(), "/tasks", "GET", {}, {}, this)
		// 	.then(function(oData){
		// 		var oRes;
		// 		var aChartData = {
		// 			tasks1 : [
		// 				{	"taskType": "",
		// 					"noOfHours": "",
		// 				}
		// 			]
		// 		};
		// 		for(var i = 0; i < oData.results.length; i++){
		// 			oRes = oData.results[i];
		// 			debugger;
		//
		// 			// aChartData.tasks1[i].taskType = oRes.taskType;
		// 			// aChartData.tasks1[i].noOfHours = oRes.noOfHours;
		//
		// 			aChartData.tasks1[i].push({taskType: oRes.taskType});
		// 			aChartData.tasks1[i].push({noOfHours: oRes.noOfHours});
		// 		}
		// 		oJsonModel.setData(oData);
		// 		return oJsonModel;
		// 	}).catch(function(oError) {
		// 		// var oPopover = this.getErrorMessage(oError);
		// 	}); return oJsonModel;
		// },
		// ---------------Sreedhara------------------------

		// ---------------Sreedhara------------------------
		// setTaskModel:function(oTt){
		// 	debugger;
		// 	var aData = {
		// 		tasks : [
		// 			{
		// 				taskType:"TWITTER",
		// 				noOfHours : 40
		// 			},
		// 			{
		// 				taskType:"CCK",
		// 				noOfHours : 45
		// 			},
		// 			{
		// 				taskType:"FB",
		// 				noOfHours : 65
		// 			},
		// 			{
		// 				taskType:"TR",
		// 				noOfHours : 35
		// 			}
		// 		]
		// 	}
		// 	var oTaskTrac = new sap.ui.model.json.JSONModel();
		// 	oTaskTrac.setData(aData);
		// 	this.setModel(oTaskTrac, "TaskTrac");
		// 	// oTaskTrac.setData({"Ltask":[]});
		// 	// this.setModel(oTaskTrac, "TaskTrac");
		// 	// this.getView().getModel().read("/tasks",{
		// 	// 	   success: function(data){
		// 	// 		 this.getView().getModel("TaskTrac").setProperty("/Ltask", data.results);
		// 	// 	}, error: function(){}
		// 	// });
		// },
		// ---------------Sreedhara------------------------



		herculis:function(){
			this.getView().byId("idCoDate1").setDateValue(new Date());
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

		reloadTasks: function(oEvent) {
			var role=this.getModel("local").getProperty("/Role");

			this.getView().byId("idCoTable").bindItems({
				path:"/tasks",
				template: new sap.m.ColumnListItem({
					cells: [
						new sap.m.Text({text: "{taskWorkedOn}"}),
						new sap.m.Text({text: { path: 'CrDate', type:'sap.ui.model.type.Date', formatOptions:{ pattern:'dd.MM.YYYY' } }}),
						new sap.m.Text({text: {path: 'taskType',
						formatter: '.formatter.getTaskText'}}),
						new sap.m.Text({text: "{noOfHours}"}),
						new sap.m.Link({text: { path: 'link'}}),
						new sap.m.Button({text: "Delete", icon: "sap-icon://delete", press: [this.onDelete, this]})
					]
				})
			});
			if(role=='Admin'){
				var filters = [
					new sap.ui.model.Filter(
						"CrDate",
						sap.ui.model.FilterOperator.BT,
						this.fromDate,
						this.toDate
					)];
					// new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.EQ,this.fromDate)];
					this.getView().byId("idCoTable").getBinding("items").filter(filters);
				}
				else {
					this.getView().byId("idUser").setVisible(true); //Sreedhara false -> true
					var filters = [new sap.ui.model.Filter(
						'CreatedBy',
						'EQ',
						"'" + this.currentUser + "'"
					),
					new sap.ui.model.Filter(
						"CrDate",
						sap.ui.model.FilterOperator.BT,
						this.fromDate,
						this.toDate
					)];
					// new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.EQ,this.fromDate)];
					this.getView().byId("idCoTable").getBinding("items").filter(filters);
				}
				// new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.EQ, this.fromDate)];

				//=====sreedhara============================ for chart control//
				// this.getView().byId("idVizFrame").getBinding("items");
				//=====sreedhara============================//
			},

			onUpdateFinished:function(oEvent){

				var oTable= oEvent.getSource();
				var oTableItem = oTable.getItems();
				var noItems=oTableItem.length;
				var cell;
				var rows =this.getView().byId("idCoTable").getBinding("items").getLength();
				var oBinding =this.getView().byId("idCoTable").getBinding("items");
				var total = 0;
				for (var i = 0; i < rows; i++) {
					// total = total + parseFloat(oBinding.getContexts()[i].oModel.getProperty(oBinding.getContexts()[i].sPath).noOfHours).toFixed(2);
					total = total + parseFloat(oBinding.getContexts()[i].oModel.getProperty(oBinding.getContexts()[i].sPath).noOfHours);
				}
				this.getView().byId("idTxt").setText("Total number of tasks are " + oBinding.getLength() + " and Total number of hours worked are " + total + "");

				// ---------------Sreedhara---PIE chart update after save the taskin the view-----------
				var currentUser = this.getModel("local").getProperty("/CurrentUser");
				var that = this;debugger;
				var oDt = that.getView().byId("idCoDate1");
				$.post('/getWorkAggregate', {currentDate: oDt.getDateValue(), userId: currentUser})
				.done(function(data, status) {
					// console.log(data);

					//you write code to render chart based on masterData

					var oPieChartModel = new sap.ui.model.json.JSONModel();;
					oPieChartModel.setData({
						PieData: data
					});
					for (var i = 0; i < data.length; i++){

						if ( data[i].taskType === 'GB' ) {
							data[i].taskType = 'Google Business Post';
						}
						if ( data[i].taskType === 'LP' ) {
							data[i].taskType = 'Linkedin Post';
						}
						if ( data[i].taskType === 'FP' ) {
							data[i].taskType = 'Facebook Post';
						}
						if ( data[i].taskType === 'TW' ) {
							data[i].taskType = 'Tweets';
						}
						if ( data[i].taskType === 'ST' ) {
							data[i].taskType = 'SEO Tools MR,GSA';
						}
						if ( data[i].taskType === 'AB' ) {
							data[i].taskType = 'Anu Bot';
						}
						if ( data[i].taskType === 'CK' ) {
							data[i].taskType = 'Competitor Kill';
						}
						if ( data[i].taskType === 'CI' ) {
							data[i].taskType = 'Customer Interaction Calls/Mails';
						}
						if ( data[i].taskType === 'PT' ) {
							data[i].taskType = 'Pinetrust Post';
						}
						if ( data[i].taskType === 'SW' ) {
							data[i].taskType = 'SAP Server Work';
						}
						if ( data[i].taskType === 'WD' ) {
							data[i].taskType = 'Website Development';
						}
						if ( data[i].taskType === 'WR' ) {
							data[i].taskType = 'Website Review posts';
						}
						if ( data[i].taskType === 'TR' ) {
							data[i].taskType = 'Trainings';
						}
						if ( data[i].taskType === 'TM' ) {
							data[i].taskType = 'Team Meeting';
						}
						if ( data[i].taskType === 'TE' ) {
							data[i].taskType = 'Team Event';
						}
						if ( data[i].taskType === 'SE' ) {
							data[i].taskType = 'Self Learning';
						}
						if ( data[i].taskType === 'OT' ) {
							data[i].taskType = 'Others';
						}
						}
					that.getView().setModel(oPieChartModel, "PieChartModel");
					})
				.fail(function(xhr, status, error) {

				});

				// ---------------Sreedhara------------------------
			},


			onDateChange: function(oEvent) {

				var role = this.getModel("local").getProperty("/Role");
				var dDateStart = oEvent.getSource().getProperty('dateValue');

				//=======================sreedhara==Commented==========================//
				// var oDatePicker = oEvent.getSource();
				// var oNewDate = oDatePicker.getDateValue();
				// var oFormatDate = sap.ui.core.format.DateFormat.getDateTimeInstance({
				// 	pattern: "yyyy-MM-ddTHH:mm:ss Z"
				// });
				// var oDate = oFormatDate.format(oNewDate);
				// oDate = oDate.split("T");
				// var oDateActual = oDate[0];
				// oDatePicker.setDateValue(new Date(oDateActual));
				// var dDateStart = oDatePicker.getDateValue();
				//
				// if(role=='Admin'){
				// 	var oFilter1 = new Filter([
				// 		new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.EQ, dDateStart)], true);
				// 		this.getView().byId("idCoTable").getBinding("items").filter(oFilter1,true);
				// }
				// else{
				// 	var oFilter1 = new Filter([
				// 		new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.EQ, dDateStart)
				// 	], true);
				//
				// 	var oFilter2 = new Filter([
				// 		new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + this.currentUser + "'")
				// 	], true);
				//
				// 	var oFilter = new sap.ui.model.Filter({
				// 		filters: [oFilter1, oFilter2],
				// 		and: true
				// 	});
				// 	this.getView().byId("idCoTable").getBinding("items").filter(oFilter, true);
				// }

				//=======================sreedhara============================//

				var dDateStart = oEvent.getSource().getProperty('dateValue');
				var dDateEnd = new Date(dDateStart + 1);
				var oFilter = [];
				var oFilter1 = null;
				var oFilter2 = null;
				dDateStart.setMilliseconds(0);
				dDateStart.setSeconds(0);
				dDateStart.setMinutes(0);
				dDateStart.setHours(0);
				dDateEnd.setMilliseconds(0);
				dDateEnd.setSeconds(59);
				dDateEnd.setMinutes(59);
				dDateEnd.setHours(23);
				if(role=='Admin'){
					// oFilter1 = new Filter([
					// 	new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.BT, dDateStart, dDateEnd)], true);
					// oFilter = new sap.ui.model.Filter({ filters: [oFilter1]	});
					// this.getView().byId("idCoTable").getBinding("items").filter(oFilter,true);
					var filters =	new sap.ui.model.Filter("CrDate",'BT', dDateStart, dDateEnd);
					this.getView().byId("idCoTable").getBinding("items").filter(filters, true);
				}
				else {
					var filters = [new sap.ui.model.Filter( "CreatedBy", 'EQ', "'" + this.currentUser + "'"	),
					new sap.ui.model.Filter(	"CrDate",	sap.ui.model.FilterOperator.BT,
					dDateStart,	dDateEnd )
				];
				this.getView().byId("idCoTable").getBinding("items").filter(filters, true);
			}
			//=====sreedhara============================//
		},

		onDelete: function(oEvent) {

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

			var that = this;
			var myData = this.getView().getModel("local").getProperty("/task");
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd"});

				myData.taskWorkedOn = this.getView().byId("idWOn").getValue();
				if (this.getView().byId("idWH").getValue() <= '8'){
					if (this.getView().byId("idWH").getValue() != '0'){
						myData.noOfHours = this.getView().byId("idWH").getValue();
						var oDatePicker = this.getView().byId("idCoDate1");
						var oNewDate = oDatePicker.getDateValue();
						//==================sreedhara============================//
						// oNewDate.setMinutes(oNewDate.getMinutes() + oNewDate.getTimezoneOffset());
						//===================sreedhara============================//

						oDatePicker.setDateValue(new Date(oNewDate));
						myData.CrDate = oDatePicker.getDateValue();
						myData.taskType = this.getView().byId("idTaskType").getSelectedKey();
						myData.link = this.getView().byId("idLink").getValue();
						myData.remarks = "";

						this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/tasks",
						"POST", {}, myData, this)
						.then(function(oData) {
							that.getView().setBusy(false);
							sap.m.MessageToast.show("Data Saved Successfully");
							//=======================sreedhara============================//
							var dDateStart = oNewDate;
							var dDateEnd = new Date(dDateStart + 1);
							dDateStart.setMilliseconds(0);
							dDateStart.setSeconds(0);
							dDateStart.setMinutes(0);
							dDateStart.setHours(0);
							dDateEnd.setMilliseconds(0);
							dDateEnd.setSeconds(59);
							dDateEnd.setMinutes(59);
							dDateEnd.setHours(23);
							var role = that.getModel("local").getProperty("/Role");
							if(role=='Admin'){

								var filters =	new sap.ui.model.Filter("CrDate",'BT', dDateStart, dDateEnd);
								that.getView().byId("idCoTable").getBinding("items").filter(filters, true);

								// var filters = [	new sap.ui.model.Filter( "CrDate", sap.ui.model.FilterOperator.BT,
								//                                          that.fromDate, that.toDate)];
								// that.getView().byId("idCoTable").getBinding("items").filter(filters, true);
							}
							else {
								// that.getView().byId("idUser").setVisible(false);
								var filters = [new sap.ui.model.Filter("CreatedBy",sap.ui.model.FilterOperator.EQ, "'" + that.currentUser + "'"	),
								new sap.ui.model.Filter("CrDate", sap.ui.model.FilterOperator.BT,
								dDateStart, dDateEnd)
							];

							that.getView().byId("idCoTable").getBinding("items").filter(filters, true);
						}

						//=====sreedhara============================//

					}).catch(function(oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});
				}else{(sap.m.MessageToast.show("Hour with zero value not allowed"))};
			}else{(sap.m.MessageToast.show("Hour greater that 8 value not allowed"))};
		}
	});
});
