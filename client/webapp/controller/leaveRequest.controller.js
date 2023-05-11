sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, MessageToast, Formatter, Filter) {
	"use strict";
	return Controller.extend("oft.fiori.controller.leaveRequest", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		 date: new Date(),
		 startDate: new Date(new Date().getFullYear(), 0, 1),
		 endDate:new Date(new Date().getFullYear(), 11, 31),
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
					if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				this.getView().byId("idUser").setText(loginUser);
				var date = new Date();
				debugger;
				var dateFilter = new Date(date.getFullYear(), 0, 1);
				this.getModel("local").setProperty("/newLeaveRequest/Datefilter",dateFilter);
				this.getModel("local").setProperty("/LeaveStatic/DateFrom", this.getModel("local").getProperty("/JoiningDate"));
				this.getModel("local").setProperty("/LeaveStatic/DateTo",this.endDate);
				this.getModel("local").setProperty("/LeaveStatic/TotalQuota", this.getModel("local").getProperty("/LeaveQuota"));

		}
	},
onBeforeRendering: function(){
},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},

		herculis: function(oEvent) {
			if(oEvent.getParameter("name") !== "leaveRequest"){
				return;
			}
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
		//				this.getView().byId("idUser").setText(loginUser);
		//			get details of all leaves submitted by the user
		 var vFilterAct1 = new sap.ui.model.Filter("DateFrom", "GT", this.startDate);
		 var vFilterAct2 = new sap.ui.model.Filter("DateTo", "LT", this.endDate);
			 var that = this;
				var payload = {};
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/AppUsers('" + currentUser + "')/leaveRequests","GET",{
					filters:[vFilterAct1, vFilterAct2],
					and: true
				},payload,this)
				.then(function(oData){
					if (oData.results.length != 0) {
						var AppId = "";
						var Appuser = "";
						var countApproved = 0;
						var countPending = 0;
						var countFull = 0;
						var countHalf = 0;
						var status ="";
						var leaveType = "";
						that.getView().getModel("local").setProperty("/LeaveRequests", oData.results);
						var oModel = that.getView().getModel("local").getProperty("/LeaveRequests");
							for(var i =0 ;i < oData.results.length; i++){

								AppId = oModel[i].ApproverId;
								if (AppId==="") {
									Appuser = that.getView().getModel("local").oData.AppUsers[oData.results[0].ApproverId].UserName;
									oModel[i].ApproverId = Appuser;
								}else {
									oModel[i].ApproverId = " ";
								}
								status = oModel[i].Status;
								leaveType = oModel[i].LeaveType;
								if(status === "Approved"){
									switch (leaveType) {
										case "Full Day":
											countFull = countFull + parseInt(oModel[i].Days);
											break;
										case "Half Day":
											countHalf = countHalf + parseFloat(oModel[i].Days);
											break;

									}
								}
							}
//					Here set the values to Static model
						var oStModel = that.getView().getModel("local");
						oStModel.setProperty("/LeaveStatic/FullConsumed", countFull);
						oStModel.setProperty("/LeaveStatic/HalfConsumed", countHalf);
						var left = parseInt(that.getModel("local").getProperty("/LeaveQuota")) - (parseFloat(countFull) + parseFloat(countHalf));
						oStModel.setProperty("/LeaveStatic/Available",left);
					}
					else{
					}
				}).catch(function(oError){
				});
		}
		},
			onCreateLeave: function(oEvent){
				this.oRouter.navTo("createLeave");

		},
		indexDel:"",
		onDelete:function(oEvent){
			var sPath = oEvent.getSource().getBindingContext("local").getPath();
			var that = this;
			that.indexdel = sPath;
			MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
				if (conf == 'OK') {
					var leaveId = that.getView().getModel("local").getProperty(sPath).id;
					var delitem = "/LeaveRequests('" + leaveId + "')";
//					"/AppUsers('5d51864fe11144c5d0be90c0')"

						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), delitem, "DELETE", {}, {}, that)
							.then(function(oData) {
								that.getView().setBusy(false);
								debugger;
								var oSplit = that.indexdel.split('/');
								var oIndex = oSplit[oSplit.length - 1];
//								var oIndex = parseInt(that.indexdel.substring(that.indexdel.lastIndexOf('/') +1));
								that.indexDel=null;
								var oTable = that.getView().byId("idTable2");
								var m = oTable.getModel("local");
				       	var data = m.getProperty("/LeaveRequests");
				       	var removed = data.splice(oIndex, 1);
				       	m.setProperty("/LeaveRequests",data);
								var countApproved = 0;
								var countPending = 0;
								var countFull = 0;
								var countHalf = 0;
								var status ="";
								var leaveType = "";
								//Here re adjust the Summary Table
								for(var i=0; i<data.length; i++){

									 status = data[i].Status;
									 leaveType = data[i].LeaveType;
									switch (leaveType) {
										case "Full Day":
											countFull = countFull + parseInt(data[i].Days);
											break;
										case "Half Day":
											countHalf = countHalf + parseFloat(data[i].Days);
											break;
										}

								}
								var oStModel = that.getView().getModel("local");
								oStModel.setProperty("/LeaveStatic/FullConsumed", countFull);
								oStModel.setProperty("/LeaveStatic/HalfConsumed", countHalf);
								var left = 21 - (parseFloat(countFull) + parseFloat(countHalf));
								oStModel.setProperty("/LeaveStatic/Available",left);
								sap.m.MessageToast.show("Deleted succesfully");

							}).catch(function(oError) {
								that.getView().setBusy(false);
								that.oPopover = that.getErrorMessage(oError);
								that.getView().setBusy(false);
							});


				}
			}, "Confirmation");

		},
		onSend:function(oEvent){
			var oLocal = oEvent;
			var that = this;
			that.getView().setBusy(true);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var leadData = this.getView().getModel("local").getProperty("/newLeaveRequest");
			if (leadData.DateFrom >  leadData.DateTo){
			that.getView().setBusy(false);
			sap.m.MessageBox.error("Date From Cannot be greater than Date To");
			return;
			}
			var payload ={
				"AppUserId": currentUser,
				 "DateFrom": leadData.DateFrom,
				 "DateTo": leadData.DateTo,
				 "Days": 1,
				 "LeaveType":"Full Day",
				 "Status": "Not Approved",
				 "ApproverId": "get the id of Approver",
				 "ApprovedOn": new Date(),
				 "RequestedOn": new Date(),
				 "Remarks": leadData.Remarks,
				 "ChangedOn": new Date(),
				 "ChangedBy": "get the id of user"
			};
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/LeaveRequests","POST",{},
				payload, this)
				.then(function(oData){
					that.getView().setBusy(false);
					sap.m.MessageToast.show("Leave Request send for Approval");
					that.destroyMessagePopover();



				}).catch(function(oError){
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});


		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
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
