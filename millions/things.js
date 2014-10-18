var Ticks = {
	init: function () {
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
	},
}

var Lifetime = {
	init: function (lifetime) {
		this.lifetime = lifetime || 0
	},
	think: function (dt) {
		if (this.t > this.lifetime) this.alive = false
	},
}

var WorldBound = {
	draw: function () {
		UFX.draw("r", world.theta + this.theta, "t", 0, 0.9)
	},
}

var SpaceBound = {
	draw: function () {
		UFX.draw("r", this.theta, "t", 0, 0.9)
	},
}

var Descends = {
	think: function (dt) {
		this.height -= dt
		this.x = this.height * this.vx
		this.y = this.height * this.vy
		if (this.height < 0) this.die()
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
	die: function () {
		this.alive = false
	},
}

var Falls = {
	init: function () {
		this.vy = 1
		this.y = 0
		this.g = 5
	},
	think: function (dt) {
		this.vy -= dt * this.g
		this.y += dt * this.vy
	},
	draw: function () {
		UFX.draw("t", 0, this.y)
	},
}

var Fades = {
	draw: function () {
		UFX.draw("alpha", 1 - this.t / this.lifetime)
	},
}

var Grows = {
	draw: function () {
		var scale = this.t / this.lifetime
		UFX.draw("z", scale, scale)
	},
}

var Splodes = {
	die: function () {
		world.splosions.push(Splosion(this.theta - world.theta))
	},
}

var Impacts = {
	die: function () {
		world.impact(this)
	},
}

var DrawCircle = {
	draw: function () {
		UFX.draw("b o", 0, 0, this.size, "fs white f")
	},
}

function Asteroid(theta, height) {
	if (!(this instanceof Asteroid)) return new Asteroid(theta, height)
	this.theta = theta
	this.height = height
	this.vx = UFX.random(-1, 1)
	this.vy = UFX.random(1, 2)
	this.size = UFX.random(0.06, 0.12)
	this.alive = true
}
Asteroid.prototype = UFX.Thing()
	.addcomp(SpaceBound)
	.addcomp(Descends)
	.addcomp(DrawCircle)
	.addcomp(Splodes)
	.addcomp(Impacts)

function Splosion(theta) {
	if (!(this instanceof Splosion)) return new Splosion(theta)
	this.theta = theta
	this.size = 0.3
	this.alive = true
}
Splosion.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(Lifetime, 0.5)
	.addcomp(WorldBound)
	.addcomp(Falls)
	.addcomp(Fades)
	.addcomp(Grows)
	.addcomp(DrawCircle)

