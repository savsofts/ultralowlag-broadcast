
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
	if(pubChannel.value==''){
		alert('Select channel to connect');
		return false;
	}
	startWS();
	if(document.getElementById('chatBtn').style.display != undefined){
		document.getElementById('chatBtn').style.display="inline";
	}
	
	if(document.getElementById('onlineU').style.display != undefined){
		document.getElementById('onlineU').style.display="inline";
	}
	
	const urlParams = new URLSearchParams(window.location.search);
const roomId = pubChannel.value;
var ranNumber=Math.random(); 
const peerName = btoa(yourName.value+"|"+randomInt(111111111,999999999));
 

if (!roomId || !peerName) {
  console.log('You have to set channel id and peerName in url params.');
  throw new Error('roomId and peerName weren\'t set in url params');
}



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
 $('#leaveBtn').css('display','inline');
 $('#capture').css('display','none');
 $('#startCam').css('display','inline');
 
 
    // Create the Transport for sending our media.
    sendTransport = room.createTransport('send');
    // Create the Transport for receiving media from remote Peers.
    recvTransport = room.createTransport('recv');

    peers.forEach(peer => handlePeer(peer));
  });
  

// Event fired by local room when a new remote Peer joins the Room
room.on('newpeer', (peer) => {
  console.debug('A new Peer joined the Room:', peer.name);
  var pn=atob(peer.name).split('|');
$('.listPeers').append("<div class='peerName' id='list-"+pn[1]+"' data-pname='"+peer.name+"'><i class='fa fa-camera user-control' title='allow-control' data-pname='"+peer.name+"' ></i> "+pn[0]+"</div>");
$('#nop').html($('.peerName').length);
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


setTimeout(function(){
	
	 room.peers.forEach((peer) => {
	var pn=atob(peer.name).split('|');
	$('.listPeers').append("<div class='peerName' id='list-"+pn[1]+"' data-pname='"+peer.name+"'><i class='fa fa-camera user-control'  title='allow-control' data-pname='"+peer.name+"' ></i> "+pn[0]+"</div>");
	$('#nop').html($('.peerName').length);
	 });
 
},4000);

/**
 * Handles specified peer in the room
 *
 * @param peer
 */
function handlePeer(peer) {
  // Handle all the Consumers in the Peer.
 // peer.consumers.forEach(consumer => handleConsumer(consumer));

  // Event fired when the remote Room or Peer is closed.
  peer.on('close', () => {
	   var pn=atob(peer.name).split('|');
   var pidd="#list-"+pn[1];
    console.log('Remote Peer closed '+pidd);
	
		$(pidd).remove();
		$('#nop').html($('.peerName').length);
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
	 if (consumer.appData.trackType == 'viewer') {
		 $('#viewerPreviewVideo').remove();
		 $('#viewerPreviewAudio').remove();
		 
  // Receive the media over our receiving Transport.
  consumer.receive(recvTransport)
    .then((track) => {
      console.debug('Receiving a new remote MediaStreamTrack:', consumer.kind);

      // Attach the track to a MediaStream and play it.
      const stream = new MediaStream();
      stream.addTrack(track);

      if (consumer.kind === 'video') {
        const video = document.createElement('video');
        video.setAttribute('style', 'max-width: 170px;');
        video.setAttribute('playsinline', '');
       video.setAttribute('id', 'viewerPreviewVideo');
       video.srcObject = stream;
        document.getElementById('viewer').appendChild(video);
        video.play();
      }
      if (consumer.kind === 'audio') {
        const audio = document.createElement('audio');
		 audio.setAttribute('id', 'viewerPreviewAudio');
      
        audio.srcObject = stream;
		
        document.getElementById('viewer').appendChild(audio);
        audio.play();
      }
    });
}
  // Event fired when the Consumer is closed.
  consumer.on('close', () => {
    console.log('Consumer closed');
	 $('#viewerPreviewVideo').remove();
		 $('#viewerPreviewAudio').remove();
		 $('.viewer_speaking').html('');
  });
}






function handleStream (stream2) {
                            
                                 
      $('#myShare').remove();
                                    const video = document.createElement('video');
                                    video.setAttribute('id', 'myShare');
                                     
                                    video.srcObject = stream2;
                                    document.getElementById('container').appendChild(video);
									video.play();

                                    const videoTrackShare = stream2.getVideoTracks()[0];
									
									videoTrackShare.addEventListener('ended', () => {
										
										$('#screenSharingMainBtn').css('display','inline');
										
									});
									
                          //  const videoProducer = room.createProducer(videoTrack);
                            // Send our video.
                           // videoProducer.replaceTrack(videoTrack); 
                           videoProducerShare = room.createProducer(videoTrackShare,[],{"trackType":"scr"});
                            videoProducerShare.enableStats(1000);
							videoProducerShare.send(sendTransport);
						  
							 videoProducerShare.on('stats', function(stats){
	//	console.log(stats[0].bitrate);
 		
		 var kBps = Math.round(stats[0].bitrate / 1024 / 8);
        ivideokBpsS.innerHTML = kBps;
		ivideokBpsS_type.innerHTML=stats[0].mimeType;
		
	 });
	 
                            try{
                               // videoProducer.resume();
                            }catch(ex){ }
$('#screenSharingMainBtn').css('display','none');
                        
                        $(document).on('click','#stopScreenShare',function(){
                                     
                                     try{
                                         stream2.getTracks().forEach(function(track) {
                                         track.stop();
                                         });
                                          
                                         videoProducerShare.close({"trackType":"scr"});
                                        
                                     }catch(ex){
                                            console.log(ex);
                                     }

                                 });
}



$(document).on('click','#startCam',function(){
	    // Get our mic and camera
	if(fps.value=="default"){
		var videoCons = {
				width: document.getElementById('v_width').value,
				height:document.getElementById('v_height').value,
				deviceId: { exact: vdDeviceId.value  } 
				};
	}else{
		var videoCons = {
				width: document.getElementById('v_width').value,
				height:document.getElementById('v_height').value,
				frameRate:fps.value,
				deviceId: { exact: vdDeviceId.value  } 
				};
	}
	
    navigator.mediaDevices.getUserMedia({
      audio: {deviceId: { exact: adDeviceId.value  }},
      video: videoCons
    }).then((stream) => {
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
		$('#startCam').css('display','none');
		$('#stopCapture').css('display','inline');
		 
		
    /*if (peerName === 'Alice') {
      // Show local stream
      const localStream = new MediaStream([videoTrack, audioTrack]);
      const video = document.createElement('video');
      video.setAttribute('style', 'max-width: 400px;');
      video.srcObject = localStream;
      document.getElementById('container').appendChild(video);
      video.play();
    }*/
	
	  const localStream = new MediaStream([videoTrack, audioTrack]);
	  $('#myCamVideo').remove();
      const video = document.createElement('video');
      video.setAttribute('style', 'max-width: 45%;');
      video.setAttribute('id', 'myCamVideo');
      video.srcObject = localStream;
      document.getElementById('container').appendChild(video);
     setTimeout(function(){  
	  processor.doLoad();
	 video.play();
	 },5000);
	   
    $(document).on('click','#stopCapture',function(){
       
     try{
		stream.getTracks().forEach(function(track) {
		  track.stop();
		});	
		videoProducer.close();
		audioProducer.close();
		$('#startCam').css('display','inline');
		$('#stopCapture').css('display','none');
		 	
       /* stream.getVideoTracks()[0].enabled = false;
        videoProducer.pause();
        capture.style.display="inline";
		stopCapture.style.display="none";
		$('#myCamVideo').remove();
		*/

    }catch(ex){ console.log(ex); }
    }); 	  

	/* screenshare */
	
	$(document).on('click','#scrMicAudio',function(){
		                            try {
                                 navigator.mediaDevices.getDisplayMedia({
                                audio: false,
                                video: {
                                  width: document.getElementById('v_width').value,
								  height:document.getElementById('v_height').value
                                }
                                }).then((stream2) => {
									handleStream(stream2);
								});
                                
                                
                               
                            } catch (e) {
                                console.log(e)
                            }
	});
	$(document).on('click','#scrComAudio',function(){
		                            try {
                                 navigator.mediaDevices.getDisplayMedia({
                                audio: true,
                                video: {
                                  width: document.getElementById('v_width').value,
								  height:document.getElementById('v_height').value
                                }
                                }).then((stream2) => {
									handleStream(stream2);
								});
                                
                                
                               
                            } catch (e) {
                                console.log(e)
                            }
	});
	
	/* screenshare ends */ 
	
	
	
    // Create Producers for audio and video.
      audioProducer = room.createProducer(audioTrack,[],{"trackType":"cam"});
      videoProducer = room.createProducer(videoTrack,[],{"trackType":"cam"});
	  videoProducer.enableStats(1000);
 	  audioProducer.enableStats(1000);
    // Send our audio.
    audioProducer.send(sendTransport);
    // Send our video.
    videoProducer.send(sendTransport);
	 
	 videoProducer.on('stats', function(stats){
	//  console.log(stats[0]);
 		
		 var kBps = Math.round(stats[0].bitrate / 1024 / 8);
        ivideokBps.innerHTML = kBps;
		ivideokBps_type.innerHTML=stats[0].mimeType;
		
	 });


	 audioProducer.on('stats', function(stats){
	//	console.log(stats[0].bitrate);
 		
		 var kBps = Math.round(stats[0].bitrate / 1024 / 8);
        iaudiokBps.innerHTML = kBps;
		iaudiokBps_type.innerHTML=stats[0].mimeType;
		
	 });
	 
	capture.style.display="none";
	stopCapture.style.display="inline";
	
  });
});

}



function startCam(){
	 

}