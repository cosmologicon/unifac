// User-controllable settings
var settings = {

}

// Turn debug mode on by adding "?DEBUG=1" to the URL
if (window.location.href.indexOf("DEBUG") > -1) {
	settings.DEBUG = true
}

// Gameplay mechanics
var mechanics = {

}

// Fixed (non-settable) display/UI constants
var constants = {
	keyscootchV: 300,  // number of pixels to shift the view when a key is tapped
	keydzoom: 0.2,  // factor by which to zoom in/out when a zoom key is tapped

	dragtime: 0.4,  // time in seconds after which a click is counted as a drag
	dragdistanceD: 25,  // distance in device coordinates (pixels) after which a click is counted as a drag

	flydecelfactor: 10,  // deceleration amount after a touch release
	
	scrollzoomfactor: 0.02,

	viewtargetfactor: 20,
	
	minVzoomG: 12,
	maxVzoomG: 120,
}


