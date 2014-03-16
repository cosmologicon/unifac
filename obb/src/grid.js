// Ah, coordinate systems. We've got a lot of them in Obb. To help distinguish, every variable or
// function that takes coordinates will need to use a version of Apps Hungarian notation, to tell
// which coordinate system it's with respect to.
// http://www.joelonsoftware.com/articles/Wrong.html

// Game coordinates (G): Rectangular coordinate system in normalized game units. Length of an edge
// = hex circumradius = 1. Distance between two adjacent hex centers = sqrt(3). +y is up.

// Hex coordinates (H): Yep, we've got these. This is a bizarre, non-rectangular coordinate system
// in which every hex center, edge center, and vertex is a lattice point. This exists for two
// reasons: (1) so that hexes, edges, and vertices can have unique identifiers that aren't subject
// to rounding, and (2) to simplify the nearest hex/edge/vertex algorithm.

// Number position (N): Not actually coordinates per se, just a single number. There is a simple
// mapping between lattice points in hex coordinates and positive integers. This exists so that an
// object's position can be used as a key in a Javascript object in a way that's quick and simple to
// convert back and forth. (In python I would use a tuple as a key, but that's not an option here.)
// Number position is only well defined for lattice points with, roughly, -16k < xH,yH < 16k. But
// that should be plenty for the purposes of this game.

// Viewport coordinates (V): Coordinates within the gameplay panel, with (0, 0) being the lower-left
// corner of the panel and (panel.width, panel.height) being the top-right.

// Device coordinates (D): Normalized device coordinates, with (0, 0) being the lower-left corner
// of the browser window and (canvas.width, canvas.height) being the top-right.

// Mouse coordinates (M): Very similar to device coordinates, but y = 0 on the top of the window.

// Edge position (E): This is a special variant of number position that's only defined for edges. As
// such, it's only a single number and is suitable for being used as an object key. Edge position
// preserves orientation of the edge, so is useful when you need directionality.


// Convert hex coordinates to game coordinates
function GconvertH(pH) {
	// tranform matrix is [1/4, 0][sqrt(3)/12, sqrt(3)/6]
	return [0.25 * pH[0], 0.14433756729740643 * pH[0] + 0.28867513459481287 * pH[1]]
}

// Convert game coordinates to hex coordinates
function HconvertG(pG) {
	// tranform matrix is [4, 0][-2, 2sqrt(3)]
	return [4 * pG[0], -2 * pG[0] + 3.4641016151377544 * pG[1]]
}

// Convert hex coordinates to number position
function NconvertH(pH) {
	return (pH[0] + 16384 << 15) + pH[1] + 16384
}

// Convert number position to hex coordinates
// As a convenience, number position can be a string
function HconvertN(pN) {
	return [(+pN >> 15) - 16384, (+pN & 32767) - 16384]
}

// Convert mouse coordinates into device coordinates
// Uses current control state object for device size
function DconvertM(pM) {
	return [pM[0], controlstate.hD - pM[1]]
}


// See notes from 05-06 Feb 2013 for derivation of algorithms for hex coordinates

// Whether the given hex position is a hex center
function ishexH(pH) {
	return pH[0] % 6 == 0 && pH[1] % 6 == 0
}
// Whether the given hex position in an edge center
function isedgeH(pH) {
	return pH[0] % 3 == 0 && pH[1] % 3 == 0 && !ishexH(pH)
}

// The six edges surrounding the given hex
function HedgesofhexH(pH) {
	var x = pH[0], y = pH[1]
	return [[x+3, y], [x, y+3], [x-3, y+3], [x-3, y], [x, y-3], [x+3, y-3]]
}
// The edge bordering the given hex in the given edge direction
// Note that the resulting edge position does not keep any orientation information.
function HedgeofhexH(pH, e) {
	return [pH[0] + [0, 3, 3, 0, -3, -3][e], pH[1] + [-3, -3, 0, 3, 3, 0][e]]
}
// Number position of the edge bordering the given hex in the given edge direction.
function NedgeofhexH(pH, e) {
	return NconvertH(HedgeofhexH(pH, e))
}
// The six hexes adjacent to the given hex
function HadjacenthexestohexH(pH) {
	var x = pH[0], y = pH[1]
	return [[x+6, y], [x, y+6], [x-6, y+6], [x-6, y], [x, y-6], [x+6, y-6]]
}
// The two hexes the given edge is an edge of
function HhexesofedgeH(pH) {
	var x = pH[0], y = pH[1]
	return x % 6 ? y % 6 ? [[x+3, y-3], [x-3, y-3]]
		: [[x-3, y], [x+3, y]]
		: [[x, y-3], [x, y+3]]
}
// The hex adjacent to the given hex in the direction of the given edge
function HnexthexH(pH, e) {
	return [pH[0] + [0, 6, 6, 0, -6, -6][e], pH[1] + [-6, -6, 0, 6, 6, 0][e]]
}
// Convert hex + edge number to edge position
// The hex is the "parent" hex, and the edge number is for the outward edge with respect to the
// parent hex.
function EconvertH(pH, e) {
	return NconvertH([pH[0]+e, pH[1]])
}
// Convert edge position back to parent hex + outward edge number
// returns [pH, e]
function HconvertE(pE) {
	var pH = HconvertN(+pE), e = pH[0] % 6
	return [[pH[0]-e, pH[1]], e]
}


// Nearest hex to the given hex coordinates
function HnearesthexH(pH) {
	var x0 = Math.floor(pH[0]/6)*6, y0 = Math.floor(pH[1]/6)*6
	var x = pH[0] - x0, y = pH[1] - y0
	var B = x + 2 * y, C = 2 * x + y
	return B < 6 && C < 6 ? [x0, y0]
		: B > 12 && C > 12 ? [x0+6, y0+6]
		: x > y ? [x0+6, y0] : [x0, y0+6]
}
// Nearest edge to the given hex coordinates
function HnearestedgeH(pH) {
	var x0 = Math.floor(pH[0]/6)*6, y0 = Math.floor(pH[1]/6)*6
	var x = pH[0] - x0, y = pH[1] - y0
	var B = x + 2 * y, C = 2 * x + y
	return B > 12 || C > 12 ? x > y ? [x0+6, y0+3] : [x0+3, y0+6]
		: B < 6 || C < 6 ? x > y ? [x0+3, y0] : [x0, y0+3]
		: [x0+3, y0+3]
}

// Nearest hex (in hex coordinates) to the given game coordinate
function HnearesthexG(pG) {
	return HnearesthexH(HconvertG(pG))
}
// Nearest edge (in hex coordinates) to the given game coordinate
function HnearestedgeG(pG) {
	return HnearestedgeH(HconvertG(pG))
}


