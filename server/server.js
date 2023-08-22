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
const { log, debug } = require('console');
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
		//   if(req.url.includes("/api") || req.url.includes("/odata") ){
		// 	req.headers.Authorization=req.cookies.soyuz_session;
		// 	req.headers.authorization=req.cookies.soyuz_session;
		//   }
		next();

	}
}
app.use(myMiddleware());
app.use(loopback.token({
	model: app.models.accessToken,
	currentUserLiteral: 'me',
	// cookies: ['soyuz_session'],
	// headers: ['soyuz_session', 'X-Access-Token'],
	// params: ['soyuz_session']
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

		app.post('/forgotPasswordEmailVerify', async (req, res) => {

			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			this.otp = app.models.otp;

			try {
				const { email } = req.body;

				// Check if the user already exists
				const existingUser = await this.User.findOne({ where: { email } });
				if (!existingUser) {
					return res.status(400).json({ error: 'Email is not Register with us.' });
				}

				var otp = generateOTP();
				var dateAndTime = generateDateAndTime();
				var ExpDateAndTIme = generateDateAndTimeWithExtraTime();
				// Generate JWT token
				const token = generateToken(email);

				const replacements = {
					"OTP": otp,
					email: "noreply@aeonproducts.com",
					user: email,
				};
				const templateFileName = "Forgot.html"
				const emailSubject = "Reset Your Password";
				// Send verification email
				await sendEmail(email, token, replacements, templateFileName, emailSubject);

				await this.otp.create({ OTP: otp, User: email, CreatedOn: dateAndTime, ExpDate: ExpDateAndTIme });
				res.status(200).json({ message: 'Verification email sent successfully' });
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});

		//*  this post call is verifiing the token when the user try to reset the password

		app.post('/Forgot/verifyToken', async (req, res) => {

			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			try {
				const { token } = req.body;
				var email;
				jwt.verify(token, 'your_secret_key', function (err, decoded) {
					if (err) {
						res.status(500).send('Token is Expired');
					}
					else {
						email = decoded.email;
					}
				});
				// Verify the token and extract the email
				//   const decodedToken = jwt.verify(token, 'your_secret_key');
				//   const email = decodedToken.email;
				// Check if the user already exists
				const existingUser = await this.User.findOne({ where: { email } });
				if (!existingUser) {
					return res.status(400).json({ error: 'User with this email already exists' });
				}
				let msg = "token verfied"
				res.status(200).json({ msg, email });
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});

		// * this post call is update the password into the appuser table and the user table of the user.

		app.post('/reset/password', async (req, res) => {
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			try {
				const { email, password } = req.body;

				const User = await this.User.findOne({ where: { email } });
				if (User) {
					// Update the password in both tables
					User.updateAttributes({ password: password }, (err, updatedUser) => {
						if (err) {
							console.error('Error updating password:', err);
							return res.status(500).send('Internal server error');
						}

						// // Update the password in the AppUser table
						// AppUser.updateAttributes({ TechnicalId: user.id }, { password: newPassword }, (err) => {
						//   if (err) {
						// 	console.error('Error updating password in AppUser table:', err);
						// 	return res.status(500).send('Internal server error');
						//   }

						return res.status(200).send('Password updated successfully');
					});
					//   });
				}



				// // Verify the token
				// const decodedToken = jwt.verify(token, 'your_secret_key');
				// const email = decodedToken.email;

				// Find the user
				// const Appuser = await this.AppUser.findOne({ where: { EmailId:email } });
				// const  user = await this.User.findOne({ where: {email}});	
				// if (!Appuser) {
				//     return res.status(404).json({ error: 'User not found' });
				// };

				// if(!user) {
				// 	return res.status(404).json({ error: 'User not found' });
				// };
				// user.updateAttributes({ password: password }, (err, updatedUser) => {
				// 	if (err) {
				// 	  console.error('Error updating password:', err);
				// 	  return res.status(500).send('Internal server error');
				// 	}
				// });
				// // Update the user's password
				// user.password = password;
				// await user.save();
				// // Update the user's password
				// Appuser.password = password;
				// await Appuser.save();
				// res.status(200).json({ message: 'Password reset successful' });
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
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

		// Example usage:
		//   const otp = generateOTP();
		//   console.log("Generated OTP:", otp);

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

		app.post('/getJobsWithStatusFilter', async function (req, res) {
			const status = req.body;
			try {
				const Job = app.models.Job;
				const jobs = await Job.find({
					fields: { 
							JobName:false,
							UpdatedOn:false,
							CreatedOn:false,
							date:false,
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
					});
				res.send(jobs);
			} catch (error) {
				return res.status(500).send(error);

			}
		})
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
		app.post('/verifyOtp', async (req, res) => {

			this.User = app.models.User;
			this.otp = app.models.otp;
			var OTP = req.body;
			var currentdateAndTime = generateDateAndTime();
			try {

				try {
					const otp = await this.otp.findOne({ where: { OTP: OTP.inputOtpValue } }); // Retrieve all users
					if (otp.__data.OTP == OTP.inputOtpValue && otp.__data.User == OTP.email) {
						if (otp.__data.ExpDate > currentdateAndTime) {
							res.status(200).send('Validation Successful');
						} else {
							res.status(400).send('OTP has expired');
						}
					}
					// else{
					// 	res.status(400).json({ message: 'Not Validate'});

					// }
				}
				catch (error) {
					res.status(400).json({ error: 'OTP not validate' });

				}
			}
			catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});

		//* Delete OTP
		app.post('/deleteotp', async (req, res) => {
			this.User = app.models.User;
			this.otp = app.models.otp;
			var OTP = req.body; // Assuming the ID is provided as a property in the request body

			try {
				const otp = await this.otp.findOne({ where: { OTP } }); // Retrieve the user with the specified ID
				if (otp) {
					await otp.remove(); // Remove the user
					res.status(200).send('OTP Deleted Successfully');
				} else {
					res.status(404).send('OTP Not Found'); // If the user doesn't exist
				}
			} catch (error) {
				console.error('Error deleting user:', error);
				res.status(500).send('Internal server error');
			}
		});

		// * this post call is sending the email to the user,when user is registering into the portal.

		app.post('/signup/verifyEmail', async (req, res) => {
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			this.otp = app.models.otp;

			try {
				const { email } = req.body;

				// Check if the user already exists
				const existingUser = await this.User.findOne({ where: { email } });
				if (existingUser) {
					return res.status(400).json({ error: 'User with this email already exists' });
				}

				// Generate JWT token
				var otp = generateOTP();
				var dateAndTime = generateDateAndTime();
				var ExpDateAndTIme = generateDateAndTimeWithExtraTime();
				// Generate JWT token
				const token = generateToken(email);
				const replacements = {
					OTP: otp,
					email: "noreply@aeonproducts.com",
					// user : email,
				};
				const templateFileName = "verifyEmail.html";
				const emailSubject = "Verfiy Your Registration Email";
				const date = new Date();
				// Send verification email
				await sendEmail(email, token, replacements, templateFileName, emailSubject);
				await this.otp.create({ OTP: otp, User: email, CreatedOn: dateAndTime, ExpDate: ExpDateAndTIme });


				res.status(200).json({ message: 'Verification email sent successfully' });
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});

		// * this post call verify the token when user is register in the portal.
		app.post('/signup/verifyToken', async (req, res) => {
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			try {
				const { token } = req.body;
				var email;

				jwt.verify(token, 'your_secret_key', function (err, decoded) {
					if (err) {
						res.status(500).send('Token is Expired');
					}
					else {
						email = decoded.email;
					}
				});

				const existingUser = await this.User.findOne({ where: { email } });
				if (existingUser) {
					return res.status(400).json({ error: 'User with this email already exists' });
				}
				let msg = "token verfied"
				res.status(200).json({ msg, email });
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});


		// * this post call create the user instance into the database
		app.post('/signup/createUser', async (req, res) => {
			try {
				this.User = app.models.User;
				this.Param = app.models.Param;
				this.AppUser = app.models.AppUser;
				const { email, password } = req.body;
				const role = 'Customer'; // Hardcoded role as 'Customer'
				const name = email.substring(0, email.indexOf("@"));

				// Create the user in User table
				const existingUser = await this.User.findOne({ where: { email } });
				if (existingUser) {
					return res.status(400).json({ error: 'User with this email already exists' });
				}

				const newUser = await this.User.create({ email, password, Role: role, CreatedOn: new Date(), status: "Pending" });

				// Create the user in AppUser table
				await this.AppUser.create({
					TechnicalId: newUser.id,
					EmailId: email,
					UserName: name,
					CreatedOn: new Date(),
					// Status : "Pending",
					// Blocked : "No",
					Role: role
				});

				console.log(`App User created: ${JSON.stringify(newUser.toJSON())}`);

				res.status(200).json({ message: 'User created successfully' });
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});


		// * this get call is getting the all userTable users.

		app.get('/usersTable', async (req, res) => {
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			try {
				const users = await this.User.find(); // Retrieve all users
				res.status(200).json(users);
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});
		//*Delete user form the user table
		app.post('/deleteusersTable', async (req, res) => {

			this.User = app.models.User;
			var id = req.body.id; // Assuming the ID is provided as a property in the request body

			try {
				const user = await this.User.findOne({ where: { id: id } }); // Retrieve the user with the specified ID
				if (user) {
					await user.remove(); // Remove the user
					res.status(200).send('User deleted successfully');
				} else {
					res.status(404).send('User not found'); // If the user doesn't exist
				}
			} catch (error) {
				console.error('Error deleting user:', error);
				res.status(500).send('Internal server error');
			}
		});
		app.post('/deleteAppUsersTable', async (req, res) => {

			this.AppUser = app.models.AppUser;
			var id = req.body.id; // Assuming the ID is provided as a property in the request body

			try {
				const user = await this.AppUser.findOne({ where: { id: id } }); // Retrieve the user with the specified ID
				if (user) {
					await user.remove(); // Remove the user
					res.status(200).send('User deleted successfully');
				} else {
					res.status(404).send('User not found'); // If the user doesn't exist
				}
			} catch (error) {
				console.error('Error deleting user:', error);
				res.status(500).send('Internal server error');
			}
		});

		//server call for job delete with jobstatus
		app.post('/deleteJobsWithJobStatus', async (req, res) => {

			this.JobStatus = app.models.JobStatus;
			this.Job = app.models.Job;
			var id = req.body; // Assuming the ID is provided as a property in the request body

			try {
				const job = await this.Job.findOne({ where: { jobCardNo: id } });
				if (job) {
					job.remove();
					const jobStatus = await this.JobStatus.findOne({ where: { JobStatusId: id } }); // Retrieve the user with the specified ID
					if (jobStatus) {
						jobStatus.remove();
						return res.status(200).send('Job and Job Status Deleted Successfully');
					}
					return res.status(200).send('Job Deleted Successfully');
				} else {
					return res.status(404).send('Job not found'); // If the user doesn't exist
				}
			} catch (error) {
				console.error('Error deleting Job:', error);
				// res.status(500).send('Internal server error');
			}
		});

		// * this get call is getting the all AppuserTable users.

		app.get('/Appusers', async (req, res) => {
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			try {
				const users = await this.AppUser.find(); // Retrieve all users

				res.status(200).json(users);
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});

		// * this post call is responsble for login the registered user into the portal.

		app.post('/login', async (req, res) => {

			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;

			const { email, password } = req.body;

			if (!email || !password) {
				return res.status(400).json({ error: 'Email and password are required' });
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			if (!emailRegex.test(email)) {
				return res.status(400).json({ error: 'Invalid email format' });
			}

			data = {
				email,
				password
			};
			try {
				const [user, appUser] = await Promise.all([
					this.User.login(data),
					this.AppUser.findOne({ where: { EmailId: email } })
				]);

				let tempPass = null;
				let temp = false;

				const tempUser = await this.User.findOne({ where: { email, TempPass: password } });
				if (tempUser) {
					tempPass = tempUser.TempPass;
					temp = true;
				}

				// Extract the required data from the user object
				const { id, ttl, created, userId } = user;

				// Retrieve the status and role of the user from the appUsers table
				const { Status, Blocked, Role } = appUser;

				return res.status(200).json({ id, Status, Role, ttl, created, userId, Blocked, temp, tempPass });
			} catch (error) {
				return res.status(400).json({ error: 'Invalid email or password' });
			}


			// try {
			// const tempUser = await this.User.findOne({ where: { email, TempPass: password } });
			// const {TempPass} = tempUser
			//   const temp = tempUser ? true : false;

			//   const user = await this.User.login(data);
			//   // Extract the required data from the user object
			//   const { id, ttl, created, userId } = user;

			//   // Retrieve the status and role of the user from the appUsers table
			//   const appUser = await this.AppUser.findOne({ where: { EmailId: email } });
			//   const { Status, Blocked, Role } = appUser;




			//   return res.status(200).json({ id, Status, Role, ttl, created, userId, Blocked, temp ,TempPass});
			// } catch (error) {
			//   return res.status(400).json({ error: 'Invalid email or password' });
			// }
		});

		// * this post call is use to create the new user via the admin side in the portal.

		app.post('/addUserAdmin', async (req, res) => {

			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			this.Customer = app.models.Customer;

			const newCustomer = {};
			for (const field in req.body) {
				newCustomer[field] = req.body[field];
			}

			var email = newCustomer.EmailId;
			var name = email.substring(0, email.indexOf("@"));
			var requestPass = newCustomer.PassWord;
			var Role = newCustomer.Role;
			var status = newCustomer.Status;
			if (!requestPass) {
				var password = generateRandomPassword();
			}
			else {
				var password = requestPass;
			}

			try {
				let userTable = await this.User.findOne({ where: { email: email } });
				if (!userTable) {
					var newUser = await this.User.create({ email, TempPass: password, password, Role, CreatedOn: new Date(), status: status });

				}
				else {
					res.status(400).json("User Already Exists with this email address");
				}

				let AppUuser = await this.AppUser.findOne({ where: { EmailId: email } });

				if (!AppUuser) {
					await this.AppUser.create({
						TechnicalId: newUser.id,
						EmailId: email,
						UserName: name,
						CreatedOn: new Date(),
						Status: status,
						// Blocked : "No",
						Role: Role
					});
				}
				else {
					res.status(400).json("User Already Exists with this email address");
				}
				// Create the user in AppUser table

				// await sendEmailPass(email, password);
				const replacements = {
					// verify : `${req.headers.referer}#/updatePassword/${token}`,
					email: "noreply@aeonproducts.com",
					user: email,
					link: `${req.headers.referer}`,
					password: password,
				};
				const templateFileName = "NewUser.html"
				const emailSubject = "[Confidential]Aeon Products Customer Portal Registration";
				const token = "";
				// Send verification email
				await sendEmail(email, token, replacements, templateFileName, emailSubject);

				// Return a response indicating successful creation
				return res.status(200).json('Customer created successfully');
			} catch (error) {
				// Handle error
				return res.status(500).json({ error: 'Failed to create customer' });
			}
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

		// * this function is not working properly work is pending on this.
		app.post('/clearData', async (req, res) => {
			const Model = app.models.User; // Replace 'YourModel' with your actual model name

			// const filter = req.body; // The filter object provided in the request body
			const filter = { where: { email: "harsh@soyuztechnologies.com" } };

			try {
				const deleteResult = await Model.deleteAll(filter);

				if (deleteResult.count > 0) {
					return res.status(200).json({ message: 'Data cleared successfully' });
				} else {
					return res.status(404).json({ error: 'No data found matching the filter' });
				}
			} catch (error) {
				return res.status(500).json({ error: 'Failed to clear data' });
			}
		});

		// * this post call is use to hanlde the uploaded attachments in loopback.
		app.post('/UploadAttachment', async (req, res) => {

			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			this.Attachments = app.models.Attachments;
			try {
				const { id, attachment, po } = req.body;
				var ids = req.body.id;
				var dd = req.body.attachment;
				var PO = req.body.po;
				// Create the user in User table
				const Attachments = await this.AppUser.findOne({ where: { id } });
				if (!Attachments) {
					return res.status(400).json({ error: 'Customer is not Available' });
				}

				await this.Attachments.create({
					customerId: ids,
					attachment: dd
				});
				return res.status(200).json({ error: 'Customer is  Available' })

			} catch (error) {

				console.error(error);

				res.status(500).json({ error: 'Internal server error' });

			}

		});
		app.post('/uploadjob', async (req, res) => {

			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			this.Attachments = app.models.Attachments;
			this.Job = app.models.Job;
			var key = req.body.jobCardNo;
			try {
				// 	const newJob = {};
				// for (const field in req.body) {
				// 	newJob[field] = req.body[field];
				// }
				var value = await this.Job.findOne({ where: { jobCardNo: key } });
				if (value) {
					let msg = "Job is already exist."
					return res.status(200).json({ success: msg, value });
				} else {
					return res.status(500).json({ error: 'Not Available' });
				}

			} catch (error) {

				console.error(error);

				res.status(500).json({ error: 'Internal server error' });

			}

		});

		// * this fucntion is finding the user data and  role from the session id.
		app.get('/getUserRole', async (req, res) => {
			debugger;
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

			try {

				// Retrieve the access token based on the session cookie
				const accessToken = await this.AccessToken.findOne({ where: { id: sessionCookie } });

				if (!accessToken) {
					// Handle case when access token is not found
					return res.status(404).json({ error: 'Session not found' });
				}
				const { ttl, created, userId } = accessToken;

				let userID = accessToken.userId;

				// Retrieve the user based on the access token user ID
				const user = await this.User.findOne({ where: { id: userID } });
				if (!user) {
					// Handle case when user is not found
					return res.status(404).json({ error: 'User not found' });
				}
				//   const ID = user.id;

				const Appuser = await this.AppUser.findOne({ where: { EmailId: user.email } });
				if (!Appuser) {
					// Handle case when user is not found
					return res.status(404).json({ error: 'User not found' });
				}

				// Retrieve the user's role or any other relevant data
				const { Status, TechnicalId, Role, EmailId, id, CompanyId } = Appuser;
				const responseData = {
					role: { Status, TechnicalId, Role, EmailId, id, CompanyId },
					// Include other relevant data if needed
				};

				// Send the response
				res.status(200).json(responseData);
			} catch (error) {
				// Handle any errors that occur during the process
				console.error('Error fetching user role:', error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});
		app.get('/getUserProfileData', async (req, res) => {
			// models data
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			this.AccessToken = app.models.AccessToken;

			const cookieHeader = req.headers.cookie;
			// Parse the cookie string and extract the value of 'soyuz_session'
			const cookies = cookie.parse(cookieHeader);
			const sessionCookie = cookies.soyuz_session;

			try {

				// Retrieve the access token based on the session cookie
				const accessToken = await this.AccessToken.findOne({ where: { id: sessionCookie } });

				if (!accessToken) {
					// Handle case when access token is not found
					return res.status(404).json({ error: 'Session not found' });
				}
				const { ttl, created, userId } = accessToken;

				let userID = accessToken.userId;

				// Retrieve the user based on the access token user ID
				const user = await this.User.findOne({ where: { id: userID } });
				if (!user) {
					// Handle case when user is not found
					return res.status(404).json({ error: 'User not found' });
				}
				//   const ID = user.id;

				const Appuser = await this.AppUser.findOne({ where: { EmailId: user.email } });
				if (!Appuser) {
					// Handle case when user is not found
					return res.status(404).json({ error: 'User not found' });
				}

				// Retrieve the user's role or any other relevant data
				// const {appUser} = Appuser;
				const responseData = {
					Appuser
					// Include other relevant data if needed
				};

				// Send the response
				res.status(200).json(responseData);
			} catch (error) {
				// Handle any errors that occur during the process
				console.error('Error fetching user role:', error);
				res.status(500).json({ error: 'Internal server error' });
			}
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
		app.post('/updatePassword', async (req, res) => {
			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;

			const { email, password, newPassword } = req.body;

			const tempUser = await this.User.findOne({ where: { email, TempPass: password } });
			if (tempUser) {
				// Update the password in both tables
				tempUser.updateAttributes({ password: newPassword }, (err, updatedUser) => {
					if (err) {
						console.error('Error updating password:', err);
						return res.status(500).send('Internal server error');
					}

					// // Update the password in the AppUser table
					// AppUser.updateAttributes({ TechnicalId: user.id }, { password: newPassword }, (err) => {
					//   if (err) {
					// 	console.error('Error updating password in AppUser table:', err);
					// 	return res.status(500).send('Internal server error');
					//   }

					return res.status(200).send('Password updated successfully');
				});
				//   });
			}

		});
		app.get('/customerNames', async (req, res) => {

			const appUsers = app.models.AppUser;
			try {
				const customerData = await appUsers.find({ where: { Role: "Customer", Status: "Approved" } }); // Retrieve job status data
				// var data = JSON.stringify(customerData);
				res.status(200).json(customerData);
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});

		// * this call is gettting the jobstatus data.
		app.post('/jobStatusData', async (req, res) => {

			const JobStatus = app.models.JobStatus;
			const { jobId } = req.body;
			try {
				const jobStatusData = await JobStatus.find({ where: { JobStatusId: jobId } }); // Retrieve job status data

				//   res.status(200).json(jobStatusData);
				// var data = JSON.stringify(jobStatusData);
				res.status(200).json(jobStatusData);
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});
		app.post('/getSumOfJobStatus', async (req, res) => {

			const JobStatus = app.models.JobStatus;
			const Job = app.models.Job;
			const { jobId } = req.body;
			var oSumOfData = {
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
			}
			try {
				const jobStatusData = await JobStatus.find({ where: { JobStatusId: jobId } }); // Retrieve job status data

				for (let i = 0; i < jobStatusData.length; i++) { //5
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
						})
					}
					if (jobStatusData[i].DeliveryNo) {
						oSumOfData.DeliveryNo.push({
							DeliveryNo: jobStatusData[i].DeliveryNo,
							attachment: jobStatusData[i].deliveryAttachment
						})
					}
				}

				var array = [oSumOfData]

				res.status(200).json(array);
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});

		app.post('/getRemJobStatus', async (req, res) => {

			const JobStatus = app.models.JobStatus;
			const Job = app.models.Job;
			const { jobId } = req.body;
			var oSumOfData = {
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
			}
			try {
				const jobStatusData = await JobStatus.find({ where: { JobStatusId: jobId } }); // Retrieve job status data

				for (let i = 0; i < jobStatusData.length; i++) { //5
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
							invNo: jobStatusData[i].InvNo,
							attachment: jobStatusData[i].incAttachment
						})
					}
					if (jobStatusData[i].DeliveryNo) {
						oSumOfData.DeliveryNo.push({
							DeliveryNo: jobStatusData[i].DeliveryNo,
							attachment: jobStatusData[i].deliveryAttachment
						})
					}

				}
				const totalJobDetails = await Job.findOne({ where: { jobCardNo: jobId } })

				var remainingData = {
					"RemainingCoating": totalJobDetails.__data.noOfSheets1 - oSumOfData.Printing,

				};

				var array = array = [remainingData]

				res.status(200).json(array);
			} catch (error) {
				console.error(error);
				res.status(500).json({ error: 'Internal server error' });
			}
		});
		// Relation: Jobs ---> Company >>>> belongsTo >>>> Object
		// 		Comany ---> Jobs >>>>> hasMany   >>>> Array
		app.get('/getJobsWithCompany', async function (req, res) {
			try {
				const Job = app.models.Job;
				const jobs = await Job.find({
					fields: { 
							JobName:false,
							UpdatedOn:false,
							CreatedOn:false,
							date:false,
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
					include: 'Company',
				});
				// fields: {artworkAttachment:false, poAttachment:false },
				// jobCardNo: true, nameOFTheProduct:true,jobCode:true, status:true, urgent:true, Company:true
				res.send(jobs);
			} catch (error) {
				return res.status(500).send(error);
			}

		});
		// Relation: Jobs ---> Job status >>>> hasMany  >>>> Array
		// 		JobStatus ---> Jobs >>>>> Belongs TO >>>> Object

		// To be done by harsh

		app.get('/getJobsData', async (req, res) => {
			try {
				const Job = app.models.Job;
				const AppUser = app.models.AppUser;
				// Fetch jobs data with associated appUser
				const jobs = await Job.find({ include: 'appUser' })
				const jobsWithData = jobs.map(job => {

					const fullName = `${job.appUser.FirstName} ${job.appUser.LastName}`;
					return {
						...job.toJSON(),
						appUserFullName: fullName
					};

				});
				return res.status(200).json(jobsWithData);
			} catch (error) {
				console.error(error);
				return res.status(500).json({ error: 'An error occurred' });

			}
		});
		app.post('/selectedDateJobStatus', async (req, res) => {
			const Job = app.models.Job;
			const JobStatus = app.models.JobStatus;
			const { CreatedOnStart, CreatedOnEnd, cId } = req.body;

			try {
				const startDate = CreatedOnStart;
				const endDate = CreatedOnEnd;


				let jobStatusSelectedData = await Job.find({
					where: {
						and: [
							{ CreatedOn: { gte: startDate } }, // Filter jobs created on or after CreatedOnStart
							{ CreatedOn: { lte: endDate } }, // Filter jobs created on or before CreatedOnEnd
							{ CompanyId: cId } // Filter jobs matching the specified CompanyId
						]
					},
					include: 'JobStatus' // Include JobStatus relation
				});

				res.status(200).json(jobStatusSelectedData);
			} catch (error) {
				console.error(error);
				return res.status(500).send('Internal server error');
			}
		});
	
		// * this call is sending the emol to the existing user that admin create.
		// todo need this to optimize 
		app.post('/sendEmailExistUser', async (req, res) => {

			this.User = app.models.User;
			this.Param = app.models.Param;
			this.AppUser = app.models.AppUser;
			this.Customer = app.models.Customer;

			const newCustomer = {};
			for (const field in req.body) {
				newCustomer[field] = req.body[field];
			}

			var EmailId = newCustomer.EmailId;
			var id = newCustomer.TechnicalId;
			if (!newCustomer.password) {
				var password = generateRandomPassword();
			} else {
				var password = newCustomer.password;
			}
			try {
				let userTableUser = await this.User.findOne({ where: { email: EmailId, id: id } });
				let AppUser = await this.AppUser.findOne({ where: { EmailId, TechnicalId: id } });
				// let TempPassW = userTableUser.TempPass;
				if (userTableUser) {
					// Update the password in both tables
					userTableUser.updateAttributes({ password: password, TempPass: password }, (err, updatedUser) => {
						if (err) {
							console.error('Error updating password:', err);
							return res.status(500).send('Internal server error');
						}
					});

					// // Update the password in the AppUser table
					// AppUser.updateAttributes({ TechnicalId: user.id }, { password: password,TempPass:password }, (err) => {
					//   if (err) {
					// 	console.error('Error updating password in AppUser table:', err);
					// 	return res.status(500).send('Internal server error');
					//   }
					// });
				};
				// if (!TempPassW) {
				// 	res.status(404).json("this user doesn't exist with the temporary password");
				// 	return;
				// }
				// const { email, TempPass } = userTableUser;
				const token = "";
				const replacements = {
					// 	// verify : `${req.headers.referer}#/updatePassword/${token}`,
					email: "noreply@aeonproducts.com",
					user: EmailId,
					password: password,
				};
				const templateFileName = "NewUser.html"
				const emailSubject = "[Confidential]Aeon Products Customer Portal Registration";
				// Send verification email
				await sendEmail(EmailId, token, replacements, templateFileName, emailSubject);

				return res.status(200).json('Email send successfully');
			} catch (error) {
				// Handle error
				return res.status(500).json({ error: 'Failed to Send Email' });
			}
		});

		// ! right now this call is not useful bus may be in future.
		// app.post('/uploadJobData', async (req, res) => {
		// 	
		// 	 this.User = app.models.User;
		// 	this.Param = app.models.Param;
		// 	this.AppUser = app.models.AppUser;
		// 	this.Job = app.models.Job;

		// 	const newJob = {};
		// 	for (const field in req.body) {
		// 		newJob[field] = req.body[field];
		// 	}

		// 	try {
		// 	  let jobId = newJob.jobCardNo;
		// 	   var jobs = await this.Job.findOne({ where: { jobCardNo: jobId} });
		// 		if (!jobs) {
		// 			var job = await this.Job.create(newJob);
		// 		}
		// 		else{
		// 			res.status(404).json("Job is already exists with this job card no.")
		// 		}

		// 	  // Fetch only firstname and lastname from the appusers table using the customer ID
		// 	  const customerId = newJob.CustomerId; // Assuming the customer ID field is 'customerId'
		// 	  const appUser = await this.AppUser.findOne({where: { id:customerId } });

		// 	  if (!appUser) {
		// 		res.status(404).json("Customer id Is not Valid");
		// 	  }
		// 		const { FirstName, LastName } = appUser;

		// 		job.userName = FirstName + " " + LastName;

		// 	  res.status(200).json(job);
		// 	} catch (error) {
		// 	  console.error(error);
		// 	  res.status(500).json({ error: 'An error occurred while processing the request' });
		// 	}
		//   });

		// app.post('/uploadJobData', async (req, res) => {
		// 	
		// 	this.User = app.models.User;
		// 	this.Param = app.models.Param;
		// 	this.AppUser = app.models.AppUser;
		// 	this.Job = app.models.Job;

		// 	const newJob = {};
		// 	for (const field in req.body) {
		// 		newJob[field] = req.body[field];
		// 	}

		// 	try {
		// 		// Create the job entry in the job table
		// 		//   const job = await Job.create(newCustomer);
		// 		let jobId = newJob.jobCardNo;
		// 		var jobs = await this.Job.findOne({ where: { jobCardNo: jobId } });
		// 		if (!jobs) {
		// 			var job = await this.Job.create(newJob);
		// 		}
		// 		else {
		// 			res.status(404).json("Job is already exists with this job card no.")
		// 		}

		// 		// Fetch only firstname and lastname from the appusers table using the customer ID
		// 		const customerId = newJob.CustomerId; // Assuming the customer ID field is 'customerId'
		// 		const appUser = await this.AppUser.findOne({ where: { id: customerId } });

		// 		if (!appUser) {
		// 			res.status(404).json("Customer id Is not Valid");
		// 		}
		// 		// Include the fetched firstname and lastname in the response
		// 		// job.FirstName = appUser.FirstName;
		// 		// job.LastName = appUser.LastName;

		// 		const { FirstName, LastName } = appUser;

		// 		job.userName = FirstName + " " + LastName;

		// 		res.status(200).json(job);
		// 	} catch (error) {
		// 		console.error(error);
		// 		res.status(500).json({ error: 'An error occurred while processing the request' });
		// 	}
		// });



		app.post('/JobsCustomer', async (req, res) => {

			this.AppUser = app.models.AppUser;
			this.Job = app.models.Job;
			const { id } = req.body;

			let AppUser = await this.AppUser.findOne({ where: { id } });
			if (AppUser) {
				const CompanyId = AppUser.CompanyId;
				if (CompanyId) {
					let Jobs = await this.Job.find(
						{ 
							where: { CompanyId },
							fields: { 
							JobName:false,
							UpdatedOn:false,
							CreatedOn:false,
							date:false,
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
					}
						);
					return res.status(200).send(Jobs);
				} else {
					return res.status(200).send([]);
				}
			} else {
				return res.status(400).send('user not found');
			}

			// at above we find the appuser from the id.
			// if user exiest then take smae process to find the jobs accoring to user 
			// for this use the company id form {AppUser.compnayId}
			// at here you get the id and the make the further process.

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
