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
	maxVzoomG: 320,

	// Geometry constants
	blobsize: {
		sphere: { min: 0.04, max: 0.12, density: 4000 },
		stalk: { min: 0.03, max: 0.08, density: 16000 },
	},
	normaljitter: 0.2,
	stalkwidth: 0.13,
	stalkrfactor: 0.7,
	stumplength: 0.25,
//	That0: [0.5, 0.812404, 0.3],
	That0: [0.3, 0.93238, 0.2],
//	That0: [0.001, 1, 0],
	pathsegmentsize: 0.05,
	outlinewidth: 0.03,
	// growth transitions
	growrate: 2.0,
	growframes: 16,
	growdf0: 0.6,
	
	fsquirm0: 0.09,
	Tsquirm: 140,
}


