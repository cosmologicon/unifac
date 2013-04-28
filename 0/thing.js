
var things = []


var WorldBound = {
	init: function (x, y) {
		this.x = x || 0
		this.y = y || 0
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}
var Ticks = {
	init: function () {
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
	},
}

var Clickable = {
	init: function (r) {
		this.r = r || 0
	},
	hits: function (x, y) {
		var dx = x - this.x, dy = y - this.y
		return dx * dx + dy * dy < this.r * this.r
	},
}
var Unclickable = {
	hits: function () {
		return false
	},
}

var WobbleOnActive = {
	init: function (omega, beta) {
		this.womega = omega || 2.6
		this.wbeta = beta || 0.12
	},
	draw: function () {
		if (this.active) {
			var s = Math.exp(this.wbeta * Math.sin(this.t * this.womega))
			UFX.draw("z", s, 1/s)
		}
	},
}

var DrawPath = {
	init: function (path) {
		this.path = path || "b o 0 0 2"
	},
	draw: function () {
		UFX.draw(this.path, "alpha 0.5 f alpha 1 lw 0.2 s")
	},
}
var DrawTcircle = {
	draw: function () {
		UFX.draw("b o 0 0 1 lw 0.3 s b o 0 0 0.5 f")
	}
}

// Centerpiece of each level, also the level identifier shape
function Piece(path, x, y) {
	this.x = x || 0
	this.y = y || 0
	this.path = path || this.path
}
Piece.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Clickable, 2)
	.addcomp(WobbleOnActive)
	.addcomp(DrawPath)

// Just a normal target
function Target(x, y) {
	this.x = x
	this.y = y
}
Target.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Clickable, 1)
	.addcomp(WobbleOnActive)
	.addcomp(DrawTcircle)





