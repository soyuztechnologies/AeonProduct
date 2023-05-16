sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
], function ( BaseController, JSONModel, Fragment) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.userVerify", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("userVerify").attachPatternMatched(this._matchedHandler, this);
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getModel("appView").setProperty("/visibility", false);
			this.getModel("appView").setProperty("/visibleHeader",true);
			this.getModel("appView").updateBindings();
            this.loadFragment();
		},

        loadFragment:function(){
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
                // that.onRefresh(/);
                
                // that.getView().getModel('local').refresh();
            });
        }
	});
});