var settings = {
	gamename: "nightfall",
	version: "BGJ-0",
	DEBUG: window.location.href.indexOf("DEBUG") > -1,
	silent: window.location.href.indexOf("SILENT") > -1,
	
	sx: 800,
	sy: 600,
	clickr: 20,
}

function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
function rmod(x,z){return(x%z+z)%z}
function zmod(x,z){return((x+z/2)%z+z)%z-z/2}
var tau = 6.283185307179586

var beaten = {}

function savegame() {
	localStorage[settings.gamename + ":" + settings.version + ":save"] = JSON.stringify(beaten)
}
function loadgame() {
	beaten = JSON.parse(localStorage[settings.gamename + ":" + settings.version + ":save"] || "{}")
}
function resetgame() {
	delete localStorage[settings.gamename + ":" + settings.version + ":save"]
	window.location = window.location
}
loadgame()

