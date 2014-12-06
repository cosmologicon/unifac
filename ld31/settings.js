var settings = {
	gamename: "LD31",
	savename: "LD31save",
	DEBUG: window.location.href.indexOf("DEBUG") > -1,
	
	h: 24,  // Logical height/width of gameplay area
	w: 32,
	g: 10,  // Acceleration due to gravity
}
if (window.location.href.indexOf("RESET") > -1) {
	delete window.localStorage[settings.savename]
}

