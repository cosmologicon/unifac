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
	bouncevector: function (x, y) {
		var p = x * this.ix + y * this.iy
		var px = p * this.ix, py = p * this.iy
		return [2*px-x, 2*py-y]
	},
	catches: function (obj) {
		if (!this.isabove(obj.oldx, obj.oldy)) return false
		if (this.isabove(obj.x, obj.y)) return false
		var dx = this.constrain(obj.x, obj.y)[0] - this.x
		if (dx < 0 || dx > this.dx) return false
		return true
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

var platforms = []

