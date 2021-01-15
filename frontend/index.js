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
	host     : config_var.db_hostname,
	user     : config_var.db_username,
	password : config_var.db_password,
	database : config_var.db_name
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
	
	if(req.body.assigned_channel){ 
		 
		connection.query('delete from channel_assigned where user_id ', [req.body.username], function(error, results, fields) {
			req.body.assigned_channel.split(',').forEach(function(v,i){
			 
				connection.query('insert into channel_assigned (user_id,channel_id) values(?,?) ', [req.body.username,v], function(error, results, fields) {
				 
				if(req.body.assigned_channel.split(',').length == (parseInt(i)+1)){
					res.send("Done"); 
				}
				});	
			});
				
		});	
	}else{
		res.send("Done"); 
	} 			
			 
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








app.post("/submitChannel", function (req, res) { 
if(req.body.channel_name){
  
	 connection.query('SELECT * FROM channel WHERE channel_name = ? ', [req.body.channel_name], function(error, results, fields) {
	 
		if (results.length > 0) {
				res.send("Channel already exist "); 
			} else {
 connection.query('insert into channel (channel_name) values(?) ', [req.body.channel_name], function(error, results, fields) {
	 res.send("Done"); 
		 			
			 
		});					   
			}			
			 
		});
	 
}else{
 res.send("Channel name required ");  
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



app.post("/getChannelList", function (req, res) { 
 	 connection.query('SELECT * FROM channel order by id desc ', [], function(error, results, fields) {
	 
		if (results.length > 0) {
				res.send(JSON.stringify(results)); 
			} else {
 res.send('No channel found');	
			}
	 });			
});


app.post("/getChannelList2", function (req, res) { 
	if(req.body.username){
		
		 connection.query('SELECT * FROM channel_assigned  where user_id=? ', [req.body.username], function(error, results, fields) {
			// console.log(this.sql);	
	 	if (results.length > 0) {
			var c_id="";
			results.forEach(function(v,i){
			//	console.log(v);
				if(c_id==""){
					c_id=v.channel_id;
				}else{
					c_id=c_id+","+v.channel_id;
				}
			});
		// console.log("c_id"+c_id);	
 	 connection.query('SELECT * FROM channel where id in ('+c_id+') order by id desc ', [], function(error, results, fields) {
	 // console.log(this.sql);
		if (results.length > 0) {
				res.send(JSON.stringify(results)); 
			} else {
 res.send('No channel found');	
			}
	 });
		}else{
			res.send('No channel found');	
		}

	});	 
	}	 
});



app.post("/removeChannel", function (req, res) { 
if(req.body.id){
 	 connection.query('delete FROM channel where id=? ', [req.body.id], function(error, results, fields) {
	 connection.query('delete FROM channel_assigned where channel_id=? ', [req.body.id], function(error, results, fields) {
	 
		 
	 });
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