sfreq=32000;
sfreq50=sfreq*0.5;
sfreq20=sfreq*0.2;
sfreq10=sfreq*0.1;
sfreq02=sfreq*0.02;
setSfreq=function(freq){
	sfreq=freq;
	sfreq50=sfreq*0.5;
	sfreq20=sfreq*0.2;
	sfreq10=sfreq*0.1;
	sfreq02=sfreq*0.02;
};
if ((typeof AudioContext)!="undefined"){
	play=function(data,num){
		var audio=new Audio();
		audio.context=new AudioContext();
		audio.rate=audio.context.sampleRate;
		audio.node=audio.context.createScriptProcessor(512, 1, 1);
		audio.node.onaudioprocess=function(e){ audio.process(e); };
		pos=0;
		// audio.process will be called periodically.
		audio.process=function(e){
			var i;
			var pdata=e.outputBuffer.getChannelData(0);
			for(i=0;i<pdata.length;i++){
				pdata[i]=data[num][pos++];
			}
			if (data[num].length<=pos) {
				audio.node.disconnect();
				if (typeof data[num+1]!="undefined") {
					play(data,num+1);
				}
			}
		};
		audio.node.connect(audio.context.destination);
	};
	setTimeout(function(){
			try {
				document.getElementById("sfreq").value="48000";
				document.getElementById("sfreq").onchange();
				document.getElementById("sfreq").disabled=true;
			} catch(e) {
				setTimeout(arguments.callee,100);
			}
		},100);
} else if ((typeof webkitAudioContext)!="undefined"){
	play=function(data,num){
		var audio=new Audio();
		audio.context=new webkitAudioContext();
		audio.rate=audio.context.sampleRate;
		audio.node=audio.context.createJavaScriptNode(512, 1, 1);
		audio.node.onaudioprocess=function(e){ audio.process(e); };
		pos=0;
		// audio.process will be called periodically.
		audio.process=function(e){
			var i;
			var pdata=e.outputBuffer.getChannelData(0);
			for(i=0;i<pdata.length;i++){
				pdata[i]=data[num][pos++];
			}
			if (data[num].length<=pos) {
				audio.node.disconnect();
				if (typeof data[num+1]!="undefined") {
					play(data,num+1);
				}
			}
		};
		audio.node.connect(audio.context.destination);
	};
	setTimeout(function(){
			try {
				document.getElementById("sfreq").value="48000";
				document.getElementById("sfreq").onchange();
				document.getElementById("sfreq").disabled=true;
			} catch(e) {
				setTimeout(arguments.callee,100);
			}
		},100);
}
piano=new Object();
// 445.449359 Hz is similar to frequency used by Wiener Philharmoniker.
// With this, piano.b will be 500 Hz, which is 1/64 of sampling rate of 32000 Hz.
piano.fork=445.449359;
piano.c=function(o){
	if (!o) o=0;
	return this.fork*0.594604*Math.pow(2,o);
};
piano.cs=function(o){
	if (!o) o=0;
	return this.fork*0.629961*Math.pow(2,o);
};
piano.df=piano.cs;
piano.d=function(o){
	if (!o) o=0;
	return this.fork*0.667420*Math.pow(2,o);
};
piano.ds=function(o){
	if (!o) o=0;
	return this.fork*0.707168*Math.pow(2,o);
};
piano.ef=piano.ds;
piano.e=function(o){
	if (!o) o=0;
	return this.fork*0.741535*Math.pow(2,o);
};
piano.f=function(o){
	if (!o) o=0;
	return this.fork*0.793701*Math.pow(2,o);
};
piano.fs=function(o){
	if (!o) o=0;
	return this.fork*0.840896*Math.pow(2,o);
};
piano.gf=piano.fs;
piano.g=function(o){
	if (!o) o=0;
	return this.fork*0.890899*Math.pow(2,o);
};
piano.gs=function(o){
	if (!o) o=0;
	return this.fork*0.943874*Math.pow(2,o);
};
piano.af=piano.gs;
piano.a=function(o){
	if (!o) o=0;
	return this.fork*Math.pow(2,o);
}
piano.as=function(o){
	if (!o) o=0;
	return this.fork*1.059463*Math.pow(2,o);
};
piano.bf=piano.as;
piano.b=function(o){
	if (!o) o=0;
	return this.fork*1.122462*Math.pow(2,o);
};
addMusic=function(data,pos,freq,len){
	var volume;
	var i;
	var count=0;
	len=len*sfreq;
	if (freq) {
		freq=sfreq/freq;
		for (i=0;i<len;i++) {
			if (!data[pos+i]) data[pos+i]=0;
			if (freq<(++count)) count=0;
			//volume=1-i/len; // Harmonica
			//volume=1-i/len; // Cembalo
			volume=1;
			if (count<(freq>>1)) data[pos+i]-=volume*0.1;
			else data[pos+i]+=volume*0.1;//*/
			/*if (count<volume*(freq>>1)) { // Cembalo or Harmonica
			} else if (count<(freq>>1)) {
				data[pos+i]-=volume*0.1;
			} else if(count<(1+volume)*(freq>>1))  {
			} else {
				data[pos+i]+=volume*0.1;
			}//*/
			//data[pos+i]+=volume*0.1*Math.sin(2*Math.PI*count/freq); // Marimba
			//data[pos+i]+=volume*0.1*Math.cos(Math.PI*count/freq); // Cembalo
		}
	} else {
		for (i=0;i<len;i++) {
			if (!data[pos+i]) data[pos+i]=0;
		}
	}
	return parseInt(pos+len);
};
playScore=function(score){
	play([readScore(score)],0);
};
readScore=function(score){
	var i,re,line,t;
	var pos=0;
	var nextpos;
	var data=new Array();
	var tempo;//=2*60/score[0];
	var len,lenstr;
	var repeat=[0,2,0]; // [pos,num,child]
	for (i=0;i<score.length;i++) {
		line=score[i];
		if (parseInt(line)) {
			// If it is a number, set tempo.
			tempo=2*60/parseInt(line);
			lenstr="t1 ";
			continue;
		}
		line=line.toLowerCase();
		re=line.match(/^\-t([0-9]+)$/);
		if (re) {
			// Back position
			pos-=sfreq*tempo/parseInt(re[1],10);
			continue;
		}
		if (line=="next") {
			// Return to repeat position
			if (0<(--repeat[1])) {
				i=repeat[0];
			} else if (repeat[2]) {
				repeat=repeat[2];
			} else {
				repeat=[0,2,0];
			}
			continue;
		}
		re=line.match(/^repeat\(([0-9]+)\)$/);
		if (re) {
			// Set repeat position and number
			// Current repeat array is also included as a child.
			repeat=[i,re[1],repeat];
			continue;
		}
		line=lenstr+line;
		while (line.length) {
			re=line.match(/^[\S]+[\s]*/);
			if (!re) break;
			line=line.substr(re[0].length,line.length-re[0].length);
			re=re[0].match(/^([a-z]+)[\(]?([\-]?[0-9]*)[\)]?/);
			if (!re) {
				alert("Error in score("+(i+1).toString(10)+"): "+score[i]);
				return;
			}
			if (re[1]=="t" && 0<re[2]) {
				len=tempo/parseInt(re[2],10);
				lenstr="t"+re[2]+" ";
				nextpos=addMusic(data,pos,0,len);
				continue;
			}
			if (!re[2]) re[2]="0";
			try {
				addMusic(data,pos,piano[re[1]](re[2]),len);
			} catch(e) {
				alert("Error in score("+(i+1).toString(10)+"): "+score[i]);
				return;
			}
		}
		pos=nextpos;
	}
	return data;
};
makeWave=function(data){
	var i,t;
	var wave=new Array();
	var wpos=0;
	var addStr=function(str,size,pos){
		if (pos) {
			for (i=0;i<size;i++) {
				wave[pos++]=str.charCodeAt(i);
			}
		} else {
			for (i=0;i<size;i++) {
				wave[wpos++]=str.charCodeAt(i);
			}
		}
	};
	var addInt=function(val,size,pos){
		if (pos) {
			for (i=0;i<size;i++) {
				wave[pos++]=val&0xff;
				val>>=8;
			}
		} else {
			for (i=0;i<size;i++) {
				wave[wpos++]=val&0xff;
				val>>=8;
			}
		}
	};
	// Construction of WAVE format.
	addStr("RIFF",4);
	var fileLenPos=wpos;
	addInt(0,4); // File length -8
	addStr("WAVE",4);
	addStr("fmt ",4);
	addInt(0x10,4); // Linear PCM
	addInt(1,2); // Format ID
	addInt(1,2); // Monoral
	addInt(sfreq,4);
	addInt(sfreq,4);
	addInt(1,2); // Block size (8 bit monoral)
	addInt(8,2); // 8 bits
	addStr("data",4);
	var dataLenPos=wpos;
	addInt(0,4); // Data length
	// wave data here.
	for (i=0;i<data.length;i++) {
		wave[wpos++]=parseInt((data[i]+1)*128);
	}
	addInt(wpos-fileLenPos-4,4,fileLenPos); // File length -8
	addInt(wpos-dataLenPos-4,4,dataLenPos); // Data length
	// Convert to string
	t="";
	for (i=0;i<wave.length;i++) {
		data=wave[i];
		if (data<16) {
			t+="%0";
			t+=data.toString(16);
		} else {
			t+="%";
			t+=data.toString(16);
		}
	}
	return t;
};
