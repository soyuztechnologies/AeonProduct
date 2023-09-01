sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/core/Fragment",
  "sap/m/MessageBox",
  "sap/ui/core/BusyIndicator",
  "sap/ui/model/Filter",
  'sap/ui/export/Spreadsheet',
  'sap/ui/export/library'
], function (BaseController, JSONModel, MessageToast, Fragment, MessageBox, BusyIndicator, Filter,Spreadsheet,exportLibrary) {
  "use strict";
  var EdmType = exportLibrary.EdmType;

  return BaseController.extend("ent.ui.ecommerce.controller.Attachments", {

    onInit: function () {
      this._oRouter = this.getRouter();
      this._oRouter.getRoute("PONumber").attachPatternMatched(this._matchedHandler, this); 
      this._oRouter.getRoute("ArtworkNumber").attachPatternMatched(this._matchedHandler, this);
      this._oRouter.getRoute("InvNumber").attachPatternMatched(this._matchedHandler, this);
      this._oRouter.getRoute("DelNumber").attachPatternMatched(this._matchedHandler, this);
    },
   
    _matchedHandler:function(){
      debugger;
      var oModel = this.getModel("appView");
      oModel.setProperty("/layout", "OneColumn");
      oModel.setProperty("/visibleHeader", false);
      oModel.setProperty("/userRoleVis", true);
      oModel.setProperty("/visibility", true);
      oModel.setProperty("/hamburgerVisibility", true);
      oModel.setProperty("/logoutVisibility", true);
      oModel.setProperty("/pdfVisibility", false);
      oModel.setProperty("/sideExpanded", true);
      oModel.setProperty("/simpleFormVisibility", true);
      oModel.setProperty("/uploadButtonVisibility", true);
      oModel.setProperty("/imgVisibility", false);
      oModel.setProperty("/editableFields", false);
      oModel.setProperty("/messageStripVis", false)
      // oModel.setProperty("/aeonHeaderVis", true);

      // oModel.setProperty("/onUpdateJobVis", false)
      // this.onPressClear();

      var bSystemType = this.getModel("device").getData().system.desktop;
      if (bSystemType) {
        oModel.setProperty('/desktop', true);
      } else {
        oModel.setProperty('/desktop', false);
      }
      oModel.updateBindings();
      // this.selectCompany();
      this.getUserRoleData();
      // this.getCompanyName();
      // this.getJobsData();
    },

  convertFileToUrl: function (vContent) {
    debugger;
    var regex = /data:(\w.*);base64,/gm;
    var m = regex.exec(vContent),
    decodedPdfContent = atob(vContent.replace(regex, ""));
    var byteArray = new Uint8Array(decodedPdfContent.length);
    for (var i = 0; i < decodedPdfContent.length; i++) {
        byteArray[i] = decodedPdfContent.charCodeAt(i);
    }
    var blob = new Blob([byteArray.buffer], {
        type: m ? m[1] : 'application/pdf'
    });
    jQuery.sap.addUrlWhitelist("blob");
    return URL.createObjectURL(blob);
},
onUploadChange: function (oEvent) {
  var files = oEvent.getParameter("files");
  var that = this;
  var route = that.getRouter().oHashChanger.hash
  that.files = [];
  that.file = [];
  that.count = 0;
      for (var i = 0; i < files.length; i++) {
      var reader = new FileReader()
      this.files.push({ "Label": files[i].name, "Key": files[i].name.split('_')[0], "Type":route})
      // this.files.push({ "Key": files[i].name.split('_')[0]})
      reader.onload = function (e) {
              var vContent = e.currentTarget.result; //.replace("data:application/pdf;base64,", ""); //.result.replace("data:image/jpeg;base64,", "");
              // that.img = vContent;
              that.oFileContentJson = {}
              that.content = that.convertFileToUrl(vContent);
              that.oFileContentJson.Key = that.files[that.count].Key;
              that.oFileContentJson.Label = that.files[that.count].Label;
              that.oFileContentJson.Attachment = vContent;
              that.oFileContentJson.Type = that.files[that.count].Type;
              that.file[that.count] = that.oFileContentJson;
              that.count++;
      };
      reader.readAsDataURL(files[0]);
      }
      // this.onUserDataChange();
},

      onSaveDocuments:function(){
        debugger;
        var oModel = this.getView().getModel(); 
        var file = this.file;
        var that = this;
        for (let i = 0; i < file.length; i++) {
          const element = file[i];
        oModel.create('/Attachments', element, {
          success: function (data) {
            sap.m.MessageToast.show("Attachment Saved Successfully");
          },
          error: function (error) {
            // Error callback
            that.middleWare.errorHandler(error, that);
            // MessageToast.show("Error reading data");
          }
        });
      }
      },


  });
});
