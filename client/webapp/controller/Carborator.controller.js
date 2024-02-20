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

  return BaseController.extend("ent.ui.ecommerce.controller.Carborator", {

    onInit: function () {
      this._oRouter = this.getRouter();
      this.getRouter().getRoute("Carborator").attachPatternMatched(this._matchedHandler, this);
    },
    _matchedHandler: function () {
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
      this.getCompanyName();
      this.getJobsData();
    },
    onPressNavigate: function () {
      this.getRouter().navTo("allPrinters");
    },


    //* This function is use to upload all the excel files in bulk!
    onUploadExcels: function (oEvent) {
      var that = this;
      that.getView().getModel("appView").setProperty("/newlySelectedData", "");
      var oFileUploader = oEvent.getSource();
      var files = oEvent.getParameter("files");
      this.files = [];
      this.count = 0;
      for (var i = 0; i < files.length; i++) {
        var oFile = files[i];
        this.files.push({ "fileName": oFile.name })
        // Process the file
        that.getView().getModel("appView").setProperty("/fileNames", oFile);
        var oReader = new FileReader();
        oReader.onload = function (e) {
          var sFileContent = e.target.result;
          var oWorkbook = XLSX.read(sFileContent, { type: "binary" });
          var oWorksheet = oWorkbook.Sheets[oWorkbook.SheetNames[0]];
          var aData = XLSX.utils.sheet_to_json(oWorksheet, { header: 1 });
          var excelValues = that.getModel("appView").getProperty("/allExcelData") || [];
          this.oFileContentJson = that.extracDbFields(aData);
          this.oFileContentJson.fileName = that.files[that.count].fileName;
          that.files[that.count].fileContent = this.oFileContentJson;
          that.count++;
          that.getModel("appView").setProperty("/pdfVisibility", false);
          that.getModel("appView").setProperty("/simpleFormVisibility", true);
          that.getModel("appView").setProperty("/uploadButtonVisibility", false);
          that.getModel("appView").setProperty("/imgVisibility", false);
          that.getView().getModel("appView").setProperty("/allJobsCount", files.length);

          if (that.count === files.length) {
            that.allJobcardnoToString();
            that.checkInJobs();
          }
        };
        oReader.readAsBinaryString(oFile);
      }


    },


    //* This function will get all the jobs that are already present on the backend and show it to screen!
    getJobsData: function () {
      var oFilter = encodeURIComponent('{"where":{"CompanyId": null}}');
      var url = 'api/Jobs?filter=' + oFilter
      var that = this;
      this.middleWare.callMiddleWare(url, "get")
        .then(function (data, status, xhr) {
          data.forEach(item => {
            item.operation = "R";
          });
          that.getView().getModel("appView").setProperty("/storeDBJobs", JSON.parse(JSON.stringify(data)));
          that.getView().getModel("appView").setProperty("/allExcelData", data);

        })
        .catch(function (jqXhr, textStatus, errorMessage) {
          that.middleWare.errorHandler(jqXhr, that);
        });
    },


    //* This will get only jobCardNo and convert it to the string
    allJobcardnoToString: function () {
      var preData = this.getView().getModel("appView").getProperty("/newlySelectedData");
      var array = [];
      for (let i = 0; i < preData.length; i++) {
        const element = preData[i].jobCardNo;
        array.push(element)
      }
      this.getView().getModel("appView").setProperty("/jobCardNoInString", array)
    },
    onViewPdf: function () {
      var viewPdf = this.getView().getModel("appView").getProperty("/pdfUrl")
      window.open(viewPdf, '_blank', 'width=600,height=800')
    },



    //* This function will get the company name!



    //* This function will check the jobs on the backend and if they are present then it will change the operation accordingly!
    checkInJobs: function () {

      this.Flag = false;
      // var sUserRole = this.getView().getModel('appView').getProperty('/UserRole');
      var jobCardNos = this.getView().getModel("appView").getProperty("/jobCardNoInString");
      var aExcelFiles = this.getView().getModel("appView").getProperty("/allExcelData");
      var oNewData = this.getView().getModel("appView").getProperty("/newlySelectedData");
      // aExcelFiles = aExcelFiles.concat(oNewData);
      var sPath = `/Jobs`
      var oModel = this.getView().getModel();
      var oJobsData = aExcelFiles;
      var oUploadJobs = oNewData;
      var that = this;
      var filters = jobCardNos.map(function (jobCardNo) {
        return '{"jobCardNo": "' + jobCardNo + '"}';
      });

      var filter = encodeURIComponent('{"where": {"or": [' + filters.join(',') + ']}}');
      var url = 'api/Jobs?filter=' + filter
      this.middleWare.callMiddleWare(url, "GET")
        .then(function (data, status, xhr) {
          for (let index = 0; index < data.length; index++) {
            const element = data[index];
            var oIndex = oJobsData.findIndex((ele) => {
              return ele.jobCardNo === element.jobCardNo
            });
            if (oIndex != -1) {
              let jobIndex = oUploadJobs.findIndex((ele) => {
                return ele.jobCardNo === element.jobCardNo
              });
              oJobsData[oIndex] = oUploadJobs[jobIndex];
              oJobsData[oIndex].operation = 'RU';// CompanyId===null
              that.Flag = true;
              oUploadJobs[jobIndex].CompanyId = element.CompanyId;
              oUploadJobs[jobIndex].status = element.status;
              oUploadJobs.splice(jobIndex, 1);
              that.validateJobs();
            }
            else {
              let jobIndex = oUploadJobs.findIndex((ele) => {
                return ele.jobCardNo === element.jobCardNo
              });
              oUploadJobs[jobIndex].operation = 'RU';
              that.Flag = true;
              oUploadJobs[jobIndex].CompanyId = element.CompanyId;
              oUploadJobs[jobIndex].status = element.status ;
              oJobsData.push(oUploadJobs[jobIndex]);//CompanyId!==null
              oUploadJobs.splice(jobIndex, 1);
              that.validateJobs();
            }

          }
          for (let i = 0; i < oJobsData.length; i++) {
            const element = oJobsData[i];
            let listIndex = oUploadJobs.findIndex((ele) => {
              return ele.jobCardNo === element.jobCardNo
            });
            if (listIndex != -1) {
              oJobsData[i] = oUploadJobs[listIndex];
              // oJobsData[oIndex].operation = 'N';// CompanyId===null
              oUploadJobs.splice(listIndex, 1);
            }
          }
          oJobsData = oJobsData.concat(oUploadJobs);
          console.log(oJobsData);
          that.getView().getModel("appView").setProperty("/allExcelData", oJobsData)
          that.getView().getModel('appView').updateBindings();

          // var isPresent = false;


          // * Filtering The Job on the basis of RE-Upload and with or without companyID( NO NEED RIGHT NOW! )!
          // var filterWithJobs = oJobsData.filter((job) => {
          //   return job.operation === "RU" && job.CompanyId
          // });
          // that.getView().getModel("appView").setProperty("/withCompanyId", filterWithJobs);
          // // isPresent = true;

          // var filterWithoutJobs = oJobsData.filter((job) => {
          //   return job.operation === "RU" && !job.CompanyId
          //   // isPresent
          // })
          // that.getView().getModel("appView").setProperty("/withoutCompanyId", filterWithoutJobs);
          // if (that.Flag) {
          // }

        })
        .catch(function (jqXhr, textStatus, errorMessage) {

          that.middleWare.errorHandler(jqXhr, that);
        });

    },



    //* This function is used to select the company inside a comboBox
    // selectCompany: function (oEvent) {
    //
    //   var oModel = this.getView().getModel();  //default model get at here
    //   var that = this;
    //   if (oEvent) {
    //     var oSelectedItem = oEvent.getSource().getSelectedKey();
    //     var change = oEvent.getSource().getParent().getBindingContext("appView").getObject()
    //     if (change.operation === "N") {
    //       change.operation = 'U'
    //     }
    //     if (change.operation === 'R') {
    //       change.operation = 'U'
    //     }
    //     that.getView().getModel('appView').updateBindings();
    //     that.getView().getModel("appView").setProperty("/companyId", oSelectedItem);
    //     console.log("Selected User ID:", oSelectedItem);
    //   }
    //   // this.middleWare.callMiddleWare("customerNames", "get")
    //   //   .then(function (data, status, xhr) {
    //   //
    //   //     that.getView().getModel("appView").setProperty("/customerUser", data);
    //   //   })
    //   //   .catch(function (jqXhr, textStatus, errorMessage) {
    //   //
    //   //     that.middleWare.errorHandler(jqXhr, that);
    //   //   });
    // },
    selectCompany: function (oEvent) {

      var oModel = this.getView().getModel();  //default model get at here
      var that = this;
      var aExcelsWithMissingCompanies = [];
      if (oEvent) {
        var change = oEvent.getSource().getParent().getBindingContext("appView").getObject();
        var oSelectedItem = oEvent.getSource().getSelectedKey();
        if (oSelectedItem === "") {
          var companyName = oEvent.getSource().getValue();
                   // var lowerCaseValue = value.toLowerCase();
                   let lowercaseString =companyName.charAt(0).toUpperCase() + companyName.slice(1).toLowerCase();;
                   if (lowercaseString != "") {
                     var payLoad = {
                       "CompanyName": lowercaseString,
                     }
            MessageBox.information("This Company does not exist, do you want to create it ? {" + lowercaseString   + "}", {
              actions: [MessageBox.Action.OK, MessageBox.Action.CLOSE],
              onClose: function (sAction) {
                if (sAction === "OK") {
                  oModel.create('/Company', payLoad, {
                    success: function (data) {

                      if (change.operation === "N") {
                        change.operation = 'U'
                      }
                      if (change.operation === 'R') {
                        change.operation = 'U'
                      }
                      change.CompanyId = data.id;
                      that.getView().getModel("appView").setProperty("/companyId", data.id);
                      console.log("Selected User ID:", data.id);
                      that.getView().getModel('appView').updateBindings();

                    },
                    error: function (error) {
                      // Error callback
                      that.middleWare.errorHandler(error, that);
                      // MessageToast.show("Error reading data");
                    }
                  });
                }
              }
            });
          }
        } else {
          // var change = oEvent.getSource().getParent().getBindingContext("appView").getObject()
          if (change.operation === "N") {
            change.operation = 'U'
          }
          if (change.operation === 'R') {
            change.operation = 'U'
          }
          that.getView().getModel('appView').updateBindings();
          that.getView().getModel("appView").setProperty("/companyId", oSelectedItem);
          console.log("Selected User ID:", oSelectedItem);
        }
      }
      // this.middleWare.callMiddleWare("customerNames", "get")
      //   .then(function (data, status, xhr) {
      //
      //     that.getView().getModel("appView").setProperty("/customerUser", data);
      //   })
      //   .catch(function (jqXhr, textStatus, errorMessage) {
      //
      //     that.middleWare.errorHandler(jqXhr, that);
      //   });
    },


    arrayToJSON: function (array) {
      let json = {};

      for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
          let key = String.fromCharCode(j % 26 + 65) + (j > 26 ? j % 26 + 65 : '') + (i + 1);
          json[key] = array[i][j];
        }
      }

      return json;
    },




    // * This fucntion is saving the jobs data into the backend for both new and updated jobs!
    onSavePayload: function () {

      var that = this;
      var oModel = this.getView().getModel();
      var aAllExcelFiles = this.getView().getModel('appView').getProperty("/allExcelData");
      that.getView().getModel("appView").setProperty("/aAllExcelFilesCount", aAllExcelFiles.length);
      var aNewFetchedExcel = [];
      var aExcelToBeUploaded = [];
      var date = new Date()
      var formattedDate = date.toLocaleDateString("en-US");
      for (let i = 0; i < aAllExcelFiles.length; i++) {
        const element = aAllExcelFiles[i];
        element.CreatedOn = formattedDate;
        if (element.operation === "N") {
          // element.jobCardNo.toString();
          aNewFetchedExcel.push(element)
        }
        if (element.operation === "RU" || element.operation === "U") {
          aExcelToBeUploaded.push(element)
        }
      }
      for (let i = 0; i < aNewFetchedExcel.length; i++) {

        const element = aNewFetchedExcel[i];

        element.ArtworkAttach = element.artworkCode.split("_")[0]

        element.PoAttach = element.clientPONo.split("_")[0]

      }
      //*This call is used to Upload the data that was not already present on the backend!
      if (aNewFetchedExcel.length > 0) {
        this.middleWare.callMiddleWare("api/Jobs", "post", aNewFetchedExcel)
          .then(function (data, status, xhr) {

            MessageToast.show("Successfully Uploaded")
            that.getJobsData();
            // that.getView().getModel("appView").setProperty("/customerUser", data);
          })
          .catch(function (jqXhr, textStatus, errorMessage) {

            that.middleWare.errorHandler(jqXhr, that);
          });
        // that.getJobsData();
      }

      //*This call is used to RE-upload the data that is already present on the backend!

      if (aExcelToBeUploaded.length > 0) {
        for (let i = 0; i < aExcelToBeUploaded.length; i++) {

          const element = aExcelToBeUploaded[i];
          // element.UpdatedOn = formattedDate;
          element.ArtworkAttach = element.artworkCode.split("_")[0]
          if(typeof(element.clientPONo) ==='number'){
            element.clientPONo =  element.clientPONo.toString();
          }
          element.PoAttach = element.clientPONo.split("_")[0]

          this.middleWare.callMiddleWare("api/Jobs", "PUT", element)
            .then(function (data, status, xhr) {

              MessageToast.show("Successfully Uploaded")
              // that.getView().getModel("appView").setProperty("/customerUser", data);
            })
            .catch(function (jqXhr, textStatus, errorMessage) {

              that.middleWare.errorHandler(jqXhr, that);
            });
        }
        // that.getJobsData();
      }

      if (!aExcelToBeUploaded.length && !aNewFetchedExcel.length) {
        MessageToast.show("Those Jobs Are Already Saved")
      }
      else{
        this.getJobsData();

      }

    },
    // onUpdateJob: function () {
    //
    //   BusyIndicator.show(0);
    //   var that = this;
    //   var userValue = this.getModel("appView").getProperty("/customerId");
    //   var oJsonInpValue = this.getView().getModel('appView').getProperty("/jsonValue");
    //   var getUploadFile = this.getView().getModel('appView').getProperty("/uploadFile");
    //   var oModel = this.getView().getModel();
    //   if (!userValue || !oJsonInpValue) {
    //     if (!userValue) {
    //       MessageToast.show("Please Select The User")
    //     }
    //     else {
    //       MessageToast.show("Please Upload The File")
    //     }
    //   }
    //   else {
    //     var payload = JSON.parse(oJsonInpValue);
    //     payload.CustomerId = userValue;
    //     payload.fileName = getUploadFile;
    //     var id = payload.jobCardNo;
    //     oModel.update(`/Jobs('${id}')`, payload, {
    //       success: function (oUpdatedData) {

    //         MessageToast.show("Job Updated successfully");
    //       },
    //       error: function (nts) {
    //         // Error callback
    //         // if(nts.responseText.includes("duplicate key")){
    //         MessageToast.show("Something Went Wrong")
    //         // }
    //         // that.middleWare.errorHandler(error, that);
    //         // MessageToast.show("Error While Post the data");
    //       }
    //     });
    //   }
    //   BusyIndicator.hide();
    // },
    onPressClear: function (oEvent) {
      var that = this;

      var oldData = this.getView().getModel('appView').getProperty("/storeDBJobs");
      this.getView().getModel('appView').setProperty("/allExcelData", oldData);
      this.getView().byId("fileUploader").setValue("")
      // this.getView().getModel('appView').setProperty("/jsonValue", "");
      // this.getView().getModel('appView').setProperty("/customerId", "");
      // this.getView().getModel('appView').setProperty("/allExcelData", "");
      // this.getView().getModel('appView').setProperty("/Jobs", "");
      // this.getView().getModel('appView').setProperty("/onUpdateJobVis", false);
      // this.getView().getModel('appView').setProperty("/onSavePayloadVis", true);
      // this.getView().getModel('appView').setProperty("/messageStripVis", false);
      // oModel.setProperty("/messageStripVis",false)

      // this.getView().byId("idPopinLayout").setSelectedKey("")

      //! I want to edit these to get things work..!
      // var dbJobs = this.getView().getModel("appView").getProperty("/storeDBJobs");
      // this.getView().getModel("appView").setProperty("/allExcelData", dbJobs);
      // this.getView().getModel('appView').updateBindings();
    },
    // onUploadExcelsUpdateFinished: function () {
    //   this.getView().getModel('appView').setProperty("/onSavePayloadVis", true);
    // },


    //* This function will remove the job when click on 'X' button on the fragment, which already have companyID!
    removeJobwithCompId: function (oEvent) {

      var selectedJob = oEvent.getSource().getBindingContext("appView").getObject();
      var allDataWithId = this.getView().getModel('appView').getProperty("/withCompanyId");
      var validatedExcels = this.getView().getModel('appView').getProperty("/allExcelData");
      // var indexToRemove = allDataWithId.findIndex(function (item) {
      //   return item.jobCardNo === selectedJob.jobCardNo;
      // });
      var indexToRemoveFromAllData = validatedExcels.findIndex(function (item) {
        return item.jobCardNo === selectedJob.jobCardNo;
      });
      if (indexToRemoveFromAllData != -1) {
        validatedExcels.splice(indexToRemoveFromAllData, 1);
      }
      // if (indexToRemove != -1) {
      //   allDataWithId.splice(indexToRemove, 1);
      // }
      this.getView().getModel('appView').updateBindings();

    },


    //* This function will remove the job when click on 'X' button on the fragment, which doNot have companyID!
    removeJobwithoutCompId: function (oEvent) {

      var selectedJob = oEvent.getSource().getBindingContext("appView").getObject();
      var oldData = this.getView().getModel('appView').getProperty("/storeDBJobs");
      var validatedExcels = this.getView().getModel('appView').getProperty("/allExcelData");

      var indexToRemoveFromAllData = validatedExcels.findIndex(function (item) {
        return item.jobCardNo === selectedJob.jobCardNo;
      });


      var aIndexDBData = oldData.findIndex(function (item) {
        return item.jobCardNo === selectedJob.jobCardNo;
      });

      if (indexToRemoveFromAllData != -1) {
        validatedExcels.splice(indexToRemoveFromAllData, 1);
        validatedExcels.push(oldData[aIndexDBData])
      }
      this.getView().getModel('appView').updateBindings();

    },



    //* This function will open the dialog and shows all the details of the particular job!
    oUploadDialogFragment: function () {
      var oView = this.getView();
      var that = this;
      if (!this.jobdialog) {
        this.jobdialog = Fragment.load({
          id: oView.getId(),
          name: "ent.ui.ecommerce.fragments.printingDetailFragment.AllJobs",
          controller: this
        }).then(function (oDialog) {
          // Add dialog to view hierarchy
          oView.addDependent(oDialog);
          return oDialog;
        }.bind(this));
      }
      return this.jobdialog;
    },
    onGetDialog: function (oEvent) {

      var excelData = oEvent.getSource().getBindingContext("appView").getObject();
      this.getView().getModel("appView").setProperty("/excelDataUplode", excelData);
      var that = this;
      that.oUploadDialogFragment().then(function (oDialog) {
        oDialog.open();
        //  var trvbyu= that.getView().getModel("appView").getProperty("/excelDataUplode");

        var oSimpleForm = that.getView().byId("allJobDetails")
        oSimpleForm.bindElement('appView>/excelDataUplode');
      });
    },
    onnReject: function () {
      this.oUploadDialogFragment().then(function (oDialog) {
        oDialog.close();
      })
    },


    //* This function will open the dialog to check if the job is already present or not and which job u want to keep or not
    ojobValidation: function () {
      var oView = this.getView();
      var that = this;
      if (!this.jobsvalidatioin) {
        this.jobsvalidatioin = Fragment.load({
          id: oView.getId(),
          name: "ent.ui.ecommerce.fragments.JobsValidation",
          controller: this
        }).then(function (oDialog) {
          // Add dialog to view hierarchy
          oView.addDependent(oDialog);
          return oDialog;
        }.bind(this));
      }
      return this.jobsvalidatioin;
    },
    validateJobs: function (oEvent) {
      // var excelData = oEvent.getSource().getBindingContext("appView").getObject();
      // this.getView().getModel("appView").setProperty("/excelDataUplode", excelData);
      var that = this;
      that.ojobValidation().then(function (oDialog) {
        oDialog.open();
        //  var trvbyu= that.getView().getModel("appView").getProperty("/excelDataUplode");

        // var oSimpleForm = that.getView().byId("allJobDetails")
        // oSimpleForm.bindElement('appView>/excelDataUplode');
      });
    },
    onCloseValDialog: function () {

      var that = this;
      this.ojobValidation().then(function (oDialog) {

        that.getView().getModel("appView").setProperty("/withCompanyId", "");
        that.getView().getModel("appView").setProperty("/withoutCompanyId", "");
        oDialog.close();
      })
    },

    openLegend: function (oEvent) {
      var oSource = oEvent.getSource(),
        oView = this.getView();
      if (!this._pLegendPopover) {
        this._pLegendPopover = Fragment.load({
          id: oView.getId(),
          name: "ent.ui.ecommerce.fragments.JobsLegend",
          controller: this
        }).then(function (oLegendPopover) {
          oView.addDependent(oLegendPopover);
          return oLegendPopover;
        });
      }
      this._pLegendPopover.then(function (oLegendPopover) {
        if (oLegendPopover.isOpen()) {
          oLegendPopover.close();
        } else {
          oLegendPopover.openBy(oSource);
        }
      });

    },



    //* This function is not in use right now
    // onUploadId: function () {
    //   var oModel = this.getView().getModel();  //default model get at here
    //   var that = this;
    //   var ids = this.getView().getModel("appView").getProperty("/postId")
    //   const sEntityPath = `/JobStatus`;
    //   // Perform the read operation
    //   const oUpdatedData = {

    //     JobId: "Pending",
    //     JobStatusId: "",
    //     rawMaterial: "Pending",
    //     Printing: "Pending",
    //     Foiling: "Pending",
    //     Coating: "Pending",
    //     InvNo: "Pending",
    //     DeliveryNo: "Pending",
    //     Embossing: "Pending",
    //     Pasting: "Pending",
    //     spotUV: "Pending",
    //     Punching: "Pending",
    //     Packing: "Pending",
    //     incAttachment: "Pending",
    //     deliveryAttachment: "Pending"

    //   };
    //   oModel.create(sEntityPath, oUpdatedData, {
    //     success: function (oUpdatedData) {

    //       MessageToast.show("Successfully Uploaded");
    //     },
    //     error: function (error) {
    //       // Error callback
    //       // that.middleWare.errorHandler(error, that);
    //       MessageToast.show("Error reading data");
    //     }
    //   });

    // },

    extracDbFields: function (data) {
      
      var that = this;
      const arrayToJSON = this.arrayToJSON(data);

      const dbFieldsJSON = Object.values(this.fieldsJSON);

      const dbFields = {};
      dbFieldsJSON.forEach(item => {
        // var date = new Date()
        // var formattedDate = date.toLocaleDateString("en-US");
        // dbFields.CreatedOn = formattedDate;
        dbFields.operation = "N"
        dbFields.CompanyId = null
        dbFields.Urgent = ""
        dbFields[item.dbField] = arrayToJSON[item.data];
        if (!dbFields[item.dbField]) {


        }
      })


      this.getView().byId("_IDGenTextArea1").setValue(JSON.stringify(dbFields, null, 4));
      //for simple form data binding

      var preData = this.getView().getModel("appView").getProperty("/allExcelData");
      var avalData = that.getView().getModel("appView").getProperty("/newlySelectedData");
      avalData = avalData ? avalData : [];
      const excelDate = dbFields.date;
      var excelToActualDate = this.excelDateToJSDate(excelDate);
      var uploadDateYear = excelToActualDate.getFullYear();
      // dbFields.date = this.formatDateToDDMMYYYY(excelToActualDate);
      // const dateString =  dbFields.date;
      // const dateParts = dateString.split("/");
      // const uploadDateYear = parseInt(dateParts[2], 10);
      // var uploadDateYear = dbFields.date.getFullYear();
      dbFields.date = excelToActualDate;
      dbFields.jobCardNo = dbFields.jobCardNo.toString()
      dbFields.jobCardNo = dbFields.jobCardNo+"_"+uploadDateYear;
      avalData.push(dbFields)
      that.getView().getModel("appView").setProperty("/newlySelectedData", avalData)
      return dbFields;

      // this.getView().bindElement('appView>/jsonData');
      // this.getView().getModel('appView').updateBindings();



    },
    formatDateToDDMMYYYY: function(inputDate) {
      const date = new Date(inputDate);

      const day = date.getDate();
      const month = date.getMonth() + 1; // January is 0 in JavaScript
      const year = date.getFullYear();

      // Ensure that day and month are formatted as two digits
      const formattedDay = (day < 10) ? `0${day}` : day;
      const formattedMonth = (month < 10) ? `0${month}` : month;

      return `${formattedDay}/${formattedMonth}/${year}`;
    },
    excelDateToJSDate: function(excelDate) {
      debugger
    // Excel date epoch is January 0, 1900 (yes, 0 is January)
    const excelEpoch = new Date(1900, 0, 0);

    // Excel stores dates as the number of days since the epoch
    const daysSinceExcelEpoch = excelDate - 1;

    // Calculate the date by adding the number of days to the Excel epoch
    const jsDate = new Date(excelEpoch.getTime() + daysSinceExcelEpoch * 24 * 60 * 60 * 1000);

      return jsDate;
    },

    //*May be I will use it in future!
    // var sPath = `/Jobs`
    // var oModel = this.getView().getModel();
    // var that = this;
    // // var oFilter = new Filter ("jobCardNo", "EQ", dbFields.jobCardNo)
    // this.ifTrue = false;
    // preData.forEach(item=>{
    //   if(item.jobCardNo === (dbFields.jobCardNo).toString() ){
    //     // if(item.operation==="N"){
    //     //   this.ifTrue = false;
    //     // }
    //     // else{

    //       item.operation = "U";
    //       this.ifTrue = true;
    //     // }
    //   }
    // });
    // if(!this.ifTrue){
    //   preData.push(dbFields)
    // }
    // return dbFields;







    //

    // // var oFilter = new Filter (preData[0].jobCardNo ,'In', "jobCardNo")
    // oModel.read(sPath, {
    //   urlParameters: {
    //   	"$select": "jobCardNo,CompanyId"
    //   },
    //   filters:[oFilter],
    //   success: function (data) {
    //     preData.forEach(item => {
    //       item.operation = "U";
    //     });
    //     // preData[0].operation = "U"
    //     dbFields.operation = "U";
    //     that.getView().getModel('appView').updateBindings();



    //     // that.getView().getModel("appView").setProperty("/allExcelData", data.results);
    //   },
    //   error: function (error) {
    //     // Error callback
    //     //   that.middleWare.errorHandler(error, that);
    //     MessageToast.show("Error reading data");
    //     // Error callback
    //     //   that.middleWare.errorHandler(error, that);
    //     MessageToast.show("Error reading data");
    //   }
    // });
    // getJobsData: function () {
    //   var sUserRole = this.getView().getModel('appView').getProperty('/UserRole');


    // },

    // this.middleWare.callMiddleWare("uploadjob", "POST", dbFields)
    //   .then(function (data, status, xhr) {
    //     //   data.results.forEach(item => {
    //     //     item.operation = "U";
    //     // });
    //     // data.value.operation = "U";


    //   jobs>>>> R
    // onUplaud>>>>5 excel>>>jobCardno.>>>>>get odata $select=jobCardNo with fiter IN alll JobCaedNumber>>2 jobCard output>>U
    // companny change=>>>> status N>>>N else U

    // onSave
    // filter U Update  Call
    // N: Create

    //     /*

    //     for (let i = 0; i < preData.length; i++) {
    //       const element = preData[i];

    //       if (element.jobCardNo === data.value.jobCardNo) {
    //         element.operation = 'U'
    //       }
    //     }



    //     // data.fileContent.operation= 'U'

    //     that.getView().getModel("appView").setProperty("/messageStripVis", true)
    //     that.getView().getModel("appView").setProperty("/onUpdateJobVis", true)
    //     that.getView().getModel("appView").setProperty("/onSavePayloadVis", false)
    //   })
    //   .catch(function (jqXhr, textStatus, errorMessage) {
    //
    //     that.getView().getModel("appView").setProperty("/onUpdateJobVis", false)
    //     that.getView().getModel("appView").setProperty("/onSavePayloadVis", true)
    //     that.getView().getModel("appView").setProperty("/messageStripVis", false)

    //     that.getView().getModel('appView').updateBindings();
    //   });

    //* This Fragment is for validation
    // oDialogValidation: function () {

    //   var oView = this.getView();

    //   var that = this;

    //   if (!this.jobvalidationDialog) {

    //     this.jobvalidationDialog = Fragment.load({

    //       id: oView.getId(),

    //       name: "ent.ui.ecommerce.fragments.JobsValidation",

    //       controller: this

    //     }).then(function (oDialog) {

    //       // Add dialog to view hierarchy

    //       oView.addDependent(oDialog);

    //       return oDialog;

    //     }.bind(this));

    //   }

    //   return this.jobvalidationDialog;

    // },

    // onGetValidationDialog: function (oEvent) {

    //   // var excelData = oEvent.getSource().getBindingContext("appView").getObject();

    //   // this.getView().getModel("appView").setProperty("/excelDataUplode", excelData);

    //   var that = this;

    //   that.oDialogValidation().then(function (oDialog) {

    //     oDialog.open();

    //     //  var trvbyu= that.getView().getModel("appView").getProperty("/excelDataUplode");

    //

    //   });

    // },

    // onnReject: function () {

    //   this.oDialogValidation().then(function (oDialog) {

    //     oDialog.close();

    //   })

    // },


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

        "group": "Size in mm",

        "groupCell": "D13"

      },

      "E14": {

        "data": "E15",

        "value": "10mm",

        "label": "W",

        "dbField": "sizeW",

        "group": "Size in mm",

        "groupCell": "D13"

      },

      "F14": {

        "data": "F15",

        "value": "147mm",

        "label": "H",

        "dbField": "sizeH",

        "group": "Size in mm",

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

      "A21-0": {
        "data": "I20",

        "value": "222",

        "label": "Paper PO NO.",

        "dbField": "paperPoNo",

        "group": "Paper & LAYOUT Details",

        "groupCell": "A20"
      },
      "A21-1": {

        "data": "A22",

        "value": "4 ups",

        "label": "No of ups",

        "dbField": "noOfUps1",

        "group": "Paper & LAYOUT Details",

        "groupCell": "A20"

      },

      "A21-2": {

        "data": "C22",

        "value": "2 ups",

        "label": "No of ups",

        "dbField": "noOfUps2",

        "group": "Paper & LAYOUT Details",

        "groupCell": "A20"

      },

      "A21-3": {

        "data": "A23",

        "value": "8 ups",

        "label": "No of ups",

        "dbField": "noOfUps3",

        "group": "Paper & LAYOUT Details",

        "groupCell": "A20"

      },

      "D21-1": {

        "data": "D22",

        "value": "5,200 Sheets",

        "label": "No. Of Sheets",

        "dbField": "noOfSheets1",

        "group": "Paper & LAYOUT Details",

        "groupCell": "A20"

      },

      "D21-2": {

        "data": "E23",

        "value": "200 Sheets",

        "label": "No. Of Sheets",

        "dbField": "noOfSheets2",

        "group": "Paper & LAYOUT Details",

        "groupCell": "A20"

      },

      "D21-3": {

        "data": "I21",

        "value": "2,600 Sheets",

        "label": "No. Of Sheets",

        "dbField": "noOfSheets3",

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

        "dbField": "printingMachine",

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

        "dbField": "none",

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

      "A26": {

        "data": "B26",

        "value": "",

        "label": "Batch No :",

        "dbField": "batchNo",

        "group": "Batch Details",

        "groupCell": "A25"

      },

      "A27": {

        "data": "B27",

        "value": "None",

        "label": "Mfg Date :",

        "dbField": "mfgDate",

        "group": "Batch Details",

        "groupCell": "A25"

      },

      "A28": {

        "data": "B28",

        "value": "None",

        "label": "Exp Date :",

        "dbField": "expDate",

        "group": "Batch Details",

        "groupCell": "A25"

      },

      "D26": {

        "data": "E26",

        "value": "",

        "label": "Code No :",

        "dbField": "codeNo",

        "group": "Batch Details",

        "groupCell": "A25"

      },

      "G26": {

        "data": "G26",

        "value": "None",

        "label": "Corrections 1",

        "dbField": "corrections1",

        "group": "Corrections in Artwork (If any)",

        "groupCell": "G25"

      },

      "G27": {

        "data": "G27",

        "value": "None",

        "label": "Corrections 2",

        "dbField": "corrections2",

        "group": "Corrections in Artwork (If any)",

        "groupCell": "G25"

      },

      "G28": {

        "data": "G28",

        "value": "None",

        "label": "Corrections 3",

        "dbField": "corrections3",

        "group": "Corrections in Artwork (If any)",

        "groupCell": "G25"

      },

      "A30": {

        "data": "D30",

        "value": "Silver Special",

        "label": "Remarks (If Any) :",

        "dbField": "remarks",

        "group": "",

        "groupCell": ""

      },

      "A30-1": {

        "data": "D31",

        "value": "Silver Special",

        "label": "Remarks (If Any) :",

        "dbField": "remarks1",

        "group": "",

        "groupCell": ""

      },

      "A30-2": {

        "data": "D32",

        "value": "Silver Special",

        "label": "Remarks (If Any) :",

        "dbField": "remarks2",

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

      "P8-1": {

        "data": "R8",

        "value": "B-3-C",

        "label": "Plate :",

        "dbField": "plate1",

        "group": "Ancillary Parts",

        "groupCell": "P7"

      },

      "P8-2": {

        "data": "S8",

        "value": "098_CTP_23.05_TRAY_Geltron Jumbo 3X Gelpen 1Pc",

        "label": "Plate :",

        "dbField": "plate2",

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

      "P13-1": {

        "data": "R13",

        "value": "62 Level 1",

        "label": "Punch :",

        "dbField": "punch1",

        "group": "Ancillary Parts",

        "groupCell": "P7"

      },

      "P13-2": {

        "data": "S13",

        "value": "PAPERGLIDE 1PC TRAY",

        "label": "Punch :",

        "dbField": "punch2",

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

      "P21-1": {

        "data": "R21",

        "value": "₹ 59.00",

        "label": "Paper Cost :",

        "dbField": "paperCost2",

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

        "dbField": "varnishandLaminationCS",

        "group": "A) Cost Structure :",

        "groupCell": "P20"

      },

      "P24": {

        "data": "Q24",

        "value": "₹ 0.00",

        "label": "Foil Blocks :",

        "dbField": "foilBlocksCS",

        "group": "A) Cost Structure :",

        "groupCell": "P20"

      },

      "P24-1": {

        "data": "R24",

        "value": "₹ 0.00",

        "label": "Foil Blocks :",

        "dbField": "foilBlocksPerPs",

        "group": "A) Cost Structure :",

        "groupCell": "P20"

      },

      "P25": {

        "data": "Q25",

        "value": "₹ 0.00",

        "label": "Positive :",

        "dbField": "positiveCS",

        "group": "A) Cost Structure :",

        "groupCell": "P20"

      },

      "P25-1": {

        "data": "R25",

        "value": "₹ 0.00",

        "label": "Positive :",

        "dbField": "positivePerPs",

        "group": "A) Cost Structure :",

        "groupCell": "P20"

      },

      "P26": {

        "data": "Q26",

        "value": "₹ 0.00",

        "label": "Embossing :",

        "dbField": "embossingCS",

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

      "P30-1": {

        "data": "R30",

        "value": "₹ 2,691.12",

        "label": "Packing :",

        "dbField": "packingPerKg",

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

      "P31-1": {

        "data": "R31",

        "value": "₹ 0.00",

        "label": "Transportation :",

        "dbField": "transportationPerKg",

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

        "dbField": "miscellaneous1",

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
