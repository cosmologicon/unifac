// Effects is my catch-all term for thing that appear on screen that aren't sprites, and have
//   little to no interaction with other objects in the game.

var beffects = []  // Background effects: appear on a layer below sprites
var feffects = []  // Foreground effects: appear on a layer above sprites
var HUDeffects = []

// LIFETIME-RELATED EFFECT COMPONENTS

var BoundToObject = {
	think: function (dt) {
		if (this.alive && !this.obj.alive) this.die()
	},
}

// APPEARANCE-RELATED EFFECT COMPONENTS

// A tilt that's significant enough that it may be needed by other objects
//   eg. the direction a Portal is facing
var HasTilt = {
	init: function (A) {
		this.settilt(A || 0)
	},
	settilt: function (A) {
		this.tiltA = A
		this.tiltS = Math.sin(A)
		this.tiltC = Math.cos(A)
	},
	draw: function () {
		UFX.draw("r", this.tiltA)
	},
}

// Use with AppearsDisappears
var GrowsInShrinksOut = {
	draw: function () {
		UFX.draw("z", this.fappear, this.fappear)
	},
}

var WobblesIn = {
	draw: function () {
		if (this.zfactor < 1) {
			UFX.draw("z", UFX.random(0.5, 1.5), UFX.random(0.5, 1.5))
		}
	},
}

var DrawReticule = {
	init: function (sx, sy) {
		this.reticulesize = [sx || 10, sy || 10]
		this.rtheta = 0
		this.romega = 2
	},
	think: function (dt) {
		this.rtheta += this.romega * dt
	},
	draw: function () {
		UFX.draw("[ [ z", this.reticulesize, "b o 0 0 1 ]",
			"fs rgb(0,0,0) f lw 0.8 ss blue s clip",
			"[ z", this.reticulesize, "b o 0 0.5 1 o 0 1 1 o 0 1.5 1 ] lw 0.3 s ]",
			"[ z", this.reticulesize, "r", this.rtheta,
			"b m 0 1.2 l 0 2 m 0 -1.2 l 0 -2 m 1.2 0 l 2 0 m -1.2 0 l -2 0",
			"m 1.2 0 a 0 0 1.2 0 1.57 m 1.4 0 a 0 0 1.4 0 1.57",
			"m -1.2 0 a 0 0 1.2 3.14 4.71 m -1.4 0 a 0 0 1.4 3.14 4.71 ]",
			"lw 0.8 ss blue s"
		)
	},
	// Set clipping region for objects within the reticule
	// Carves out a large half-plane, except for the circle of the reticule itself
	setclip: function () {
		UFX.draw("[")
		WorldBound.draw.apply(this)
		HasTilt.draw.apply(this)
		UFX.draw("z", this.reticulesize,
			"( m 100 0 l 1 0 a 0 0 1 0 3.1416 l -100 0 l -100 -100 l 100 -100 ) ] clip"
		)
	},
}

var DrawBeneathObject = {
	draw: function () {
		this.X = this.obj.X
		this.y = 0
		WorldBound.think.call(this, 0)
		WorldBound.draw.call(this)
	},
}



// BEHAVIOR-RELATED EFFECT COMPONENTS

var CarriesEntities = {
	addentity: function (e) {
		if (!this.entities) this.entities = []
		this.entities.push(e)
	},
	removeentity: function (e) {
		this.entities = this.entities.filter(function (ent) { return ent !== e })
	},
	think: function (dt) {
		if (!this.entities) this.entities = []
		this.entities = fprop(this.entities, "alive")
		if (dt && !this.entities.length) {
			this.onempty()
		}
	},
	onempty: function () {
		// Not sure if this is really the correct behavior, but right now the only effect using
		// this is Portals
		this.die()
	},
}

var QueuesEntities = {
	init: function (t0, dt) {
		this.queuet0 = t0
		this.queuedt = dt
	},
	// Next available spot in the queue
	nexttime: function () {
		if (!this.entities || !this.entities.length) return this.queuet0
		var ts = this.entities.map(function (e) { return e.autowaittime })
		ts = ts.filter(function (t) { return typeof t == "number" })
		if (!ts.length) return this.queuet0
		var maxt = Math.max.apply(Math, ts)
		return maxt + this.queuedt
	},
}



// EFFECT CONSTRUCTORS

function Portal(X, y, A) {
	this.X = X
	this.y = y
	this.settilt(typeof A == "number" ? A : UFX.random(-1, 1))
	this.think(0)
	beffects.push(this)
}
Portal.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(CarriesEntities)
	.addcomp(QueuesEntities, 0.5, 1)
	.addcomp(AppearsDisappears, 0.5)
	.addcomp(GrowsInShrinksOut)
	.addcomp(HasTilt)
	.addcomp(DrawReticule, 20, 6)

function Alerter(obj) {
	this.obj = obj
	HUDeffects.push(this)
}
Alerter.prototype = UFX.Thing()
	.addcomp(AppearsDisappears, 0.3)
	.addcomp(BoundToObject)
	.addcomp({
		freezepos: function () {
			this.pos = [this.obj.X, this.obj.y]
		},
		draw: function () {
			var d = 20
			var p = this.pos
				? camera.worldtoscreen(this.pos[0], this.pos[1])
				: camera.worldtoscreen(this.obj.X, this.obj.y)
			// TODO: return true if we're on screen
			p = [clip(p[0], 20, settings.sx - 20), clip(p[1], 20, settings.sy - 20)]
			UFX.draw("t", p)
		},
	})
	.addcomp(GrowsInShrinksOut)
	.addcomp({
		draw: function () {
			var z = Math.sqrt(camera.zoom)
			// TODO: this really ought to be a tracer
			UFX.draw("z", z, z, "b o 0 0 10 lw 1 fs yellow ss black f s",
				"font 14px~bold~Viga textalign center textbaseline middle fs black ft0 !")
		},
	})
	.setmethodmode("draw", "any")


function Sneeze(obj) {
	this.obj = obj
	feffects.push(this)
	new Bruise(this, obj.X, groundy(obj.y))
	new Rubble(this, obj.X, groundy(obj.y))
}
Sneeze.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(BoundToObject)
	.addcomp(DrawBeneathObject)
	.addcomp({
		init: function () {
			this.pulset = 0
		},
		think: function (dt) {
			this.pulset += dt
		},
		draw: function () {
			var c = Math.floor((1.3 * this.pulset - Math.floor(1.3 * this.pulset)) * 200)
			var color = "rgb(" + c + "," + c + ",255)"
			UFX.draw("b m 0", groundy(this.obj.y), "l 0", this.obj.y-10, "ss blue lw 3 s",
				"ss", color, "lw 2 s")
		},
	})

function Bruise(obj, X, y) {
	this.obj = obj
	// TODO: figure out some way that this can possibly move along with the object if it moves??
	this.X = X
	this.y = y
	beffects.push(this)
}
Bruise.prototype = UFX.Thing()
	.addcomp(BoundToObject)
	.addcomp(WorldBound)
	.addcomp(FadesOnDeath, 1.5)
	.addcomp({
		draw: function () {
			UFX.draw("z 15 3 b o 0 0 1 fs rgba(255,0,0,0.5) f")
		},
	})

function Rubble(obj, X, y) {
	this.obj = obj
	this.X = X
	this.y = y
	feffects.push(this)
}
Rubble.prototype = UFX.Thing()
	.addcomp(BoundToObject)
	.addcomp(WorldBound)
	.addcomp({
		init: function () {
			this.active = true
			this.alive = true
		},
		die: function () {
			this.active = false
		},
		adddot: function () {
			this.dots.push({
				t: 0, x0: UFX.random(-12, 12), y0: UFX.random(-4, 4),
				vx: UFX.random(-50, 50), vy: UFX.random(-10, 30),
				r: UFX.random(1, 2.5),
				color: "rgb(" + UFX.random.rand(20,180) + ",0,0)",
			})
		},
		think: function (dt) {
			if (!this.dots) this.dots = []
			if (this.active) {
				for (var j = 0 ; j < 12 ; ++j) {
					if (UFX.random(0.1) < dt) this.adddot()
				}
			}
			this.dots.forEach(function (dot) {
				dot.t += dt
			})
			this.dots = this.dots.filter(function (dot) { return dot.t < 0.4 })
			if (!this.active && !this.dots.length) this.alive = false
		},
		draw: function () {
			if (!this.dots) return
			UFX.draw("b")
			this.dots.forEach(function (dot) {
				UFX.draw("b o", dot.x0 + dot.t * dot.vx, dot.y0 + dot.t * dot.vy, dot.r, "fs", dot.color, "f")
			})
			UFX.draw("fs black f")
		},
	})

function AphidCorpse(obj) {
	this.obj = obj
	this.X = this.obj.X
	this.y = this.obj.y
	this.vy = 30
	beffects.push(this)
	this.phis = []
	while (this.phis.length < this.obj.whiskers.length) {
		this.phis.push(UFX.random(2, 4) * UFX.random.choice([-1, 1]))
	}
	this.phi0 = UFX.random(3, 6) * UFX.random.choice([-1, 1])
	this.tspin = 0
	this.think(0)
}
AphidCorpse.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(FadesAway, 0.5)
	.addcomp({
		think: function (dt) {
			this.ay = -100
			this.tspin += dt
		},
		draw: function () {
			var t = this.tspin, d = t * 50, phis = this.phis
			this.obj.whiskers.forEach(function (whisker, j) {
				UFX.draw("[ t", -Math.sin(whisker.A0) * d, Math.cos(whisker.A0) * d,
					"r", phis[j] * t)
				whisker.draw()
				context.restore()
			})
			UFX.draw("[ r", this.phi0 * t)
			this.obj.body.draw(camera.zoom)
			UFX.draw("]")
		},
	})
	.addcomp(BasicMotion)

