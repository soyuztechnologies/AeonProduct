sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/core/Fragment",
  "sap/m/MessageBox",
  "sap/ui/core/BusyIndicator",
  "sap/ui/model/Filter",
  'sap/ui/export/Spreadsheet',
  'sap/ui/export/library',
  'sap/ui/model/FilterOperator'
], function (BaseController, JSONModel, MessageToast, Fragment, MessageBox, BusyIndicator, Filter,Spreadsheet,exportLibrary,FilterOperator) {
  "use strict";
  var EdmType = exportLibrary.EdmType;

  return BaseController.extend("ent.ui.ecommerce.controller.Attachments", {

    onInit: function () {
      this._oRouter = this.getRouter();
      this._oRouter.getRoute("PONumber").attachPatternMatched(this._pomatchedHandler, this);
      this._oRouter.getRoute("ArtworkNumber").attachPatternMatched(this._artworkmatchedHandler, this);
      this._oRouter.getRoute("InvNumber").attachPatternMatched(this._invmatchedHandler, this);
      this._oRouter.getRoute("DelNumber").attachPatternMatched(this._delmatchedHandler, this);
    },

    _pomatchedHandler:function(){
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
      oModel.setProperty("/messageStripVis", false);
      oModel.setProperty("/valueType","PoNo");
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
      this.getUserRoleData();
      this.getAttachmentDatas();
      // this.getCompanyName();
      // this.getJobsData();
    },
    _artworkmatchedHandler:function(){
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
      oModel.setProperty("/messageStripVis", false);
      oModel.setProperty("/valueType","ArtworkNo");
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
      this.getUserRoleData();
      this.getAttachmentDatas();
      // this.getCompanyName();
      // this.getJobsData();
    },
    _invmatchedHandler:function(){
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
      oModel.setProperty("/messageStripVis", false);
      oModel.setProperty("/valueType","InvNo");
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
      this.getUserRoleData();
      this.getAttachmentDatas();
      // this.getCompanyName();
      // this.getJobsData();
    },
    _delmatchedHandler:function(){
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
      oModel.setProperty("/messageStripVis", false);
      oModel.setProperty("/valueType","DelNo");
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
      this.getUserRoleData();
      this.getAttachmentDatas();
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
// onUploadChange: function (oEvent) {
//   debugger;
//   var files = oEvent.getParameter("files");
//   var that = this;
//   var route = that.getRouter().oHashChanger.hash
//   that.files = [];
//   that.file = [];
//   that.count = 0;
//       for (var i = 0; i < files.length; i++) {
//       var reader = new FileReader()
//       this.files.push({ "Label": files[i].name, "Key": files[i].name.split('_')[0], "Type":route})
//       // this.files.push({ "Key": files[i].name.split('_')[0]})=
//       reader.onload = function (e) {
//               var vContent = e.currentTarget.result; //.replace("data:application/pdf;base64,", ""); //.result.replace("data:image/jpeg;base64,", "");
//               // that.img = vContent;
//               that.oFileContentJson = {}
//               that.content = that.convertFileToUrl(vContent);
//               that.oFileContentJson.Key = that.files[that.count].Key;
//               that.oFileContentJson.Label = that.files[that.count].Label;
//               that.oFileContentJson.Attachment = vContent;
//               that.oFileContentJson.Type = that.files[that.count].Type;
//               that.file[that.count] = that.oFileContentJson;
//               that.count++;
//       };
//       reader.readAsDataURL(files[0]);
//       }
//       // this.onUserDataChange();
// },

onUploadChange: function (oEvent) {
  debugger;
  return new Promise((resolve, reject) => {
    debugger;
   var type=  this.getView().getModel("appView").getProperty("/valueType")
    var files = oEvent.getParameter("files");
    var that = this;
    var route = that.getRouter().oHashChanger.hash;
    that.files = [];
    that.file = [];
    that.count = 0;
    function processFile(index) {
      if (index < files.length) {
        var reader = new FileReader();
        that.files.push({ "Label": files[index].name, "Key": files[index].name.split('_')[0]+type, "Type": route });
        reader.onload = function (e) {
          var vContent = e.currentTarget.result;
          that.oFileContentJson = {};
          that.content = that.convertFileToUrl(vContent);
          that.oFileContentJson.Key = that.files[index].Key;
          that.oFileContentJson.Label = that.files[index].Label;
          that.oFileContentJson.Attachment = vContent;
          that.oFileContentJson.Type = that.files[index].Type;
          that.file[index] = that.oFileContentJson;
          that.count++;
          processFile(index + 1);
        };

        reader.onerror = function (error) {
          reject(error);
        };

        reader.readAsDataURL(files[index]);
      } else {
        resolve();
      }
    }

    processFile(0);

  });



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
            that.getAttachmentDatas();
          },
          error: function (error) {
            // Error callback
            that.middleWare.errorHandler(error, that);
            // MessageToast.show("Error reading data");
          }
        });
      }
      },
      oDialogOpen: function () {
        var oView = this.getView();
        if (!this.oUploadDialog) {
          this.oUploadDialog = Fragment.load({
            id: oView.getId(),
            name: "ent.ui.ecommerce.fragments.printingDetailFragment.uploadDoc",
            controller: this
          }).then(function (oDialog) {
            // Add dialog to view hierarchy
            oView.addDependent(oDialog);
            return oDialog;
          }.bind(this));
        }
        return this.oUploadDialog;

      },
      getAttachmentDialog:function(oEvent){
        debugger;
        var that = this;
        this.isAttachment = true;
          var key =  oEvent.getSource().getBindingContext('appView').getObject().Key;
          var dModel = this.getView().getModel();
          dModel.read(`/Attachments('${key}')`, {
            urlParameters: {
              "$select": "Attachment"
            },
          success: function (data) {
            that.getModel("appView").setProperty("/attachmentFiles", data.Attachment)
          },
          error: function (error) {
            MessageBox.show("Attachment is not Attached")
          }
        });
					this.oDialogOpen().then(function (oDialog) {
						oDialog.open();
					});
      },

      onReject: function () {
        var that = this;
        this.oUploadDialog.then(function (oDialog) {
          oDialog.close();
          that.getView().getModel("appView").setProperty("/attachmentFiles","");
          oDialog.updateBindings();
        });
      },
      onPressDelete: function (oEvent) {
        debugger;
        var that = this;
        var oModel = this.getView().getModel();
        var oItem = oEvent.getParameter("listItem").getBindingContext('appView').getObject()
        MessageBox.confirm("Are you sure you want to delete?", {
          actions: ["OK", "Close"],
          emphasizedAction: 'OK',
          onClose: function (sAction) {
            if (sAction === "OK") {
              oModel.remove(`/Attachments('${oItem.Key}')`, {
                success: function () {
                  // Do something after successful deletion
                  MessageToast.show("Deleted Successfully");
                  that.getAttachmentDatas();
                },
                error: function (error) {
                  BusyIndicator.hide();
                }
              });
            }
          }
        });
      },
      
      onSearchAttachment: function (oEvent) {
        debugger;
        var sValue = oEvent.getParameter("newValue")
        var oFilter1 = new Filter("Label", FilterOperator.Contains, sValue);
        var aFilters = [oFilter1];
        var oFilter = new Filter({
          filters: aFilters,
          and: false
        });
        var oList = this.getView().byId("idAttachmentPage");
        var oBinding = oList.getBinding("items");
        oBinding.filter(oFilter);
      },

      getAttachmentDatas:function(){
        debugger;
        var oModel = this.getView().getModel();
        var that = this;
        var value = this.getView().getModel("appView").getProperty("/valueType")
        var filteredAttachmentDatas=[];
        oModel.read('/Attachments', {
          filters:[new Filter("Type","EQ",value)],
          urlParameters: {
              	"$select": "Key,Type,Label"
              },
          success: function (data) {
            that.getView().getModel("appView").setProperty("/Attachmentsssss",data.results);
            // data.results.forEach(element => {
            //   if (element.Type === value) {
            //     filteredAttachmentDatas.push(element);
            //   }
            // });
            that.getView().getModel("appView").setProperty("/filteredAttachments",data.results);
          },
          error: function (error) {
            // Error callback
            that.middleWare.errorHandler(error, that);
            // MessageToast.show("Error reading data");
          }
        });
      }


  });


});
