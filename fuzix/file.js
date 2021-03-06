/*********************************
*  FZ/KM web written by Katsumi  *
*    This script is released     *
*       under the GPL v2.0       *
*********************************/

/*
	Public methods:
	file.loaded(obj);
	file.setFile(obj);
*/
file=new Object();
file.data=0;
file.setFile=function(obj){
	// Show the file upload input.
	obj.style.display='block';
	// Show the dialog to upload local file.
	obj.click();
};
file.name='';
file.loaded=function(obj){
	// This will be called when a file is uploaded.
	// If FileReader API is not supported, following code will fail.
	var fr = new FileReader();
	fr.onload = function () {
		var data=new Uint8Array(fr.result);
		file.update(data);
	};
	this.name=obj.files[0].name;
	fr.readAsArrayBuffer(obj.files[0]);
	obj.style.display='none';
};
file.update=function(data){
	// This will be called when a file is sucessfully loaded by FileReader API.
	// Data will be given as an array
	// Check if ZIP archive.
	if (data[0]==0x50 && data[1]==0x4B && data[2]==0x03 && data[3]==0x04) {
		// Zip archive
		var zip=new JSZip(data);
		var data2=zip.file("tomssbc-0.3.ide").asUint8Array();
		data=data2;
	}
	// Store data object in this object (an array and edited by Fuzix through ide object) for saveLink()
	this.data=data;
	// This must be disk image file
	// Update diskimage data, clear screen, and reset Z80
	ide.init(data);
	io.init();
	display.cls();
	z80.reset();
	document.getElementById('savebutton').style.display='block';
};
file.saveLink=function(obj){
	// Construct ZIP archive containing "cpmdisks"
	var zip = new JSZip();
	zip.file("tomssbc-0.3.ide",this.data);
	var data="data:application/zip;base64,";
	data+=zip.generate({type:"base64",compression: "DEFLATE"});
	// Update href property of a tag
	obj.href=data;
	obj.click();
};

