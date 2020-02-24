/************************************
* MachiKania web written by Katsumi *
*      This script is released      *
*        under the LGPL v2.1.       *
************************************/

/*
	Public methods:
	display.init(FontData);
	display.write(addr,data);
*/

display=new Object();
display.fonts=new Image();
display.font=new Array(256);
display.prevview=new Array();
display.width=36;
display.init=function(FontData){
	var i,x,y,fd,h8,l8;
	// Set the contexts.
	this.context=dom.getContext("display");
	this.context.fillStyle   = "rgb(0, 0, 0)";
	this.context.fillRect(0,0,384,216);
	this.context.fillStyle   = "rgb(255, 255, 255)";
	// Show all fonts first
	for(i=0;i<256;i++){
		for(y=0;y<8;y++){
			fd=system.read8(FontData+i*8+y);
			for(x=0;x<8;x++){
				if (fd & (0x80>>x)) this.context.fillRect((i&15)*8+x,(i>>4)*8+y,1,1);
			}
		}
	}
	// Construction of images for font
	for (h8=0;h8<16;h8++) {
		for (l8=0;l8<16;l8++) {
			this.font[h8*16+l8]=this.context.getImageData(l8*8,h8*8,8,8);
		}
	}
};
display.all=function(){
	var data,posy,posx,addr;
	this.readPos=this.writePos;
	for (posy=0;posy<27;posy++) {
		for (posx=0;posx<this.width;posx++) {
			addr=posy*this.width+posx;
			if ((addr&3)==0) {
				data=system.read32(system.pTVRAM+addr);
			}
			this.context.putImageData(this.font[(data>>((addr&3)*8))&255],posx<<3,posy<<3);
		}
	}
};
display.show=function(msec){
	setTimeout(function(){
			display.all();
			setTimeout(arguments.callee,msec);
		},msec);
};
display.set_videomode=function(mode,gvram){
//void set_videomode(unsigned char m, unsigned char *gvram); //�r�f�I���[�h�̐؂�ւ�
	var VMODE_T30=0; // �W���e�L�X�g30�����݊����[�h
	var VMODE_STDTEXT=1; // �W���e�L�X�g36�������[�h
	var VMODE_T40=2; // �W���e�L�X�g40�����݊����[�h�i6�h�b�g�t�H���g�j
	var VMODE_WIDETEXT=3; // ���C�h�e�L�X�g48�������[�h
	var VMODE_WIDETEXT6dot=4; // ���C�h�e�L�X�g64�������[�h�i6�h�b�g�t�H���g�j
	var VMODE_MONOTEXT=5; // ���m�N���e�L�X�g80�������[�h
	var VMODE_ZOEAGRPH=16; // type Z�݊��O���t�B�b�N���[�h
	var VMODE_STDGRPH=17; // �W���O���t�B�b�N�{�e�L�X�g36�������[�h
	var VMODE_WIDEGRPH=18; // ���C�h�O���t�B�b�N�{�e�L�X�g48�������[�h
	if (gvram) this.gvram=gvram;
	switch(mode){
		case VMODE_T30: // �W���e�L�X�g30�����݊����[�h
			this.width=30;
			break;
		case VMODE_STDTEXT: // �W���e�L�X�g36�������[�h
			this.width=36;
			break;
		case VMODE_T40: // �W���e�L�X�g40�����݊����[�h�i6�h�b�g�t�H���g�j
			this.width=40;
			break;
		case VMODE_WIDETEXT: // ���C�h�e�L�X�g48�������[�h
			this.width=48;
			break;
		case VMODE_WIDETEXT6dot: // ���C�h�e�L�X�g64�������[�h�i6�h�b�g�t�H���g�j
			this.width=64;
			break;
		case VMODE_MONOTEXT: // ���m�N���e�L�X�g80�������[�h
			this.width=80;
			break;
		case VMODE_ZOEAGRPH: // type Z�݊��O���t�B�b�N���[�h
			alert('VMODE_ZOEAGRPH');
			break;
		case VMODE_STDGRPH: // �W���O���t�B�b�N�{�e�L�X�g36�������[�h
			alert('VMODE_STDGRPH');
			break;
		case VMODE_WIDEGRPH: // ���C�h�O���t�B�b�N�{�e�L�X�g48�������[�h
			alert('VMODE_WIDEGRPH');
			break;
		default:
			system.exception("Wrong video mode: "+m);
			return 0;
	}
}
