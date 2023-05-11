sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"./model/models",
	"./controller/ErrorHandler"
], function (UIComponent, Device, models,ErrorHandler) {
	"use strict";

	return UIComponent.extend("ent.ui.ecommerce.Component", {

		metadata : {
			manifest : "json"
		},
		init : function () {
			this._oErrorHandler = new ErrorHandler(this);

			
			this.setModel(models.createDeviceModel(), "device");
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		},

		destroy : function () {
			this._oErrorHandler.destroy();
			UIComponent.prototype.destroy.apply(this, arguments);
		},
		getContentDensityClass : function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				// eslint-disable-next-line sap-no-proprietary-browser-api
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}

	});
});