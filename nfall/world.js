var WorldBound = {
	init: function (x, y) {
		this.x = x || 0
		this.y = y || 0
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var OnWheel = {
	init: function (wheel, A, r) {
		this.wheel = wheel
		this.A = A || 0
		this.wr = r || 0
	},
	think: function (dt) {
		var A = this.wheel.A0 + this.A
		this.x = this.wheel.x + this.wr * Math.sin(A)
		this.y = this.wheel.y - this.wr * Math.cos(A)
	},
}

var DrawCircle = {
	init: function (r, color) {
		this.r = r || 10
		this.color = color || "blue"
	},
	draw: function () {
		UFX.draw("b o 0 0", this.r, "fs", this.color, "f")
	},
}

var HasShade = {
	init: function () {
		this.shade = null
	},
	// TODO: consider caching shades, though it doesn't really seem worth it.
	think: function (dt) {
		this.shade = new Shade(this, planets.concat(moons))
	},
	shaded: function (obj) {
		return this.shade.shaded(obj)
	},
	drawshade: function () {
		this.shade.draw()
	},
}

var HasTowers = {
	addtowers: function (towerspec) {
		var towers = this.towers = [], r = this.r, x0 = this.x, y0 = this.y
		towerspec.forEach(function (tspec) {
			var tA = tspec[0], tr = tspec[1] + r
			towers.push({
				A: tA,
				r: tr,
				shaded: false,
				x: x0 + tr * Math.sin(tA),
				y: y0 - tr * Math.cos(tA),
			})
		})
	},
	stowers: function () {
		this.towers.forEach(function (tower) {
			tower.shaded = suns.every(function (sun) { return sun.shaded(tower) })
//			console.log(suns[0].shade.shaded(tower))
		})
	},
	draw: function () {
		var x0 = this.x, y0 = this.y
		this.towers.forEach(function (tower) {
			UFX.draw("[ r", tower.A, "fs green fr -1 0 2", -tower.r, "]")
			UFX.draw("fs", (tower.shaded ? "white" : "red"), "b o 0", -tower.r, "3 f")
		})
	},
}




function Planet(r, towerspec) {
	this.r = r || this.r
	this.addtowers(towerspec || [])
}
Planet.prototype = UFX.Thing()
	.addcomp(WorldBound, 0, 0)
	.addcomp(HasTowers)
	.addcomp(DrawCircle, 20, "blue")
	.definemethod("think")

function Sun(wheel, A, r) {
	this.wheel = wheel
	this.A = A
	this.wr = r
}
Sun.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(OnWheel)
	.addcomp(HasShade)
	.addcomp(DrawCircle, 8, "yellow")

function Moon(wheel, A, wr, r) {
	this.wheel = wheel
	this.A = A
	this.wr = wr
	this.r = r || this.r
}
Moon.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(OnWheel)
	.addcomp(DrawCircle, 12, "white")



var planets = []
var moons = []
var suns = []
var wheels = []


