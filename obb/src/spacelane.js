// A path along hexes that sprites follow

// Lanespec is a sequence of pH values.

// For edge numbering conventions, please see notes dated 24 Feb 2014.

function Spacelane(spec) {
	if (!(this instanceof Spacelane)) return new Spacelane(spec)
	this.init(spec)
}
Spacelane.prototype = {
	init: function (spec) {
		this.spec = spec
		this.tiles = []
		var LGs = [0, tau/6, tau/4, Math.sqrt(3), tau/4, tau/6]
		var rotCs = [1, 0.5, -0.5, -1, -0.5, 0.5]
		var rotSs = [0, s3, s3, 0, -s3, -s3]
		for (var j = 1 ; j < spec.length - 1 ; ++j) {
			var pH = spec[j]
			var pG = GconvertH(pH)
			// Edge through which the lane enters this tile, also controls orientation of the tile.
			var iedge = edgebetweenH(pH, spec[j-1])
			// Edge through which the lane exits this tile.
			var oedge = edgebetweenH(pH, spec[j+1])
			// exiting edge relative to entering edge, determines curvature of lane in this tile.
			var jedge = (oedge - iedge + 6) % 6
			this.tiles.push({
				pH: pH,
				pG: pG,
				iedge: iedge,
				oedge: oedge,
				jedge: jedge,
				rotC: rotCs[iedge],
				rotS: rotSs[iedge],
				L: LGs[jedge],
			})
		}
	},
	place: function (obj, d) {
		obj.dtile = 0
		obj.jtile = 0
		this.advance(obj, d || 0)
	},
	advance: function (obj, dd) {
		obj.dtile += dd
		while (obj.dtile > this.tiles[obj.jtile].L) {
			obj.dtile -= this.tiles[obj.jtile].L
			obj.jtile = (obj.jtile + 1) % this.tiles.length
		}
		this.setpos(obj)
	},
	setpos: function (obj) {
		var tile = this.tiles[obj.jtile], d = obj.dtile, x, y, dx, dy
		if (tile.jedge == 3) {
			x = 0 ; y = -s3 + d ; dx = 0 ; dy = 1
		} else {
			var r = tile.jedge == 1 || tile.jedge == 5 ? 0.5 : 1.5
			var theta = d / r, C = Math.cos(theta), S = Math.sin(theta)
			var xflip = tile.jedge < 3 ? 1 : -1
			x = xflip * r * (1 - C)
			y = -s3 + r * S
			dx = xflip * S
			dy = C
		}
		obj.pG = [
			tile.pG[0] + x * tile.rotC - y * tile.rotS,
			tile.pG[1] + x * tile.rotS + y * tile.rotC,
		]
		obj.rotC = dy * tile.rotC + dx * tile.rotS
		obj.rotS = dx * tile.rotC - dy * tile.rotS
	},
}


