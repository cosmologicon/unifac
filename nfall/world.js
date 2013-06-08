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


function Planet(r) {
	this.r = r || this.r
}
Planet.prototype = UFX.Thing()
	.addcomp(WorldBound, 0, 0)
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


