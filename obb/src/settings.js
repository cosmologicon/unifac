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

	// Geometry constants
	blobsizemin: 0.05,
	blobsizemax: 0.08,
	blobdensity: 10000,
//	blobsizemin: 0.02,
//	blobsizemax: 0.04,
//	blobdensity: 30000,
	normaljitter: 0.2,
	stalkwidth: 0.12,
	That0: [0.5, 0.812404, 0.3],
//	That0: [1, 0, 0],
	pathsegmentsize: 0.05,
}


