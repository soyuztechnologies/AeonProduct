var loopback = require('loopback');
var boot = require('loopback-boot');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var express = require('express');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const { RoleMapping } = require('loopback');
const moment = require('moment');



var fs = require('fs');
const { log, debug, error, time } = require('console');
const { default: index } = require('async');
var app = express();
app = module.exports = loopback();
// parse application/json
// app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(session({
	secret: 'anubhavApp',
	saveUninitialized: true,
	resave: true
}));


app.use(fileUpload());


// create update field in AccessToken model
  app.use((req, res, next) => {
    const cookieHeader = req.headers.cookie;
    let sessionCookie = null;

    if (cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        sessionCookie = cookies.soyuz_session;
    }
    if (!sessionCookie && req.headers.authorization) {
        sessionCookie = req.headers.authorization.replace("Bearer ", "");
    }
    if (!sessionCookie) {
        sessionCookie = req.query.access_token || req.body.access_token;
    }

    if (sessionCookie) {
        const AccessToken = app.models.AccessToken;
        AccessToken.updateAll(
            { id: sessionCookie },
            { updated: new Date() },   
            (err) => {
                if (err) {
                    console.error("Failed to update AccessToken:", err);
                }
            }
        );
    }

    next();
});


function myMiddleware(options) {
	return function (req, res, next) {


		// Save the original send function
		if (req.url.includes("/api/Users/login") || req.url.includes("/login")) {
			var originalSend = res.send;
			res.send = function (body) {
				if (body && JSON.parse(body).id) {
					res.cookie('soyuz_session', JSON.parse(body).id, {
						httpOnly: true,  // Prevents access to cookie from JavaScript
						secure: true,    // Ensures cookie is sent over HTTPS
						sameSite: 'None', // Allows cross-site cookie usage
						maxAge: 3600 * 5000 // 5 hour expiration
					});
					res.cookie('soyuz_session', JSON.parse(body).id);
				}
				// Call the original send function with the unmodified body
				originalSend.call(this, body);
			};
		}
		next();

	}
}
app.use(myMiddleware());
app.use(loopback.token({
	model: app.models.accessToken,
	currentUserLiteral: 'me',
}));
// app.use(cookieParser());
app.start = function () {
	// start the web server
	return app.listen(function () {
		app.emit('started');
		var baseUrl = app.get('url').replace(/\/$/, '');
		console.log('Web server listening at: %s', baseUrl);
		if (app.get('loopback-component-explorer')) {
			var explorerPath = app.get('loopback-component-explorer').mountPath;
			console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
		}

		var Server = app.models.Server;
		var ServerPay = app.models.ServerPay;

		app.get('/ServerDownload', function (req, res) {

			Server.find({})
				.then(function (Records, err) {
					if (Records) {

						var excel = require('exceljs');
						var workbook = new excel.Workbook(); //creating workbook
						var sheet = workbook.addWorksheet('MySheet'); //creating worksheet

						sheet.addRow().values = Object.keys(Records[0].__data);

						for (var i = 0; i < Records["length"]; i++) {
							sheet.addRow().values = Object.values(Records[i].__data);
						}

						var tempfile = require('tempfile');
						var tempFilePath = tempfile('.xlsx');
						console.log("tempFilePath : ", tempFilePath);
						workbook.xlsx.writeFile(tempFilePath).then(function () {
							res.sendFile(tempFilePath, function (err) {
								if (err) {
									console.log('---------- error downloading file: ', err);
								}
							});
							console.log('file is written @ ' + tempFilePath);
						});

					}
				}

				);
		});

		// * this function is send the email to the user in secenerio like signup,forgot password,admin add user etc.
		async function sendEmail(email, token, replacements, templateFileName, emailSubject) {
			var nodemailer = require('nodemailer');
			var smtpTransport = require('nodemailer-smtp-transport');
			this.Param = app.models.Param;
			const xoauth2 = require('xoauth2');
			const fs = require('fs');

			try {
				const array = ["user", "clientId", "clientSecret", "refreshToken"];
				const Param = this.Param;
				const key = {};
				const sParam = await Param.find({
					where: {
						and: [{
							Code: {
								inq: array
							}
						}]
					}
				});

				for (const element of sParam) {
					switch (element.Code) {
						case "user":
							key.user = element.Value;
							break;
						case "clientId":
							key.clientId = element.Value;
							break;
						case "clientSecret":
							key.clientSecret = element.Value;
							break;
						case "refreshToken":
							key.refreshToken = element.Value;
							break;
					}
				}

				const mailContent = fs.readFileSync(process.cwd() + "/server/sampledata/" + templateFileName, 'utf8');
				var mailBody = await replaceTemplatePlaceholders(mailContent, replacements);

				const transporter = nodemailer.createTransport(smtpTransport({
					service: 'gmail',
					host: 'smtp.gmail.com',
					auth: {
						xoauth2: xoauth2.createXOAuth2Generator({
							user: key.user,
							clientId: key.clientId,
							clientSecret: key.clientSecret,
							refreshToken: key.refreshToken
						})
					}
				}));

				const emailContent = {
					to: email,
					subject: emailSubject,
					html: mailBody
				};

				transporter.sendMail(emailContent, function (error, info) {
					if (error) {
						console.log(error);
						if (error.code === "EAUTH") {
							res.status(500).send('Username and Password not accepted, Please try again.');
						} else {
							res.status(500).send('Internal Error while Sending the email, Please try again.');
						}
					} else {
						console.log('Email sent: ' + info.response);
						// Handle success
					}
				});
			} catch (error) {
				console.error(error);
				res.status(500).send('Internal server error');
			}
		}
		// function sendEmail(email, token, replacements, templateFileName, emailSubject, callback) {
		// 	var nodemailer = require('nodemailer');
		// 	var smtpTransport = require('nodemailer-smtp-transport');
		// 	this.Param = app.models.Param;
		// 	const xoauth2 = require('xoauth2');
		// 	const fs = require('fs');

		// 	try {
		// 		const array = ["user", "clientId", "clientSecret", "refreshToken"];
		// 		const Param = this.Param;
		// 		const key = {};
		// 		Param.find({
		// 			where: {
		// 				and: [{
		// 					Code: {
		// 						inq: array
		// 					}
		// 				}]
		// 			}
		// 		}, function (err, sParam) {
		// 			if (err) {
		// 				console.error(err);
		// 				callback('Internal server error');
		// 				return;
		// 			}

		// 			sParam.forEach(function (element) {
		// 				switch (element.Code) {
		// 					case "user":
		// 						key.user = element.Value;
		// 						break;
		// 					case "clientId":
		// 						key.clientId = element.Value;
		// 						break;
		// 					case "clientSecret":
		// 						key.clientSecret = element.Value;
		// 						break;
		// 					case "refreshToken":
		// 						key.refreshToken = element.Value;
		// 						break;
		// 				}
		// 			});

		// 			const mailContent = fs.readFileSync(process.cwd() + "/server/sampledata/" + templateFileName, 'utf8');
		// 			replaceTemplatePlaceholders(mailContent, replacements, function (err, mailBody) {
		// 				if (err) {
		// 					console.error(err);
		// 					callback('Internal server error');
		// 					return;
		// 				}

		// 				const transporter = nodemailer.createTransport(smtpTransport({
		// 					service: 'gmail',
		// 					host: 'smtp.gmail.com',
		// 					auth: {
		// 						xoauth2: xoauth2.createXOAuth2Generator({
		// 							user: key.user,
		// 							clientId: key.clientId,
		// 							clientSecret: key.clientSecret,
		// 							refreshToken: key.refreshToken
		// 						})
		// 					}
		// 				}));

		// 				const emailContent = {
		// 					to: email,
		// 					subject: emailSubject,
		// 					html: mailBody
		// 				};

		// 				transporter.sendMail(emailContent, function (error, info) {
		// 					if (error) {
		// 						console.log(error);
		// 						if (error.code === "EAUTH") {
		// 							callback('Username and Password not accepted, Please try again.');
		// 						} else {
		// 							callback('Internal Error while Sending the email, Please try again.');
		// 						}
		// 					} else {
		// 						console.log('Email sent: ' + info.response);
		// 						callback(null, 'Email sent successfully');
		// 					}
		// 				});
		// 			});
		// 		});
		// 	} catch (error) {
		// 		console.error(error);
		// 		callback('Internal server error');
		// 	}
		// }


		// * this fucntion working to replace the dynamic characters in the email body,like usernameand and emaol etc.

		async function sendEmailTemp(email) {
			var nodemailer = require('nodemailer');
			var smtpTransport = require('nodemailer-smtp-transport');
			this.Param = app.models.Param;
			const xoauth2 = require('xoauth2');

			try {
				const array = ["user", "clientId", "clientSecret", "refreshToken"];
				const Param = this.Param;
				const key = {};
				const sParam = await Param.find({
					where: {
						and: [{
							Code: {
								inq: array
							}
						}]
					}
				});

				for (const element of sParam) {
					switch (element.Code) {
						case "user":
							key.user = element.Value;
							break;
						case "clientId":
							key.clientId = element.Value;
							break;
						case "clientSecret":
							key.clientSecret = element.Value;
							break;
						case "refreshToken":
							key.refreshToken = element.Value;
							break;
					}
				}

				const PoTransporter = nodemailer.createTransport(smtpTransport({
					service: 'gmail',
					host: 'smtp.gmail.com',
					auth: {
						xoauth2: xoauth2.createXOAuth2Generator({
							user: key.user,
							clientId: key.clientId,
							clientSecret: key.clientSecret,
							refreshToken: key.refreshToken
						})
					}
				}));

				const emailContent = {
					to: email.EMAIL_TO,
					cc: email.EMAIL_CC ? email.EMAIL_CC : undefined,
					bcc: email.EMAIL_BCC ? email.EMAIL_BCC : undefined,
					subject: email.EMAIL_SUBJECT,
					html: email.EMAIL_BODY,
					attachments: email.GENERATED_PDF ? [
						{
							filename: `${email.PDF_NAME}`,
							content: Buffer.from(email.GENERATED_PDF.split(",")[1], 'base64'),
							contentType: 'application/pdf'
						}
					] : []
				};

				// Convert callback to Promise
				return new Promise((resolve, reject) => {
					PoTransporter.sendMail(emailContent, function (error, info) {
						if (error) {
							console.error("Email send failed:", error);
							reject(error);
						} else {
							console.log("Email sent successfully to:", info.accepted);
							resolve(info);
						}
					});
				});
			} catch (error) {
				console.error(error);
				res.status(500).send('Internal server error');
			}
		}


		app.post('/onSendPoEmail', async (req, res) => {
			const Email = req.body;
			const attachmentTable = app.models.Attachments;
			const sentEmailTable = app.models.SentEmail;
			const Job = app.models.Job;

			try {
				const info = await sendEmailTemp(Email);

				const oEmailData = {
					EMAIL_TO: Email.EMAIL_TO,
					EMAIL_CC: Email.EMAIL_CC ? Email.EMAIL_CC.toString() : "",
					EMAIL_BCC: Email.EMAIL_BCC ? Email.EMAIL_BCC.toString() : "",
					EMAIL_SUBJECT: Email.EMAIL_SUBJECT,
					EMAIL_BODY: Email.EMAIL_BODY,
					CreatedBy: Email.userId
				};
				var PDF_NAME = Email.PDF_NAME ? Email.PDF_NAME.trim().replace(/\.pdf$/i, '') : '';
				var PDF_PoNo = Email.PDF_PONo;

				if(PDF_NAME)
				oEmailData.Attachment = PDF_NAME ? PDF_NAME : null;

				await sentEmailTable.create(oEmailData);
				
				const attachmentKey = PDF_NAME ? PDF_NAME : null;
				
				if (attachmentKey !== null) {
					const existingAttachment = await attachmentTable.findOne({ where: { Key: attachmentKey } });
					
					if (existingAttachment) {
						await existingAttachment.updateAttribute('Attachment', Email.GENERATED_PDF);
					} else {
						const oEmailAttachmentData = {
							Key: attachmentKey,
							Label: `${attachmentKey}.pdf`,
							Attachment: Email.GENERATED_PDF,
							Type: Email.TYPE
						};
						await attachmentTable.create(oEmailAttachmentData);
					}
				}
				

				var JobCardNo = Email.jobCardNo;
				var partStatus = Email.PartStatus; 

				if(JobCardNo && partStatus){
					const jobRecord = await Job.findOne({ where: { jobCardNo: JobCardNo } });
					if(jobRecord) {
						await jobRecord.updateAttribute(partStatus, 'EmailSent');
					}
				}

				res.status(200).json({
					message: 'Email sent successfully',
					accepted: info.accepted,
					response: info.response
				});

			} catch (error) {
					console.error(" Error in onSendPoEmail:", error);
					res.status(500).json({
					error: 'Failed to send email or process attachment',
					details: error.message
				});
			}
		});

		
		async function replaceTemplatePlaceholders(content, replacements) {
			let replacedContent = content;
			for (const placeholder in replacements) {
				const regex = new RegExp('\\$\\$' + placeholder + '\\$\\$', 'gi');
				replacedContent = replacedContent.replace(regex, replacements[placeholder]);
			}
			return replacedContent;
		}

		//  * this function is generating the JWt token.
		function generateToken(email) {
			const expirationTime = Math.floor(Date.now() / 1000) + (30 * 60);
			const secretKey = 'your_secret_key'; // Replace with your actual secret key
			return jwt.sign({ email, exp: expirationTime }, secretKey);
		}

		// * this fucntion is sending the email to user, for forgot the password.
		app.post('/forgotPasswordEmailVerify', (req, res) => {
			const User = app.models.User;
			const AppUser = app.models.AppUser;
			const otp = app.models.otp;

			const { email } = req.body;

			User.findOne({ where: { email } }, (userError, existingUser) => {
				if (userError) {
					console.error(userError);
					return res.status(500).json({ error: 'Internal server error' });
				}

				if (!existingUser) {
					return res.status(400).json({ error: 'Email is not registered with us.' });
				}

				const otpValue = generateOTP();
				const dateAndTime = generateDateAndTime();
				const ExpDateAndTIme = generateDateAndTimeWithExtraTime();
				const token = generateToken(email);
				const replacements = {
					OTP: otpValue,
					email: "noreply@aeonproducts.com",
					user: email,
				};
				const templateFileName = "Forgot.html";
				const emailSubject = "Reset Your Password";

				sendEmail(email, token, replacements, templateFileName, emailSubject)
					.then(async () => {
						try {
							await otp.create({ OTP: otpValue, User: email, CreatedOn: dateAndTime, ExpDate: ExpDateAndTIme });
							res.status(200).json({ message: 'Verification email sent successfully' });
						} catch (createOtpError) {
							console.error(createOtpError);
							res.status(500).json({ error: 'Internal server error' });
						}
					})
					.catch(sendEmailError => {
						console.error(sendEmailError);
						res.status(500).json({ error: 'Internal server error' });
					});
			});
		});

		// Verify the token when the user tries to reset the password
		app.post('/Forgot/verifyToken', (req, res) => {
			const User = app.models.User;
			const { token } = req.body;
			let email;

			jwt.verify(token, 'your_secret_key', function (err, decoded) {
				if (err) {
					return res.status(500).send('Token is Expired');
				} else {
					email = decoded.email;
					User.findOne({ where: { email } }, (findUserError, existingUser) => {
						if (findUserError) {
							console.error(findUserError);
							return res.status(500).json({ error: 'Internal server error' });
						}
						if (!existingUser) {
							return res.status(400).json({ error: 'User with this email does not exist' });
						}
						let msg = "Token verified";
						res.status(200).json({ msg, email });
					});
				}
			});
		});

		// Reset the password in the appuser and user tables
		app.post('/reset/password', (req, res) => {
			const User = app.models.User;
			const { email, password } = req.body;

			User.findOne({ where: { email } }, (userError, user) => {
				if (userError) {
					console.error(userError);
					return res.status(500).json({ error: 'Internal server error' });
				}
				if (user) {
					user.updateAttributes({ password: password }, (updateError) => {
						if (updateError) {
							console.error('Error updating password:', updateError);
							return res.status(500).send('Internal server error');
						}
						res.status(200).send('Password updated successfully');
					});
				} else {
					res.status(400).json({ error: 'User not found' });
				}
			});
		});


		function generateOTP(length = 6) {

			const digits = '0123456789';
			let otp = '';

			for (let i = 0; i < length; i++) {
				const randomIndex = Math.floor(Math.random() * digits.length);
				otp += digits.charAt(randomIndex);
			}

			return otp;
		}

		//*get Date and time
		function generateDateAndTime() {

			var currentDate = new Date();
			var year = currentDate.getFullYear();
			var month = currentDate.getMonth() + 1; // Note: Months are 0-based, so add 1 to get the correct month
			var day = currentDate.getDate();
			var hours = currentDate.getHours();
			var minutes = currentDate.getMinutes();
			var seconds = currentDate.getSeconds();

			var formattedDate = year + "-" + addLeadingZero(month) + "-" + addLeadingZero(day);
			var formattedTime = addLeadingZero(hours) + ":" + addLeadingZero(minutes) + ":" + addLeadingZero(seconds);

			var dateAndTime = formattedDate + " " + formattedTime;
			return dateAndTime;
			function addLeadingZero(number) {
				return number < 10 ? "0" + number : number;
			}
		}

		app.post('/getJobsWithStatusFilter', function (req, res) {
			const {minDate, maxDate, status} = req.body;
			const Job = app.models.Job;

			var oFilter = {
					and: [
						{ status: status }
					]
				};

				if (minDate && maxDate) {
					oFilter.and.push({ date: { gte: minDate } });
					oFilter.and.push({ date: { lte: maxDate } });
				}

			try {
				Job.find({
					fields: {
						JobName: false,
						UpdatedOn: false,
						CreatedOn: false,
						date: false,
						poAttachment: false,
						artworkAttachment: false,
						poNo: false,
						artworkCode: false,
						clientPONo: false,
						industry: false,
						cartonType: false,
						qtyPcs: false,
						PaperGSM: false,
						paperPoNo: false,
						paperQuality: false,
						printing: false,
						color: false,
						sizeL: false,
						sizeW: false,
						sizeH: false,
						varLmt: false,
						effects: false,
						lock: false,
						tF: false,
						pF: false,
						doubleCut: false,
						trimTF: false,
						trimPF: false,
						noOfUps1: false,
						noOfUps2: false,
						noOfUps3: false,
						noOfSheets1: false,
						noOfSheets2: false,
						wastage: false,
						wtKgs: false,
						printingSheetSizeL1: false,
						printingSheetSizeW1: false,
						printingSheetSizeL2: false,
						printingMachine: false,
						punchingMachine: false,
						pastingMachine: false,
						ref: false,
						old: false,
						none: false,
						b2A: false,
						none1: false,
						none2: false,
						batchNo: false,
						mfgDate: false,
						expDate: false,
						correctionsInArtwork: false,
						remarks: false,
						totalAB: false,
						profit: false,
						totalCostOfJob: false,
						costPerPc: false,
						plate: false,
						plate1: false,
						plate2: false,
						pantoneInks: false,
						foilBlocks: false,
						positive: false,
						embossBlock: false,
						punch: false,
						punch1: false,
						punch2: false,
						reference: false,
						cartonLength: false,
						cartonWidth: false,
						paperCost: false,
						printingCharges: false,
						varnishLamination: false,
						embossing: false,
						punching: false,
						bSOPasting: false,
						lBTOPasting: false,
						packing: false,
						transportation: false,
						total: false,
						plateCharges: false,
						blanketCharges: false,
						userName: false,
						remarks1: false,
						remarks2: false,
						corrections1: false,
						corrections2: false,
						corrections3: false,
					},
					where: oFilter,
					include: 'Company'
				}, function (error, jobs) {
					if (error) {
						console.error(error);
						return res.status(500).send(error);
					}
					res.send(jobs);
				});
			} catch (error) {
				console.error(error);
				return res.status(500).send(error);
			}
		});

		//* Date with extra 30 Minutes!
		function generateDateAndTimeWithExtraTime() {
			var currentDate = new Date();
			var extraTime = 30; // 30 minutes
			currentDate.setMinutes(currentDate.getMinutes() + extraTime);

			var year = currentDate.getFullYear();
			var month = currentDate.getMonth() + 1; // Note: Months are 0-based, so add 1 to get the correct month
			var day = currentDate.getDate();
			var hours = currentDate.getHours();
			var minutes = currentDate.getMinutes();
			var seconds = currentDate.getSeconds();

			// Formatting the output as desired
			var formattedDate = year + "-" + addLeadingZero(month) + "-" + addLeadingZero(day);
			var formattedTime = addLeadingZero(hours) + ":" + addLeadingZero(minutes) + ":" + addLeadingZero(seconds);

			// Output the result with an additional 30 minutes
			// this.getView().getModel("appView").setProperty("/dateAndTimeWithExtraTime", formattedDate + " " + formattedTime);
			var dateAndTime = formattedDate + " " + formattedTime;
			// Helper function to add leading zero if single-digit
			return dateAndTime;
			function addLeadingZero(number) {
				return number < 10 ? "0" + number : number;
			}
		}


		//*Verify otp
		app.post('/verifyOtp', (req, res) => {

			const User = app.models.User;
			const otpModel = app.models.otp;
			const OTP = req.body;
			const currentdateAndTime = generateDateAndTime();

			try {
				otpModel.findOne({ where: { OTP: OTP.inputOtpValue } }, (otpError, otp) => {
					if (otpError) {
						res.status(400).json({ error: 'OTP not validate' });
					} else if (otp && otp.__data.OTP == OTP.inputOtpValue && otp.__data.User == OTP.email) {
						if (otp.__data.ExpDate > currentdateAndTime) {
							res.status(200).send('Validation Successful');
						} else {
							res.status(400).send('OTP has expired');
						}
					} else {
						res.status(400).json({ error: 'OTP not validate' });
					}
				});
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});


		//* Delete OTP
		app.post('/deleteotp', (req, res) => {
			const User = app.models.User;
			const otpModel = app.models.otp;
			const OTP = req.body;

			try {
				otpModel.findOne({ where: { OTP } }, (otpError, otp) => {
					if (otpError) {
						console.error('Error deleting OTP:', otpError);
						res.status(500).send('Internal server error');
					} else if (otp) {
						otp.remove((removeError) => {
							if (removeError) {
								console.error('Error deleting OTP:', removeError);
								res.status(500).send('Internal server error');
							} else {
								res.status(200).send('OTP Deleted Successfully');
							}
						});
					} else {
						res.status(404).send('OTP Not Found');
					}
				});
			} catch (error) {
				console.error('Error deleting OTP:', error);
				res.status(500).send('Internal server error');
			}
		});


		app.post('/deleteAccountEmail', (req, res) => {

			const User = app.models.User;
			const AppUser = app.models.AppUser;
			const otp = app.models.otp;

			const { email } = req.body;
			const EmailId = email;

			User.findOne({ where: { email } }, (userError, existingUser) => {
				if (userError) {
					console.error(userError);
					return res.status(500).json({ error: 'Internal server error' });
				}
				if(!existingUser) {
					return res.status(400).json({ error: 'User with this email does not exist in User' });
				}
				AppUser.findOne({ where: { EmailId } }, (appUserError, existingAppUser) => {
					if (appUserError) {
						console.error(appUserError);
						return res.status(500).json({ error: 'Internal server error' });
					}
					if (!existingAppUser) {
						return res.status(400).json({ error: 'User with this email does not exist in AppUser' });
					}

					const otpValue = generateOTP();
					const dateAndTime = generateDateAndTime();
					const ExpDateAndTIme = generateDateAndTimeWithExtraTime();
					const token = generateToken(email);
					const replacements = {
						OTP: otpValue,
						email: "noreply@aeonproducts.com",
					};
					const templateFileName = "deleteAccountEmail.html";
					const emailSubject = "Verify Your Account Deletion Email";
					const date = new Date();
					
					sendEmail(email, token, replacements, templateFileName, emailSubject)
					.then(async () => {
						try {
							await otp.create({ OTP: otpValue, User: email, CreatedOn: dateAndTime, ExpDate: ExpDateAndTIme });
							res.status(200).json({ message: 'Verification email sent successfully' });
						} catch (createOtpError) {
							console.error(createOtpError);
							res.status(500).json({ error: 'Internal server error' });
						}
					})
					.catch(sendEmailError => {
						console.error(sendEmailError);
						res.status(500).json({ error: 'Internal server error' });
					});
				});
			});
		});

		// app.post('/deleteAccountEmail', async (req, res) => {
		// 	const User = app.models.User;
		// 	const AppUser = app.models.AppUser;
		// 	const otp = app.models.otp;

		// 	const { email } = req.body;

		// 	try {
		// 		// check in User
		// 		const existingUser = await User.findOne({ where: { email } });
		// 		// check in AppUser
		// 		const existingAppUser = await AppUser.findOne({ where: { email } });

		// 		if (!existingUser || !existingAppUser) {
		// 			return res.status(404).json({ error: 'Email not found in User or AppUser' });
		// 		}

		// 		// agar dono me hai -> otp bhejna h
		// 		const otpValue = generateOTP();
		// 		const dateAndTime = generateDateAndTime();
		// 		const ExpDateAndTIme = generateDateAndTimeWithExtraTime();
		// 		const token = generateToken(email);

		// 		const replacements = {
		// 			OTP: otpValue,
		// 			email: "noreply@aeonproducts.com",
		// 		};
		// 		const templateFileName = "deleteAccountEmail.html";
		// 		const emailSubject = "Verify Your Account Deletion Email";

		// 		await sendEmail(email, token, replacements, templateFileName, emailSubject);

		// 		await otp.create({ OTP: otpValue, User: email, CreatedOn: dateAndTime, ExpDate: ExpDateAndTIme });

		// 		return res.status(200).json({ message: 'Verification email sent successfully' });

		// 	} catch (error) {
		// 		console.error(error);
		// 		return res.status(500).json({ error: 'Internal server error' });
		// 	}
		// });


		// * this post call is sending the email to the user,when user is registering into the portal.
		app.post('/signup/verifyEmail', (req, res) => {

			const User = app.models.User;
			const AppUser = app.models.AppUser;
			const otp = app.models.otp;

			const { email } = req.body;

			User.findOne({ where: { email } }, (userError, existingUser) => {
				if (userError) {
					console.error(userError);
					return res.status(500).json({ error: 'Internal server error' });
				}

				if (existingUser) {
					return res.status(400).json({ error: 'User with this email already exists' });
				}

				const otpValue = generateOTP();
				const dateAndTime = generateDateAndTime();
				const ExpDateAndTIme = generateDateAndTimeWithExtraTime();
				const token = generateToken(email);
				const replacements = {
					OTP: otpValue,
					email: "noreply@aeonproducts.com",
				};
				const templateFileName = "verifyEmail.html";
				const emailSubject = "Verify Your Registration Email";
				const date = new Date();

				sendEmail(email, token, replacements, templateFileName, emailSubject)
					.then(async () => {
						try {
							await otp.create({ OTP: otpValue, User: email, CreatedOn: dateAndTime, ExpDate: ExpDateAndTIme });
							res.status(200).json({ message: 'Verification email sent successfully' });
						} catch (createOtpError) {
							console.error(createOtpError);
							res.status(500).json({ error: 'Internal server error' });
						}
					})
					.catch(sendEmailError => {
						console.error(sendEmailError);
						res.status(500).json({ error: 'Internal server error' });
					});
			});
		});

		// * this post call is sending the email to the user,when user is registering into the portal.
		app.post('/remarkEmailSend', async (req, res) => {
			// debugger
			try {
				var payload = req.body;
				var jobCardNo = payload.JobData;
				const email = "Maskara.tarun@gmail.com";
				const token = "";
				const replacements = {
					JOBCARDNO: jobCardNo,
					EMAIL: "noreply@aeonproducts.com",
				};
				const templateFileName = "Remark.html"
				const emailSubject = " Remark Received for Job Card No. " + jobCardNo + "."
				sendEmail(email, token, replacements, templateFileName, emailSubject)
					.then(() => {
						return res.status(200).json('Remark Email Send successfully');
					})
					.catch(sendEmailError => {
						console.error(sendEmailError);
						return res.status(500).json({ error: 'Failed to Send Remark Email' });
					});
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});
		app.post('/signup/createUser', (req, res) => {
			const User = app.models.User;
			const AppUser = app.models.AppUser;
			const { email, password } = req.body;
			const role = 'Customer'; // Hardcoded role as 'Customer'
			const name = email.substring(0, email.indexOf("@"));

			User.findOne({ where: { email } }, (userError, existingUser) => {
				if (userError) {
					console.error(userError);
					return res.status(500).json({ error: 'Internal server error' });
				}

				if (existingUser) {
					return res.status(400).json({ error: 'User with this email already exists' });
				}

				User.create({ email, password, Role: role, CreatedOn: new Date(), status: "Pending" }, (createUserError, newUser) => {
					if (createUserError) {
						console.error(createUserError);
						return res.status(500).json({ error: 'Internal server error' });
					}

					AppUser.create({
						TechnicalId: newUser.id,
						EmailId: email,
						UserName: name,
						CreatedOn: new Date(),
						Role: role
					}, (createAppUserError) => {
						if (createAppUserError) {
							console.error(createAppUserError);
							return res.status(500).json({ error: 'Internal server error' });
						}

						console.log(`App User created: ${JSON.stringify(newUser.toJSON())}`);
						res.status(200).json({ message: 'User created successfully' });
					});
				});
			});
		});

		//* Get all users from the User table
		app.get('/usersTable', (req, res) => {
			const User = app.models.User;

			User.find((error, users) => {
				if (error) {
					console.error(error);
					return res.status(500).json({ error: 'Internal server error' });
				}
				res.status(200).json(users);
			});
		});

		//* Delete user from the User table
		app.post('/deleteusersTable', (req, res) => {
			const User = app.models.User;
			const id = req.body.id;

			User.findOne({ where: { id: id } }, (userError, user) => {
				if (userError) {
					console.error('Error finding user:', userError);
					return res.status(500).send('Internal server error');
				}

				if (user) {
					user.remove((removeError) => {
						if (removeError) {
							console.error('Error deleting user:', removeError);
							return res.status(500).send('Internal server error');
						}
						res.status(200).send('User deleted successfully');
					});
				} else {
					res.status(404).send('User not found');
				}
			});
		});

		//* Delete user from the AppUser table
		// app.post('/deleteAppUsersTable', (req, res) => {
		// 	const AppUser = app.models.AppUser;
		// 	const id = req.body.id;

		// 	AppUser.findOne({ where: { id: id } }, (appUserError, user) => {
		// 		if (appUserError) {
		// 			console.error('Error finding user:', appUserError);
		// 			return res.status(500).send('Internal server error');
		// 		}

		// 		if (user) {
		// 			const technicalId = user.TechnicalId;
					
		// 			user.remove((removeError) => {
		// 				if (removeError) {
		// 					console.error('Error deleting user:', removeError);
		// 					return res.status(500).send('Internal server error');
		// 				}
						
		// 				// Return TechnicalId in response
		// 				res.status(200).json({
		// 					message: 'User deleted successfully',
		// 					TechnicalId: technicalId
		// 				});
		// 			});
		// 		} else {
		// 			res.status(404).send('User not found');
		// 		}
		// 	});
		// });

		app.post('/deleteAppUsersTable', (req, res) => {
			const AppUser = app.models.AppUser;
			const User = app.models.User;
			const appUserId = req.body.id;
			const email = req.body.email;

			let condition = {};
			if (appUserId) {
			condition = { id: appUserId };
			} else if (email) {
			condition = { EmailId: email };
			}

			AppUser.findOne({ where: condition }, (appUserError, appUser) => {
				if (appUserError) {
					console.error('Error finding app user:', appUserError);
					return res.status(500).send('Internal server error');
				}

				if (!appUser) {
					return res.status(404).send('AppUser not found');
				}

				const technicalId = appUser.TechnicalId;
				
				appUser.remove((removeAppUserError) => {
					if (removeAppUserError) {
						console.error('Error deleting app user:', removeAppUserError);
						return res.status(500).send('Internal server error');
					}

					User.findOne({ where: { id: technicalId } }, (userError, user) => {
						if (userError) {
							console.error('Error finding user:', userError);
							return res.status(500).send('Internal server error');
						}

						if (!user) {
							return res.status(404).send('User not found');
						}

						user.remove((removeUserError) => {
							if (removeUserError) {
								console.error('Error deleting user:', removeUserError);
								return res.status(500).send('Internal server error');
							}

							res.status(200).json({
								message: 'User deleted successfully from both tables'
							});
						});
					});
				});
			});
		});


		// Only one time use --> Delete Orphans(Created by Lakshay)
		app.post('/orphansDelete', (req, res) => {
			const Job = app.models.Job;
			const attachmentTable = app.models.Attachments;
			var jobsData = [];				//Pushing Job data only with jobcardNo and attachments.
			var totalAttachments = [];		//Total attachments present in application
			var attachmentArray = [];		//pushing attachment that are linked with jobid
			var availableAttachments = [];		//attachment in which data is present that linked with particular job.
			let orphans = [];
			//unused attachments = total-used attachments.

			Job.find({
				include: {
					relation: 'JobStatus'
				}
			}, (error, jobs) => {
				if (error) {
					return;
				}
				if (jobs) {
					jobs.forEach((job) => {
						// Payload for single job as object.
						let jobPayload = {
							jobCardNo: job.jobCardNo,
							PoAttach: job.PoAttach + 'PoNo',   // Assuming PoAttach is a field in the Job model
							artworkCode: job.artworkCode + 'ArtworkNo',   // Assuming artworkCode is a field in the Job model
							InvNo: job.JobStatus() && job.JobStatus().length > 0
								? job.JobStatus()[0].InvNo.split(',').map(inv => inv + 'InvNo') : '',   // Check if JobStatus exists before accessing
							DeliveryNo: job.JobStatus() && job.JobStatus().length > 0
								? job.JobStatus()[0].DeliveryNo.split(',').map(del => del + 'DelNo') : '' // Similar check for DeliveryNo
						};
						jobsData.push(jobPayload);		//Pushing one by one payload in jobsData array.
					})

					// Loop over jobs and push all job attachments in attachmentArray.
					for (let i = 0; i < jobs.length; i++) {
						attachmentArray.push(jobs[i].PoAttach + 'PoNo');
						attachmentArray.push(jobs[i].artworkCode + 'ArtworkNo');
						if (jobs[i].JobStatus() && jobs[i].JobStatus().length > 0) {
							attachmentArray.push(...jobs[i].JobStatus()[0].InvNo.split(',').map(inv => inv + 'InvNo'));
							attachmentArray.push(...jobs[i].JobStatus()[0].DeliveryNo.split(',').map(inv => inv + 'DelNo'));
						}
					}

					// To pass total attachment linked with job and as reponse find available attachments
					attachmentTable.find({
						where: {
							Key: { inq: attachmentArray }
						}
					}, (newError, attachmentGet) => {
						if (newError) {
							return;
						}
						if (attachmentGet.length > 0) {
							attachmentGet.forEach(data => {
								availableAttachments.push(data.Key)
							})
						}

						// Getting total attachments of the application.
						attachmentTable.find((error, att) => {
							if (error) {
								return;
							}
							if (att) {
								if (att.length > 0) {
									att.forEach(data => {
										totalAttachments.push(data.Key);
									})
								}

								orphans = totalAttachments.filter(value => !availableAttachments.includes(value));
								return res.status(200).json(JSON.stringify(orphans));

								// If we want to delete orphan attachments
								// if(orphans.length>0){
								// 	attachmentTable.destroyAll({Key : {inq : orphans}},(error,count)=>{
								// 		if(error){
								// 			return res.status(500).json({ error: 'Internal server error on deleting orphan attachments' })
								// 		}
								// 		if(count){
								// 			return res.status(200).json("Orphans Deleted and count is : " + count);
								// 		}
								// 	})
								// }
							}
						})

					});


				}
			});




		})

		// Company call -- Lakshay
		app.get('/Companies', (req, res) => {
			const company = app.models.Company;
			let companyIds = req.query.companyIds;   

			let filter = {
				order: 'jobCardNo',
				fields: {
					CompanyName: true,
					id: true
				}
			};

			if (companyIds) {
				companyIds = companyIds.split(',').map(id => id.trim());
				filter.where = {
					id: { inq: companyIds }
				};
			}

			company.find(filter, (error, companyDetail) => {
				if (error) {
					console.error(error);
					return res.status(500).json({ error: 'Internal server error' });
				}
				return res.status(200).json(companyDetail);
			});
		});

		
		app.patch('/ExpectedDeliveryDate', async (req, res) => {
			try {
				const Job = app.models.Job;
				const { id, ExpectedDeliveryDate } = req.body;

				if (!id) {
					return res.status(400).json({
						error: 'Job ID is required'
					});
				}

				if (!ExpectedDeliveryDate) {
					return res.status(400).json({
						error: 'ExpectedDeliveryDate is required'
					});
				}

				const job = await Job.findById(id);
				
				if (!job) {
					return res.status(404).json({
						error: 'Job not found'
					});
				}

				job.ExpectedDeliveryDate = ExpectedDeliveryDate;
				
				const updatedJob = await job.save();

				res.status(200).json({
					success: true,
					message: 'ExpectedDeliveryDate updated successfully',
					data: updatedJob
				});

			} catch (error) {
				console.error('Error updating ExpectedDeliveryDate:', error);
				res.status(500).json({
					error: 'Internal server error',
					message: error.message
				});
			}
		});
		app.patch('/onMarkAsUrgent', async (req, res) => {
			try {
				const Job = app.models.Job;
				const { id, Urgent } = req.body;

				if (!id) {
					return res.status(400).json({
						error: 'Job ID is required'
					});
				}

				if (!Urgent) {
					return res.status(400).json({
						error: 'Urgent flag is required'
					});
				}

				const job = await Job.findById(id);
				
				if (!job) {
					return res.status(404).json({
						error: 'Job not found'
					});
				}

				job.Urgent = Urgent;
				
				const updatedJob = await job.save();

				res.status(200).json({
					success: true,
					message: 'Urgent updated successfully',
					data: updatedJob
				});

			} catch (error) {
				console.error('Error updating Urgent:', error);
				res.status(500).json({
					error: 'Internal server error',
					message: error.message
				});
			}
		});

		// Created by Lakshay - Taken Data from Job and Job Status Table
		app.get('/Jobs', (req, res) => {

			// Jobs.jobCardNo ----> Here this is job Id
			const Job = app.models.Job;
			const attachmentTable = app.models.Attachments;
			var payload = [];
			var attachmentArray = [];

			let selectedValues = req.query.selectedValues;
			let filterFields = [];

			if (selectedValues) {
				filterFields = selectedValues.split(',');
			} else {
				// filterFields = ['Client_PO', 'Artwork', 'Delivery_No', 'Invoice_No'];
			}

			Job.find({
				where: {
					status: "Dispatched"
				},
				include: {
					relation: 'JobStatus'
				},
				fields: {
					CompanyId: true,
					JobName: true,
					jobCardNo: true,
					UpdatedOn: true,
					status: true,
					PoAttach: true,
					artworkCode: true,
					JobStatus: true,
					attachmentDeleteInfoJob: true
				}
			}, (error, jobs) => {
				if (error) {
					console.error(error);
					return res.status(500).json({ error: 'No Job Found' });
				}
				if (jobs) {

					jobs.forEach((job) => {
						let jobPayload = {
							companyId: job.CompanyId,
							jobName: job.JobName,
							jobCardNo: job.jobCardNo,
							date: job.UpdatedOn,
							status: job.status
						};

						if (filterFields.includes('Client_PO')) {
							jobPayload.PoAttach = job.PoAttach + 'PoNo';
						}
						if (filterFields.includes('Artwork')) {
							jobPayload.artworkCode = job.artworkCode + 'ArtworkNo';
						}
						if (filterFields.includes('Invoice_No')) {
							jobPayload.InvNo = job.JobStatus() && job.JobStatus().length > 0
								? job.JobStatus()[0].InvNo.split(',').map(inv => inv + 'InvNo') : '';
						}
						if (filterFields.includes('Delivery_No')) {
							jobPayload.DeliveryNo = job.JobStatus() && job.JobStatus().length > 0
								? job.JobStatus()[0].DeliveryNo.split(',').map(del => del + 'DelNo') : '';
						}

						payload.push(jobPayload);
					})
					// return res.status(200).json(payload)
					// for (let i = 0; i < jobs.length; i++) {
					// 	attachmentArray.push(jobs[i].PoAttach + 'PoNo');
					// 	attachmentArray.push(jobs[i].artworkCode + 'ArtworkNo');
					// 	if (jobs[i].JobStatus() && jobs[i].JobStatus().length > 0) {
					// 		attachmentArray.push(...jobs[i].JobStatus()[0].InvNo.split(',').map(inv => inv + 'InvNo'));
					// 		attachmentArray.push(...jobs[i].JobStatus()[0].DeliveryNo.split(',').map(inv => inv + 'DelNo'));
					// 	}
					// }

					// Build attachmentArray ONLY for selected fields
					for (let i = 0; i < jobs.length; i++) {
						if (filterFields.includes('Client_PO')) {
							attachmentArray.push(jobs[i].PoAttach + 'PoNo');
						}
						if (filterFields.includes('Artwork')) {
							attachmentArray.push(jobs[i].artworkCode + 'ArtworkNo');
						}
						if (jobs[i].JobStatus() && jobs[i].JobStatus().length > 0) {
							if (filterFields.includes('Invoice_No')) {
								attachmentArray.push(...jobs[i].JobStatus()[0].InvNo.split(',').map(inv => inv + 'InvNo'));
							}
							if (filterFields.includes('Delivery_No')) {
								attachmentArray.push(...jobs[i].JobStatus()[0].DeliveryNo.split(',').map(inv => inv + 'DelNo'));
							}
						}
					}

					if(filterFields.length !== 0){

						attachmentTable.find({
							where: {
								Key: { inq: attachmentArray }
							},
							fields: {
								Attachment: false
							}
						}, (error, attachmentGet) => {
							if (error) {
								console.error(error);
								return res.status(500).json({ error: 'No Attachments Found' });
							}
							if (attachmentGet.length > 0) {

								const validAttachments = attachmentGet.filter(item => item && item.__data && item.__data.Key);
								
								for (let i = 0; i < payload.length; i++) {
									let flag = false;
									validAttachments.forEach(getData => {
										if (filterFields.includes('Client_PO') && getData.Type == 'PoNo' && payload[i].PoAttach == getData.Key) {
											flag = true;
											return;
										} else if (filterFields.includes('Artwork') && getData.Type == 'ArtworkCode' && payload[i].artworkCode == getData.Key) {
											flag = true;
											return;
										}
										else if (filterFields.includes('Invoice_No') && getData.Type == 'InvNo' && payload[i].InvNo) {
											if (payload[i].InvNo.length > 0) {
												let invArr = payload[i].InvNo;
												invArr.forEach(data => {
													if (data == getData.Key) {
														flag = true;
														return;
													}
												})
											}
										}
										else if (filterFields.includes('Delivery_No') && getData.Type == 'DelNo' && payload[i].DeliveryNo) {
											if (payload[i].DeliveryNo.length > 0) {
												let delArr = payload[i].DeliveryNo;
												delArr.forEach(data => {
													if (data == getData.Key) {
														flag = true;
														return;
													}
												})
											}
										}
									})
									if (flag == false) {
										delete payload[i];
									}
									
									
								}
								payload = payload.filter(payload => payload !== null);
								return res.status(200).json(payload)
							} else {
								return res.status(200).json("No data found with at least one attachment");
							}
						});
					}else{
						return res.status(200).json(payload)
						// return res.status(200).json("No data found with at least one attachment");
					}
				}
			});
		});

		// Delete Attachments Only for New Created Screen by Lakshay.
		app.post('/deleteAttachments', (req, res) => {
			const attachments = app.models.Attachments;
			const job = app.models.Job;
			let requestedPayload = req.body;		//Requested body in json form with jobCardNo and attachment array.
			let totalAttachments = [];				//Empty array to store all attachments.
			let jobIds = [];						//Empty array to store all jobId's

			// For getting email
			const User = app.models.User;		//user's table
			const AccessToken = app.models.AccessToken;		//accesstoken table to provide key for user's table.
			const cookieHeader = req.headers.cookie;		//getting cookies from req header
			const cookies = cookie.parse(cookieHeader);		//Convert in object
			const sessionCookie = cookies.soyuz_session;	//taken sessionCookie -> id of accesstoken



			AccessToken.findOne({ where: { id: sessionCookie } }, (tookenError, accessToken) => {
				let userId = accessToken.userId;		//id of user's table
				User.findOne({ where: { id: userId } }, (userError, user) => {
					if (user) {
						requestedPayload.forEach(data => {
							totalAttachments.push(...data.attachments);		//pushing total attachment get from ui.
							jobIds.push(data.jobCardNo);					//pushing total job id's got from ui.
						})

						// Checking which attachments are present as 'totalAttachments' array as attachment array.
						attachments.find({
							where: {
								Key: {
									inq: totalAttachments
								}
							}

						}, (error, foundedAttachments) => {
							if (error) {
								res.status(500).json('Error');
							}
							let deleteAttachment = [];		//Attachment that we want to delete.
							foundedAttachments.forEach(data => {
								deleteAttachment.push(data.Key)
							})

							// To delete all attachments at a time.
							attachments.destroyAll({
								Key: { inq: deleteAttachment }
							}, (AttachmentError, attachment) => {
								if (AttachmentError) {
									console.error('Error finding Attachment:', AttachmentError);
									return res.status(500).json({ error: 'Internal server error' });
								}
								if (attachment) {
									if (attachment.count == 0) {		//Checking deleted attachment count
										res.status(200).send("Attachments Deleted Successfully");
									} else {

										// Job table as key job id
										job.find({ where: { jobCardNo: { inq: jobIds } } }, (err, jobInstances) => {
											if (err) {
												console.error('Error finding jobs:', err);
												return;
											}

											if (!jobInstances || jobInstances.length === 0) {
												console.error('No jobs found for the provided IDs');
												return;
											}

											// Here 'i' is declared to check one by one requested payload and assign new field value according to it for particular job.
											let i = 0;
											// Step 2: Update the specific field for each job instance
											jobInstances.forEach(jobInstance => {
												let deleteattachmentInfo = jobInstance.attachmentDeleteInfoJob // getting 'attachmentDeleteInfoJob' for particular job
												let payload = {
													attachments: [...new Set(deleteAttachment)].filter(item => new Set(requestedPayload[i].attachments).has(item)),		//filter only deleted attachment for particular job.
													emailId: user.email,
													time: new Date()
												}
												i++;
												if (deleteattachmentInfo == null || deleteattachmentInfo == "null") {		//Case of no data present in field 
													var result = payload;
												} else {
													var result = deleteattachmentInfo.split()		//data present in field then convert field string to array.	
													result.push(payload);
												}
												result = JSON.stringify(result);		//again covert into string.

												// Step 3: Save the updated job instances
												job.updateAll(
													{ jobCardNo: jobInstance.jobCardNo }, // Filter to select jobs by IDs
													{ attachmentDeleteInfoJob: result }, // Update the specific field
													(err, info) => {
														if (err) {
															console.error('Error updating jobs:', err);
															return;
														}
													}
												);
											});
											res.status(200).send("Attachments Deleted Successfully");


										});
									}
								}
								// res.status(200).send("Attachments Deleted Successfully");
							})
						})



					}
				})
			})



		});

		//* Delete job and job status using jobCardNo
		// Delete Job,job status and their attachments using id--.jobcardNo:Lakshay
		// app.post('/deleteJobsWithJobStatus', (req, res) => {
		// 	const Job = app.models.Job;		//Getting Job table
		// 	const attachments = app.models.Attachments;    //Getting Job table
		// 	const id = req.body;		//Getting id as job-card no
		// 	var attachmentArray = [];	//array for storing attachment linked with job

		// 	// For Validation only to check same attachments are not present in other Jobs.
		// 	// let response;
		// 	// let allAttachments = [];
		// 	let restAllJobsObject = {};			//Here we store all attachment without our current job Id.
		// 	Job.find({
		// 		include: {
		// 			relation: 'JobStatus'		//hasMany Relation with JobStatus table
		// 		}
		// 	}, (err, response) => {
		// 		if (err) {
		// 			console.log('Error');
		// 		}
		// 		// Response as all job with jobstatus
		// 		if (response) {
		// 			response.forEach(data => {
		// 				let attachments = [];
		// 				if (!(data.jobCardNo === id)) {
		// 					attachments.push(data.PoAttach + 'PoNo');
		// 					attachments.push(data.artworkCode + 'ArtworkNo');
		// 					if (data.JobStatus && data.JobStatus().length > 0) {
		// 						if (data.JobStatus()['0'].InvNo) {	//check inv no is present or not
		// 							attachments.push(...data.JobStatus()['0'].InvNo.split(',').map(inv => inv + 'InvNo'));	//using spred operator if multiple entries then push all in attachment array
		// 						}
		// 						if (data.JobStatus()['0'].DeliveryNo) {		//check del no is present or not
		// 							attachments.push(...data.JobStatus()['0'].DeliveryNo.split(',').map(del => del + 'DelNo'));	//using spred operator if multiple entries then push all in attachment array
		// 						}
		// 					}
		// 					restAllJobsObject[data.jobCardNo] = attachments;
		// 				} else {
		// 					attachmentArray.push(data.PoAttach + 'PoNo');
		// 					attachmentArray.push(data.artworkCode + 'ArtworkNo');
		// 					if (data.JobStatus && data.JobStatus().length > 0) {
		// 						if (data.JobStatus()['0'].InvNo) {	//check inv no is present or not
		// 							attachmentArray.push(...data.JobStatus()['0'].InvNo.split(',').map(inv => inv + 'InvNo'));	//using spred operator if multiple entries then push all in attachment array
		// 						}
		// 						if (data.JobStatus()['0'].DeliveryNo) {		//check del no is present or not
		// 							attachmentArray.push(...data.JobStatus()['0'].DeliveryNo.split(',').map(del => del + 'DelNo'));	//using spred operator if multiple entries then push all in attachment array
		// 						}
		// 					}
		// 				}


		// 			})

		// 			// let commonAttachment = [];
		// 			let commonAttachmentObject = {};
		// 			for (let jobId in restAllJobsObject) {
		// 				if (restAllJobsObject.hasOwnProperty(jobId)) {
		// 					let newArray = restAllJobsObject[jobId];

		// 					// Find common values between attachmentArray and sendedArray
		// 					let commonValues = newArray.filter(item => attachmentArray.includes(item));

		// 					// If there are common values, add them to the result object
		// 					if (commonValues.length > 0) {
		// 						commonAttachmentObject[jobId] = commonValues;
		// 					}
		// 				}
		// 			}
		// 			// attachmentArray.forEach(data => {
		// 			// 	if (allAttachments.includes(data)) {
		// 			// 		commonAttachment.push(data);
		// 			// 	}
		// 			// })

		// 			// if (commonAttachment.length > 0) {
		// 			// 	res.status(200).json('Found common attachment in other Jobs : ' + commonAttachment);
		// 			// 	return;
		// 			// }

		// 			// // To show job with attachments
		// 			// if (Object.keys(commonAttachmentObject).length > 0) {
		// 			// 	commonAttachmentObject = JSON.stringify(commonAttachmentObject);
		// 			// 	res.status(207).json(commonAttachmentObject);
		// 			// 	// res.status(501).json('Found common attachment in other Jobs : ' + commonAttachmentObject);
		// 			// 	return;
		// 			// }

		// 			// Remove common attachments from attachmentArray 
		// 			if (Object.keys(commonAttachmentObject).length > 0) {
		// 				let commonAttachmentKeys = [];
		// 				for (let jobId in commonAttachmentObject) {
		// 					commonAttachmentKeys.push(...commonAttachmentObject[jobId]);
		// 				}
		// 				commonAttachmentKeys = [...new Set(commonAttachmentKeys)];
		// 				attachmentArray = attachmentArray.filter(item => !commonAttachmentKeys.includes(item));
		// 			}
		// 		}

		// 		Job.find({
		// 			where: {
		// 				jobCardNo: id			//passing jobcard as id 
		// 			},
		// 			include: {
		// 				relation: 'JobStatus'		//hasMany Relation with JobStatus table
		// 			}
		// 		}, (jobError, jobData) => {		//returs jobTable data of this Id with linked JobStatus
		// 			if (jobError) {		//If error in getting job
		// 				console.error('Error finding job:', jobError);
		// 				return res.status(500).send('Internal server error');
		// 			}
		// 			if (jobData) {		//If job is present
		// 				// if (jobData['0'].PoAttach) {
		// 				// 	attachmentArray.push(jobData['0'].PoAttach + 'PoNo')	//push ClientPo Attachment key in attachment array(key of Attachment Table)
		// 				// }
		// 				// if (jobData['0'].artworkCode) {
		// 				// 	attachmentArray.push(jobData['0'].PoAttach + 'ArtworkNo')	//push artwork Attachment key in attachment array(key of Attachment Table) 
		// 				// }
		// 				// if (jobData['0'].JobStatus && jobData['0'].JobStatus().length > 0) {	//check jobStatus is present or not
		// 				// 	if (jobData['0'].JobStatus()['0'].InvNo) {	//check inv no is present or not
		// 				// 		attachmentArray.push(...jobData['0'].JobStatus()['0'].InvNo.split(',').map(inv => inv + 'InvNo'));	//using spred operator if multiple entries then push all in attachment array
		// 				// 	}
		// 				// 	if (jobData['0'].JobStatus()['0'].DeliveryNo) {		//check del no is present or not
		// 				// 		attachmentArray.push(...jobData['0'].JobStatus()['0'].DeliveryNo.split(',').map(del => del + 'DelNo'));	//using spred operator if multiple entries then push all in attachment array
		// 				// 	}
		// 				// }

		// 				// To delete all attachments at once.
		// 				attachments.destroyAll({
		// 					Key: { inq: attachmentArray }		//pass attachment array as key of attachment table.
		// 				}, (AttachmentError) => {
		// 					if (AttachmentError) {
		// 						console.error('Error finding Attachment:', AttachmentError);
		// 						return res.status(500).json({ error: 'Internal server error' });
		// 					}
		// 				});

		// 				// Removing job and job status
		// 				let jobsRemoved = 0;
		// 				jobData.forEach((job) => {
		// 					job.remove((removeError) => {
		// 						if (removeError) {
		// 							console.error('Error deleting job:', removeError);
		// 							return res.status(500).send('Error deleting job');
		// 						}
		// 						jobsRemoved++;
		// 						if (jobsRemoved === jobData.length) {
		// 							res.status(200).json('Job deleted successfully');
		// 						}
		// 					});
		// 				});
		// 			}
		// 		})
		// 	});
		// });

		// Modified API to delete multiple jobs with job status and their attachments
		app.post('/deleteJobsWithJobStatus', (req, res) => {
			const Job = app.models.Job;
			const attachments = app.models.Attachments;
			
			let jobIds = Array.isArray(req.body) ? req.body : [req.body];
			
			var allAttachmentArray = [];  // All attachments from selected jobs
			let restAllJobsObject = {};   // Attachments from other jobs

			Job.find({
				include: {
					relation: 'JobStatus'
				}
			}, (err, response) => {
				if (err) {
					console.error('Error finding jobs:', err);
					return res.status(500).send('Internal server error');
				}
				
				if (response) {
					response.forEach(data => {
						let attachments = [];
						
						// Check if this job is NOT in our deletion list
						if (!jobIds.includes(data.jobCardNo)) {
							// Collect attachments from other jobs
							if (data.PoAttach) {
								attachments.push(data.PoAttach + 'PoNo');
							}
							if (data.artworkCode) {
								attachments.push(data.artworkCode + 'ArtworkNo');
							}
							if (data.JobStatus && data.JobStatus().length > 0) {
								if (data.JobStatus()['0'].InvNo) {
									attachments.push(...data.JobStatus()['0'].InvNo.split(',').map(inv => inv + 'InvNo'));
								}
								if (data.JobStatus()['0'].DeliveryNo) {
									attachments.push(...data.JobStatus()['0'].DeliveryNo.split(',').map(del => del + 'DelNo'));
								}
							}
							restAllJobsObject[data.jobCardNo] = attachments;
						} else {
							// Collect attachments from jobs to be deleted
							if (data.PoAttach) {
								allAttachmentArray.push(data.PoAttach + 'PoNo');
							}
							if (data.artworkCode) {
								allAttachmentArray.push(data.artworkCode + 'ArtworkNo');
							}
							if (data.JobStatus && data.JobStatus().length > 0) {
								if (data.JobStatus()['0'].InvNo) {
									allAttachmentArray.push(...data.JobStatus()['0'].InvNo.split(',').map(inv => inv + 'InvNo'));
								}
								if (data.JobStatus()['0'].DeliveryNo) {
									allAttachmentArray.push(...data.JobStatus()['0'].DeliveryNo.split(',').map(del => del + 'DelNo'));
								}
							}
						}
					});

					// Find common attachments
					let commonAttachmentObject = {};
					for (let jobId in restAllJobsObject) {
						if (restAllJobsObject.hasOwnProperty(jobId)) {
							let newArray = restAllJobsObject[jobId];
							let commonValues = newArray.filter(item => allAttachmentArray.includes(item));
							
							if (commonValues.length > 0) {
								commonAttachmentObject[jobId] = commonValues;
							}
						}
					}

					// Remove common attachments from deletion list
					if (Object.keys(commonAttachmentObject).length > 0) {
						let commonAttachmentKeys = [];
						for (let jobId in commonAttachmentObject) {
							commonAttachmentKeys.push(...commonAttachmentObject[jobId]);
						}
						commonAttachmentKeys = [...new Set(commonAttachmentKeys)];
						allAttachmentArray = allAttachmentArray.filter(item => !commonAttachmentKeys.includes(item));
					}
				}

				// Find all jobs to delete
				Job.find({
					where: {
						jobCardNo: { inq: jobIds }
					},
					include: {
						relation: 'JobStatus'
					}
				}, (jobError, jobData) => {
					if (jobError) {
						console.error('Error finding jobs:', jobError);
						return res.status(500).send('Internal server error');
					}
					
					if (!jobData || jobData.length === 0) {
						return res.status(404).json({ error: 'No jobs found' });
					}

					// Delete attachments
					attachments.destroyAll({
						Key: { inq: allAttachmentArray }
					}, (AttachmentError) => {
						if (AttachmentError) {
							console.error('Error deleting attachments:', AttachmentError);
							return res.status(500).json({ error: 'Error deleting attachments' });
						}
					});

					// Delete all jobs
					let jobsRemoved = 0;
					let totalJobs = jobData.length;
					
					jobData.forEach((job) => {
						job.remove((removeError) => {
							if (removeError) {
								console.error('Error deleting job:', removeError);
								return res.status(500).send('Error deleting job: ' + job.jobCardNo);
							}
							
							jobsRemoved++;
							
							// Send response only after all jobs are deleted
							if (jobsRemoved === totalJobs) {
								res.status(200).json({
									success: true,
									message: `${jobsRemoved} job(s) deleted successfully`,
									deleted: jobsRemoved
								});
							}
						});
					});
				});
			});
		});

		app.post('/deleteJobsWithCompanyId', (req, res) => {
			const Job = app.models.Job;	
			const companyId = req.body;   

			if (!companyId) {
				return res.status(400).json({ message: "companyId required hai" });
			}

			Job.destroyAll({ CompanyId: companyId }, (err, info) => {
				if (err) {
				console.error("Error deleting jobs:", err);
				return res.status(500).json({ message: "Error deleting jobs" });
				}

				if (info) {
				return res.status(200).json({
					message: "Jobs deleted successfully",
				});
				}
			});
			});


		app.post('/jobWithCompany', (req, res) => {

		})

		//* Get all users from the AppUser table
		app.get('/Appusers', (req, res) => {
			const AppUser = app.models.AppUser;

			AppUser.find((error, users) => {
				if (error) {
					console.error(error);
					return res.status(500).json({ error: 'Internal server error' });
				}
				res.status(200).json(users);
			});
		});


		// * this post call is responsble for login the registered user into the portal.

		app.post('/login', (req, res) => {
			const User = app.models.User;
			const Param = app.models.Param;
			const AppUser = app.models.AppUser;

			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).json({ error: 'Email and password are required' });
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			if (!emailRegex.test(email)) {
				return res.status(400).json({ error: 'Invalid email format' });
			}

			const data = {
				email,
				password
			};

			User.login(data, (loginError, user) => {
				if (loginError) {
					return res.status(400).json({ error: 'Invalid email or password' });
				}

				AppUser.findOne({ where: { EmailId: email } }, (appUserError, appUser) => {
					if (appUserError) {
						return res.status(400).json({ error: 'Invalid email or password' });
					}

					let tempPass = null;
					let temp = false;

					User.findOne({ where: { email, TempPass: password } }, (tempUserError, tempUser) => {
						if (tempUserError) {
							return res.status(400).json({ error: 'Invalid email or password' });
						}

						if (tempUser) {
							tempPass = tempUser.TempPass;
							temp = true;
						}

						const { id, ttl, created, userId } = user;

						const { Status, Blocked, Role } = appUser;

						return res.status(200).json({ id, Status, Role, ttl, created, userId, Blocked, temp, tempPass });
					});
				});
			});
		});

		// * this post call is use to create the new user via the admin side in the portal.
		app.post('/addUserAdmin', (req, res) => {
			const User = app.models.User;
			const AppUser = app.models.AppUser;

			const newCustomer = {};
			for (const field in req.body) {
				newCustomer[field] = req.body[field];
			}

			const email = newCustomer.EmailId;
			const name = email.substring(0, email.indexOf("@"));
			const requestPass = newCustomer.PassWord;
			const Role = newCustomer.Role;
			const status = newCustomer.Status;

			let password = requestPass;
			if (!requestPass) {
				password = generateRandomPassword();
			}

			User.findOne({ where: { email } }, (userFindError, userTable) => {
				if (userFindError) {
					console.error(userFindError);
					return res.status(500).json({ error: 'Internal server error' });
				}

				if (!userTable) {
					User.create({ email, TempPass: password, password, Role, CreatedOn: new Date(), status }, (createUserError, newUser) => {
						if (createUserError) {
							console.error(createUserError);
							return res.status(500).json({ error: 'Failed to create customer' });
						}

						AppUser.findOne({ where: { EmailId: email } }, (appUserFindError, AppUuser) => {
							if (appUserFindError) {
								console.error(appUserFindError);
								return res.status(500).json({ error: 'Internal server error' });
							}

							if (!AppUuser) {
								AppUser.create({
									TechnicalId: newUser.id,
									EmailId: email,
									UserName: name,
									CreatedOn: new Date(),
									Status: status,
									Role: Role
								}, (createAppUserError) => {
									if (createAppUserError) {
										console.error(createAppUserError);
										return res.status(500).json({ error: 'Failed to create customer' });
									}

									const replacements = {
										email: "noreply@aeonproducts.com",
										user: email,
										link: `${req.headers.referer}`,
										password: password,
									};
									const templateFileName = "NewUser.html";
									const emailSubject = "[Confidential]Aeon Products Customer Portal Registration";
									const token = "";

									sendEmail(email, token, replacements, templateFileName, emailSubject)
										.then(() => {
											return res.status(200).json('Customer created successfully');
										})
										.catch(sendEmailError => {
											console.error(sendEmailError);
											return res.status(500).json({ error: 'Failed to create customer' });
										});
								});
							} else {
								return res.status(400).json("User Already Exists with this email address");
							}
						});
					});
				} else {
					return res.status(400).json("User Already Exists with this email address");
				}
			});
		});

		// * this fucntion is generating the Random password for the user if admin doesn't set any password.
		function generateRandomPassword() {
			const length = 8;
			const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
			let password = '';
			for (let i = 0; i < length; i++) {
				const randomIndex = Math.floor(Math.random() * charset.length);
				password += charset.charAt(randomIndex);
			}
			return password;
		}


		app.get('/getUserRole', (req, res) => {

			// models data
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			this.AccessToken = app.models.AccessToken;

			const cookieHeader = req.headers.cookie;
			// Parse the cookie string and extract the value of 'soyuz_session'
			var cookies = {};
			if(cookieHeader){
				cookies = cookie.parse(cookieHeader);
			}
			const sessionCookie = cookies.soyuz_session || req.query.access_token;

			if (!sessionCookie) {
				return res.status(404).json({ error: 'Session not found' });
			}

			this.AccessToken.findOne({ where: { id: sessionCookie } }, (tokenError, accessToken) => {
				if (tokenError) {
					console.error('Error fetching access token:', tokenError);
					return res.status(500).json({ error: 'Internal server error' });
				}

				if (!accessToken) {
					return res.status(404).json({ error: 'Session not found' });
				}

				const { ttl, created, userId } = accessToken;
				let userID = accessToken.userId;

				this.User.findOne({ where: { id: userID } }, (userError, user) => {
					if (userError) {
						console.error('Error fetching user:', userError);
						return res.status(500).json({ error: 'Internal server error' });
					}

					if (!user) {
						return res.status(404).json({ error: 'User not found' });
					}

					this.AppUser.findOne({ where: { EmailId: user.email } }, (appUserError, Appuser) => {
						if (appUserError) {
							console.error('Error fetching AppUser:', appUserError);
							return res.status(500).json({ error: 'Internal server error' });
						}

						if (!Appuser) {
							return res.status(404).json({ error: 'User not found' });
						}

						const { Status, TechnicalId, Role, EmailId, id, CompanyId } = Appuser;
						const responseData = {
							role: { Status, TechnicalId, Role, EmailId, id, CompanyId },
							// Include other relevant data if needed
						};

						res.status(200).json(responseData);
					});
				});
			});
		});


		app.get('/getUserProfileData', (req, res) => {
			// models data
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			this.AccessToken = app.models.AccessToken;

			const cookieHeader = req.headers.cookie;
			// Parse the cookie string and extract the value of 'soyuz_session'
			var cookies = {};
			if(cookieHeader){
				cookies = cookie.parse(cookieHeader);
			}
			const sessionCookie = cookies.soyuz_session || req.query.access_token;
			this.AccessToken.findOne({ where: { id: sessionCookie } }, (tokenError, accessToken) => {
				if (tokenError) {
					console.error('Error fetching access token:', tokenError);
					return res.status(500).json({ error: 'Internal server error' });
				}

				if (!accessToken) {
					return res.status(404).json({ error: 'Session not found' });
				}

				const { ttl, created, userId } = accessToken;
				let userID = accessToken.userId;

				this.User.findOne({ where: { id: userID } }, (userError, user) => {
					if (userError) {
						console.error('Error fetching user:', userError);
						return res.status(500).json({ error: 'Internal server error' });
					}

					if (!user) {
						return res.status(404).json({ error: 'User not found' });
					}

					this.AppUser.findOne({ where: { EmailId: user.email } }, (appUserError, Appuser) => {
						if (appUserError) {
							console.error('Error fetching AppUser:', appUserError);
							return res.status(500).json({ error: 'Internal server error' });
						}

						if (!Appuser) {
							return res.status(404).json({ error: 'User not found' });
						}

						const responseData = {
							Appuser
							// Include other relevant data if needed
						};

						res.status(200).json(responseData);
					});
				});
			});
		});


		// * this is the logout callback. 
		// app.post('/logout', (req, res) => {
		// 	const cookieHeader = req.headers.cookie;
		// 	if(cookieHeader){
		// 		const cookies = cookie.parse(cookieHeader);
		// 		const sessionCookie = cookies.soyuz_session;
		// 	}
		// 	res.clearCookie('soyuz_session');
		// 	res.json({ message: 'Logout successful' });
		// });

		app.post('/logout', (req, res) => {
			this.AccessToken = app.models.AccessToken;

			const cookieHeader = req.headers.cookie;
			let sessionCookie = null;

			if (cookieHeader) {
				const cookies = cookie.parse(cookieHeader);
				sessionCookie = cookies.soyuz_session;
			}

			// agar header me Authorization bheja h
			if (!sessionCookie && req.headers.authorization) {
				sessionCookie = req.headers.authorization.replace("Bearer ", "");
			}

			// agar query param me bheja h
			if (!sessionCookie) {
				sessionCookie = req.query.access_token || req.body.access_token;
			}

			if (!sessionCookie) {
				return res.status(401).json({ error: "Access token missing" });
			}

			// ab AccessToken delete karo
			this.AccessToken.destroyAll({ id: sessionCookie }, (err, info) => {
				if (err) {
					console.error("Error deleting token:", err);
					return res.status(500).json({ error: "Failed to logout" });
				}

				if (info.count === 0) {
					return res.status(404).json({ error: "Session not found" });
				}

				// cookie bhi clear karna ho to:
				res.clearCookie("soyuz_session");

				return res.status(200).json({ message: "Logout successful" });
			});
		});




		// * this call is for update the password of the user when he login with the temp password.

		app.post('/updatePassword', (req, res) => {
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;

			const { email, password, newPassword } = req.body;

			this.User.findOne({ where: { email, TempPass: password } }, (findError, tempUser) => {
				if (findError) {
					console.error('Error finding user:', findError);
					return res.status(500).send('Internal server error');
				}

				if (tempUser) {
					tempUser.updateAttributes({ password: newPassword }, (updateError, updatedUser) => {
						if (updateError) {
							console.error('Error updating password:', updateError);
							return res.status(500).send('Internal server error');
						}

						return res.status(200).send('Password updated successfully');
					});
				} else {
					return res.status(400).send('Invalid email or password');
				}
			});
		});


		app.post('/jobStatusData', (req, res) => {
			const JobStatus = app.models.JobStatus;
			const { jobId } = req.body;

			try {
				JobStatus.find(
					{
						where: {
							JobStatusId: jobId
						}
					}, (jobStatusError, jobStatusData) => {
						if (jobStatusError) {
							console.error(jobStatusError);
							return res.status(500).json({ error: 'Internal server error' });
						}

						res.status(200).json(jobStatusData);
					});
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});


		app.post('/getSumOfJobStatus', (req, res) => {
			const JobStatus = app.models.JobStatus;
			const Job = app.models.Job;
			const { jobId } = req.body;
			const oSumOfData = {
				"Coating": 0,
				"Printing": 0,
				"Punching": 0,
				"Foiling": 0,
				"Embossing": 0,
				"Pasting": 0,
				"spotUV": 0,
				"Packing": 0,
				"rawMaterial": "",
				"InvNo": [],
				"DeliveryNo": []
			};

			try {
				JobStatus.find({ where: { JobStatusId: jobId } }, (jobStatusError, jobStatusData) => {
					if (jobStatusError) {
						console.error(jobStatusError);
						return res.status(500).json({ error: 'Internal server error' });
					}

					for (let i = 0; i < jobStatusData.length; i++) {
						oSumOfData.Coating += jobStatusData[i].Coating;
						oSumOfData.Printing += jobStatusData[i].Printing;
						oSumOfData.Punching += jobStatusData[i].Punching;
						oSumOfData.Foiling += jobStatusData[i].Foiling;
						oSumOfData.Embossing += jobStatusData[i].Embossing;
						oSumOfData.Pasting += jobStatusData[i].Pasting;
						oSumOfData.spotUV += jobStatusData[i].spotUV;
						oSumOfData.Packing += jobStatusData[i].Packing;
						oSumOfData.rawMaterial = jobStatusData[i].rawMaterial;

						if (jobStatusData[i].InvNo) {
							oSumOfData.InvNo.push({
								InvNo: jobStatusData[i].InvNo,
								attachment: jobStatusData[i].incAttachment
							});
						}
						if (jobStatusData[i].DeliveryNo) {
							oSumOfData.DeliveryNo.push({
								DeliveryNo: jobStatusData[i].DeliveryNo,
								attachment: jobStatusData[i].deliveryAttachment
							});
						}
					}

					const array = [oSumOfData];
					res.status(200).json(array);
				});
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});


		app.post('/getJobsWithCompany', function (req, res) {
			try {
				const Job = app.models.Job;
				var payload = req.body;
				// var selectedYear = payload.selectedYear;
				var maxDate = payload.maxDate;
				var minDate = payload.minDate;
				var status = payload.status;
				// var selectedYear = selectedYear.toString();
				// var oFilter = {
				// 	and: [
				// 		{ CompanyId: { neq: null } },
				// 		{ date: { lte: maxDate } },
				// 		{ date: { gte: minDate } },
				// 	]};
				// 	if (payload.State) {
				// 	oFilter.and.push({ status: { nlike: "Dispatched" } 
				// 	});
				// }

				var oFilter = {
					and: [
						{ CompanyId: { neq: null } }
					]
				};

				if (minDate && maxDate) {
					oFilter.and.push({ date: { gte: minDate } });
					oFilter.and.push({ date: { lte: maxDate } });
				}
				if (status !== null && status) {
					oFilter.and.push({ status: { like: status } });
				}
				if (payload.State) {
					oFilter.and.push({ status: { nlike: "Dispatched" }});
					oFilter.and.push({ status: { nlike: "Value Mismatched" }});
				}
				if (payload.nonValueMismatched) {
					oFilter.and.push({ status: { like: "Value Mismatched" }});
				}

				Job.find({
					order: 'jobCardNo',
					fields: {
						JobName: false,
						UpdatedOn: false,
						CreatedOn: false,
						// date:false,
						poAttachment: false,
						artworkAttachment: false,
						poNo: false,
						artworkCode: false,
						clientPONo: false,
						industry: false,
						cartonType: false,
						qtyPcs: false,
						PaperGSM: false,
						paperPoNo: false,
						paperQuality: false,
						printing: false,
						color: false,
						sizeL: false,
						sizeW: false,
						sizeH: false,
						varLmt: false,
						effects: false,
						lock: false,
						tF: false,
						pF: false,
						doubleCut: false,
						trimTF: false,
						trimPF: false,
						noOfUps1: false,
						noOfUps2: false,
						noOfUps3: false,
						noOfSheets1: false,
						noOfSheets2: false,
						wastage: false,
						wtKgs: false,
						printingSheetSizeL1: false,
						printingSheetSizeW1: false,
						printingSheetSizeL2: false,
						printingMachine: false,
						punchingMachine: false,
						pastingMachine: false,
						ref: false,
						old: false,
						none: false,
						b2A: false,
						none1: false,
						none2: false,
						batchNo: false,
						mfgDate: false,
						expDate: false,
						correctionsInArtwork: false,
						remarks: false,
						totalAB: false,
						profit: false,
						totalCostOfJob: false,
						costPerPc: false,
						plate: false,
						plate1: false,
						plate2: false,
						pantoneInks: false,
						foilBlocks: false,
						positive: false,
						embossBlock: false,
						punch: false,
						punch1: false,
						punch2: false,
						reference: false,
						cartonLength: false,
						cartonWidth: false,
						paperCost: false,
						printingCharges: false,
						varnishLamination: false,
						embossing: false,
						punching: false,
						bSOPasting: false,
						lBTOPasting: false,
						packing: false,
						transportation: false,
						total: false,
						plateCharges: false,
						blanketCharges: false,
						userName: false,
						remarks1: false,
						remarks2: false,
						corrections1: false,
						corrections2: false,
						corrections3: false,
					},
					// where: { "CompanyId": { "neq": null } },
					// where: { status: "Dispatched" },

					// where: {
					//     "CompanyId": { "neq": null },
					//     "date": {
					// 		"between": [minDate, maxDate]
					// 	  }
					//   },
					where: oFilter,
					include: [{
						relation: 'Company',
						scope: {
							order: 'id',
							fields: { "CompanyName": true }
						}
					}, {
						relation: 'JobStatus',
						scope: {
							order: 'id',
							fields: {
								"remark1": true,
								"remark2": true,
								"remark3": true
							}
						}
					}
					]
				}, function (err, jobs) {
					if (err) {
						return res.status(500).send(err);
					}
					res.send(jobs);
				});
			} catch (error) {
				return res.status(500).send(error);
			}
		});
		app.get('/getJobsWithCompanyDetails', function (req, res) {
			try {
				const Job = app.models.Job;
				// var payload = req.body;
				// var selectedYear = payload.selectedYear;
				// var maxDate = payload.maxDate;
				// var minDate = payload.minDate;
				// var selectedYear =  selectedYear.toString();
				Job.find({
					order: 'jobCardNo',
					fields: {
						JobName: false,
						UpdatedOn: false,
						CreatedOn: false,
						// date:false,
						poAttachment: false,
						artworkAttachment: false,
						poNo: false,
						artworkCode: false,
						clientPONo: false,
						industry: false,
						cartonType: false,
						qtyPcs: false,
						PaperGSM: false,
						paperPoNo: false,
						paperQuality: false,
						printing: false,
						color: false,
						sizeL: false,
						sizeW: false,
						sizeH: false,
						varLmt: false,
						effects: false,
						lock: false,
						tF: false,
						pF: false,
						doubleCut: false,
						trimTF: false,
						trimPF: false,
						noOfUps1: false,
						noOfUps2: false,
						noOfUps3: false,
						noOfSheets1: false,
						noOfSheets2: false,
						wastage: false,
						wtKgs: false,
						printingSheetSizeL1: false,
						printingSheetSizeW1: false,
						printingSheetSizeL2: false,
						printingMachine: false,
						punchingMachine: false,
						pastingMachine: false,
						ref: false,
						old: false,
						none: false,
						b2A: false,
						none1: false,
						none2: false,
						batchNo: false,
						mfgDate: false,
						expDate: false,
						correctionsInArtwork: false,
						remarks: false,
						totalAB: false,
						profit: false,
						totalCostOfJob: false,
						costPerPc: false,
						plate: false,
						plate1: false,
						plate2: false,
						pantoneInks: false,
						foilBlocks: false,
						positive: false,
						embossBlock: false,
						punch: false,
						punch1: false,
						punch2: false,
						reference: false,
						cartonLength: false,
						cartonWidth: false,
						paperCost: false,
						printingCharges: false,
						varnishLamination: false,
						embossing: false,
						punching: false,
						bSOPasting: false,
						lBTOPasting: false,
						packing: false,
						transportation: false,
						total: false,
						plateCharges: false,
						blanketCharges: false,
						userName: false,
						remarks1: false,
						remarks2: false,
						corrections1: false,
						corrections2: false,
						corrections3: false,
					},
					where: { "CompanyId": { "neq": null } },
					// where: {
					//     "CompanyId": { "neq": null },
					//     "date": {
					// 		"between": [minDate, maxDate]
					// 	  }
					//   },
					//   where: {
					// 	and: [
					// 		{ CompanyId: { neq: null } },
					// 		{ date: { lte: maxDate } },
					// 		{ date: { gte: minDate } }
					// 	]
					// },
					include: [{
						relation: 'Company',
						scope: {
							order: 'id',
							fields: { "CompanyName": true }
						}
					}, {
						relation: 'JobStatus',
						scope: {
							order: 'id',
							fields: {
								"remark1": true,
								"remark2": true,
								"remark3": true
							}
						}
					}
					]
				}, function (err, jobs) {
					if (err) {
						return res.status(500).send(err);
					}
					res.send(jobs);
				});
			} catch (error) {
				return res.status(500).send(error);
			}
		});


		app.post('/selectedDateJobStatus', (req, res) => {

			const Job = app.models.Job;
			const JobStatus = app.models.JobStatus;
			const { CreatedOnStart, CreatedOnEnd, cId } = req.body;

			try {
				const startDate = CreatedOnStart;
				const endDate = CreatedOnEnd;

				var oFilter = {
					and: [
						{ CreatedOn: { gte: startDate } },
						{ CreatedOn: { lte: endDate } }
					]
				};

				if (cId !== null && cId) {
					oFilter.and.push({ CompanyId: cId });
				}

				Job.find(
					{
						order: 'jobCardNo',
						where: oFilter,
						fields: { "JobStatus": true, "CompanyId": true, "jobCardNo": true, "qtyPcs": true, "jobCode": true, "poNo": true, "nameOFTheProduct": true, "paperPoNo": true },
						include: [{
							relation: 'Company',
							scope: {
								order: 'id',
								fields: { "CompanyName": true }
							}
						}, {
							relation: 'JobStatus',
							scope: {
								order: 'id',
								fields: { "Printing": true, "UpdatedOn": true, "rawMaterial": true, "Coating": true, "Foiling": true, "Embossing": true, "InvNo": true, "Pasting": true, "spotUV": true, "Punching": true, "Packing": true, "noOfBoxPerPieces": true, "noOfPiecesToSend": true }
							}
						}]
					},
					(jobError, jobStatusSelectedData) => {
						if (jobError) {
							console.error(jobError);
							return res.status(500).send('Internal server error');
						}
						res.status(200).json(jobStatusSelectedData);
					});
			} catch (error) {
				console.error(error);
				return res.status(500).send('Internal server error');
			}
		});

		app.post('/sendEmailExistUser', (req, res) => {
			const User = app.models.User;
			const AppUser = app.models.AppUser;

			const newCustomer = {};
			for (const field in req.body) {
				newCustomer[field] = req.body[field];
			}

			const EmailId = newCustomer.EmailId;
			const id = newCustomer.TechnicalId;
			let password = newCustomer.password || generateRandomPassword();

			User.findOne({ where: { email: EmailId, id: id } }, (userFindError, userTableUser) => {
				if (userFindError) {
					console.error(userFindError);
					return res.status(500).json({ error: 'Internal server error' });
				}

				AppUser.findOne({ where: { EmailId, TechnicalId: id } }, (appUserFindError, AppUser) => {
					if (appUserFindError) {
						console.error(appUserFindError);
						return res.status(500).json({ error: 'Internal server error' });
					}

					if (userTableUser) {
						userTableUser.updateAttributes({ password: password, TempPass: password }, (updateError, updatedUser) => {
							if (updateError) {
								console.error('Error updating password:', updateError);
								return res.status(500).send('Internal server error');
							}

							const token = "";
							const replacements = {
								email: "noreply@aeonproducts.com",
								user: EmailId,
								password: password,
							};
							const templateFileName = "NewUser.html"
							const emailSubject = "[Confidential]Aeon Products Customer Portal Registration";

							sendEmail(EmailId, token, replacements, templateFileName, emailSubject)
								.then(() => {
									return res.status(200).json('Email sent successfully');
								})
								.catch(sendEmailError => {
									console.error(sendEmailError);
									return res.status(500).json({ error: 'Failed to Send Email' });
								});
						});
					} else {
						return res.status(400).json('User not found');
					}
				});
			});
		});


		// 	this.User = app.models.User;
		// 	this.Param = app.models.Param;
		// 	this.AppUser = app.models.AppUser;
		// 	this.Customer = app.models.Customer;

		// 	const newCustomer = {};
		// 	for (const field in req.body) {
		// 		newCustomer[field] = req.body[field];
		// 	}

		// 	var EmailId = newCustomer.EmailId;
		// 	var id = newCustomer.TechnicalId;
		// 	if (!newCustomer.password) {
		// 		var password = generateRandomPassword();
		// 	} else {
		// 		var password = newCustomer.password;
		// 	}
		// 	try {
		// 		let userTableUser = await this.User.findOne({ where: { email: EmailId, id: id } });
		// 		let AppUser = await this.AppUser.findOne({ where: { EmailId, TechnicalId: id } });
		// 		// let TempPassW = userTableUser.TempPass;
		// 		if (userTableUser) {
		// 			// Update the password in both tables
		// 			userTableUser.updateAttributes({ password: password, TempPass: password }, (err, updatedUser) => {
		// 				if (err) {
		// 					console.error('Error updating password:', err);
		// 					return res.status(500).send('Internal server error');
		// 				}
		// 			});
		// 		};
		// 		const token = "";
		// 		const replacements = {
		// 			// 	// verify : `${req.headers.referer}#/updatePassword/${token}`,
		// 			email: "noreply@aeonproducts.com",
		// 			user: EmailId,
		// 			password: password,
		// 		};
		// 		const templateFileName = "NewUser.html"
		// 		const emailSubject = "[Confidential]Aeon Products Customer Portal Registration";
		// 		// Send verification email
		// 		await sendEmail(EmailId, token, replacements, templateFileName, emailSubject);

		// 		return res.status(200).json('Email send successfully');
		// 	} catch (error) {
		// 		// Handle error
		// 		return res.status(500).json({ error: 'Failed to Send Email' });
		// 	}
		// });

		app.post('/JobsCustomer', (req, res) => {
			const AppUser = app.models.AppUser;
			const Job = app.models.Job;
			var payload = req.body;
			
			const id = payload.id;
			// var selectedYear = payload.selectedYear;
			var maxDate = payload.maxDate;
			var minDate = payload.minDate;
			var status = payload.status;
			// var selectedYear = selectedYear.toString();
			

			AppUser.findOne({ where: { id } }, (appUserError, AppUser) => {
				if (appUserError) {
					console.error('Error finding user:', appUserError);
					return res.status(500).send('Internal server error');
				}

				if (AppUser) {
					const CompanyId = AppUser.CompanyId;
					if (CompanyId) {
						var oFilter = {
							and: [
								{ CompanyId: { eq: CompanyId } }
							]
						};

						if (minDate && maxDate) {
							oFilter.and.push({ date: { gte: minDate } });
							oFilter.and.push({ date: { lte: maxDate } });
						}
						if (status !== null && status) {
							oFilter.and.push({ status: { like: status } });
						}
						if (payload.State) {
							oFilter.and.push({ status: { nlike: "Dispatched" }});
							oFilter.and.push({ status: { nlike: "Value Mismatched" }});
						}
						if (payload.nonValueMismatched) {
							oFilter.and.push({ status: { like: "Value Mismatched" }});
						}
						Job.find(
							{
								fields: {
									JobName: false,
									UpdatedOn: false,
									CreatedOn: false,
									date: false,
									poAttachment: false,
									artworkAttachment: false,
									poNo: false,
									artworkCode: false,
									clientPONo: false,
									industry: false,
									cartonType: false,
									qtyPcs: false,
									PaperGSM: false,
									paperPoNo: false,
									paperQuality: false,
									printing: false,
									color: false,
									sizeL: false,
									sizeW: false,
									sizeH: false,
									varLmt: false,
									effects: false,
									lock: false,
									tF: false,
									pF: false,
									doubleCut: false,
									trimTF: false,
									trimPF: false,
									noOfUps1: false,
									noOfUps2: false,
									noOfUps3: false,
									noOfSheets1: false,
									noOfSheets2: false,
									wastage: false,
									wtKgs: false,
									printingSheetSizeL1: false,
									printingSheetSizeW1: false,
									printingSheetSizeL2: false,
									printingMachine: false,
									punchingMachine: false,
									pastingMachine: false,
									ref: false,
									old: false,
									none: false,
									b2A: false,
									none1: false,
									none2: false,
									batchNo: false,
									mfgDate: false,
									expDate: false,
									correctionsInArtwork: false,
									remarks: false,
									totalAB: false,
									profit: false,
									totalCostOfJob: false,
									costPerPc: false,
									plate: false,
									plate1: false,
									plate2: false,
									pantoneInks: false,
									foilBlocks: false,
									positive: false,
									embossBlock: false,
									punch: false,
									punch1: false,
									punch2: false,
									reference: false,
									cartonLength: false,
									cartonWidth: false,
									paperCost: false,
									printingCharges: false,
									varnishLamination: false,
									embossing: false,
									punching: false,
									bSOPasting: false,
									lBTOPasting: false,
									packing: false,
									transportation: false,
									total: false,
									plateCharges: false,
									blanketCharges: false,
									userName: false,
									remarks1: false,
									remarks2: false,
									corrections1: false,
									corrections2: false,
									corrections3: false,
								},
								where: oFilter,
								include: 'Company',
							},
							(jobError, Jobs) => {
								if (jobError) {
									console.error('Error finding jobs:', jobError);
									return res.status(500).send('Internal server error');
								}
								return res.status(200).send(Jobs);
							}
						);
					} else {
						return res.status(200).send([]);
					}
				} else {
					return res.status(400).send('User not found');
				}
			});
		});
		app.post('/JobsSalesPerson', (req, res) => {
			const AppUser = app.models.AppUser;
			const Job = app.models.Job;
			var payload = req.body;
			
			const companyId = payload.companyId;
			const id = payload.id;
			// var selectedYear = payload.selectedYear;
			var maxDate = payload.maxDate;
			var minDate = payload.minDate;
			var status = payload.status;
			// var selectedYear = selectedYear.toString();
			

			AppUser.findOne({ where: { id } }, (appUserError, AppUser) => {
				if (appUserError) {
					console.error('Error finding user:', appUserError);
					return res.status(500).send('Internal server error');
				}

				if (AppUser) {
					if (companyId) {
						const ids = companyId?.split(",").map(id => id.trim());
						var oFilter = {
							and: [
								{ CompanyId : { inq: ids } },
							]
						};

						if (minDate && maxDate) {
							oFilter.and.push({ date: { gte: minDate } });
							oFilter.and.push({ date: { lte: maxDate } });
						}
						if (status !== null && status) {
							oFilter.and.push({ status: { like: status } });
						}
						if (payload.State) {
							oFilter.and.push({ status: { nlike: "Dispatched" }});
							oFilter.and.push({ status: { nlike: "Value Mismatched" }});
						}
						if (payload.nonValueMismatched) {
							oFilter.and.push({ status: { like: "Value Mismatched" }});
						}
						Job.find(
							{
								where: oFilter,
								fields: {
									JobName: false,
									UpdatedOn: false,
									CreatedOn: false,
									date: false,
									poAttachment: false,
									artworkAttachment: false,
									poNo: false,
									artworkCode: false,
									clientPONo: false,
									industry: false,
									cartonType: false,
									qtyPcs: false,
									PaperGSM: false,
									paperPoNo: false,
									paperQuality: false,
									printing: false,
									color: false,
									sizeL: false,
									sizeW: false,
									sizeH: false,
									varLmt: false,
									effects: false,
									lock: false,
									tF: false,
									pF: false,
									doubleCut: false,
									trimTF: false,
									trimPF: false,
									noOfUps1: false,
									noOfUps2: false,
									noOfUps3: false,
									noOfSheets1: false,
									noOfSheets2: false,
									wastage: false,
									wtKgs: false,
									printingSheetSizeL1: false,
									printingSheetSizeW1: false,
									printingSheetSizeL2: false,
									printingMachine: false,
									punchingMachine: false,
									pastingMachine: false,
									ref: false,
									old: false,
									none: false,
									b2A: false,
									none1: false,
									none2: false,
									batchNo: false,
									mfgDate: false,
									expDate: false,
									correctionsInArtwork: false,
									remarks: false,
									totalAB: false,
									profit: false,
									totalCostOfJob: false,
									costPerPc: false,
									plate: false,
									plate1: false,
									plate2: false,
									pantoneInks: false,
									foilBlocks: false,
									positive: false,
									embossBlock: false,
									punch: false,
									punch1: false,
									punch2: false,
									reference: false,
									cartonLength: false,
									cartonWidth: false,
									paperCost: false,
									printingCharges: false,
									varnishLamination: false,
									embossing: false,
									punching: false,
									bSOPasting: false,
									lBTOPasting: false,
									packing: false,
									transportation: false,
									total: false,
									plateCharges: false,
									blanketCharges: false,
									userName: false,
									remarks1: false,
									remarks2: false,
									corrections1: false,
									corrections2: false,
									corrections3: false,
								},
								include: 'Company',
							},
							(jobError, Jobs) => {
								if (jobError) {
									console.error('Error finding jobs:', jobError);
									return res.status(500).send('Internal server error');
								}
								return res.status(200).send(Jobs);
							}
						);
					} else {
						return res.status(200).send([]);
					}
				} else {
					return res.status(400).send('User not found');
				}
			});
		});


		app.post('/usersRemove', (req, res) => {
			const userEmail = "dheeraj@soyuztechnologies.com";

			const User = app.models.User;
			const AppUser = app.models.AppUser;

			User.findOne({ email: userEmail })
				.then((user) => {
					if (!user) {
						return res.status(404).send('User not found');
					}

					AppUser.findOne({ email: userEmail, Role: 'Customer' })
						.then((appUser) => {
							if (!appUser) {
								// Delete the user only if the appUser is not found
								user.remove()
									.then(() => {
										return res.status(200).send('User deleted successfully');
									})
									.catch((error) => {
										console.error('Error deleting user:', error);
										return res.status(500).send('Internal server error');
									});
							} else {
								// Delete both the user and appUser
								user.remove()
									.then(() => {
										appUser.remove()
											.then(() => {
												return res.status(200).send('User and AppUser deleted successfully');
											})
											.catch((error) => {
												console.error('Error deleting appUser:', error);
												return res.status(500).send('Internal server error');
											});
									})
									.catch((error) => {
										console.error('Error deleting user:', error);
										return res.status(500).send('Internal server error');
									});
							}
						})
						.catch((error) => {
							console.error('Error finding appUser:', error);
							return res.status(500).send('Internal server error');
						});
				})
				.catch((error) => {
					console.error('Error finding user:', error);
					return res.status(500).send('Internal server error');
				});
		});

		app.get('/getPoSheet', function (req, res) {
			try {
				const PoTable = app.models.PoTable;
				PoTable.find({
					order: 'PoNo',
					fields: {
						PoNo: true,
						SupplierName: true,
						Mill: true,
						QualityOfMaterial: true,
						TypeOfBoard: true,
						Rate: true,
						GSM: true,
						Height: true,
						Width: true,
						Weight: true,
						OpeningStock: true,
						Status: true,
						CreatedOn: true
					},
					where: { "PoNo": { "neq": null } },
					include: [{
						relation: 'UsedSheets',
						scope: {
							order: 'id',
							fields: { 
								"QuantityOfSheets": true, 
								"PoNo": true,
								"JobCardNo": true,
								"id": true,
								"Type": true
							 }
						}
					}]
				}, function (err, jobs) {
					if (err) {
						return res.status(500).send(err);
					}
					res.send(jobs);
				});
			} catch (error) {
				return res.status(500).send(error);
			}
		});
		
		app.get('/getSentEmails', (req,res) => {
			try {
				const SentEmails = app.models.SentEmail;
				SentEmails.find({
					order: 'CreatedOn',
					fields: {
						EMAIL_TO: true,
						EMAIL_CC: true,
						EMAIL_BCC: true,
						EMAIL_SUBJECT: true,
						EMAIL_BODY: true,
						Attachment: true,
						CreatedOn: true
					},
				}, function (err, jobs) {
					if (err) {
						return res.status(500).send(err);
					}
					res.send(jobs);
				});
			} catch (error) {
				return res.status(500).send(error);
			}
		})
		
		app.post('/onSaveUsedSheets', (req, res) => {
			const UsedSheets = app.models.UsedSheets;
			const NewUsedSheets = req.body;

			UsedSheets.create(NewUsedSheets, (err, createdUsedSheets) => {
				if (err) {
					return res.status(500).send(err);
				}
				res.status(201).send(createdUsedSheets);
			});
		});

		app.post('/onUpdatePoStatus', (req, res) => {
			const payload = req.body;
			const PoTable = app.models.PoTable;
			const Job = app.models.Job;
			const JobStatus = app.models.JobStatus;

			const PoNo = payload.PoNo;
			const Status = payload.Status;
			const OpeningStock = payload.ReceivedSheets ? payload.ReceivedSheets : null;

			// first it will update status in PoTable
			PoTable.findOne({ where: { PoNo } }, (poError, poRecord) => {
				if (poError) {
				console.error('Error finding PoTable:', poError);
				return res.status(500).send('Internal server error');
				}

				if (!poRecord) {
				return res.status(404).send('PoTable not found');
				}

				poRecord.updateAttributes({ Status }, async (updateError, updatedPoTable) => {
				if (updateError) {
					console.error('Error updating PoTable:', updateError);
					return res.status(500).send('Internal server error');
				}

				// Now it wil Update all Job's Raw Material to 'In Stock' if status is Received
				if (Status === "MaterialReceived" && OpeningStock !== null) {
					try {
						poRecord.updateAttributes({ OpeningStock }, async (updateError, newUpdatedPoTable) => {
							if (updateError) {
								console.error('Error updating PoTable:', updateError);
								return res.status(500).send('Internal server error');
							}
						})
					// First it will find all jobs which have same PoNo
					const JobList = await Job.find({
						fields: { jobCardNo: true, paperPoNo: true },
						where: { paperPoNo: PoNo }
					});

					if (JobList && JobList.length > 0) {
						const plainJobs = JobList.map(job => job.toJSON());

						const date = new Date().toLocaleDateString("en-US");

						// it will loop all jobs 
						for (const job of plainJobs) {
						const jobCardNo = job.jobCardNo;

						// it will check wether any JobStatus found or not for that jobCardNo
						const existingStatus = await JobStatus.findOne({
							where: { JobStatusId: jobCardNo }
						});

						// if no JobStatus founds then it will create new one 
						if (!existingStatus) {
							const oNewJobStatus = {
								JobStatusId: jobCardNo,
								CreatedOn: date,
								rawMaterial: "In Stock",
							};

							await JobStatus.create(oNewJobStatus);
							console.log(`Created JobStatus for ${jobCardNo}`);
						} else {
							console.log(`JobStatus already exists for ${jobCardNo}`);
						}
						}
					} else {
						console.log("No Jobs found for PoNo:", PoNo);
					}
					} catch (err) {
					console.error("Error processing JobStatus creation:", err);
					return res.status(500).send('Error processing JobStatus creation');
					}
				}

				return res.status(200).send(updatedPoTable);
				});
			});
		});

		app.post('/savePoSheet', (req, res) => {
			const payload = req.body;
			const PoTable = app.models.PoTable;
			const UsedSheets = app.models.UsedSheets;
			const Job = app.models.Job;

			const PoNo = payload.PoNo;

			PoTable.findOne({ where: { PoNo: payload.PoNo } }, (err, existingPo) => {
				if (err) {
					return res.status(500).send('PO No. already exists');
				}

				if (existingPo) {
					return res.status(500).send('PO No. already exists');
				}

				// Create new PO if it doesn't exist
				PoTable.create(payload, (err, createdPoSheet) => {
					if (err) {
						return res.status(500).send('Error creating PO');
					}

					Job.find({
						where: { paperPoNo: PoNo },
						fields: { jobCardNo: true, noOfSheets3: true }
					}, (err, jobs) => {
						if (err) {
							return res.status(500).send('Error finding jobs');
						}

						const usedSheetsData = jobs.map(job => ({
							JobCardNo: job.jobCardNo,
							PoNo: PoNo,
							QuantityOfSheets: -Math.abs(Math.round(Number(job.noOfSheets3))), 
						}));

						UsedSheets.create(usedSheetsData, (err, createdUsedSheets) => {
							if (err) {
								return res.status(500).send('Error creating UsedSheets');
							}
						});
					});

					return res.status(200).json({
						success: true,
						data: createdPoSheet,
						message: "PO created successfully"
					});
				});
			});
		});

		app.post('/updatePoSheet', (req, res) => {
			const payload = req.body;
			const PoTable = app.models.PoTable;

			const PoNo = payload.PoNo;

			const updatedPayload = {
				"SupplierName" : payload.SupplierName,
				"Mill": payload.Mill,
				"QualityOfMaterial" : payload.QualityOfMaterial,
				"TypeOfBoard" : payload.TypeOfBoard,
				"Rate": payload.Rate,
				"GSM": payload.GSM,
				"Height": payload.Height,
				"Width": payload.Width,
				"OpeningStock": payload.OpeningStock
			}

			PoTable.findOne({ where: { PoNo: PoNo } }, (err, existingPo) => {
				if (err) {
					return res.status(500).send('Error finding PO');
				}

				if (!existingPo) {
					return res.status(404).send('PO not found');
				}

				// Update existing PO
				existingPo.updateAttributes(updatedPayload, (err, updatedPoSheet) => {
					if (err) {
						return res.status(500).send('Error updating PO');
					}

					return res.status(200).json({
						success: true,
						data: updatedPoSheet,
						message: "PO updated successfully"
					});
				});
			});
		});

		app.post('/updateAncillaryPartStatus', (req, res) => {
			const payload = req.body;
			const Job = app.models.Job;
			const jobId = payload.JobId;

			if (!jobId) {
				return res.status(400).json({
					error: {
						statusCode: 400,
						message: "JobId is required"
					}
				});
			}

			// First check if job exists
			Job.findById(jobId, (err, job) => {
				if (err) {
					return res.status(500).json({
						error: {
							statusCode: 500,
							message: err.message || "Error finding job"
						}
					});
				}

				if (!job) {
					return res.status(404).json({
						error: {
							statusCode: 404,
							message: "Job not found"
						}
					});
				}

				// Update ancillary part statuses (fields will be created if they don't exist)
				var updateData = {
					plateStatus: payload.plateStatus,
					pantoneInksPartStatus: payload.pantoneInksPartStatus,
					foilBlocksPartStatus: payload.foilBlocksPartStatus,
					positivePartStatus: payload.positivePartStatus,
					embossBlockPartStatus: payload.embossBlockPartStatus,
					punchPartStatus: payload.punchPartStatus
				};
				

				// Update the job
				job.updateAttributes(updateData, (err, updatedJob) => {
					if (err) {
						return res.status(500).json({
							error: {
								statusCode: 500,
								message: err.message || "Error updating job"
							}
						});
					}

					return res.status(200).json({
						success: true,
						message: "Ancillary part statuses updated successfully",
						data: updatedJob
					});
				});
			});
		});

		app.post('/onTransferPoSheets', (req, res) => {
			const payload = req.body;
			const UsedSheets = app.models.UsedSheets;

			const FromPoNo = payload.FromPoNo;
			const ToPoNo = payload.ToPoNo;
			const TransferSheets = payload.TransferSheets;
			const FromQuantity = Number(TransferSheets.transferFromAmount);
			const ToQuantity = Number(TransferSheets.transferToAmount);

			// Validation
			if (!FromPoNo || !ToPoNo) {
				return res.status(400).json({
					error: {
						statusCode: 400,
						message: "Invalid payload"
					}
				});
			}

			const transferRecords = [
				{
					PoNo: FromPoNo,
					QuantityOfSheets: -Math.abs(FromQuantity),
					Type: "Transfer",
					JobCardNo: "Transfer to PO " + ToPoNo
				},
				{
					PoNo: ToPoNo,
					QuantityOfSheets: ToQuantity,
					Type: "Transfer",
					JobCardNo: "Transfer from PO " + FromPoNo
				}
			];

			UsedSheets.create(transferRecords, (error, createdRecords) => {
				if (error) {
					return res.status(500).json({
						error: {
							statusCode: 500,
							message: 'Error transferring sheets'
						}
					});
				}
				
				return res.status(200).json({
					success: true,
					message: `Successfully transferred ${TransferSheets} sheets from ${FromPoNo} to ${ToPoNo}`,
					records: createdRecords
				});
			});
		});

		app.post('/onSplitPoSheets', (req, res) => {
			var payload = req.body;
			const PoTable = app.models.PoTable;
			const UsedSheets = app.models.UsedSheets;
			const QuantityOfSheets = Number(payload.QuantityOfSheets);
			
			for(let i = 0; i < 2; i++) {
				var poData = {
					PoNo: payload.NewPoNo[i],
					SupplierName: payload.SelectedPo.SupplierName || "",
					Mill: payload.SelectedPo.Mill || "",
					QualityOfMaterial: payload.SelectedPo.QualityOfMaterial || "",
					TypeOfBoard: payload.SelectedPo.TypeOfBoard || "",
					Rate: payload.SelectedPo.Rate || 0,
					GSM: payload.SelectedPo.GSM || 0,
					Height: Number(payload.Height[i]) || 0,
					Width: Number(payload.Width[i]) || 0,
					OpeningStock: QuantityOfSheets || 0,
					Status: "Received",
					CreatedBy: payload.userId
				};
				
				PoTable.create(poData, (err, createdPoSheet) => {
					if (err && !hasError) {
						hasError = true;
						return res.status(500).send('Error creating PO');
					}
				});

				var usedSheetsData = {
					JobCardNo: "Split from PO " + payload.SelectedPo.PoNo,
					PoNo: payload.NewPoNo[i],
					QuantityOfSheets: QuantityOfSheets,
					Type: "Split"
				};
				
				UsedSheets.create(usedSheetsData, (err, createdUsedSheets) => {
					if (err && !hasError) {
						hasError = true;
						return res.status(500).send('Error creating UsedSheets');
					}
				});
			}
			// PoTable.findOne({ where: { PoNo: payload.SelectedPo.PoNo } }, (err, existingPo) => {
			// 	if (err && !hasError) {
			// 		hasError = true;
			// 		return res.status(500).send('Error finding existing PO');
			// 	}
			// 	const updatedOpeningStock = Number(existingPo.OpeningStock) - Number(payload.QuantityOfSheets);
			// 	existingPo.updateAttributes({ OpeningStock: updatedOpeningStock }, (updateError, updatedPoTable) => {
			// 		if (updateError && !hasError) {
			// 			hasError = true;
			// 			return res.status(500).send('Error updating existing PO');
			// 		}	
			// 	});
			// });

			var selectedUsedSheets = {
				PoNo: payload.SelectedPo.PoNo,
				JobCardNo: "Split to PO " + payload.NewPoNo[0] + " and " + payload.NewPoNo[1],
				QuantityOfSheets: -Math.abs(QuantityOfSheets),
				Type: "Split"
			}
			UsedSheets.create(selectedUsedSheets, (usedSheetsError, createdUsedSheets) => {
				if (usedSheetsError && !hasError) {
					hasError = true;
					return res.status(500).send('Error logging used sheets for existing PO');
				}
			});
			return res.status(200).send("POs created successfully");
		});

		app.post('/deletePoSheet', (req, res) => {
			const payload = req.body;
			const PoTable = app.models.PoTable;
			const UsedSheets = app.models.UsedSheets;

			const PoNo = payload.PoNo;

			// Delete PO from PoTable
			PoTable.destroyById(PoNo, (err) => {
				if (err) {
					return res.status(500).send('Error deleting PO');
				}

				// Delete all UsedSheets with same PoNo
				UsedSheets.destroyAll({ PoNo: { like : PoNo } }, (err) => { 
					if (err) {
						return res.status(500).send('Error deleting UsedSheets');
					}

					return res.status(200).json({
						success: true,
						message: "PO and associated UsedSheets deleted successfully"
					});
				});
			});
		});

		// app.post('/markAsReadNotification', async (req, res) => {
		// 	try {
		// 		const payload = req.body;
		// 		const Notification = app.models.Notifications;
				
		// 		// Extract IDs from NotificationId array
		// 		const notificationIds = payload.NotificationId.map(item => item.id);
				
		// 		if (!notificationIds || notificationIds.length === 0) {
		// 			return res.status(400).json({
		// 				success: false,
		// 				message: "No notification IDs provided"
		// 			});
		// 		}
				
		// 		// First, fetch the notifications to get existing ReadBy values
		// 		const notifications = await Notification.find({
		// 			where: { id: { inq: notificationIds } }
		// 		});
				
		// 		// Update each notification by appending ReadBy
		// 		const updatePromises = notifications.map(notification => {
		// 			let existingReadBy = notification.ReadBy || "";
		// 			let newReadBy = payload.ReadBy;
					
		// 			// Check if user already in ReadBy list
		// 			if (!existingReadBy.includes(newReadBy)) {
		// 				// Append new ReadBy with comma separator
		// 				let updatedReadBy = existingReadBy 
		// 					? existingReadBy + "," + newReadBy 
		// 					: newReadBy;
						
		// 				return Notification.updateAll(
		// 					{ id: notification.id },
		// 					{ ReadBy: updatedReadBy }
		// 				);
		// 			}
		// 			return Promise.resolve(); // Already read by this user
		// 		});
				
		// 		await Promise.all(updatePromises);
				
		// 		return res.status(200).json({
		// 			success: true,
		// 			message: `${notificationIds.length} notification(s) marked as read successfully`,
		// 			count: notificationIds.length
		// 		});
				
		// 	} catch (err) {
		// 		console.error("Error marking notification as read:", err);
		// 		return res.status(500).json({
		// 			success: false,
		// 			message: 'Error marking notification as read',
		// 			error: err.message
		// 		});
		// 	}
		// });

		app.post('/markAsReadNotification', async (req, res) => {
			try {
				const payload = req.body;
				const Notification = app.models.Notifications;
				
				const notificationIds = payload.NotificationId.map(item => item.id);
				const newReadBy = String(payload.ReadBy);
				
				if (!notificationIds || notificationIds.length === 0) {
					return res.status(400).json({
						success: false,
						message: "No notification IDs provided"
					});
				}
				
				// Ek hi baar fetch karo saari notifications
				const notifications = await Notification.find({
					where: { id: { inq: notificationIds } },
					fields: { id: true, ReadBy: true } // sirf zaruri fields
				});
				
				// Sirf unhe filter karo jisme user already nahi hai
				const toUpdate = notifications.filter(notification => {
					const existingIds = (notification.ReadBy || "")
						.split(',')
						.map(s => s.trim())
						.filter(Boolean);
					return !existingIds.includes(newReadBy); // already read? skip
				});
				
				if (toUpdate.length === 0) {
					return res.status(200).json({
						success: true,
						message: "Already marked as read",
						count: 0
					});
				}
				
				// BATCH of 200 - connection pool safe rahega
				const BATCH_SIZE = 200;
				for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
					const batch = toUpdate.slice(i, i + BATCH_SIZE);
					
					await Promise.all(batch.map(notification => {
						const existingReadBy = notification.ReadBy || "";
						const updatedReadBy = existingReadBy 
							? existingReadBy + "," + newReadBy 
							: newReadBy;
						
						return Notification.updateAll(
							{ id: notification.id },
							{ ReadBy: updatedReadBy, UpdatedOn: new Date() }
						);
					}));
				}
				
				return res.status(200).json({
					success: true,
					message: `${toUpdate.length} notification(s) marked as read successfully`,
					count: toUpdate.length
				});
				
			} catch (err) {
				console.error("Error marking notification as read:", err);
				return res.status(500).json({
					success: false,
					message: 'Error marking notification as read',
					error: err.message
				});
			}
		});

		app.get('/api/Notifications', async (req, res) => {
			try {
				const Notification = app.models.Notifications;
				const userId = req.query.userId;
				const companyId = req.query.companyId;
				const role = req.query.role;
				
				if (!userId) {
					return res.status(400).json({ error: "userId is required" });
				}
				
				let whereCondition = {};
				
				// Build base filter
				if (role === "Admin") {
					whereCondition = {};
				} else {
					whereCondition = { Company: { like: companyId } };
				}
				
				// Fetch all notifications sorted by CreatedOn descending
				const notifications = await Notification.find({ 
					where: whereCondition,
					order: 'CreatedOn DESC'
				});
				
				const unreadNotifications = [];
				const readNotifications = [];
				
				// Separate read and unread notifications
				notifications.forEach(notification => {
					const isRead = notification.ReadBy && 
								notification.ReadBy !== "" && 
								notification.ReadBy.split(',').map(id => id.trim()).includes(userId);
					
					if (isRead) {
						// Add status field
						notification.Status = "Read";
						readNotifications.push(notification);
					} else {
						// Add status field
						notification.Status = "Unread";
						unreadNotifications.push(notification);
					}
				});
				
				// Get last 5 read notifications
				const last5ReadNotifications = readNotifications.slice(0, 5);
				
				// Combine: all unread + last 5 read
				const finalNotifications = [...unreadNotifications, ...last5ReadNotifications];
				
				return res.status(200).json(finalNotifications);
				
			} catch (err) {
				console.error("Error fetching notifications:", err);
				return res.status(500).json({ error: "Error fetching notifications" });
			}
		});

		app.get('/api/Notifications/count', async (req, res) => {
			try {
				const Notification = app.models.Notifications;
				const userId = req.query.userId;
				const companyId = req.query.companyId;
				const role = req.query.role;
				
				if (!userId) {
					return res.status(400).json({ error: "userId is required" });
				}
				
				let whereCondition = {};
				
				if (role === "Admin") {
					whereCondition = {};
				} else {
					whereCondition = { Company: { like: companyId } };
				}
				
				const notifications = await Notification.find({ where: whereCondition });
				
				// Count only unread notifications
				const unreadNotifications = notifications.filter(notification => {
					if (!notification.ReadBy || notification.ReadBy === "") {
						return true;
					}
					const readByArray = notification.ReadBy.split(',').map(id => id.trim());
					return !readByArray.includes(userId);
				});
				
				return res.status(200).json({ count: unreadNotifications.length });
				
			} catch (err) {
				console.error("Error counting notifications:", err);
				return res.status(500).json({ error: "Error counting notifications" });
			}
		});

		app.post('/createUsedSheetsForNewJob', async (req, res) => {
			try {
				const payload = req.body;   // Array of objects
				const PoTable = app.models.PoTable;
				const UsedSheets = app.models.UsedSheets;

				if (!Array.isArray(payload)) {
					return res.status(400).json({ 
						success: false, 
						message: "Payload must be an array of objects" 
					});
				}

				let created = [];
				let skipped = [];

				for (let item of payload) {
					const { PoNo, QuantityOfSheets, JobCardNo, Type } = item;

					var stringPoNo = PoNo.toString();
					// Validate required fields
					if (!stringPoNo) {
						skipped.push({ item });
						continue;
					}

					// Check if PoNo exists in PoTable
					const poExists = await PoTable.findOne({ where: { PoNo: stringPoNo } });

					if (!poExists) {
						skipped.push({ item });
						continue;
					}

					// Create UsedSheets entry
					const createdUsedSheet = await UsedSheets.create({
						PoNo: stringPoNo,
						QuantityOfSheets: -Math.abs(Math.round(Number(QuantityOfSheets))),
						JobCardNo: JobCardNo,
						Type: Type
					});

					created.push(createdUsedSheet);
				}

				return res.status(200).json({
					success: true,
					message: "Process completed"
				});

			} catch (err) {
				console.error("Error creating UsedSheets:", err);
				return res.status(500).json({
					success: false,
					message: "Internal server error",
					error: err
				});
			}
		});



	});
};






// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
	if (err) throw err;

	// start the server if `$ node server.js`
	if (require.main === module)
		app.start();
});
