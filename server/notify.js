// Dependencies
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const config = require('./config');

const app = express();

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/'+config.domain+'/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/'+config.domain+'/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/'+config.domain+'/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

/* 
app.use((req, res) => {
	res.send('Hello there !');
});
*/

 app.get('/',(req, res) => {
    res.sendFile(join(__dirname, 'html', 'index.html'));
	 res.sendFile(path.join(__dirname, 'app.js'));
  });
  

// Starting both http & https servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

/* httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});
*/

httpsServer.listen(1999, () => {
	console.log('HTTPS Server running on port 999');
});

var url = require('url');


var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    server: httpsServer
});
wss.on('connection', function (ws,req) {
	  const { query: { token } } = url.parse(req.url, true);
	  ws.room=token;
	//   console.log("Token:"+token);
	  
  ws.on('message', function (message) {
   // console.log('received: %s', message);
   wss.clients.forEach(function each(client) {
	//   console.log("Room:"+ws.room);
	   if(client.room==ws.room){
	   	  
		 
		     if (client.readyState == ws.OPEN) { 
				client.send(message); 
			 }		  
		  
	   }
   });
	 
});
 
});