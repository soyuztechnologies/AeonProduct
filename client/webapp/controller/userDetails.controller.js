sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox"

], function (BaseController, MessageToast, JSONModel, Fragment, BusyIndicator,MessageBox) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.userDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("userDetails").attachPatternMatched(this._matchedHandler, this);
		},

		// * RMh funciton
		_matchedHandler: function (oEvent) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/layout", "OneColumn");
			oModel.setProperty("/visibleHeader", true);

			var oPath = oEvent.getParameter("name");
			if (oPath == "userDetails") {
				oModel.setProperty('/editableFields', true);
				oModel.setProperty('/EmailVisible', true);
				oModel.setProperty('/Passwordfield', true);
			};
			oModel.setProperty("/newPass", false);
			oModel.setProperty("/hamburgerVisibility", true);
			oModel.setProperty("/conPass", false);
			oModel.setProperty("/userRoleVis", true);
			// oModel.setProperty("/aeonHeaderVis", true);
			this.getView().getModel("appView").setProperty("/newPassValueState", "None");
			this.getView().getModel("appView").setProperty("/passSwitchState", true);

			this.getView().getModel("appView").setProperty("/VSTNewPass", "");

			this.getView().getModel("appView").setProperty("/confirmPassValueState", "None");

			this.getView().getModel("appView").setProperty("/VSTConfirmPass", "");
			this.getUserData();
			this.getUserRoleData();
			this.getCompanyName();
			oModel.updateBindings();
		},

		// * this function will get the role form the company details fragment.

		onRoleChange: function (oEvent) {

			var oSelectedKey = oEvent.getParameter("selectedItem").getKey();
			var oModel = this.getView().getModel("appView");
			oModel.setProperty('/selectedrole', oSelectedKey)
		},

		// * this function will load the smae fragement for user add and edit the user data too.

		openUserDialog: function () {
			var oView = this.getView();
			var that = this;
			if (!this.userAdd) {
				this.userAdd = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.userDetailScreenFragment.Adduser",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			return this.userAdd;
		},

		//  * this fucntion will opne the add user fragment and create the payload too and set into the property.
		AddUserDialog: function () {
			
			var that = this;
			var oModel = this.getView().getModel('appView');
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
				"Companylogo": '',
				"Role": ""
			}

			// the whole form data will be set to the  "AddUserData" property in appView model.
			oModel.setProperty("/AddUserData", this.oFormData);
            oModel.updateBindings();
			// this will open the dilaog to add the user 
			this.openUserDialog().then(function (userAddFrag) {
				userAddFrag.open();
				userAddFrag.bindElement('appView>/AddUserData');
				oModel.setProperty('/TitleUserAdd', "Add User");
				oModel.setProperty('/existingData', false);
				oModel.setProperty('/userEditBtn', false);
				oModel.setProperty('/userCancelBtn', true);
				oModel.setProperty('/userupdateBtn', true);
				oModel.setProperty('/currentLogo', true);
				oModel.setProperty('/RoleField', true);
				oModel.setProperty('/UserlogoVis', false);
				oModel.setProperty('/EmailVisible', true);
				oModel.setProperty('/editableFields', true);
				oModel.setProperty('/enabledCompanyLogo', true);
				oModel.setProperty('/editCompName', true);
				oModel.setProperty('/LogoShowButton', true);
				oModel.setProperty('/logoImgVis', false);
				oModel.updateBindings();

			});

		},

		// * this function is close the dialog on add user and edit user.
		onReject: function () {
			
            this.editVis = this.getView().getModel("appView").getProperty("/userEditBtn");
            this.addUserTitle = this.getView().getModel("appView").getProperty("/TitleUserAdd");
            if(this.addUserTitle ==="Add User" ){
           }
            else if(this.editVis === false ){
                this.getView().getModel("appView").setProperty(this.bindingPath,this.seledtedUserData)
            }
            var oModel = this.getView().getModel('appView');
            var bExistingData = oModel.getProperty('/existingData');  
            oModel.updateBindings();
            this.openUserDialog().then(function (userAddFrag) {
                userAddFrag.close();
                // that.getView().getModel('appView').setProperty('/existingData',false);
            });
        },

		// * this function is close the dialog which ask for the passwprd when user add.
		onRejectPass: function () {
			
			this.getView().getModel("appView").setProperty("/NewPassword","")
			this.getView().getModel("appView").setProperty("/passSwitchState", true);
			this.getView().getModel("appView").setProperty("/conPass", false);
			this.getView().getModel("appView").setProperty("/newPass", false);
			this.getView().getModel("appView").setProperty("/conPassWord","")
			this.getView().getModel("appView").setProperty("/newPassValueState", "None");
			this.getView().getModel("appView").setProperty("/VSTNewPass", "");
			this.getView().getModel("appView").setProperty("/confirmPassValueState", "None");
			this.getView().getModel("appView").setProperty("/VSTConfirmPass", "");
			this.openDialog().then(function (oDialog) {
				// 
				oDialog.close();
			});
		},

		// * this function is read the all appUsers data.
		getUserData: function () {
			BusyIndicator.show(0);
			var oModel = this.getView().getModel();  //default model get at here
			// var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			var that = this;
			oModel.read('/AppUsers', {
				urlParameters: {
					$select: "id,FirstName,LastName,UserName,EmailId,Role,Blocked,Status,Company,CompanyName,CompanyId,phoneNumber,Website,CompanyLogo,Title,CompanyAddress,GSTNO,__metadata"
				},
				success: function (data) {

					data.results.forEach(user => {
						if (user.Role === "SalesPerson" && user.CompanyId) {
							user.CompanyId = user.CompanyId
								.split(",")   // split into array
								.map(id => id.trim()); // clean spaces // convert to object format
						}
					});
					that.getView().getModel("appView").setProperty("/userDetails", data.results);
					// that.getView().getModel("appView").setProperty("/userName", data.results[0].UserName); 
					// if(sUserRole === "Admin"){
					// 	that.getView().getModel("appView").setProperty("/companyselBoxVis" ,false);
					// }
					BusyIndicator.hide();
				},
				error: function (error) {
					BusyIndicator.hide();
					that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});
		},

		// * this function is make the update call for change the approval status.
		onApproveCustomer: function (oEvent) {
			var selectedItem = oEvent.getParameter("selectedItem").getKey();
			var opath = oEvent.getSource().getBindingContext("appView").getPath();
			var oid = this.getView().getModel("appView").getProperty(opath);
			var custid = oid.id;
			
			const oModel = this.getView().getModel();
			const sEntityPath = `/AppUsers('` + custid + "')"; // Replace with the appropriate entity set name and ID
			const oData = {
				"Status": selectedItem
			};

			oModel.update(sEntityPath, oData, {
				success: function (data) {
					MessageToast.show("User " + selectedItem + " selected successfully");

				},
				error: function (error) {
					this.middleWare.errorHandler(error, that);
					// console.error("PATCH request failed");
				}
			});
		},
		//* For search Company from Combo Box

        onSelectCompanyForSearch: function(oEvent){

            

            var oSelectedItem = oEvent.getParameter("value");

            if(!oSelectedItem){

                var oFilter = new sap.ui.model.Filter("CompanyName", sap.ui.model.FilterOperator.NEQ, oSelectedItem);

                var oTable = this.getView().byId("idProductsTable");

                var oBinding = oTable.getBinding("items");

                oBinding.filter([oFilter]);

            }else{

                var oFilter = new sap.ui.model.Filter("CompanyName", sap.ui.model.FilterOperator.EQ, oSelectedItem);

                var oTable = this.getView().byId("idProductsTable");

                var oBinding = oTable.getBinding("items");

                oBinding.filter([oFilter]);

            }

            },  

        //* for search Role from Combo Box

         onSelectRoleForSearch: function (oEvent) {

            

            var oSelectedItem = oEvent.getParameter("value");

            if(!oSelectedItem){

                var oFilter = new sap.ui.model.Filter("Role", sap.ui.model.FilterOperator.NEQ, oSelectedItem);

                var oTable = this.getView().byId("idProductsTable");

                var oBinding = oTable.getBinding("items");

                oBinding.filter([oFilter]);

            }else{

                var oFilter = new sap.ui.model.Filter("Role", sap.ui.model.FilterOperator.EQ, oSelectedItem);

                var oTable = this.getView().byId("idProductsTable");

                var oBinding = oTable.getBinding("items");

                oBinding.filter([oFilter]);

            }

            },

         //* for search name and email

         onSearchNameEmail: function (oEvent) {

            

            var sValue = oEvent.getParameter("query");

            if (!sValue) {

                var sValue = oEvent.getParameter("newValue")

            }

            var oFilter1 = new sap.ui.model.Filter("UserName", sap.ui.model.FilterOperator.Contains, sValue);

            var oFilter2 = new sap.ui.model.Filter("EmailId", sap.ui.model.FilterOperator.Contains, sValue);

            var oCombinedFilter = new sap.ui.model.Filter({

                filters: [oFilter1, oFilter2],

                and: false

            });

            var oTable = this.getView().byId("idProductsTable");

            var oBinding = oTable.getBinding("items");

            oBinding.filter(oCombinedFilter);

            },

		// * this function is make the update call for block and unblock the customer.
		onBlockCustomer: function (oEvent) {
			
			var state = oEvent.getParameter('state');
			var that = this;
			this.getView().getModel("appView").setProperty("/state", state)
			state = state === true ? 'No' : 'Yes';
			var opath = oEvent.getSource().getBindingContext("appView").getPath();
			var oid = this.getView().getModel("appView").getProperty(opath);
			var custid = oid.id;

			const oModel = this.getView().getModel();
			const sEntityPath = `/AppUsers('` + custid + "')"; // Replace with the appropriate entity set name and ID

			const oData = {
				"Blocked": state
			};

			oModel.update(sEntityPath, oData, {
				success: function (data) {
					that.getUserData();
					MessageToast.show("Customer Blocked Status is Changed Successfully")
				},
				error: function (error) {
					this.middleWare.errorHandler(error, that);
					MessageToast.show("Error while update the status")
				}
			});
			this.getView().getModel("appView").updateBindings();
			
			this.getView().byId("idProductsTable").getBinding("items").update;
		},

		// * this function is handling the image and convert into the base64 after that setinto the property.
		handleUploadPress: function (oEvent) {
			
			var files = oEvent.getParameter("files");
			var that = this;
			var oModel = this.getView().getModel("appView");
			var Data = oModel.getProperty("/userData");
			if(Data){
				oModel.setProperty("/logoUpdate", Data.Companylogo);
			}
			if (!files.length) {
			} else {
				var reader = new FileReader();
				reader.onload = function (e) {
					try {
						var vContent = e.currentTarget.result; //.result.replace("data:image/jpeg;base64,", "");
						// that.img.Content = vContent;
						var stream = that.getImageUrlFromContent(vContent);

						// that.getModel("appView").setProperty("/companyLogo", stream);
						oModel.setProperty("/LogoAvonUserProfile", vContent);
						oModel.setProperty("/streamUrlLogo", vContent)
						// var logo = oModel.getProperty("logoUpdate")	
						// var logoProperty = oModel.getProperty("/LogoAvonUserProfile");
						// var base64String = logoProperty.split(",")[1];
						// logo = base64String;
						oModel.updateBindings();
					} catch (jqXhr) {
						that.middleWare.errorHandler(jqXhr, that);
					}
				};
				reader.readAsDataURL(files[0]);
			}
		},

		// * this function works to show the logo when user clicks on the show logo button
		onLogo: function () {
			
			var oLogo = this.getModel("appView").getProperty("/streamUrlLogo");
			var stream = this.formatter.getImageUrlFromContent(oLogo);
			if (!this.lightBox) {
				this.lightBox = new sap.m.LightBox("lightBoxx", {
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

		// * this function will convert the base 64 image url into the stream url to show the image.
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

		// * this onSelect event works to show the passWord field in the Password Fragment.
		showPassField: function (oEvent) {
			
			var passSwitchState = oEvent.getParameter('state');
			this.getView().getModel("appView").setProperty("/passSwitchState", passSwitchState);
			var omodel = this.getView().getModel("appView");
			if (passSwitchState === false) {
				omodel.setProperty("/newPass", true);
				omodel.setProperty("/conPass", true);
			}
			else {
				omodel.setProperty("/newPass", false);
				omodel.setProperty("/conPass", false);
			}
		},

		// * this funciton handle the validation on the add user and open the password fragment to make call.
		openPassdialog: function () {
			
			
			var oModel = this.getView().getModel('appView');
			var bExistingData = oModel.getProperty('/existingData');

			if (!bExistingData) { // value is false
				// if user press add nee button
				this.userPassDialogValidation();
			} else if (bExistingData) {
				this.updateRowData();
			}
		},


		getSelectedUserDetails:function(){
			
			 var that= this;
			var oItem= this.getView().byId("idProductsTable").getSelectedItem();
			if(!oItem){
				MessageToast.show("Please select a user to delete")
			}else{

				var userDetails = oItem.getBindingContext("appView").getObject();
				var id = userDetails.id; 
				var userName = userDetails.UserName;
				var payload = {"id":id}
				this.getView().getModel("appView").setProperty("/userIdToDelete",id)
				MessageBox.confirm("Are you sure you want to delete " + userName + "?", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
					onClose: function (sAction) {
					  if(sAction === "OK"){
						that.middleWare.callMiddleWare("deleteAppUsersTable", "POST", payload)
						.then(function (data, status, xhr) {
							// 
							MessageToast.show("User Deleted Successfully");
							that.getUserData();
						})
						.catch(function (jqXhr, textStatus, errorMessage) {
							that.middleWare.errorHandler(jqXhr, that);
						});
					}
					else{
						  

					  }
					}
				  });
			}
		},

		// * At here we are getting  the companies all the app.  
		getCompanyName: function () {
			var oModel = this.getView().getModel();
			var that = this;
			oModel.read('/Company', {
				success: function (data) {

					that.getView().getModel("appView").setProperty("/companyNames", data.results);
				},
				error: function (error) {
					// Error callback
					that.middleWare.errorHandler(error, that);
					MessageToast.show("Error reading data");
				}
			});
		},

		userPassDialogValidation: function () {

			var oView = this.getView();
			var that = this;
			var oModel = this.getView().getModel('appView');
			var roleUSerSelected = oModel.getProperty('/selectedrole');
			var Email = this.oFormData.EmailId;
			var phone = this.oFormData.phoneNumber;
			var firstName = this.oFormData.FirstName;
			var lastName = this.oFormData.LastName;
			var address = this.oFormData.CompanyAddress;
			var billingCity = this.oFormData.BillingCity;
			var ShippingCity = this.oFormData.ShippingCity;
			var phoneRegex = /^\d{10}$/;
			var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			var selectedUsername = oModel.getProperty("/selectedUsername");
			if(!selectedUsername){
				oModel.setProperty("/selectedUsername",Email)
			}
			if (phone && !phone.match(phoneRegex)) {
				MessageToast.show("Phone number should be 10 digits");
				return;
			}
			if (Email && !Email.match(emailRegex)) {
				MessageToast.show("Please enter a valid email address");
				return;
			}

			if (!roleUSerSelected) {
				MessageToast.show("Please Select a Role for the New user");
				return;
			}
			if ((roleUSerSelected === "Admin"||roleUSerSelected === 'Factory Manager') && !Email) {
				MessageToast.show("Please enter the email address");
				return;
			};
			if (roleUSerSelected === "Customer" && (!Email || !phone || !firstName || !lastName || !address || !billingCity || !ShippingCity)) {
				MessageToast.show("Please enter the required fields");
				return;
			}

			if (roleUSerSelected === "Factory Manager" && (!Email)) {
				MessageToast.show("Please enter the required fields");
				return;
			}

			this.openDialog().then(function (oDialog) {
				oDialog.open();
			});
		},

		// * this fucntion will do a update call when admin edit the user data.
		updateRowData: function() {
			
			var oModel = this.getView().getModel("appView");
			var dModel = this.getView().getModel();
			var that = this;
			var dataModel = this.getView().getModel("appView").getProperty("/userData");
			var logoProperty = this.getView().getModel("appView").getProperty("/LogoAvonUserProfile");
			delete dataModel.Company;
			delete dataModel.__metadata;
			if (!logoProperty) {
				var Companylogo = dataModel.Companylogo;
				dataModel.Companylogo = Companylogo;
			} else {
				var base64String = logoProperty.split(",")[1];
				dataModel.Companylogo = base64String;
			}
		
			var userId = dataModel.id;
			const sEntityPath = `/AppUsers('${userId}')`; // Replace with the appropriate entity set name and ID
		
			dModel.update(sEntityPath, dataModel, {
				success: function(data) {
					MessageToast.show("Customer updated successfully");
					that.getUserData();
					that.onReject();
					oModel.updateBindings();
				},
				error: function(error) {
					console.error("PATCH request failed", error);
					MessageToast.show("Failed to update customer");
				}
			});
		},
		

		// * this fucntion load and open the Adduserpass fragment dialog at here.
		openDialog: function () {
			var oView = this.getView();
			var that = this;
			if (!this.passDialog) {
				this.passDialog = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.userDetailScreenFragment.AddUserPass",
					controller: this
				}).then(function (oPassDialog) {
					oView.addDependent(oPassDialog);
					return oPassDialog;
				}.bind(this));
			}
			// this.passDialog.then(function (oPassDialog) {
			// 		oPassDialog.open();
			// });
			return this.passDialog;
		},

		onUserEdit: function () {
			
			var userData = this.getView().getModel("appView").getProperty("/userData");
            this.seledtedUserData = JSON.parse(JSON.stringify(userData));
			var omodel = this.getView().getModel("appView");
			omodel.setProperty('/userupdateBtn', true);
			omodel.setProperty('/userCancelBtn', true);
			omodel.setProperty('/editableFields', true);
			omodel.setProperty('/EmailVisible', false);
			omodel.setProperty('/RoleField', true);
			omodel.setProperty('/enabledCompanyLogo', true);
			omodel.setProperty('/LogoShowButton', true);
			omodel.setProperty('/userEditBtn', false);
			omodel.setProperty('/logoImgVis', true);

		},

		// * this fucntion will get the entity data and bind the data into the edit user fragment.
		rowItemsPressUser: function (oEvent) {
            
			var oParameter = oEvent.getParameter('listItem');
			var oPath = oEvent.getParameter("listItem").getBindingContextPath();
            this.bindingPath = oPath;
			var omodel = this.getView().getModel("appView");
			var sData = oParameter.getBindingContext('appView').getObject();
			omodel.setProperty('/userData', sData)
			var oView = this.getView();
			var that = this;

			this.openUserDialog().then(function (userAddFrag) {
				
				userAddFrag.bindElement('appView>/userData');
				omodel.setProperty('/existingData', true);
				omodel.setProperty('/TitleUserAdd', "Edit User");
				omodel.setProperty('/userupdateBtn', false);
				omodel.setProperty('/userCancelBtn', true);
				omodel.setProperty('/editableFields', false);
				omodel.setProperty('/EmailVisible', false);
				omodel.setProperty('/RoleField', false);
				omodel.setProperty('/enabledCompanyLogo', false);
				omodel.setProperty('/LogoShowButton', false);
				omodel.setProperty('/UserlogoVis', true);
				omodel.setProperty('/userEditBtn', true);
				omodel.setProperty('/editCompName', false);
				omodel.setProperty('/logoImgVis', true);
				userAddFrag.open();
			});
			omodel.updateBindings();
			
		},

		// * it make a post call to create the user via admin side.
		AddCustomers: function () {
			
			var that = this;
			var oModel = this.getView().getModel("appView")
			var newPassword = oModel.getProperty("/newPassValue");
			var conNewPassword = oModel.getProperty("/confirmPassValue");

			var payload = this.oFormData;
			
				
					this.middleWare.callMiddleWare("addUserAdmin", "POST", payload)
						.then(function (data, status, xhr) {
							// 
							MessageToast.show("User Created Successfully");
							that.onReject();
							that.onRejectPass();
							that.getUserData();
						})
						.catch(function (jqXhr, textStatus, errorMessage) {
							that.middleWare.errorHandler(jqXhr, that);
						});
				
			
		},

		// * this fucntion will addtheuser via admin side on save button and handle the validation too.
		onAddUserViaAdmin: function (oEvent) {

			

			var oModel = this.getView().getModel("appView");

			var checkSwitchStatus = oModel.getProperty("/newPass");

			var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

			if (checkSwitchStatus) {

				var pass = oModel.getProperty("/newPassValue");

				var Conpass = oModel.getProperty("/confirmPassValue");

				if (!pass && !Conpass) {

					MessageToast.show("Please Enter the Password");
					return;

				} else {

					if (!passwordRegex.test(pass)) {

						this.getView().getModel("appView").setProperty("/newPassValueState", "Error");

						this.getView().getModel("appView").setProperty("/VSTNewPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");
						MessageToast.show("Password is not Validated");
						return;

					} else {

						this.getView().getModel("appView").setProperty("/newPassValueState", "None");

						this.getView().getModel("appView").setProperty("/VSTNewPass", "");

					}

					if (!passwordRegex.test(Conpass)) {

						this.getView().getModel("appView").setProperty("/confirmPassValueState", "Error");

						this.getView().getModel("appView").setProperty("/VSTConfirmPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");
						MessageToast.show("Password is not Validated");
						return;

					} else {

						this.getView().getModel("appView").setProperty("/confirmPassValueState", "None");

						this.getView().getModel("appView").setProperty("/VSTConfirmPass", "");

					}

				}
				if (pass != Conpass) {

					this.getView().getModel("appView").setProperty("/newPassValueState", "Error");

					this.getView().getModel("appView").setProperty("/VSTNewPass", "Password didn't match");

					this.getView().getModel("appView").setProperty("/confirmPassValueState", "Error");

					this.getView().getModel("appView").setProperty("/VSTConfirmPass", "Password didn't match");
					MessageToast.show("Password is not Validated");
						return;

				} else {
					this.getView().getModel("appView").setProperty("/newPassValueState", "None");
					
					this.getView().getModel("appView").setProperty("/VSTNewPass", "");
					
					this.getView().getModel("appView").setProperty("/confirmPassValueState", "None");
					
					this.getView().getModel("appView").setProperty("/VSTConfirmPass", "");
					
					// this.AddCustomers();
				}
				this.getView().getModel("appView").updateBindings();





			}

			// else if (pass === Conpass) {

			//  // MessageToast.show("Matched Password");

			// }

			if (this.isResetPassword == true) {

				this.resetPassExistingUser(Conpass);

			}

			else {

				this.oFormData.PassWord = Conpass;
				this.oFormData.Status = "Approved";
				
				this.AddCustomers();
				

			}




		},
		//when select comapny this function trigger
		onSelectComPany: function (oEvent) {

			var oSelectedCompanyName = oEvent.getParameter("selectedItem").getText();
			var oSelectedCompanyKey = oEvent.getParameter("selectedItem").getKey();
            var rowData = oEvent.getSource().getParent().getBindingContext("appView").getObject();
            rowData.CompanyName = oSelectedCompanyName;
			var oModel = this.getView().getModel();
			var that = this;
			var id = oEvent.getSource().getBindingContext("appView").getObject().id;
			const sEntityPath = `/AppUsers('${id}')`;
			const payload = {
				"CompanyId": oSelectedCompanyKey,
				"CompanyName": oSelectedCompanyName
			};

			oModel.update(sEntityPath, payload, {
				success: function (data) {
					MessageToast.show("successfully Company Assigned to User");
				},
				error: function (error) {
					this.middleWare.errorHandler(error, that);
					// console.error("PATCH request failed");
				}
			});
		},
		//Urjent Requirement
		onSelectComPanySalesPerson: function (oEvent) {

			var aSelectedCompanyNames = oEvent.getParameter("selectedItems");
			let companies = aSelectedCompanyNames.map(item => item.getProperty('key')).join(',');

			var oModel = this.getView().getModel();
			var that = this;
			var id = oEvent.getSource().getBindingContext("appView").getObject().id;
			const sEntityPath = `/AppUsers('${id}')`;
			const payload = {
				"CompanyId": companies,
				"CompanyName": "Multi"
			};

			oModel.update(sEntityPath, payload, {
				success: function (data) {
					MessageToast.show("successfully Company Assigned to User");
				},
				error: function (error) {
					this.middleWare.errorHandler(error, that);
					// console.error("PATCH request failed");
				}
			});
		},
		//this update call for set company data to appUser tabel
		resetPassExistingUser: function (pass) {
			
			var oModel = this.getView().getModel("appView")
			var newPassword = oModel.getProperty("/newPassValue");
			var conNewPassword = oModel.getProperty("/confirmPassValue");
			var that = this;
			var password = pass;
			this.payload.password = password;
			if(newPassword === conNewPassword){
				

					this.middleWare.callMiddleWare("sendEmailExistUser", "POST", this.payload)
						.then(function (data, status, xhr) {
							// 
							MessageToast.show("Mail Sent Succefully");
							that.onRejectPass();
		
						})
						.catch(function (jqXhr, textStatus, errorMessage) {
							that.middleWare.errorHandler(jqXhr, that);
						});
				
			}
			else{
				MessageToast.show("Please Check Your Fields")
			}

		},

		isResetPassword: null,
		SendEmailExistUser: function (oEvent) {
			
			var that = this;
			// var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
			var oRow = oEvent.getSource().getBindingContext('appView').getObject();
			var Email = oRow.EmailId;
			var id = oRow.TechnicalId;
			var name = oRow.UserName;
			if(!name){

				this.getView().getModel("appView").setProperty("/selectedUsername", Email);
			}else{

				this.getView().getModel("appView").setProperty("/selectedUsername", name);
			}
			// if (!passwordRegex.test(password)) {
			// 	MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");
			// 	return;
			//   }
			this.payload = {
				EmailId: Email,
				TechnicalId: id,
				password: ""
			};
			this.openDialog().then(function (oDialog) {
				that.isResetPassword = true;
				oDialog.open();
			});


			// this.middleWare.callMiddleWare("sendEmailExistUser", "POST", payload)
			// .then( function (data, status, xhr) {
			// 	// 
			// 	MessageToast.show("Mail Sent Succefully");
			// 	// that.onReject();
			// 	// that.onRejectPass();
			// })
			// .catch(function (jqXhr, textStatus, errorMessage) {
			// 	that.middleWare.errorHandler(jqXhr, that);
			// });
		},
		onLiveChnageNewPassValidation: function (oEvent) {
			var newValueNewPass = oEvent.getParameter("newValue");
            this.getView().getModel("appView").setProperty("/newPassValue", newValueNewPass);
			var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

			if (newValueNewPass === "") {

				this.getView().getModel("appView").setProperty("/newPassValueState", "None");

				this.getView().getModel("appView").setProperty("/VSTNewPass", "");

			} else if (!passwordRegex.test(newValueNewPass)) {

				// MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");

				this.getView().getModel("appView").setProperty("/newPassValueState", "Error");

				this.getView().getModel("appView").setProperty("/VSTNewPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");

				return;

			} else {

				this.getView().getModel("appView").setProperty("/newPassValueState", "None");

				this.getView().getModel("appView").setProperty("/VSTNewPass", "");

			}

			this.getView().getModel("appView").updateBindings();

		},

		onLiveChnageConfirmPassValidation: function (oEvent) {
            var valueOfNewPass = this.getView().getModel("appView").getProperty("/newPassValue");
			var newValueConfirmPass = oEvent.getParameter("newValue");
			this.getView().getModel("appView").setProperty("/confirmPassValue" , newValueConfirmPass);
			var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
            if(newValueConfirmPass === ""){
				this.getView().getModel("appView").setProperty("/confirmPassValueState", "None");
				this.getView().getModel("appView").setProperty("/VSTConfirmPass","");

            }
			else if (!passwordRegex.test(newValueConfirmPass)) {

				// MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");

				this.getView().getModel("appView").setProperty("/confirmPassValueState", "Error");

				this.getView().getModel("appView").setProperty("/VSTConfirmPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");

				return;

			}else if (newValueConfirmPass !== valueOfNewPass) {
				this.getView().getModel("appView").setProperty("/confirmPassValueState", "Error");

				this.getView().getModel("appView").setProperty("/VSTConfirmPass", "Value is not Matched");
				return;

			}
			 else {

				this.getView().getModel("appView").setProperty("/confirmPassValueState", "None");

				this.getView().getModel("appView").setProperty("/VSTConfirmPass", "");

			}

			this.getView().getModel("appView").updateBindings();




		}
	});
});