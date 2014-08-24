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
	},
	draw: function () {
		UFX.draw("b o 0 0", this.r, "fs", this.color, "f")
	},
}

var HasNeeds = {
	start: function (args) {
		this.needs = args.needs
		this.r = args.r
		this.met = false
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
		for (var j = 0 ; j < this.needs.length ; ++j) {
			UFX.draw("b o 0 0", r, "fs", settings.rescolors[this.needs[j]], "f")
			r -= 0.08
		}
		UFX.draw("b o 0 0", r, "fs", (this.met ? "#AAA" : "#333"), "f")
	},
}

var MiniCirc = {
	start: function (args) {
		this.r = args.r || 0.2
	},
	draw: function () {
		UFX.draw("b o 0 0", this.r, "fs", (this.res0 == null ? "#333" : settings.rescolors[this.res0]), "f")
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
	},
	draw: function () {
		UFX.draw("b m 0 0 l", this.dx, this.dy, "lw 0.1 ss rgba(0,128,255,0.2) s")
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

function BridgeCursor(toid0, x, y) {
	if (!(this instanceof BridgeCursor)) return new BridgeCursor(toid0, x, y)
	this.start({
		toid0: toid0,
		toid1: {
			x: x,
			y: y,
			res: [],
		},
	})
}
BridgeCursor.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Ticks)
	.addcomp(SpansLength)


