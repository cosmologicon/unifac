

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
	// TODO: isClear
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
   // TODO: getTopCell, etc.
   // TODO: topPos, etc.
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




