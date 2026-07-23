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

    _pomatchedHandler:function(oEvent){
      
      this.attachmentType = oEvent.getParameter('config').pattern;
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
      var oTable = this.getView().byId('idAttachmentPage').getBinding("items")
      oTable.filter(new Filter("Type", FilterOperator.EQ, "PoNo"))
      // this.getAttachmentDatas();
      // this.getCompanyName();
      // this.getJobsData();
    },
    _artworkmatchedHandler:function(oEvent){
      
      this.attachmentType = oEvent.getParameter('config').pattern;
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
      var oTable = this.getView().byId('idAttachmentPage').getBinding("items")
      oTable.filter(new Filter("Type", FilterOperator.EQ, "ArtworkNo"))
      // this.getAttachmentDatas();
      // this.getCompanyName();
      // this.getJobsData();
    },
    _invmatchedHandler:function(oEvent){
      
      this.attachmentType = oEvent.getParameter('config').pattern;
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
      var oTable = this.getView().byId('idAttachmentPage').getBinding("items")
      oTable.filter(new Filter("Type", FilterOperator.EQ, "InvNo"))
      // this.getAttachmentDatas();
      // this.getCompanyName();
      // this.getJobsData();
    },
    _delmatchedHandler:function(oEvent){
      
      this.attachmentType = oEvent.getParameter('config').pattern;
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
      var oTable = this.getView().byId('idAttachmentPage').getBinding("items")
      oTable.filter(new Filter("Type", FilterOperator.EQ, "DelNo"))
      // this.getAttachmentDatas();
      // this.getCompanyName();
      // this.getJobsData();
    },

  convertFileToUrl: function (vContent) {
    
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

// onUploadChange: function (oEvent) {
  
//   return new Promise((resolve, reject) => {
    
//    var type=  this.getView().getModel("appView").getProperty("/valueType")
//     var files = oEvent.getParameter("files");
//     var that = this;
//     var route = that.getRouter().oHashChanger.hash;
//     that.files = [];
//     that.file = [];
//     that.count = 0;
//     function processFile(index) {
//       if (index < files.length) {
//         var reader = new FileReader();
//         var key;
//         if (type == "ArtworkNo") {
//           key = files[index].name.replace(/\s+/g, "").split('.')[0] + type;
//         } else {
//           key = files[index].name.split('_')[0] + type;
//         }
//         that.files.push({ "Label": files[index].name, "Key": key, "Type": route });
//         reader.onload = function (e) {
//           var vContent = e.currentTarget.result;
//           that.oFileContentJson = {};
//           that.content = that.convertFileToUrl(vContent);
//           that.oFileContentJson.Key = that.files[index].Key;
//           that.oFileContentJson.Label = that.files[index].Label;
//           that.oFileContentJson.Attachment = vContent;
//           that.oFileContentJson.Type = that.files[index].Type;
//           that.file[index] = that.oFileContentJson;
//           that.count++;
//           processFile(index + 1);
//         };

//         reader.onerror = function (error) {
//           reject(error);
//         };

//         reader.readAsDataURL(files[index]);
//       } else {
//         resolve();
//       }
//     }

//     processFile(0);

//   });
  
// },
    onUploadChange: function (oEvent) {
      
      return new Promise((resolve, reject) => {
        
      var type=  this.getView().getModel("appView").getProperty("/valueType")
        var files = oEvent.getParameter("files");
        var that = this;
        var route = that.getRouter().oHashChanger.hash;
        that.files = [];
        // that.file = [];
        that.count = 0;
        function processFile(index) {
          if (index < files.length) {
            var reader = new FileReader();
            var key;
            if (type == "ArtworkNo") {
              key = files[index].name.replace(/\s+/g, "").split('.')[0] + type;
            } else {
              key = files[index].name.split('_')[0] + type;
            }
            that.files.push({ "Label": files[index].name, "Key": key, "Type": route });
            reader.onload = function (e) {
              var vContent = e.currentTarget.result;
              that.oFileContentJson = {};
              that.content = that.convertFileToUrl(vContent);
              that.oFileContentJson.Key = that.files[index].Key;
              that.oFileContentJson.Label = that.files[index].Label;
              that.oFileContentJson.Attachment = vContent;
              that.oFileContentJson.Type = that.files[index].Type;
              that.files[index] = that.oFileContentJson;
              that.count++;
              processFile(index + 1);

              if (that.count === files.length){
                that.allAttachmentsKeyToString()
                that.checkInAttachments()
              }
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
    allAttachmentsKeyToString: function() {
      var data = this.files
      var array = []
      for (var i = 0; i < data.length; i++) {
        array.push(data[i].Label)
      }
      this.getView().getModel("appView").setProperty("/allAttachmentsKey", array)
    },
    checkInAttachments:function(){
      this.Flag = false;
      var that = this;
      var allAttachmentsKey = this.getView().getModel("appView").getProperty("/allAttachmentsKey")
      var oUploadedAttachments = this.files
      var newAttachments = []
      var filters = allAttachmentsKey.map(function(key) {
        return '{"Label": "' + key + '"}';
      });
      var filter = encodeURIComponent('{"where": {"or": [' + filters.join(",") + ']}}');
      var url = 'api/Attachments?filter=' + filter
      this.middleWare.callMiddleWare(url, "GET")
      .then(function(data, status, xhr){
        for(let index = 0; index < data.length; index++){
          const element = data[index];
          var oIndex = oUploadedAttachments.findIndex((ele) => {
            return ele.Label === element.Label
          });
          that.Flag = true;
          that.validateAttachments()   
        }
        for(let j = 0; j < oUploadedAttachments.length; j++){
          const ele = oUploadedAttachments[j];
          var oIndex = data.findIndex((element) => {
            return ele.Label === element.Label
          });
          if(oIndex == -1){
            newAttachments.push(ele)
          }else{
            data[oIndex] = ele
          }
        }
        that.getView().getModel("appView").setProperty("/oldAttachmentFiles", data);
        that.getView().getModel("appView").setProperty("/newlyAddedAttachments", newAttachments);
        that.getView().getModel('appView').updateBindings();
      })
      .catch(function (jqXhr, textStatus, errorMessage) {

          that.middleWare.errorHandler(jqXhr, that);
        });
    },

    validateAttachments: function(){
      var that = this;
      that.oAttachmentValidation().then(function(oDialog){
        oDialog.open();
      })
    },

    oAttachmentValidation: function(){
      var oView = this.getView();
      var that = this;
      if (!this.oAttachmentValidationDialog) {
        this.oAttachmentValidationDialog = Fragment.load({
          id: oView.getId(),
          name: "ent.ui.ecommerce.fragments.AttachmentValidation",
          controller: this
        }).then(function (oDialog) {
          // Add dialog to view hierarchy
          oView.addDependent(oDialog);
          return oDialog;
        }.bind(this));
      }
      return this.oAttachmentValidationDialog
    },

    onCloseAttachmentValDialog: function(){
      var that = this;
      this.oAttachmentValidationDialog.then(function(oDialog){
        oDialog.close();
      })
    },

    removeAttachment: function(oEvent){
      var selectedAttachment = oEvent.getSource().getBindingContext("appView").getObject();
      var AllAttachementFiles = this.getView().getModel("appView").getProperty("/oldAttachmentFiles");
      
      // var index =  AllAttachementFiles.findIndex((ele) => {
      //   return ele.Label === selectedAttachment.Label
      // });

      // Compare Keys 
      var index = AllAttachementFiles.findIndex(function(ele){
       return ele.Key === selectedAttachment.Key;
      });
      if(index != -1){
        AllAttachementFiles.splice(index, 1);
      }
      this.getView().getModel('appView').updateBindings();
    },

    onSaveDocuments: async function () {
      var that = this;
        var newAttachments = this.getView().getModel("appView").getProperty("/newlyAddedAttachments");
        var replaceAttachments = this.getView().getModel("appView").getProperty("/oldAttachmentFiles");

      // Validation
      if ((!newAttachments || newAttachments.length === 0) && (!replaceAttachments || replaceAttachments.length === 0)) {
          sap.m.MessageToast.show("Please upload at least one document");
          return;
        }

      sap.ui.core.BusyIndicator.show(); 

      var allPromises = [];

      var fnUploadToBackend = function (oDocData) {
          return that.middleWare.callMiddleWare("saveDocumentToDrive", "POST", oDocData);
      };

      // 1. Process New Attachments
      if (newAttachments && newAttachments.length > 0) {
          newAttachments.forEach(function (element) {
              var payload = {
                  Key: element.Key,
                  Label: element.Label,
                  Attachment: element.Attachment,
                  Type: element.Type
              };
              allPromises.push(fnUploadToBackend(payload));
          });
      }

      // 2. Process Replace Attachments
      if (replaceAttachments && replaceAttachments.length > 0) {
          replaceAttachments.forEach(function (element) {
              var payload = {
                  Key: element.Key,
                  Label: element.Label,
                  Attachment: element.Attachment, 
                  Type: element.Type
              };
              allPromises.push(fnUploadToBackend(payload));
          });
      }

      // 3. Wait for ALL Uploads to Finish
      try {
          await Promise.all(allPromises);
          
          sap.ui.core.BusyIndicator.hide();
          sap.m.MessageToast.show("All Documents Uploaded Successfully to Drive!");
          
          if (that.getAttachmentDatas) {
              that.getAttachmentDatas();
          }
          
          that.getView().getModel("appView").setProperty("/newlyAddedAttachments", []);
          that.getView().getModel("appView").setProperty("/oldAttachmentFiles", []);
          that._clearUploadAttachment();

      } catch (error) {
          sap.ui.core.BusyIndicator.hide();
          console.error("Upload Error:", error);
          if(that.middleWare && that.middleWare.errorHandler){
              that.middleWare.errorHandler(error, that);
          } else {
              sap.m.MessageBox.error("Failed to upload some documents.");
          }
      }
    },

    _clearUploadAttachment: function () {
			var oFileUploader = this.byId("fileUploader");

			var oView = this.getView();
    
			if (!oFileUploader) {
				var aControls = this.getView().getControlsByFieldGroupId() || [];
				oFileUploader = this.getView().findAggregatedObjects(true).find(function(ctrl) {
					return ctrl.getId && ctrl.getId().includes("fileUploader");
				});
			}
			
			if (oFileUploader) {
				console.log("Found FileUploader:", oFileUploader.getId());
				oFileUploader.clear();
				oFileUploader.setValue("");
			} else {
				console.error("FileUploader still not found!");
			}
		},

    // onSaveDocuments:function(){
      
    //   var oModel = this.getView().getModel();
    //   // var file = this.file;
    //   var newAttachments = this.getView().getModel("appView").getProperty("/newlyAddedAttachments");
    //   var replaceAttachments = this.getView().getModel("appView").getProperty("/oldAttachmentFiles");
    //   var that = this;
    //   if(!newAttachments && (newAttachments.length == 0 && !replaceAttachments) && replaceAttachments.length == 0){
    //     MessageToast.show("Please upload at least one document");
    //     return;
    //   }
    //   // This call is used to upload new attachments in DB
    //   if(newAttachments.length > 0){
    //     for (let i = 0; i < newAttachments.length; i++) {
    //       const element = newAttachments[i];
    //       oModel.create('/Attachments', element, {
    //         success: function (data) {
    //           // that.getAttachmentDatas();
    //         },
    //         error: function (error) {
    //           // Error callback
    //           that.middleWare.errorHandler(error, that);
    //           // MessageToast.show("Error reading data");
    //         }
    //       });
    //     }
    //   }
    //   // This call is used to replace existing attachments in DB
    //   if(replaceAttachments.length > 0){
    //     for(let j = 0; j < replaceAttachments.length; j++){
    //       const element = replaceAttachments[j];
    //       this.middleWare.callMiddleWare("api/Attachments", "PUT", element)
    //       .then(function (data, status, xhr){
    //         MessageToast.show("Successfully Uploaded")
    //       })
    //       .catch(function (jqXhr, textStatus, errorMessage) {
    //           that.middleWare.errorHandler(jqXhr, that);
    //         });
    //     }
    //   }
    // },

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
        
        var that = this;
        this.isAttachment = true;
          var key =  oEvent.getSource().getBindingContext().getObject().Key;
      var type =  oEvent.getSource().getBindingContext().getObject().Type;
      // var dModel = this.getView().getModel();

      this.middleWare.callMiddleWare("getAttachment?attachmentId=" + key + "&type=" + type, "GET")
				.then(function (data, status, xhr) {
					that.getModel("appView").setProperty("/attachmentFiles", data.Attachment);
					that.oDialogOpen().then(function (oDialog) {
            oDialog.open();
          });
				}
				)
				.catch(function (jqXhr, textStatus, errorMessage) {
					if(jqXhr){
						that.middleWare.errorHandler(jqXhr, that);
					}else{
						MessageBox.show("Attachment Is Not Attached")
					}
				});


        //   dModel.read(`/Attachments('${key}')`, {
        //     urlParameters: {
        //       "$select": "Attachment"
        //     },
        //   success: function (data) {
        //     that.getModel("appView").setProperty("/attachmentFiles", data.Attachment)
        //   },
        //   error: function (error) {
        //     MessageBox.show("Attachment is not Attached")
        //   }
        // });
        // this.oDialogOpen().then(function (oDialog) {
        //   oDialog.open();
        // });
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
      
      let that = this;
      let oModel = this.getView().getModel();
      let oListItem = oEvent.getParameter("listItem");
      let oContext = oListItem.getBindingContext();
      let oItem = oContext.getObject();

      MessageBox.confirm("Are you sure you want to delete?", {
        actions: ["OK", "Close"],
        emphasizedAction: 'OK',
        onClose: function (sAction) {
          if (sAction === "OK") {
            BusyIndicator.show(0);

                let key = oItem.Key;

                that.middleWare.callMiddleWare(
                    "deleteAttachment?attachmentId=" + key,
                    "DELETE"
                )
                .then(function (data) {

                  let sPath = oContext.getPath();

                  oModel.setProperty(sPath, null);

                  oModel.refresh(true);

                  BusyIndicator.hide();

                  MessageToast.show("Deleted Successfully");

                })
                .catch(function (jqXhr) {

                    BusyIndicator.hide();

                    that.middleWare.errorHandler(jqXhr, that);
                });


            // oModel.remove(`/Attachments('${oItem.Key}')`, {
            //   success: function () {
            //     // Do something after successful deletion
            //     MessageToast.show("Deleted Successfully");
            //     // that.getAttachmentDatas();
            //   },
            //   error: function (error) {
            //     BusyIndicator.hide();
            //   }
            // });
          }
        }
      });
    },
    
    onSearchAttachment: function (oEvent) {
      
      var sValue = oEvent.getParameter("newValue")
      var oFilter1 = new Filter("Label", FilterOperator.Contains, sValue);
      var oFilter2 = new Filter("Type", FilterOperator.Contains, this.attachmentType);
      var aFilters = [oFilter1,oFilter2];
      var oFilter = new Filter({
        filters: aFilters,
        and: true
      });
      var oList = this.getView().byId("idAttachmentPage");
      var oBinding = oList.getBinding("items");
      oBinding.filter(oFilter);
    },

    // getAttachmentDatas:function(){
    //   var oModel = this.getView().getModel();
    //   var that = this;
    //   var value = this.getView().getModel("appView").getProperty("/valueType")
    //   var filteredAttachmentDatas=[];
    //   oModel.read('/Attachments', {
    //     filters:[new Filter("Type","EQ",value)],
    //     urlParameters: {
    //         	"$select": "Key,Type,Label"
    //         },
    //     success: function (data) {
    //       that.getView().getModel("appView").setProperty("/Attachmentsssss",data.results);
    //       // data.results.forEach(element => {
    //       //   if (element.Type === value) {
    //       //     filteredAttachmentDatas.push(element);
    //       //   }
    //       // });
    //       that.getView().getModel("appView").setProperty("/filteredAttachments",data.results);
    //     },
    //     error: function (error) {
    //       // Error callback
    //       that.middleWare.errorHandler(error, that);
    //       // MessageToast.show("Error reading data");
    //     }
    //   });
    // }


  });


});
