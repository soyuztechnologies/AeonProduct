//The method callCRUD will be used to communicate to the backend returns the JS promise
//You can use the jQuery ajax or some other framework dependency to make REST Call
// var pendingRequests = {};
sap.ui.define([
	"jquery.sap.global",
	"sap/m/MessageBox",
	"ent/ui/ecommerce/controller/BaseController"
], function (jQuery, MessageBox, BaseController) {
	"use strict";

	return {
		callMiddleWare: function (sUrl, sMethod, oPayload,asyncBol) {
			return new Promise(function (resolve, reject) {
				asyncBol = asyncBol==='F' ? false : true;
				var currentDate = new Date();
				//prefilter for ajax to cancel the duplicate calls
					// $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
					// 	// 
					// function isCordovaAndroidEnvironment() {
					// 	return  window.cordova && cordova.platformId === "android";
					// }
					if (window.cordova){
						var endpoint = "http://167.71.234.203:3002/"
						var accessToken= Cookies.get("soyuz_session");
					}
					else{
						var endpoint = "/"
						var accessToken=``;
					const getCookie = function (name) {
						var value = "; " + document.cookie;
						var parts = value.split("; " + name + "=");
						if (parts.length == 2) {
						  return decodeURIComponent(parts.pop().split(";").shift());
						}
					  };

					  
					  if(getCookie("soyuz_session")){
						  
						accessToken=getCookie("soyuz_session")
						  
					  }
					}
					// });
					
			

				if (!(sUrl && sMethod)) {
					reject("Invalid parameters passed");
				}
				$.ajaxSetup({
					global: asyncBol,
				  });

				if(accessToken){
					if(sUrl.includes("?")){
						sUrl+=`&access_token=${accessToken}`;
					}
					else{
						sUrl+=`?access_token=${accessToken}`;
					}
				}
			
				
				
				// sap.ui.core.BusyIndicator.show();
				switch (sMethod.toUpperCase()) {
					case "GET":
						$.ajax(endpoint + sUrl, {
							async:asyncBol,
							type: 'GET', // http method
							contentType: "application/json",
							// data: JSON.stringify(oPayload), // data to submit
							success: function (data, status, xhr) {
								// sap.ui.core.BusyIndicator.hide();
								resolve(data);
							},
							//everytime time call goes it first came to before Send Method
								// beforeSend: function (jqXHR, options) { //
								// 	
								// 	// var key = options.url;
								// 	// if (!pendingRequests[key]) {
								// 	// 	pendingRequests[key] = jqXHR;
								// 	// } else {
								// 	// 	jqXHR.abort();
								// 	// 	// pendingRequests[key].abort(); // abort the first triggered submission
								// 	// }
								// 	// var complete = options.complete;
								// 	// options.complete = function (jqXHR, textStatus) {
								// 	// 	pendingRequests[key] = null;
								// 	// 	if (jQuery.isFunction(complete)) {
								// 	// 		complete.apply(this, arguments);
								// 	// 	}
								// 	// }
								// },
								// complete: function() {
								// 	
								// 	// $(this).data('requestRunning', false);
								// },
							error: function (jqXhr, textStatus, errorMessage) {
								// sap.ui.core.BusyIndicator.hide();
								reject(jqXhr.responseText || errorMessage);
							}
						});

						break;
					case "POST":
						$.ajax(endpoint + sUrl, {
							type: 'POST', // http method
							contentType: "application/json",
							data: JSON.stringify(oPayload), // data to submit
							success: function (data, status, xhr) {
								// sap.ui.core.BusyIndicator.hide();
								if(xhr.status==207){
									let statusCode = xhr.status
									resolve({data,statusCode});
									return;
								}
								resolve(data,status,xhr);
							},
							error: function (jqXhr, textStatus, errorMessage) {
								// sap.ui.core.BusyIndicator.hide();
								reject(jqXhr.responseText || errorMessage);
							}
						});

						break;
					case "PUT":
						$.ajax(endpoint + sUrl, {
							type: 'PUT', // http method
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json'
							},
							contentType: "application/json",
							data: JSON.stringify(oPayload), // data to submit
							success: function (data, status, xhr) {
								// sap.ui.core.BusyIndicator.hide();
								resolve(data);
							},
							error: function (jqXhr, textStatus, errorMessage) {
								// sap.ui.core.BusyIndicator.hide();
								reject(jqXhr.responseText || errorMessage);
							}
						});

						break;
					case "PATCH":
						$.ajax(endpoint + sUrl, {
							type: 'PATCH', // http method
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json'
							},
							contentType: "application/json",
							data: JSON.stringify(oPayload), // data to submit
							success: function (data, status, xhr) {
								// sap.ui.core.BusyIndicator.hide();
								resolve(data);
							},
							error: function (jqXhr, textStatus, errorMessage) {
								// sap.ui.core.BusyIndicator.hide();
								reject(jqXhr.responseText || errorMessage);
							}
						});

						break;
					case "DELETE":
						$.ajax(endpoint + sUrl, {
							type: 'DELETE', // http method
							headers: {
								'Accept': 'application/json',
								'Content-Type': 'application/json'
							},
							success: function (data, status, xhr) {
								// sap.ui.core.BusyIndicator.hide();
								resolve(data);
							},
							error: function (jqXhr, textStatus, errorMessage) {
								// sap.ui.core.BusyIndicator.hide();
								reject(jqXhr.responseText || errorMessage);
							}
						});

						break;
					default:
						jQuery.sap.log.error("No case matched");
						break;
				}
			});
		},
		errorHandler: function (jqr, then) {
			then.getView().setBusy(false);
			var type = typeof (jqr);
			switch (type) {
				case 'string':
					try {
						const text = JSON.parse(JSON.parse(jqr).text).error.message;
						if (text.value) {
							MessageBox.error(text.value);
						}
						else {
							MessageBox.error(text);
						}

					} catch (error) {
						if (jqr.includes('Session expired.') || jqr.includes('authenticated')) {
							sessionStorage.session_id = null;
							var oMessage = then.getModel("i18n").getProperty("SessionExpire");
							MessageBox.error(oMessage, {
								actions: [MessageBox.Action.OK],
								onClose: function () {
									
									window.location.href = "/";
								}
							});	
						}
						else if (jqr.includes('User Not Found')) {
							var oEmail = jqr.split(":")[1];
							var oMessage = then.getModel("i18n").getProperty("notFoundUser");
							// oMessage=oMessage.replace('"', '');
							// var oEmail=then.getModel("appView").getProperty("/User");
							oMessage = oMessage.replace("<login-email>", oEmail)
							MessageBox.error(oMessage);
						}
						else if(jqr.includes('no such file or directory')){
							var oMessage = then.getModel("i18n").getProperty("noFileFound");
							// oMessage=oMessage.replace('"', '');
							var oName=jqr.split("\\")[jqr.split("\\").length-1].split("'")[0]
							// var oEmail=then.getModel("appView").getProperty("/User");
							oMessage = oMessage.replace("<fileName>", oName)
							MessageBox.error(oMessage);
						}
						else {
							MessageBox.error(jqr);
						}
					}

					break;
				case 'object':
					if(jqr.responseText){
						MessageBox.error(jqr.responseText);
						break;
					}
					MessageBox.error(jqr.toString());
					break;
				default:
					MessageBox.error(jqr.toString());
					break;
			}
		},
		b1ErrorMessage:function(jqr){
			var type = typeof (jqr);
			switch (type) {
				case 'string':
					try {
						const text = JSON.parse(JSON.parse(jqr).text).error.message;
						if (text.value) {
							return text.value;
						}
						else {
							return text;
						}

					} catch (error) {
						
						return jqr;
					}

					break;
				case 'object':
					if(jqr.responseText){
						return jqr.responseText;
					}
					if(jqr.error){
						if(jqr.error.message && jqr.error.message.value ){
							return jqr.error.message.value;
						}
						else if(jqr.error.message){
							let oMsg=jqr.error.message.toString();
							return oMsg;
						}
						let omsg=jqr.error.toString();
						return omsg;
					}
					let text=jqr.toString();
					return text;
					break;
				default:
					let otext=jqr.toString();
					return otext;
					break;
			}
		},
		onTimeZone: function (d) {
			if (d.getTimezoneOffset() > 0) {
				d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
			} else {
				d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
			}
			return d;
		},
		oDataV2Date: function (jsonDate) {
			var offset = new Date().getTimezoneOffset();
			var parts = /\/Date\((-?\d+)([+-]\d{2})?(\d{2})?.*/.exec(jsonDate);
			if (parts[1]) {
				
				if (parts[1].length > 1) {
					var oDate = new Date(+parts[1]);
					//commented due to the date is converted in GMT by this, not in locale 
					//don't not use for locale date format
					//only use while posting, because it automatically converted into server locale
					// if (oDate.getTimezoneOffset() > 0) { 
					// 	oDate.setMinutes(oDate.getMinutes() - oDate.getTimezoneOffset());
					// } else {
					// 	oDate.setMinutes(oDate.getMinutes() + oDate.getTimezoneOffset());
					// }
					return oDate;
				}
				else {
					return null;
				}

			}
		},
		batchPayloadGenerator: function(sUrl,sMethod,oPayload,oKey){
			// sMethod="POST","PATCH","DELETE","PUT"
			if(!oPayload){
				return [];
			}
			if(oPayload.length===0)
			{
				return[];
			}
			var aPayload=[];
			var oIndex=0;
			var oResPay = {
				"method": sMethod,
				"atomicityGroup": "",
				"url": sUrl,
				"headers": {
					"content-type": "application/json; odata.metadata=minimal; odata.streaming=true",
					"odata-version": "4.0"
				},
				"id":"",
				"body": null
			};
			for(let i = 0; i < oPayload.length; i++)
			{		
				var oRes=JSON.parse(JSON.stringify(oResPay));
				if(sMethod!=="POST"){
					var oObj=oPayload[i]
					for (const key in oObj){
						if(key==oKey){
							oRes.url=oRes.url+"("+oObj[key]+")";
							break;
						}
					}
				}
				oIndex++;
				oRes.atomicityGroup="g"+oIndex;
				oRes.id="g"+oIndex+"-r1"
				oRes.body=oPayload[i];
				aPayload.push(oRes);
			}
			return aPayload;
		},
		batchFunction:function(oPayload){
			return new Promise(function (resolve, reject) {
				var oPromise=[];
				for (let index = 0; index < oPayload.requests.length; index++) {
					const element = oPayload.requests[index];
					oPromise.push(this.callMiddleWare(element.url,element.method,element.body))
				}
				Promise.allSettled(oPromise).then((values) => {
					resolve(values);	
				});
			}.bind(this));
			
		},
	};
});