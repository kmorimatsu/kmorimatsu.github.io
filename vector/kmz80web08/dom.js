/********************************
* KM-Z80 web written by Katsumi *
*    This script is released    *
*      under the LGPL v2.1.     *
********************************/

window.onkeydown=function(e){
 	i8255.keydown(e.keyCode);
	return false;
};
window.onkeyup=function(e){
 	i8255.keyup(e.keyCode);
	return false;
};

dom=Object();
dom.getElement=function(id){
	var ret=document.getElementById(id);
	return ret;
};
dom.getContext=function(id){
	var ret=document.getElementById(id).getContext("2d");
	return ret;
};
dom.blankDisplay=function(){
	// Show blank canvas
	document.getElementById("blank").style.display="block";
};
dom.showDisplay=function(){
	// Hide blank canvas.
	document.getElementById("blank").style.display="none";
};
dom.useWorker=false;
dom.showSpeed=function(speed){
	document.getElementById("speed").innerHTML="clock: "+speed
		+(this.useWorker ? " hz (Web Workers)" : " hz");
};
dom.showDebug=function(){
	var classes=document.getElementsByClassName("debug");
	for(i=0;i<classes.length;i++){
		classes[i].style.display="block";
	}
};
dom.debug=function(str){
	document.getElementById("debug").innerHTML=str;
};
dom.displaylog=function(str){
	document.getElementById("displaylog").innerHTML+=str;
};
dom.dump=function(str){
	document.getElementById("dump").innerHTML=str;
};
dom.clickStep=function(){
	clickStep();
};
dom.clickCont=function(){
	clickCont();
};
dom.clickStopAt=function(){
	clickStopAt(prompt('Break at (hex):'));
};
dom.clickLogTo=function(){
	clickLogTo(prompt('Log to (hex):'));
};
dom.clickDump=function(){
	clickDump(prompt('Dump at (hex):'));
};

