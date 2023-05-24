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
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/layout", "OneColumn");
			oModel.setProperty("/visibleHeader",true);

			var oPath = oEvent.getParameter("name");
			if(oPath == "userDetails"){
				oModel.setProperty('/editableFields', true);
				oModel.setProperty('/EmailVisible', true);
				oModel.setProperty('/Passwordfield', true);
			};
			oModel.setProperty("/newPass",false);
			oModel.setProperty("/conPass",false);
			oModel.updateBindings();
			this.getUserData();
			this.getUserRoleData();
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
					"Companylogo":'',
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

			this.getView().getModel('appView').setProperty('/existingData',false);
		},

		onReject : function(){
			debugger;
			var oModel =  this.getView().getModel('appView');
			var bExistingData = oModel.getProperty('/existingData');
			if (!bExistingData){
				this.userAdd.then(function (userAddFrag) {
					userAddFrag.close();
			});
			return;
			}
			else {
				this.editAddUserDialog.then(function (userAddFrag) {
					userAddFrag.close();
					// userAddFrag.bindElement('appView>/userData');
            });
			}
		},

		onRejectPass : function(){
			this.passDialog.then(function (oPassDialog) {
				oPassDialog.close();
		});
		},
		
		getUserData:function(){
			var oModel = this.getView().getModel();  //default model get at here
			var that = this; 
			oModel.read('/AppUsers', {
				success: function(data) {
				that.getView().getModel("appView").setProperty("/userDetails",data.results);
				},
				error: function(error) {
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
		handleUploadPress: function (oEvent) {
			debugger;
			var files = oEvent.getParameter("files");
			var that = this;
			if (!files.length) {
			} else {
				var reader = new FileReader();
				reader.onload = function (e) {
					try {
						var vContent = e.currentTarget.result; //.result.replace("data:image/jpeg;base64,", "");
						// that.img.Content = vContent;
						var stream = that.getImageUrlFromContent(vContent);
						
						// that.getModel("appView").setProperty("/companyLogo", stream);
						that.getModel("appView").setProperty("/LogoAvonUserProfile", vContent);
						var logoProperty = this.getView().getModel("appView").getProperty("/LogoAvonUserProfile");
                        var base64String = logoProperty.split(",")[1];
						that.oFormData.CompanyLogo = base64String;
						that.getModel("appView").updateBindings();
					} catch (jqXhr) {
						that.middleWare.errorHandler(jqXhr, that);
					}
				};
				reader.readAsDataURL(files[0]);
			}
		},
		onLogo: function () {
			var oLogo = this.getModel("appView").getProperty("/LogoAvonUserProfile");
			var stream = this.formatter.getImageUrlFromContent(oLogo);
			if (!this.lightBox) {
				this.lightBox = new sap.m.LightBox("lightBox", {
					imageContent: [new sap.m.LightBoxItem({
						imageSrc: stream
					})]
				});
				this.lightBox.open();
			} else {
				this.lightBox.getImageContent()[0].setImageSrc(stream);
				this.lightBox.open();
			}
		},
		getImageUrlFromContent: function (base64Stream) {
			if (base64Stream) {
				var b64toBlob = function (dataURI) {
					var byteString = atob(dataURI.split(',')[1]);
					var ab = new ArrayBuffer(byteString.length);
					var ia = new Uint8Array(ab);
					for (var i = 0; i < byteString.length; i++) {
						ia[i] = byteString.charCodeAt(i);
					}
					return new Blob([ab], {
						type: 'image/jpeg'
					});
				};
				var x = b64toBlob(base64Stream);
				return URL.createObjectURL(x);
			}
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
					that.middleWare.errorHandler(jqXhr, that);
				});
		},

		openPassdialog : function(){
			debugger;
			var oView = this.getView();
            var that = this;
			var oModel = this.getView().getModel('appView');
			var roleUSerSelected =  oModel.getProperty('/selectedrole');
			// var Email = this.oFormData.EmailId;
			// var phone = this.oFormData.phoneNumber;
			// var firstName =  this.oFormData.FirstName;
			// var lastName = this.oFormData.LastName;
			// var address = this.oFormData.CompanyAddress;
			// var billingCity = this.oFormData.BillingCity;
			// var ShippingCity = this.oFormData.ShippingCity;
			// var phoneRegex = /^\d{10}$/;
			// var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

			var bExistingData = oModel.getProperty('/existingData');


			// if (phone && !phone.match(phoneRegex)) {
			// MessageToast.show("Phone number should be 10 digits");
			// return;
			// }
			// if (Email && !Email.match(emailRegex)) {
			// 	MessageToast.show("Please enter a valid email address");
			// 	return;
			// }

			// if(!roleUSerSelected){
			// 	MessageToast.show("Please Select a Role for the New user");
			// 	return;
			// }
			// if(roleUSerSelected === "Admin" && !Email ){
			// 	MessageToast.show("Please enter the email address");
			// 	return;
			// };
			// if(roleUSerSelected === "Customer" && (!Email || !phone || !firstName || !lastName || !address || !billingCity || !ShippingCity)) {
			// 	MessageToast.show("Please enter the required fields");
			// 	return;
			//   }
			  
			//   if(roleUSerSelected === "Factory Manager" && (!Email || !phone)) {
			// 	MessageToast.show("Please enter the required fields");
			// 	return;
			//   }
			  
			  if(!bExistingData){ // value is false
				// if user press add nee button
				this.openDialog();
			  }else if(bExistingData){
				this.updateRowData();
			  }
			
		},
		updateRowData : function(){
			var oModel = this.getView().getModel("appView");
			var dModel = this.getView().getModel();
			var dataModel = oModel.getProperty("/userData");
			var userId = dataModel.id;
			const sEntityPath = `/AppUsers('${userId}')`; // Replace with the appropriate entity set name and ID

			dModel.update(sEntityPath, dataModel, {
				success: function (data) {
					sap.m.MessageToast.show("Customer updated successfully");
					// that.getModel('appView').setProperty('/SaCaVisible', false);
					// that.getModel('appView').setProperty('/editVisible', true);
					// that.getModel('appView').setProperty('/editableFields', false);
					oModel.updateBindings();
				},
				error: function (error) {
					console.error("PATCH request failed");
				}
			});
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

		rowItemsPressUser :function(oEvent){
			debugger;
			var oParameter = oEvent.getParameter('listItem');
			var omodel = this.getView().getModel("appView");
			var sData =oParameter.getBindingContext('appView').getObject();
			omodel.setProperty('/userData', sData)
			var oView = this.getView();
            var that = this;
			if (!this.editAddUserDialog) {
                this.editAddUserDialog = Fragment.load({
                    id: oView.getId(),
                    name: "ent.ui.ecommerce.fragments.Adduser",
                    controller: this
                }).then(function (userAddFrag) {    
                    // Add dialog to view hierarchy
                    oView.addDependent(userAddFrag);
                    return userAddFrag;
                }.bind(this));

				omodel.setProperty('/existingData', true);
               
            }
            this.editAddUserDialog.then(function (userAddFrag) {
					userAddFrag.open();
					userAddFrag.bindElement('appView>/userData');
            });


		},
		
	});
});