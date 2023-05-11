sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter"
], function(Controller, MessageBox, MessageToast, Formatter, Filter) {
	"use strict";
	return Controller.extend("oft.fiori.controller.leaveApproval", {

		onInit: function() {
				debugger;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				this.getView().byId("idUser").setText(loginUser);
			}
	},

onBeforeRendering: function(){
},
		onBack: function() {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		formatDates: function(oDate1,oDate2){
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd.MM.YYYY" });
			var oDate1Ret = dateFormat.format(oDate1);
			var oDate2Ret = dateFormat.format(oDate2);
			return oDate1Ret + " - " + oDate2Ret;
		},
		onSend: function(sType,sId, days){
			var userName = this.getModel("local").getProperty("/AppUsers")[sId].UserName;
			var MobileNo = this.getModel("local").getProperty("/AppUsers")[sId].MobileNo;
			var loginPayload = {};
			loginPayload.msgType =  sType;
			loginPayload.userName =  userName;
			loginPayload.requested =   days ;
			loginPayload.balance =  "?";
			loginPayload.Number =  MobileNo;
			$.post('/requestMessage', loginPayload)
				.done(function(data, status) {
					sap.m.MessageToast.show("Message sent successfully");
				})
				.fail(function(xhr, status, error) {
					//that.passwords = "";
					sap.m.MessageBox.error(xhr.responseText);
				});
		},
		onApprove: function(oEvent){
			debugger;
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var record =  oEvent.getSource().getModel().getProperty(sPath);
			var that = this;
			var payload3 = {
				"Status": "Approved"
			};
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "PUT", {}, payload3, this)
				.then(function(oData) {
					MessageToast.show("The Leave request has been approved");
					var oKey=that.getView().byId("idEmployee").getSelectedKey();
					that.reloadLeaves();
					that.onSend("leaveApproved",record.AppUserId,record.Days);
					if(oKey){
						  that.getView().byId("pendingLeaveTable").getBinding("items").filter([
							new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + oKey + "'"),
							new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Not Approved')
					]);
					that.getView().byId("approvedLeaveTable").getBinding("items").filter([
					  new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + oKey + "'"),
						 new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Approved')
					]);
					debugger;
					}
					else {

				}
					///send sms
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);

				});

		},
		onDelete: function(oEvent){
			debugger;
			var that = this;
			var outSider = oEvent;
				var oKey=that.getView().byId("idEmployee").getSelectedKey();
			var deletePath = oEvent.getSource().getParent().getBindingContextPath();
			MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
				if (conf == 'OK') {
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), deletePath,
								"DELETE", {}, {}, that)
							.then(function(oData) {
								sap.m.MessageToast.show("Deleted succesfully");
								that.reloadLeaves();
								if(oKey){
									  that.getView().byId("pendingLeaveTable").getBinding("items").filter([
										new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + oKey + "'"),
										new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Not Approved')
								]);
								that.getView().byId("approvedLeaveTable").getBinding("items").filter([
								  new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + oKey + "'"),
									 new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Approved')
								]);

								}
								else {

							}
							}).catch(function(oError) {
								that.getView().setBusy(false);
								that.oPopover = that.getErrorMessage(oError);
								that.getView().setBusy(false);
							});
				}
			}, "Confirmation");

		},
		onReject: function(oEvent){
			debugger;
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var record =  oEvent.getSource().getModel().getProperty(sPath);
			var that = this;
			var payload3 = {
				"Status": "Rejected"
			};
			var oKey=that.getView().byId("idEmployee").getSelectedKey();
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), sPath, "PUT", {}, payload3, this)
				.then(function(oData) {
					MessageToast.show("The Leave request has been Rejected");
					that.reloadLeaves();
					that.onSend("leaveReject",record.AppUserId,record.Days);
					if(oKey){
							that.getView().byId("pendingLeaveTable").getBinding("items").filter([
							new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + oKey + "'"),
							new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Not Approved')
					]);
					that.getView().byId("approvedLeaveTable").getBinding("items").filter([
						new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + oKey + "'"),
						 new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Approved')
					]);
					}
					else {

				}
					///send sms
				}).catch(function(oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);

				});

		},
		currentUser:"",
		techId:"",
		getName: function(userId){
			if(userId){
					return this.getModel("local").oData.AppUsers[userId].UserName;
			}
		},
		herculis: function(oEvent) {
				debugger;
				if(oEvent.getParameter("name") !== "leaveApproval"){
					return;
				}
				this.currentUser = this.getModel("local").getProperty("/CurrentUser");
				this.reloadLeaves();

				this.getView().byId("idEmployee").setValue("");
				this.getView().byId("idEmployee").setSelectedKey("");

			},
			onRefresh:function(){
				debugger;
				var that=this;
				var oKey=that.getView().byId("idEmployee").getSelectedKey();
				that.reloadLeaves();
				if(oKey){
						that.getView().byId("pendingLeaveTable").getBinding("items").filter([
						new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + oKey + "'"),
						new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Not Approved')
				]);
				that.getView().byId("approvedLeaveTable").getBinding("items").filter([
					new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + oKey + "'"),
					 new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Approved')
				]);

				}
				else {

			}

			},
			onSelect: function(oEvent){
				debugger;
           var techId=oEvent.getSource().getSelectedKey();

					 this.reloadLeaves();
				  	this.getView().byId("pendingLeaveTable").getBinding("items").filter([
						 new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + techId + "'"),
						 new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Not Approved')
					]);
					this.getView().byId("approvedLeaveTable").getBinding("items").filter([
						new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Approved'),
					  new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.EQ, "'" + techId + "'")
					]);

			},
	  reloadLeaves: function(){
			debugger;
			this.getView().byId("pendingLeaveTable").bindItems({
				path: "/LeaveRequests",
				template: new sap.m.ColumnListItem({
					cells: [new sap.m.Text({text: {
										path : 'AppUserId',
										formatter: this.getName.bind(this)
									}}),
									new sap.m.Text({text: {
										parts: [{path: 'DateFrom'},{path: 'DateTo'}],
										formatter: this.formatDates
									}}),
									new sap.m.Text({text: "{Days}"}),
									new sap.m.Button({text: "Approve", press: [this.onApprove, this]}),
									new sap.m.Button({text: "Reject", press: [this.onReject, this]})
								]
				})
			});
			this.getView().byId("pendingLeaveTable").getBinding("items").filter([
				new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Not Approved'),
				new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.NE, "'" + this.currentUser + "'")
			]);
			this.getView().byId("approvedLeaveTable").bindItems({
				path: "/LeaveRequests",
				template: new sap.m.ColumnListItem({
					cells: [new sap.m.Text({text: {path : 'AppUserId', formatter: this.getName.bind(this)}}),
									new sap.m.Text({text: {
										parts: [{path: 'DateFrom'},{path: 'DateTo'}],
										formatter: this.formatDates
									}}),
									new sap.m.Text({text: "{Days}"}),
									new sap.m.Button({text: "Delete", press: [this.onDelete, this]})
								]
				})
			});
			this.getView().byId("approvedLeaveTable").getBinding("items").filter([
				 new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, 'Approved'),
				 new sap.ui.model.Filter("AppUserId", sap.ui.model.FilterOperator.NE, "'" + this.currentUser + "'")
			]);

		},
		onUpdateFinished:function(oEvent){
			debugger;
		var oTable = this.getView().byId("pendingLeaveTable");
     if(oTable.getBinding("items").isLengthFinal()) {
				 var ocnt = oTable.getItems().length;
		 }
	 this.getView().byId("pendingIcon").setCount(ocnt);
		var oTable1 = this.getView().byId("approvedLeaveTable");
     if(oTable1.getBinding("items").isLengthFinal()) {
				 var ocnt1 = oTable1.getItems().length;
		 }
	 this.getView().byId("approveIcon").setCount(ocnt1);
		},
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
			onAfterRendering: function() {

				// var currentUser = this.getModel("local").getProperty("/CurrentUser");
				// if (currentUser) {
				// 	var loginUser = this.getModel("local").oData.AppUsers[currentUser].TechnicalId;
				// 		this.getView().byId("idEmployee").removeItem(loginUser);
				}



		/*
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf oft.fiori.view.View2
		 */
		//	onExit: function() {
		//
		//	}

	});

});
