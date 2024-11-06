
sap.ui.define([
  "jquery.sap.global",
  "sap/ui/core/mvc/Controller",
  "ent/ui/ecommerce/pdfgen/header"
], function (jQuery, Controller, header) {
  "use strict";
  const currencyOptions = {
    style: 'currency',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currency: 'USD'
  };
  const decimalOptions = {
    style: 'decimal',
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };
  return {
    pdf: function (jsonData, bType = 'download', paperSize = 'A4', model) {
      var that = this;
      return new Promise(function (resolve, reject) {
        // resolve();
        if (!jsonData) {
          reject('Invalid Data');
        }
        var page = 1,
          reportName = 'Footer Text';
        jsonData = JSON.parse(JSON.stringify(jsonData));
        let niceDocument = (logo,termData) => {

          var doc = new PDFDocument({
            size: paperSize,
            margins: { top: 45, bottom: 1, left: 45, right: 45 }
          });
          var stream = doc.pipe(blobStream());


          //call methods here header/body/footer

          header.mainHeader(doc, logo, jsonData,page,model);


          doc.end();
          stream.on('finish', function () {
            // get a blob you can do whatever you like with
            const blob = stream.toBlob('application/pdf');
            // or get a blob URL for display in the browser
            const url = stream.toBlobURL('application/pdf');
            if (bType === 'binary') {
              var reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = function () {
                var base64data = reader.result;
                resolve(atob(base64data.split('base64,')[1]));
              }

            } else if (bType === 'blobURL') {
              resolve(url);
            } else {
              const downloadLink = document.createElement('a');
              downloadLink.href = url;
              var date = new Date();
              // downloadLink.download = `${jsonData.offerData.offerRef}_${jsonData.clientData.name}${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
              downloadLink.download=''; 
              downloadLink.click();
              resolve("PDF Downloaded Successfully");
            }
          });
        }
        var languageCheck = jsonData.language;
        that.toDataURL("pdfgen/logo.PNG", function (logoData) {
          // Call the toDataURL function for the second image
          var  imgPath = "pdfgen/Terms&Conditions_EN.PNG"
          // var jsonLanguage = jsonData.language ? jsonData.language : sap.ui.getCore().getConfiguration().getLanguage()
          // if(jsonLanguage == "de"){
          //   imgPath = "pdfgen/Terms&Conditions_DE.PNG"
          // }
          // else{
          //   imgPath = "pdfgen/Terms&Conditions_EN.PNG"
          // }
          that.toDataURL(imgPath, function (termData) {
              // Call the niceDocument function with both image data
              niceDocument(logoData, termData);
          });
      });
        // return niceDocument();
      });


      // return new Promise(function (resolve, reject) {
      //   if (!jsonData) {
      //     reject('Invalid Data');
      //   }
      //   jsonData = JSON.parse(JSON.stringify(jsonData));

      //   let abcdef = () => {

      //     // Ensure that PDFKit and BlobStream are imported correctly in your SAP UI5 app

      //     // Initialize PDF document
      //     const doc = new PDFDocument({
      //       size: 'A4',
      //       margins: { top: 40, bottom: 40, left: 40, right: 40 },
      //     });

      //     const stream = doc.pipe(blobStream());

      //     // Example data from SAP UI5 model
      //     const invoiceData = {
      //       client: {
      //         name: "Onest Limited",
      //         gstNumber: "27AAACO2933J1ZG",
      //         address: "2nd Floor, Unit-II/C, Techniplex-II, Goregaon (W), Mumbai",
      //       },
      //       supplier: {
      //         name: "AEON PRODUCTS",
      //         address: "Gala No 1/13, Navi Mumbai",
      //         gstNumber: "27AABPP9841N1Z7",
      //       },
      //       items: [
      //         { description: "Florona Actifille Toothpaste", quantity: 100000, rate: 3.6, amount: 360000 },
      //         { description: "Florona Actifille Toothpaste (Without Toothbrush)", quantity: 100000, rate: 4.0, amount: 400000 }
      //       ],
      //       totals: {
      //         total: 760000,
      //         cgst: 68400,
      //         sgst: 68400,
      //         grandTotal: 896800,
      //       },
      //       footer: {
      //         amountInWords: "INR Eighty Nine Thousand Six Hundred Eighty Only",
      //         companyName: "Onest Limited",
      //         signatureDate: "7/10/24"
      //       }
      //     };

      //     // Define layout functions

      //     // 1. Add Header Section
      //     function addHeader(doc, data) {
      //       doc
      //         .fontSize(12)
      //         .text("PURCHASE ORDER", { align: 'center' })
      //         .moveDown()
      //         .text(`Invoice To: ${data.client.name}`, 50, 50)
      //         .text(`GSTIN/UIN: ${data.client.gstNumber}`, 50, 65)
      //         .text(`Address: ${data.client.address}`, 50, 80)
      //         .moveDown()
      //         .text(`Voucher No.: PO/1129/24-25`, 400, 50, { align: 'right' })
      //         .text(`Date: 7-Oct-24`, 400, 65, { align: 'right' });
      //     }

      //     // 2. Add Supplier and Delivery Details
      //     function addSupplierDetails(doc, data) {
      //       doc
      //         .fontSize(10)
      //         .text(`Supplier (Bill from): ${data.supplier.name}`, 50, 120)
      //         .text(`Address: ${data.supplier.address}`, 50, 135)
      //         .text(`GSTIN/UIN: ${data.supplier.gstNumber}`, 50, 150)
      //         .text(`Terms of Delivery: DAMAN`, 400, 135, { align: 'right' });
      //     }

      //     // 3. Add Items Table
      //     function addItemsTable(doc, items) {
      //       let y = 200; // Starting position of the table

      //       // Table headers
      //       doc.fontSize(10).text('Sr', 50, y)
      //         .text('Description of Goods', 100, y)
      //         .text('Quantity', 300, y)
      //         .text('Rate', 400, y)
      //         .text('Amount', 480, y);
      //       y += 20;

      //       // Loop through items and add each row
      //       items.forEach((item, index) => {
      //         doc.text(index + 1, 50, y)
      //           .text(item.description, 100, y)
      //           .text(item.quantity, 300, y)
      //           .text(item.rate.toFixed(2), 400, y)
      //           .text(item.amount.toFixed(2), 480, y);
      //         y += 20;
      //       });

      //       // Draw table lines
      //       doc.moveTo(45, 190).lineTo(550, 190).stroke();
      //       doc.moveTo(45, y + 10).lineTo(550, y + 10).stroke();
      //     }

      //     // 4. Add Totals and Tax Section
      //     function addTotals(doc, totals) {
      //       let y = 300; // Position for totals section
      //       doc
      //         .fontSize(10)
      //         .text(`Total: ${totals.total.toFixed(2)}`, 400, y)
      //         .text(`Input CGST 9%: ${totals.cgst.toFixed(2)}`, 400, y + 20)
      //         .text(`Input SGST 9%: ${totals.sgst.toFixed(2)}`, 400, y + 40)
      //         .font('Helvetica-Bold')
      //         .text(`Grand Total: ${totals.grandTotal.toFixed(2)}`, 400, y + 60)
      //         .font('Helvetica');
      //     }

      //     // 5. Add Footer Section
      //     function addFooter(doc, footer) {
      //       doc
      //         .fontSize(10)
      //         .text(`Amount Chargeable (in words): ${footer.amountInWords}`, 50, 500)
      //         .moveDown()
      //         .text(`For ${footer.companyName}`, 50, 600)
      //         .text(`Authorized Signature`, 400, 600)
      //         .text(`${footer.signatureDate}`, 400, 620, { align: 'right' });
      //     }

      //     // Render the sections on the PDF
      //     addHeader(doc, invoiceData);
      //     addSupplierDetails(doc, invoiceData);
      //     addItemsTable(doc, invoiceData.items);
      //     addTotals(doc, invoiceData.totals);
      //     addFooter(doc, invoiceData.footer);

      //     // End the document and create blob
      //     doc.end();
      //     stream.on('finish', function () {
      //       const url = stream.toBlobURL('application/pdf');
      //       window.open(url); // Open the PDF in a new tab or handle as needed
      //     });


      //   }

      // })







    },
    toDataURL: function (src, callback) {

      var image = new Image();
      image.crossOrigin = 'Anonymous';
      image.onload = function () {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.height = this.naturalHeight;
        canvas.width = this.naturalWidth;
        context.drawImage(this, 0, 0);
        var dataURL = canvas.toDataURL('image/png');
        return callback(dataURL);
      };
      image.src = src;
    }
  };
});
