sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/BusyIndicator",

], function (BaseController, MessageToast, JSONModel, Fragment, BusyIndicator) {
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
			oModel.setProperty("/conPass", false);
			this.getView().getModel("appView").setProperty("/newPassValueState", "None");

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
			debugger
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
				success: function (data) {
					that.getView().getModel("appView").setProperty("/userDetails", data.results);
					that.getView().getModel("appView").setProperty("/userName", data.results[0].UserName);
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
					MessageToast.show("Customer " + selectedItem + " selected successfully");

				},
				error: function (error) {
					this.middleWare.errorHandler(error, that);
					// console.error("PATCH request failed");
				}
			});
		},

		// * this function is make the update call for block and unblock the customer.
		onBlockCustomer: function (oEvent) {
			debugger;
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
			debugger;
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
			debugger;
			var oLogo = this.getModel("appView").getProperty("/streamUrlLogo");
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
			debugger;
			var oModel = this.getView().getModel('appView');
			var bExistingData = oModel.getProperty('/existingData');

			if (!bExistingData) { // value is false
				// if user press add nee button
				this.userPassDialogValidation();
			} else if (bExistingData) {
				this.updateRowData();
			}
		},

		// * At here we are getting  the companies all the app.  
		getCompanyName: function () {
            debugger;
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
			if (roleUSerSelected === "Admin" && !Email) {
				MessageToast.show("Please enter the email address");
				return;
			};
			if (roleUSerSelected === "Customer" && (!Email || !phone || !firstName || !lastName || !address || !billingCity || !ShippingCity)) {
				MessageToast.show("Please enter the required fields");
				return;
			}

			if (roleUSerSelected === "Factory Manager" && (!Email || !phone)) {
				MessageToast.show("Please enter the required fields");
				return;
			}

			this.openDialog().then(function (oDialog) {
				oDialog.open();
			});
		},

		// * this fucntion will do a update call when admin edit the user data.
		updateRowData: function () {
			debugger;
			var oModel = this.getView().getModel("appView");
			var dModel = this.getView().getModel();
			var dataModel = oModel.getProperty("/userData");
			var logoProperty = this.getView().getModel("appView").getProperty("/LogoAvonUserProfile");
			if (!logoProperty) {
				var Companylogo = dataModel.Companylogo;
				dataModel.Companylogo = Companylogo;
			}
			else {
				var base64String = logoProperty.split(",")[1];
				dataModel.Companylogo = base64String;
			}

			var userId = dataModel.id;
			const sEntityPath = `/AppUsers('${userId}')`; // Replace with the appropriate entity set name and ID

			dModel.update(sEntityPath, dataModel, {
				success: function (data) {
				       MessageToast.show("Customer updated successfully");
					// that.getModel('appView').setProperty('/SaCaVisible', false);
					// that.getModel('appView').setProperty('/editVisible', true);
					// that.getModel('appView').setProperty('/editableFields', false);
					that.onReject();
					oModel.updateBindings();
				},
				error: function (error) {
					console.error("PATCH request failed");
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
            debugger;
			var oParameter = oEvent.getParameter('listItem');
			var oPath = oEvent.getParameter("listItem").getBindingContextPath();
            this.bindingPath = oPath;
			var omodel = this.getView().getModel("appView");
			var sData = oParameter.getBindingContext('appView').getObject();
			omodel.setProperty('/userData', sData)
			var oView = this.getView();
			var that = this;

			this.openUserDialog().then(function (userAddFrag) {
				debugger;
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

			var payload = this.oFormData;

			this.middleWare.callMiddleWare("addUserAdmin", "POST", payload)
				.then(function (data, status, xhr) {
					// debugger
					MessageToast.show("User Created Successfully");
					that.onReject();
					that.onRejectPass();
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

				var pass = oModel.getProperty("/conPassWord");

				var Conpass = oModel.getProperty("/NewPassword");

				if (!pass && !Conpass) {

					MessageToast.show("Please Enter the Password");

				} else {

					if (!passwordRegex.test(pass)) {

						this.getView().getModel("appView").setProperty("/newPassValueState", "Error");

						this.getView().getModel("appView").setProperty("/VSTNewPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");

					} else {

						this.getView().getModel("appView").setProperty("/newPassValueState", "None");

						this.getView().getModel("appView").setProperty("/VSTNewPass", "");

					}

					if (!passwordRegex.test(Conpass)) {

						this.getView().getModel("appView").setProperty("/confirmPassValueState", "Error");

						this.getView().getModel("appView").setProperty("/VSTConfirmPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");

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

				} else {

					this.getView().getModel("appView").setProperty("/newPassValueState", "None");

					this.getView().getModel("appView").setProperty("/VSTNewPass", "");

					this.getView().getModel("appView").setProperty("/confirmPassValueState", "None");

					this.getView().getModel("appView").setProperty("/VSTConfirmPass", "");

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

				this.AddCustomers();

			}




		},
		//when select comapny this function trigger
		onSelectComPany: function (oEvent) {
			debugger;
			var oSelectedCompanyName = oEvent.getParameter("selectedItem").getText();
			var oSelectedCompanyKey = oEvent.getParameter("selectedItem").getKey();
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
		//this update call for set company data to appUser tabel
		resetPassExistingUser: function (pass) {
			debugger
			var that = this;
			var password = pass;
			this.payload.password = password;
			this.middleWare.callMiddleWare("sendEmailExistUser", "POST", this.payload)
				.then(function (data, status, xhr) {
					// debugger
					MessageToast.show("Mail Sent Succefully");
					that.onRejectPass();

				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});

		},

		isResetPassword: null,
		SendEmailExistUser: function (oEvent) {

			var that = this;
			// var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
			var oRow = oEvent.getSource().getBindingContext('appView').getObject();
			var Email = oRow.EmailId;
			var id = oRow.TechnicalId;
			var name = oRow.UserName;
			this.getView().getModel("appView").setProperty("/selectedUsername", name);
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
			// 	// debugger
			// 	MessageToast.show("Mail Sent Succefully");
			// 	// that.onReject();
			// 	// that.onRejectPass();
			// })
			// .catch(function (jqXhr, textStatus, errorMessage) {
			// 	that.middleWare.errorHandler(jqXhr, that);
			// });
		},
		onLiveChnageNewPassValidation: function (oEvent) {
			var newValue = oEvent.getParameter("newValue");

			var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

			if (newValue === "") {

				this.getView().getModel("appView").setProperty("/newPassValueState", "None");

				this.getView().getModel("appView").setProperty("/VSTNewPass", "");

			} else if (!passwordRegex.test(newValue)) {

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

			var newValue = oEvent.getParameter("newValue");

			var passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

			if (!passwordRegex.test(newValue)) {

				// MessageToast.show("Password must be at least 8 characters long and contain at least one letter, one number, and one special character (!@#$%^&*)");

				this.getView().getModel("appView").setProperty("/confirmPassValueState", "Error");

				this.getView().getModel("appView").setProperty("/VSTConfirmPass", "Password must be at least 8 characters long and contain at least one capital letter, one small letter, one number, and one special character");

				return;

			} else {

				this.getView().getModel("appView").setProperty("/confirmPassValueState", "None");

				this.getView().getModel("appView").setProperty("/VSTConfirmPass", "");

			}

			this.getView().getModel("appView").updateBindings();




		}
	});
});