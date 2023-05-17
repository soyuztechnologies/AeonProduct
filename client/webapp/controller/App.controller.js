sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

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
          debugger;
          sap.ui.core.BusyIndicator.show();
        });
        $(document).ajaxStop(function (x, y, z) {
          sap.ui.core.BusyIndicator.hide();
        });
        if (!sessionStorage.showCartWarning)
          sessionStorage.showCartWarning = false;
      },
      onAfterRendering: function () {},
      onNavigation: function (oEvent) {},
      onSelectItem: function (oEvent) {
        debugger;
        var nav = oEvent.getSource().getSelectedKey();
        if (nav=== "Profile"){
          this.getRouter().navTo("Profile")
        }
        // if (nav === "PrintingDetails") {
        //   this.getRouter().navTo("printingDetails");
        // }
        if (nav === "WelcomePrinters") {
          this.getRouter().navTo("welcomePrinter");
        }
        if (nav === "UploadXml") {
          this.getRouter().navTo("Carborator");
        }
        if (nav=== "userDetails"){
          this.getRouter().navTo("userDetails")
        }
      },
      onClickMenuButton: function (oEvent) {
        debugger;
        var oSideNavigation = this.byId("sideNavigation");
        var bExpanded = oSideNavigation.getExpanded();
        this.getView().getModel("appView").setProperty("/sideNavExpended", !bExpanded);
      },
      onPressLogout:function(){
        this.getRouter().navTo("login");
      },
    });
  }
);
