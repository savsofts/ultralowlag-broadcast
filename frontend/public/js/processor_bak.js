 
	let processor = {
    timerCallback: function() {
      if (this.video.paused || this.video.ended) {
        return;
      }
      this.computeFrame();
      let self = this;
      setTimeout(function () {
          self.timerCallback();
        }, 0);
    },
  
    doLoad: function() {
      this.video = document.getElementById("myCamVideo");
	  
      this.c1 = document.getElementById("c1");
      this.ctx1 = this.c1.getContext("2d");
      this.c2 = document.getElementById("c2");
      this.ctx2 = this.c2.getContext("2d");
      this.c3 = document.getElementById("c3");
      this.ctx3 = this.c3.getContext("2d");
      let self = this;
      this.video.addEventListener("play", function() { console.log('v played');
          self.width = self.video.videoWidth;
          self.height = self.video.videoHeight;
          self.timerCallback();
        }, false);
    },
  
    computeFrame: function() {
		if(flayer=="camera"){
			this.ctx1.drawImage(document.getElementById("myCamVideo"), 0, 0, this.width, this.height);
		}else{
			if(document.getElementById("myShare") != undefined){
				this.ctx1.drawImage(document.getElementById("myShare"), 0, 0, this.width, this.height);
			}else{
				this.ctx1.drawImage(document.getElementById("myCamVideo"), 0, 0, this.width, this.height);
			}
			 
		}
	
	  if(document.getElementById("myShare") != undefined){
		  if(flayer=="camera"){
			this.ctx3.drawImage(document.getElementById("myShare"), 0, 0, this.width, this.height);
		  }else{
			this.ctx3.drawImage(document.getElementById("myCamVideo"), 0, 0, this.width, this.height);
		  }
		 // this.ctx2 = this.c2.getContext("2d");
	  } 
      let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
      let frame2 = this.ctx3.getImageData(0, 0, this.width, this.height);
          let l = frame.data.length / 4;
  
      for (let i = 0; i < l; i++) {
        let r = frame.data[i * 4 + 0];
        let g = frame.data[i * 4 + 1];
        let b = frame.data[i * 4 + 2];
		 
          if(r > r_min && r < r_max && g > g_min && g < g_max && b > b_min && b < b_max){
			  if(filterBG==1){
				  if((document.getElementById("myShare") != undefined) && document.getElementById("bgType").value=="scr"){
					   
				  frame.data[i * 4 + 0] = frame2.data[i * 4 + 0];
				  frame.data[i * 4 + 1] = frame2.data[i * 4 + 1];
				  frame.data[i * 4 + 2] = frame2.data[i * 4 + 2];
				  }else{
				   frame.data[i * 4 + 3] = 0;
				  }
			  }
		}else{
			// frame.data[i * 4 + 3] = 0;
		}
      } 
       this.ctx2.putImageData(frame, 0, 0);
      return;
    }
  };

document.addEventListener("DOMContentLoaded", () => {
  
});

 