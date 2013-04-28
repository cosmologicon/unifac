
var settings = {
	gamename: "0",
	version: "LD-0",
	DEBUG: window.location.href.indexOf("DEBUG") > -1,
	
	ghostv: 32,
	Dmin: 0.5,
}


var beaten = {}

function getlevels() {
	var unbeaten = function (lname) { return !beaten[lname] }

	var ret = ["northwest", "northeast", "southwest", "southeast"].filter(unbeaten)
	//if (ret.length) return ret

	var ret = ["0"].filter(unbeaten)
	return ret
}

