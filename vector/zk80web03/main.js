/*******************************
* ZK-80 web written by Katsumi *
*   This script is released    *
*     under the LGPL v2.1.     *
*******************************/

// Initialize Z80 CPU
var speed=2048000; // 2.048 Mhz
dom.showSpeed(speed);
var maxspeed=speed;
z80.setSpeed(speed);
z80.reset();
// Initialize Memory
memory.program=[// Tiny test program
0x01,0x00,0x49,0x21,0xf8,0x83,0xb5,0x6f,0x70,0x06,0x09,0xcd,0xef,0x02,0x10,0xfb,
0x3c,0x71,0x18,0xec
];
memory.init();
// The other initializations
if (get.debug  && typeof debugDisplay !="undefined") {
	dom.showDebug();
}
if (get.clock) {
	switch (get.clock.substr(-1)) {
		case "k": case "K":
			maxspeed=speed=parseFloat(get.clock.substr(0,get.clock.length-1))*1000;
			break;
		case "m": case "M":
			maxspeed=speed=parseFloat(get.clock.substr(0,get.clock.length-1))*1000000;
			break;
		case "g": case "G":
			maxspeed=speed=parseFloat(get.clock.substr(0,get.clock.length-1))*1000000000;
			break;
		default:
			maxspeed=speed=parseInt(get.clock,10);
			break;
	}
	z80.setSpeed(speed);
	dom.showSpeed(speed);
}
if (get.start) {
	z80.loadPC(parseInt(get.start,16));
	z80.loadSP(0x83c7);
}
// Following function will be called by initializing display.
start=function(){
	var time;
	time=new Date().getTime();
	setTimeout(function(){
			var from=time;
			var to=time=new Date().getTime();
			var msec=to-from;
			if (msec<50 && speed<maxspeed) {
				speed<<=1;
				if (125<speed && speed<250) speed=125;
				if (maxspeed<speed) speed=maxspeed;
				z80.setSpeed(speed);
				dom.showSpeed(speed);
			} else if (100<msec) {
				speed>>=1;
				if (speed<1) speed=1;
				z80.setSpeed(speed);
				dom.showSpeed(speed);
			}
			z80.exec(msec);
			if (z80.step) {
				showRegisters();
			} else {
				setTimeout(arguments.callee,10);
			}
		},10);
};
