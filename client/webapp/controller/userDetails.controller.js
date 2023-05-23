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
		_matchedHandler:function(oEvent){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader",true);

			var oPath = oEvent.getParameter("name");
			if(oPath == "userDetails"){
				this.getModel('appView').setProperty('/editableFields', true);
				this.getModel('appView').setProperty('/EmailVisible', true);
				this.getModel('appView').setProperty('/Passwordfield', true);
			};
			var omodel = this.getView().getModel("appView");
			omodel.setProperty("/newPass",false);
			omodel.setProperty("/conPass",false);

			this.getUserData();
			this.getUserRoleData();
			this.getModel("appView").updateBindings();
		},
		onRoleChange : function(oEvent){
			debugger;
			var oSelectedKey = oEvent.getParameter("selectedItem").getKey();
			var oModel = this.getView().getModel("appView");
			oModel.setProperty('/selectedrole',oSelectedKey)
		},
		AddUserDialog : function(){
			debugger
			var oView = this.getView();
            var that = this;
			// var oPersonalDetailsForm = this.getView().byId('idPersonalDetails');

			this.oFormData = {
					"EmailId": "",
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
					"Role": ""
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
		onRejectPass : function(){
			this.passDialog.then(function (oPassDialog) {
				oPassDialog.close();
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
			state = state === true ? 'Yes' : 'No';
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
		showPassField : function(oEvent){
			debugger;
			var passSwitchState = oEvent.getParameter('state');
			var omodel = this.getView().getModel("appView");
			if(passSwitchState === false){
				omodel.setProperty("/newPass",true);
				omodel.setProperty("/conPass",true);
			}
			else{
			omodel.setProperty("/newPass",false);
			omodel.setProperty("/conPass",false);
			}
		},

		onAddUserViaAdmin : function(oEvent){
			debugger;
			var oModel = this.getView().getModel("appView");
			var pass = oModel.getProperty("/conPassWord");
			var Conpass = oModel.getProperty("/NewPassword");
			this.oFormData.PassWord = Conpass;
			 if(!pass && !Conpass) {
				MessageToast.show("Please Enter the Password");
			 }
			 else if (pass !== Conpass ){
				MessageToast.show("Passwords doesn't Match");
			 }
			 else if (pass === Conpass) {
				MessageToast.show("Matched Password");
			 }

			 this.AddCustomers();
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
					that.onRejectPass();
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					// that.getView().byId("userid").setValueState('Error');
					// that.getView().byId("pwd").setValueState('Error');
					that.middleWare.errorHandler(jqXhr, that);
				});
		},

		openPassdialog : function(){
			debugger;
			var oView = this.getView();
            var that = this;
			var oModel = this.getView().getModel('appView');
			var roleUSerSelected =  oModel.getProperty('/selectedrole');
			var Email = this.oFormData.EmailId;
			var phone = this.oFormData.phoneNumber;
			var firstName =  this.oFormData.FirstName;
			var lastName = this.oFormData.LastName;
			var address = this.oFormData.CompanyAddress;
			var billingCity = this.oFormData.BillingCity;
			var ShippingCity = this.oFormData.ShippingCity;
			var phoneRegex = /^\d{10}$/;
			var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;


			if (phone && !phone.match(phoneRegex)) {
			MessageToast.show("Phone number should be 10 digits");
			return;
			}
			if (Email && !Email.match(emailRegex)) {
				MessageToast.show("Please enter a valid email address");
				return;
			}

			if(!roleUSerSelected){
				MessageToast.show("Please Select a Role for the New user");
				return;
			}
			if(roleUSerSelected === "Admin" && !Email ){
				MessageToast.show("Please enter the email address");
				return;
			};
			if(roleUSerSelected === "Customer" && (!Email || !phone || !firstName || !lastName || !address || !billingCity || !ShippingCity)) {
				MessageToast.show("Please enter the required fields");
				return;
			  }
			  
			  if(roleUSerSelected === "Factory Manager" && (!Email || !phone)) {
				MessageToast.show("Please enter the required fields");
				return;
			  }
			  

			this.openDialog();
		},
		openDialog:function(){
			var oView = this.getView();
            var that = this;
		if (!this.passDialog) {
                this.passDialog = Fragment.load({
                    id: oView.getId(),
                    name: "ent.ui.ecommerce.fragments.AddUserPass",
                    controller: this
                }).then(function (oPassDialog) {    
                    oView.addDependent(oPassDialog);
                    return oPassDialog;
                }.bind(this));
            }
            this.passDialog.then(function (oPassDialog) {
					oPassDialog.open();
            });
		},

		
	});
});