sap.ui.define([
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/core/mvc/Controller",
    "ent/ui/ecommerce/pdfgen/addPage",
  ], function (jQuery, MessageBox, Controller, addPage) {
    "use strict";

    return {
    orderDetails: function (doc, logo, jsonData, startY, paperSize,page,model) {
      // Use the provided startY as the starting Y coordinate for "Order Details"
      var docHeight = doc.page.height;
      var docWidth = doc.page.width;

      // Draw a horizontal line to separate sections
      doc.lineWidth(1)
          .moveTo(45, startY)
          .lineTo(docWidth - 45, startY)
          .stroke();

      // Section Title
     // Section Title
    doc.fillColor("#000000")
    .fontSize(20)
    .font("Helvetica-Bold")
    .text(model.getProperty("OrderDetails"), 45, startY + 10, {
        underline: false,
        bold: true
    });

    // Header row
    var headerY = startY + 30;
    // Hardcoded column widths
    var serviceWidth = 60;
    var dateWidth = 90;
    var descriptionWidth = 160;
    var remarksWidth = 200;

    doc.lineWidth(1)
    .moveTo(45, headerY)
    .lineTo(docWidth - 45, headerY)
    .stroke(10)
    .fillColor("#000000");
    headerY = headerY + 10;
    doc.fontSize(11)
    .text(model.getProperty("Service"), 45, headerY, { underline: true, width: serviceWidth })
    .text(model.getProperty("Date"), 45 + serviceWidth + 15, headerY, { underline: true, width: dateWidth })
    .text(model.getProperty("Description"), 45 + 5 + serviceWidth + dateWidth, headerY, { underline: true, width: descriptionWidth })
    .text(model.getProperty("Remarks"), 45 + 5 + serviceWidth + dateWidth + descriptionWidth, headerY, { underline: true, width: remarksWidth });

    var height = headerY + 10; // Adjusted the starting height based on the header row with additional spacing

    // Loop through ordered items
    let prevItem = '';
    var isStartPage = false;
    for (let index = 0; index < jsonData.orderData.orderedItems.length; index++) {
    const element = jsonData.orderData.orderedItems[index];
    if (height > 710) {
        debugger
        // startY += 1;
        addPage(doc, paperSize, logo, jsonData, page = page + 1,null,model);
        height = docHeight - 800;
        isStartPage = true;
    }

    // Calculate the height of description and remarks
    const descriptionHeight = doc.heightOfString(element.description, { width: descriptionWidth });
    const remarksHeight = doc.heightOfString(element.remarks, { width: remarksWidth });
    const maxHeight = Math.max(descriptionHeight, remarksHeight) + 5; // Choose the maximum height and added spacing

    height += maxHeight+10; // Increase the height by the maximum height

    // Adjust positioning based on actual content
    if (element.item !== prevItem) {
        doc.font("Helvetica")
            .text(element.item, 45+4, height - maxHeight, { underline: false, width: serviceWidth })
    }
    doc.font("Helvetica")
        .text(element.date, 45 + serviceWidth+15, isStartPage ==false ?height - maxHeight:height - maxHeight+10, { underline: false, width: dateWidth, lineBreak: true })
        .text(element.description, 45 + serviceWidth + dateWidth +4 , height - maxHeight , { underline: false, width: descriptionWidth, lineBreak: true })
        .text(element.remarks, 45 + 5 + serviceWidth + dateWidth + descriptionWidth+2, height - maxHeight, { underline: false, width: remarksWidth, lineBreak: true });
    height += 1; // Additional spacing between rows
    prevItem = element.item;
    }
return { height, page };

  }


    };
  });
