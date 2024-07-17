/**********************************
* KM-BASIC web written by Katsumi *
*     This script is released     *
*       under the LGPL v2.1.      *
**********************************/

button=new Object();
button.bindata=0;
button.run=function(state){
	switch(state){
		case 1:
			display.cls();
			display.printstr("BASIC KM-1100\n");
			setTimeout("button.run(2)", 1000);
			return;
		case 2:
			display.printstr("Compilling...");
			basic.compile(dom.getElement('basicsource').value);
			display.printstr("done\n");
			setTimeout("button.run(3)", 1000);
			return;
		case 3:
			music.init();
			basic.run();
			dom.getElement("RUNbutton").disabled=1;
			dom.getElement("STOPbutton").focus();
			return;
		default:
			button.run(1);
			return;
	}
};
button.stop=function(){
	if (basic.binary.length) {
		basic.binary=[];
		display.printstr("\nOK\n");
	}
	dom.getElement("RUNbutton").disabled=0;
};
button.fire=function(down){
	if (down) {
		this.bindata|=0x20;
	} else {
		this.bindata&=0x1F;
	}
};
button.start=function(down){
	if (down) {
		this.bindata|=0x10;
	} else {
		this.bindata&=0x2F;
	}
};
button.right=function(down){
	if (down) {
		this.bindata|=0x08;
	} else {
		this.bindata&=0x37;
	}
};
button.left=function(down){
	if (down) {
		this.bindata|=0x04;
	} else {
		this.bindata&=0x3B;
	}
};
button.down=function(down){
	if (down) {
		this.bindata|=0x02;
	} else {
		this.bindata&=0x3D;
	}
};
button.up=function(down){
	if (down) {
		this.bindata|=0x01;
	} else {
		this.bindata&=0x3E;
	}
};
button.key=function(code,down){
	switch(code){
		case 70: // 'F'
			this.fire(down);
			return;
		case 83: // 'S'
			this.start(down);
			return;
		case 38:
			this.up(down);
			return;
		case 40:
			this.down(down);
			return;
		case 37:
			this.left(down);
			return;
		case 39:
			this.right(down);
			return;
		default:
			return;
	}
};
