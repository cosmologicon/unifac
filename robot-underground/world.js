

var edgenum = { top: 1, bottom: 2, left: 4, right: 8, topleft: 16, topright: 32, bottomleft: 64, bottomright: 128 }

// JavaScript doesn't let you use tuples as keys. I could convert them to strings, but the
// deconversion would be tricky and probably expensive. This is a standard mapping between
// (int, int) pairs and uints to be used for keys.
// To keep the keys to 31-bits, the coordinates should remain in the range [-16k, 16k]

function gridn(x, y) { return (x + 16384 << 15) + y + 16384 }
function gridx(n) { return (+n >> 15) - 16384 }
function gridy(n) { return (+n & 32767) - 16384 }
function gridxy(n) { return [gridx(n), gridy(n)] }
function griddn(dx, dy) { return dx * (1 << 15) + dy }


function DungeonGrid(csize) {
	this.rooms = []
	this.corridors = {}
	this.csize = csize
	this.cells = {}
}
DungeonGrid.prototype = {
	// New function since I can't override setitem
	setCell: function (p, value) {
		this.cells[gridn(p[0], p[1])] = value
	},
	cellContaining: function (pos) {
		return [Math.floor(pos[0] / this.csize), Math.floor(pos[1] / this.csize)]
	},
	cellCentre: function (pos) {
		return [(pos[0] + 0.5) * this.csize, (pos[1] + 0.5) * this.csize]
	},
	pasteInto: function (othermap, offset) {
		var dn = griddn(offset[0], offset[1])
		for (var n in this.cells) {
			othermap.cells[(+n) + dn] = this.cells[n]
		}
	},
	getClearSpace: function () {
		// TODO: sortkeys
		var n = +UFX.random.choice(Object.keys(this.cells))
		var startcell = gridxy(n)
		return [(startcell[0] + 0.5) * this.csize, (startcell[1] + 0.5) * this.csize]
	},
	isClear: function (start, size) {
		for (var x = 0 ; x < size[0] ; ++x) {
			for (var y = 0 ; y < size[1] ; ++y) {
				if (this.cells[gridn(start[0] + x, start[1] + y)])
					return false
			}
		}
		return true
	},
	circleClear: function (pos, radius) {
		var mincx = Math.floor((pos[0] - radius) / this.csize)
		var maxcx = Math.floor((pos[0] + radius) / this.csize)
		var mincy = Math.floor((pos[1] - radius) / this.csize)
		var maxcy = Math.floor((pos[1] + radius) / this.csize)
		var cells = this.cells
		function fastCheck() {
			for (var cx = mincx ; cx <= maxcx ; ++cx) {
				for (var cy = mincy ; cy <= maxcy ; ++cy) {
					if (!cells[gridn(cx, cy)]) {
						return false
					}
				}
			}
			return true
		}
		if (fastCheck()) return true
		
		var cellradius = Math.floor(radius / this.csize) + 1
		var ecx = Math.floor(pos[0]/this.csize), ecy = Math.floor(pos[1]/this.csize)
		for (var cx = -cellradius ; cx <= cellradius ; ++cx) {
			for (var cy = -cellradius ; cy <= cellradius ; ++cy) {
				if (this.cells[gridn(ecx + cx, ecy + cy)]) continue
				var rx = cx < 0 ? this.csize*(ecx+cx+1) : cx > 0 ? this.csize*(ecx+cx) : pos[0]
				var ry = cy < 0 ? this.csize*(ecy+cy+1) : cy > 0 ? this.csize*(ecy+cy) : pos[1]
				var dx = pos[0] - rx, dy = pos[1] - ry
				if (dx * dx + dy * dy < radius * radius) return false
			}
		}
		return true
	},
	hasLOS: function (pos1, pos2) {
		if (pos2[0] < pos1[0]) {  // work left to right
			var tmp = pos1 ; pos1 = pos2 ; pos2 = tmp
		}
		var x1 = pos1[0] / this.csize, y1 = pos1[1] / this.csize
		var x2 = pos2[0] / this.csize, y2 = pos2[1] / this.csize
		var dy = y2 >= y1 ? 1 : -1 // traveling in the +y direction
		var ix1 = Math.floor(x1), ix2 = Math.floor(x2)
		var iy = Math.floor(y1)
		for (var ix = ix1 ; ix <= ix2 ; ++ix) {
			var xl = ix == ix1 ? x1 : ix
			var xr = ix == ix2 ? x2 : ix + 1
			var iyn = Math.floor(ix == ix2 ? y2 : y1 + (xr - x1) * (y2 - y1) / (x2 - x1))
			if (!this.cells[gridn(ix, iy)]) return false
			while (iy != iyn) {
				iy += dy
				if (!this.cells[gridn(ix, iy)]) return false
			}
		}
		return true
	},
	hasWideLOS: function (pos1, pos2, radius) {
		if (!radius) return this.hasLOS(pos1, pos2)
		var dx = pos2[0] - pos1[0], dy = pos2[1] - pos1[2], d = Math.sqrt(dx * dx + dy * dy)
		dx *= radius / d
		dy *= radius / d
		return this.hasLOS([pos1[0] + dy, pos1[1] - dx], [pos2[0] + dy, pos2[1] - dx]) &&
		       this.hasLOS([pos1[0] - dy, pos1[1] + dx], [pos2[0] - dy, pos2[1] + dx])
	},

	checkEdge: function (cell, edges, side) {
		if (!this.cells[cell]) {
			edges[cell] = edges[cell] || 0
			edges[cell] += side
		}
	},
	getCorners: function (edges) {
		var corners = {}
		for (var n in edges) corners[n] = edges[n]
		for (var cell in edges) {
			var x = gridx(cell), y = gridy(cell)
			if (edgenum.top & edges[cell]) {
				if ((edges[gridn(x+1, y+1)] || 0) && edgenum.left) {
					var corner = gridn(x+1, y)
					corners[corner] = (corners[corner] || 0) + edgenum.topleft
				}
				if ((edges[gridn(x-1, y+1)] || 0) && edgenum.right) {
					var corner = gridn(x-1, y)
					corners[corner] = (corners[corner] || 0) + edgenum.topright
				}
			}
			if (edgenum.bottom & edges[cell]) {
				if ((edges[gridn(x+1, y-1)] || 0) && edgenum.left) {
					var corner = gridn(x+1, y)
					corners[corner] = (corners[corner] || 0) + edgenum.bottomleft
				}
				if ((edges[gridn(x-1, y-1)] || 0) && edgenum.right) {
					var corner = gridn(x-1, y)
					corners[corner] = (corners[corner] || 0) + edgenum.bottomright
				}
			}
		}
		return corners
	},
	getWalls: function () {
		var edges = {}
		for (var n in this.cells) {
			var x = gridx(n), y = gridy(n)
			this.checkEdge(gridn(x, y+1), edges, edgenum.bottom)
			this.checkEdge(gridn(x+1, y), edges, edgenum.left)
			this.checkEdge(gridn(x, y-1), edges, edgenum.top)
			this.checkEdge(gridn(x-1, y), edges, edgenum.right)
		}
		return this.getCorners(edges)
	},

	getTopCell: function () {
		return gridxy(Object.keys(this.cells).sort(function (n1, n2) { return gridy(n2) - gridy(n1) })[0])
	},
	getBottomCell: function () {
		return gridxy(Object.keys(this.cells).sort(function (n1, n2) { return gridy(n1) - gridy(n2) })[0])
	},
	getRightCell: function () {
		return gridxy(Object.keys(this.cells).sort(function (n1, n2) { return gridx(n2) - gridx(n1) })[0])
	},
	getLeftCell: function () {
		return gridxy(Object.keys(this.cells).sort(function (n1, n2) { return gridx(n1) - gridx(n2) })[0])
	},

	topPos: function (pos) {
		return [this.top_offs[0] + pos[0], this.top_offs[1] + pos[1]]
	},
	bottomPos: function (pos) {
		return [this.bottom_offs[0] + pos[0], this.bottom_offs[1] + pos[1]]
	},
	leftPos: function (pos) {
		return [this.left_offs[0] + pos[0], this.left_offs[1] + pos[1]]
	},
	rightPos: function (pos) {
		return [this.right_offs[0] + pos[0], this.right_offs[1] + pos[1]]
	},
}


function Room(pos, size) {
	this.pos = pos
	this.size = size
}
Room.prototype = {
	addToDungeon: function (d) {
		d.rooms.push(this)
		var x0 = this.pos[0], y0 = this.pos[1]
		for (var dx = 0 ; dx < this.size[0] ; ++dx) {
			for (var dy = 0 ; dy < this.size[1] ; ++dy) {
				d.cells[gridn(x0 + dx, y0 + dy)] = this
			}
		}
	},
}




