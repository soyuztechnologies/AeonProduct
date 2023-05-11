sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.printingDetails", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("printingDetails").attachPatternMatched(this._matchedHandler, this);
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader",true);
			this.getModel("appView").setProperty("/visibility", true);
			this.getModel("appView").updateBindings();
		}
	});
});