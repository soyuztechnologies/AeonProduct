sap.ui.define([

    "sap/m/ObjectListItem"

], function(objectListItem) {
    'use strict';
    return objectListItem.extend("ent.ui.ecommerce.controller.controls.objectListItem", {
        metadata:{
            properties : {
                "backgroundColor" : "string"
              }
        },
        onAfterRendering : function() {
          
          // make sure that onAfterRendering function in VBox is not overwritten
          if (objectListItem.prototype.onAfterRendering) {
            objectListItem.prototype.onAfterRendering.apply(this, arguments);
          }
          if (this.getBackgroundColor()) {
            
            this.$().css("background-color", "#" + this.getBackgroundColor());
          }
        },
        renderer: { }
    });

});