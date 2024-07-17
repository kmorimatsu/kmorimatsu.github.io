/**********************************
* KM-BASIC web written by Katsumi *
*     This script is released     *
*       under the LGPL v2.1.      *
**********************************/

/*
	Notes:
	The number of palettes is stricted to 16.

*/

display=new Object();

display.chars=Array(16);
display.palette=Array(16);
display.vram=Array(30*27*2);
display.peek=function(addr){
	return this.vram[addr];
};
display.poke=function(addr,data){
	this.vram[addr]=data;
};
display.init=function(){
	var i,r,g,b,x,y;
	// Set the contexts.
	this.context=dom.getContext("display");
	this.fontContext=dom.getContext("font");
	// Initialize palette
	this.currentpalette=7;
	for(i=0;i<8;i++){
		b=255*(i&1);
		r=255*((i>>1)&1);
		g=255*(i>>2);
		this.palette[i]="rgb("+r.toString(10)+","+g.toString(10)+","+b.toString(10)+")";
	}
	for(i=8;i<16;i++){
		this.palette[i]="rgb(255,255,255)";
	}
	// Initialize vram
	for(i=0;i<30*27;i++){
		this.vram[i]=0x20;
		this.vram[i+30*27]=this.currentpalette;
	}
	// Prepare font characters.
	this.setbgcolor(0,0,0);
};
display.bgcolor="rgb(0,0,0)";
display.setbgcolor=function(r,g,b){
	var i;
	this.bgcolor="rgb("+r.toString(10)+","+g.toString(10)+","+b.toString(10)+")";
	for(i=0;i<16;i++){
		this.setfont(i);
	}
	this.refresh();
};
display.setpalette=function(pnum,r,g,b){
	this.palette[pnum]="rgb("+r.toString(10)+","+g.toString(10)+","+b.toString(10)+")";
	this.setfont(pnum);
	this.refresh();
};
display.setfont=function(pnum){
	var x,y,ascii;
	var r=this.bgcolor.r;
	this.chars[pnum]=Array(256);
	for(ascii=0;ascii<0x100;ascii++){
		for(y=0;y<8;y++){
			for(x=0;x<8;x++){
				if (this.font[ascii*8+y]&(1<<(8-x))){
					this.fontContext.fillStyle = this.palette[pnum];
				} else {
					this.fontContext.fillStyle = this.bgcolor;
				}
				this.fontContext.fillRect(x,y,1,1);
			}
		}
		this.chars[pnum][ascii]=this.fontContext.getImageData(0,0,8,8);
	}
};
display.cursorX=0;
display.cursorY=0;
display.cls=function(){
	this.cursorX=0;
	this.cursorY=0;
	// Initialize vram
	for(var i=0;i<30*27;i++){
		this.vram[i]=0x20;
		this.vram[30*27+i]=this.currentpalette;
	}
	// Clear screen
	for(y=0;y<27;y++){
		for(x=0;x<30;x++){
			this.context.putImageData(this.chars[this.currentpalette][0x20],x*8,y*8);
		}
	}
};
display.cursor=function(x,y){
	this.cursorX=x;
	this.cursorY=y;
};
display.color=function(pnum){
	this.currentpalette=pnum;
};
display.show=function(x,y){
	var char=this.vram[x+y*30];
	var palette=this.vram[x+(y+27)*30];
	this.context.putImageData(this.chars[palette][char&0xff],x*8,y*8);
};
display.charatcursor=-1;
display.cursortimer=function(show){
	if (0<=this.charatcursor) {
		if (show) {
			// 0x87 is full rectangle character
			this.vram[this.cursorX+this.cursorY*30]=0x87;
		} else {
			this.vram[this.cursorX+this.cursorY*30]=this.charatcursor;
		}
		this.show(this.cursorX,this.cursorY);
	}
	window.setTimeout(function(that){that.cursortimer(show?0:1);},250,this);
};
display.cursortimer(1);
display.showcursor=function(show){
	if (!show) {
		// Restore the original charactor
		this.vram[x+y*30]=this.charatcursor;
		this.charatcursor=-1;
	} else if (this.charatcursor<0) {
		// Store the character to activate the blinking timer.
		this.charatcursor=this.vram[this.cursorX+this.cursorY*30];
	}
	this.show(this.cursorX,this.cursorY);
};//*/
display.refresh=function(){
	var x,y;
	for(x=0;x<30;x++){
		for(y=0;y<27;y++){
			this.show(x,y);
		}
	}
};
display.printchar=function(char){
	var x=this.cursorX;
	var y=this.cursorY;
	if (char==0x0d || char==0x0a) {
		this.cursorX=30;
	} else {
		if (0xff00<char) char-=0xFF00-0x40; // Kana support
		this.vram[x+y*30]=char;
		this.vram[x+(y+27)*30]=this.currentpalette;
		this.show(x,y);
		this.cursorX++;
	}
	if (29<this.cursorX) {
		this.cursorX=0;
		this.cursorY++;
	}
	if (26<this.cursorY) {
		this.cursorY=26;
		// Shift up
		this.context.putImageData(this.context.getImageData(0,8,240,208),0,0);
		for(y=0;y<26;y++){
			for(x=0;x<30;x++){
				this.vram[x+y*30]=this.vram[x+(y+1)*30];
				this.vram[x+(y+27)*30]=this.vram[x+(y+28)*30];
			}
		}
		// Clear the bottom line.
		for(x=0;x<30;x++){
			this.context.putImageData(this.chars[this.currentpalette][0x20],x*8,208);
			this.vram[x+26*30]=0x20;
			
		}
	}
};
display.printstr=function(str){
	var i;
	for (i=0;i<str.length;i++){
		this.printchar(str.charCodeAt(i));
	}
};
display.printcomma=function(){
	var i;
	for(i=this.cursorX%10;i<10;i++){
		this.printchar(0x20);
	}
};
/*
	The font for KM-BASIC is provided personally for Katsumi,
	by Kenken (http://www.ze.em-net.ne.jp/~kenken/) with LGPL 2.1 license.
*/
display.font=[
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x08,0x0C,0xFE,0xFE,0x0C,0x08,0x00,
	0x00,0x20,0x60,0xFE,0xFE,0x60,0x20,0x00,
	0x18,0x3C,0x7E,0x18,0x18,0x18,0x18,0x00,
	0x00,0x18,0x18,0x18,0x18,0x7E,0x3C,0x18,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x30,0x30,0x30,0x30,0x00,0x00,0x30,0x00,
	0x6C,0x6C,0x6C,0x00,0x00,0x00,0x00,0x00,
	0x6C,0x6C,0xFE,0x6C,0xFE,0x6C,0x6C,0x00,
	0x18,0x7E,0xD8,0x7E,0x1A,0xFE,0x18,0x00,
	0xE0,0xE6,0x0C,0x18,0x30,0x6E,0xCE,0x00,
	0x78,0xCC,0xD8,0x70,0xDE,0xCC,0x76,0x00,
	0x0C,0x18,0x30,0x00,0x00,0x00,0x00,0x00,
	0x0C,0x18,0x30,0x30,0x30,0x18,0x0C,0x00,
	0x30,0x18,0x0C,0x0C,0x0C,0x18,0x30,0x00,
	0xD6,0x7C,0x38,0xFE,0x38,0x7C,0xD6,0x00,
	0x00,0x30,0x30,0xFC,0x30,0x30,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x30,0x30,0x60,
	0x00,0x00,0x00,0xFE,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x38,0x38,0x00,
	0x00,0x06,0x0C,0x18,0x30,0x60,0xC0,0x00,
	0x7C,0xC6,0xC6,0xC6,0xC6,0xC6,0x7C,0x00,
	0x18,0x38,0x78,0x18,0x18,0x18,0x7E,0x00,
	0x7C,0xC6,0x06,0x1C,0x70,0xC0,0xFE,0x00,
	0x7C,0xC6,0x06,0x3C,0x06,0xC6,0x7C,0x00,
	0x0C,0x1C,0x3C,0x6C,0xFE,0x0C,0x0C,0x00,
	0xFE,0xC0,0xF8,0x0C,0x06,0xCC,0x78,0x00,
	0x3C,0x60,0xC0,0xFC,0xC6,0xC6,0x7C,0x00,
	0xFE,0xC6,0x0C,0x18,0x30,0x30,0x30,0x00,
	0x7C,0xC6,0xC6,0x7C,0xC6,0xC6,0x7C,0x00,
	0x7C,0xC6,0xC6,0x7E,0x06,0x0C,0x78,0x00,
	0x00,0x30,0x00,0x00,0x00,0x30,0x00,0x00,
	0x00,0x30,0x00,0x00,0x00,0x30,0x30,0x60,
	0x0C,0x18,0x30,0x60,0x30,0x18,0x0C,0x00,
	0x00,0x00,0xFE,0x00,0xFE,0x00,0x00,0x00,
	0x60,0x30,0x18,0x0C,0x18,0x30,0x60,0x00,
	0x7C,0xC6,0x06,0x1C,0x30,0x00,0x30,0x00,
	0x3C,0x66,0xDE,0xF6,0xDC,0x60,0x3E,0x00,
	0x38,0x6C,0xC6,0xFE,0xC6,0xC6,0xC6,0x00,
	0xFC,0x66,0x66,0x7C,0x66,0x66,0xFC,0x00,
	0x3C,0x66,0xC0,0xC0,0xC0,0x66,0x3C,0x00,
	0xF8,0x6C,0x66,0x66,0x66,0x6C,0xF8,0x00,
	0xFE,0xC0,0xC0,0xF8,0xC0,0xC0,0xFE,0x00,
	0xFE,0xC0,0xC0,0xF8,0xC0,0xC0,0xC0,0x00,
	0x3C,0x66,0xC0,0xCE,0xC6,0x66,0x3C,0x00,
	0xC6,0xC6,0xC6,0xFE,0xC6,0xC6,0xC6,0x00,
	0x3C,0x18,0x18,0x18,0x18,0x18,0x3C,0x00,
	0x1E,0x0C,0x0C,0x0C,0x0C,0xCC,0x78,0x00,
	0xC6,0xCC,0xD8,0xF0,0xD8,0xCC,0xC6,0x00,
	0xC0,0xC0,0xC0,0xC0,0xC0,0xC0,0xFE,0x00,
	0xC6,0xEE,0xFE,0xD6,0xC6,0xC6,0xC6,0x00,
	0xC6,0xE6,0xF6,0xDE,0xCE,0xC6,0xC6,0x00,
	0x38,0x6C,0xC6,0xC6,0xC6,0x6C,0x38,0x00,
	0xFC,0xC6,0xC6,0xFC,0xC0,0xC0,0xC0,0x00,
	0x38,0x6C,0xC6,0xC6,0xDE,0x6C,0x3E,0x00,
	0xFC,0xC6,0xC6,0xFC,0xD8,0xCC,0xC6,0x00,
	0x7C,0xC6,0xC0,0x7C,0x06,0xC6,0x7C,0x00,
	0x7E,0x18,0x18,0x18,0x18,0x18,0x18,0x00,
	0xC6,0xC6,0xC6,0xC6,0xC6,0xC6,0x7C,0x00,
	0xC6,0xC6,0xC6,0x6C,0x6C,0x38,0x38,0x00,
	0xC6,0xC6,0xC6,0xD6,0xFE,0xEE,0xC6,0x00,
	0xC6,0xC6,0x6C,0x38,0x6C,0xC6,0xC6,0x00,
	0xCC,0xCC,0xCC,0x78,0x30,0x30,0x30,0x00,
	0xFE,0x06,0x0C,0x38,0x60,0xC0,0xFE,0x00,
	0x3C,0x30,0x30,0x30,0x30,0x30,0x3C,0x00,
	0xCC,0xCC,0x78,0xFC,0x30,0xFC,0x30,0x00,
	0x3C,0x0C,0x0C,0x0C,0x0C,0x0C,0x3C,0x00,
	0x30,0x78,0xCC,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0xFE,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x7C,0x0C,0x7C,0xCC,0x7E,0x00,
	0xC0,0xC0,0xFC,0xE6,0xC6,0xE6,0xFC,0x00,
	0x00,0x00,0x7C,0xC6,0xC0,0xC6,0x7C,0x00,
	0x06,0x06,0x7E,0xCE,0xC6,0xCE,0x7E,0x00,
	0x00,0x00,0x7C,0xC6,0xFE,0xC0,0x7C,0x00,
	0x1C,0x36,0x30,0xFC,0x30,0x30,0x30,0x00,
	0x00,0x00,0x7E,0xCE,0xCE,0x7E,0x06,0x7C,
	0xC0,0xC0,0xFC,0xE6,0xC6,0xC6,0xC6,0x00,
	0x18,0x00,0x38,0x18,0x18,0x18,0x3C,0x00,
	0x0C,0x00,0x1C,0x0C,0x0C,0x0C,0xCC,0x78,
	0xC0,0xC0,0xCC,0xD8,0xF0,0xF8,0xCC,0x00,
	0x38,0x18,0x18,0x18,0x18,0x18,0x3C,0x00,
	0x00,0x00,0xFC,0xB6,0xB6,0xB6,0xB6,0x00,
	0x00,0x00,0xFC,0xE6,0xC6,0xC6,0xC6,0x00,
	0x00,0x00,0x7C,0xC6,0xC6,0xC6,0x7C,0x00,
	0x00,0x00,0xFC,0xE6,0xE6,0xFC,0xC0,0xC0,
	0x00,0x00,0x7E,0xCE,0xCE,0x7E,0x06,0x06,
	0x00,0x00,0xDC,0xE6,0xC0,0xC0,0xC0,0x00,
	0x00,0x00,0x7E,0xC0,0x7C,0x06,0xFC,0x00,
	0x30,0x30,0xFC,0x30,0x30,0x36,0x1C,0x00,
	0x00,0x00,0xC6,0xC6,0xC6,0xCE,0x76,0x00,
	0x00,0x00,0xC6,0xC6,0xC6,0x6C,0x38,0x00,
	0x00,0x00,0x86,0xB6,0xB6,0xB6,0xFC,0x00,
	0x00,0x00,0xC6,0x6C,0x38,0x6C,0xC6,0x00,
	0x00,0x00,0xC6,0xC6,0xCE,0x7E,0x06,0x7C,
	0x00,0x00,0xFE,0x0C,0x38,0x60,0xFE,0x00,
	0x3C,0x60,0x60,0xC0,0x60,0x60,0x3C,0x00,
	0x30,0x30,0x00,0x00,0x00,0x30,0x30,0x00,
	0xF0,0x18,0x18,0x0C,0x18,0x18,0xF0,0x00,
	0x60,0xB6,0x1C,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xFF,
	0x00,0x00,0x00,0x00,0x00,0x00,0xFF,0xFF,
	0x00,0x00,0x00,0x00,0x00,0xFF,0xFF,0xFF,
	0x00,0x00,0x00,0x00,0xFF,0xFF,0xFF,0xFF,
	0x00,0x00,0x00,0xFF,0xFF,0xFF,0xFF,0xFF,
	0x00,0x00,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
	0x00,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
	0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,
	0x80,0x80,0x80,0x80,0x80,0x80,0x80,0x80,
	0xC0,0xC0,0xC0,0xC0,0xC0,0xC0,0xC0,0xC0,
	0xE0,0xE0,0xE0,0xE0,0xE0,0xE0,0xE0,0xE0,
	0xF0,0xF0,0xF0,0xF0,0xF0,0xF0,0xF0,0xF0,
	0xF8,0xF8,0xF8,0xF8,0xF8,0xF8,0xF8,0xF8,
	0xFC,0xFC,0xFC,0xFC,0xFC,0xFC,0xFC,0xFC,
	0xFE,0xFE,0xFE,0xFE,0xFE,0xFE,0xFE,0xFE,
	0x18,0x18,0x18,0x18,0xFF,0x18,0x18,0x18,
	0x18,0x18,0x18,0x18,0xFF,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0xFF,0x18,0x18,0x18,
	0x18,0x18,0x18,0x18,0xF8,0x18,0x18,0x18,
	0x18,0x18,0x18,0x18,0x1F,0x18,0x18,0x18,
	0xFF,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0xFF,0x00,0x00,0x00,
	0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x18,
	0x03,0x03,0x03,0x03,0x03,0x03,0x03,0x03,
	0x00,0x00,0x00,0x00,0x1F,0x18,0x18,0x18,
	0x00,0x00,0x00,0x00,0xF8,0x18,0x18,0x18,
	0x18,0x18,0x18,0x18,0x1F,0x00,0x00,0x00,
	0x18,0x18,0x18,0x18,0xF8,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x07,0x0C,0x18,0x18,
	0x00,0x00,0x00,0x00,0xE0,0x30,0x18,0x18,
	0x18,0x18,0x18,0x0C,0x07,0x00,0x00,0x00,
	0x18,0x18,0x18,0x30,0xE0,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x78,0x68,0x78,0x00,
	0x78,0x60,0x60,0x60,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x18,0x18,0x18,0x78,0x00,
	0x00,0x00,0x00,0x00,0x60,0x30,0x18,0x00,
	0x00,0x00,0x00,0x30,0x00,0x00,0x00,0x00,
	0xFE,0x06,0x06,0xFE,0x06,0x0C,0x78,0x00,
	0x00,0x00,0xFC,0x0C,0x38,0x30,0x60,0x00,
	0x00,0x00,0x0C,0x18,0x38,0x78,0x18,0x00,
	0x00,0x00,0x30,0xFC,0xCC,0x0C,0x38,0x00,
	0x00,0x00,0x00,0xFC,0x30,0x30,0xFC,0x00,
	0x00,0x00,0x18,0xFC,0x38,0x78,0xD8,0x00,
	0x00,0x00,0x60,0xFC,0x6C,0x68,0x60,0x00,
	0x00,0x00,0x00,0x78,0x18,0x18,0xFC,0x00,
	0x00,0x00,0x7C,0x0C,0x7C,0x0C,0x7C,0x00,
	0x00,0x00,0x00,0xAC,0xAC,0x0C,0x38,0x00,
	0x00,0x00,0x00,0xFE,0x00,0x00,0x00,0x00,
	0xFE,0x06,0x06,0x34,0x38,0x30,0x60,0x00,
	0x06,0x0C,0x18,0x38,0x78,0xD8,0x18,0x00,
	0x18,0xFE,0xC6,0xC6,0x06,0x0C,0x38,0x00,
	0x00,0x7E,0x18,0x18,0x18,0x18,0x7E,0x00,
	0x18,0xFE,0x18,0x38,0x78,0xD8,0x18,0x00,
	0x30,0xFE,0x36,0x36,0x36,0x36,0x6C,0x00,
	0x18,0x7E,0x18,0x7E,0x18,0x18,0x18,0x00,
	0x3E,0x66,0xC6,0x0C,0x18,0x30,0xE0,0x00,
	0x60,0x7E,0xD8,0x18,0x18,0x18,0x30,0x00,
	0x00,0xFE,0x06,0x06,0x06,0x06,0xFE,0x00,
	0x6C,0xFE,0x6C,0x0C,0x0C,0x18,0x30,0x00,
	0x00,0xF0,0x00,0xF6,0x06,0x0C,0xF8,0x00,
	0xFE,0x06,0x0C,0x18,0x38,0x6C,0xC6,0x00,
	0x60,0xFE,0x66,0x6C,0x60,0x60,0x3E,0x00,
	0xC6,0xC6,0x66,0x06,0x0C,0x18,0xF0,0x00,
	0x3E,0x66,0xE6,0x3C,0x18,0x30,0xE0,0x00,
	0x0C,0x78,0x18,0xFE,0x18,0x18,0xF0,0x00,
	0x00,0xD6,0xD6,0xD6,0x0C,0x18,0xF0,0x00,
	0x7C,0x00,0xFE,0x18,0x18,0x30,0x60,0x00,
	0x30,0x30,0x38,0x3C,0x36,0x30,0x30,0x00,
	0x18,0x18,0xFE,0x18,0x18,0x30,0x60,0x00,
	0x00,0x7C,0x00,0x00,0x00,0x00,0xFE,0x00,
	0x00,0x7E,0x06,0x6C,0x18,0x36,0x60,0x00,
	0x18,0x7E,0x0C,0x18,0x3C,0x7E,0x18,0x00,
	0x06,0x06,0x06,0x0C,0x18,0x30,0x60,0x00,
	0x30,0x18,0x0C,0xC6,0xC6,0xC6,0xC6,0x00,
	0xC0,0xC0,0xFE,0xC0,0xC0,0xC0,0x7E,0x00,
	0x00,0xFE,0x06,0x06,0x0C,0x18,0x70,0x00,
	0x00,0x30,0x78,0xCC,0x06,0x06,0x00,0x00,
	0x18,0x18,0xFE,0x18,0xDB,0xDB,0x18,0x00,
	0xFE,0x06,0x06,0x6C,0x38,0x30,0x18,0x00,
	0x00,0x3C,0x00,0x3C,0x00,0x7C,0x06,0x00,
	0x0C,0x18,0x30,0x60,0xCC,0xFC,0x06,0x00,
	0x02,0x36,0x3C,0x18,0x3C,0x6C,0xC0,0x00,
	0x00,0xFE,0x30,0xFE,0x30,0x30,0x3E,0x00,
	0x30,0x30,0xFE,0x36,0x3C,0x30,0x30,0x00,
	0x00,0x78,0x18,0x18,0x18,0x18,0xFE,0x00,
	0xFE,0x06,0x06,0xFE,0x06,0x06,0xFE,0x00,
	0x7C,0x00,0xFE,0x06,0x0C,0x18,0x30,0x00,
	0xC6,0xC6,0xC6,0x06,0x06,0x0C,0x38,0x00,
	0x6C,0x6C,0x6C,0x6E,0x6E,0x6C,0xC8,0x00,
	0x60,0x60,0x60,0x66,0x6C,0x78,0x70,0x00,
	0x00,0xFE,0xC6,0xC6,0xC6,0xC6,0xFE,0x00,
	0x00,0xFE,0xC6,0xC6,0x06,0x0C,0x38,0x00,
	0x00,0xF0,0x06,0x06,0x0C,0x18,0xF0,0x00,
	0x18,0xCC,0x60,0x00,0x00,0x00,0x00,0x00,
	0x70,0xD8,0x70,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0xFF,0x00,0x00,0xFF,0x00,0x00,
	0x18,0x18,0x1F,0x18,0x18,0x1F,0x18,0x18,
	0x18,0x18,0xFF,0x18,0x18,0xFF,0x18,0x18,
	0x18,0x18,0xF8,0x18,0x18,0xF8,0x18,0x18,
	0x01,0x03,0x07,0x0F,0x1F,0x3F,0x7F,0xFF,
	0x80,0xC0,0xE0,0xF0,0xF8,0xFC,0xFE,0xFF,
	0xFF,0x7F,0x3F,0x1F,0x0F,0x07,0x03,0x01,
	0xFF,0xFE,0xFC,0xF8,0xF0,0xE0,0xC0,0x80,
	0x10,0x38,0x7C,0xFE,0xFE,0x38,0x7C,0x00,
	0x6C,0xFE,0xFE,0xFE,0x7C,0x38,0x10,0x00,
	0x10,0x38,0x7C,0xFE,0x7C,0x38,0x10,0x00,
	0x38,0x38,0xFE,0xFE,0xD6,0x10,0x7C,0x00,
	0x00,0x3C,0x7E,0x7E,0x7E,0x7E,0x3C,0x00,
	0x00,0x7C,0xC6,0xC6,0xC6,0xC6,0x7C,0x00,
	0x03,0x06,0x0C,0x18,0x30,0x60,0xC0,0x80,
	0x80,0xC0,0x60,0x30,0x18,0x0C,0x06,0x03,
	0x83,0xC6,0x6C,0x38,0x38,0x6C,0xC6,0x83,
	0xFE,0xB6,0xB6,0xFE,0x86,0x86,0x86,0x00,
	0xC0,0xFE,0xD8,0x7E,0x58,0xFE,0x18,0x00,
	0x7E,0x66,0x7E,0x66,0x7E,0x66,0xC6,0x00,
	0xFE,0xC6,0xC6,0xFE,0xC6,0xC6,0xFE,0x00,
	0x06,0xEF,0xA6,0xFF,0xA2,0xFF,0x0A,0x06,
	0x00,0x38,0x6C,0xC6,0x7C,0x34,0x6C,0x00,
	0xFC,0x6C,0xFE,0x6E,0xF6,0xEC,0x6C,0x78,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
	0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
];