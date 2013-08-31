
var settings = {
	gamename: "0",
	version: "LD-0",
	DEBUG: window.location.href.indexOf("DEBUG") > -1,
	silent: window.location.href.indexOf("SILENT") > -1,
	
	ghostv: 32,
	Dmin: 0.5,
}


var beaten = {}

function getlevels() {
	var ret = ["north", "south"]
	if (beaten.north) {
		ret.push("northwest")
		ret.push("northeast")
	}
	if (beaten.south) {
		ret.push("southwest")
		ret.push("southeast")
	}
	if (beaten.southwest && beaten.northwest) {
		ret.push("west")
	}
	if (beaten.southeast && beaten.northeast) {
		ret.push("east")
	}
	if (beaten.east && beaten.west) {
		ret.push("0")
	}
	var unbeaten = function (lname) { return !beaten[lname] }
	return ret.filter(unbeaten)
}

