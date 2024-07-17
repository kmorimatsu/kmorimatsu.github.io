/**********************************
* KM-BASIC web written by Katsumi *
*     This script is released     *
*       under the LGPL v2.1.      *
**********************************/

display.init();
interrupt.init();
if (get.debug) dom.getElement("code").style.display="block";
if (get.help) dom.getElement("side").style.display="block";
if (get.source) dom.getElement("basicsource").style.display="block";
if (get.sendkeys) dom.getElement("sendkeys").style.display="block";
dom.getElement("RUNbutton").disabled=0;
button.run();
