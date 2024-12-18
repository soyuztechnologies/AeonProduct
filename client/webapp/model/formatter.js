sap.ui.define(["sap/ui/core/format/NumberFormat","sap/ui/core/format/DateFormat",], function (NumberFormat,DateFormat) {
  "use strict";

  return {
    /**
     * Rounds the currency value to 2 digits
     *
     * @public
     * @param {string} sValue value to be formatted
     * @returns {string} formatted currency value with 2 digits
     */
    currencyValue: function (sValue) {
      if (!sValue) {
        return 0;
      }

      return parseFloat(sValue).toFixed(2);
    },
    formatVisiblePass: function (value) {
      if (value) {
        if (value.includes("basic")) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    },
    formatType: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/SubprojectTypes");
        for (var index = 0; index < oData.length; index++) {
          var element = oData[index];
          if (element.SubprojectTypeID === value) {
            return element.SubprojectTypeID + " " + element.SubprojectTypeName;
          }
        }
      }
    },
    formatNumberToLocale: function (num) {
      if (num || num === 0) {
        var oCurrencyFormat = NumberFormat.getCurrencyInstance({
          currencyCode: false,
        });
        num = parseFloat(num);
        return Boolean(parseFloat(num.toFixed(2)))
          ? oCurrencyFormat.format(num)
          : 0;
      }
    },
    formatAccountingType: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/ValidValuesMD");
        for (var index = 0; index < oData.length; index++) {
          var element = oData[index];
          if (element.Value === value) {
            return element.Value + " " + element.Description;
          }
        }
      }
    },
    formatOwner: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/EmployeesInfo");
        for (var index = 0; index < oData.length; index++) {
          var element = oData[index];
          if (element.EmployeeID === value) {
            return (
              element.EmployeeID +
              " " +
              element.FirstName +
              " " +
              element.LastName
            );
          }
        }
      }
    },
    formatOwnerId: function (value, value1, value2) {
      var str = ``;
      if (value) {
        str = `${value}-${value1} (${value2})`;
      }
      return str;
    },
    formatTask: function (value) {
      if (value) {
        var oData = this.getView().getModel("appView").getProperty("/Tasks");
        for (var index = 0; index < oData.length; index++) {
          var element = oData[index];
          if (element.TaskID === value) {
            return element.TaskID + " " + element.TaskName;
          }
        }
      }
    },
    SupplierFormat: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/Suppliers");
        if (oData) {
          for (var index = 0; index < oData.length; index++) {
            var element = oData[index];
            if (element.CardCode === value) {
              return element.CardCode + " " + element.CardName;
            }
          }
        }
      }
    },
    formatContactPerson: function (value) {
      if (value) {
        var oData = this.getView().getModel("appView").getProperty("/VH_ContactPerson");
        if (oData) {
          for (var index = 0; index < oData.length; index++) {
            var element = oData[index];
            if (element.CntctCode === value) {
              return element.Name;
            }
          }
        }
      }
    },
    formatCheckBoxSelect: function (value) {
      if (value) {
        if (value.includes("Y")) {
          return true;
        }
      }
      return false;
    },
    formatStage: function (value) {
      if (value) {
        var oData = this.getView()
          .getModel("appView")
          .getProperty("/StageTypes");
        if (oData) {
          for (let index = 0; index < oData.length; index++) {
            var element = oData[index];
            if (element.StageID === value) {
              return element.StageID + " " + element.StageName;
            }
          }
        }
      }
    },
    documentStatusText: function (statusText) {
      //

      if (!statusText) {
        return "None";
      }
      if (statusText.includes("Open")) {
        return this.getModel("i18n").getProperty("Open");
      } else {
        return this.getModel("i18n").getProperty("Closed");
      }
    },
    documentStatusState: function (statusText) {
      if (!statusText) {
        return "None";
      }
      if (statusText.includes("Open")) {
        return "Success";
      } else {
        return "Error";
      }
    },

    conDateFormatter: function (oDate) {
      if (oDate) {
        oDate = new Date(oDate);
        // sap.ui.model.type.Date
        // var dateFormat=new sap.ui.model.type.Date({source: { style: "medium"}});
        //
        // var oFormat = sap.ui.core.format.DateFormat.getInstance({
        //   format: "yMMMd"
        // });

        var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "dd/MM/yyyy",
        });
        // var dateFormat=sap.ui.core.format.DateFormat()
        // var dateFormatted = dateFormat.format(oDate);
        return oFormat.format(oDate);
      }
      return oDate;
    },
downloadAttachmentVis:function(value){

  var userName = this.getView().getModel("appView").getProperty('/UserRole');
  if(this.isAttachment === true){
    return false;
  }
  if(userName === 'Admin'|| userName === 'Factory Manager' || userName === 'Accounts Head'||userName === 'Customer'){
    return true;
  }
  else{
    return false;
  }

  // =${appView>/UserRole} === 'Admin'|| ${appView>/UserRole} === 'Factory Manager' || ${appView>/UserRole} === 'Accounts Head'? true : false}"
},
    conTimeFormatter: function (oDate) {
      if (oDate) {
        let value = oDate.toString();
        if (value.length === 3) {
          value = "0" + value;
        }
        let fValue = value[0] + value[1] + ":" + value[2] + value[3];
        return fValue;
      }
      return oDate;
    },
    actionFormatter: function (oData) {
      if (oData) {
        switch (oData) {
          case "C":
            return "C-Phone Call";
          case "M":
            return "M-Meeting";
          case "T":
            return "T-Task";
          case "E":
            return "E-Note";
          case "P":
            return "P-Campaign";
          case "N":
            return "N-Other";

          default:
            break;
        }
      }
      return oData;
    },
    conHourFormatter: function (data) {
      if (data) {
        data = parseFloat(data);
        var oFormatOptions = {
          minIntegerDigits: 1,
          maxIntegerDigits: 15,
          minFractionDigits: 0,
          maxFractionDigits: 2,
        };
        var oFloatFormat =
          sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions);
        //   let oFloat=parseFloat(oFloatFormat.format(data));
        // return oFloat;
        return oFloatFormat.format(data);
      }
      return 0.0;
    },
    conHourFormatterPC: function (data) {
      if (data) {
        data = parseFloat(data);

        // data=data.toFixed(2);

        return data.toPrecision(4).replace(/\.?0+$/, "");
      }

      return 0;
    },
    conActiveFormatter: function (data) {
      if (data) {
        data = parseFloat(data);
        if (data > 0) {
          return true;
        } else {
          return false;
        }
        // return oFloatFormat.format(data.toFixed(2));
      }
      return false;
    },
    formatterListPriceLength: function (data) {
      if (data) {
        if (data.length < 100) {
          return `(${data.length})`;
        } else {
          return `(100+)`;
        }
      }
    },
    conHourFormatterInp: function (data) {
      if (data) {
        data = parseFloat(data);
        return data.toFixed(2);
      }
      return data;
    },
    conStatusFormatter: function (oStatus) {
      //
      if (oStatus) {
        switch (oStatus) {
          case "0":
            return this.getModel("i18n").getProperty("Draft");
          case "1":
            return this.getModel("i18n").getProperty("Confirmed");
          case "2":
            return this.getModel("i18n").getProperty("Consolidated");
          case "3":
            return this.getModel("i18n").getProperty("Accounting");
          case "4":
            return this.getModel("i18n").getProperty("Billed");
          default:
            break;
        }
      }
    },
    conSentFormatter: function (oStatus) {
      //
      if (oStatus) {
        switch (oStatus) {
          case "N":
            return this.getModel("i18n").getProperty("No");
          case "S":
            return this.getModel("i18n").getProperty("Sent");
          case "F":
            return this.getModel("i18n").getProperty("Failed");
          case "P":
            return this.getModel("i18n").getProperty("Progress");
          default:
            break;
        }
      }
    },
    conContractFormatter: function (oCont) {
      if (oCont) {
        if (oCont === "Y") {
          return true;
        }
        return false;
      }
    },
    conInvantoFormatter: function (oCont) {
      if (oCont) {
        if (oCont === "S") {
          return true;
        }
        return false;
      }
    },
    conUserFormatter: function (oUser) {
      if (oUser) {
        var oData = this.getModel("consolidation").getProperty(
          "/ConsolidationVH_User"
        );
        if (oData) {
          const oUFilter = (elem) => {
            return elem.USERID === oUser;
          };
          var oUserData = oData.filter(oUFilter);
          if (oUserData.length > 0) {
            return oUserData[0].U_NAME;
          } else {
            return oUser;
          }
        } else {
          return oUser;
        }
      }
    },
    timeSheetProject: function (value) {
      if (value) {
        var oData = this.getView().getModel("timesheetData").getProperty("/timesheetDataVH_Project");
        if (oData) {
          for (var index = 0; index < oData.length; index++) {
            var element = oData[index];
            if (element.ProjectCode === value) {
              return element.ProjectName;
            }
          }
        }
      }
    },
    timeSheetAppntColor: function (oData) {
      switch (oData) {
        case "0":
          return "#b4bbc4";
        case "1":
          return "#8fce00";
        case "2":
          return "#f1c232";
        default:
          return "#0c343d";
      }
    },
    formatRowsColor: function (oRow, oStatus) {
      if (oStatus) {
        if (oStatus.includes("C")) {
          return "c4c1be";
        }
      }
      if (oRow) {
        if (oRow === "Draft") {
          // return "676b71";c4c1be
          return "fad8d8";
        }
      }
      return;
    },
    workedHourFormatter: function (data) {
      if (data) {
        data = parseFloat(data);
        if (data.toString().includes(".") || data.toString().includes(",")) {
          var oCurrencyFormat = NumberFormat.getCurrencyInstance({
            currencyCode: false,
            decimals: 1,
          });

          return oCurrencyFormat.format(data.toFixed(1));
          // return data.toFixed(1);
        }

        return data;
      }
    },
    decimalFormatter: function (data) {
      if (data) {
        data = parseFloat(data);
        // if (data.toString().includes(".") || data.toString().includes(",")) {
        var oCurrencyFormat = NumberFormat.getCurrencyInstance({
          currencyCode: false,
          decimals: 2,
        });

        return oCurrencyFormat.format(data.toFixed(2));
        // return data.toFixed(1);
        // }


      }
      return data;
    },
    decimalFormatterForPieces: function (data) {
      if (data) {
        data = parseFloat(data);
        var oCurrencyFormat = NumberFormat.getCurrencyInstance({
          currencyCode: false,
          decimals: 0,
        });

        return oCurrencyFormat.format(data.toFixed(0));
        // return data.toFixed(1);
        // }


      }
      return data;
    },
    decimalFormatterWithSheets: function (data) {
      if (data) {
        data = parseFloat(data);
        // if (data.toString().includes(".") || data.toString().includes(",")) {
        var oCurrencyFormat = NumberFormat.getCurrencyInstance({
          currencyCode: false,
          decimals: 2,
        });
        var Value = oCurrencyFormat.format(data.toFixed(2));
        return Value + " Sheets"
        // return data.toFixed(1);
        // }


      }
      return data;
    },
    decimalFormatterWithRupee: function (data) {
      if (data) {
        data = parseFloat(data);
        // if (data.toString().includes(".") || data.toString().includes(",")) {
        var oCurrencyFormat = NumberFormat.getCurrencyInstance({
          currencyCode: false,
          decimals: 2,
        });
        var Value = oCurrencyFormat.format(data.toFixed(2));
        return Value + " ₹"
        // return data.toFixed(1);
        // }


      }
      return data;
    },
    formatYN: function (oValue) {
      if (oValue) {
        if (oValue.includes("Y")) {
          return true;
        }
      }
      return false;
    },
    formatAddressType: function (value) {
      if (value) {
        if (value.includes("Bill")) {
          return this.getModel("i18n").getProperty("billTo");
        } else {
          return this.getModel("i18n").getProperty("shipTo");
        }
      }
    },
    formatStatusEditable: function (oStatus) {
      if (oStatus && oStatus.includes("Close")) {
        return false;
      }
      return true;
    },
    formatItemRowColor: function (oStatus) {
      if (oStatus && oStatus.includes("Close")) {
        return "c4c1be";
      }
      return "";
    },
    formatActivityRowsColor: function (oStatus) {
      if (oStatus && oStatus.includes("Y")) {
        return "c4c1be";
      }
      return "";
    },
    value: function (oValue) {
      if (oValue) {
        return oValue.split("_")[1];
      }
      return "";
    },
    fomatActivity: function (oValue) {
      if (oValue) {
        if (oValue.includes("Other")) {
          return this.getModel("i18n").getProperty("Other");
        }
        if (oValue.includes("Campaign")) {
          return this.getModel("i18n").getProperty("Campaign");
        }
        if (oValue.includes("Notes")) {
          return this.getModel("i18n").getProperty("Notes");
        }
        if (oValue.includes("Task")) {
          return this.getModel("i18n").getProperty("Task");
        }
        if (oValue.includes("Meeting")) {
          return this.getModel("i18n").getProperty("Meeting");
        }
        if (oValue.includes("PhoneCall")) {
          return this.getModel("i18n").getProperty("PhoneCall");
        }
      }
      return oValue;
    },
    fomatActivitySelect: function (oValue) {
      if (oValue) {
        if (oValue.includes("Other")) {
          return 'N';
        }
        if (oValue.includes("Campaign")) {
          return 'P';
        }
        if (oValue.includes("Notes")) {
          return 'E';
        }
        if (oValue.includes("Task")) {
          return 'T';
        }
        if (oValue.includes("Meeting")) {
          return 'M';
        }
        if (oValue.includes("PhoneCall")) {
          return 'C';
        }
      }
      return oValue;
    },
    formatPriorityNum: function (oValue) {
      if (oValue) {
        if (oValue.includes("Low")) {
          return 0;
        }
        if (oValue.includes("Normal")) {
          return 1;
        }
        if (oValue.includes("High")) {
          return 2;
        }
      }
    },
    jsStartDateFormat: function (oDate, oTime) {
      if (oDate) {
        let date = new Date(oDate);
        if (oTime) {
          let tme = oTime.toString();
          let hr = tme[0] + tme[1];
          let min = tme[2] + tme[3];
          hr = parseInt(hr);
          min = parseInt(min);
          date.setHours(hr, min, 0);
        }
        else {
          // date.setHours(9 , 0, 0);
        }
        return date;
      }
    },
    jsEndDateFormat: function (oDate) {
      if (oDate) {
        let date = new Date(oDate);
        date.setHours(14, 0, 0)
        return date;
      }
    },
    ActivityAppntColor: function (oStatus) {
      if (oStatus && oStatus.includes("Y")) {
        return "#c4c1be";
      }
      return "#f58b00";
      // switch (oData) {
      //   case "0":
      //     return  '#b4bbc4'
      //   case "1":
      //     return '#8fce00'
      //   case "2":
      //     return  '#f1c232'
      //   default:
      //     return '#0c343d'
      // }
    },
    statusText: function (sStatus) {
      var oBundle = this.getResourceBundle();
      var mStatusText = {
        "D": oBundle.getText("statusD"),
        "S": oBundle.getText("statusS"),
        "A": oBundle.getText("statusA"),
        "R": oBundle.getText("statusR"),
        "E": oBundle.getText("statusE"),
        "N": oBundle.getText("statusN")
      };
      return mStatusText[sStatus] || sStatus;
    },
    statusIcon: function (s) {
      var icon = {
        "D": "sap-icon://write-new-document",
        null: "sap-icon://create",
        "S": "sap-icon://message-success",
        "A": "sap-icon://complete",
        "R": "sap-icon://decline",
        "E": "sap-icon://decline",
        "N": "sap-icon://create"
      };
      return icon[s];
    },
    statusState: function (s) {
      var state = {
        "S": sap.ui.core.ValueState.Warning,
        "A": sap.ui.core.ValueState.Success,
        "R": sap.ui.core.ValueState.Error
      };
      return state[s] || sap.ui.core.ValueState.None;
    },
    invoiceStatusText: function (oStatus) {
      if (oStatus) {
        if (oStatus === 'OK') {
          return "Successful";
        }
        else if (oStatus === 'ERROR') {
          return "Error";
        }
      }
      return "Submitted";
    },
    invoiceStatusIcon: function (oStatus) {
      if (oStatus) {
        if (oStatus === 'OK') {
          return "sap-icon://message-success";
        }
        else if (oStatus === 'ERROR') {
          return "sap-icon://status-error";
        }
      }
      return "sap-icon://warning";
    },
    invoiceStatusState: function (oStatus) {
      if (oStatus) {
        if (oStatus === 'OK') {
          return "Success";
        }
        else if (oStatus === 'ERROR') {
          return "Error";
        }
      }
      return "Warning";
    },
      getImageUrlFromContent: function (base64Stream) {
        
        if (base64Stream) {
          var b64toBlob = function (dataURI) {
            var dataURIParts = dataURI.split(',');
            var byteString = atob(dataURIParts[1]);
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], {
              type: 'image/jpeg'
            });
          };
          var x = b64toBlob(base64Stream);
          return URL.createObjectURL(x);
        }
      },
    // getImageUrlFromContent: function(base64Stream) {
    //   if (base64Stream) {
    //     var b64toBlob = function(dataURI) {
    //       try {
    //         var byteString;
    //         var dataURIParts = dataURI.split(',');
    //         if (dataURIParts.length > 1) {
    //           byteString = atob(dataURIParts[1]);
    //         } else {
    //           byteString = atob(dataURI);
    //         }
    //         var ab = new ArrayBuffer(byteString.length);
    //         var ia = new Uint8Array(ab);
    //         for (var i = 0; i < byteString.length; i++) {
    //           ia[i] = byteString.charCodeAt(i);
    //         }
    //         return new Blob([ab], { type: 'image/jpeg' });
    //       } catch (e) {
    //         console.error("Failed to decode Base64 string:", e);
    //         return null;
    //       }
    //     };

    //     var x = b64toBlob(base64Stream);
    //     if (x) {
    //       return URL.createObjectURL(x);
    //     }
    //   }
    //   return null;
    // },

    checkEmailFormat: function (email) {
      if (email) {
        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
        return mailregex.test(email);
      }
      return false;
    },
    formatColumnName: function (oCol) {
      if (oCol && oCol.includes("U_")) {
        return oCol.split("U_")[1];
      }
      return oCol;
    },
    transColumnVisible: function (oStatus) {

      if (oStatus) {
        if (oStatus.includes('OK') || oStatus.includes('IGNORE_NOT_SETTLED') || oStatus.includes('IGNORE_DUPLICATE') || oStatus.includes('Object')) {
          return false;
        }
      }
      return true;
    },
    DateFormatter: function (oDate) {
      if (oDate) {
        oDate = new Date(oDate);

        var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "dd/MM/yyyy",
        });
        return oFormat.format(oDate);
      }
      return oDate;
    },
    TimeFormatter: function (oDate) {

      if (oDate) {
        var value = oDate.toString();
        if (value.includes(":")) {
          if (value.length > 5) {
            value = value.slice(0, -1);
            value = value.slice(0, -1);
            if (value.length === 6) {
              value = value.slice(0, -1);
            }
            return value;
          }
          return value;
        }
        if (value.length === 3) {
          value = "0" + value;
        }
        let fValue = value[0] + value[1] + ":" + value[2] + value[3];
        return fValue;
      }
      return oDate;
    },
    formatIndianNumber(number) {
       if (number) {
              const roundedNumber = Math.ceil(number);      
              return roundedNumber.toLocaleString('en-IN');     
            }
    },
    formatPcsForPacking(Packing, SecoundarySuppliers) {
      
      if (SecoundarySuppliers === 0) {
        return "Packing";
      } else {
        return `${Packing} + ${SecoundarySuppliers}`;
      }
    },
    DateTimeFormatter: function (oDate) {
      if (oDate) {
        var value = oDate.toString();
        if (value) {
          value = value.slice(0, -1);
          value = value.slice(0, -1);
          value = value.slice(0, -1);
          return value;
        }
        return oDate;
      }
    },
    VHcurrency: function (Code) {
      if (Code) {
        var oValueHelp = this.getModel("appView").getProperty("/VH_Currency");
        for (let val = 0; val < oValueHelp.length; val++) {
          if (oValueHelp[val].Code == Code) {
            return oValueHelp[val].Name;
          }
        }
      }
      return Code;
    },
    getBase64ToPdf: function (sBase64String) {

      if (sBase64String) {
        // var decodedPdfContent = atob(sBase64String);
        var decodedPdfContent = atob(sBase64String.split(',')[1]);
        var byteArray = new Uint8Array(decodedPdfContent.length)
        for (var i = 0; i < decodedPdfContent.length; i++) {
          byteArray[i] = decodedPdfContent.charCodeAt(i);
        }
        var blob = new Blob([byteArray.buffer], { type: 'application/pdf' });
        var _pdfurl = URL.createObjectURL(blob);
        jQuery.sap.addUrlWhitelist("blob");
        return _pdfurl;
      }
    },
    // Formatter function for visibility
    getPdfVisibility: function (attachmentFiles) {
      return attachmentFiles && attachmentFiles.startsWith('data:application/pdf') ? true : false;
    },
    getbuttonVisibility: function (attachmentFiles) {
      if (!attachmentFiles) {
        return false;
      }
      return attachmentFiles && attachmentFiles.startsWith('data:application/pdf') ? false : true;
    },
    getTextVisibility: function (attachmentFiles) {
      if (!attachmentFiles) {
        return false;
      }
      // Check if the file is a CSV
      if (attachmentFiles.startsWith('data:text/csv')) {
        return true;

      };
      if (attachmentFiles.startsWith('data:application/vnd.ms-excel')) {
        return true;

      };
      if (attachmentFiles.startsWith('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
        return true;

      };
      if (attachmentFiles.startsWith('data:application/msword')) {
        return true;
      };
      if (attachmentFiles.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        return true;
      };

      return false;
    },
    getImageVisibility: function (attachmentFiles) {
      return attachmentFiles && attachmentFiles.startsWith('data:image/') ? true : false;
    },



    getStatusColor: function (status) {
      switch (status) {
        case "New":
          return "None";
          break;
        case "Printing":
          return "Warning";
          break;
        case "Paper Cutting":
          return "Warning";
          break;
        case "Coating":
          return "Warning";
          break;
        case "Foiling":
          return "Warning";
          break;
        case "SpotUV":
          return "Warning";
          break;
        case "Packing":
          return "Warning";
          break;
        case "Embossing":
          return "Warning";
          break;
        case "Punching":
          return "Warning";
          break;
        case "Pasting":
          return "Warning";
          break;
        case "Dispatched":
          return "Success";
          break;
        case "Delivering":
          return "Success";
          break;
        case "Ready For Dispatch":
          return "Success";
          break;
        case "Cancelled":
          return "Error";
          break;
        case "Others":
          return "Error";
          break;
        default:
          break;
      }
    },
    sizeFormatter: function (sizeL, sizeW, sizeH) {
      var parts = [];

      if (sizeL !== null) {
        parts.push(sizeL + "mm");
      }

      if (sizeW !== null) {
        parts.push(sizeW + "mm");
      }

      if (sizeH !== null) {
        parts.push(sizeH + "mm");
      }

      return parts.join(' x ');
    },
    getImageUrlsFromContentForRemarks: function (base64Streams) {

      var imageUrls = [];

     

      for (var i = 0; i < base64Streams.length; i++) {

         var base64Stream = base64Streams[i];

         if (base64Stream) {

            imageUrls.push("data:image/jpeg;base64," + base64Stream);

         }

      }

     

      return imageUrls;

   },
   artworkVisAccordingToProcess: function(status, UserRole) {

    if (status === "Printing" || status === "Paper Cutting" || status === "Coating") {

        return UserRole === "Printing Head" || UserRole === "Admin" || UserRole === "Factory Manager" || UserRole === "Raw Material Head" || UserRole === "Customer";

    } else if (status === "Foiling" || status === "SpotUV" || status === "Embossing" || status === "Punching") {

        return UserRole === "Post Press Head" || UserRole === "Admin" || UserRole === "Factory Manager" || UserRole === "Raw Material Head" || UserRole === "Customer";

    } else if (status === "Pasting" || status === "Ready For Dispatch") {

        return UserRole === "Dispatch Head" || UserRole === "Admin" || UserRole === "Factory Manager" || UserRole === "Raw Material Head" || UserRole === "Customer";

    } else if (status === "Dispatched") {

        return UserRole === "Accounts Head" || UserRole === "Admin" || UserRole === "Factory Manager" || UserRole === "Raw Material Head" || UserRole === "Customer";

    }else if(status === null || status === "Value Mismatched"){

        return UserRole === "Admin" || UserRole === "Factory Manager" || UserRole === "Raw Material Head" || UserRole === "Customer";

    }

},
   RemarkButtonVisibility: function(rawMaterial, UserRole) {
    if (rawMaterial === 'In Stock' ) {
        return UserRole === "Admin" || UserRole === "Factory Manager";
    }    

},
   ValueMisAndOtherStatusColor: function(status) {
    if (status === 'Value Mismatched' ) {
      return 'ffff5c'
    }else if (status === 'Others') {
      return 'ff6666'
    }  else{
      return 'ffffff'
    }

},

    // showPcs: function (qtyPcs) {
    //   if (qtyPcs || qtyPcs === null) {
    //     return qtyPcs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //   }
    //   return qtyPcs + " Pcs";
    // },
    showEqmm: function (x, y) {
      if (x === null) {
        return " ";
      }
      return x + " x " + y + " mm";

    },
    showGsm: function (PaperGSM) {
      if (PaperGSM === null) {
        return " ";
      }
      return PaperGSM + " GSM";

    },
    // showPcs: function (Quantity) {
    //   var formattedValue = Quantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //   return formattedValue + " pcs";
    // },
    tableEntryVisible: function (Data) {
      if (!Data || Data.length === 0) {

        return false;

      }

      else {

        return true;

      }

    },
    showSheets: function (PaperGSM) {
      if (PaperGSM === null) {
        return " ";
      }
      return Math.round(PaperGSM) + " Sheets";

    },
    equal: function (x, y, z) {
      if (x === null) {
        return " ";
      }
      return x + ' x ' + y + ' = ' + z + " UPS";

    },

    showmm: function (showmm) {
      if (showmm === null) {
        return " ";
      }
      return showmm + " mm";

    },
    showPercent: function (x) {
      if (x === null) {
        return " ";
      }
      return x + " %";

    },
    showKg: function (x) {
      if (x === null) {
        return " ";
      }
      return Math.round(x) + " Kg";

    },

    formatInvNo: function (InvNo) {

      var oModel = this.getView().getModel("appView");

      var userName = oModel.getProperty('/UserRole');; // Replace with the appropriate role information


      if (Array.isArray(InvNo) && InvNo.length > 0) {

        var invNoValues = InvNo.map(function (obj) {

          return obj.InvNo;

        });



        return invNoValues.join(", ");

      }






      return InvNo;

    },




    formatDelNo: function (DeliveryNo) {

      var oModel = this.getView().getModel("appView");

      var userName = oModel.getProperty('/UserRole');; // Replace with the appropriate role information



      if (Array.isArray(DeliveryNo) && DeliveryNo.length > 0) {

        var invNoValues = DeliveryNo.map(function (obj) {

          return obj.DeliveryNo;

        });



        return invNoValues.join(", ");



      }




      return DeliveryNo;

    },
    formatFullName: function (userName, firstName, lastName) {

      // var firstName = appUser.FirstName;

      // var lastName = appUser.LastName;

      // var userName = appUser.UserName;

      if (firstName && lastName) {

        return firstName + ' ' + lastName;

      } else {

        return userName;

      }

    },
    highlightFormatter: function (sOperation, sCompany) {

      if (sOperation === "RU" && !sCompany) {
        return "Warning";
      }
      if (sOperation === "RU" && sCompany) {
        return "Error";
      }
      else if (sOperation === 'N') {
        return 'Indication08';
      }
      else if (sOperation === 'U') {
        return 'Warning';
      }
      else if (sOperation === 'R') {
        return 'Information';
      }
      return 'None';
    },
    costStructureVis: function (role) {

      // 
      // var role = this.getView().getModel("appView").getProperty("/UserRole");
      if (role === "Admin") {
        return true;
      }
      else {
        return false;
      }
    },
    // customerCompanyVis: function(role){
    //   // 
    //   // var role = this.getView().getModel("appView").getProperty("/UserRole");
    //   if(role === "Customer"){
    //     return true;
    //   }
    //   else{
    //     return false;
    //   }
    // },
    companyVis: function (blocked, status) {
      if (blocked === "Yes" || status != "Approved") {
        return false;
      } else {
        return true;
      }
    },
    urgentFormatter: function (urgent) {
      if (urgent === "Yes") {
        return "Favorite"
      }
    },
    RemarkStarFormatter: function (remark1, remark2, remark3) {
      if (remark1 !== null  && remark1 !== undefined) {
        return "Flagged"
      }
      else if (remark2 !== null && remark2 !== undefined) {
        return "Flagged"
      }
      else if (remark3 !== null && remark3 !== undefined) {
        return "Flagged"
      }
    },
    statusFormatter: function (color) {

      var alljobstatus = this.getView().getModel("appView").getProperty("/allJobStatus");
      var allJobData = this.getView().getModel("appView").getProperty("/jobsData");

    },
  formatMaxDate: function(sDate) {
    if(sDate){
        var oDateFormat = DateFormat.getDateTimeInstance({ pattern: "MM/dd/yyyy" });
        var sOutput = oDateFormat.format(new Date(sDate));
        return sOutput;

    }
  },
  formateDateWithTime : function(dateString){
    if(dateString){
      var oDateFormat = DateFormat.getDateTimeInstance({ pattern: "dd-MM-yyyy HH:mm:ss" });
      var sOutput = oDateFormat.format(new Date(dateString));
      return sOutput;
    }
  }
    // equalFormatter: function(noOfUps-1, noOfUps-1, noOfUps-1) {
    //   var parts = [];

    //   if (sizeL !== null) {
    //     parts.push(sizeL);
    //   }

    //   if (sizeW !== null) {
    //     parts.push(sizeW);
    //   }

    //   if (sizeH !== null) {
    //     parts.push('=' + sizeH);
    //   }

    //   return parts.join('x');
    // }

  };
});
