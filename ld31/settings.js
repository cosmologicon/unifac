var settings = {
	gamename: "All the World",
	savename: "LD31save",
	DEBUG: window.location.href.indexOf("DEBUG") > -1,
	EASY: window.location.href.indexOf("EASY") > -1,
	
	h: 15,  // Logical height/width of gameplay area
	w: 24,
	g: 18,  // Acceleration due to gravity
	leapvy: 7.5,
	ax: 16,
	decel: 40,
	friction: 24,
	vxmax: 6,
}
if (window.location.href.indexOf("RESET") > -1) {
	delete window.localStorage[settings.savename]
}

