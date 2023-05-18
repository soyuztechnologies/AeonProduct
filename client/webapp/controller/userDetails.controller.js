sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
	
], function (BaseController,MessageToast, JSONModel,Fragment) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.userDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("userDetails").attachPatternMatched(this._matchedHandler, this);
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader",true);
			this.getUserData();
			this.getModel("appView").updateBindings();
		},
		randomPaswordGenerate : function(){
			const length = 8;
			const specialChars = '!@#$%^&*';
			const getRandomChar = (characters) => characters[Math.floor(Math.random() * characters.length)];
			let password = '';
			for (let i = 0; i < length - 2; i++) password += String.fromCharCode(97 + Math.floor(Math.random() * 26));
			password += getRandomChar(specialChars);
			password += String.fromCharCode(65 + Math.floor(Math.random() * 26));
			return password.split('').sort(() => Math.random() - 0.5).join('');
		},

		AddUserDialog : function(){
			debugger
			var oView = this.getView();
            var that = this;
			var oPersonalDetailsForm = this.getView().byId('idPersonalDetails');

			var oFormData = {
					"email": "",
					"CompanyEmail": "",
					"CompanyName": "",
					"GSTNO": "",
					"CompanyAddress": "",
					"Title": "",
					"FirstName": "",
					"LastName": "",
					"phoneNumber": ""
			}

			this.getView().getModel('appView').setProperty("/AddUserData", oFormData);

			if (!this.userAdd) {
                this.userAdd = Fragment.load({
                    id: oView.getId(),
                    name: "ent.ui.ecommerce.fragments.Adduser",
                    controller: this
                }).then(function (userAddFrag) {    
                    // Add dialog to view hierarchy
                    oView.addDependent(userAddFrag);
                    return userAddFrag;
                }.bind(this));
               
            }
            this.userAdd.then(function (userAddFrag) {
					userAddFrag.open();
					userAddFrag.bindElement('appView>/AddUserData');
            });
		},
		onReject : function(){
			this.userAdd.then(function (userAddFrag) {
				userAddFrag.close();
		});
		},
		getUserData:function(){
			// debugger;
			var oModel = this.getView().getModel();  //default model get at here
			var that = this; 
			// Perform the read operation
			oModel.read('/AppUsers', {
				success: function(data) {
				// Success callback
				// MessageToast.show("Data read successfully");
				that.getView().getModel("appView").setProperty("/userDetails",data.results);
				// that.getView().getModel("appView").setProperty("/status",data.tatus);
				},
				error: function(error) {
				// Error callback
				that.middleWare.errorHandler(error, that);
				MessageToast.show("Error reading data");
				}
			});
		},
		onBlockCustomer:function(oEvent){
			debugger;
			var state = oEvent.getParameter('state');
			state = state === 'true' ? 'No' : 'Yes';
			debugger;
			var opath = oEvent.getSource().getBindingContext("appView").getPath();
			var oid = this.getView().getModel("appView").getProperty(opath);
			var custid = oid.id;
			
			const oModel = this.getView().getModel();
			const sEntityPath = `/AppUsers('`+custid+"')"; // Replace with the appropriate entity set name and ID
			// const sEntityPath = `/AppUsers/`+ custid; // Replace with the appropriate entity set name and ID
			
			const oData = {
			// Update the properties of the entity
			"Blocked": state
			// Add more properties as needed
			};

			// this.middleWare.callMiddleWare(sEntityPath, "PATCH", oData)
			// 		.then(function (data, status, xhr) {
			// 			debugger;
			// 		}.bind(this))
			// 		.catch(function (jqXhr, textStatus, errorMessage) {
			// 			this.middleWare.errorHandler(jqXhr, this);
			// 		}.bind(this));

			oModel.update(sEntityPath, oData, {
			success: function(data) {
				console.log("PATCH request successful:", data);
			},
			error: function(error) {
				// this.middleWare.errorHandler(error, that);
				console.error("PATCH request failed");
			}
			});
		},
		
	});
});