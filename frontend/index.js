/*
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.listen(port, () => console.log(`Mediasoup client app is listening on port ${port}!`));

*/

var config_var = require('../config.js');
var mysql = require('mysql');
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/'+config_var.domain+'/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/'+config_var.domain+'/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var bodyParser = require('body-parser');
var app = express();


var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'testing',
	password : 'Broadcast@1234',
	database : 'broadcast'
});

connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
}
});
// your express configuration here
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/publisher.html", function (req, res) { 
if(req.body.username && req.body.password){
 
	
	 connection.query('SELECT * FROM admin WHERE username = ? AND password = ?', [req.body.username, req.body.password], function(error, results, fields) {
	 
		if (results.length > 0) {
				 res.sendFile(__dirname + "/public/publisher.html");  
			} else {
				 res.sendFile(__dirname + "/public/invalid.html"); 
			}			
			 
		});
}else{
 res.sendFile(__dirname + "/public/invalid.html");  
}
});



app.post("/subscriber.html", function (req, res) { 
if(req.body.username && req.body.password){
 
	
	 connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [req.body.username, req.body.password], function(error, results, fields) {
	 
		if (results.length > 0) {
				 res.sendFile(__dirname + "/public/subscriber.html");  
			} else {
				 res.sendFile(__dirname + "/public/invalid_user.html"); 
			}			
			 
		});
}else{
 res.sendFile(__dirname + "/public/invalid_user.html");  
}
});





app.post("/submitUser", function (req, res) { 
if(req.body.username && req.body.password){
 
	if(req.body.id=="0"){
	 connection.query('SELECT * FROM users WHERE username = ? ', [req.body.username], function(error, results, fields) {
	 
		if (results.length > 0) {
				res.send("Username already exist "); 
			} else {
 connection.query('insert into users (username,password) values(?,?) ', [req.body.username, req.body.password], function(error, results, fields) {
	 res.send("Done"); 
		 			
			 
		});					   
			}			
			 
		});
	}else{
	 connection.query('update users set username=? , password=? WHERE id = ? ', [req.body.username, req.body.password, req.body.id], function(error, results, fields) {
	  res.send("Done"); 
		 			
			 
		});		
	}
}else{
 res.send("Username and password required ");  
}
});


app.post("/getUserList", function (req, res) { 
 	 connection.query('SELECT * FROM users order by id desc ', [], function(error, results, fields) {
	 
		if (results.length > 0) {
				res.send(JSON.stringify(results)); 
			} else {
 res.send('No user found');	
			}
	 });			
});



app.post("/removeUser", function (req, res) { 
if(req.body.id){
 	 connection.query('delete FROM users where id=? ', [req.body.id], function(error, results, fields) {
	 
		 res.send('done');
	 });		
}	 
});



app.get("/publisher.html", function (req, res) { 
res.sendFile(__dirname + "/public/index.html"); 
});



app.get("/subscriber.html", function (req, res) { 
res.sendFile(__dirname + "/public/login_user.html"); 
});

app.use(express.static('public'));

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

// httpServer.listen(8080);
httpsServer.listen(443);