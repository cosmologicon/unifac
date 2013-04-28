
var settings = {
	gamename: "0",
	version: "LD-0",
	DEBUG: window.location.href.indexOf("DEBUG") > -1,
	
	ghostv: 32,
	Dmin: 0.5,
}


var beaten = {}

function getlevels() {
	return ["northwest", "northeast"]

	if (beaten.northwest) {
		return ["0"]
	}
	return ["northwest"]
}

