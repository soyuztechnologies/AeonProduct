sap.ui.define([
	"./BaseController",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/BusyIndicator"

], function (BaseController, MessageToast, MessageBox, JSONModel, Fragment, BusyIndicator) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.companyDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("companyDetails").attachPatternMatched(this._matchedHandler, this);
		},

		// * RMh funciton
		_matchedHandler: function (oEvent) {
			var oModel = this.getView().getModel("appView");
			oModel.setProperty("/layout", "OneColumn");
			oModel.setProperty("/visibleHeader", true);
			oModel.setProperty("/hamburgerVisibility", true);
			oModel.setProperty("/sideExpanded", false);
			// oModel.setProperty("/aeonHeaderVis", true);
			this.getUserRoleData();
			this.getCompanyName();
			// this.onSelectItem();
		},
		// get for Company
		// also when click on refresh
		//    getCompanyName: function () {
		//     var oModel = this.getView().getModel();
		//     var that = this;
		//     oModel.read('/Company', {
		//         success: function (data) {
		//             that.getView().getModel("appView").setProperty("/company", data.results);
		//             // MessageToast.show("Company Updated");
		//         },
		//         error: function (error) {
		//             // Error callback
		//             that.middleWare.errorHandler(error, that);
		//             MessageToast.show("Error reading data");
		//         }
		//     });
		// }, 
		//     // * this function will get the role form the company details fragment.
		//     onRoleChange: function (oEvent) {
		// 
		//         // var keyAlwaysCustomer = "Customer" ;
		//         var oSelectedKey = "Customer";
		//         var oModel = this.getView().getModel("appView");
		//         oModel.setProperty('/selectedrole', oSelectedKey)
		//     },  
		// click on delete to delete the company
		getSelectedCompanyDetails: function () {
			var that = this;
			var oModel = this.getView().getModel();
			var oItem = this.getView().byId("idCompanyTable").getSelectedItem();

			if (!oItem) {
				MessageToast.show("Please select a Company to delete");
			} else {
				var companyDetails = oItem.getBindingContext("appView").getObject();
				var id = companyDetails.id;
				var userName = companyDetails.CompanyName;

				this.getView().getModel("appView").setProperty("/companyIdToDelete", id);

				MessageBox.confirm("Are you sure you want to delete " + userName + "?", {
					actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
					onClose: function (sAction) {
						if (sAction === MessageBox.Action.OK) {
							oModel.remove(`/Company('${id}')`, {
								success: function () {
									// Do something after successful deletion
									MessageToast.show("Company Deleted Successfully");
									that.getCompanyName();
									oModel.updateBindings();
									BusyIndicator.hide();
								},
								error: function (error) {
									BusyIndicator.hide();
									that.middleWare.errorHandler(error, that);
									MessageToast.show("Error deleting data");
								}
							});
						}
					}
				});
			}
		},
		// * this function will load the smae fragement for user add and edit the user data too.

		openUserDialog: function () {
			var oView = this.getView();
			var that = this;
			if (!this.userAdd) {
				this.userAdd = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.companyDetailScreenFragment.AddCompany",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			return this.userAdd;
		},
		//  * this fucntion will opne the add user fragment and create the payload too and set into the property.
		AddCompDialog: function () {
			
			var that = this;
			var oModel = this.getView().getModel('appView');
			this.oFormData = {
				"CompanyName": "",
				"EmailAddress": "",
				"FirstName": "",
				"LastName": "",
				"CompanyAddress": "",
				"GstNumber": "",
				"CompanyLogo": "",
				"Website": "",
				"PhoneNo": ""
			},
				// the whole form data will be set to the  "AddUserData" property in appView model.
				oModel.setProperty("/AddUserData", this.oFormData);
			oModel.updateBindings();
			// this will open the dilaog to add the user 
			this.openUserDialog().then(function (userAddFrag) {
				userAddFrag.open();
				userAddFrag.bindElement('appView>/AddUserData');
				oModel.setProperty('/userupdateBtn', true);
				oModel.setProperty('/TitleUserAdd', "Add Company Details");
				oModel.setProperty('/selectedrole', "Customer")
				oModel.setProperty('/existingData', false);
				oModel.setProperty('/userEditBtn', false);
				oModel.setProperty('/userCancelBtn', true);
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
		onUserEdit: function () {
			
			var userData = this.getView().getModel("appView").getProperty("/userData");
			this.seledtedUserData = JSON.parse(JSON.stringify(userData));
			var oModel = this.getView().getModel("appView");
			var that = this;
			oModel.setProperty('/editableFields', true);
			oModel.setProperty("/userupdateBtn", true);
			oModel.setProperty("/userEditBtn", false);
		},
		// * this function is close the dialog on add user and edit user.
		onReject: function () {
			
			this.getView().getModel("appView").setProperty("/streamUrlLogo", "");
			this.getView().byId('uploadCompanyLogo').setValue("")
			this.editVis = this.getView().getModel("appView").getProperty("/userEditBtn");
			this.addUserTitle = this.getView().getModel("appView").getProperty("/TitleUserAdd");
			if (this.addUserTitle === "Add Company Details") {
			}
			else if (this.editVis === false) {
				this.getView().getModel("appView").setProperty(this.bindingPath, this.seledtedUserData)
			}
			var oModel = this.getView().getModel('appView');
			var bExistingData = oModel.getProperty('/existingData');
			oModel.updateBindings();
			this.openUserDialog().then(function (userAddFrag) {
				userAddFrag.close();
				// that.getView().getModel('appView').setProperty('/existingData',false);
			});
		},
		//this fragment open when click jobs in company detail
		onClickJobsShowBtn: function () {
			
			var oView = this.getView();
			var that = this;
			if (!this.addComp) {
				this.addComp = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.allPrinterScreenFragment.JobAllPrinter",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			return this.addComp;
		},
		openAllPrinterJobDialog: async function (oEvent) {
			var details = oEvent.getSource().getBindingContext("appView").getObject();
			this.getView().getModel('appView').setProperty('/compNameForFilter', details.CompanyName);
			await this.getJobsDataByCompanyFilter();
			var filteredJobsbyCompany = this.getView().getModel("appView").getProperty("/filteredData");
			if(filteredJobsbyCompany.length <=0){
				sap.m.MessageToast.show("No Jobs Assigned");
				return;
			}
			
			this.onClickJobsShowBtn().then(function (userDialog) {
				userDialog.open();


			});
		},
		onCloseJobFrag: function () {
			
			this.getView().getModel("appView").setProperty("/filteredData", "");
			this.onClickJobsShowBtn().then(function (userDialog) {
				userDialog.close();
			});
		},
		//this fragment opens when click on users
		onClickUserShowBtn: function () {

			var oView = this.getView();
			var that = this;
			if (!this.showUser) {
				this.showUser = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.userDetailScreenFragment.UserDetailsUser",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			return this.showUser;
		},
		openUserDetailsDialog: async function (oEvent) {
			
			var details = oEvent.getSource().getBindingContext("appView").getObject();
			this.getView().getModel('appView').setProperty('/compNameForFilteredUser', details.CompanyName);
			await this.getUserData();
			var filteredUserData = this.getView().getModel("appView").getProperty("/filteredUserData");
			if(filteredUserData.length <=0){
				sap.m.MessageToast.show("No Users Assigned");
				return;
			}


			// var selectedCompanyUser = this.getView().getModel("appView").getProperty("/filteredUserData");
			this.onClickUserShowBtn().then(function (showUserDialog) {
				showUserDialog.open();


			});
		},
		onCloseUserFrag: function () {
			this.getView().getModel("appView").setProperty("/filteredUserData", "");
			this.onClickUserShowBtn().then(function (showUserDialog) {
				showUserDialog.close();
			});
		},
		onSaveCompanyDetails: function () {
			
			var that = this;
			var oModel = this.getView().getModel();
			var selectedButtonTitle = this.getView().getModel('appView').getProperty('/TitleUserAdd');
			var logo = this.getView().getModel("appView").getProperty("/streamUrlLogo");
			if (selectedButtonTitle === "Add Company Details") {
				var addCompanyDetailsData = this.getView().getModel('appView').getProperty('/AddUserData');
				addCompanyDetailsData.CompanyLogo = logo;
				if (!addCompanyDetailsData.CompanyName || !addCompanyDetailsData.EmailAddress) {

					sap.m.MessageToast.show("Please Enter The Required Fields");
					return;
				}
				oModel.create('/Company', addCompanyDetailsData, {
					success: function (data) {
						sap.m.MessageToast.show("Company Saved successfully");
						that.onReject();
						that.getCompanyName();
					},
					error: function (error) {
						// Error callback
						that.middleWare.errorHandler(error, that);
						// MessageToast.show("Error reading data");
					}
				});
			} else {

				var updateCompanyDetails = this.getView().getModel("appView").getProperty("/userData");
				updateCompanyDetails.CompanyLogo = logo;
				delete updateCompanyDetails.appUser;
				delete updateCompanyDetails.job;
				delete updateCompanyDetails.__metadata;
				var companyId = updateCompanyDetails.id;
				if (!updateCompanyDetails.CompanyName || !updateCompanyDetails.EmailAddress) {
					sap.m.MessageToast.show("Please Enter The Required Fields");
					return;
				}
				const sEntityPath = `/Company('${companyId}')`;
				oModel.update(sEntityPath, updateCompanyDetails, {
					success: function (data) {
						sap.m.MessageToast.show("Company updated successfully");
						that.onReject();
						that.getCompanyName();

					},
					error: function (error) {
						console.error("PATCH request failed");
					}
				});
			}

			// oModel.create('/Company', payLoad, {
			// 	success: function (data) {

			// 	},
			// 	error: function (error) {
			// 	  // Error callback
			// 	  that.middleWare.errorHandler(error, that);
			// 	  // MessageToast.show("Error reading data");
			// 	}
			//   });



		},
		// * this function is read the all appUsers data.
		getUserData: function () {
			
			BusyIndicator.show(0);
			var oModel = this.getView().getModel();  //default model get at here
			var filteredUserDatas = [];
			var that = this;

			return new Promise(function (resolve, reject) {
				oModel.read('/AppUsers', {
					success: function (data) {
						var selectedCompany = that.getView().getModel("appView").getProperty("/compNameForFilteredUser");
						that.getView().getModel("appView").setProperty("/userDetails", data.results);
						data.results.forEach(element => {
							if (selectedCompany === element.CompanyName) {
								filteredUserDatas.push(element);
							}
						});
						that.getView().getModel("appView").setProperty("/filteredUserData", filteredUserDatas);
						resolve(data)
						BusyIndicator.hide();
					},
					error: function (error) {
						BusyIndicator.hide();
						that.middleWare.errorHandler(error, that);
						MessageToast.show("Error reading data");
						reject(error);
					}
				});
			});
			// oModel.read('/AppUsers', {
			// 	success: function (data) {
			// 		var selectedCompany = that.getView().getModel("appView").getProperty("/compNameForFilteredUser");
			// 		that.getView().getModel("appView").setProperty("/userDetails", data.results);
			// 		data.results.forEach(element => {
			// 			if (selectedCompany === element.CompanyName) {
			// 				filteredUserDatas.push(element);
			// 			}
			// 		});
			// 		that.getView().getModel("appView").setProperty("/filteredUserData", filteredUserDatas);
			// 		// BusyIndicator.hide();
			// 	},
			// 	error: function (error) {
			// 		BusyIndicator.hide();
			// 		that.middleWare.errorHandler(error, that);
			// 		MessageToast.show("Error reading data");
			// 	}
			// });
		},
		//get all jobs here
		getJobsDataByCompanyFilter: function () {

			var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
			var id = this.getModel('appView').getProperty('/UserId');
			var payLoad = {
				id,
			}
			var oFilter = encodeURIComponent('{"where":{"CompanyId":{"neq": null}}}');
			var url = 'api/Jobs?filter=' + oFilter
			var filteredJobDatas = [];
			// sPath = `/Jobs('${id}')/Company`;
			var that = this;
			return new Promise(function (resolve, reject) {
				that.middleWare.callMiddleWare("getJobsWithCompanyDetails", "get")
				.then(function (data, status, xhr) {
					var selectedCompany = that.getView().getModel("appView").getProperty("/compNameForFilter");
					that.getView().getModel("appView").setProperty("/jobsData", data);
					data.forEach(element => {
						if (selectedCompany === element.Company.CompanyName) {
							filteredJobDatas.push(element);
						}
					});
					that.getView().getModel("appView").setProperty("/filteredData", filteredJobDatas);
					resolve(data)
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
					resolve(jqXhr)
				});
			});
		},
		// getJobsDataByCompanyFilter: function () {

		// 	var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
		// 	var id = this.getModel('appView').getProperty('/UserId');
		// 	var payLoad = {
		// 		id,
		// 	}
		// 	var oFilter = encodeURIComponent('{"where":{"CompanyId":{"neq": null}}}');
		// 	var url = 'api/Jobs?filter=' + oFilter
		// 	var filteredJobDatas = [];
		// 	// sPath = `/Jobs('${id}')/Company`;
		// 	var that = this;
		// 	this.middleWare.callMiddleWare("getJobsWithCompany", "get")
		// 		.then(function (data, status, xhr) {
		// 			var selectedCompany = that.getView().getModel("appView").getProperty("/compNameForFilter");
		// 			that.getView().getModel("appView").setProperty("/jobsData", data);
		// 			data.forEach(element => {
		// 				if (selectedCompany === element.Company.CompanyName) {
		// 					filteredJobDatas.push(element);
		// 				}
		// 			});
		// 			that.getView().getModel("appView").setProperty("/filteredData", filteredJobDatas);

		// 		})
		// 		.catch(function (jqXhr, textStatus, errorMessage) {
		// 			that.middleWare.errorHandler(jqXhr, that);
		// 		});
		// },

		//this opens when click on job that appere in allprinterjob fragment
		onClickJobInJobAllPrinterFrag: function () {

			var oView = this.getView();
			var that = this;
			if (!this.showJobDetails) {
				this.showJobDetails = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.printingDetailFragment.AllJobs",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			return this.showJobDetails;
		},
		onClickItemFrag: function (oEvent) {
			
			this.onClickJobInJobAllPrinterFrag().then(function (showJobClickInAllPrintFragDialog) {
				showJobClickInAllPrintFragDialog.open();
				// var oSimpleForm = that.getView().byId('allJobDetails')
				// oSimpleForm.bindElement('appView>/Jobs');


			});
		},
		onnReject: function () {
			this.onClickJobInJobAllPrinterFrag().then(function (showJobClickInAllPrintFragDialog) {
				showJobClickInAllPrintFragDialog.close();
			});
		},
		// * this fucntion will get the entity data and bind the data into the edit user fragment.
		rowItemsPressCompany: function (oEvent) {
			
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
				omodel.setProperty('/TitleUserAdd', "Edit Company Details");
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
		onSearchCompanyByName: function (oEvent) {
			
			var sValue = oEvent.getParameter("query");
			if (!sValue) {
				var sValue = oEvent.getParameter("newValue")
			}
			var oFilter1 = new sap.ui.model.Filter("CompanyName", sap.ui.model.FilterOperator.Contains, sValue);
			var oCombinedFilter = new sap.ui.model.Filter({
				filters: [oFilter1],
				and: false
			});
			var oTable = this.getView().byId("idCompanyTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(oCombinedFilter);

		},
		// * this function is handling the image and convert into the base64 after that setinto the property.
		handleUploadPress: function (oEvent) {
			
			var files = oEvent.getParameter("files");
			var that = this;
			var oModel = this.getView().getModel("appView");
			var Data = oModel.getProperty("/userData");
			if (Data) {
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
			var oModel = this.getView().getModel("appView");
			if (!oLogo) {

				oLogo = oModel.getProperty("/userData").CompanyLogo;
			}
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
		// oGetAgru: function () {
		// 	var that = this;
		// 	var oModel = this.getView().getModel();
		// 	var sUserRole = this.getView().getModel("appView").getProperty('/UserRole');
		// 	oModel.read("/Jobs('" + this.oArgs + "')", {
		// 		success: function (data) {

		// 			if(data.Urgent === "Yes"){
		// 				that.getView().getModel("appView").setProperty("/asUrgentVis", false);
		// 				// that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", true);
		// 			}
		// 			else{
		// 				// that.getView().getModel("appView").setProperty("/asUrgentVis", true);
		// 				that.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);
		// 			}
		// 			that.getView().getModel("appView").setProperty("/Jobs", data);
		// 			that.getView().getModel("appView").setProperty("/foilingData", data.foilBlocks);
		// 			that.getView().getModel("appView").setProperty("/embossingData", data.embossing);
		// 			that.getView().getModel("appView").setProperty("/spotUvData", data.positive);
		// 			that.loadForm();
		// 			that.getView().getModel("appView").setProperty("/status", data.status);
		// 			if (!data.status) {
		// 				if (sUserRole == "Admin" || sUserRole == "Raw Material Head" ||sUserRole == "Factory Manager") {
		// 					that.getView().getModel("appView").setProperty("/addBtnVisible", true);
		// 				} else {
		// 					that.getView().getModel("appView").setProperty("/addBtnVisible", false);
		// 				}
		// 			} else {
		// 				return;
		// 			}

		// 		},
		// 		error: function (error) {

		// 			that.middleWare.errorHandler(error, that);
		// 		}
		// 	});
		// },

	});
});