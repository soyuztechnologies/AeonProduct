sap.ui.define([
	"oft/fiori/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"oft/fiori/models/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	'sap/ui/model/json/JSONModel'
], function (Controller, MessageBox, MessageToast, Formatter, Filter, FilterOperator, Fragment, JSONModel) {
	"use strict";

	return Controller.extend("oft.fiori.controller.generateIdCard", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf oft.fiori.view.View2
		 */
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			Controller.prototype.onInit.apply(this);

			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			if (currentUser) {
				var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
				this.getView().byId("idUser").setText(loginUser);
			}


			var oStuModel = this.getOwnerComponent().getModel();
			var oModelJsonCC = new sap.ui.model.json.JSONModel();
			// var oStuModel = this.getOwnerComponent().getModel();
			oStuModel.read('/Wards', {
				success: function (oData, response) {
					oModelJsonCC.setData(oData);
				},
				error: function (response) { }
			});

			//var oModelJsonCC = new sap.ui.model.json.JSONModel();
			var oCourseModel = this.getOwnerComponent().getModel();
			// debugger;
			oCourseModel.read('/Courses', {
				success: function (oData, response) {
					oModelJsonCC.setData(oData);
				},
				error: function (response) { }
			});

			this.oRouter.attachRoutePatternMatched(this.herculis, this);


		},


		onBack: function () {
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		onConfirm: function (oEvent) {
			debugger;
			var that = this;
			if (this.sId.indexOf("courseId") !== -1) {

				var data = this.getObjListSelectedkey(oEvent);
				// this.getView().byId("idCourseName").setText(data[0]);
				this.getView().byId("courseId").setValue(data[1]);
				this.courseId = data[3];
				this.getView().getModel("local").setProperty("/courceId", this.courseId);

				// var oItem = oEvent.getParameter("selectedItem");
				// var oContext = oItem.getBindingContext();
				debugger;
				$.ajax({
					type: 'GET', // added,
					url: 'getWardDataByBatch',
					data: {
						sId: this.courseId
					},

					success: function (oData) {
						that.getView().getModel("local").setProperty("/idCardData", oData);
						sap.m.MessageToast.show("File Downloaded succesfully");
					},
					error: function (xhr, status, error) {
						sap.m.MessageToast.show("error in downloading the excel file");
					}
				});


			}
			//this.searchPopup.close();
		},

		herculis: function (oEvent) {
			debugger;
			// var oJSONModel = {
			// 	"stu": [{
			// 		"Name": "Sarika",
			// 		"GmailId": "sarika@gmail.com",
			// 		"CompanyMail": "null",
			// 		"ContactNo": 165456
			// 	},
			// 	{
			// 		"Name": "Sid",
			// 		"GmailId": "sid@gmail.com",
			// 		"CompanyMail": "null",
			// 		"ContactNo": 141738
			// 	},
			// 	{
			// 		"Name": "Dheeraj",
			// 		"GmailId": "dheeraj@gmail.com",
			// 		"CompanyMail": "null",
			// 		"ContactNo": 68749
			// 	},
			// 	{
			// 		"Name": "Sid1",
			// 		"GmailId": "sid@gmail.com",
			// 		"CompanyMail": "null",
			// 		"ContactNo": 141738
			// 	},
			// 	{
			// 		"Name": "Sid2",
			// 		"GmailId": "sid@gmail.com",
			// 		"CompanyMail": "null",
			// 		"ContactNo": 141738
			// 	},
			// 	{
			// 		"Name": "Sid3",
			// 		"GmailId": "sid@gmail.com",
			// 		"CompanyMail": "null",
			// 		"ContactNo": 141738
			// 	},
			// 	{
			// 		"Name": "Sid4",
			// 		"GmailId": "sid@gmail.com",
			// 		"CompanyMail": "null",
			// 		"ContactNo": 141738
			// 	},
			// 	{
			// 		"Name": "Sid5",
			// 		"GmailId": "sid@gmail.com",
			// 		"CompanyMail": "null",
			// 		"ContactNo": 141738
			// 	},
			// 	{
			// 		"Name": "Sid6",
			// 		"GmailId": "sid@gmail.com",
			// 		"CompanyMail": "null",
			// 		"ContactNo": 141738
			// 	}
			// 	]
			// };
			// var oModel = new JSONModel(oJSONModel);
			// this.getView().setModel(oModel);
		},
		onSelect: function (oEvent) {
			debugger;
			this.sId = oEvent.getSource().getId();
			debugger;
			var sTitle = "",
				sPath = "";
			if (this.sId.indexOf("customerId") !== -1) {
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Students",
					template: new sap.m.DisplayListItem({
						label: "{Name}",
						value: "{GmailId}"
					})
				});
				// this.searchPopup.bindAggregation("items", {
				// 	path: "/Students",
				// 	template: new sap.m.StandardListItem({
				// 		title: "{Name}",
				// 		description: "{GmailId}",
				// 		info: "{id}"
				// 	})
				// });
			} else if (this.sId.indexOf("idEmailCust") !== -1) {
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("customer");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Inquries",
					template: new sap.m.DisplayListItem({
						label: "{EmailId}",
						value: "{FirstName}"
					})
				});
			} else if (this.sId.indexOf("courseId") !== -1) {
				debugger;
				var oBatchFilter = new sap.ui.model.Filter("hidden", FilterOperator.EQ, false);
				this.getCustomerPopup();
				var title = this.getView().getModel("i18n").getProperty("batch");
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "/Courses",
					filters: [oBatchFilter],
					sorter: {
						path: 'EndDate',
						descending: false,
						group: false
					},
					// template: new sap.m.DisplayListItem({
					// 	label: "{Name}",
					// 	value: "{BatchNo}"
					// })

					template: new sap.m.ObjectListItem({
						title: "{BatchNo}",
						intro: "{BatchNo}",
						// number: {
						// 	path: "status",
						// 	formatter: this.formatter.formatStatusValue
						// }
					})
				});
				var oBinding = this.searchPopup.getBinding("items");
				var aSorters = [];
				var sPath1 = "EndDate";
				var bDescending = true;
				aSorters.push(new sap.ui.model.Sorter(sPath1, bDescending));
				oBinding.sort(aSorters);
			} else if (this.sId.indexOf("accountDetails") !== -1) {
				var oAccFilter = new sap.ui.model.Filter("deleted", FilterOperator.EQ, false);
				sTitle = "Account Search";
				sPath = "local>/accountSet";
				this.getCustomerPopup();
				var title = "Account Search";
				var oSorter = new sap.ui.model.Sorter({
					path: 'value',
					descending: false
				});
				this.searchPopup.setTitle(title);
				this.searchPopup.bindAggregation("items", {
					path: "local>/accountSet",
					filters: [oAccFilter],
					sorter: oSorter,
					template: new sap.m.DisplayListItem({
						label: "{local>value}",
						value: "{local>key}"
					})
				});
			}
		},  
		onGenerateIdCards: function (oEvent) {

			debugger;
			var currentdate = new Date();
			var CuurentDatetime =  currentdate.getDate() + "/"
			+ (currentdate.getMonth()+1)  + "/" 
			+ currentdate.getFullYear() + " "  
			+ currentdate.getHours() + ":"  
			+ currentdate.getMinutes() + ":" 
			+ currentdate.getSeconds();
			var selectedStudents = oEvent.getSource().getParent().getParent().getParent().getParent().getContent()[3].getProperty("selectedKeys");
			// selectedStudents.push("Dheeraj Sharma");

			var HTMlHead = '<!DOCTYPE html>' +
				'<html>' +
				'' +
				'<head>' +
				'    <title>School ID Card</title>' +
				'    <!-- <link rel="stylesheet" type="text/css" href="index.css"> -->' +
				'</head>' +
				'<style>' +
				'    .id-card {' +
				'        border: 1px solid #ccc;' +
				'        border-radius: 10px;' +
				'        box-shadow: 0px 0px 10px #ccc;' +
				'        margin: 50px auto;' +
				'        max-width: 600px;' +
				'        padding: 20px;' +
				'        height: 70mm;' +
				'        width: 126mm;' +
				'        padding: 5mm;' +
				'      background-blend-mode: overlay;' +
				'      background-position: center;' +
				'      background-repeat: no-repeat; */' +
				'    }' +
				'' +
				'   .lo2{' +
				'    position: absolute;' +
				'    z-index: 0;' +
				'    margin-left: 12rem;' +
				'    margin-top: 3%;' +
				'    opacity: 0.1;' +
				'   }' +
				'' +
				'' +
				'' +
				'' +
				'    .header {' +
				'        display: flex;' +
				'        align-items: center;' +
				'        margin-bottom: 20px;' +
				'    }' +
				'' +
				'    .logo {' +
				'        width: 110px;' +
				'        /* height: 50px; */' +
				'        margin-right: 10px;' +
				'    }' +
				'' +
				'    .school-title {' +
				'        font-size: 32px;' +
				'        font-weight: bold;' +
				'        margin: 0;' +
				'    }' +
				'' +
				'    .body {' +
				'        display: flex;' +
				'        gap: 18px;' +
				'    }' +
				'' +
				'    .left {' +
				'        flex-grow: 1;' +
				'        margin-right: 15px;' +
				'    }' +
				'' +
				'    .right {' +
				'        /* flex-grow: 1; */' +
				'        text-align: center;' +
				'    }' +
				'' +
				'    .photo {' +
				'        width: 150px;' +
				'        height: 145px;' +
				'        /* margin-top: 15px; */' +
				'    }' +
				'' +
				'    .student-details {' +
				'        font-size: 13px;' +
				'        display: flex;' +
				'        margin-bottom: 2rem;' +
				'        flex-direction: column;' +
				'    }' +
				'' +
				'    .principal-sign {' +
				'        display: flex;' +
				'        flex-direction: column;' +
				'        justify-content: flex-end;' +
				'        margin-left: 70px;' +
				'        margin-bottom: 20px;' +
				'    }' +
				'' +
				'    .principal-sign img {' +
				'        width: 50px;' +
				'        height: 50px;' +
				'        border: 1px solid #ccc;' +
				'        border-radius: 50%;' +
				'        padding: 5px;' +
				'    }' +
				'    .page{' +
				'        display: grid;' +
				'          grid-template-columns: repeat(2, 1fr);' +
				'          grid-template-rows: repeat(4, 1fr);' +
				'          grid-gap: 0px;' +
				'          padding: 25px;' +
				'          width: 295mm; /* A4 width */' +
				'          height: 297mm; /* A4 height */' +
				'    }' +
				'    #id-card-1 {' +
				'  grid-row: 1 / span 2; /* spans two rows */' +
				'  grid-column: 1 / span 1; /* spans one column */' +
				'}' +
				'' +
				'    /* .page {' +
				'        width: 21cm;' +
				'        min-height: 29.7cm;' +
				'        padding: 2cm;' +
				'        margin: 1cm auto;' +
				'        border: 1px #D3D3D3 solid;' +
				'        border-radius: 5px;' +
				'        background: white;' +
				'        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);' +
				'        column-count: 2;' +
				'    } */' +
				'    @page {' +
				'    size: A4;' +
				'    margin: 0;' +
				'}' +
				'' +
				'' +
				'    .school-address {' +
				'        display: flex;' +
				'        flex-direction: column;' +
				'        justify-content: center;' +
				'        align-items: center;' +
				'        border-bottom: 1px solid black;' +
				'    }' +
				'' +
				'    .school-address .name {' +
				'        font-size: x;' +
				'        font-weight: bold;' +
				'        margin: 0;' +
				'    }' +
				'' +
				'    .contact-school ul {' +
				'        display: flex;' +
				'        flex-direction: column;' +
				'        justify-content: space-evenly;' +
				'        align-items: center;' +
				'        list-style: none;' +
				'        font-size: small;' +
				'        gap: 2px;' +
				'        margin-top: 2px;' +
				'    }' +
				'' +
				'    ' +
				'    .left{' +
				'        display: flex;' +
				'        margin-left: 2rem ;' +
				'    }' +
				'' +
				'    p {' +
				'        font-weight: bold;' +
				'        margin: 3px;' +
				'    }' +
				'' +
				'    h4 {' +
				'       margin: auto;' +
				'       margin-left: 13rem;' +
				'       font-size: 7px;' +
				'    }' +
				'' +
				'    span {' +
				'        font-weight: bolder;' +
				'    }' +
				'</style>' +
				'' +
				'<body>' +

				'    <div class="page">';
			var HTMlContent = ' <div class="id-card">' +
				'            <div class="lo2">' +
				'            </div>' +
				'            <div class="header">' +
				'                <img src="$$LOGO$$" class="logo">' +
				'                <div class="school-details">' +
				'                    <h2 class="school-title">EVOS Training Solutions</h2>' +
				'                    <div class="school-address">' +
				'                        <span class="name">EPS 074A, Emerald Plaza, Sector 65, Gurgaon</span>' +
				'                        <span class="contact-school">' +
				'                            <!-- phone number and email in list -->' +
				'                            <ul>' +
				'                                <li>Phone:0124-4943255, +918800156440</li>' +
				'                                <li>Email:contact@evotrainingsolutions.com</li>' +
				'                            </ul>' +
				'' +
				'                        </span>' +
				'                    </div>' +
				'                </div>' +
				'            </div>' +
				'            <div class="br"></div>' +
				'            <div class="body">' +
				'                <div class="right">' +
				'                    <img src="$$Photo$$" class="photo">' +
				'                </div>' +
				'                <div class="left">' +
				'                    <div class="student-details">' +
				'                        <p>Roll No: $$RollNo$$</p>' +
				'                        <p>Name: $$Name$$</p>' +
				'                        <p>Age: $$Age$$</p>' +
				'                        <p>Address: $$Address$$</p>' +
				'                        <p>Phone: $$Phone$$</p>' +
				'                        <p>Blood Group:$$BloodGroup$$</p>' +
				'                        <h4>$$curentTimeStamp$$</h4>' +
				'                    </div>' +
				'                </div>' +
				'            </div>' +
				'            <!-- </div> -->' +
				'        </div>' +
				'';
			var HTMlFooter = '    </div>' +
				'</body>' +
				'' +
				'</html>';

			HTMlContent = HTMlContent.replaceAll("$$LOGO$$", `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQkAAAEJCAYAAACHaNJkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMzc3ODIyRjgyN0NFNTExQTk0M0Y0NzM3OUE5MzcxRiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2RTEwRDFFMjdDODQxMUU1QkY1RkU3QkQ2NjBBMDFENCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2RTEwRDFFMTdDODQxMUU1QkY1RkU3QkQ2NjBBMDFENCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjE2Nzc4MjJGODI3Q0U1MTFBOTQzRjQ3Mzc5QTkzNzFGIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjEzNzc4MjJGODI3Q0U1MTFBOTQzRjQ3Mzc5QTkzNzFGIi8+IDwvcmRmOkRlc2NyaXB0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`);

			if (selectedStudents.length > 0) {
				var idCardHTML = ``;
				for (var i = 0; i < selectedStudents.length; i++) {
					// debugger;
					// var forMale = oGetData.Gender;
					var oNewHTRml = HTMlContent;
					var oGetData = oEvent.getSource().getParent().getParent().getParent().getParent().getContent()[3].getSelectedItems()[i].getBindingContext("local").getObject();
					// debugger;
					oNewHTRml = oNewHTRml.replace("$$RollNo$$", oGetData.RollNo);
					oNewHTRml = oNewHTRml.replace("$$Name$$", oGetData.Name);
					oNewHTRml = oNewHTRml.replace("$$Age$$", oGetData.Age);
					oNewHTRml = oNewHTRml.replace("$$Address$$", oGetData.Address);
					oNewHTRml = oNewHTRml.replace("$$Phone$$", oGetData.Phone);
					oNewHTRml = oNewHTRml.replace("$$BloodGroup$$", oGetData.BloodGroup);
					oNewHTRml = oNewHTRml.replace("$$curentTimeStamp$$", CuurentDatetime);
					
					debugger;
				
						if (oGetData.Photo === null && oGetData.Gender==='M'){
							oGetData.Photo = `data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAMAAADDpiTIAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAOMxAADjMQF68hdtAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAv1QTFRF////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMtkj8AAAAP50Uk5TAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7HhWKRAAAThElEQVQYGe3BCZzW46IH8N/7ztQsNe2bFqF0UrlH0mI7rdqtJ3spCedYK26iooUQicjW4iRauJnGli4OJbQgTklpnTZtNNVUs/4+Vy7nWKaamuf/f57nnd/3Cwjq1YEUX9FBl0OKrzJvdIcUXycuexg/qhAPKY5qrf84Hoj22VEHUgxVXZlxPHDGQvI8SPFT8Ss+ANyaQ/J6SLFzyWbur5o0mQc9AylmKs88QI6r9Dl/sj0eUqzUX7N0P3MbfsyfdYbEvrJx+FnL79fOJqe9yl+8DIl5pzTHz67M2n8ryff4b7mNIDGszNAzUed6/KxlDvt8RubzV+ZAYtcN2/hIjYcjOKgqam7lnI78vS6QWPU4yftnl8JBHcsmLCQ7PsffS68AiUmRJ/mj/RfgoDbnYgK5PO47/kEaJBZFnuZBs3DQcX3RiuSN57AAt0NiT+RZHpRVGz+Km5yIWeTO5EdZgJxLILEmOp7/b1FXACN6om4emd57DQuSfQEkpkS6LeW/Lera4asonuBhZHWGxJALl/A3coeh7B4ezoEOkFjReTH/YMELPLz9bSEx4fT5PCb7LkelEyCeKz8uj8dqZHRIqUgU4q/IddtZBG+1mYFTS0B81eRTFs2KdQMjfRIgXkp+Mo9FltepzBNJEA81+YYm/HBuo7TSACIQn0TvzqYhmTs/7VQaxzeB+KP2XBqV8/H9026G+KJ7BgMwu1sixAPlpjIgGZPOi4M47s/rGaAtjzWFuKzzHgZs5X21IK66OZfBy36hIcRFcY8zHPlpZ0OcU/p1huejrhGIU2p8wVAt7QZxSONNDNv7jSCu6LqX4ct9ohzECR2yacW2PlGIfS320pbF/wWxreFO2nOgbwRiVe2NtOqd4yAWVV5By7ZfCLEmZTHteywKsSPhfbpgRgLEhriZdMP7ZSAWjKcrlhwHCd0AumNtPUjIzsqhQ7Y3g4SqQjqdsrctJESR1+mYjFMh4elP52yoDglL42y6Z1ECJBzRRXTR85Bw3EI39YaEocZuuulAE0gIXqWr1lWEBK4r3fUGJGjx39JhF0EC1pMuW5sICVT8ajrtXkigrqXb9p0ACVD8GjpuJiRAvem8ZpDARL6l86ZCAtOS7ss5HhKUf9ADoyABScmkB3aVhgTjOnrhNkgwPqYXvoQEoj49URcShHvoiQGQIMyjJxZCAlAuh744HmJeF3qjL8S8AfTGbIh5k+mN7yMQ4z6jP+pDTIvsoz96QkyrSI88DTGtIT3yBcS0NvRITjzEsCvpk5MghvWlT9pBDHuQPukDMexZ+mQkxLBJ9Mk0iGFT6JP5EMNm0CdfQAx7jT75GmLYm/TJGohhc+iTTRDDPqBPdkAMm0+f7IEY9iF9kg0x7E16JQoxaxq9kgQxazy9Ug5i1hh6pSrErBH0Si2IWXfRK6UhZt1Mn+yDGNaTPlkLMawbfbIAYlgH+iQNYlgz+mQ8xLAa9MkDEMPicumR2yCmbaJHroSYtpAeaQMxbSY90ghi2lj6Iz8FYtpd9MdaiHE96I80iHFt6I/7Icb9if64AmJcKfqjIcS8XfRFVjzEvGX0xZeQALxOX0yBBOAh+uK/IQG4hr5oCwlAU3oiOxkSgNL0xHxIINLph/shgZhNP7SHBGI0vZBTChKI6+iFTyDBOJteGAkJRnl64TxIQLbQAxklIQF5jx6YBgnKWHrgSkhQ/k73ZZeDBCI+Ga3ovndTqkDMq55KLhlD9+WSC0+EGBadR4+sTYCY1Z5e6QMx6156ZTrErLfplSUQoyLf0yuZEYhJZeiZWhCTStEzDSAmJdIzx0NMKkHPVISYFKVnEiFG7aZX8iBmLaRX0iFmTaZX3oKYNZBeGQUx6yJ65RqIWfXplTMgZsVn0yP5yRDDltMjqyGmzaRHZkFMe4AeeQBi2pX0yFUQ02rRIydCjFtDb2yEmDeJ3pgKMa8XvfE3iHkn0RuNIAHYSE/siEAC8DI98RokCDfQE7dDgnAKPXE6JBBb6YUfopBAjKAXRkOCUXkfPZBdExKQJ+iBFyBBOT6LzsttAAnMLXTePZAAvUrHvRmBBKjsYjrtywqQQJVKo8PeLQMJWEo+3XUcJHDr6aytkOC9RWe9AwneKDrrIUjwetFZV0GC14zOagAJXko+HbUvDhKC9XTUAkgY/oeOeggShpvpqHaQMDSkm/YnQkKxlU6aAwnHdDrpTkg4bqSTToOE40900dYIJCSb6aDJkLBMoIM6QcLSge7ZFg8JS/xOOmcsJDzj6ZwWkPC0p2tWQUIUv4OOGQoJ0/N0TD1ImM6jWz6ChCounU7pBgnX3XTJujhIuCpn0SF3QML2It2xpxwkbC3ojrGQ8C2mK/JPhoSvF12RBrEgcQcd0RRiw910w2sQK1J20AV5p0LsGEAXvAyxpNQ22pdzMsSWO2jfeIg1yd/RtqzjIfb0pW2PQixKWk+7NqVAbLqUdl0Gses92jQHYlnDHNqTVQ9i2xjaMwJiXblttGVNEsS+3rSlM8QBkU9oxzMQJ9TbRxtWJEPccDMtyD4D4ojIHIbvbogzav7AsM2LQtxxFUOWcQLEJTMYrisgTqm4nmF6COKYJvsZnjejENdcw9AsLwtxz1iG5Id6EAeVmMdQ5HaAOKnqRoahP8RRLQ4weGMgzro4l0GbEIG4qzcDNiMO4rIBDNRbJSBuG8UAfZgEcVxkIgOzKAXivLiZDMjcchAPxE9hIGYlQrwQeYoBmBAH8cX9NG4kxCN30Kz82yGuiqAA1+XRoMwr8AeVSkCccNUZKECnH2jMikb4ozGtIE74cjIKUudfNOSVFPzRCVmjIS7ozKwqKEip6TQh+3YUZDIzj4PYl7yEHIyC3ZnLItt4Fgpyah75HMS6aCrJzSVQsHbbWEQzKqNAb5DM6wKx7VEe1AOHUOklFsW6LijYuTwooz7Erpv4k2/jcSjnb+Sxyn20FA5hPn+yshzEoshw/qwXDqns8zw2ixrjUC7gzz6tBLEmaTp/sbYEDq3ttzx6m26Kw6FEl/IXK+tALKm2gP9xAw4j/oaNPDrpNyXg0HryP7Y2hVjRbiN/JT0Bh5PYbzsLb+31JXEYCev5K3svgIQveWw+f+NmHF7KkAwWzvJe8TisAfyt58tAQtZ8BX9ncxKOIKX3PB7Rd2Oa4ghq7uXvpHeAhKnU/bn8g344sroj0nkYe6d0jMMRvcI/Gl8GEpa4PptZgK2lUAjRdqM+zWYB9s9/5JJSKIT2LMiGTpBwnP81CzYAhZTcevCcLdn8Rd7O5S/f2rQECqfkChbsvbMhwWv2IQ9lRwqORrm6Lbpe3aVFvYpRHI17eEizm0KCVWc6D2Mwgld7Hw8j7TRIcCo9ns3D+aECApfKw8p/tREkGEkDM3gEzyBonXkkea91jEKMK/vfm3hEeWcgWImrWQjrBlWHGFV79G4WxsIoAjWMhZOb2jkKMaXJ1BwW0g0I0hk5LLT1Q2pCDIh0/YCFt7MigpO0nEcjN+38EpCiSbxuOY/K8wjO4zxaO55pGYEcs4qDt/Io5TdHUNrm8xhsfKQJ5Ji0mLCPR++zeASjbDqP0cqh9SFHqfwtX/HY3IdgTGYRfH5bRUjh/eXF/TxWuS0QhEtYNFmvdIxCCqNy/29YFKtKw7yq21lkG0bUgRxBpN30LBbRRBgXfZsm5P+zRzLk0E4avJoG/BWmjaApGc80ghSo4t/m04yd1WHWJfk06P2LopDfSbx0VjaNmROBSQ320Ky1d5SH/Ee0zcQMGtUXBpVdSeMyn20I+Umk+agNNC27NYyJvsFAvHdhFMVe9Nwx6QzC9/VhynAGZU3/sijO4tqO28KgrK4EMy7OZ3B23VcOxVSJjuO3M0jzE2FCy30M1K6h5VAMVRu2jUGbGkHRNd3NoO0aWg7FTJMXsxiCESiyRjsZgl3DyqP4iOs2jyHpiSKqu4XhyBhWHsVD5PJVDE12GxRJrXUMTcbw8igGWi5kmDI7owiqfMMwZQxKQIxr8DpDltMDx+yE5QzZyvaIZaWeymXo8vvhGDX5juGbUQMxq9lKWvEgjknnvbRhT794xKS4wTm0ZGIcjl6fXFry1TmIQSfOpz2zEnG0htOe/EmVEWuu2U2b5lbEUak8i1Z9f0MUsaTCK7Rsc3schS7f0bYFjRE7Wm2kdfmPJ6KQksfRAdm3I1b8NYsuWNYchXLGN3RDannEhJ65dEP+lJo4otoTc+mKdc0RA27NpzMy70vGYVV5PIsOye4L7w2hU7YNr4FDqjBiLx3zTBz89hBdkzP9HBQk8dLULLonNQk+u4ku2ji+Wzn8RpUuL2TQTR+Vh79a5dJRuZ9OHta7bcPGZ7budMUDb22mw5bVgq9KfkMpuhUV4KkBFBM+LAkv1dhLMWIKvDSNYshQeKg1xZhO8E78UooxqxLgm34UgwbBM9UyKAbtqw2/TKIYNR1eOTGXYlRudfjkaYph98Aj1Q5QDFsTgT8ephjXDt4ov5ti3HR4YzDFvKxK8ESpHZQA9Icn+lKCsBx+KLmREohz4IVelGD8A174hBKMfWXhgQaUoPwdHniEEpQv4L4SWymBOQ3Ou5gSnAfhvDcowVkL11XPpQSoBRw3kBKkMXDct5QgbYrCaX+hBKsVnDaREqxn4LL4nZRgbY+Hw9pRgtYBDhtHCdokuCuymRK0XQlw1tmU4F0IZz1KCd5UOGstJXh7k+Go0ylhuAyOGkEJw0tw1NeUMOyMg5NOoYTjHDipPyUcD8JJsynhWAoXJWRSQnICHNSGEpab4KCRlLC8DQctpoRlfzKcUzGPEpoL4JzLKOF5Ds55nhKejXDOOkqIGsMxJ1PCNBiO+TslTJ/CMVMpYcqvAresp4SqJ5xSgxKuV+CUSynhyigBlzxGCVlruGQBJWT3wSGJ2ZSQvQeHnEsJW2YJuGMAJXTN4Y5ZlND1hzu2UUKXCmfUpYRvRwSuuJRiwSlwxXCKBdfDFakUC16EK9ZQLFgHR6TkU2yoCTecRbHiSrjhRooV4+CGcRQr/gU3zKNYkV8eTthFsaMrXFCbYslDcMH5FEvmwwX3UCzJSoQDplNsaQkHfE2xZRDsS8yl2DIb9p1OsWY77OtJsac6rBtNsacTrHuXYs9AWLeVYs802FaVYtFy2HYexaK8JFh2O8WmZrDsCYpNfWDZGxSbnoRlX1Nsmge7IvsoNmVEYFV1il21YdXZFLvawaoeFLtuhFX3Uux6FFb9g2LXLFg1j2LXMli1iWLXgSgsSsynWHY8LDqFYltbWNSFYtsNsOgWim2jYNFjFNtSYVEqxbalsOgrim2ZsGgvxbqysKYKxb76sKYFxb42sOYSin1Xw5qbKPbdAWuGU+wbDWuep9g3Fda8TrHvA1iziGLfSlizgWLfHtgSyaY4oDQsqURxwcmwpBHFBefCknYUF3SFJd0pLrgCltxBcUEfWPIIxQV9YckUiguGwJJ3KS54GJYso7jgaViyneKCF2FJDsUFqbCjNMUJ78KOmhQnLIAdjShOWAY7zqE4IR12nE9xwmbY0YPihA2w4xaKE9bBjiEUJ6yGHaMpTlgJOyZSnLAcdsykOGEp7PgnxQlfwo4vKE74HHaspThhEezYTnHCp7BjDcUJ82HHYooT5sKOORQnvAc7plGc8ArsGEdxwjjYMYLihGGwox/FCbfCjosoTrgKdtSkOOE8WLKF4oLGsCSN4oJasGQwxQVJsKQjxQF7YUvyHop962DNJIp9i2FNa4p9s2FNZB3Fusdgz0CKdY1hT+JqimVpsOlCil15TWDVTIpVfWFXqUUUi56CbVWXUqx5Kw7WJU/Kp9ixJAUuaDghk2LBmxXgiHK3LaeELPfuCBzSekY2JURbWsEx1QalU8LyQTW4J+6Ct/MpIcgfGQc3nfTQdkrAdk88E+4qecG0TEpgct++MgmOK331mzmUICzpVw1eqHjj3HyKWZtHnQqP1LrzC4oxmVPax8E3pwz7lmLAgTeuKQ0/NRr4cR6lKH6Y0q00fFal18y9lGOTPrZtPPyX0GncBsrR+tfwJogdjYcsyqcUVt7c/nUQa6r3nvod5cgy066tjBjV6LZZGZRDy/1keMuSiGlxze9+dz+lAMvHXlgWxUJimxGf5FB+ZfOL19RAsVKm431v76T8aHfabQ1RPJ3cfeyCLBZn2XOHnBWPYi2h+a0vrWJxlP/V6M6lIQdV6jx09vcsRrbMuqddWcivRer1eHJRNmPeng8e7lYLUrDEM2+fuoaxKmfJs71PjYMcQeWuw9NW5zG2rJ3e75xkSKElnd5jZNqqPMaAnbOHdakMORZJp3cfmbYqj77a98njV9eFFFFS4+4jZ63Ko0+yvnr5novqRiHGJDXu/sCsVXl0Xc7XM+7tVj8eEoikxpcPfO5/V+fQQRmfzxh+xaklIcGLq9362uEvfbyFTtj68eR7r25RGRK65AZdbxmd+uVuWpG7/v3nBvz1tBSIbZWaXnbXU68tSM9mCPaueP/FkTdf3KxGHMQxkSp/7tR70LjUBRtyaFjmhs/Snh7Uq32DshAPRKqc1rn34LEvv7N47W4em73pS95/5dmRd1570V8aVU+AeKtEtYZ/ufi6AQ9PSP1o+bp169avT09P37Bh48aNmzZt3rx5y5bNa5YtnvtO6ssTnnx46F239ul+SadWzRoel4CY9n+n2v8m9DHf2QAAAABJRU5ErkJggg==`
						}
						else if(oGetData.Photo === null) {
							oGetData.Photo = `data:image/jpeg;base64,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`
						}
					
					
					oNewHTRml = oNewHTRml.replace("$$Photo$$", oGetData.Photo);

					idCardHTML += oNewHTRml
				}
				var wnd = window.open("http://localhost:3000", "", "");
				debugger;
				var arrString = HTMlHead + idCardHTML + HTMlFooter;
				// for(var a=0; a<idCardHTML.length; a++){
				// 	wnd.document.write(idCardHTML[a]);
				// };
				wnd.document.write(arrString);

				// var myhtml = new sap.ui.core.HTML();
				// myhtml.setContent(HTMlContent);
				debugger;
				this.getView().getModel("local").setProperty("/htmlcontent", HTMlContent);
				this.getView().getModel("local").updateBindings();
			} else {
				MessageToast.show("You have to Select Atleast One Student to generate Id Card")
			}


			// window.open("http://localhost:3000" , HTMlContent, "");




			var oView = this.getView();

			if (!this.generateIdCards) {
				this.generateIdCards = Fragment.load({
					name: "oft.fiori.fragments.idCards",
					controller: this,
				}).then(function (oIdCards) {
					oView.addDependent(oIdCards);
					return oIdCards;
				});
			}
			this.generateIdCards.then(function (oIdCards) {
				// var oHTML = new sap.m.Page({
				// 	title: "Id Cards",
				// 	content: [
				// 		myhtml
				// 	]
				// });
				// oIdCards.addContent(oHTML);

				// oIdCards.open();
			});
		},
		onSearch: function (oEvent) {
			debugger;
			// var oFilter1 = new sap.ui.model.Filter("text", sap.ui.model.filter.FilterOperator.Contains, oEvent.getSource().getValue());
			// var oFilter2 = new sap.ui.model.Filter("key", sap.ui.model.filter.FilterOperator.Contains, oEvent.getSource().getValue());
			// var oFilter = new sap.ui.model.Filter({
			// 	filters: [oFilter1, oFilter2],
			// 	and: false
			// });
			// this.searchPopup.filter(oFilter);
			//this.sId = oEvent.getSource().getId();
			if (this.sId.indexOf("customerId") !== -1) {
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
						path: "/Wards",
						template: new sap.m.ObjectListItem({
							title: "{Name}",
							intro: "{SchoolName}",
							number: "{RollNo}"
						})
						// template: new sap.m.StandardListItem({
						// 	title: "{Name}",
						// 	description: "{GmailId}",
						// 	info: "{id}"
						// })

					});
					this.searchPopup.getBinding("items").filter([]);
				}

			} else if (this.sId.indexOf("courseId") !== -1) {
				var queryString = this.getQuery(oEvent);

				if (queryString) {
					var oFilter1 = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, queryString);
					var oFilter2 = new sap.ui.model.Filter("BatchNo", sap.ui.model.FilterOperator.Contains, queryString);

					var oFilter = new sap.ui.model.Filter({
						filters: [oFilter1, oFilter2],
						and: false
					});
					var aFilter = [oFilter];
					this.searchPopup.getBinding("items").filter(aFilter);
				} else {
					this.searchPopup.bindAggregation("items", {
						path: "/Courses",
						template: new sap.m.DisplayListItem({
							label: "{Name}",
							value: "{BatchNo}"
						})
						// template: new sap.m.StandardListItem({
						// 	title: "{Name}",
						// 	description: "{BatchNo}",
						// 	info: "{id}"

						// })

					});
					this.searchPopup.getBinding("items").filter([]);
				}

			}

		},

	});

});
