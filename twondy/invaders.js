

var KeepsEffects = {
	addeffect: function (effect) {
		if (!this.effects) this.effects = []
		this.effects.push(effect)
	},
	die: function () {
		if (!this.effects) return
		this.effects.forEach(function (effect) { if (effect.alive) effect.die() })
	},
}

var PortalUser = {
	init: function (portalv) {
		// The speed when coming out of a portal
		// (direction is dictated by the portal itself)
		this.portalv = portalv
	},
	joinportal: function (portal, tdelay, portalv) {
		if (typeof tdelay != "number") tdelay = portal.nexttime()
		this.setstate([HideState, {t: tdelay}, [PortalState, {portalv: portalv}]])
		this.portal = portal
		portal.addentity(this)
	},
	// See PortalState for relevant positioning and timing
}

var Clonkable = {
	init: function (width, height) {
		this.clonkwidth = width || 10
		this.clonkheight = height || this.clonkwidth
	},
	draw: function () {
		if (settings.DEBUG) {
			UFX.draw("[ fs rgba(255,128,0,0.2) ss rgba(255,128,0,0.4) fsr",
				-this.clonkwidth, -this.clonkheight, 2*this.clonkwidth, 2*this.clonkheight, "]"
			)
		}
	},
	beclonked: function (who) {
		if (this.state.invulnerable) return false
		if (this.vy < who.vy) return false
		if (Math.abs(who.y - this.y) > this.clonkheight) return false
		if (Math.abs(getdX(who.X, this.X)) * this.xfactor > this.clonkwidth) return false
		// TODO: possibility of taking damage without dying
		this.die(true)
		return true
	},
}

// Sneezing is how aphids attack
var Sneezes = {
	release: function () {
		this.nextstate = [
			TargetOmega, { targetX: this.X + 1, targety: 20 }, [
			DriftState, { t: 1.0 }, [
			InhaleState, { t: 1.0 }, [
			SneezeState, { t: 5.0 }, [
			DroopState, {}, [
			]]]]]
		]
	},
}

var DrawBody = {
	init: function (bodies) {
		this.bodies = bodies
	},
	think: function (dt) {
		if (!this.body) this.body = UFX.random.choice(this.bodies)
	},
	draw: function () {
		this.body.draw(camera.zoom)
	},
	trace: function (context) {
		this.body.trace(context)
	},
}
var aphidbodies = [
	UFX.Tracer(AphidBodyPaths[0], [-14, -14, 28, 28])
]


var HasWhiskers = {
	init: function () {
		this.whiskerA = 0.25  // amplitude of whisker motion, can be changed by states
		this.whiskerR = 1
	},
	think: function (dt) {
		if (!this.whiskers) {
			var w = this.whiskers = [], obj = this
			UFX.random.spread1d(4, 1).forEach(function (p) {
				w.push(new Whisker(obj, (p * 0.8 + 0.6) * tau))
			})
		}
		dt *= this.whiskerR
		this.whiskers.forEach(function (whisker) {
			whisker.think(dt)
		})
	},
	draw: function () {
		this.whiskers.forEach(function (whisker) {
			context.save() ; whisker.draw() ; context.restore()
		})
	},
	trace: function (context) {
		this.whiskers.forEach(function (whisker) {
			context.save() ; whisker.trace(context) ; context.restore()
		})
	},
}
function Whisker(obj, A, shape) {
	this.obj = obj
	this.A0 = A
	this.dA = 0
	this.shape = shape || UFX.random.choice(whiskershapes)
	this.phi = UFX.random(2, 4)
	this.t = 0
}
Whisker.prototype = {
	think: function (dt) {
		this.t += dt
	},
	draw: function () {
		this.dA = this.obj.whiskerA * Math.sin(this.t * this.phi)
		UFX.draw("r", this.A0 + this.dA)
		this.shape.draw(camera.zoom)
	},
	trace: function (context) {
		UFX.draw(context, "r", this.A0)
		this.shape.trace(context)
	},
}
var whiskershapes = [
	UFX.Tracer("fs gray ss black lw 1 b fsr -2 0 4 26", [-4, -4, 8, 32]),
]

var LowResTracer = {
	init: function (tracersize) {
		this.tracersize = tracersize
	},
	draw: function () {
		if (settings.detail.dynamicinvaders) return
		if (!this.tracer) {
			var obj = this, t = obj.tracersize
			this.tracer = new UFX.Tracer(
				function (context) { obj.trace(context) },
				[-t, -t, 2*t, 2*t]
			)
		}
		this.tracer.draw(camera.zoom)
		return true
	},
}



// The measliest of all invaders, the lowly aphid
function Aphid() {
	// Constructor doesn't do much, because we assume the squad will set us up with a portal
	//   and position and whatnot
}
Aphid.prototype = UFX.Thing()
	.addcomp(Lives)
	.addcomp(KeepsEffects)
	.addcomp(WorldBound)
	.addcomp(PortalUser)
	.addcomp(HasStates, ["draw", "think"])
	.addcomp(LowResTracer, 30)
	.addcomp(HasWhiskers)
	.addcomp(DrawBody, aphidbodies)
	.addcomp(Sneezes)
	.addcomp(Clonkable, 20, 8)
	.addcomp({
		die: function (clonked) {
			if (clonked) new AphidCorpse(this)
		},
	})
	.setmethodmode("draw", "any")
Aphid.prototype.vmax = 400
Aphid.prototype.amax = 400
