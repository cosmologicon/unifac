
var Particles = {
	init: function (n, color) {
		this.nparticles = n || 10
		this.color = color || "white"
	},
	start: function () {
		this.particles = []
		while (this.particles.length < this.nparticles) {
			this.particles.push(UFX.random.rdisk())
		}
	},
	draw: function () {
		var z = this.r * (0.3 + 0.7 * this.f), r = 0.1 / z
		UFX.draw("z", 100*z, 100*z, "fs", this.color)
		this.particles.forEach(function (p) {
			UFX.draw("b o", p[0], p[1], r, "f")
		})
	},
}

var Falls = {
	init: function (g) {
		this.g = g || 40
	},
	think: function (dt) {
		this.y += this.vy * dt - 0.5 * dt * dt * this.g
		this.vy -= dt * this.g
	},
}


function Splat(x, y, r) {
	this.setpos(x, y)
	this.r = r
	this.vy = 5
	this.start()
	this.live()
	state.splats.push(this)
	this.think(0)
}
Splat.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(HasLifetime, 0.5)
	.addcomp(Fades)
	.addcomp(Falls)
	.addcomp(Particles, 20, "rgba(255,0,0,0.5)")


