var DrawSurface = {
	draw: function () {
		UFX.draw("b m 0 0 l", this.dx, this.dy, "ss purple lw 4 s")
	},
}

var SingleDivider = {
	isabove: function (x, y) {
		var dx = x - this.x, dy = y - this.y
		return dy * this.dx < this.dy * dx
	},
	constrain: function (x, y) {
		var p = (x - this.x) * this.ix + (y - this.y) * this.iy
		return [this.x + p * this.ix, this.y + p * this.iy]
	},
	distance2: function (x, y) {
		var dx = x - this.x, dy = y - this.y
		var p = dx * this.ix + dy * this.iy
		var x0 = p < 0 ? 0 : p > this.d ? this.dx : p * this.ix
		var y0 = p < 0 ? 0 : p > this.d ? this.dy : p * this.iy
		return (x0 - dx) * (x0 - dx) + (y0 - dy) * (y0 - dy)
	},
	bouncevector: function (x, y) {
		var p = x * this.ix + y * this.iy
		var px = p * this.ix, py = p * this.iy
		return [2*px-x, 2*py-y]
	},
	catches: function (obj) {
		if (!this.isabove(obj.oldx, obj.oldy)) return false
		if (this.isabove(obj.x, obj.y)) return false
		var p = (obj.x - this.x) * this.ix + (obj.y - this.y) * this.iy
		return 0 <= p && p <= this.d
	},
	canhold: function () {
		return Math.abs(this.iy) < 0.8
	},
}


function SinglePlatform (x0, y0, x1, y1) {
	this.x = x0
	this.y = y0
	this.dx = x1 - x0
	this.dy = y1 - y0
	this.d = Math.sqrt(this.dx * this.dx + this.dy * this.dy)
	this.ix = this.dx / this.d
	this.iy = this.dy / this.d
	this.A = Math.atan2(this.dy, this.dx)
}
SinglePlatform.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(DrawSurface)
	.addcomp(SingleDivider)


function MultiPlatform () {
	this.platforms = []
	for (var j = 2 ; j < arguments.length ; j += 2) {
		this.platforms.push(new SinglePlatform(arguments[j-2], arguments[j-1], arguments[j], arguments[j+1]))
	}
	this.first = this.platforms[0]
	this.last = this.platforms[this.platforms.length - 1]
}
MultiPlatform.prototype = {
	nearest: function (x, y) {
		var n = this.first, d2min = this.first.distance2(x, y)
		for (var j = 1 ; j < this.platforms.length ; ++j) {
			var d2 = this.platforms[j].distance2(x, y)
			if (d2 < d2min) {
				n = this.platforms[j]
				d2min = d2
			}
		}
		return n
	},
	isabove: function (x, y) {
		return this.nearest(x, y).isabove(x, y)
	},
	constrain: function (x, y) {
		return this.nearest(x, y).constrain(x, y)
	},
	bouncevector: function (x, y) {
		return this.nearest(x, y).bouncevector(x, y)
	},
	catches: function (obj) {
		var plat = this.nearest(obj.x, obj.y)
		if (!plat.isabove(obj.oldx, obj.oldy)) return false
		if (plat.isabove(obj.x, obj.y)) return false
		if (plat === this.first) {
			var p = (obj.x - plat.x) * plat.ix + (obj.y - plat.y) * plat.iy
			return 0 <= p
		} else if (plat === this.last) {
			var p = (obj.x - plat.x) * plat.ix + (obj.y - plat.y) * plat.iy
			return p <= plat.d
		} else {
			return true
		}
	},
	canhold: function (x, y) {
		return this.nearest(x, y).canhold()
	},
	draw: function () {
		this.platforms.forEach(function (platform) {
			context.save() ; platform.draw() ; context.restore()
		})
	},
}


var platforms = []

