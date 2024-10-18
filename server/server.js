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
const { log, debug, error } = require('console');
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


function myMiddleware(options) {
	return function (req, res, next) {


		// Save the original send function
		if (req.url.includes("/api/Users/login") || req.url.includes("/login")) {
			var originalSend = res.send;
			res.send = function (body) {
				if (body && JSON.parse(body).id) {
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
			const status = req.body;
			const Job = app.models.Job;

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
					where: { status: status },
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
			debugger
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
		app.post('/deleteAppUsersTable', (req, res) => {
			const AppUser = app.models.AppUser;
			const id = req.body.id;

			AppUser.findOne({ where: { id: id } }, (appUserError, user) => {
				if (appUserError) {
					console.error('Error finding user:', appUserError);
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

		
		// Only one time use --> Delete Orphans(Created by Lakshay)
		app.post('/orphansDelete', (req, res) => {
			const Job = app.models.Job;
			const attachmentTable = app.models.Attachments;
			var payload = [];
			var attachmentArray = [];
			var totalAttachments = [];
			var usedAttachments = [];

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
						let jobPayload = {
							jobCardNo: job.jobCardNo,
							PoAttach: job.PoAttach + 'PoNo',   // Assuming PoAttach is a field in the Job model
							artworkCode: job.artworkCode + 'ArtworkNo',   // Assuming artworkCode is a field in the Job model
							InvNo: job.JobStatus() && job.JobStatus().length > 0
								? job.JobStatus()[0].InvNo.split(',').map(inv => inv + 'InvNo') : '',   // Check if JobStatus exists before accessing
							DeliveryNo: job.JobStatus() && job.JobStatus().length > 0
								? job.JobStatus()[0].DeliveryNo.split(',').map(del => del + 'DelNo') : '' // Similar check for DeliveryNo
						};
						payload.push(jobPayload);
					})
					for (let i = 0; i < jobs.length; i++) {
						attachmentArray.push(jobs[i].PoAttach + 'PoNo');
						attachmentArray.push(jobs[i].artworkCode + 'ArtworkNo');
						if (jobs[i].JobStatus() && jobs[i].JobStatus().length > 0) {
							attachmentArray.push(...jobs[i].JobStatus()[0].InvNo.split(',').map(inv => inv + 'InvNo'));
							attachmentArray.push(...jobs[i].JobStatus()[0].DeliveryNo.split(',').map(inv => inv + 'DelNo'));
						}
					}

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
								usedAttachments.push(data);
							})
						}
					});

					attachmentTable.find((error, att) => {
						if (error) {
							return;
						}
						if (att) {
							totalAttachments.push(att);
						}
					})
				}
			});

			attachmentTable.find((error, att) => {
				if (error) {
					return;
				}
				if (att) {
					att.forEach(data => {
						totalAttachments.push(data);
					})
				}
			})


		})

		// Company call
		app.get('/Companies', (req, res) => {
			const company = app.models.Company;

			company.find((error, companyDetail) => {
				if (error) {
					console.error(error);
					return res.status(500).json({ error: 'Internal server error' });
				}
				if(companyDetail){
					return res.status(200).json(companyDetail);
				}
			});
		});
		// Created by Lakshay - Taken Data from Job and Job Status Table
		app.get('/Jobs', (req, res) => {

			// Jobs.jobCardNo ----> Here this is job Id
			const Job = app.models.Job;
			const attachmentTable = app.models.Attachments;
			var payload = [];
			var attachmentArray = [];

			Job.find({
				where: {
					status: "Dispatched"
				},
				include: {
					relation: 'JobStatus'
				}
			}, (error, jobs) => {
				if (error) {
					console.error(error);
					return res.status(500).json({ error: 'Internal server error' });
				}
				if (jobs) {

					jobs.forEach((job) => {
						let jobPayload = {
							companyId : job.CompanyId,
							jobName: job.JobName,
							jobCardNo: job.jobCardNo,
							date: job.UpdatedOn,
							status: job.status,
							PoAttach: job.PoAttach + 'PoNo',   // Assuming PoAttach is a field in the Job model
							artworkCode: job.artworkCode + 'ArtworkNo',   // Assuming artworkCode is a field in the Job model
							InvNo: job.JobStatus() && job.JobStatus().length > 0
								? job.JobStatus()[0].InvNo.split(',').map(inv => inv + 'InvNo') : '',   // Check if JobStatus exists before accessing
							DeliveryNo: job.JobStatus() && job.JobStatus().length > 0
								? job.JobStatus()[0].DeliveryNo.split(',').map(del => del + 'DelNo') : '' // Similar check for DeliveryNo
						};
						payload.push(jobPayload);
					})
					// return res.status(200).json(payload)
					for (let i = 0; i < jobs.length; i++) {
						attachmentArray.push(jobs[i].PoAttach + 'PoNo');
						attachmentArray.push(jobs[i].artworkCode + 'ArtworkNo');
						if (jobs[i].JobStatus() && jobs[i].JobStatus().length > 0) {
							attachmentArray.push(...jobs[i].JobStatus()[0].InvNo.split(',').map(inv => inv + 'InvNo'));
							attachmentArray.push(...jobs[i].JobStatus()[0].DeliveryNo.split(',').map(inv => inv + 'DelNo'));
						}
					}

					attachmentTable.find({
						where: {
							Key: { inq: attachmentArray }
						}
					}, (error, attachmentGet) => {
						if (error) {
							console.error(error);
							return res.status(500).json({ error: 'Internal server error' });
						}
						if (attachmentGet.length > 0) {

							const validAttachments = attachmentGet.filter(item => item && item.__data && item.__data.Key);

							for (let i = 0; i < payload.length; i++) {
								let flag = false;
								validAttachments.forEach(getData => {
									if (getData.Type == 'PoNo' && payload[i].PoAttach == getData.Key) {
										flag = true;
										return;
									} else if (getData.Type == 'ArtworkCode' && payload[i].artworkCode == getData.Key) {
										flag = true;
										return;
									}
									else if (getData.Type == 'InvNo' && payload[i].InvNo) {
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
									else if (getData.Type == 'DelNo' && payload[i].DeliveryNo) {
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
				}
			});
		});

		// Delete Attachments Only for New Created Screen by Lakshay.
		app.post('/deleteAttachments', (req, res) => {
			const attachments = app.models.Attachments;
			const ids = req.body;

			attachments.destroyAll({
				Key: { inq: ids }
			}, (AttachmentError, attachment) => {
				if (AttachmentError) {
					console.error('Error finding Attachment:', AttachmentError);
					return res.status(500).json({ error: 'Internal server error' });
				}
				if (attachment.count > 0) {
					// If some attachments were deleted
					res.status(200).send("Attachments Deleted Successfully");
				}
			})
		});

		//* Delete job and job status using jobCardNo
		// Delete Job,job status and their attachments using id--.jobcardNo:Lakshay
		app.post('/deleteJobsWithJobStatus', (req, res) => {
			const Job = app.models.Job;		//Getting Job table
			const attachments = app.models.Attachments;    //Getting Job table
			const id = req.body;		//Getting id as job-card no
			var attachmentArray = [];	//array for storing attachment linked with this job

			Job.find({
				where: {
					jobCardNo: id			//passing jobcard as id 
				},
				include: {
					relation: 'JobStatus'		//hasMany Relation with JobStatus table
				}
			}, (jobError, jobData) => {		//returs jobTable data of this Id with linked JobStatus
				if (jobError) {		//If error in getting job
					console.error('Error finding job:', jobError);
					return res.status(500).send('Internal server error');
				}
				if (jobData) {		//If job is present
					if (jobData['0'].PoAttach) {
						attachmentArray.push(jobData['0'].PoAttach + 'PoNo')	//push ClientPo Attachment key in attachment array(key of Attachment Table)
					}
					if (jobData['0'].artworkCode) {
						attachmentArray.push(jobData['0'].PoAttach + 'ArtworkNo')	//push artwork Attachment key in attachment array(key of Attachment Table) 
					}
					if (jobData['0'].JobStatus().length > 0) {	//check jobStatus is present or not
						if (jobData['0'].JobStatus()['0'].InvNo) {	//check inv no is present or not
							attachmentArray.push(...jobData['0'].JobStatus()['0'].InvNo.split(',').map(inv => inv + 'InvNo'));	//using spred operator if multiple entries then push all in attachment array
						}
						if (jobData['0'].JobStatus()['0'].DeliveryNo) {		//check del no is present or not
							attachmentArray.push(...jobData['0'].JobStatus()['0'].DeliveryNo.split(',').map(del => del + 'DelNo'));	//using spred operator if multiple entries then push all in attachment array
						}
					}

					// To delete all attachments at once.
					attachments.destroyAll({
						Key: { inq: attachmentArray }		//pass attachment array as key of attachment table.
					}, (AttachmentError) => {
						if (AttachmentError) {
							console.error('Error finding Attachment:', AttachmentError);
							return res.status(500).json({ error: 'Internal server error' });
						}
					});
					
					// Removing job and job status
					let jobsRemoved = 0;
					jobData.forEach((job) => {
						job.remove((removeError) => {
							if (removeError) {
								console.error('Error deleting job:', removeError);
								return res.status(500).send('Error deleting job');
							}
							jobsRemoved++;
							if (jobsRemoved === jobData.length) {
								res.status(200).json('Job(s) deleted successfully');
							}
						});
					});
				}

			})
		});

		app.post('/jobWithCompany',(req,res)=>{
			
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
			const cookies = cookie.parse(cookieHeader);
			const sessionCookie = cookies.soyuz_session;

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
			const cookies = cookie.parse(cookieHeader);
			const sessionCookie = cookies.soyuz_session;

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
		app.post('/logout', (req, res) => {
			const cookieHeader = req.headers.cookie;
			const cookies = cookie.parse(cookieHeader);
			const sessionCookie = cookies.soyuz_session;
			res.clearCookie('soyuz_session');
			res.json({ message: 'Logout successful' });
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
				var selectedYear = payload.selectedYear;
				var maxDate = payload.maxDate;
				var minDate = payload.minDate;
				var selectedYear = selectedYear.toString();
				if (payload.State) {
					var oFilter = {
						and: [{ status: { nlike: "Dispatched" } }]
					}
				} else {
					var oFilter = {
						and: [
							{ CompanyId: { neq: null } },
							{ date: { lte: maxDate } },
							{ date: { gte: minDate } }
						]
					}
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

				Job.find(
					{
						order: 'jobCardNo',
						where: {
							and: [
								{ CreatedOn: { gte: startDate } },
								{ CreatedOn: { lte: endDate } },
								{ CompanyId: cId }
							]
						},
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
			const { id } = req.body;

			AppUser.findOne({ where: { id } }, (appUserError, AppUser) => {
				if (appUserError) {
					console.error('Error finding user:', appUserError);
					return res.status(500).send('Internal server error');
				}

				if (AppUser) {
					const CompanyId = AppUser.CompanyId;
					if (CompanyId) {
						Job.find(
							{
								where: { CompanyId },
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
