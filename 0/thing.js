
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
var Transitions = {
	init: function () {
		this.trans = null
	},
	think: function (dt) {
		if (!this.trans) return
		this.trans.think(dt, this)
		if (this.trans.done) {
			if (this.trans.kills) this.done = true
			this.trans = null
		}
	},
	draw: function () {
		if (this.trans) {
			this.trans.draw(this)
		}
	},
	halts: function () {
		return this.trans && this.trans.halts
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
	draw: function () {
		if (settings.DEBUG) {
			UFX.draw("b o 0 0", this.r, "lw 0.03 ss red s")
		}
	},
}
var Unclickable = {
	hits: function () {
		return false
	},
}
var Collectible = {
	init: function () {
		this.collectible = true
	},
}
var Disposible = {
	init: function () {
		this.disposible = true
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
var Rocks = {
	draw: function () {
		var A = 20 * Math.sin(this.t * 0.1)
		UFX.draw("r", A)
	},
}


var DrawPath = {
	init: function (path) {
		this.path = path || "b o 0 0 2"
	},
	draw: function (menu, selected, a) {
		if (!menu) {
			selected = true
			a = 0
		}
		if (a >= 1) {
			UFX.draw("lw 0.2", this.path, "fs #CCC ss black f s")
		} else if (selected) {
			var c0 = clip(Math.floor(192 * a), 0, 192) + 32
			var c1 = clip(Math.floor(255 * (1-a)), 0, 255)
			var color0 = "rgb(" + c0 + "," + c0 + "," + c0 + ")"
			var color1 = "rgb(" + c1 + "," + c1 + "," + c1 + ")"
			UFX.draw("lw 0.2", this.path, "fs", color0, "ss", color1, "f s")
		} else {
			UFX.draw("lw 0.2", this.path, "alpha", a, "fs #CCC ss black f s")
		}
	},
}
var DrawTcircle = {
	draw: function () {
		UFX.draw("b o 0 0 1 lw 0.3 s b o 0 0 0.5 f")
	},
}
var DrawStar = {
	draw: function () {
		UFX.draw("z 0.2 0.2 ( m 0 4 l 1 1 l 4 0 l 1 -1 l 0 -4 l -1 -1 l -4 0 l -1 1 ) f")
	},
}

// Centerpiece of each level, also the level identifier shape
function Piece(name, path, x, y, r) {
	this.name = name
	this.x = x || 0
	this.y = y || 0
	this.path = path || this.path
	this.r = r || 2
}
Piece.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Transitions)
	.addcomp(WobbleOnActive)
	.addcomp(DrawPath)
	.addcomp(Clickable, 2)

// Just a normal target
function Target(x, y) {
	this.x = x
	this.y = y
}
Target.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Transitions)
	.addcomp(WobbleOnActive)
	.addcomp(DrawTcircle)
	.addcomp(Clickable, 1.4)
	.addcomp(Disposible)


// Star bits. These represent your possessions or whatever
function Bit(x, y) {
	this.x = x
	this.y = y
	this.t = Math.random() * 1000
	this.think(0)
}
Bit.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Transitions)
	.addcomp(Rocks)
	.addcomp(DrawStar)
	.addcomp(Unclickable)
	.addcomp(Collectible)

