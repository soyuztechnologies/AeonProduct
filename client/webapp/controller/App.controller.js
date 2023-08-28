sap.ui.define(
  ["./BaseController","sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
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
        if(getCookie("soyuz_session")){
			this.getModel().setHeaders({
				"Authorization": getCookie("soyuz_session")
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
        if (nav=== "userDetails"){
          this.getRouter().navTo("userDetails")
        }
        if (nav=== "companyDetails"){
          this.getRouter().navTo("companyDetails")
        }
        if (nav=== "Printing"){
          this.getRouter().navTo("Printing")
        }
        if (nav=== "Coating"){
          this.getRouter().navTo("Coating")
        }
        if (nav=== "Foiling"){
          this.getRouter().navTo("Foiling")
        }
        if (nav=== "SpotUV"){
          this.getRouter().navTo("SpotUV")
        }
        if (nav=== "Embossing"){
          this.getRouter().navTo("Embossing")
        }
        if (nav=== "Punching"){
          this.getRouter().navTo("Punching")
        }
        if (nav=== "Pasting"){
          this.getRouter().navTo("Pasting")
        }
        // if (nav=== "Packing"){
        //   this.getRouter().navTo("Packing")
        // }
        if (nav=== "Dispatched"){
          this.getRouter().navTo("Dispatched")
        }
        if (nav=== "Others"){
          this.getRouter().navTo("Others")
        }
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
      }
    });
  }
);
