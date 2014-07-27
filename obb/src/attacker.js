// TODO: think of a better name than "attacker" for the ships/things that come at you.
// I guess it would help for me to figure out, from a story perspective, what you're actually
// defending against.



// Extremely temporary first implementation while I figure out how this is going to work....


var WorldBound = {
	start: function (opts) {
		this.pG = opts.pG || [0, 0]
	},
}

var MovesLinear = {
	start: function (opts) {
		this.vG = opts.vG || [0, 0]
	},
	think: function (dt) {
		this.pG[0] += dt * this.vG[0]
		this.pG[1] += dt * this.vG[1]
	},
}

var FacesDirectionOfMotion = {
	init: function () {
		this.rotC = 1
		this.rotS = 0
	},
	think: function (dt) {
		var vx = this.vG[0], vy = this.vG[1]
		var v = Math.sqrt(vx * vx + vy * vy)
		if (!v) return
		this.rotC = vy / v
		this.rotS = vx / v
	},
}

var Drops = {
	think: function (dt) {
		this.vG[1] -= 1.0 * dt
	},
}

var HasSpriteShape = {
	start: function (opts) {
		this.shape = opts.shape
	},
}


function Attacker(opts) {
	if (!(this instanceof Attacker)) return new Attacker(opts)
	this.start(opts)
}
Attacker.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(MovesLinear)
	.addcomp(FacesDirectionOfMotion)
	.addcomp(Drops)
	.addcomp(HasSpriteShape)



