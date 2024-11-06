sap.ui.define([
  "jquery.sap.global",
  "sap/m/MessageBox",
  "sap/ui/core/mvc/Controller",
  "ent/ui/ecommerce/pdfgen/addPage"
], function (jQuery, MessageBox, Controller, addPage) {
  "use strict";

  return {
    // mainHeader: function (abc, logo, jsonData, page, model) {
    //   // Ensure that PDFKit and BlobStream are imported correctly in your SAP UI5 app

    //   // Ensure PDFKit and BlobStream are imported in your SAP UI5 environment.

    //   const orderData = {
    //     supplier: {
    //       name: "Aeon Products",
    //       address: "Gala No 1/13, Shv Shankar Industrial Estate, Naka Pada, N.H. No. 8, Vasai (E), Maharashtra",
    //       gstNumber: "27AABPP9841N1Z7",
    //       panNumber: "AABPP9841N",
    //       email: "email@example.com",
    //     },
    //     orderDetails: {
    //       orderNo: "2023-24/198",
    //       date: "28-Oct-24",
    //     },
    //     deliveryAddress: {
    //       name: "Aeon Products - NEW ADDRESS",
    //       address: "Gala No 1/13, Shv Shankar Industrial Estate, Naka Pada, N.H. No. 8, Vasai (E)",
    //     },
    //     items: [
    //       {
    //         description: "Tulsi - Satin Chromo White Back",
    //         size: "740 x 1000",
    //         inches: "29.13 x 39.37",
    //         gsm: "310",
    //         sheets: "5000",
    //         productCode: "UNMX 24.01 WDN 03",
    //         deliveryDate: "2-Apr-24",
    //         quantity: "1147 Kg",
    //         rate: 47.75,
    //         value: 54769.25,
    //       },
    //     ],
    //     totals: {
    //       transport: 0,
    //       exciseDuty: 0,
    //       sgst: 3286.16,
    //       cgst: 3286.16,
    //       grandTotal: 61341.56,
    //     },
    //   };

    //   // Initialize the PDF document
    //   const doc = new PDFDocument({
    //     size: 'A4',
    //     margins: { top: 40, bottom: 40, left: 40, right: 40 },
    //   });
    //   const stream = doc.pipe(blobStream());

    //   // Header Section
    //   function addHeader(doc, data) {
    //     doc
    //       .fontSize(10)
    //       .text("Name & Address of the Supplier", 300, 50, { align: 'center' })
    //       .text("Aeon Products", 50, 70)
    //       .text(data.supplier.address, 50, 85)
    //       .text(`GST TIN NO: ${data.supplier.gstNumber}`, 50, 100)
    //       .text(`PAN NO: ${data.supplier.panNumber}`, 50, 115)
    //       .text(`Order No.: ${data.orderDetails.orderNo}`, 300, 85, { align: 'left' })
    //       .text(`Date: ${data.orderDetails.date}`, 300, 100, { align: 'left' });
    //   }

    //   // Delivery Address Section
    //   function addDeliveryAddress(doc, data) {
    //     doc
    //       .fontSize(10)
    //       .text("Delivery Address :", 50, 150)
    //       .text(data.deliveryAddress.name, 50, 165)
    //       .text(data.deliveryAddress.address, 50, 180);
    //   }

    //   // Table Header with Borders
    //   function addTableHeader(doc) {
    //     const startX = 50;
    //     const startY = 220;
    //     const colWidths = [150, 100, 100, 100];

    //     doc
    //       .fontSize(10)
    //       .text("Item Description", startX, startY)
    //       .text("Quantity", startX + colWidths[0], startY)
    //       .text("Rate (INR)", startX + colWidths[0] + colWidths[1], startY)
    //       .text("Value", startX + colWidths[0] + colWidths[1] + colWidths[2], startY);

    //     // Draw borders
    //     doc.moveTo(startX, startY - 5).lineTo(550, startY - 5).stroke();
    //     doc.moveTo(startX, startY + 15).lineTo(550, startY + 15).stroke();
    //     doc.moveTo(startX, startY - 5).lineTo(startX, startY + 15).stroke();
    //     colWidths.reduce((acc, width) => {
    //       doc.moveTo(startX + acc + width, startY - 5).lineTo(startX + acc + width, startY + 15).stroke();
    //       return acc + width;
    //     }, 0);
    //   }

    //   // Table Rows with Borders
    //   function addTableRows(doc, items) {
    //     const startX = 50;
    //     let y = 235; // Starting y-coordinate for rows
    //     const colWidths = [150, 100, 100, 100];

    //     items.forEach((item, index) => {
    //       doc
    //         .fontSize(10)
    //         .text(item.description, startX, y)
    //         .text(item.quantity, startX + colWidths[0], y)
    //         .text(item.rate.toFixed(2), startX + colWidths[0] + colWidths[1], y)
    //         .text(item.value.toFixed(2), startX + colWidths[0] + colWidths[1] + colWidths[2], y);

    //       // Draw row borders
    //       doc.moveTo(startX, y - 5).lineTo(550, y - 5).stroke();
    //       doc.moveTo(startX, y + 15).lineTo(550, y + 15).stroke();
    //       doc.moveTo(startX, y - 5).lineTo(startX, y + 15).stroke();
    //       colWidths.reduce((acc, width) => {
    //         doc.moveTo(startX + acc + width, y - 5).lineTo(startX + acc + width, y + 15).stroke();
    //         return acc + width;
    //       }, 0);

    //       y += 20; // Move to the next row
    //     });
    //     return y; // Return current y-coordinate for further content placement
    //   }

    //   // Totals Section with Borders
    //   function addTotals(doc, data, y) {
    //     doc
    //       .fontSize(10)
    //       .text(`Transport: ₹ ${data.totals.transport}`, 50, y)
    //       .text(`SGST: ₹ ${data.totals.sgst}`, 300, y)
    //       .text(`CGST: ₹ ${data.totals.cgst}`, 300, y + 20)
    //       .font("Helvetica-Bold")
    //       .text(`Grand Total: ₹ ${data.totals.grandTotal}`, 300, y + 40);

    //     // Draw borders around totals
    //     doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke();
    //     doc.moveTo(50, y + 65).lineTo(550, y + 65).stroke();
    //     doc.moveTo(50, y - 5).lineTo(50, y + 65).stroke();
    //     doc.moveTo(550, y - 5).lineTo(550, y + 65).stroke();
    //   }

    //   // Footer Section
    //   function addFooter(doc) {
    //     doc
    //       .fontSize(10)
    //       .text("For Aeon Products", 400, 700)
    //       .text("Authorized Signatory", 400, 720);
    //   }

    //   // Build PDF sections
    //   addHeader(doc, orderData);
    //   addDeliveryAddress(doc, orderData);
    //   addTableHeader(doc);
    //   let currentY = addTableRows(doc, orderData.items); // Dynamic y-position after table rows
    //   addTotals(doc, orderData, currentY + 20); // Add totals below the table rows
    //   addFooter(doc); // Add footer at the bottom

    //   // Finalize PDF
    //   doc.end();
    //   stream.on('finish', function () {
    //     const url = stream.toBlobURL('application/pdf');
    //     window.open(url); // Open the PDF in a new tab
    //   });


    // }

    mainHeader: function (doc, logo, json, page, model) {
      var docHeight = doc.page.height; // 792
      var docWidth = doc.page.width; // 612

      // Fill header with hardcoded text
      // Sender Company Details -- Aeon Products [Left Side Part]
      doc.fillColor("#000000").fontSize(10).font('Helvetica-Bold')
        .text(`${json.SenderCompanyName}`, 60, 40, { underline: false }) // Adjust text position as needed
        .font('Helvetica')
        .text(`Address : ${json.SenderCompanyAddress}`, 60, 65)
        // .text("Gala No 1/13, Shiv Shankar Industrial Estate No. 1,", 60, 50, { underline: false }) // Adjust text position as needed
        // .text("Behind Burma Shell Bharat Petroleum Pump,", 60, 60, { underline: false }) // Adjust text position as needed
        // .text("Naik Pada, N.H. NO. 8, Vasai (E),", 60, 70, { underline: false }) // Adjust text position as needed
        // .text("Maharashtra - 401208.", 60, 80, { underline: false }) // Adjust text position as needed
        .text(`GST NO - ${json.SenderGstNumber}`, 60, 95, { underline: false }) // Adjust text position as needed

      // Other details of sender company -- Left Side Part
      doc.fillColor("#000000")
        .fontSize(10)
        .font('Helvetica-Bold') // Set font to bold
        .text("Purchase Order :", 60, 150) // Adjust text position as needed
        .font('Helvetica')
        .text(`Order No : ${json.pdfDataOrderNo}`, 60, 165) // Adjust text position as needed
        .text(`Date : ${json.pdfDeliveryDate}`, 60, 180) // Adjust text position as needed

      // Add text on the right side
      doc.fillColor("#000000")
        .fontSize(10)
        .font('Helvetica-Bold') // Set font to bold
        .text("Name & Address of the Supplier", docWidth - 200, 40, { bold: true, underline: true }) // Adjust text position as needed
        .font('Helvetica')
        .text(`${json.companyName}`, docWidth - 200, 65) // Adjust text position as needed
        .text(`GST TIN NO : ${json.gstNumber}`, docWidth - 200, 80) // Adjust text position as needed
        .text("Attention :", docWidth - 200, 95) // Adjust text position as needed
        .text(`Telephone : ${json.phoneNumber}`, docWidth - 200, 105) // Adjust text position as needed
        .text(`Email : ${json.email}`, docWidth - 200, 115); // Adjust text position as needed

      // Additional content below right side content (Delivery Address)
      doc.fillColor("#000000")
        .fontSize(10)
        .font('Helvetica-Bold') // Set font to bold
        .text("Delivery Address :", docWidth - 200, 135, { bold: true, underline: true }) // Adjust text position as needed
        .font('Helvetica')
        .text(`${json.companyAddress}`, docWidth - 200, 150);

      // Add sub-heading part:-
      doc.fillColor("#000000")
        .fontSize(10)
        .font('Helvetica-BoldOblique')
        .text("Pls supply the following goods on the mentioned terms & conditions below: ", 60, 210)
      // doc.moveTo(50, 280).lineTo(550, 280).stroke(); // Draw line for header
      // doc.moveDown();


      // Table Header with Borders
      function addTableHeader(doc) {
        const startX = 50;
        const startY = 240;
        const colWidths = [200, 100, 100, 100];

        doc
          .fontSize(10)
          .text("Item Description", startX+20, startY)
          .text("Quantity", startX + colWidths[0] + 20, startY)
          .text("Rate (INR)", startX + colWidths[0] + colWidths[1] + 20 , startY)
          .text("Value", startX + colWidths[0] + colWidths[1] + colWidths[2] + 20, startY);

        // Draw borders
        doc.moveTo(startX, startY - 5).lineTo(550, startY - 5).stroke();
        doc.moveTo(startX, startY + 15).lineTo(550, startY + 15).stroke();
        doc.moveTo(startX, startY - 5).lineTo(startX, startY + 15).stroke();
        colWidths.reduce((acc, width) => {
          doc.moveTo(startX + acc + width, startY - 5).lineTo(startX + acc + width, startY + 15).stroke();
          return acc + width;
        }, 0);
      }
      
      var y = 260; // Starting y-coordinate for rows
      // Table Rows with Borders
      function addTableRows(doc, items) {
        const startX = 50;
        const colWidths = [200, 100, 100, 100];
        let Total = 0;
        items.forEach((item, index) => {
          Total += parseInt(item.Quantity) * parseInt(item.Rate);
          if(y>700){
            doc.addPage();
            y=50;
          }
          doc
            .fontSize(10)
            .text(`${item.ItemName} \n Size : ${item.ItemSize} \n Inches : ${item.ItemInches} \n GSM : ${item.GSM} \n SHEETS : ${item.Sheets} \n Product Code : ${item.ProductCode} \n Delivery Date : ${item.DeliveryDate}`, startX + 5, y)
            .text(item.Quantity, startX + colWidths[0] + 20, y)
            .text(item.Rate, startX + colWidths[0] + colWidths[1] + 20, y)
            .text(parseInt(item.Quantity) * parseInt(item.Rate), startX + colWidths[0] + colWidths[1] + colWidths[2] + 20, y);

          // Draw row borders
          doc.moveTo(startX, y - 5).lineTo(550, y - 5).stroke();
          doc.moveTo(startX, y + 85).lineTo(550, y + 85).stroke();
          doc.moveTo(startX, y - 5).lineTo(startX, y + 85).stroke();
          colWidths.reduce((acc, width) => {
            doc.moveTo(startX + acc + width, y - 5).lineTo(startX + acc + width, y + 85).stroke();
            return acc + width;
          }, 0);

          y += 90; // Move to the next row
        });
        // return y; // Return current y-coordinate for further content placement
        
        let gst = Total*6/100;
        let finalAmount = Total + gst*2;
        doc.moveDown(4).fontSize(10).text(` Transport : ${json.transportName}\n Excise Duty : ${json.exciseDuty}\n Tax Type : ${json.taxType}\n Payment Terms : 60 Days \n Delivery Terms : Door Delivery `, 55, y+5, { align: 'left' }).text(`Total : ${Total}\nTransportation :  \nSGST - 6% :  ${gst}  \nCGST -  6% : ${gst} \nGrand Total : ${finalAmount}`,400,y+5,{align : 'left'});

        
        // Rect around all table content
        doc.lineWidth(1).rect(50, y-5, 500, 90).stroke();

        }

      addTableHeader(doc);
      addTableRows(doc,json.tableData);

      if(y>750){
        doc.addPage();
      }

      doc.text('Remarks : ',50,y+140).text('For Aeon Products.',350,y+140,{ align: 'right' }).text('Authorized Signatory',340,y+210,{ align: 'right' });
      doc.lineWidth(0.5).rect(45, y+130, 232.5, 110).stroke();
      doc.lineWidth(0.5).rect(277.5, y+130, 275, 110).stroke();

      doc.moveDown(4).text('Prepared by ', 50, y+270, { align: 'left' })
        .text('Checked by ', 50, y+270, { align: 'right' });


      // Footer for remarks, signatory, etc.
      // doc.moveDown(4).text('Remarks:', 50, 640)
      //   .text('For Aeon Products.', 350, 640, { align: 'right' })
      //   .text('Authorized Signatory', 350, 700, { align: 'right' });

      // doc.lineWidth(0.5)
      //   .rect(45, 630, 232.5, 110) // For remark and sign part.
      //   .stroke();

      // doc.lineWidth(0.5)
      //   .rect(277.5, 630, 275, 110) // For remark and sign part.
      //   .stroke();


      // doc.moveDown(4).text('Prepared by ', 50, 800, { align: 'left' })
      //   .text('Checked by ', 50, 800, { align: 'right' });

    }
  };
});
