/*******************************
* ZK-80 web written by Katsumi *
*   This script is released    *
*     under the LGPL v2.1.     *
*******************************/

window.onkeydown=function(e){
 	io.keydown(e.keyCode);
	return false;
};
window.onkeyup=function(e){
 	io.keyup(e.keyCode);
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
dom.useWorker=false;
dom.showSpeed=function(speed){
	document.getElementById("speed").innerHTML="clock: "+speed
		+(this.useWorker ? " hz (Web Workers)" : " hz");
};
dom.x=function(obj,e){
	var x;
	if (typeof e.pageX != "undefined") { 
	  x = e.pageX;
	} else {
	  x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
	}
	x -= obj.offsetLeft;
	return x;
};
dom.y=function(obj,e){
	var y;
	if (typeof e.pageY != "undefined") { 
	  y = e.pageY;
	} else {
	  y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	}
	y -= obj.offsetTop;
	return y;
};
dom.clickToggle=function(){
	var obj=dom.getElement('tgswitch');
	dom.getElement('toggle').play();
	if ((''+obj.src).substr(-9)=='right.gif') {
		memory.stepRun();
		obj.src='./left.gif';
	} else {
		memory.autoRun();
		obj.src='./right.gif';
	}
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

