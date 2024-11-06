
sap.ui.define([
  "jquery.sap.global",
  "sap/ui/core/mvc/Controller",
  "ent/ui/ecommerce/pdfgen/header"
], function (jQuery, Controller, header) {
  "use strict";
  return  function(doc,paperSize,logo, jsonData, page = null, checkSpace = null,model){
    if ((!checkSpace) || (doc.page.maxY() <= doc.y + checkSpace)) {
      doc.addPage({ size: paperSize, margins: { top: 45, bottom: 1, left: 45, right: 45 } });
      // header.mainHeader(doc, logo, jsonData,page);
      doc.text(model.getProperty("PageNo")+page, doc.page.width - 130, doc.page.height - 24)
      return true;
    } else {
      return false;
    }
    };
});
