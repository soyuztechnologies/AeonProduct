sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (BaseController, JSONModel, Fragment, MessageToast) {
    "use strict";

    return BaseController.extend("ent.ui.ecommerce.controller.userVerify", {

        onInit: function () {
            this._oRouter = this.getRouter();
            this.getRouter().getRoute("userVerify").attachPatternMatched(this._matchedHandler, this);
        },
        _matchedHandler: function () {
            // debugger;
            this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getModel("appView").setProperty("/visibility", false);
            this.getModel("appView").setProperty("/visibleHeader", true);
            this.getModel("appView").updateBindings();

            // Get the URL parameters
            var that = this;
            var oParams = this.getRouter().getHashChanger().getHash().split("userVerify/")[1];
            var payload = {
                "token": oParams
            };
            // debugger;
            this.middleWare.callMiddleWare("signup/verifyToken", "POST", payload)
                .then(function (data, status, xhr) {
                    // debugger;
                    that.email = data.email;
                    that.loadFragment();
                    that.getModel("appView").setProperty("/userEmail", data.email);

                })
                .catch(function (jqXhr, textStatus, errorMessage) {
                    debugger;
                    that.middleWare.errorHandler(jqXhr, that);
                    // that.getRouter().navTo("notFound");
                });

        },

        loadFragment: function () {
            var oView = this.getView();
            var that = this;

            if (!this.oFixedSizeDialog) {
                this.oFixedSizeDialog = Fragment.load({
                    id: oView.getId(),
                    name: "ent.ui.ecommerce.fragments.userVerify",
                    controller: this
                }).then(function (oDialog) {
                    // Add dialog to view hierarchy
                    oView.addDependent(oDialog);
                    return oDialog;
                }.bind(this));

            }
            this.oFixedSizeDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCreateUser: function () {
            var pass = this.getModel("appView").getProperty('/Pass');
            var Conpass = this.getModel("appView").getProperty('/ConPass');
            if (pass !== Conpass) {
                MessageToast.show("Password Does not match")
            }
            else {

                var payload = {
                    "email": this.email,
                    "password": Conpass,
                };
                this.middleWare.callMiddleWare("signup/createUser", "POST", payload)
                    .then(function (data, status, xhr) {
                        debugger;
                        MessageToast.show("User Register Successful")

                    })
                    .catch(function (jqXhr, textStatus, errorMessage) {
                        debugger;
                        that.middleWare.errorHandler(jqXhr, that);
                        // that.getRouter().navTo("notFound");
                    });
            }
        },

        onReject: function () {
            this.oFixedSizeDialog.then(function (oDialog) {
                oDialog.close();
            });
        }



    });
});