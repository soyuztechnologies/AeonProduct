sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"ent/ui/ecommerce/dbapi/dbapi",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/Device"
], function (Controller, History, dbapi, Fragment, JSONModel, MessageToast, formatter, Filter, FilterOperator, MessageBox, Device) {
	"use strict";

	return Controller.extend("ent.ui.ecommerce.controller.BaseController", {
		middleWare: dbapi,
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		/**
		 * @override
		 */
		formatter: formatter,
		onInit: function () {

			// this.getShopCartData(true);
			// Controller.prototype.onInit.apply(this, arguments);


		},
		getUserRoleData: function () {
			
			var that = this;
			return new Promise(function (myResolve, myReject) {
				that.middleWare.callMiddleWare("getUserRole", "get")
					.then(function (data, status, xhr) {

						myResolve(data);

						that.getModel('appView').setProperty('/UserEmail', data.role.EmailId);
						that.getModel('appView').setProperty('/UserRole', data.role.Role);
						that.getModel('appView').setProperty('/UserId', data.role.id);
						that.userRole();
						// };
					})
					.catch(function (jqXhr, textStatus, errorMessage) {

						// that.middleWare.errorHandler(jqXhr, that);
						myReject();
					});
			});

		},

		userRole: function () {
			debugger;
			var sUserRole = this.getModel('appView').getProperty('/UserRole');
			if (sUserRole === "Admin") {
				this.getView().getModel("appView").setProperty('/upDocNavVisb', true);
				this.getView().getModel("appView").setProperty('/profilNavVisb', true);
				this.getView().getModel("appView").setProperty('/useDeltNavVisb', true);
				this.getView().getModel("appView").setProperty('/profilNavVisb', true);
				// this.getView().getModel("appView").setProperty('/asUrgentVis', false);
				this.getView().getModel("appView").setProperty("/asUrgentVis", false);
			this.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);
			}
			else if (sUserRole === "Customer") {
				this.getView().getModel("appView").setProperty('/upDocNavVisb', false);
				this.getView().getModel("appView").setProperty('/welPrintNavVisb', true);
				this.getView().getModel("appView").setProperty('/useDeltNavVisb', false);
				this.getView().getModel("appView").setProperty('/profilNavVisb', true);
				this.getView().getModel("appView").setProperty('/asUrgentVis', true);
				this.getView().getModel("appView").setProperty('/addJobStatusVis', false);
				this.getView().getModel('appView').setProperty('/modifybtnvis', false);
			}
			else if (sUserRole === "Factory Manager") {
				this.getView().getModel("appView").setProperty('/upDocNavVisb', true);
				this.getView().getModel("appView").setProperty('/asUrgentVis', false);
				this.getView().getModel("appView").setProperty('/welPrintNavVisb',true);
				this.getView().getModel("appView").setProperty('/useDeltNavVisb', true);
				this.getView().getModel("appView").setProperty('/profilNavVisb',true);
				this.getView().getModel("appView").setProperty("/asUrgentVis", false);
			this.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);
			}
			else if (sUserRole === "Raw Material Head" || "Printing Head" || "Post Press Head" || "Dispatch Head") {
				this.getView().getModel("appView").setProperty('/upDocNavVisb', false);
				this.getView().getModel("appView").setProperty('/welPrintNavVisb', true);
				this.getView().getModel("appView").setProperty('/useDeltNavVisb', false);
				this.getView().getModel("appView").setProperty('/profilNavVisb', true);
				this.getView().getModel("appView").setProperty('/asUrgentVis', false);
				this.getView().getModel("appView").setProperty("/asUrgentVis", false);
			this.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);

			}
			if(sUserRole === "Artwork Head") {
				this.getView().getModel("appView").setProperty('/upDocNavVisb', false);
				this.getView().getModel("appView").setProperty('/welPrintNavVisb', true);
				this.getView().getModel("appView").setProperty('/useDeltNavVisb', false);
				this.getView().getModel("appView").setProperty('/profilNavVisb', true);
				this.getView().getModel("appView").setProperty('/asUrgentVis', false);
				this.getView().getModel("appView").setProperty('/asUrgentVis', false);
				this.getView().getModel("appView").setProperty("/asUrgentVis", false);
			this.getView().getModel("appView").setProperty("/RemoveasUrgentVis", false);

			}
			if(sUserRole === "Accounts Head") {
				
				
				this.getView().getModel("appView").setProperty('/browseVisArtwork', true);
				

			}
			this.getModel("appView").updateBindings();
		},

		setAppModel: function () {
			var oViewModel =
			// new JSONModel(
			{
				busy: false,
				delay: 0,
				layout: "OneColumn",
				previousLayout: "",
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				},
				logOut: true,
				CustomerButton: {
					Icon: "",
					Type: "Default",
					Tooltip: "",
					Text: ""
				},
				VH_salesPerson: [],
				VH_OHEM: [],
				VH_Industry: [],
				VH_Groups: [],
				VH_PayTermsGrpCode: [],
				VH_Country: [],
				VH_State: [],
				SalesOQDetail: []

			}
			// );
			var iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.getModel("appView").setData(oViewModel);
			this.getModel("appView").setSizeLimit(50000);
			// var fnSetAppNotBusy = function () {
			// 	oViewModel.setProperty("/busy", false);
			// 	oViewModel.setProperty("/delay", iOriginalBusyDelay);
			// };
		},
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getOwnerComponent().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
				this.getRouter().navTo("tiles", {}, true);
			}
		},
		onLogOut: function () {
			var that = this;
			this.middleWare.callMiddleWare("logout", "POST", {})
				.then(function (data, status, xhr) {
					sessionStorage.session_id = null;
					that.getModel("appView").setProperty("/layout", "OneColumn");
					that.getModel("appView").setProperty("/logOut", true);
					that.getRouter().navTo("login");
				})
				.catch(function (jqXhr, textStatus, errorMessage) {

					that.middleWare.errorHandler(jqXhr, that);
				});
		},
		onHomePress: function () {
			var that = this;
			that.getModel("appView").setProperty("/layout", "OneColumn");
			that.getModel("appView").setProperty("/logOut", true);
			that.getRouter().navTo("tiles");
		},
		onThemeChange: function (oEvent) {
			sap.ui.getCore().applyTheme('sap_horizon')
		},
		onThemeChangeDark: function (oEvent) {
			sap.ui.getCore().applyTheme('sap_fiori_3_dark');
		},
		onDatabasePress: function (oEvent) {
			var oMessage = this.getModel("appView").getProperty("/loginDatabaseName");
			MessageToast.show(oMessage);

		},
		convertFileToUrl: function (vContent) {
			var regex = /data:(\w.*);base64,/gm;
			var m = regex.exec(vContent),
				decodedPdfContent = atob(vContent.replace(regex, ""));
			var byteArray = new Uint8Array(decodedPdfContent.length);
			for (var i = 0; i < decodedPdfContent.length; i++) {
				byteArray[i] = decodedPdfContent.charCodeAt(i);
			}
			var blob = new Blob([byteArray.buffer], {
				type: m ? m[1] : 'application/pdf'
			});
			jQuery.sap.addUrlWhitelist("blob");
			return URL.createObjectURL(blob);
		},
		getCustomData: function (callback) {
			var that = this;
			this.middleWare.callMiddleWare("/CustomAttribute", "GET", {})
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/customData", data);

					that.getModel("appView").updateBindings();
					if (callback) {
						callback();
					}
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
		},
		setGlobalNavItemVisible: function () {
			var oRole = this.getModel("appView").getProperty("/customData/roles");
			if (oRole.toString().includes('Customer')) {
				this.getModel("appView").setProperty("/sideNav/customerTabs", true);
				this.getModel("appView").setProperty("/sideNav/adminTabs", false);
			}
			else {
				this.getModel("appView").setProperty("/sideNav/customerTabs", false);
				this.getModel("appView").setProperty("/sideNav/adminTabs", true);
			}
			this.getModel("appView").updateBindings();
		},
		getUserData: function () {
			var oUserId = this.getModel("appView").getProperty("/customData/Code");
			this.middleWare.callMiddleWare("/resource/ENT_UDO_USERS('" + oUserId + "')", "GET", {})
				.then(function (data, status, xhr) {
					if (data.U_CompanyLogo) {
						var stream = this.formatter.getImageUrlFromContent(data.U_CompanyLogo);
						data.url = stream;
						// that.getModel("appView").setProperty("/ENT_UDO_USER/url", stream);

					}

					this.getModel("appView").setProperty("/ENT_UDO_USER", data);
					const email = data.U_Email;
					this.getModel("appView").setProperty("/logEmail", email);
					const oStatus = data.U_Status;
					this.getModel("appView").setProperty("/userStatus", oStatus);
					if (oStatus == "N" || oStatus == "D") {
						this.getModel("appView").setProperty("/sideNav/invoiceList", false);
					} else {
						this.getModel("appView").setProperty("/sideNav/invoiceList", true);
					}

					this.loadBankCode(data.U_BankCountr);
					this.getModel("appView").updateBindings();
				}.bind(this))
				.catch(function (jqXhr, textStatus, errorMessage) {
					this.middleWare.errorHandler(jqXhr, this);
				}.bind(this));
		},
		getUsersData: function () {
			// var oUserId=this.getModel("appView").getProperty("/customData/Code");
			this.middleWare.callMiddleWare("/resource/ENT_UDO_USERS", "GET", {})
				.then(function (data, status, xhr) {

					this.getModel("appView").setProperty("/USERS", data);
					this.getModel("appView").updateBindings();
				}.bind(this))
				.catch(function (jqXhr, textStatus, errorMessage) {
					this.middleWare.errorHandler(jqXhr, this);
				}.bind(this));
		},
		onUserPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();
			if (!this._pPopover) {
				this._pPopover = Fragment.load({
					name: "ent.ui.ecommerce.fragments.UserMenu",
					controller: this,
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this._pPopover.then(function (oPopover) {
				oPopover.openBy(oButton);
			});
		},
		onUserPasswordChange: function (oEvent) {
			var oButton = oEvent.getSource();
			if (oButton.getId().includes("idMangerPasswordUpdate")) {
				this.EmpId = oButton.getParent().getBindingContext("appView").getObject().empID;
			}
			else {
				this.EmpId = this.getModel("appView").getProperty("/customData/EmpID");
			}
			var oView = this.getView();

			if (!this.passwordFrag) {
				this.passwordFrag = Fragment.load({
					name: "ent.ui.ecommerce.fragments.PasswordChange",
					controller: this,
				}).then(function (oPopover) {
					oView.addDependent(oPopover);

					return oPopover;
				});
			}
			this.passwordFrag.then(function (oPopover) {
				var oJson = new JSONModel({ "password": "", "confirmPassword": "" });
				oPopover.setModel(oJson);
				oPopover.open();
			});
		},
		onPasswordChangeOkay: function (oEvent) {
			var oData = oEvent.getSource().getModel().getData();
			// this.EmpId
			if (oData.password !== oData.confirmPassword) {
				MessageToast.show(this.getModel("i18n").getProperty("PasswordMatch"));
				return;
			}
			var oPaylaod = {
				"empId": this.EmpId,
				"password": oData.password
			}
			var that = this;
			// that.getView().setBusy(true);
			this.middleWare.callMiddleWare("/changePassword", "POST", oPaylaod)
				.then(function (data, status, xhr) {
					// that.getView().setBusy(false);
					MessageToast.show(this.getModel("i18n").getProperty("PasswordUpdate"));
					that.passwordFrag.then(function (oPopover) {
						oPopover.close();
					});
					// var session_id = data.entSessionId;
					// sessionStorage.session_id = session_id;
					// sessionStorage.userName = data.userName;
					// sessionStorage.userID = data.customAttributes.EmpID;
					// that.getModel("appView").setProperty("/customData", data.customAttributes);
					// that.getModel("appView").setProperty("/User", sessionStorage.userName);
					// that.getRouter().navTo("tiles");
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});

		},
		onPasswordChangeCancel: function (oEvent) {
			this.passwordFrag.then(function (oPopover) {

				oPopover.close();
			});
		},
		onSeePasswordClick: function (oEvent) {
			
			var oInput = oEvent.getSource();
			if (oInput.getType() === "Password") {
				setTimeout(function () {
					oInput.setType("Password");
					oInput.setValueHelpIconSrc("sap-icon://show");
				}, 2000)
				oInput.setType("Text");
				oInput.setValueHelpIconSrc("sap-icon://hide");
			}
			else {
				oInput.setType("Password");
				oInput.setValueHelpIconSrc("sap-icon://show");
			}
		},
		callClientValueHelps: function () {
			this.getVH_SalesPerson();
			this.getVH_OHEM();
			this.getVH_Industry();
			this.getVH_Groups();
			this.getVH_PayTermsGrpCode();
			this.getVH_Country();
			this.getVH_State();
		},
		getVH_SalesPerson: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_salesPerson", "GET", {})
					.then(function (data, status, xhr) {
						this.getModel("appView").setProperty("/VH_salesPerson", data);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));
		},
		getVH_Subject: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_Subject", "GET", {})
					.then(function (data, status, xhr) {
						var oData = {
							"Name": "", "Code": -1, "Active": ""
						}
						data.unshift(oData);
						this.getModel("appView").setProperty("/VH_Subject", data);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));
		},
		getVH_User: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_User", "GET", {})
					.then(function (data, status, xhr) {
						this.getModel("appView").setProperty("/VH_User", data);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));
		},
		getVH_ActivityType: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_ActivityType", "GET", {})
					.then(function (data, status, xhr) {
						this.getModel("appView").setProperty("/VH_ActivityType", data);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));
		},
		getVH_OHEM: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_OHEM", "GET", {})
					.then(function (data, status, xhr) {
						var oData = {
							"empID": "", "Code": "", "lastName": "", "firstName": ""
						}
						data.unshift(oData);
						this.getModel("appView").setProperty("/VH_OHEM", data);
						resolve(data)
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));
		},
		getVH_Industry: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_Industry", "GET", {})
					.then(function (data, status, xhr) {
						this.getModel("appView").setProperty("/VH_Industry", data);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));

		},
		getVH_Groups: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_Groups", "GET", {})
					.then(function (data, status, xhr) {
						this.getModel("appView").setProperty("/VH_Groups", data);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));

		},
		getVH_PayTermsGrpCode: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_PayTermsGrpCode", "GET", {})
					.then(function (data, status, xhr) {
						this.getModel("appView").setProperty("/VH_PayTermsGrpCode", data);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));

		},
		getVH_Country: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_Country", "GET", {})
					.then(function (data, status, xhr) {
						this.getModel("appView").setProperty("/VH_Country", data);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));

		},
		loadBankCode: function (countryCode) {
			return new Promise(function (resolve, reject) {
				this.middleWare.callMiddleWare("/resource/Banks?$select=BankCode,BankName&$filter=CountryCode eq '" + countryCode + "'", "GET", {})
					.then(function (data) {
						this.getModel("appView").setProperty("/VH_BankCode", data);
						this.getModel("appView").updateBindings();
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr) {
						this.middleWare.errorHandler(jqXhr, this);

					}.bind(this));
			}.bind(this));
		},
		getVH_ContactPerson: function (oQuery, oAddArray) {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_ContactPerson?CardCode=" + oQuery, "GET", {})
					.then(function (data, status, xhr) {
						var oData;
						if (!oAddArray) {
							oData = this.getModel("appView").getProperty("/VH_ContactPerson");
							for (let index = 0; index < data.length; index++) {
								const element = data[index];
								oData.push(element);
							}

							// this.getView().byId("idContactPersonSelect").getBinding("items").refresh();
						}
						else {
							oData = data;
						}
						this.getModel("appView").setProperty("/VH_ContactPerson", oData);
						this.getModel("appView").updateBindings();
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));
		},
		getVH_State: function (oQuery) {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/VH_State?Country=" + oQuery, "GET", {})
					.then(function (data, status, xhr) {
						this.getModel("appView").setProperty("/VH_State", data);
						this.getModel("appView").updateBindings();
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));

		},
		formatOwnerCode: async function (value) {
			var oData = this.getModel("appView").getProperty("/VH_OHEM");
			if (!oData) {
				try {
					var d = await this.getVH_OHEM();
					// this.formatOwnerCode(value)	
				} catch (error) {
					this.middleWare.errorHandler(error, this);
				}
			}
			if (value) {

				oData = this.getModel("appView").getProperty("/VH_OHEM");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.empID.toString() === value.toString()) {
						let str = element.firstName + " " + element.lastName;
						return str;
					}
				}
			}

		},
		formatSalesCode: async function (value) {

			var oData = this.getModel("appView").getProperty("/VH_User");
			if (!oData) {
				try {
					var d = await this.getVH_User();
					// this.formatOwnerCode(value)	
				} catch (error) {
					this.middleWare.errorHandler(error, this);
				}
			}
			if (value) {
				oData = this.getModel("appView").getProperty("/VH_User");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.USERID.toString() === value.toString()) {
						let str = element.U_NAME;
						return str;
					}
				}
			}

		},
		formatFrontOffice: async function (value) {
			var oData = this.getModel("appView").getProperty("/VH_OHEM");
			if (!oData) {
				try {
					var d = await this.getVH_OHEM();
					// this.formatFrontOffice(value)	
				} catch (error) {
					this.middleWare.errorHandler(error, this);
				}
			}
			if (value) {

				oData = this.getModel("appView").getProperty("/VH_OHEM");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.Code.toString() === value.toString()) {
						let str = element.firstName + " " + element.lastName;
						return str;
					}
				}
			}

		},
		formatSalesPerson: async function (value) {
			var oData = this.getModel("appView").getProperty("/VH_salesPerson");
			if (!oData) {
				try {
					var d = await this.getVH_SalesPerson();
					// this.formatSalesPerson(value)	
				} catch (error) {
					this.middleWare.errorHandler(error, this);
				}
			}
			if (value) {

				oData = this.getModel("appView").getProperty("/VH_salesPerson");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.SlpCode.toString() === value.toString()) {
						let str = element.SlpName;
						return str;
					}
				}
			}
		},
		formatIndustry: async function (value) {
			var oData = this.getModel("appView").getProperty("/VH_Industry");
			if (!oData) {
				try {
					var d = await this.getVH_Industry();
					// this.formatSalesPerson(value)	
				} catch (error) {
					this.middleWare.errorHandler(error, this);
				}
			}
			if (value) {
				oData = this.getModel("appView").getProperty("/VH_Industry");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.IndCode.toString() === value.toString()) {
						let str = element.IndDesc;
						return str;
					}
				}
			}
		},
		formatSubject: async function (value) {
			var oData = this.getModel("appView").getProperty("/VH_Subject");
			if (!oData) {
				try {
					var d = await this.getVH_Subject();
					// this.formatSalesPerson(value)	
				} catch (error) {
					this.middleWare.errorHandler(error, this);
				}
			}
			if (value) {
				oData = this.getModel("appView").getProperty("/VH_Subject");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.Code.toString() === value.toString()) {
						let str = element.Name;
						return str;
					}
				}
				if (value.toString() === "-1") {
					return '';
				}
			}
		},
		formatActivityType: function (value) {
			var oData = this.getModel("appView").getProperty("/VH_ActivityType");
			if (!oData) {
				// try {
				// 	var d=await this.getVH_ActivityType();
				// 	// this.formatSalesPerson(value)	
				// } catch (error) {
				// 	this.middleWare.errorHandler(error,this);
				// }
				oData = [];
			}
			if (value) {
				// oData=this.getModel("appView").getProperty("/VH_ActivityType");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.Code.toString() === value.toString()) {
						var str = element.Name;
						return str;
					}
				}
			}
			// var 
			return '';
		},
		formatClient: function (value) {
			var oData = this.getModel("appView").getProperty("/ClientList");
			if (value) {
				// oData=this.getModel("appView").getProperty("/VH_ActivityType");
				for (var index = 0; index < oData.length; index++) {
					var element = oData[index];
					if (element.CardCode.toString() === value.toString()) {
						var str = element.CardName;
						// +"("+element.CardCode+")";
						return str;
					}
				}
			}
			return '';
		},
		// formatGroup:async function(value){
		// 	if(value){
		// 		var oData=this.getModel("appView").getProperty("/VH_Groups");
		// 		if(!oData){
		// 			try {
		// 				var d=await this.getVH_Groups();
		// 				// this.formatSalesPerson(value)	
		// 			} catch (error) {
		// 				this.middleWare.errorHandler(error,this);
		// 			}
		// 		}	
		// 		oData=this.getModel("appView").getProperty("/VH_Groups");
		// 		for (var index = 0; index < oData.length; index++) {
		// 			var element = oData[index];
		// 			if (element.GroupCode.toString() === value.toString()) {
		// 				let str=element.GroupName;
		// 				return str;
		// 			}
		// 		}
		// 	}
		// },
		// formatPayTermsGrpCode:async function(value){
		// 	if(value){
		// 		var oData=this.getModel("appView").getProperty("/VH_PayTermsGrpCode");
		// 		if(!oData){
		// 			try {
		// 				var d=await this.getVH_PayTermsGrpCode();
		// 				this.formatPayTermsGrpCode(value)	
		// 			} catch (error) {
		// 				this.middleWare.errorHandler(error,this);
		// 			}
		// 		}	
		// 		oData=this.getModel("appView").getProperty("/VH_PayTermsGrpCode");
		// 		for (var index = 0; index < oData.length; index++) {
		// 			var element = oData[index];
		// 			if (element.GroupNum.toString() === value.toString()) {
		// 				let str=element.PymntGroup;
		// 				return str;
		// 			}
		// 		}
		// 	}
		// },
		formatPayTerm: async function (value1, value2) {
			var oData2 = this.getModel("appView").getProperty("/VH_PayTermsGrpCode");
			if (!oData2) {
				try {
					var d = await this.getVH_PayTermsGrpCode();
					// this.formatPayTermsGrpCode(value)	
				} catch (error) {
					this.middleWare.errorHandler(error, this);
				}
			}
			var oData1 = this.getModel("appView").getProperty("/VH_Groups");
			if (!oData1) {
				try {
					var d = await this.getVH_Groups();
					// this.formatSalesPerson(value)	
				} catch (error) {
					this.middleWare.errorHandler(error, this);
				}
			}
			if (value1) {
				oData2 = this.getModel("appView").getProperty("/VH_PayTermsGrpCode");
				oData1 = this.getModel("appView").getProperty("/VH_Groups");
				for (var index = 0; index < oData2.length; index++) {
					var element2 = oData2[index];
					if (element2.GroupNum.toString() === value2.toString()) {
						for (let j = 0; j < oData1.length; j++) {
							const element1 = oData1[j];
							if (element1.PayMethCod.toString() === value1.toString()) {
								let str = element1.PayMethCod + " - " + element1.Descript + " - " + element2.PymntGroup;
								return str;
							}

						}
						// let str=element2.PymntGroup;
						// return str;
					}
				}
			}
		},
		// getUsersData: function () {
		// 	var that = this;

		// 	that.getModel("appView").setProperty("/userTileVisibility", true);
		// 	this.middleWare.callMiddleWare("/users", "GET", {})
		// 		.then(function (data, status, xhr) {

		// 			that.getModel("appView").setProperty("/users", data);
		// 			if (data.length === 0) {
		// 				that.getModel("appView").setProperty("/userTileVisibility", false);
		// 			}


		// 		})
		// 		.catch(function (jqXhr, textStatus, errorMessage) {

		// 			that.middleWare.errorHandler(jqXhr, that);
		// 		});
		// },
		getClientList: function () {
			var that = this;
			// if(!that.getModel("appView").getProperty("/ClientList"))
			{
				this.middleWare.callMiddleWare("/ClientList", "GET", {})
					.then(function (data, status, xhr) {
						that.getModel("appView").setProperty("/ClientListLength", data.length);
						that.getModel("appView").setProperty("/ClientList", data);
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr, that);
					});
			}

		},
		getVatCode: async function () {
			try {
				var that = this;
				var oItem = this.getModel("appView").getProperty("/CartData");
				if (oItem) {
					var oItemCode = oItem.map(({ ItemCode }) => "'" + ItemCode + "'");

					var data = await this.middleWare.callMiddleWare("/getVATRATE?ItemCode=" + oItemCode, "GET", {}).then();
					// var odec =parseInt(data).toFixed(2);
					// return data;
					for (let index = 0; index < oItem.length; index++) {
						const element = oItem[index];
						let oArr = data.filter(function (item) {
							if (item.ItemCode == element.ItemCode) {
								return item;
							}
						});
						element.VatCode = oArr ? oArr[0].Rate : "0"
					}
					var sum = 0;
					var fSum = 0;
					var tVAT = 0;
					for (let index = 0; index < oItem.length; index++) {
						const element = oItem[index];
						// if(element.LineTotal>=0)
						{
							sum += parseFloat(element.LineTotal);
							let xSum = parseFloat(element.LineTotal) * (1 + (parseInt(element.VatCode) / 100));
							fSum += xSum;
							let vat = parseFloat(element.LineTotal) * ((parseInt(element.VatCode) / 100));
							tVAT += vat;
						}
					}

					this.getModel("appView").setProperty('/TotalDoc', sum);
					this.getModel("appView").setProperty('/VAT', tVAT.toFixed(2));
					this.getModel("appView").setProperty('/FinalTotal', fSum);
					this.getModel("appView").setProperty("/CartData", oItem);
					this.getModel("appView").updateBindings();
					// this.getVatCode();
					return 0;
				}

			} catch (error) {

			}


		},
		getEntUserParms: function () {
			var that = this;
			if (!that.getModel("appView").getProperty("/U_ENT_PORTAL_PARAMS")) {
				this.middleWare.callMiddleWare("/U_ENT_PORTAL_PARAMS", "GET", {})
					.then(function (data, status, xhr) {
						that.getModel("appView").setProperty("/U_ENT_PORTAL_PARAMS", data);
						// that.getModel("appView").setProperty("/ClientList",data);
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr, that);
					});
			}
		},
		onCartPress: function (oEvent) {
			this.getShopCartData();
			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (!this.cartPopover) {
				this.cartPopover = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.CartPopupOver",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					// oPopover.bindElement("/ProductCollection/0");
					return oPopover;
				});
			}
			this.cartPopover.then(function (oPopover) {
				oPopover.openBy(oButton);
			});
		},
		onCartCloseButton: function () {
			this.cartPopover.then(function (oPopover) {
				oPopover.close();
			});
		},
		onCartConfirmButton: function () {
			this.getRouter().navTo("ShoppingCart", {});
		},
		onCartItemDelete: function (oEvent) {

			var oPath = oEvent.getParameter("listItem").getBindingContext("appView").getPath();
			var oIndex = oPath.split("/")[oPath.split("/").length - 1];
			var oCartData = this.getModel("appView").getProperty("/CartItems");
			oCartData.splice(parseInt(oIndex), 1);
			this.getModel("appView").setProperty("/CartItems", oCartData);
			this.getModel("appView").updateBindings();
			this.updateShopCartData();
			oEvent.getSource().getParent().openBy(this.getView().byId("idCartButton"));
		},
		getShopCartData: function (oForce) {
			var that = this;

			if (!that.getModel("appView").getProperty("/CheckoutCart") || oForce) {
				this.middleWare.callMiddleWare("/CheckoutCart", "GET", {}, 'F')
					.then(async function (data, status, xhr) {
						that.getModel("appView").setProperty("/CheckoutCart", data);
						that.getModel("appView").setProperty("/DocDueDate", null);
						that.getModel("appView").setProperty("/comment", undefined);
						that.getModel("appView").setProperty("/CardCode", undefined);
						that.getModel("appView").setProperty("/CartSalesQuat", undefined);
						that.getModel("appView").setProperty("/CartItems", undefined);
						that.getModel("appView").setProperty("/TotalCartData", '0');
						that.getModel("appView").updateBindings();
						if (data.U_CartContent) {
							var oCart = atob(data.U_CartContent);
							oCart = JSON.parse(oCart);
							that.getModel("appView").setProperty("/DocDueDate", oCart.Date ? new Date(oCart.Date) : null);
							that.getModel("appView").setProperty("/comment", oCart.Comment);
							that.getModel("appView").setProperty("/CardCode", oCart.Customer);
							that.getModel("appView").setProperty("/CartSalesQuat", oCart.SalesQuat);
							// that.getModel("appView").setProperty("/CartData",oCart.CartData); 
							that.getModel("appView").setProperty("/CartItems", oCart.CartData);
							that.getModel("appView").updateBindings();
							that.getModel("appView").setProperty("/CardCode", that.getModel("appView").getProperty("/MasterSelectedCustomer/CardCode"));
							// 		let result = oCart.CartData.map(({ ItemCode }) => ItemCode);
							// that.getModel("appView").setProperty("/TotalDiscount",oCart.DocDiscount); 
							let oCount = oCart.CartData ? oCart.CartData.length.toString() : '0';
							that.getModel("appView").setProperty("/TotalCartData", oCount);
							if (that.getView().getId().includes("ShoppingCart")) {
								// that.getModel("appView").setProperty("/CartData",oCart.CartData);
								// if(that.getView().byId("idCartCustomers").getSelectedKey()){
								that.getView().byId("idCartCustomers").fireChange();
								// }
							}
							if (that.getView().getId().includes("tiles")) {
								if (oCart.CartData && oCart.CartData.length > 0) {
									if (sessionStorage.showCartWarning !== "false") {
										MessageBox.warning(that.getView().getModel("i18n").getProperty("cartWarning"), {
											actions: [MessageBox.Action.OK, that.getView().getModel("i18n").getProperty("OpenCart")],
											emphasizedAction: MessageBox.Action.OK,
											onClose: function (sAction) {
												sessionStorage.showCartWarning = false;
												if (sAction === that.getView().getModel("i18n").getProperty("OpenCart")) {
													that.getView().byId("idCartButton").firePress();
													// MessageToast.show("Action selected: " + sAction);
												}

											}
										});
									}
								}
							}
							that.tableData = oCart.CartData;
						}
						// await that.getVatCode();
						// that.getModel("appView").setProperty("/ClientList",data);

					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr, that);
					});
			}
		},
		updateShopCartData: function (date, customer, salesQuatation, oComment, oDocDiscount, oBusy) {
			var that = this;
			if (that.getModel("appView").getProperty("/CartItems")) {
				var oCartData = that.getModel("appView").getProperty("/CartItems");

				date = date ? date : that.getModel("appView").getProperty("/DocDueDate");
				customer = customer ? customer : that.getModel("appView").getProperty("/CardCode");
				salesQuatation = salesQuatation == 0 ? salesQuatation : that.getModel("appView").getProperty("/CartSalesQuat");
				oComment = oComment ? oComment : that.getModel("appView").getProperty("/comment");
				// oDocDiscount=oDocDiscount?oDocDiscount:that.getModel("appView").getProperty("/TotalDiscount");
				var aPaylaod = {
					"Date": date,
					"Customer": customer,
					"SalesQuat": salesQuatation,
					"Comment": oComment,
					"CartData": oCartData,
					// "DocDiscount":oDocDiscount
				};
				var oCartString = JSON.stringify(aPaylaod);

				var oPaylaod = {
					"cartData": btoa(oCartString)
				};
				// btoa(JSONStringify(oCartData));
				// buf.toString('base64')
				// Buffer.from(str, 'base64')
				let abusoBusyoBusyoBusyy = oBusy ? 'T' : 'F'
				this.middleWare.callMiddleWare("/updateCart", "PUT", oPaylaod, oBusy)
					.then(function (data, status, xhr) {

						that.getShopCartData(true);

						// that.getModel("appView").setProperty("/CheckoutCart",data);
						// that.getModel("appView").setProperty("/ClientList",data);
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr, that);
					});
			}
		},
		clearShopCartData: function () {
			var that = this;
			if (that.getModel("appView").getProperty("/CartItems")) {
				var oPaylaod = {
					"cartData": ''
				};
				this.middleWare.callMiddleWare("/updateCart", "PUT", oPaylaod)
					.then(function (data, status, xhr) {
						that.getModel("appView").setProperty("/CartItems", undefined);
						that.getShopCartData(true);
						// that.getModel("appView").setProperty("/CheckoutCart",data);
						// that.getModel("appView").setProperty("/ClientList",data);
					})
					.catch(function (jqXhr, textStatus, errorMessage) {
						that.middleWare.errorHandler(jqXhr, that);
					});
			}
		},
		onCustomerPress: function (oEvent) {
			var oButton = oEvent.getSource(),
				oView = this.getView();
			if (!this.getModel("appView").getProperty("/ClientList")) {
				this.getClientList();
			}
			if (!this.custPopover) {
				this.custPopover = Fragment.load({
					id: oView.getId(),
					name: "ent.ui.ecommerce.fragments.CustomerPopupOver",
					controller: this
				}).then(function (oPopover) {
					oView.addDependent(oPopover);
					// oPopover.bindElement("/ProductCollection/0");
					return oPopover;
				});
			}
			this.custPopover.then(function (oPopover) {
				oPopover.openBy(oButton);
			});
		},
		onClientListSearchPopup: function (oEvent) {
			var sValue = oEvent.getParameter("newValue");
			var oFilter = new Filter({
				filters: [
					new Filter("CardCode", FilterOperator.Contains, sValue),
					new Filter("CardName", FilterOperator.Contains, sValue)
				],
				and: false,
			});
			var oBinding = this.getView().byId("idCustomerPoperOverList").getBinding("items");

			oBinding.filter(oFilter);
		},
		onCustomerPopOverSelect: function (oEvent) {

			var oViewId = this.getView().getId();
			var oSelectedItem = oEvent.getSource().getBindingContext("appView").getObject();
			var oSelectBinding = oEvent.getSource().getBindingContext("appView").getPath();
			// this.getView().byId('idCustomerButton').setText(oSelectedItem.CardName);
			// this.getView().byId('idCustomerButton').setTooltip(oSelectedItem.CardName);
			// this.getView().byId('idCustomerButton').setType("Critical");
			// this.getView().byId('idCustomerButton').setIcon("sap-icon://alert");
			this.getModel("appView").setProperty('/CustomerButton/Text', oSelectedItem.CardName);
			this.getModel("appView").setProperty('/CustomerButton/Tooltip', oSelectedItem.CardName);
			this.getModel("appView").setProperty('/CustomerButton/Type', "Critical");
			this.getModel("appView").setProperty('/CustomerButton/Icon', "sap-icon://alert");
			this.getModel("appView").setProperty("/MasterSelectedCustomer", { "CardCode": oSelectedItem.CardCode, "CardName": oSelectedItem.CardName, "Path": oSelectBinding });
			if (oViewId.includes("SalesQuotation")) {
				this.getView().byId("idgetSalesQuotationList").firePress();
			}
			// if (oViewId.includes("SalesOrderList")) {
			// this.getView().byId("idgetSalesOrderList").firePress();
			try {
				sap.ui.getCore().byId("container-ent_eCom_ui---SalesOrderList--idgetSalesOrderList").firePress();
			} catch (error) {

			}

			// }
			if (oViewId.includes("Items")) {
				this.getView().byId("idGetItemData").firePress();
			}
			if (oViewId.includes("ShoppingCart")) {
				this.getModel("appView").setProperty("/CardCode", this.getModel("appView").getProperty("/MasterSelectedCustomer/CardCode"));
				this.getView().byId("idCartCustomers").fireChange();
			}
			this.custPopover.then(function (oPopover) {
				oPopover.close();
			});
		},
		onCustPopupOverCloseButton: function () {
			this.custPopover.then(function (oPopover) {
				oPopover.close();
			});
		},
		onCustomerPopOverSelectionClear: function () {
			try {
				var oViewId = this.getView().getId();
				// var oText=this.getModel("i18n").getProperty("genericCustomer");
				// this.getView().byId('idCustomerButton').setText(oText);
				// this.getView().byId('idCustomerButton').setTooltip(oText);
				// this.getView().byId('idCustomerButton').setType("Default");
				// this.getView().byId('idCustomerButton').setIcon("sap-icon://globe");
				var oText = this.getModel("i18n").getProperty("genericCustomer");
				// this.getView().byId('idCustomerButton').setText(oText);
				this.getModel("appView").setProperty('/CustomerButton/Text', oText);
				// this.getView().byId('idCustomerButton').setTooltip(oText);
				this.getModel("appView").setProperty('/CustomerButton/Tooltip', oText);
				// this.getView().byId('idCustomerButton').setType("Default");
				this.getModel("appView").setProperty('/CustomerButton/Type', "Default");
				// this.getView().byId('idCustomerButton').setIcon("sap-icon://globe");
				this.getModel("appView").setProperty('/CustomerButton/Icon', "sap-icon://globe");
				this.getModel("appView").setProperty("/MasterSelectedCustomer", undefined);
				// if (oViewId.includes("SalesQuotation")) {
				// 	this.getView().byId("idgetSalesQuotationList").firePress();
				// }
				// if (oViewId.includes("SalesOrder")) {
				// 	this.getView().byId("idgetSalesOrderList").firePress();
				// }
				try {
					sap.ui.getCore().byId("container-ent_eCom_ui---SalesOrderList--idgetSalesOrderList").firePress();
				} catch (error) {

				}
				if (oViewId.includes("Items")) {
					this.getView().byId("idGetItemData").firePress();
					// this.getView().byId("tableSearchField").fireLiveChange();
				}
				this.custPopover.then(function (oPopover) {
					oPopover.close();
				});
			} catch (error) {
				this.middleWare.errorHandler(error, this);
			}

		},
		setCustomerButtonData: function () {
			try {
				var oData = this.getModel("appView").getProperty("/MasterSelectedCustomer/CardName");
				if (oData) {
					// this.getView().byId('idCustomerButton').setText(oData);
					this.getModel("appView").setProperty('/CustomerButton/Text', oData);
					// this.getView().byId('idCustomerButton').setTooltip(oData);
					this.getModel("appView").setProperty('/CustomerButton/Tooltip', oData);
					// this.getView().byId('idCustomerButton').setType("Critical");
					this.getModel("appView").setProperty('/CustomerButton/Type', "Critical");
					// this.getView().byId('idCustomerButton').setIcon("sap-icon://alert");
					this.getModel("appView").setProperty('/CustomerButton/Icon', "sap-icon://alert");
				} else {
					var oText = this.getModel("i18n").getProperty("genericCustomer");
					// this.getView().byId('idCustomerButton').setText(oText);
					this.getModel("appView").setProperty('/CustomerButton/Text', oText);
					// this.getView().byId('idCustomerButton').setTooltip(oText);
					this.getModel("appView").setProperty('/CustomerButton/Tooltip', oText);
					// this.getView().byId('idCustomerButton').setType("Default");
					this.getModel("appView").setProperty('/CustomerButton/Type', "Default");
					// this.getView().byId('idCustomerButton').setIcon("sap-icon://globe");
					this.getModel("appView").setProperty('/CustomerButton/Icon', "sap-icon://globe");
				}
				this.getModel("appView").updateBindings();
			} catch (error) {
				this.middleWare.errorHandler(error, this);
			}

		},
		onFullScreenPress: function () {
			this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			this.getView().byId("idFullScreenButton").setVisible(false);
			this.getView().byId("idExitFullScreenButton").setVisible(true);

		},
		onExitFullScreenPress: function () {
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getView().byId("idFullScreenButton").setVisible(true);
			this.getView().byId("idExitFullScreenButton").setVisible(false);
		},
		getSpecialPrice: function (CardCode, Items) {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/SpecialPrice?CardCode=" + CardCode + "&ItemCode=" + Items, "GET", {})
					.then(function (data, status, xhr) {
						resolve(data)
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));
		},
		getActivityList: function (oFilter, oSortItem) {
			var that = this;
			this.middleWare.callMiddleWare("/Activities", "GET", {})
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/ActivityListLength", data.length);
					that.getModel("appView").setProperty("/ActivityList", data);
					that.getModel("appView").updateBindings();
					var oCards = ``;
					for (let index = 0; index < data.length; index++) {
						const element = data[index];
						oCards += `'${element.CardCode}',`;
					}
					oCards = oCards.slice(0, -1);
					that.getVH_ContactPerson(oCards, true);
				})
				.catch(function (jqXhr, textStatus, errorMessage) {
					that.middleWare.errorHandler(jqXhr, that);
				});
		},
		toolbarButtonVisible: function () {
			var oViewId = this.getView().getId();
			this.getView().byId("idCartButton").setVisible(this.getModel("config").getProperty("/showFeaturesInDevelopment"));
			if (Device.system.desktop) {
				if (this.getModel("appView").getProperty("/layout") !== "OneColumn") {
					if (oViewId.includes("SalesDetail")) {
						var oId = "container-ent_eCom_ui---SalesOrderList";
					}
					if (oViewId.includes("ClientListDetail")) {
						var oId = "container-ent_eCom_ui---ClientList";
					}
					if (oViewId.includes("SalesOQU")) {
						var oId = "container-ent_eCom_ui---SalesOrderList";
					}
					if (oViewId.includes("ActivityDetails")) {
						var oId = "container-ent_eCom_ui---Activity";
					}
					sap.ui.getCore().byId(oId + "--idUserLink").setVisible(false);
					sap.ui.getCore().byId(oId + "--idCustButton").setVisible(false);
					if (this.getModel("config").getProperty("/showFeaturesInDevelopment")) {
						sap.ui.getCore().byId(oId + "--idCartButton").setVisible(false);
					}
					// this.getView().byId("idCustButton").setVisible(false);
					// this.getView().byId("idCartButton").setVisible(false);
					// this.getView().byId("idUserLink").setVisible(false);
				}
				else {
					if (this.getModel("config").getProperty("/showFeaturesInDevelopment")) {
						sap.ui.getCore().byId(oViewId + "--idCartButton").setVisible(true);
					}
					sap.ui.getCore().byId(oViewId + "--idCustButton").setVisible(true);
					// sap.ui.getCore().byId("container-ent_eCom_ui---SalesOrderList--idCustButton").byId("idCartButton").setVisible(true);
					sap.ui.getCore().byId(oViewId + "--idCustButton").setVisible(true);
				}
			}
		},
		getLinkedTables: function (oTable) {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/LinkedTable?tablename=" + oTable, "GET", {})
					.then(function (data, status, xhr) {
						// this.getModel("appView").setProperty("/VH_User", data);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));
		},
		getCustomSAPValidations: function () {
			return new Promise(function (resolve) {
				this.middleWare.callMiddleWare("/resource/UserFieldsMD?$filter=startswith(TableName, '@ENT_PORT_USER')", "GET", {})
					.then(function (data, status, xhr) {
						// this.getModel("appView").setProperty("/VH_User", data);
						this.getView().getModel("appView").setProperty("/customSAPValidations", data.value);
						resolve(data);
					}.bind(this))
					.catch(function (jqXhr, textStatus, errorMessage) {
						this.middleWare.errorHandler(jqXhr, this);
						return;
					}.bind(this));
			}.bind(this));
		},
		filedConfig: function () {
			// var oData=this.getModel("appView").getProperty("/ENT_UDO_USER");
			this.middleWare.callMiddleWare("/fieldTable", "GET", {})
				.then(function (data, status, xhr) {

					var fieldCfg = data;
					var visible = this.getModel("appView").getProperty("/visible");
					var required = this.getModel("appView").getProperty("/required");
					fieldCfg.forEach(function (item) {
						visible[item.U_FieldName] = item.U_IsVisible === "Y" ? true : false;
						required[item.U_FieldName] = item.U_IsMandatory === "Y" ? true : false;
					});
					this.getModel("appView").setProperty("/visible", visible);
					this.getModel("appView").setProperty("/required", required);
					// this.getModel("appView").setProperty("/ENT_UDO_USER", data);
					// this.getModel("appView").updateBindings();
				}.bind(this))
				.catch(function (jqXhr, textStatus, errorMessage) {
					this.middleWare.errorHandler(jqXhr, this);
				}.bind(this));
		},
		formatVisibleBank: function (a, b, c, d, e, f, g, h) {
			if (!a && !b && !c && !d && !e && !f && !g && !h) {
				return false;
			}
			return true;
		},
		dynamicCustomFields: async function () {
			var fieldCfg = [];
			var that = this;
			that.customSAPValidations = [];
			that.customSAPValidations = await that.getCustomSAPValidations();
			// this.middleWare.callMiddleWare("/resource/UserFieldsMD?$filter=startswith(TableName, '@ENT_PORT_USER')", "GET",{})
			// // dbAPI.callOData(this, "/UserFieldsMD?$filter=startswith(TableName, '@ENT_PORT_USER')", "GET", {}, {})
			// 	.then(function(oData) {
			// 		that.getView().getModel("appView").setProperty("/customSAPValidations", oData.value);
			// 		that.customSAPValidations = oData.value;

			// 	}).catch(function(oError) {

			// 	});
			// this.middleWare.callMiddleWare("/resource/UserFieldsMD?$filter=startswith(TableName, '@ENT_PORT_USER')", "GET",{})

			this.middleWare.callMiddleWare("/fieldTable", "GET", {})
				// vendorAPI.getFieldConfigurations(this)
				.then(function (data) {
					fieldCfg = data;
					that.getView().getModel("appView").setProperty("/customFieldsData", fieldCfg);
					var customFieldsNames = [];
					var requiredCustomFields = [];
					var customField = that.getView().byId("goalsblock7--customFieldsForm");
					customField.destroyContent();
					fieldCfg.forEach(async function (item) {
						if (item.U_IsCustom === "Y") {

							that.getView().getModel("appView").setProperty("/customFieldsExist", true);
							customField.addContent(new sap.m.Label({

								text: item.U_FieldName.split("_")[1],
								visible: item.U_IsVisible === "Y" ? true : false,
								required: item.U_IsMandatory === "Y" ? true : false
							}));
							// customField.addStyleClass('sapUiLargeMargin');
							if (item.U_ValidationRule === "SAP") {

								that.customSAPValidations.forEach(async function (custom) {
									if (item.U_FieldName === 'U_' + custom.Name) {

										if (custom.LinkedTable === null) {
											var validvalues = custom.ValidValuesMD;
											if (item.U_IsMandatory === "N") {
												validvalues.unshift({
													"Value": "",
													"Description": ""
												});
											}
											that.getView().getModel("appView").setProperty('/' + item.U_FieldName, validvalues);
											var oItemTemplate = new sap.ui.core.Item({
												key: "{appView>Value}",
												text: "{appView>Description}"
											});
											var oSelect = new sap.m.Select(item.U_FieldName, {
												visible: item.U_IsVisible === "Y" ? true : false,
												forceSelection: false,
												// change: that.onCustomFieldsSelectChange,
												items: {
													path: 'appView>/' + item.U_FieldName,
													template: oItemTemplate,
													templateShareable: false
												}
												// path: "appView>/ValidValuesMD"
												// items: "appView>/ValidValuesMD"
											})
												.bindProperty("enabled", {
													path: 'appView>/handlebtn/btn',
													formatter: that.oEnableEdit
												})
												.bindProperty("selectedKey", {
													path: 'appView>/ENT_UDO_USER/' + item.U_FieldName
												});
											customField.addContent(oSelect);

										} else if (custom.LinkedTable) {
											try {
												var oItemTemplate2 = new sap.ui.core.Item({
													key: "{appView>Code}",
													text: "{appView>Name}"
												});
												var oSelect2 = new sap.m.Select(item.U_FieldName, {
													visible: item.U_IsVisible === "Y" ? true : false,
													forceSelection: false,
													// change: that.onCustomFieldsSelectChange,
													items: {
														path: 'appView>/' + item.U_FieldName,
														template: oItemTemplate2,
														templateShareable: false
													}
													// path: "appView>/ValidValuesMD"
													// items: "appView>/ValidValuesMD"
												})
													.bindProperty("enabled", {
														path: 'appView>/handlebtn/btn',
														formatter: that.oEnableEdit
													})
													.bindProperty("selectedKey", {
														path: 'appView>/ENT_UDO_USER/' + item.U_FieldName
													});
												customField.addContent(oSelect2);
												var data = await that.getLinkedTables(custom.LinkedTable).then();
												var validvalues2 = data;
												if (item.U_IsMandatory === "N") {
													validvalues2.unshift({
														"Code": "",
														"Name": ""
													});
												}
												that.getView().getModel("appView").setProperty('/' + item.U_FieldName, validvalues2);

											} catch (jqXhr) {
												that.middleWare.errorHandler(jqXhr, that);
											}

										}
									}

								}.bind(that));
							} else {
								customField.addContent(new sap.m.Input({
									id: item.U_FieldName,
									visible: item.U_IsVisible === "Y" ? true : false,
									liveChange: that.onCustomFieldsChange
								})
									.bindProperty("enabled", {
										path: 'appView>/handlebtn/btn',
										formatter: that.oEnableEdit
									})
									.bindProperty("value", {
										path: 'appView>/ENT_UDO_USER/' + item.U_FieldName
									}));
							}
							customFieldsNames.push(item.U_FieldName);
							if (item.U_IsMandatory === "Y") {
								requiredCustomFields.push(item.U_FieldName);
							}
						}
						that.getView().getModel("appView").setProperty("/customFieldNames", customFieldsNames);
						that.getView().getModel("appView").setProperty("/required/CustomFields", requiredCustomFields);
					});
				}).catch(function (jqXhr) {
					that.middleWare.errorHandler(jqXhr, that);
				});
		},
		onInvoiceNavPress: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext("appView");
			var oObject = oContext.getObject();
			if (oObject && oObject.U_SAP_DocEntry) {
				this.getRouter().navTo(
					'InvoiceDetail',
					{
						objectId: oObject.U_SAP_DocEntry
					}
				);
			}
			else {
				MessageBox.error(this.getView().getModel("i18n").getProperty("IncorrectInvoice"));

			}
		},
		getVHCurrency: function () {
			this.middleWare.callMiddleWare("/VH_Currency", "GET", {})
				.then(function (data, status, xhr) {
					this.getModel("appView").setProperty("/VH_Currency", data);
					// this.getModel("appView").setProperty("/TotalTransData", data.length);
					this.getModel("appView").updateBindings();

				}.bind(this))
				.catch(function (jqXhr, textStatus, errorMessage) {
					this.middleWare.errorHandler(jqXhr, this);
				}.bind(this));
		},
	});
});