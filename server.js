const express = require('express');
const mongodb = require('mongodb');
const bodyParser = require("body-parser");
const nodeMailer = require("nodemailer");
var jwt = require('jsonwebtoken');
var verifyToken=require("./verifyToken");
var app = express();
app.use(bodyParser.json());
ObjectId = require('mongodb').ObjectID;
app.use(express.static('resources'))
var bcrypt = require('bcrypt-nodejs');
const saltRounds = 10;
var secret = "wearegoingtowinSIH";
var cors = require("cors");
app.use(cors());
var autoIncrement = require("mongodb-autoincrement");
app.use(bodyParser.urlencoded({ extended: true }));
var url = "mongodb://mongo:27017/";
app.use(express.static("resources"));
var global_address;
var mongoClient = mongodb.MongoClient;
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get("/", function (req, res) {
	res.send("Node Server in Docker");
	console.log("requested");
});
/**********************************sign up******************/
app.post("/signup", function (req, res) {
	mongoClient.connect(url, function (err, db) {
		if (err) {
			console.log("db not connected");
			var failure = {
				status: "failure",
				message: err,
			}
			res.send(failure);
		}
		else {
			var dbo = db.db("mydb");
			var query = { email: req.body.email };
			dbo.collection("users").findOne(query, function (err, resu) {
				if (err) {
					console.log(err);
					var failure = {
						status: "failure",
						message: err,
					}
					console.log("Email alredy registered");
					res.send(failure);
				}
				if (resu == null) {
					console.log("Adding");
					//console.log(req);
					var hashP, user;
					bcrypt.hash(req.body.password, null, null, function (err, hash) {
						// Store hash in your password DB.
						if (err)
							console.log(err);
						hashP = hash;
						console.log(hash);
						user = {
							name: req.body.name,
							email: req.body.email,
							phonenumber: req.body.phonenumber,
							password: hashP,
						}
						console.log(user);
						dbo.collection("users").insertOne(user, function (err, result) {
							if (err) {
								console.log(err);
								var failure = {
									status: "failure",
									message: err,
								}
								res.send(failure);
							}
							else {
								console.log("user added");
								var success = {
									status: "success",
									message: "New User Added",
								}

								res.send(success);
							}
						});
					});

				}
				else {
					var failure = {
						status: "failure",
						message: "Email Already Used",
					}
					res.send(failure);
				}
			});

		}

	});

});
/**************Authentication***************/
app.post("/auth", function (req, res) {
	mongoClient.connect(url, function (err, db) {
		if (err) {
			console.log("Unable to connect", err);
			console.log("failure");
			var failure = {
				status: "failure",
				message: err,
			}
			res.send(failure);
		}
		else {
			console.log("Connection established");
			var dbo = db.db("mydb");
			var query = { email: req.body.email };
			dbo.collection("users").findOne(query, function (err, resu) {
				if (err) {
					var failure = {
						status: "failure",
						message: err,
					}
					console.log("failure");
					res.send(failure);
				}
				else {
					if (resu == null) {
						var failure = {
							status: "failure",
							message: "No User Found",
						}
						console.log("failure user not found");
						res.send(failure);
					}
					else {
						var hash = resu.password;
						var ans = bcrypt.compareSync(req.body.password, hash);
						if (ans) {
							var success = {
								status: "success",
								message: "Succesfully Logged In"
							}
							console.log("success");
							var token = jwt.sign({ id: req.body.email }, secret, {
								expiresIn: 86400 // expires in 24 hours
							  });

						  
							  res.status(200).send({ status:"success", user:resu, auth: true, token: token });
							
						}
						else {
							var failure = {
								status: "failure",
								message: "Password is Incorrect",
							}
							console.log("failure");
							res.send(failure)
						}
					}
				}
			});
		}
		db.close();
	});
});

/***********Logout******** */
app.get("/logout", function (req, res) {
});
app.listen(3000, function () {
	console.log("Server started");
});
module.exports=app;