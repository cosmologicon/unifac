var WorldBound = {
	start: function (args) {
		this.x = args.x || 0
		this.y = args.y || 0
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var Ticks = {
	start: function () {
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
	},
}

var HoldsRes = {
	start: function (args) {
		this.res = []
		while (this.res.length < settings.rescolors.length) this.res.push(0)
		if ("res0" in args) {
			this.res[args.res0] = 1
			this.res0 = args.res0
		} else {
			this.res0 = null
		}
	},
	getres: function () {
	},
	hookup: function (obj) {
		var helped = false
		for (var j = 0 ; j < this.res.length ; ++j) {
			if (obj.res[j] > 0 && (!this.res[j] || this.res[j] > obj.res[j] + 1)) {
				this.res[j] = obj.res[j] + 1
				this.getres()
				helped = true
			}
		}
		return helped
	},
}

var Circular = {
	start: function (args) {
		this.color = args.color || "blue"
		this.r = args.r || 0.2
		this.rgrad = UFX.draw.radgrad(-this.r, -this.r, 0, -this.r, -this.r, 2*this.r, 0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.5)")
	},
	draw: function () {
		UFX.draw("b o 0 0", this.r, "fs", this.color, "f fs", this.rgrad, "f")
	},
}

var HasNeeds = {
	start: function (args) {
		this.needs = args.needs
		this.r = args.r
		this.met = false
		this.rgrad = UFX.draw.radgrad(-this.r, -this.r, 0, -this.r, -this.r, 2*this.r, 0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.8)")
		this.dgrad = UFX.draw.radgrad(-this.r, -this.r, 0, -this.r, -this.r, 2*this.r, 0, "rgba(0,0,0,0.65)", 1, "rgba(0,0,0,1)")
	},
	getres: function () {
		if (this.met) return
		for (var j = 0 ; j < this.needs.length ; ++j) {
			if (!this.res[this.needs[j]]) return
		}
		this.met = true
	},
	draw: function () {
		var r = this.r
		UFX.draw("b o 0 0", r, "fs", settings.rescolors[this.needs[0]], "f fs", (this.met ? this.rgrad : this.dgrad), "f")
	},
}

var MiniCirc = {
	start: function (args) {
		this.r = args.r || 0.2
		this.rgrad = UFX.draw.radgrad(-this.r, -this.r, 0, -this.r, -this.r, 2*this.r, 0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.8)")
	},
	draw: function () {
		UFX.draw("b o 0 0", this.r, "fs", (this.res0 == null ? "#333" : settings.rescolors[this.res0]), "f fs", this.rgrad, "f")
	},
}

var DrawBlock = {
	draw: function () {
		for (var j = 0 ; j < 3 ; ++j) {
			var t = this.t + 1000 * j
			var s = 1 + 0.2 * Math.sin(0.456 * t)
			UFX.draw("[ r", 30 * Math.sin(0.06 * t), "z", 0.3 * s, 0.3 / s)
			UFX.draw("b o 0 0 1 fs black f ]")
		}
	},
}

var Fades = {
	start: function (args) {
		this.alpha = 1
		this.lifetime = args.lifetime || 10
	},
	think: function (dt) {
		if (this.t > this.lifetime) {
			this.alpha -= dt
		}
		this.alive = this.alpha > 0
	},
	draw: function () {
		UFX.draw("alpha", Math.max(this.alpha, 0))
	},
}


var DrawsGhost = {
	start: function (args) {
		this.ghost = args.ghost
	},
	think: function (dt) {
		this.ghost.think(dt * 10)
	},
	draw: function () {
		UFX.draw("z", 1 + 3 * this.t, 1 + 3 * this.t)
		this.ghost.draw()
	},
}

var SpansLength = {
	start: function (args) {
		this.toid0 = args.toid0
		this.toid1 = args.toid1
		this.x = args.toid0.x
		this.y = args.toid0.y
		this.dx = args.toid1.x - this.x
		this.dy = args.toid1.y - this.y
		this.color = args.color || "rgba(0,128,255,0.2)"
	},
	draw: function () {
		UFX.draw("b m 0 0 l", this.dx, this.dy, "lw 0.1 ss", this.color, "s")
		var t = this.t * 1.6, j = Math.floor(t) % settings.rescolors.length, f = t % 1
		if (this.toid1.res[j] && this.toid0.res[j] != this.toid1.res[j]) {
			if (this.toid0.res[j] > this.toid1.res[j]) f = 1 - f
			var rgrad = UFX.draw.radgrad(0, 0, 0, 0, 0, 1, 0, settings.rescolors[j], 1, settings.resfades[j])
			UFX.draw("[ t", this.dx * f, this.dy * f, "z 0.15 0.15",
				"b o 0 0 1 fs", rgrad, "f ]")
		}
	},
}

function Toid(x, y, needs) {
	if (!(this instanceof Toid)) return new Toid(x, y, needs)
	this.start({
		x: x,
		y: y,
		r: 0.4,
		needs: needs,
	})
}
Toid.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(HoldsRes)
	.addcomp(HasNeeds)
	.definemethod("think")

function Stroid(x, y, res0) {
	if (!(this instanceof Stroid)) return new Stroid(x, y, res0)
	this.start({
		x: x,
		y: y,
		res0: res0,
		r: 0.2,
	})
}
Stroid.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(HoldsRes)
	.addcomp(MiniCirc)

function Bloid(x, y) {
	if (!(this instanceof Bloid)) return new Bloid(x, y)
	this.start({
		x: x,
		y: y,
	})
	this.t += UFX.random(1000)
}
Bloid.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(DrawBlock)


function Bridge(toid0, toid1) {
	if (!(this instanceof Bridge)) return new Bridge(toid0, toid1)
	this.start({
		toid0: toid0,
		toid1: toid1,
	})
}
Bridge.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(SpansLength)

function Corpse(bloid) {
	if (!(this instanceof Corpse)) return new Corpse(bloid)
	var x = bloid.x, y = bloid.y
	bloid.x = bloid.y = 0
	this.start({
		x: x,
		y: y,
		ghost: bloid,
		lifetime: 0.0001,
	})
}
Corpse.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(Fades)
	.addcomp(DrawsGhost)


function BridgeCursor(toid0, x, y) {
	if (!(this instanceof BridgeCursor)) return new BridgeCursor(toid0, x, y)
	var color = state.canbuild(toid0, x, y) ? "rgba(0,128,255,0.2)" : "rgba(255,0,0,0.2)"
	this.start({
		toid0: toid0,
		toid1: {
			x: x,
			y: y,
			res: [],
		},
		color: color,
	})
}
BridgeCursor.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(SpansLength)


