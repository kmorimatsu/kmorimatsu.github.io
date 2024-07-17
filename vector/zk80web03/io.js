/*******************************
* ZK-80 web written by Katsumi *
*   This script is released    *
*     under the LGPL v2.1.     *
*******************************/

/*
	Public methods:
	io.read(addrL,addrH);
	io.write(addrL,addrH,data);
*/
io=new Object();
io.keymatrix=[0xff,0xff,0xff];
io.keydata=0xff;
io.loaded=0;
io.read=function(addrL,addrH){
	var ret;
	switch(addrL&0xff){
		case 0x9c: // Read from key matrix
			return this.keydata;
		case 0x9e: // Value of C register for waiting 4.5 msec
			clocks=speed*0.0045;
			ret=parseInt(clocks/3339)+1;
			return ret; // =0x03 when 2.048 MHz.
		case 0x9f: // Value of B register for waiting 4.5 msec
			clocks=speed*0.0045;
			clocks-=90;
			clocks-=parseInt(clocks/3339);
			ret=parseInt(clocks/13);
			if (ret==0) ret=1;
			if (255<ret) ret=0;
			return ret; // =0xbd when 2.048 MHz
		default:
			return 0xff;
	}
};
io.write=function(addrL,addrH,data){
	switch(addrL&0xff){
		case 0x9c: // Set row in key matrix
			this.keydata=0xff;
			if (!(data&0x01)) this.keydata&=io.keymatrix[0];
			if (!(data&0x02)) this.keydata&=io.keymatrix[1];
			if (!(data&0x04)) this.keydata&=io.keymatrix[2];
			return;
		case 0x9e: // Event handler 
			switch (data) {
				case 0x00: // STORE DATA
					file.store();
					return;
				case 0x01: // LOAD DATA
					file.load();
					return;
				default:
					return;
			}
		default:
			return;
	}
};
io.mousedown=function(x,y){
	display.mousedown(x,y);
	switch(y){
		case 0:
			switch(x){
				case 0:  // RET
					this.keymatrix[2]=0xfd; return;
				case 1:  // RUN
					this.keymatrix[2]=0xfe; return;
				case 2:  // STORE DATA
					this.keymatrix[2]=0xbf; return;
				case 3:  // LOAD DATA
					this.keymatrix[2]=0x7f; return;
				default: // RESET
					return;
			}
		case 1:
			switch(x){
				case 0:  // C
					this.keymatrix[1]=0xef; return;
				case 1:  // D
					this.keymatrix[1]=0xdf; return;
				case 2:  // E
					this.keymatrix[1]=0xbf; return;
				case 3:  // F
					this.keymatrix[1]=0x7f; return;
				default: // ADRS SET
					this.keymatrix[2]=0xfb; return;
			}
		case 2:
			switch(x){
				case 0:  // 8
					this.keymatrix[1]=0xfe; return;
				case 1:  // 9
					this.keymatrix[1]=0xfd; return;
				case 2:  // A
					this.keymatrix[1]=0xfb; return;
				case 3:  // B
					this.keymatrix[1]=0xf7; return;
				default: // READ INCR
				this.keymatrix[2]=0xef; return;
			}
		case 3:
			switch(x){
				case 0:  // 4
					this.keymatrix[0]=0xef; return;
				case 1:  // 5
					this.keymatrix[0]=0xdf; return;
				case 2:  // 6
					this.keymatrix[0]=0xbf; return;
				case 3:  // 7
					this.keymatrix[0]=0x7f; return;
				default: // READ DECR
					this.keymatrix[2]=0xf7; return;
			}
		default:
			switch(x){
				case 0:  // 0
					this.keymatrix[0]=0xfe; return;
				case 1:  // 1
					this.keymatrix[0]=0xfd; return;
				case 2:  // 2
					this.keymatrix[0]=0xfb; return;
				case 3:  // 3
					this.keymatrix[0]=0xf7; return;
				default: // WRITE INCR
					this.keymatrix[2]=0xdf; return;
			}
	}
};
io.mouseup=function(x,y){
	display.mouseup();
	this.keymatrix=[0xff,0xff,0xff];
	if (y==0 && x==4) z80.reset();
};
io.keydownnow=false;
io.keyup=function(code){
	this.keydownnow=false;
	if (code==0x09) return; // Toggle switch
	display.mouseup();
	this.keymatrix=[0xff,0xff,0xff];
	if (code==0x1b) z80.reset(); //esc
};
io.keydown=function(code){
	if (this.keydownnow) return;// Avoid key repeat.
	this.keydownnow=true;
	switch(code){
		case 0x09: //tab
			dom.clickToggle(); // Toggle switch
			return;
		case 0x20: //space
			this.mousedown(4,1);// ADRS SET
			return;
		case 0x28: //down
		case 0x27: //right
			this.mousedown(4,2);// READ INCR
			return;
		case 0x26: //up
		case 0x25: //left
			this.mousedown(4,3);// READ DECR
			return;
		case 0x1b: //esc
			this.mousedown(4,0);// RESET
			return;
		case 0x0d: //cr
			this.mousedown(4,4);// WRITE INCR
			return;
		case 0x52: //R
			this.mousedown(1,0);// RUN
			return;
		case 0x54: //T
			this.mousedown(0,0);// RET
			return;
		case 0x53: //S
			this.mousedown(2,0);// STORE DATA
			return;
		case 0x4C: //L
			this.mousedown(3,0);// LOAD DATA
			return;
		case 0x30: case 0x31: case 0x32: case 0x33:
			// 0-3
			this.mousedown(code-0x30,4);// 0-3
			return;
		case 0x34: case 0x35: case 0x36: case 0x37:
			this.mousedown(code-0x34,3);// 4-7
			return;
		case 0x38: case 0x39:
			this.mousedown(code-0x38,2);// 8-9
			return;
		case 0x41: case 0x42:
			this.mousedown(code-0x41+2,2);// A-B
			return;
		case 0x43: case 0x44: case 0x45: case 0x46:
			this.mousedown(code-0x43,1);// C-F
			return;
		default:
			return;
	}
};
