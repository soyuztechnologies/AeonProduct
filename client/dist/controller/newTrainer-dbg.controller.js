var oGuid;
sap.ui.define(["oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter"
], function (Controller, MessageBox, MessageToast, Formatter, Filter) {
	"use strict";

	return Controller.extend("oft.fiori.controller.newTrainer", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		oSorter: null,
		formatter: Formatter,
		simpleForm: null,
		endDate: null,
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);
			var that = this;

		},
		onBack: function () {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		onEmailChange: function(oEvent) {
			var sEmail = oEvent.getParameter("newValue")
			if(sEmail){
				var oRegExp = /\S+@\S+\.\S+/;
				var bValid = oRegExp.test(sEmail);
				oEvent.getSource().setValueState(bValid ? "Success" : "Error");
			}else{
				oEvent.getSource().setValueState("None")
			}
		},
		onUpdateFinished: function (oEvent) {
			var itemList = this.getView().byId("serverTable").getItems();
			if (itemList[this.selIndex - 1]) {
				var vStudent = itemList[this.selIndex - 1].getCells()[2].getText();
				var oStudentId = 'Students(\'' + vStudent + '\')';
				var vModel = this.getView().getModel().oData[oStudentId];
				itemList[this.selIndex - 1].getCells()[2].setText(vModel.GmailId);
			}
		},
		onPressAdd: function(){
			var trainerModel = this.getView().getModel("local").getProperty("/TrainerModel");
			trainerModel.Courses.push({
				CourseName: null,
				FeeMode: null,
				FeeAmount: null,
				Active: true
			});
			this.getView().getModel("local").setProperty("/TrainerModel", trainerModel);
		},
		onPressDeleteRow: function(oEvent){
			var	selected = oEvent.getSource().getParent().getParent().getSelectedContextPaths();
			var selectedIndex = [];
			selected.forEach(item=>{
				selectedIndex.push(parseInt(item.split('/')[3]));
			});
			selectedIndex.sort((a, b) => b - a);
			var courses = this.getView().getModel("local").getProperty("/TrainerModel/Courses");
			selectedIndex.forEach(item=>{
				courses.splice(item,1);
			});
			this.getView().getModel("local").setProperty("/TrainerModel/Courses", courses);
			oEvent.getSource().getParent().getParent().removeSelections();
		},
		onSave: function () {
			//TODO: Save to Coustomer Reg. table
			if (this.getView().byId("idFirstName").getValue() === "") {
				sap.m.MessageBox.error("FirstName is mandatory");
				return;
			}
			var serverData = this.getView().getModel("local").getProperty("/newTrainer");
			var today = new Date();
			// var payDate = this.getView().byId("payDate").getDateValue();
			// debugger;
			var that = this;
			var trainerModel = this.getView().getModel("local").getProperty("/TrainerModel");
			this.getView().setBusy(true);
			var payload = {
				"FirstName": this.getView().byId("idFirstName").getValue().toLocaleUpperCase().toLocaleUpperCase(),
				"LastName": this.getView().byId("idLastName").getValue(),
				"JoiningDate": this.getView().byId("idJoiningDate").getDateValue(),
				"Address": this.getView().byId("idAddress").getValue(),
				"City": this.getView().byId("idCity").getSelectedKey(),
				"Remarks": this.getView().byId("idRemarks").getValue(),
				"ContactNo": this.getView().byId("idContactNo").getValue(),
				"ContactNo1": this.getView().byId("idContactNo1").getValue(),
				"AccountNo": this.getView().byId("idAccountNo").getValue(),
				"AccountName": this.getView().byId("idAccountName").getValue(),
				"IFSCCode": this.getView().byId("idIFSCCode").getValue(),
				"Email": this.getView().byId("idEmail").getValue(),
				"Experience": this.getView().byId("idExperienceYear").getValue()*12+this.getView().byId("idExperienceMonth").getValue()*1,
				"JoiningDate": this.getView().byId("idJoiningDate").getValue(),
				"PartTime": this.getView().byId("idPartTime").getSelected(),
				"SchoolName": this.getView().byId("idSchoolName").getValue(),
				"Courses": trainerModel.Courses ? trainerModel.Courses.filter(item => Boolean(item.CourseName)) : [],
				// "CreatedOn": new Date(),
				// "CreatedBy": 'Menakshi',SoftDelete
				"AccountType": this.getView().byId("idAccountType").getValue(),
				"PANNo": this.getView().byId("idPANNo").getValue(),

				"SoftDelete": this.getView().byId("idSoftDelete").getSelected(),
				// "CreatedOn": this.getView().byId("idCreatedOn").getDateValue(),
				// "CreatedBy": this.getView().byId("idCreatedBy").getValue(),
				// "ChangedOn": this.getView().byId("idChangedOn").getDateValue(),
				// "ChangedBy": this.getView().byId("idChangedBy").getValue(),
				"Update": 'C'
			};

			if (this.flag === "trainerName") {
				// this.getOwnerComponent().getModel().setUseBatch(false);
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Trainers('" + oGuid + "')", "PUT", {},
						payload, this)
					.then(function (oData) {
						sap.m.MessageToast.show("Trainer Updated Successfully");
						that.destroyMessagePopover();
						// that.getView().byId("traierTable").getBinding("items").refresh(true);

						that.getView().setBusy(false);

					}).catch(function (oError) {
						that.getView().setBusy(false);
						that.oPopover = that.getErrorMessage(oError);
						that.getView().setBusy(false);
					});

			}
			else {
				// this.getOwnerComponent().getModel().setUseBatch(false);
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Trainers", "POST", {},
						payload, this)
					.then(function (oData) {
						sap.m.MessageToast.show("New Trainer Created Successfully");
						that.destroyMessagePopover();
						// that.getView().byId("traierTable").getBinding("items").refresh(true);

						that.getView().setBusy(false);

					}).catch(function (oError) {
						that.getView().setBusy(false);
						that.oPopover = that.getErrorMessage(oError);
						that.getView().setBusy(false);
					});

			}


		},
		getAdd8Mon: function (dd) {
			var d = new Date(dd.getValue().substr(6, 4), dd.getValue().substr(3, 2), dd.getValue().substr(0, 2));
			d.setMonth(d.getMonth() + 1);
			var mm = d.getMonth() + 1; //January is 0!
			var yyyy = d.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			var endDate = dd + '.' + mm + '.' + yyyy;
			return endDate;
		},
		onStartChange: function (oEvent) {

			var dateString = oEvent.getSource().getValue();
			var from = dateString.split(".");
			var dateObject = new Date(from[2], from[1] - 1, from[0]);
			var endDate = this.formatter.getIncrementDate(dateObject, 1);

			if (oEvent.getSource().sId == "idSimpleForm--startDate") {
				sap.ui.getCore().byId("idSimpleForm--endDate").setValue(endDate);
				sap.ui.getCore().byId("idSimpleForm--userEndDate").setValue(endDate);
			} else if (oEvent.getSource().sId == "idSimpleFormRe--startDate") {
				sap.ui.getCore().byId("idSimpleFormRe--endDate").setValue(endDate);
				sap.ui.getCore().byId("idSimpleFormRe--userEndDate").setValue(endDate);
			} else {
				this.getView().byId("endDate").setValue(endDate);
				this.getView().byId("userEndDate").setValue(endDate);
			}

		},
		herculis: function (oEvent) {
			// debugger;
			if(oEvent.getParameter("name") !== "newTrainer"){
			return;
			}
			var that = this;

			this.getView().getModel("/Trainers").setProperty("JoiningDate", this.formatter.getFormattedDate(0));
			//this.getView().getModel("local").setProperty("/newTrainer/JoiningDate", this.formatter.getFormattedDate(0));
			//this.getView().getModel("local").setProperty("/newServer/EndDate", this.formatter.getFormattedDate(1));
			//this.getView().getModel("local").setProperty("/newServer/UserEndDate", this.formatter.getFormattedDate(1));

			// var date = new Date();
			// //this.getView().byId("serverTable").getBinding("items").refresh(true);
			// var vFilter1 = new sap.ui.model.Filter("EndDate", "GT", date);
			//
			// var vFilter = new sap.ui.model.Filter({
			// filters: [vFilter1]
			// });
			// var arFilter = [vFilter];
			// this.getView().byId("serverTable").getBinding("items").filter(arFilter);
			// this.getView().byId("accountNo").setSelectedKey("50180025252811");
		},
		searchPopup: null,
		sId: "",
		onSelect: function (oEvent) {
			this.getCustomerPopup();
			this.flag = "trainerName";
			var title = this.getView().getModel("i18n").getProperty("Trainer");
			this.searchPopup.setTitle(title);
			this.searchPopup.bindAggregation("items", {
				path: "/Trainers",
				template: new sap.m.DisplayListItem({
					label: "{FirstName}",
					value: "{LastName}"
				})
			});

		},
		onStudenIdChange: function (oEvent) {
			var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.undefined.sPath;
			sPath = sPath.split("/")[1];
			var oStudentId = this.getView().getModel().oData[sPath].StudentId;
			oStudentId = 'Students(\'' + oStudentId + '\')';
			var oModel = this.getView().getModel().oData[oStudentId];
			if (oModel) {
				var GmailId = oModel.GmailId;
				oEvent.getSource().setText(GmailId);
			}
		},

		onCustomerIdChange: function (oEvent) {
			var sPath = oEvent.getSource().oParent.oParent.oParent.oParent.mObjectBindingInfos.undefined.path;
			sPath = sPath.split("/")[1];
			var oStudentId = this.getView().getModel().oData[sPath].StudentId;
			oStudentId = 'Students(\'' + oStudentId + '\')';
			var oModel = this.getView().getModel().oData[oStudentId];
			if (oModel) {
				if (oEvent.getSource().sId == "idSimpleForm--customerId") {
					sap.ui.getCore().byId("idSimpleForm--customerId").setValue(oModel.GmailId);
					sap.ui.getCore().byId("idSimpleForm--name").setText(oModel.Name);
				} else {
					sap.ui.getCore().byId("idSimpleFormRe--customerId").setValue(oModel.GmailId);
					sap.ui.getCore().byId("idSimpleFormRe--name").setText(oModel.Name);
				}
			}
		},
		onReassign: function (oEvent) {
			this.oDialogPopup.close();
			this.getReasgnPopup();
			var title = this.getView().getModel("i18n").getProperty("serverUpdate");
			this.ReasgnPopup.setTitle(title);
			if (!this.oSimpleFormRe) {
				this.oSimpleFormRe = sap.ui.xmlfragment("idSimpleFormRe", "oft.fiori.fragments.ServerSimpleForm", this);
				// connect dialog to view (models, lifecycle)
				this.getView().addDependent(this.oSimpleFormRe);
				this.ReasgnPopup.addButton(new sap.m.Button({
					text: "Update",
					type: "Accept",
					press: [this.onReUpdate, this]
				}));
				this.ReasgnPopup.addButton(new sap.m.Button({
					text: "Close",
					type: "Reject",
					press: [this.onReClose, this]
				}));
			}

			var oView = this.getView();

			var sPath = oEvent.getSource().getParent().getContent()[0].getBindingContext().sPath;
			this.oSimpleFormRe.bindElement(sPath);
			sap.ui.getCore().byId("idSimpleFormRe--payDate").bindProperty("value", {
				path: 'PaymentDate',
				type: 'sap.ui.model.type.Date',
				formatOptions: {
					pattern: 'dd.MM.YYYY'
				}
			});
			sap.ui.getCore().byId("idSimpleFormRe--serverUId").bindProperty("value", "User");
			// sap.ui.getCore().byId("idSimpleForm--customerId").bindProperty("value","StudentId");
			sap.ui.getCore().byId("idSimpleFormRe--startDate").bindProperty("value", {
				path: 'StartDate',
				type: 'sap.ui.model.type.Date',
				formatOptions: {
					pattern: 'dd.MM.YYYY'
				}
			});
			sap.ui.getCore().byId("idSimpleFormRe--endDate").bindProperty("value", {
				path: 'EndDate',
				type: 'sap.ui.model.type.Date',
				formatOptions: {
					pattern: 'dd.MM.YYYY'
				}
			});
			sap.ui.getCore().byId("idSimpleFormRe--userEndDate").bindProperty("value", {
				path: 'UserEndDate',
				type: 'sap.ui.model.type.Date',
				formatOptions: {
					pattern: 'dd.MM.YYYY'
				}
			});
			sap.ui.getCore().byId("idSimpleFormRe--rdpPass").bindProperty("value", "PassRDP");
			sap.ui.getCore().byId("idSimpleFormRe--passGui").bindProperty("value", "PassSAP");
			sap.ui.getCore().byId("idSimpleFormRe--amount").bindProperty("value", "Amount");
			sap.ui.getCore().byId("idSimpleFormRe--usage").bindProperty("value", "Usage");
			sap.ui.getCore().byId("idSimpleFormRe--freeAccess").bindProperty("selected", "FreeAccess");
			sap.ui.getCore().byId("idSimpleFormRe--extended").bindProperty("selected", "Extended");
			sap.ui.getCore().byId("idSimpleFormRe--Remarks").bindProperty("value", "Remarks");
			sap.ui.getCore().byId("idSimpleFormRe--cid").bindProperty("value", "StudentId");

			sap.ui.getCore().byId("idSimpleFormRe--customerId").attachModelContextChange(this.onCustomerIdChange, this);
			this.ReasgnPopup.addContent(this.oSimpleFormRe);

		},

		cleartrainer: function (oEvent) {
			this.getView().byId("idFirstName").setValue("");
			this.getView().byId("idFirstName").setEnabled(true);
			this.getView().byId("idLastName").setValue("");
			this.getView().byId("idLastName").setEnabled(true);
			this.getView().byId("idJoiningDate").setValue("");
			this.getView().byId("idJoiningDate").setEnabled(true);
			this.getView().byId("idAccountName").setValue("");
			this.getView().byId("idAccountNo").setValue("");
			this.getView().byId("idAccountType").setValue("");
			this.getView().byId("idAddress").setValue("");
			// this.getView().byId("idChangedBy").setValue("");
			// this.getView().byId("idChangedOn").setValue("");
			this.getView().byId("idCity").setValue("");
			this.getView().byId("idContactNo").setValue("");
			this.getView().byId("idContactNo1").setValue("");
			this.getView().byId("idEmail").setValue("");
			this.getView().byId("idExperienceYear").setValue("");
			this.getView().byId("idExperienceMonth").setValue("");
			this.getView().byId("idSchoolName").setValue("");
			this.getView().byId("idPartTime").setSelected(false);
			// this.getView().byId("idCreatedBy").setValue("");
			// this.getView().byId("idCreatedOn").setValue("");
			this.getView().byId("idIFSCCode").setValue("");
			this.getView().byId("idPANNo").setValue("");
			this.getView().byId("idRemarks").setValue("");
			this.getView().byId("idSoftDelete").setSelected(false);
			// this.searchPopup.getBinding("items").filter([]);
			this.getView().getModel("local").setProperty("/TrainerModel",{Courses:[]});
			this.flag=null;
			this.getView().byId("idTrainerCourse").removeSelections();
		},

		onClose: function () {
			this.oDialogPopup.close();
		},

		onReClose: function () {
			this.ReasgnPopup.close();
		},
		onSearch: function (oEvent) {
			var queryString = this.getQuery(oEvent);

			if (queryString) {
				var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
				var oFilter2 = new sap.ui.model.Filter("GmailId", sap.ui.model.FilterOperator.Contains, queryString);

				var oFilter = new sap.ui.model.Filter({
					filters: [oFilter1, oFilter2],
					and: false
				});
				var aFilter = [oFilter];
				this.searchPopup.getBinding("items").filter(aFilter);
			} else {
				this.searchPopup.bindAggregation("items", {
					path: "/Students",
					template: new sap.m.DisplayListItem({
						label: "{Name}",
						value: "{GmailId}"
					})

				});
				this.searchPopup.getBinding("items").filter([]);
			}
		},

		onConfirm: function (oEvent) {
			var data = this.getSelectedKey(oEvent);

			if (this.flag === "trainerName") {
				// debugger;
				var oTrainer = "Trainers(\'" + data[2] + "\')";
				var oData = this.getView().getModel().oData[oTrainer];
				oGuid = data[2];
				oData.ExperienceYear = Math.floor(oData.Experience / 12); // get the whole number of years
				oData.ExperienceMonth = oData.Experience % 12; // get the remaining months
				this.getView().getModel("local").setProperty("/TrainerModel", oData);
				this.getView().getModel("local").setProperty("/TrainerModel/FirstName", oData.FirstName);
				this.getView().byId("idFirstName").setValue(oData.FirstName);
				this.getView().byId("idFirstName").setEnabled(false);
				this.getView().getModel("local").setProperty("/TrainerModel/LastName", oData.LastName);
				this.getView().byId("idLastName").setValue(oData.LastName);
				this.getView().byId("idLastName").setEnabled(false);
				this.getView().getModel("local").setProperty("/TrainerModel/JoiningDate", oData.JoiningDate);
				if (oData.JoiningDate) {
					var FormattedDate = this.onDateFormatted(oData.JoiningDate);
					this.getView().byId("idJoiningDate").setValue(FormattedDate);
					this.getView().byId("idJoiningDate").setEnabled(false);

					}
				else {
					this.getView().byId("idJoiningDate").setEnabled(true);
				}
				this.getView().getModel("local").setProperty("/TrainerModel/AccountName", oData.AccountName);
				this.getView().byId("idAccountName").setValue(oData.AccountName);
				this.getView().getModel("local").setProperty("/TrainerModel/AccountNo", oData.AccountNo);
				this.getView().byId("idAccountNo").setValue(oData.AccountNo);
				this.getView().getModel("local").setProperty("/TrainerModel/AccountType", oData.AccountType);
				this.getView().byId("idAccountType").setValue(oData.AccountType);
				this.getView().getModel("local").setProperty("/TrainerModel/Address", oData.Address);
				this.getView().byId("idAddress").setValue(oData.Address);
				// this.getView().getModel("local").setProperty("/TrainerModel/ChangedBy", oData.ChangedBy);
				// this.getView().byId("idChangedBy").setValue(oData.ChangedBy);
				// this.getView().getModel("local").setProperty("/TrainerModel/ChangedOn", oData.ChangedOn);
				// this.getView().byId("idChangedOn").setValue(oData.ChangedOn);
				this.getView().getModel("local").setProperty("/TrainerModel/City", oData.City);
				this.getView().byId("idCity").setValue(oData.City);
				this.getView().getModel("local").setProperty("/TrainerModel/ContactNo", oData.ContactNo);
				this.getView().byId("idContactNo").setValue(oData.ContactNo);
				this.getView().getModel("local").setProperty("/TrainerModel/ContactNo1", oData.ContactNo1);
				this.getView().byId("idContactNo1").setValue(oData.ContactNo1);
				// this.getView().getModel("local").setProperty("/TrainerModel/CreatedBy", oData.CreatedBy);
				// this.getView().byId("idCreatedBy").setValue(oData.CreatedBy);
				// this.getView().getModel("local").setProperty("/TrainerModel/CreatedOn", oData.CreatedOn);
				// this.getView().byId("idCreatedOn").setValue(oData.CreatedOn);
				this.getView().getModel("local").setProperty("/TrainerModel/IFSCCode", oData.IFSCCode);
				this.getView().byId("idIFSCCode").setValue(oData.IFSCCode);
				this.getView().getModel("local").setProperty("/TrainerModel/PANNo", oData.PANNo);
				this.getView().byId("idPANNo").setValue(oData.PANNo);
				this.getView().getModel("local").setProperty("/TrainerModel/Remarks", oData.Remarks);
				this.getView().byId("idRemarks").setValue(oData.Remarks);
				this.getView().getModel("local").setProperty("/TrainerModel/SoftDelete", oData.SoftDelete);
				this.getView().byId("idSoftDelete").setSelected(oData.SoftDelete);
				//var trainerId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
				//this.getView().getModel("local").setProperty("/newBatch/trainerId", trainerId);


			}
		},

		onWaiver: function (oEvent) {
			var selected = oEvent.getParameter("selected");
			if (oEvent.getSource().sId == "__component0---idserver--freeAccess") {
				if (selected === true) {
					this.getView().byId("amount").setValue(0);
				} else {
					this.getView().byId("amount").setValue(2500);
				}
			} else if ((oEvent.getSource().sId == "idSimpleFormRe--freeAccess")) {
				if (selected === true) {
					sap.ui.getCore().byId("idSimpleFormRe--amount").setValue(0);
				} else {
					sap.ui.getCore().byId("idSimpleFormRe--amount").setValue(2500);
				}
			} else {
				if (selected === true) {
					sap.ui.getCore().byId("idSimpleForm--amount").setValue(0);
				} else {
					sap.ui.getCore().byId("idSimpleForm--amount").setValue(2500);
				}
			}

		},

		onTabSearch: function (oEvent) {
			var regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

			var queryString = this.getQuery(oEvent);
			if (queryString) {
				var oFilter1;
				var oFilter2;
				if (regEx.test(queryString)) {

					var that = this;
					var payload = {};
					var Filter1 = new sap.ui.model.Filter("GmailId", "EQ", queryString);

					this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Students", "GET", {
							filters: [Filter1]
						}, payload, this)
						.then(function (oData) {

							var aFilter = [new sap.ui.model.Filter("StudentId", "EQ", "'" + oData.results[0].id + "'")];

							that.getView().byId("serverTable").getBinding("items").filter(aFilter);

						}).catch(function (oError) {

						});

				} else {
					//oFilter1 = new sap.ui.model.Filter("StudentId", sap.ui.model.FilterOperator.Contains, queryString);
					oFilter1 = new sap.ui.model.Filter("User", sap.ui.model.FilterOperator.EQ, queryString);
					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1],
						and: false
					});
					var aFilter = [oFilter];
					this.getView().byId("serverTable").getBinding("items").filter(aFilter);
				}
			} else {
				this.getView().byId("serverTable").getBinding("items").filter([]);
			}

		},

		deletetrainer: function() {
			var that = this;
			MessageBox.confirm("Do you want to delete the selected trainer?", function(conf) {
				if (conf == 'OK') {
					//var items = that.getView().byId('manageSubsTable').getSelectedContexts();
					// that.totalCount = that.totalCount - items.length;
					// for (var i = 0; i < items["length"]; i++) {
					debugger;
					var sPath = "/Trainers('" + oGuid + "')";
					that.ODataHelper.callOData(that.getOwnerComponent().getModel(), sPath, "DELETE", {}, {}, that)
						.then(function(oData) {
							//that.getView().byId("idDelete").setEnabled(false);
							sap.m.MessageToast.show("Trainer Deleted succesfully");
							that.cleartrainer();
						}).catch(function(oError) {
							that.getView().setBusy(false);
							that.oPopover = that.getErrorMessage(oError);
							that.getView().setBusy(false);
						});
					// }
				}
			}, "Confirmation");

		},

		onClearScreen: function () {
			this.getView().getModel("local").setProperty("/newServer/User", null);
			// this.getView().getModel("local").setProperty("/newServer/Amount", null);
			this.getView().getModel("local").setProperty("/newServer/PassSAP", null);
			this.getView().getModel("local").setProperty("/newServer/PassRDP", null);
		},
		onDelete: function (oEvent) {
			var that = this;
			MessageBox.confirm("Do you want to delete the selected records?", function (conf) {
				if (conf == 'OK') {
					var items = that.getView().byId('serverTable').getSelectedContexts();
					for (var i = 0; i < items["length"]; i++) {
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), items[i].sPath, "DELETE", {}, {}, that)
							.then(function (oData) {
								sap.m.MessageToast.show("Deleted succesfully");
							}).catch(function (oError) {
								that.getView().setBusy(false);
								that.oPopover = that.getErrorMessage(oError);
								that.getView().setBusy(false);
							});

					}
				}
			}, "Confirmation");

		},
		onSwitchToggle: function (oEvent) {

			var oSwitch = oEvent.getSource().getState();
			var date = new Date();
			var queryString = this.getQuery(oEvent);
			if (oSwitch === true) {
				this.getView().byId("serverTable").getBinding("items").filter(null);
			} else {
				var vFilter1 = new sap.ui.model.Filter("EndDate", "GT", date);

				var vFilter = new sap.ui.model.Filter({
					filters: [vFilter1]
				});
				var arFilter = [vFilter];
				this.getView().byId("serverTable").getBinding("items").filter(arFilter);

			}

		},
		passwords: "",
		onEmail: function () {
			var that = this;
			var items = that.getView().byId('serverTable').getSelectedContexts();
			for (var i = 0; i < items["length"]; i++) {
				var loginPayload = items[i].getModel().getProperty(items[i].getPath());
				if (this.passwords === "") {
					this.passwords = prompt("Please enter your password", "");
					if (this.passwords === "") {
						sap.m.MessageBox.error("Blank Password not allowed");
						return;
					}
				}
				loginPayload.password = this.passwords;
				$.post('/sendServerEmail', loginPayload)
					.done(function (data, status) {
						sap.m.MessageToast.show("Email sent successfully");
					})
					.fail(function (xhr, status, error) {
						that.passwords = "";
						sap.m.MessageBox.error(xhr.responseText);
					});
			}
		},
		onDataExport: function (oEvent) {
			var state = this.getView().byId("idSwitch").getState();

			if (state == true) {
				$.ajax({
					type: 'GET', // added,
					url: 'ServerDownload',
					success: function (data) {
						sap.m.MessageToast.show("File Downloaded succesfully");
					},
					error: function (xhr, status, error) {
						sap.m.MessageToast.show("error in downloading the excel file");
					}
				});

			} else {
				$.ajax({
					type: 'GET', // added,
					url: 'ServerDownloadAct',
					success: function (data) {
						sap.m.MessageToast.show("File Downloaded succesfully");
					},
					error: function (xhr, status, error) {
						sap.m.MessageToast.show("error in downloading the excel file");
					}
				});
			}
		}

	});
});
