sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel,MessageToast) {
	"use strict";

	return BaseController.extend("ent.ui.ecommerce.controller.Carborator", {

		onInit: function () {
			this._oRouter = this.getRouter();
			this.getRouter().getRoute("Carborator").attachPatternMatched(this._matchedHandler, this);
		},
		_matchedHandler:function(){
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getModel("appView").setProperty("/visibleHeader",false);
      this.getModel("appView").setProperty("/visibility", true);
			this.getModel("appView").updateBindings();
		},
    onPressNavigate:function(){
      this.getRouter().navTo("welcomePrinter");
    },
    onFileUploadChange: function (oEvent) {
        var oParams = oEvent.getParameters();
        var oFile = oParams.files[0];
        var sFilename = oFile.name;
        var that = this;
        var oReader = new FileReader();
        oReader.onload = function (e) {
          var sFileContent = e.target.result;

          // Parse the Excel file
          var oWorkbook = XLSX.read(sFileContent, { type: "binary" });
          var oWorksheet = oWorkbook.Sheets[oWorkbook.SheetNames[0]];
          var aData = XLSX.utils.sheet_to_json(oWorksheet, { header: 1 });
          that.extracDbFields(aData);
          // debugger;
          // Do something with the parsed data
          // console.log(aData);
        };

        oReader.readAsBinaryString(oFile);
      },
      arrayToJSON: function (array) {
        let json = {};
      
        for (let i = 0; i < array.length; i++) {
          for (let j = 0; j < array[i].length; j++) {
            let key = String.fromCharCode(j%26 + 65)+(j>26 ? j%26 + 65: '') + (i + 1);
            json[key] = array[i][j];
          }
        }
      
        return json;
      },

      onSavePayload: function() {
        debugger;
        var oModel = this.getView().getModel();  //default model get at here
        var that = this; 
        var oJsonInpValue = this.getView().getModel('appView').getProperty("/jsonValue");   // getting the textarea value 
        // var oData = {
        //   property1: oJsonInpValue,
        //   // property2: oJsonInpValue.property2,     // set the payload according to the need
        // };
        var payload = {
          "JobId": '017',
          "jobCardNo": "017",
          "poNo": "007",
          "jobCode": "UNMX 22.12 SFTRN 10PC 04",
          "date": 45020,
          "artworkCode": "UNMX 22.12 SFTRN 10PC 04",
          "clientPONo": "PO#001",
          "nameOFTheProduct": "SOFTRON BALLPEN 10PCS WINDOW DP BOX WITH EURO SLOT HEADER",
          "industry": "Other",
          "cartonType": "BSO",
          "qtyPcs": 40000,
          "PaperGSM": 320,
          "paperQuality": "White Back",
          "printing": "Offset CMYK + 1Pantone",
          "color": 5,
          "sizeL": 107,
          "sizeW": 10,
          "sizeH": 147,
          "varLmt": "Window BOPP Lamination",
          "effects": "None",
          "lock": 0,
          "tF": 51,
          "pF": 8,
          "doubleCut": 0,
          "trimTF": 22,
          "trimPF": 21,
          "noOfUps-1": 4,
          "noOfUps-2": 2,
          "noOfUps-3": 8,
          "noOfSheets-1": 5200,
          "noOfSheets-2": 2600,
          "wastage": 0.04,
          "wtKgs": 768.8928,
          "printingSheetSizeL1": 915,
          "printingSheetSizeW1": 505,
          "printingSheetSizeL2": 915,
          "printingSheetSizeW2": 1010,
          "printingMachine ": "SORSZ 2 Color - Heidelberg",
          "punchingMachine": "Bobst Novacut",
          "pastingMachine": "Acme Folder Gluer",
          "ref": "Print Out",
          "old": "Punch",
          "none": "Pantone",
          "b-2-A": "479_CTP_22.12_Softron 10PC Window Box",
          "none ": "Foil Blocks :",
          "127Level3": "FROSTRON GEL 10PC DISPENSER",
          "none1 ": "Emboss",
          "none2 ": "Positive :",
          "13Level2": "FROSTRON GEL 10PC DISPENSER WINDOW",
          "batchNo": "None",
          "mfgDate": "None",
          "expDate": "None",
          "correctionsInArtwork": "PKD to be changed as per PO.",
          "remarks": "Silver Special",
          "totalA+B": 77618.26140492281,
          "profit": 0,
          "totalCostOfJob": 77618.26140492281,
          "costPerPc": 1.9404565351230703,
          "plate": "Old :",
          "pantoneInks": 0,
          "foilBlocks": 0,
          "positive": 0,
          "embossBlock": 0,
          "punch": 0,
          "reference": "Print Out",
          "cartonLength": 208,
          "cartonWidth": 242,
          "paperCost": 45364.6752,
          "printingCharges": 5850,
          "varnish/Lamination": 14152.46140492281,
          "embossing": 0,
          "punching": 1560,
          "bSOPasting": 8000,
          "lBTOPasting": 0,
          "packing": 2691.1248,
          "transportation": 0,
          "total": 0,
          "plateCharges": 0,
          "blanketCharges": 0
        }
        oModel.create("/Jobs", payload, {          // sending the call on the endpoint
          success: function(data) {
            MessageToast.show("Job created successfully");
          },
          error: function(error) {
            that.middleWare.errorHandler(error, that);
            // MessageToast.show("Error: " + error.message);
          }
        });
        // this.middleWare.callMiddleWare("api/Jobs", "POST", payload)
        //   .then( function (data, status, xhr) {
        //     debugger;
        //     MessageToast.show("Job created successfully");

        //   })
        //   .catch(function (jqXhr, textStatus, errorMessage) {
        //     debugger;
        //     MessageToast.show("Error: " + jqXhr);
        //   });
      },
      
      
      extracDbFields: function(data){
        const arrayToJSON = this.arrayToJSON(data);
        debugger;
        const dbFieldsJSON = Object.values(this.fieldsJSON);
        const dbFields = {};
        dbFieldsJSON.forEach(item=>{
          debugger;
          dbFields[item.dbField]= arrayToJSON[item.data];
        })
        
        this.getView().byId("_IDGenTextArea1").setValue(JSON.stringify(dbFields, null, 4));
      },
      fieldsJSON: {
        "A2": {
          "data": "C2",
          "value": "016",
          "label": "Job Card No :",
          "dbField": "jobCardNo",
          "group": "",
          "groupCell": ""
        },
        "F2": {
          "data": "J2",
          "value": "007",
          "label": "PO No :",
          "dbField": "poNo",
          "group": "",
          "groupCell": ""
        },
        "A4": {
          "data": "C4",
          "value": "UNMX 22.12 SFTRN 10PC 04",
          "label": "Job Code :",
          "dbField": "jobCode",
          "group": "",
          "groupCell": ""
        },
        "F4": {
          "data": "J4",
          "value": "04-May-23",
          "label": "Date :",
          "dbField": "date",
          "group": "",
          "groupCell": ""
        },
        "A6": {
          "data": "C6",
          "value": "UNMX 22.12 SFTRN 10PC 04",
          "label": "Artwork Code :",
          "dbField": "artworkCode",
          "group": "",
          "groupCell": ""
        },
        "F6": {
          "data": "J6",
          "value": "PO#001",
          "label": "Client PO No :",
          "dbField": "clientPONo",
          "group": "",
          "groupCell": ""
        },
        "A8": {
          "data": "A10",
          "value": "SOFTRON BALLPEN 10PCS WINDOW DP BOX WITH EURO SLOT HEADER",
          "label": "Name of the Product",
          "dbField": "nameOFTheProduct",
          "group": "",
          "groupCell": ""
        },
        "A9": {
          "data": "B9",
          "value": "Other",
          "label": "Industry :",
          "dbField": "industry",
          "group": "",
          "groupCell": ""
        },
        "E8": {
          "data": "E9",
          "value": "BSO",
          "label": "Carton Type",
          "dbField": "cartonType",
          "group": "",
          "groupCell": ""
        },
        "F8": {
          "data": "F9",
          "value": "40,000 pcs",
          "label": "Qty. pcs.",
          "dbField": "qtyPcs",
          "group": "",
          "groupCell": ""
        },
        "G8": {
          "data": "G9",
          "value": "320 GSM",
          "label": "Paper GSM",
          "dbField": "PaperGSM",
          "group": "",
          "groupCell": ""
        },
        "I8": {
          "data": "I9",
          "value": "White Back",
          "label": "Paper Quality",
          "dbField": "paperQuality",
          "group": "",
          "groupCell": ""
        },
        "A13-1": {
          "data": "A15",
          "value": "Offset CMYK + 1Pantone",
          "label": "Printing",
          "dbField": "printing",
          "group": "",
          "groupCell": ""
        },
        "A13-2": {
          "data": "A14",
          "value": "5 Color",
          "label": "Color",
          "dbField": "color",
          "group": "",
          "groupCell": ""
        },
        "D14": {
          "data": "D15",
          "value": "107mm",
          "label": "L",
          "dbField": "sizeL",
          "group": "Size in mm",
          "groupCell": "D13"
        },
        "E14": {
          "data": "E15",
          "value": "10mm",
          "label": "W",
          "dbField": "sizeW",
          "group": "Size in mm",
          "groupCell": "D13"
        },
        "F14": {
          "data": "F15",
          "value": "147mm",
          "label": "H",
          "dbField": "sizeH",
          "group": "Size in mm",
          "groupCell": "D13"
        },
        "G13": {
          "data": "G14",
          "value": "Window BOPP Lamination",
          "label": "Var. Lmt.",
          "dbField": "varLmt",
          "group": "",
          "groupCell": ""
        },
        "I13": {
          "data": "I14",
          "value": "None",
          "label": "Effects",
          "dbField": "effects",
          "group": "",
          "groupCell": ""
        },
        "A17": {
          "data": "A18",
          "value": "mm",
          "label": "Lock",
          "dbField": "lock",
          "group": "",
          "groupCell": ""
        },
        "D17": {
          "data": "D18",
          "value": "51mm",
          "label": "TF",
          "dbField": "tF",
          "group": "",
          "groupCell": ""
        },
        "E17": {
          "data": "E18",
          "value": "8mm",
          "label": "PF",
          "dbField": "pF",
          "group": "",
          "groupCell": ""
        },
        "F17": {
          "data": "F18",
          "value": "mm",
          "label": "Double Cut",
          "dbField": "doubleCut",
          "group": "",
          "groupCell": ""
        },
        "G17": {
          "data": "G18",
          "value": "22mm",
          "label": "Trim in TF",
          "dbField": "trimTF",
          "group": "",
          "groupCell": ""
        },
        "I17": {
          "data": "I18",
          "value": "21mm",
          "label": "Trim in PF",
          "dbField": "trimPF",
          "group": "",
          "groupCell": ""
        },
        "A21-1": {
          "data": "A22",
          "value": "4 ups",
          "label": "No of ups",
          "dbField": "noOfUps-1",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "A21-2": {
          "data": "C22",
          "value": "2 ups",
          "label": "No of ups",
          "dbField": "noOfUps-2",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "A21-3": {
          "data": "A23",
          "value": "8 ups",
          "label": "No of ups",
          "dbField": "noOfUps-3",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "D21-1": {
          "data": "D22",
          "value": "5,200 Sheets",
          "label": "No. Of Sheets",
          "dbField": "noOfSheets-1",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "D21-2": {
          "data": "E23",
          "value": "200 Sheets",
          "label": "No. Of Sheets",
          "dbField": "noOfSheets-2",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "D21-3": {
          "data": "I21",
          "value": "2,600 Sheets",
          "label": "No. Of Sheets",
          "dbField": "noOfSheets-2",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "E21": {
          "data": "E22",
          "value": "4.00%",
          "label": "Wastage",
          "dbField": "wastage",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },

        "F21": {
          "data": "F22",
          "value": "768.89 kgs",
          "label": "Wt Kgs.",
          "dbField": "wtKgs",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "G21-1": {
          "data": "G22",
          "value": "915 mm",
          "label": "Printing Sheet Size",
          "dbField": "printingSheetSizeL1",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "G21-2": {
          "data": "H22",
          "value": "505 mm",
          "label": "Printing Sheet Size",
          "dbField": "printingSheetSizeW1",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "G21-3": {
          "data": "I22",
          "value": "915 mm",
          "label": "Printing Sheet Size",
          "dbField": "printingSheetSizeL2",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },
        "G21-4": {
          "data": "K22",
          "value": "1010 mm",
          "label": "Printing Sheet Size",
          "dbField": "printingSheetSizeW2",
          "group": "Paper & LAYOUT Details",
          "groupCell": "A20"
        },

        "A34": {
          "data": "A35",
          "value": "SORSZ 2 Color - Heidelberg",
          "label": "Printing Machine :",
          "dbField": "printingMachine ",
          "group": "Machines & Ancillary Details",
          "groupCell": "A33"
        },
        "E34": {
          "data": "E35",
          "value": "Bobst Novacut",
          "label": "Punching Machine :",
          "dbField": "punchingMachine",
          "group": "Machines & Ancillary Details",
          "groupCell": "A33"
        },
        "H34": {
          "data": "H35",
          "value": "Acme Folder Gluer",
          "label": "Pasting Machine :",
          "dbField": "pastingMachine",
          "group": "Machines & Ancillary Details",
          "groupCell": "A33"
        },
        "E37": {
          "data": "F37",
          "value": "Print Out",
          "label": "Ref :",
          "dbField": "ref",
          "group": "",
          "groupCell": ""
        },
        "A37": {
          "data": "C37",
          "value": "CTP",
          "label": "Old :",
          "dbField": "old",
          "group": "",
          "groupCell": ""
        },
        "G37": {
          "data": "H37",
          "value": "Pantone",
          "label": "None :",
          "dbField": "none",
          "group": "",
          "groupCell": ""
        },
        "A38": {
          "data": "C38",
          "value": "479_CTP_22.12_Softron 10PC Window Box",
          "label": "B-2-A :",
          "dbField": "b-2-A",
          "group": "",
          "groupCell": ""
        },
        "A39": {
          "data": "",
          "value": "",
          "label": "Print Time :",
          "dbField": "printTime",
          "group": "",
          "groupCell": ""
        },
        "A40": {
          "data": "",
          "value": "",
          "label": "Film & Adhsv :",
          "dbField": "film&Adhsv",
          "group": "",
          "groupCell": ""
        },
        "F39": {
          "data": "",
          "value": "",
          "label": "VAR / LMT Time :",
          "dbField": "var/lmtTime",
          "group": "",
          "groupCell": ""
        },
        "F40": {
          "data": "",
          "value": "",
          "label": "VARNISH Kgs :",
          "dbField": "varnishKgs ",
          "group": "",
          "groupCell": ""
        },
        "A42": {
          "data": "C42",
          "value": "Punch",
          "label": "Old :",
          "dbField": "old",
          "group": "",
          "groupCell": ""
        },
        "G42": {
          "data": "H42",
          "value": "Foil Blocks",
          "label": "None :",
          "dbField": "none ",
          "group": "",
          "groupCell": ""
        },
        "A43": {
          "data": "C43",
          "value": "FROSTRON GEL 10PC DISPENSER",
          "label": "127 Level 3",
          "dbField": "127Level3",
          "group": "",
          "groupCell": ""
        },

        "A44": {
          "data": "",
          "value": "",
          "label": "Punch Time :",
          "dbField": "punchTime",
          "group": "",
          "groupCell": ""
        },
        "G44": {
          "data": "",
          "value": "",
          "label": "Stamping Time :",
          "dbField": "stampingTime :",
          "group": "",
          "groupCell": ""
        },
        "A46": {
          "data": "C46",
          "value": "Emboss",
          "label": "None :",
          "dbField": "none1 ",
          "group": "",
          "groupCell": ""
        },
        "G46": {
          "data": "H46",
          "value": "Positive",
          "label": "None :",
          "dbField": "none2 ",
          "group": "",
          "groupCell": ""
        },
        "A47": {
          "data": "C47",
          "value": "FROSTRON GEL 10PC DISPENSER WINDOW",
          "label": "13 Level 2",
          "dbField": "13Level2",
          "group": "",
          "groupCell": ""
        },
        "A48": {
          "data": "",
          "value": "",
          "label": "Emboss Time :",
          "dbField": "embossTime",
          "group": "",
          "groupCell": ""
        },
        "G48": {
          "data": "",
          "value": "",
          "label": "Spot UV Kgs :",
          "dbField": "spotUVKgs",
          "group": "",
          "groupCell": ""
        },
        "A50": {
          "data": "",
          "value": "",
          "label": "Final Qty :",
          "dbField": "finalQty",
          "group": "",
          "groupCell": ""
        },
        "A52": {
          "data": "",
          "value": "",
          "label": "Delivery Location :",
          "dbField": "deliveryLocation",
          "group": "",
          "groupCell": ""
        },
        "G50": {
          "data": "",
          "value": "",
          "label": "No of Shprs :",
          "dbField": "noOfShprs",
          "group": "",
          "groupCell": ""
        },
        "G52": {
          "data": "",
          "value": "",
          "label": "Qty Per Shpr :",
          "dbField": "qtyPerShpr",
          "group": "",
          "groupCell": ""
        },
        "A25-1": {
          "data": "G26",
          "value": "None",
          "label": "Batch No :",
          "dbField": "batchNo",
          "group": "",
          "groupCell": ""
        },
        "A25-2": {
          "data": "G27",
          "value": "None",
          "label": "Mfg Date :",
          "dbField": "mfgDate",
          "group": "",
          "groupCell": ""
        },
        "A25-3": {
          "data": "G28",
          "value": "None",
          "label": "Exp Date :",
          "dbField": "expDate",
          "group": "",
          "groupCell": ""
        },
        "A25-4": {
          "data": "",
          "value": "",
          "label": "Code No :",
          "dbField": "codeNo",
          "group": "",
          "groupCell": ""
        },
        "G25": {
          "data": "D31",
          "value": "PKD to be changed as per PO.",
          "label": "Corrections in Artwork (If any)",
          "dbField": "correctionsInArtwork",
          "group": "",
          "groupCell": ""
        },
        "A30": {
          "data": "D30",
          "value": "Silver Special",
          "label": "Remarks (If Any) :",
          "dbField": "remarks",
          "group": "",
          "groupCell": ""
        },
        "P1": {
          "data": "Q1",
          "value": "₹ 77,618.26",
          "label": "Total A + B :",
          "dbField": "totalA+B",
          "group": "",
          "groupCell": ""
        },
        "P2": {
          "data": "Q2",
          "value": "₹ 0.00",
          "label": "Profit :",
          "dbField": "profit",
          "group": "",
          "groupCell": ""
        },
        "P3": {
          "data": "Q3",
          "value": "₹ 0.00",
          "label": "Miscellaneous :",
          "dbField": "miscellaneous",
          "group": "",
          "groupCell": ""
        },
        "P4": {
          "data": "Q4",
          "value": "₹ 77,618.26",
          "label": "Total Cost of Job :",
          "dbField": "totalCostOfJob",
          "group": "",
          "groupCell": ""
        },
        "P5": {
          "data": "Q5",
          "value": "₹ 1.94",
          "label": "Cost per Pc :",
          "dbField": "costPerPc",
          "group": "",
          "groupCell": ""
        },
        "P8": {
          "data": "Q8",
          "value": "Old :",
          "label": "Plate :",
          "dbField": "plate",
          "group": "Ancillary Parts",
          "groupCell": "P7"
        },
        "P9": {
          "data": "Q9",
          "value": "None :",
          "label": "Pantone Inks :",
          "dbField": "pantoneInks",
          "group": "Ancillary Parts",
          "groupCell": "P7"
        },
        "P10": {
          "data": "Q10",
          "value": "None :",
          "label": "Foil Blocks :",
          "dbField": "foilBlocks",
          "group": "Ancillary Parts",
          "groupCell": "P7"
        },
        "P11": {
          "data": "Q11",
          "value": "None :",
          "label": "Positive :",
          "dbField": "positive",
          "group": "Ancillary Parts",
          "groupCell": "P7"
        },
        "P12": {
          "data": "Q12",
          "value": "None :",
          "label": "Emboss Block :",
          "dbField": "embossBlock",
          "group": "Ancillary Parts",
          "groupCell": "P7"
        },
        "P13": {
          "data": "Q13",
          "value": "Old :",
          "label": "Punch :",
          "dbField": "punch",
          "group": "Ancillary Parts",
          "groupCell": "P7"
        },
        "P14": {
          "data": "Q14",
          "value": "Print Out",
          "label": "Reference :",
          "dbField": "reference",
          "group": "Ancillary Parts",
          "groupCell": "P7"
        },
        "P17-1": {
          "data": "Q17",
          "value": "208",
          "label": "Open Carton  Size :",
          "dbField": "cartonLength",
          "group": "Single Carton Sizing",
          "groupCell": "P16"
        },
        "P17-2": {
          "data": "R17",
          "value": "242",
          "label": "Open Carton  Size :",
          "dbField": "cartonWidth",
          "group": "Single Carton Sizing",
          "groupCell": "P16"
        },
        "P21": {
          "data": "Q21",
          "value": "₹ 45,364.68",
          "label": "Paper Cost :",
          "dbField": "paperCost",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P22": {
          "data": "Q22",
          "value": "₹ 5,850.00",
          "label": "Printing Charges :",
          "dbField": "printingCharges",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P23": {
          "data": "Q23",
          "value": "₹ 14,152.46",
          "label": "Varnish/Lamination :",
          "dbField": "varnish/Lamination",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P24": {
          "data": "Q24",
          "value": "₹ 0.00",
          "label": "Foil Blocks :",
          "dbField": "foilBlocks",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P25": {
          "data": "Q25",
          "value": "₹ 0.00",
          "label": "Positive :",
          "dbField": "positive",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P26": {
          "data": "Q26",
          "value": "₹ 0.00",
          "label": "Embossing :",
          "dbField": "embossing",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P27": {
          "data": "Q27",
          "value": "₹ 1,560.00",
          "label": "Punching :",
          "dbField": "punching",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P28": {
          "data": "Q28",
          "value": "₹ 8,000.00",
          "label": "BSO Pasting :",
          "dbField": "bSOPasting",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P29": {
          "data": "Q29",
          "value": "₹ 0.00",
          "label": "LBTO Pasting :",
          "dbField": "lBTOPasting",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P30": {
          "data": "Q30",
          "value": "₹ 2,691.12",
          "label": "Packing :",
          "dbField": "packing",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P31": {
          "data": "Q31",
          "value": "₹ 0.00",
          "label": "Transportation :",
          "dbField": "transportation",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P32": {
          "data": "Q32",
          "value": "₹ 77,618.26",
          "label": "A) Total :",
          "dbField": "total",
          "group": "A) Cost Structure :",
          "groupCell": "P20"
        },
        "P35": {
          "data": "Q35",
          "value": "₹ 0.00",
          "label": "Plate Charges :",
          "dbField": "plateCharges",
          "group": "B) Development Cost :",
          "groupCell": "P34"
        },
        "P36": {
          "data": "Q36",
          "value": "₹ 0.00",
          "label": "Pantone Inks :",
          "dbField": "pantoneInks",
          "group": "B) Development Cost :",
          "groupCell": "P34"
        },
        "P37": {
          "data": "Q37",
          "value": "₹ 0.00",
          "label": "Blanket Charges :",
          "dbField": "blanketCharges",
          "group": "B) Development Cost :",
          "groupCell": "P34"
        },
        "P38": {
          "data": "Q38",
          "value": "₹ 0.00",
          "label": "Foil Blocks :",
          "dbField": "foilBlocks",
          "group": "B) Development Cost :",
          "groupCell": "P34"
        },
        "P39": {
          "data": "Q39",
          "value": "₹ 0.00",
          "label": "Positive :",
          "dbField": "positive",
          "group": "B) Development Cost :",
          "groupCell": "P34"
        },
        "P40": {
          "data": "Q40",
          "value": "₹ 0.00",
          "label": "Emboss Block :",
          "dbField": "embossBlock",
          "group": "B) Development Cost :",
          "groupCell": "P34"
        },
        "P41": {
          "data": "Q41",
          "value": "₹ 0.00",
          "label": "Punch :",
          "dbField": "punch",
          "group": "B) Development Cost :",
          "groupCell": "P34"
        },
        "P42": {
          "data": "Q42",
          "value": "",
          "label": "Miscellaneous :",
          "dbField": "miscellaneous",
          "group": "B) Development Cost :",
          "groupCell": "P34"
        },
        "P43": {
          "data": "Q43",
          "value": "₹ 0.00",
          "label": "B) Total",
          "dbField": "total",
          "group": "B) Development Cost :",
          "groupCell": "P34"
        }
      }
	});
});
