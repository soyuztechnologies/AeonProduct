sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (BaseController, JSONModel, MessageToast) {
	"use strict";
	// global variables
	var userId;
	var userRole;
	return BaseController.extend("ent.ui.ecommerce.controller.CustomerProfile", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("Profile").attachPatternMatched(this._matchedHandler, this);
		},

		_matchedHandler: function (oEvent) {
			
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader", true);
			this.getModel("appView").updateBindings();
			var oPath = oEvent.getParameter("name");
			if (oPath == "Profile") {
				this.getModel('appView').setProperty('/editableFields', false);
				this.getModel('appView').setProperty('/EmailVisible', false);
				this.getModel('appView').setProperty('/SaCaVisible', false);
				this.getModel('appView').setProperty('/RoleField', false);
				this.getModel('appView').setProperty('/enabledCompanyLogo', false);
			};
			this.getUserRoleData();
			this.getUserData();
			this.getModel("appView").updateBindings();
		},

		getUserData: function () {
			var that = this;
			this.middleWare.callMiddleWare("getUserProfileData", "get")
				.then(function (data, status, xhr) {
					
					// MessageToast.show("Data Reading......."+ data.role);
					var omodel =  that.getView().getModel('appView');
					 omodel.setProperty("/CustomerData", data.Appuser);
					var osimples = that.getView().byId("profile_Id");
					osimples.bindElement("appView>/CustomerData");
					that.getModel('appView').setProperty('/editableFields', false);
						userId = data.Appuser.id;
						userRole = data.Appuser.Role;
					if (userRole == "Admin") {
						that.getModel('appView').setProperty('/Passwordfield', false);
					};
					omodel.updateBindings();
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					
					that.middleWare.errorHandler(jqXhr, that);
				});
		},
		handleUploadPress: function (oEvent) {
			
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
						
						that.getModel("appView").setProperty("/companyLogo", stream);
						that.getModel("appView").setProperty("/LogoAvonProfile", vContent);
						that.getModel("appView").updateBindings();
					} catch (jqXhr) {
						that.middleWare.errorHandler(jqXhr, that);
					}
				};
				reader.readAsDataURL(files[0]);
			}
		},
		onLogo: function () {
			
			var oLogo = this.getModel("appView").getProperty("/LogoAvonProfile");
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
		getImageUrlFromContent: function(base64Stream) {
			if (base64Stream) {
			  var b64toBlob = function(dataURI) {
				try {
				  var byteString;
				  var dataURIParts = dataURI.split(',');
				  if (dataURIParts.length > 1) {
					byteString = atob(dataURIParts[1]);
				  } else {
					byteString = atob(dataURI);
				  }
				  var ab = new ArrayBuffer(byteString.length);
				  var ia = new Uint8Array(ab);
				  for (var i = 0; i < byteString.length; i++) {
					ia[i] = byteString.charCodeAt(i);
				  }
				  return new Blob([ab], { type: 'image/jpeg' });
				} catch (e) {
				  console.error("Failed to decode Base64 string:", e);
				  return null;
				}
			  };
		  
			  var x = b64toBlob(base64Stream);
			  if (x) {
				return URL.createObjectURL(x);
			  }
			}
			return null;
		  },
		  
		updateCustomerData: function () {
			
			var that = this;
			const oModel = this.getView().getModel();
			var appmodel = this.getView().getModel("appView");
			var datamodel = this.getView().getModel("appView").getProperty("/CustomerData");
			var logoProperty = this.getView().getModel("appView").getProperty("/LogoAvonProfile");
			if (!logoProperty){
				var Companylogo = datamodel.Companylogo;
				datamodel.Companylogo = Companylogo;
			}
			else{
            var base64String = logoProperty.split(",")[1];
			datamodel.Companylogo = base64String;
			}
			const sEntityPath = `/AppUsers('${userId}')`; 

			oModel.update(sEntityPath, datamodel, {
				success: function (data) {
					sap.m.MessageToast.show("Customer updated successfully");
					appmodel.setProperty('/SaCaVisible', false);
					appmodel.setProperty('/editVisible', true);
					appmodel.setProperty('/editableFields', false);
					appmodel.setProperty('/enabledCompanyLogo', false);
					appmodel.updateBindings();
				},
				error: function (error) {
					console.error("PATCH request failed");
				}
			});
		},

		onCancelProfile: function () {
			
			var oModel  = this.getView().getModel('appView');
		    oModel.setProperty("/CustomerData",this.globaData );
				oModel.setProperty('/editableFields', false);
				oModel.setProperty('/EmailVisible', false);
				oModel.setProperty('/SaCaVisible', false);
				oModel.setProperty('/RoleField', false);
				oModel.setProperty('/enabledCompanyLogo', false);
				oModel.setProperty('/editVisible', true);
			
		},

		onEditCustomerProfile: function () {
			var that = this;
			this.getModel('appView').setProperty('/editableFields', true);
			this.getModel('appView').setProperty('/SaCaVisible', true);
			this.getModel('appView').setProperty('/enabledCompanyLogo', true);
			this.getModel('appView').setProperty('/editVisible', false);
			var omodel =  that.getView().getModel('appView');
			var data= omodel.getProperty("/CustomerData"); 

			this.globaData = JSON.parse(JSON.stringify(data));
		},


	});
});