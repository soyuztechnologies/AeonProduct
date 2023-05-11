sap.ui.define([

    "sap/m/ColumnListItem"

], function(ColumnListItem) {

    'use strict';

    return ColumnListItem.extend("project1.control.myColumnListItem", {

        metadata:{

            properties : {

                "backgroundColor" : "string"

              }

        },

        onAfterRendering : function() {
            // make sure that onAfterRendering function in VBox is not overwritten

            if (ColumnListItem.prototype.onAfterRendering) {

              ColumnListItem.prototype.onAfterRendering.apply(this, arguments);

            }

            if (this.getBackgroundColor()) {
              
              // this.getCells().forEach(element => {
              //   element.addStyleClass(`.nishan{
              //        "background-color", "#" + ${this.getBackgroundColor()}
              //        }`)
              // });
    
              this.$().css("background-color", "#" + this.getBackgroundColor());
              this.$Popin().css("background-color", "#" + this.getBackgroundColor());
              // $("#container-ent_eCom_ui---SalesOrderDetail--idSalesQuotationTable-tblBody tr").css("background-color", "#" + this.getBackgroundColor());
              //n $("tr:only-child").css("background-color", "#" + this.getBackgroundColor());
              //n $("tr:only-of-type").css("background-color", "#" + this.getBackgroundColor());
              //n $("tr:root").css("background-color", "#" + this.getBackgroundColor());

            }

          },
          

          renderer: { }

    });

});