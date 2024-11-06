sap.ui.define([
  "jquery.sap.global",
  "sap/m/MessageBox",
  "sap/ui/core/mvc/Controller",
  "ent/ui/ecommerce/pdfgen/addPage",
], function (jQuery, MessageBox, Controller, addPage) {
  "use strict";
  return {
    offerDetails: function (doc, logo, jsonData, paperSize, totalHeight,page,model) {
      const docHeight = doc.page.height;
      const docWidth = doc.page.width;
      const headerLineY = docHeight - 310;
      const itemHeaderY = docHeight - 280;
      var overallData = this.netTotal(jsonData);
      // Draw Header Line
      doc.lineWidth(1)
        .moveTo(45, totalHeight + 50)
        .lineTo(docWidth - 45, totalHeight + 50)
        .stroke()
        .fillColor("#000000")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(model.getProperty("OfferDetails") , 45, totalHeight + 65, {
          underline: false,
          bold: true
        })
        doc
        .font("Helvetica")
        .fontSize(11)
        .text(model.getProperty("Resources")+ jsonData.offerData?.Resources,250, totalHeight + 70, {
          underline: false,
        })

      // Draw Item Header Line
      doc.lineWidth(1)
        .moveTo(45, totalHeight + 85)
        .lineTo(docWidth - 45, totalHeight + 85)
        .fillColor("#000000")
        .fontSize(11);

      // Header Titles
      // const headerTitles = ["Service", "Description", "Rate", "Curr", "Qty", "Unit", "Subtotal"];
      // const headerXPositions = [45, 155, 270, 340, 400, 450, 500];

      // headerTitles.forEach((title, index) => {
      //   doc.text(title, headerXPositions[index], totalHeight + 95, {
      //     underline: true,
      //   });
      // });

        doc.fontSize(11)
        .font("Helvetica-Bold")
        .text(model.getProperty("Service"), 45, totalHeight + 95, { underline: true})
        .text(model.getProperty("Description"), 125 , totalHeight + 95, { underline: true})
        .text(model.getProperty("Rate"), 250 , totalHeight + 95, { underline: true})
        .text(model.getProperty("Curr"), 310 , totalHeight + 95, { underline: true })
        .text(model.getProperty("Qty"), 380 , totalHeight + 95, { underline: true})
        .text(model.getProperty("Unit"), 440 , totalHeight + 95, { underline: true })
        .text(model.getProperty("Subtotal"), 490 , totalHeight + 95, { underline: true})


      // Item Details
     // Item Details
var height = totalHeight + 120;
let prevItem = '';

for (let index = 0; index < jsonData.offerData?.offerItems.length; index++) {
  const element = jsonData.offerData?.offerItems[index];
  if (height > 800) {
    addPage(doc, paperSize, logo, jsonData,page += 1,null,model);
    height = docHeight - 790;
  }

  // Calculate the height needed for the description
  const descriptionLines = doc.heightOfString(element.description, { width: 110 });
  const descriptionHeight = descriptionLines +5; // Assuming font size 11

  height += descriptionHeight; // Increase the height by the description height

  if (height > 800) {
    addPage(doc, paperSize, logo, jsonData,page += 1,null,model);
    height = docHeight - 790 + descriptionHeight -5; // Reset height considering the new page
  }

  if (element.item !== prevItem) {
    doc.font("Helvetica")
      .text(element.item, 45, height - descriptionHeight, { underline: false ,width: 75 })
  }
    doc.font("Helvetica")
      .text(element.description||"", 125, height - descriptionHeight, { underline: false, width: 115 })
      .text(element.rate||"", 250, height - descriptionHeight, { underline: false })
      .text(element.currency||"", 310, height - descriptionHeight, { underline: false })
      .text(element.qty||"", 380, height - descriptionHeight, { underline: false })
      .text(element.unit||"", 440, height - descriptionHeight, { underline: false })
      .text(element.subtotal||"", 490, height - descriptionHeight, { underline: false });


  // Update height for the next iteration
  height += 1; // Add some spacing between rows
  prevItem = element.item;
}

      debugger;
      if (height > 650) {
        addPage(doc, paperSize, logo, jsonData,page += 1,null,model);
        height = docHeight - 820
      }

      doc.lineWidth(1)
        .moveTo(45, height + 50)
        .lineTo(docWidth - 45, height + 50)
        .stroke()
        .fillColor("#000000");
      doc.lineWidth(1)
        .moveTo(45, height + 52)
        .lineTo(docWidth - 45, height + 52)
        .stroke(0)
        .fillColor("#000000")
        .text(model.getProperty("NetTotal"), docWidth - 250, height + 75, {
          underline: false,
          bold: false
        })
        .text(' '+overallData.netTotal+' '+overallData.currency, docWidth - 150, height + 75, {
          underline: false,
          bold: false
        })

        height = height +75

        if(jsonData.offerData.isDiscount){
          doc.text(jsonData.offerData.discount + model.getProperty("Discount"), docWidth - 250, height + 20, {
            underline: false,
            bold: false
          }).text('- '+overallData.discount+' '+overallData.currency, docWidth - 150, height + 20, {
            underline: false,
            bold: false
          })
          height = height + 20;
        }
        if(jsonData.offerData.isVAT){
          doc.text(jsonData.offerData.VAT+model.getProperty("VAT"), docWidth - 250, height + 20, {
            underline: false,
            bold: false
          }).text('+ '+overallData.vat+' '+overallData.currency, docWidth - 150, height + 20, {
            underline: false,
            bold: false
          })
          height = height + 20;
        }


      doc.lineWidth(1)
        .moveTo(300, height + 20)
        .lineTo(docWidth - 45, height + 20)
        .stroke()
        .fillColor("#000000")
        .text(model.getProperty("GrossTotal"), docWidth - 250, height + 30, {
          underline: false,
          bold: false
        })
        .text(overallData.grossTotal+' '+overallData.currency, docWidth - 150, height + 30, {
          underline: false,
          bold: false
        })

        return {height,page};
    },

    netTotal:function(jsonData){

      var json ={}
      let sum = 0;
      for (let item of jsonData.offerData.offerItems) {
        if(typeof item.subtotal){
          item.subtotal =  item.subtotal? parseInt(item.subtotal):0
          sum += item.subtotal;
        }else{
          sum += item.subtotal;

        }
      }
      json.currency = jsonData.offerData.offerItems[0] ? jsonData.offerData.offerItems[0].currency : '';

      json.netTotal = sum

      json.discount = (jsonData.offerData.isDiscount ? (sum /100) * jsonData.offerData.discount.replace(/[,]/g, '.').replace(/[%]/g, '') : 0)

      json.vat = (jsonData.offerData.isVAT ? (sum /100) * jsonData.offerData.VAT.replace(/[,]/g, '.').replace(/[%]/g, '') :0)
      debugger;
      var netTotal = sum;
      var isDiscount = jsonData.offerData.isDiscount ? (sum /100) * jsonData.offerData.discount.replace(/[,]/g, '.').replace(/[%]/g, '') : 0;
      var isVat = jsonData.offerData.isVAT ? (sum /100) * jsonData.offerData.VAT.replace(/[,]/g, '.').replace(/[%]/g, '') :0;
      json.grossTotal = (netTotal-isDiscount) + isVat

      return json;
    }
  };
});