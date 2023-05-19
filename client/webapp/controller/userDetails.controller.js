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
			// var oPersonalDetailsForm = this.getView().byId('idPersonalDetails');

			this.oFormData = {
					"email": "",
					"CompanyEmail": "",
					"CompanyName": "",
					"GSTNO": "",
					"CompanyAddress": "",
					"Title": "",
					"FirstName": "",
					"LastName": "",
					"phoneNumber": "",
					"PassWord": "",
					"BillingCountry": "",
					"BillingCity": "",
					"ShippingCity": "",
					"ShippingCountry": "",
					"BillingZipCode": "",
					"ShippingZipCode": "",
					"BillingAddress": "",
					"ShippingAddress": "",
					"Role":""



			}

			this.getView().getModel('appView').setProperty("/AddUserData", this.oFormData);

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
		onApproveCustomer:function(oEvent){
			debugger;
			var selectedItem = oEvent.getParameter("selectedItem").getKey();
			debugger;
			var opath = oEvent.getSource().getBindingContext("appView").getPath();
			var oid = this.getView().getModel("appView").getProperty(opath);
			var custid = oid.id;
			
			const oModel = this.getView().getModel();
			const sEntityPath = `/AppUsers('`+custid+"')"; // Replace with the appropriate entity set name and ID
			// const sEntityPath = `/AppUsers/`+ custid; // Replace with the appropriate entity set name and ID
			
			const oData = {
			// Update the properties of the entity
			"Status": selectedItem
			// Add more properties as needed
			};

		oModel.update(sEntityPath, oData, {
			success: function(data) {
				MessageToast.show("Customer " + selectedItem + " selected successfully");
			},
			error: function(error) {
				this.middleWare.errorHandler(error, that);
				// console.error("PATCH request failed");
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

		oModel.update(sEntityPath, oData, {
			success: function(data) {
				MessageToast.show("Customer Blocked Status is Changed Successfully")
				// console.log("PATCH request successful:", data);
			},
			error: function(error) {
				// this.middleWare.errorHandler(error, that);
				MessageToast.show("Error while update the status")
				// console.error("PATCH request failed");
			}
			});
		},
		AddCustomers : function(){
			debugger;
			var that = this;
			var payload =  this.oFormData;

			this.middleWare.callMiddleWare("addUserAdmin", "POST", payload)
				.then( function (data, status, xhr) {
					// debugger
					MessageToast.show("User Created Successfully");
					that.onReject();
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					// that.getView().byId("userid").setValueState('Error');
					// that.getView().byId("pwd").setValueState('Error');
					that.middleWare.errorHandler(jqXhr, that);
				});
		},
		
	});
});