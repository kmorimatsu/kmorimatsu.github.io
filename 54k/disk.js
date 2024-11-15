/*********************************
*  CP/KM web written by Katsumi  *
*    This script is released     *
*      under the LGPL v2.1.      *
*********************************/

/*
	Public methods:
	disk.read(pos);
	disk.write(pos);
	disk.update(data);
	disk.saveLink(obj);
*/

disk=new Object();
disk.read=function(pos){
	pos*=128;
	for(var i=0;i<128;i++){
		memory.ram[0xdf80+i]=this.cpmdisks[pos+i];
	}
};
disk.write=function(pos){
	pos*=128;
	for(var i=0;i<128;i++){
		this.cpmdisks[pos+i]=memory.ram[0xdf80+i];
	}
};
disk.cpmdisks=Array(128*64*244*4);
disk.update=function(data){
	for(var i=0;i<data.length;i++) {
		this.cpmdisks[i]=data[i];
	}
};
disk.saveLink=function(obj){
	// Construct ZIP archive containing "cpmdisks"
	var zip = new JSZip();
	zip.file("cpmdisks",this.cpmdisks);
	var data="data:application/zip;base64,";
	data+=zip.generate({type:"base64",compression: "DEFLATE"});
	// Update href property of a tag
	obj.href=data;
	obj.click();
};
disk.init=function(){
	for(var i=0;i<128*64*244*4;i++) {
		this.cpmdisks[i]=0x00;
	}
	// Construct fake CPM copy 
	var re=/:([0-9A-F]{2})([0-9A-F]{4})([0-9A-F]{2})([0-9A-F]*)([0-9A-F]{2})/i;
	var ihxdata=this.diskdata.split("\n");
	for(var i=0;i<ihxdata.length;i++){
		var m=ihxdata[i].match(re);
		// If not ":.....", skip
		if (!m) continue;
		// Fetch data from each line.
		var bytes=parseInt(m[1],16);
		var addr=parseInt(m[2],16);
		var mode=parseInt(m[3],16);
		var csum=parseInt(m[5],16);
		// If mode is not "00" skip
		if (mode!=0) continue;
		// Pick up all byte data and write to memory
		for(var j=0;j<bytes;j++){
			var b=parseInt(m[4].substr(j*2,2),16);
			this.cpmdisks[addr+j-0xbc00]=b;
		}
		// Checksum is ignored.
	}
};
disk.diskdata=(function(){/*
:20BC0000F33100BC2115BC0E0ACD0CD24E23AFB920F77618EB0A0A546F20737461727420E1
:20BC200043502F4D20322E322C20612076616C6964206469736B20696D61676520636F6E18
:20BC40007461696E696E672043504D2E53595320697320726575697265642E0A546F206F37
:20BC6000627461696E20746865206469736B20696D6167652C20676F20746F3A0A687474AE
:20BC800070733A2F2F7777772E72616435312E6E65742F70726F6A656374732F63706D2F4D
:02BCA0000A0098
:00000001FF
*/}).toString().match(/\/\*([\s\S]*)\*\//)[1];
disk.init();
/*
; This is fake CP/M system file.
; To obtain valid disk image file containing CP/M (ver 2.2), go to:
; https://www.rad51.net/projects/cpm/
; 
; This file can be assembled by SDCC:
; sdasz80 -o %1
; sdcc *.rel -mz80 --code-loc 0xbc00 --data-loc 0xdc00 --no-std-crt0

CONOUT       =0xd20c

.area _CODE

startAddress:
	di
	ld sp,#startAddress
	ld hl,#infoString

	ld c,#0x0a
loop:
	call CONOUT
	ld c,(hl)
	inc hl
	xor a
	cp c
	jr nz,loop

	halt
	jr startAddress

infoString:
	.db 0x0a
	.db 0x0a
	.ascii "To start CP/M 2.2, a valid disk image containing CPM.SYS is reuired."
	.db 0x0a
	.ascii "To obtain the disk image, go to:"
	.db 0x0a
	.ascii "https://www.rad51.net/projects/cpm/"
	.db 0x0a
	.db 0
*/
