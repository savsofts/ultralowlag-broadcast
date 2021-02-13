function getDomainName(){
	var url = window.location.href;
	var arr = url.split("/");
	var result = arr[0] + "//" + arr[2]
	return result;
}

function randomInt(min, max) {
	return min + Math.floor((max - min) * Math.random());
}

var peer_name;
function iniRoom(){
		if(document.getElementById('chatBtn').style.display != undefined){
		document.getElementById('chatBtn').style.display="inline";
	}
	const urlParams = new URLSearchParams(window.location.search);
const roomId = subChannel.value;
var ranNumber=Math.random(); 
const peerName = btoa(yourName.value+"|"+randomInt(111111111,999999999));
peer_name=peerName;

if(roomId==""){
	alert("Channel id required");
	throw new Error('Channel id required');
}
if (!roomId || !peerName) {
  console.log('You have to set channel id and peerName in url params.');
  return false;
}
startWS();

const socket = io(getDomainName()+':8080', { query: { roomId, peerName } });

// Create a local Room instance associated to the remote Room.
const room = new mediasoupClient.Room();
// Transport for sending our media.
let sendTransport;
// Transport for receiving media from remote Peers.
let recvTransport;
let videoProducer;
let videoProducerShare;
let audioProducer;

console.debug('ROOM:', room);

room.join(peerName)
  .then((peers) => {
    console.debug('PEERS:', peers);

    // Create the Transport for sending our media.
    sendTransport = room.createTransport('send');
    // Create the Transport for receiving media from remote Peers.
    recvTransport = room.createTransport('recv');

    peers.forEach(peer => handlePeer(peer));
	
	$('#connectBtn').css('display','none');
	$('#leaveBtn').css('display','inline');
	$('#subChannel').attr('readonly','readonly');
	
  });
// Event fired by local room when a new remote Peer joins the Room
room.on('newpeer', (peer) => {
  console.debug('A new Peer joined the Room:', peer.name);

  // Handle the Peer.
  handlePeer(peer);
});

// Event fired by local room
room.on('request', (request, callback, errback) => {
  console.debug('REQUEST:', request);
  socket.emit('mediasoup-request', request, (err, response) => {
    if (!err) {
      // Success response, so pass the mediasoup response to the local Room.
      callback(response);
    } else {
      errback(err);
    }
  });
});

// Be ready to send mediaSoup client notifications to our remote mediaSoup Peer
room.on('notify', (notification) => {
  console.debug('New notification from local room:', notification);
  socket.emit('mediasoup-notification', notification);
});

// Handle notifications from server, as there might be important info, that affects stream
socket.on('mediasoup-notification', (notification) => {
  console.debug('New notification came from server:', notification);
  room.receiveNotification(notification);
});

/**
 * Handles specified peer in the room
 *
 * @param peer
 */
function handlePeer(peer) {
  // Handle all the Consumers in the Peer.
   peer.consumers.forEach(consumer => handleConsumer(consumer,peer));

  // Event fired when the remote Room or Peer is closed.
  peer.on('close', () => {
    console.log('Remote Peer closed');
	
	  var pname=atob(peer.name).split('|');
	   var existIdVidShare="#share-"+pname[1];
      var existIdVid="#v-"+pname[1];
	  console.log(existIdVid);
      var existIdAud="#a-"+pname[1];
      var partid='#part-'+pname[1];
      $(existIdVidShare).remove();
      $(existIdVid).remove();
      $(existIdAud).remove();
	  
	  
  });

  // Event fired when the remote Peer sends a new media to mediasoup server.
  peer.on('newconsumer', (consumer) => {
    console.log('Got a new remote Consumer');

    // Handle the Consumer.
    handleConsumer(consumer,peer);
  });
}

/**
 * Handles specified consumer
 *
 * @param consumer
 */
function handleConsumer(consumer,peer) {
  // Receive the media over our receiving Transport.
  consumer.receive(recvTransport)
    .then((track) => {
      console.debug('Receiving a new remote MediaStreamTrack:', consumer.kind);

      // Attach the track to a MediaStream and play it.
      const stream = new MediaStream();
      stream.addTrack(track);
      var pname=atob(peer.name).split('|');
      var existIdVid="v-"+pname[1];
      var existIdAud="a-"+pname[1];
	  console.log(consumer.appData.trackType);
	        if (consumer.appData.trackType == 'cam') {
				
				  if (consumer.kind === 'video') {
					  if($('.camVid').length>=1){
								$('.camVid').remove();
							}
					const video = document.createElement('video');
					video.setAttribute('style', 'width: 45%;');
					video.setAttribute('playsinline', '');
					video.setAttribute('class', 'camVid');
					video.setAttribute('id', 'myCamVideo');
					video.srcObject = stream;
					document.getElementById('container').appendChild(video);
					setTimeout(function(){  
					 try{
						 processor.doLoad();
					 }catch(ex){
						 console.log(ex);
					 }
					 video.play();
					 },5000);
					 
				  }
				  if (consumer.kind === 'audio') {
						if($('.camAud').length>=1){
								$('.camAud').remove();
							}
					const audio = document.createElement('audio');
					audio.srcObject = stream;
					audio.setAttribute('class', 'camAud');
					audio.setAttribute('id', existIdAud);
					document.getElementById('container').appendChild(audio);
					audio.play();
				  }
			}else if (consumer.appData.trackType == 'viewer'){
				
			}else{
				
				
				  if (consumer.kind === 'video') {
					  if($('.scrVid').length>=1){
								$('.scrVid').remove();
							}
					const video = document.createElement('video');
					video.setAttribute('style', 'width: 45%;');
					video.setAttribute('playsinline', '');
					video.setAttribute('class', 'scrVid');
					video.setAttribute('id', 'myShare');
					video.srcObject = stream;
					document.getElementById('container').appendChild(video);
					video.play();
					 
				  }
				  if (consumer.kind === 'audio') {
						if($('.scrAud').length>=1){
								$('.scrAud').remove();
							}
					const audio = document.createElement('audio');
					audio.srcObject = stream;
					audio.setAttribute('class', 'scrAud');
					audio.setAttribute('id', existIdAud);
					document.getElementById('container').appendChild(audio);
					audio.play();
				  }				
				
				
			}
    });

  // Event fired when the Consumer is closed.
	consumer.on('close', (originator,appData)=>{
       
          console.log(originator);
        });
}

$(document).on('click','#startCam',function(){
	
	  
		var videoCons = {
				width: document.getElementById('v_width').value,
				height:document.getElementById('v_height').value
				};
	 
	
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: videoCons
    }).then((stream) => {
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
	
	  const localStream = new MediaStream([videoTrack, audioTrack]);
	  $('#viewerPreview').remove();
      const video = document.createElement('video');
      video.setAttribute('style', 'max-width: 170px;');
      video.setAttribute('id', 'viewerPreview');
      video.setAttribute('controls', '');
      video.srcObject = localStream;
      document.getElementById('viewer').appendChild(video);
     video.play();
	    $('#viewer').css('display','block');
    $(document).on('click','#stopCam',function(){
       
     try{
		stream.getTracks().forEach(function(track) {
		  track.stop();
		});	
		videoProducer.close();
		audioProducer.close();
		 $('#viewer').css('display','none');
		 	
       /* stream.getVideoTracks()[0].enabled = false;
        videoProducer.pause();
        capture.style.display="inline";
		stopCapture.style.display="none";
		$('#myCamVideo').remove();
		*/

    }catch(ex){ console.log(ex); }
    }); 	  

	
	  audioProducer = room.createProducer(audioTrack,[],{"trackType":"viewer"});
      videoProducer = room.createProducer(videoTrack,[],{"trackType":"viewer"});
	 // videoProducer.enableStats(1000);
 	 // audioProducer.enableStats(1000);
    // Send our audio.
    audioProducer.send(sendTransport);
    // Send our video.
    videoProducer.send(sendTransport);
	
	
	});
	
});


 

}