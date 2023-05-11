sap.ui.define([
    "oft/fiori/controller/BaseController",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/m/Image"
], function (Controller, MessageToast, Fragment, Image) {
    "use strict";

    return Controller.extend("oft.fiori.controller.leadDetails", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRouteMatched(this._onRouteMatched, this);
            this.emailCount = 0;

        },

        _onRouteMatched: function (oEvent) {
            debugger;
            var sRouteName = oEvent.getParameter("name");
            if(sRouteName==="leadDetails"){
                this.getView().getModel('local').setProperty("/onResendOTP", false);
                this.getView().getModel('local').setProperty("/sendOtp", true);
                this.getView().getModel('local').setProperty("/otpVisible", false);
                this.getView().getModel('local').setProperty("/PageVisibility", false);
                this.getView().getModel('local').setProperty("/verifySubmit", false);
                this.onOpenDialog();
            }
            


        },

        onOpenDialog: function () {

            var oView = this.getView();
            var that = this;
            // Load the fragment file
            // this.oDialog = "undefined";
            debugger;
            if (!this.oDialog) {
                this.oDialog = Fragment.load({
                    id: oView.getId(),
                    name: "oft.fiori.fragments.leadDetails",
                    controller: this
                }).then(function (oDialog) {    
                    // Add dialog to view hierarchy
                    oView.addDependent(oDialog);
                    that.onCaptchaGenerate();
                    // Open dialog
                    return oDialog;
                }.bind(this));
               
            }
            this.oDialog.then(function (oDialog) {
                that.getView().getModel('local').setProperty("/numberVisible", false);
                that.getView().getModel('local').setProperty("/messageStripVisible", false);
                // that.getView().getModel('local').setProperty("/emailVisible", true);
                that.getView().getModel('local').setProperty("/onResendOTP", false);
                that.getView().getModel('local').setProperty("/otpVisible", false);
                that.getView().getModel('local').setProperty("/PageVisibility", false);
                that.getView().getModel('local').setProperty("/verifySubmit", false);
                oDialog.open();
                // var sCaptcha = that.captchaGeneratorMethod();
                // that.getView().getModel('local').setProperty("/generatedCaptcha", sCaptcha);
                
            });
        },
        onCaptchaGenerate: function () {
            var that = this;
            var captchaCode = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (var i = 0; i < 6; i++) {
                captchaCode += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            // Create a canvas element and draw the captcha code on it
            var canvas = document.createElement("canvas");
            canvas.width = 100;
            canvas.height = 30;
            var ctx = canvas.getContext("2d");
            // Draw the captcha code on the canvas
            ctx.fillText(captchaCode, 20, 20);
            debugger;
            // var captchaImage = this.getView().byId("captchaImage");
            // captchaImage.setSrc(canvas.toDataURL());
            // Set the data URL of the canvas as the source of the captcha image
            var captchaImage = new Image({
                src: canvas.toDataURL(),
                width: "150%",
                height: "150%",
            });
            var captchaDialog = that.getView().byId("idLead");
            captchaDialog.addItem(captchaImage);
            // Store the captcha code in a property of the controller for later verification
            this._captchaCode = captchaCode;
        },


// ==================================== mobile number validation  =========================

        numberValidation: function (sMobileNumber) {
            var value = sMobileNumber;
            if (value.length !== 10 || isNaN(value)) {
                MessageToast.show("Invalid Mobile Number")
                return false;
            } else {
                return true;
            }
        },

        // onEmailLiveChange : function (oEvent){
        //     var oInput = this.getView().byId("emailInput"); // Get the input control with ID "emailInput"
        //     oInput.attachChange(this.onRefresh, this); // Attach event handler function to the "change" event
            
        // },

 // ================== Function validate the input field for the email and as well as send OTP  ===================== 

        validateCaptcha: function () {
            debugger;
            var sEmail = this.getView().getModel('local').getProperty("/Email");
            this.sEmail = this.getView().getModel('local').getProperty("/Email");
            var InpCaptchaCode = this.getView().getModel('local').getProperty("/captcha");
            var oRegex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

            if (!sEmail) {
                MessageToast.show("Please enter a valid email address.");
                return;
            }
            else{
                this.getView().getModel('local').setProperty('/email', false);
            }

            if (sEmail && !sEmail.match(oRegex)) {
                MessageToast.show("Please enter a valid email address.");
                return;
            };

            if (!InpCaptchaCode || InpCaptchaCode !== this._captchaCode) {
                debugger;
                MessageToast.show("Please enter a valid captcha code.");
                return;
            };

            var that = this;
            var oModel = this.getView().getModel('local');

            // debugger;
            // Send AJAX request to backend
            var that = this;
            var oModel = this.getView().getModel('local');
            $.ajax({
                type: 'POST',
                url: 'sendOtpViaEmail',
                data: {
                    eMail: sEmail
                },
                success: function (data) {
                    // debugger;
                    if(data=="email sent"){
                        oModel.setProperty('/sendOtpDisabled', false);

                    }
                    oModel.setProperty('/otpVisible', true);
                    oModel.setProperty('/sendOtp', false);
                    // oModel.setProperty('/captcha',"");
                    MessageToast.show('OTP Successfully Sent To Your Mail.');
                },
                error: function (xhr, status, error) {
                    console.error(error);
                    MessageToast.show('Error sending OTP via email');
                }
            });
            this.OtpSend();

        },
        onNumberCaptchaCheck:function(){
            var InpCaptchaCode = this.getView().getModel('local').getProperty("/captcha");

            if (!InpCaptchaCode || InpCaptchaCode !== this._captchaCode) {
                MessageToast.show("Please enter a valid captcha code.");
                return false;
            }
            else{
                return true;
            }
        },

        resendOTP:function(){
            debugger;
            this.getView().getModel('local').setProperty('/sendOtp', false);
            var sEmail = this.getView().getModel('local').getProperty("/Email");
            this.sEmail = this.getView().getModel('local').getProperty("/Email");
            var InpCaptchaCode = this.getView().getModel('local').getProperty("/captcha");
            var oRegex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;

            if (!sEmail) {
                MessageToast.show("Please enter a valid email address.");
                return;
            }
            else{
                this.getView().getModel('local').setProperty('/email', false);
            }

            if (sEmail && !sEmail.match(oRegex)) {
                MessageToast.show("Please enter a valid email address.");
                return;
            };

            if (!InpCaptchaCode || InpCaptchaCode !== this._captchaCode) {
                debugger;
                MessageToast.show("Please enter a valid captcha code.");
                return;
            };

            var that = this;
            var oModel = this.getView().getModel('local');

            // debugger;
            // Send AJAX request to backend
            var that = this;
            var oModel = this.getView().getModel('local');
            $.ajax({
                type: 'POST',
                url: 'sendOtpViaEmail',
                data: {
                    eMail: sEmail
                },
                success: function (data) {
                    // debugger;
                    if(data=="email sent"){
                        oModel.setProperty('/sendOtpDisabled', false);

                    }
                    oModel.setProperty('/otpVisible', true);
                    oModel.setProperty('/sendOtp', false);
                    oModel.setProperty('/captcha',"");
                    MessageToast.show('OTP Successfully Sent To Your Mail.');
                },
                error: function (xhr, status, error) {
                    console.error(error);
                    MessageToast.show('Error sending OTP via email');
                }
            });
            this.OtpReSend();
        },

 // =========================== Function validate the input field for the Mobile Number As Well as send =========================

        onNumberOTPPress: function () {
            debugger;
            var that = this;
            var sMobileNumber = this.getView().getModel('local').getProperty("/mobileNumber");
            
            var otpCheck = this.onNumberCaptchaCheck();
            if (sMobileNumber) {
                this.MobileNumber = this.getView().getModel('local').getProperty("/mobileNumber");
                var sValidated = this.numberValidation(sMobileNumber);
                if (sValidated && otpCheck) {
                    this.getView().getModel('local').setProperty('/MobileNumber', false);
                    $.ajax({
                        type: 'POST',
                        url: 'requestMessage',
                        data: {
                            Number: sMobileNumber,
                            msgType: "OTP"
                        },
                        success: function (data) {
                            debugger;
                            that.getView().getModel('local').setProperty('/otpVisible', true);
                            
                            //   that.getView().getModel('local').setProperty('/email', false);
                            MessageToast.show('OTP Successfully Sent');
                            // this.sEmail = sMobileNumber;

                        },
                        error: function (xhr, status, error) {
                            console.error(error);
                            MessageToast.show('Error sending OTP via email');
                        }
                    });
                }
            }else{
                MessageToast.show("Please Enter A Valid Mobile Number");
            }
        },

// ============================== OnSubmit Validaing the otp which comes from the backend ==================

onSubmit: function () {
            var numberVisibility = this.getView().getModel('local').getProperty("/numberVisible");
            if(numberVisibility){
                this.sEmail = this.MobileNumber;
            }
            var that =this;
            this.emailCount += 1;
            var oModel = this.getView().getModel('local');
            var otpvalue = oModel.getProperty("/otpValue");
            debugger
            if (otpvalue !== undefined) {
                var that = this;
                debugger;
                $.ajax({
                    type: 'GET',
                    url: 'validateOtp',
                    data: {
                        email: this.sEmail,
                        OTP: otpvalue
                    },
                    success: function (data) {
                        debugger;
                        if (data === false) {
                            MessageToast.show('Error in Verification');
                            oModel.setProperty('/otpValue', "");
                            that.onRefresh();
                            oModel.setProperty('/captcha', "");
                        } else {
                            // MessageToast.show('Verification Successful');
                            // // this below code is working for close the dialog and navigate to the view
                          

                            // // that.getView().getModel('local').setProperty("/PageVisibility",true);
                            //   that.getRouter().navTo("leadDetail", {}, true);
                                debugger;
                                that.getView().getModel("local").setProperty("/Authorization", data.id);
                                that.getView().getModel().setHeaders({
                                    "Authorization": data.id
                                });
                                that.secureToken = data.id;
                                that.getView().getModel("local").setProperty("/CurrentUser", data.userId);
                                that.getView().getModel().setUseBatch(false);
                                var that2 = that;
            
                                //Check the role and set it after that navigate to App
                                //that.oRouter.navTo("newlead");
            
                                var aFilter = [new sap.ui.model.Filter("TechnicalId",
                                    sap.ui.model.FilterOperator.EQ, data.userId)];
                                var oParameters = {
                                    filters: aFilter
                                };
                                var found = false;
                                var AppUsers = [];
                                that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                                    "/AppUsers", "GET", {}, {}, that)
                                    .then(function (oData) {
                                        var newExcluseUser = [];
                                        if (oData.results.length != 0) {
                                            for (var i = 0; i < oData.results.length; i++) {
                                                AppUsers[oData.results[i].TechnicalId] = oData.results[i];
                                                if (oData.results[i].TechnicalId === data.userId) {
                                                    that2.getView().getModel("local").setProperty("/Role", oData.results[i].Role);
                                                    that2.getView().getModel("local").setProperty("/UserName", oData.results[i].UserName);
                                                    that2.getView().getModel("local").setProperty("/JoiningDate", oData.results[i].JoiningDate);
                                                    that2.getView().getModel("local").setProperty("/LeaveQuota", oData.results[i].LeaveQuota);
                                                    that2.getView().getModel("local").setProperty("/MobileNo", oData.results[i].MobileNo);
                                                    found = true;
                                                } else {
                                                    that2.getView().getModel("local").setProperty("/Authorization", "");
                                                    newExcluseUser.push(oData.results[i]);
                                                }
                                            }
                                            if (found === true) {
                                                that2.getView().getModel("local").setProperty("/AppUsers", AppUsers);
                                                that2.getView().getModel("local").setProperty("/AppUsersCopy", newExcluseUser);
                                                that2.oDialog.then(function(oDialog){
                                                    oDialog.close();
                                                    
                                                })
                                                that2.getRouter().navTo("leadDetail");
                                            } else {
                                                sap.m.MessageBox.error("The user is not authorized, Contact Anubhav");
                                            }
                                        }
                                        // that2.getRouter().navTo("leadDetail", {}, true);
                                    }).catch(function (oError) {
                                        debugger;
                                        MessageToast.show("Error While Login");
                                    });
            
                        }
                        

                    },
                    error: function (xhr, status, error) {
                        console.error(error);
                        debugger;
                        MessageToast.show('Error in Verification');
                    }
                });
            }
            else {
                MessageToast.show("Please Enter Your  OTP",)
            }
            debugger;

            // this.numberVisible();
            // this.getView().getModel('local').setProperty("/MobileNumber",false);
            // this.getView().getModel('local').getProperty("/Email");
        },

// ===================== This function will enalbe the mobile number filed after 2 attempts =====================
        numberVisible: function () {
            debugger;
            if (this.emailCount >= 2) {
                this.getView().getModel('local').setProperty("/numberVisible", true);
                this.getView().getModel('local').setProperty("/messageStripVisible", true);
            } else {
                this.getView().getModel('local').setProperty("/numberVisible", false);
                this.getView().getModel('local').setProperty("/messageStripVisible", false);
            }
        },

// ============ this fucntion will shows the resend info and timer below to the otp input filed ================ 

        OtpSend: function () {
            debugger;
            this.emailCount += 1;
            // this.onValidate();
            this.getView().getModel('local').setProperty("/otpVisible", true);
            var that = this;
            var countDownDate = new Date().getTime() + 10000; // 60 seconds from now
            var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                var timerText = "Resend OTP in " + seconds + "s";

                // Display the timer
                that.getView().getModel('local').setProperty("/timerText", timerText);

                that.getView().getModel('local').setProperty("/verifySubmit", true)
                // If the timer has expired
                if (distance < 0) {
                    clearInterval(x);
                    that.getView().getModel('local').setProperty("/timerText", "Resend");
                    that.getView().getModel('local').setProperty("/onResendOTP", true);
                    that.getView().getModel('local').setProperty("/ResendMsg", "If OTP not Received ");
                }
            }, 1000);

        },
//      this function will run the time for 60 second and than after 60 second the field for email will be disable and for email is enabled
        OtpReSend: function () {
            debugger;
            this.emailCount += 1;
            // this.onValidate();
            this.getView().getModel('local').setProperty("/otpVisible", true);
            var that = this;
            var countDownDate = new Date().getTime() + 10000; // 60 seconds from now
            var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                var timerText = "Resend OTP in " + seconds + "s";

                // Display the timer
                that.getView().getModel('local').setProperty("/timerText", timerText);

                that.getView().getModel('local').setProperty("/verifySubmit", true)
                // If the timer has expired
                if (distance < 0) {
                    clearInterval(x);
                    that.getView().getModel('local').setProperty("/timerText", "Resend");
                    that.getView().getModel('local').setProperty("/onResendOTP", true);
                    that.getView().getModel('local').setProperty("/ResendMsg", "If OTP not Received ");

                    that.getView().getModel('local').setProperty('/emailVisible', false);
                    that.getView().getModel('local').setProperty('/captcha', "");
                    that.getView().getModel('local').setProperty('/numberVisible', true);
                    that.getView().getModel('local').setProperty('/messageStripVisible', true);
                    that.getView().getModel('local').setProperty('/otpVisible', false);
                    that.getView().getModel('local').setProperty('/Email',"");
                }
            }, 1000);

        },

// =============== this funciton will refresh the generated capthcha =============================

        // refresh the captcha code
        onRefresh: function (oEvent) {
            var captchaDialog = this.getView().byId("idLead");
            captchaDialog.removeAllItems();
            debugger;
            this.onCaptchaGenerate();
        },
        
    });
    
});
// // generating  the captcha images 
// captchaGeneratorMethod: function () {
//     var captchaCode = '';
//     var length = 3; // Change the length of the captcha code as needed

//     for (var i = 0; i < length; i++) {
//         var rand = Math.random();
//         // Add a random lowercase or uppercase letter
//         captchaCode += String.fromCharCode(rand < 0.5 ? 97 + Math.floor(rand * 26) : 65 + Math.floor(rand * 26));
//         // Add a random digit
//         captchaCode += rand < 0.5 ? Math.floor(rand * 10) : String.fromCharCode(48 + Math.floor(rand * 10));
//     }

//     return captchaCode;
// },



  
        //   sendOTP:function(){
        //     var that = this;
        //     $.ajax({
        //         type: 'POST',
        //         url: 'sendOtpViaEmail',
        //         data: {
        //           eMail: this.sEmail
        //         },
        //         success: function (data) {
        //           debugger;
        //           that.getView().getModel('local').setProperty('/otpVisible', true);
        //           that.getView().getModel('local').setProperty('/sendOtp', false);
        //           // oModel.setProperty('/MobileNumber', false);

        //           MessageToast.show('OTP Successfully Sent');
        //         },
        //         error: function (xhr, status, error) {
        //           console.error(error);
        //           MessageToast.show('Error sending OTP via email');
        //         }
        //       });
        //   },