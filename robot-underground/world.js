

function gridn(x, y) { return (x + 16384 << 15) + y + 16384 }
function gridx(n) { return (n >> 15) - 16384 }
function gridy(n) { return (n & 32767) - 16384 }
function gridxy(n) { return [gridx(n), gridy(n)] }


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
		var dn = gridn(offset[0], offset[1])
		for (var n in this.cells) {
			othermap[n + dn] = this.cells[n]
		}
	},
	getClearSpace: function () {
		var n = +UFX.random.choice(Object.keys(this.cells))
		return gridxy(n)
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
	// TODO: circleClear
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
	// TODO: checkEdge
	// TODO: getCorners
	// TODO: getWalls
	getTopCell: function () {
		return Math.max.apply(null, Object.keys(this.cells).map(gridx))
	},
	getBottomCell: function () {
		return Math.min.apply(null, Object.keys(this.cells).map(gridx))
	},
	getRightCell: function () {
		return Math.max.apply(null, Object.keys(this.cells).map(gridy))
	},
	getLeftCell: function () {
		return Math.min.apply(null, Object.keys(this.cells).map(gridy))
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




