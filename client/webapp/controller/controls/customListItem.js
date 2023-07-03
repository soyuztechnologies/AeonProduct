sap.ui.define([

    "sap/m/CustomListItem"

], function(CustomListItem) {

    'use strict';

    return CustomListItem.extend("ent.ui.ecommerce.controller.controls.customListItem", {

        metadata:{

            properties : {

                "backgroundColor" : "string"

              }
        },

        onAfterRendering : function() {
            // make sure that onAfterRendering function in VBox is not overwritten
          debugger;
            if (CustomListItem.prototype.onAfterRendering) {

              CustomListItem.prototype.onAfterRendering.apply(this, arguments);

            }

            if (this.getBackgroundColor()) {
              
              // this.getCells().forEach(element => {
              //   element.addStyleClass(`.nishan{
              //        "background-color", "#" + ${this.getBackgroundColor()}
              //        }`)
              // });
    
              this.$().css("background-color", "#" + this.getBackgroundColor());
              // this.$Popin().css("background-color", "#" + this.getBackgroundColor());
              // $("#container-ent_eCom_ui---SalesOrderDetail--idSalesQuotationTable-tblBody tr").css("background-color", "#" + this.getBackgroundColor());
              //n $("tr:only-child").css("background-color", "#" + this.getBackgroundColor());
              //n $("tr:only-of-type").css("background-color", "#" + this.getBackgroundColor());
              //n $("tr:root").css("background-color", "#" + this.getBackgroundColor());

            }

          },
          

          renderer: { }

    });

});