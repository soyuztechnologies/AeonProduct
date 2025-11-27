sap.ui.define(
  ["./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment", 
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, JSONModel, Fragment, MessageToast, Filter, FilterOperator) {
    "use strict";
    var userRole;

    return BaseController.extend("ent.ui.ecommerce.controller.App", {
      onInit: function () {
        this._oRouter = this.getRouter();
        var oViewModel,
          fnSetAppNotBusy,
          iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

        oViewModel = new JSONModel({
          busy: true,
          sideNav: {
            selectedKey: "profile",
            expanded: true,
            visible: false,
            adminTabs: false,
            customerTabs: false,
            invoiceList: false,
          },
          delay: 0,
          layout: "OneColumn",
          previousLayout: "",
          actionButtonsInfo: {
            midColumn: {
              fullScreen: false,
            },
          },
          logOut: false,
          visibleHeader: true,
        });
        this.setModel(oViewModel, "appView");
        this.getModel("appView").setSizeLimit(5000);
        const getCookie = function (name) {
          var value = "; " + document.cookie;
          var parts = value.split("; " + name + "=");
          if (parts.length == 2) {
            return decodeURIComponent(parts.pop().split(";").shift());
          }
        };
        const sessionCookie = getCookie("soyuz_session");
        if(sessionCookie){
          this.getModel().setHeaders({
          "Authorization": sessionCookie
        });
       }
      else{
        
      }
        fnSetAppNotBusy = function () {
          oViewModel.setProperty("/busy", false);
          oViewModel.setProperty("/delay", iOriginalBusyDelay);
        };
        fnSetAppNotBusy();
        // apply content density mode to root view
        this.getView().addStyleClass(
          this.getOwnerComponent().getContentDensityClass()
        );
        // this.getCustomData();

        $(document).ajaxStart(function (x, y, z) {
          
          sap.ui.core.BusyIndicator.show();
        });
        $(document).ajaxStop(function (x, y, z) {
          sap.ui.core.BusyIndicator.hide();
        });
        if (!sessionStorage.showCartWarning)
          sessionStorage.showCartWarning = false;
          // this.getUserId();
      },

      // onAfterRendering: function () {
      //   this.getUserId();
      // },
      onNavigation: function (oEvent) {},

      onSelectItem: function (oEvent) {
        
        var that = this;
        var nav = oEvent.getSource().getSelectedKey();
        that.getView().getModel("appView").setProperty("/navigationKey", nav);
        var okey = this.getModel("device").getData().system.desktop;
        if(okey === false){
          // if device is phone
          this.onClickMenuButton();
        }
        if(nav === "dispatchedList"){
          this.getRouter().navTo("dispatchedList")
        }
        if (nav=== "Profile"){
          this.getRouter().navTo("Profile")
        }
        // if (nav === "PrintingDetails") {
        //   this.getRouter().navTo("printingDetails");
        // }
        if (nav === "allPrinters") {
          this.getRouter().navTo("allPrinters");
        }
        if (nav === "UploadXml") {
          this.getRouter().navTo("Carborator");
        }
        if (nav === "PoNo") {
          this.getRouter().navTo("PONumber")
        }
        if (nav === "Artwork") {
          this.getRouter().navTo("ArtworkNumber");
        }
        if (nav === "InvNo") {
          this.getRouter().navTo("InvNumber");
        }
        if (nav === "DelNo") {
          this.getRouter().navTo("DelNumber");
        }
        if (nav === "userDetails"){
          this.getRouter().navTo("userDetails")
        }
        if (nav === "companyDetails"){
          this.getRouter().navTo("companyDetails")
        }
        if (nav === "vendorDetails"){
          this.getRouter().navTo("vendorDetails")
        }
        if (nav === "PaperCutting"){
          this.getRouter().navTo("Paper Cutting")
        }
        if (nav === "Printing"){
          this.getRouter().navTo("Printing")
        }
        if (nav === "Coating"){
          this.getRouter().navTo("Coating")
        }
        if (nav === "Foiling"){
          this.getRouter().navTo("Foiling")
        }
        if (nav === "SpotUV"){
          this.getRouter().navTo("SpotUV")
        }
        if (nav === "Embossing"){
          this.getRouter().navTo("Embossing")
        }
        if (nav === "Punching"){
          this.getRouter().navTo("Punching")
        }
        if (nav === "Pasting"){
          this.getRouter().navTo("Pasting")
        }
        if (nav === "ReadyForDispatch"){
          this.getRouter().navTo("Ready For Dispatch")
        }
        // if (nav=== "Packing"){
        //   this.getRouter().navTo("Packing")
        // }
        if (nav === "Dispatched"){
          this.getRouter().navTo("Dispatched")
        }
        if (nav === "PoSheet"){
          this.getRouter().navTo("PoSheet")
        }
        if (nav === "SentEmail"){
          this.getRouter().navTo("SentEmail")
        }

        if (nav === "Others"){
          this.getRouter().navTo("Others")
        }
        // this.getNotification()
      },

      whatsappSupport: function (oEvent) {
          var oView = this.getView();
          var oButton = oEvent.getSource();

          if (!this._oPopover) {
              Fragment.load({
                  id: oView.getId(),
                  name: "ent.ui.ecommerce.fragments.WhatsappSupport",
                  controller: this
              }).then(function (oPopover) {
                  this._oPopover = oPopover;
                  oView.addDependent(this._oPopover);
                  this._oPopover.openBy(oButton); 
              }.bind(this));
          } else {
              this._oPopover.openBy(oButton);
          }
      },


      onNotificationPopup: function (oEvent) {
        var oView = this.getView();
        var oButton = oEvent.getSource();
        
        this.getNotification();
        
        // Destroy existing popover to force recreation
        if (this._onNotificationPopover) {
            this._onNotificationPopover.destroy();
            this._onNotificationPopover = null;
        }
        
        // Always create fresh popover
        Fragment.load({
            id: oView.getId(),
            name: "ent.ui.ecommerce.fragments.NotificationPopup",
            controller: this
        }).then(function (oPopover) {
            this._onNotificationPopover = oPopover;
            oView.addDependent(this._onNotificationPopover);
            
            // Close popover when clicking outside
            this._onNotificationPopover.attachAfterClose(function() {
                this._onNotificationPopover.destroy();
                this._onNotificationPopover = null;
            }.bind(this));
            
            this._onNotificationPopover.openBy(oButton);
        }.bind(this));
      },

      onSingleMarkAsRead: function (oEvent) {
          var oButton = oEvent.getSource();

          var oItem = oButton.getParent();       
          oItem = oItem.getParent();          

          var oCtx = oItem.getBindingContext("appView");
          var oData = oCtx.getObject();         

          // Mark as Read
          var paylaod = {
            ReadBy: this.getModel('appView').getProperty('/UserId'),
            NotificationId: [
              {
                id: oData.id
              }
            ]
          }
          this.middleWare.callMiddleWare("markAsReadNotification", "POST", paylaod)
            .then(function (data, status, xhr) {
              this.getNotification();
            }.bind(this))
            .catch(function (jqXhr, textStatus, errorMessage) {
              this.middleWare.errorHandler(jqXhr, this);
            }.bind(this));
      },

      // onDeleteNotification: function (oEvent) {
      //   var oButton = oEvent.getSource();

      //   var oItem = oButton.getParent();       
      //   oItem = oItem.getParent();          

      //   var oCtx = oItem.getBindingContext("appView");
      //   var oData = oCtx.getObject();         

      //   var oModel = this.getView().getModel(); 
      //   var that = this;
      //   oModel.remove("/Notifications(" + oData.id + ")", {
      //       success: function () {
      //           MessageToast.show("Notification deleted");
      //           that.getNotification();
      //       },
      //       error: function (err) {
      //           MessageToast.show("Delete failed");
      //       }
      //   });
      // },

      liveSearchNotification: function (oEvent) {
        var sValue = oEvent.getParameter("query");
        if(!sValue){
          var sValue = oEvent.getParameter("newValue");
        }
        var oFilter1 = new Filter("Description", FilterOperator.Contains, sValue);
        var oFilter2 = new Filter("Title", FilterOperator.Contains, sValue);


        var oCombinedFilter = new Filter({
          filters: [oFilter1, oFilter2],
          and: false
        });
        var oTable = this.getView().byId("notificationList");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(oCombinedFilter);
      },
      
      onChatWithUs: function () {
          var sPhone = "918850137836"; 
          var sMsg = encodeURIComponent("Hello, I need support on CDS.");
          var sUrl = "https://wa.me/" + sPhone + "?text=" + sMsg;
          // var sUrl = "https://wa.me/" + sPhone;

          sap.m.URLHelper.redirect(sUrl, true);
      },




      // getUserId: function () {
        
      //   var that = this;
      //   this.middleWare.callMiddleWare("getUserRole", "get")
      //     .then(function (data, status, xhr) {
      //       var emailName = data.role.EmailId
      //       that.getView().getModel('appView').setProperty('/UserEmail', emailName);
      //       that.getView().getModel('appView').setProperty('/userRole', data.role.Role);
      //     })
      //     .catch(function (jqXhr, textStatus, errorMessage) {
      //       that.middleWare.errorHandler(jqXhr, that);
      //     });
      // },
      onClickMenuButton: function (oEvent) {
        
        // var oSideNavigation = this.byId("sideNavigation");
        // var bExpanded = oSideNavigation.getExpanded();
        // this.getView().getModel("appView").setProperty("/sideNavExpended", !bExpanded);
        var nav = this.getView().getModel("appView").getProperty("/sideNavExpended");
        if(nav === true){

          this.getView().getModel("appView").setProperty("/sideNavExpended", false);
        }
        else{

          this.getView().getModel("appView").setProperty("/sideNavExpended", true);
        }
      },

      onPressLogout:function(){
        // this.getRouter().navTo("login");
        this.onLogOut();
      },

      getUserData: function () {
        var that = this;
        this.middleWare.callMiddleWare("getUserRole", "get")
          .then(function (data, status, xhr) {
            
            userRole = data.role.Role;
            if(userRole == "Admin"||userRole == "Factory Manager"){
              that.getModel('appView').setProperty('/Passwordfield', false);
            };
          })
          .catch(function (jqXhr, textStatus, errorMessage) {
            
            that.middleWare.errorHandler(jqXhr, that);
          });
      },
      onMenuButtonPress: function (event) {
        var oButton = event.getSource();
        var oMenu = this.getView().byId("logOutMenu");
        oMenu.openBy(oButton);
      },
      onMenuPress: function(oEvent){
        

      },
      onPressitemMenu: function(oEvent) {
        var selectedItem = oEvent.getSource();
        var selectedText = selectedItem.getText();
        
        // Perform actions based on the selected menu option
        switch (selectedText) {
          case "User":
            // MessageToast.show("User is Arrived");
            break;
          default:
            break;
        }
        
        // Close the menu after performing the action
        var oMenu = this.getView().byId("logOutMenu");
        oMenu.close();
      },

      onNavigationByNotification: function(oEvent){
        var sPath = oEvent.getParameter("listItem").getBindingContextPath(); 
        var selectedNotification = this.getView().getModel("appView").getProperty(sPath);

        var jobCardNo = selectedNotification.Description.match(/\d+_\d+/);

        // Close + Destroy the Notification Popover if open
        if (this._onNotificationPopover) {
            this._onNotificationPopover.close();

            this._onNotificationPopover.attachAfterClose(() => {
                this._onNotificationPopover.destroy();
                this._onNotificationPopover = null;
            });
        }

        if (jobCardNo) {
            var jobNo = jobCardNo[0];       
            // Navigate
            this.getRouter().navTo("sideNavallPrinters", {
                jobId: jobNo
            });
        } else {
            console.log("Job Number not found.");
        }

        // Mark as Read
        if(selectedNotification.Status === "Unread"){
          var paylaod = {
            ReadBy: this.getModel('appView').getProperty('/UserId'),
            NotificationId: [
              {
                id: selectedNotification.id
              }
            ]
          }
          this.middleWare.callMiddleWare("markAsReadNotification", "POST", paylaod)
          .then(function (data, status, xhr) {
            this.getNotification();
          }.bind(this))
          .catch(function (jqXhr, textStatus, errorMessage) {
            this.middleWare.errorHandler(jqXhr, this);
          }.bind(this));
        }
      },

      markAllAsReadNotification: function () {
        var that = this;
        var oData = this.getModel("appView").getProperty("/Notification");
        var Payload = {
          ReadBy: this.getModel('appView').getProperty('/UserId'),
          NotificationId: []
        };
        oData.forEach(function (oNotification) {
          if (oNotification.Status === "Unread") {
            Payload.NotificationId.push({ id: oNotification.id });
          }
        });
        this.middleWare.callMiddleWare("markAsReadNotification", "POST", Payload)
          .then(function (data, status, xhr) {
            this.getNotification();
          }.bind(this))
          .catch(function (jqXhr, textStatus, errorMessage) {
            this.middleWare.errorHandler(jqXhr, this);
          }.bind(this));
      }


    });
  }
);
