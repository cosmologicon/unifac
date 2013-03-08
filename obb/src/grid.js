// Ah, coordinate systems. We've got a lot of them in Obb. To help distinguish, every variable or
// function that takes coordinates will need to use a version of Apps Hungarian notation, to tell
// which coordinate system it's with respect to.
// http://www.joelonsoftware.com/articles/Wrong.html

// Game coordinates (G): Rectangular coordinate system in normalized game units. Length of an edge
// = hex circumradius = 1. Distance between two adjacent hex centers = sqrt(3). +y is up.

// Hex coordinates (H): Yep, we've got these. This is a bizarre, non-rectangular coordinate system
// in which every hex center and edge center is a lattice point. This exists for two reasons: (1)
// so that hexes and edges can have unique identifiers that aren't subject to rounding, and (2) to
// simplify the nearest hex and nearest edge algorithm.


// Convert hex coordinates to game coordinates
function GconvertH(pH) {

}

// Convert game coordinates to hex coordinates
function HconvertG(pG) {

}

// Nearest hex to the given hex coordinates
function HnearesthexH(pH) {
	var xN = Math.floor(pH[0] / 6) * 6, yN = Math.floor(pH[1] / 6)
	var x = pH[0] - xN, y = pH[1] - yN


}

// Nearest edge to the given hex coordinates
function HnearestedgeH(pH) {

}

// Nearest edge or hex to the given hex coordinates
function HnearesthexoredgeH(pH) {
	
}

