// OH SNAP NOT ONLY ARE MY INVADERS COMPONENT-BASED ENTITIES, WITH ONE OF THOSE COMPONENTS BEING
// A FINITE STATE AUTOMATON, BUT THE STATES THEMSELVES ARE COMPONENT-BASED ENTITIES. I HAVE
// COMPLETELY LOST TRACK OF THE NUMBER OF LAYERS OF INDIRECTION I'M EMPLOYING HERE. AT THIS POINT
// I'M BASICALLY GETTING AS FAR AWAY FROM THE ORIGINAL SPACE INVADERS AS FUNCTIONALLY POSSIBLE.
// PUN INTENDED.

// YOU WANT TO KNOW WHAT this REFERS TO? WELL BEST OF LUCK FIGURING IT OUT, BUDDY! NOBODY HAS THE
// THE SLIGHTEST CLUE WHAT this REFERS TO ANYWHERE IN THIS PROGRAM! THANKS A TON, call AND apply!
// MWAHAHAHAHA!

// Seriously though, in this module, "this" refers to an invader object, except in "init" functions,
//   where it refers to an invader state.


// COMPONENTS OF INVADER STATES

// Invader state components' enter functions should ideally take a single argument, an
// initialization argument. This way different components can be put in the same state even if they
// take completely different arguments.


// Has a velocity and an acceleration, and updates position based on that
var BasicMotion = {
	init: function () {
		this.vx = this.vx || 0
		this.vy = this.vy || 0
		this.ax = this.ax || 0
		this.ay = this.ay || 0
	},
	think: function (dt) {
		this.X += (this.vx + 0.5 * this.ax * dt) * dt / this.xfactor
		this.y += (this.vy + 0.5 * this.ay * dt) * dt
		this.vx += this.ax * dt
		this.vy += this.ay * dt
		// Last ax and ay are the acceleration for the purposes of animation
		this.lastax = this.ax ; this.lastay = this.ay
		this.ax = this.ay = 0
	},
}

// Approaches y + A sin(phi t) with rate beta, with a friction term given by alpha
var ApproachAltitude = {
	enter: function (obj) {
		this.targety = obj.targety
		this.approachyalpha = obj.approachyalpha || 2
		this.approachybeta = obj.approachybeta || 2
		this.approachyA = obj.approachyA || 0
		this.approachyphi = obj.approachyphi || 1
		this.approachyt = 0
	},
	think: function (dt) {
		this.approachyt += dt
		var y = this.targety
		if (this.approachyA) y += this.approachyA * Math.sin(this.approachyphi * this.approachyt)
        this.ay = -this.approachyalpha * this.vy + this.approachybeta * (y - this.y)
	},
}
var ApproachWaveAltitude = {
	enter: function (obj) {
		this.targety0 = obj.targety0
		this.approachyalpha = obj.approachyalpha || 2
		this.approachybeta = obj.approachybeta || 2
		this.approachyA = obj.approachyA || 0
		this.approachyn = obj.approachyn || 1
	},
	think: function (dt) {
		this.approachyt += dt
		var y = this.targety0
		if (this.approachyA) y += this.approachyA * Math.sin(this.X * this.approachyn)
        this.ay = -this.approachyalpha * this.vy + this.approachybeta * (y - this.y)
	},
}
var ApproachVelocity = {
	enter: function (obj) {
		this.targetvx = obj.targetvx
		this.approachxalpha = obj.approachxalpha || 2
	},
	think: function (dt) {
		this.ax = -this.approachxalpha * (this.vx - this.targetvx)
	}
}


var ScrunchInMotion = {
	draw: function () {
//		var adotv = clip((this.lastax * this.vx + this.lastay * this.vy) / 1000, -0.5, 0.5)
		var x = this.vx, y = this.vy
		if (!x && !y) return
		var A = Math.atan2(y, x)
		var s = 1 + clip(Math.sqrt(x * x + y * y) / 800, 0, 0.3)
		UFX.draw("r", A, "z", s, 1/s, "r", -A)
	},
}


// Set the clipping region. This is a bit tricky beacuse it gets invoked
//   *after* the initial transformation in WorldBound.draw. This solution
//   seemed a bit inelegant at first, but actually I don't thnik it's so bad.
var ClipsToPortal = {
	draw: function () {
		context.restore()
		context.save()
		this.portal.setclip()
		WorldBound.draw.apply(this)
	},
}

var ClipsToGround = {
	enter: function () {
		this.groundy = groundy(this.y)
	},
	draw: function () {
		UFX.draw("[ t 0", -this.y + this.groundy, "m -1000 0 l 1000 0 l 0 1000 ] clip")
	},
}

// Load up a later state after a specified time
var AutoNextState = {
	enter: function (obj, nextstate) {
		this.autonextstate = nextstate
		this.autowaittime = obj.t
	},
	think: function (dt) {
		if (this.autowaittime < 0) return
		this.autowaittime -= dt
		if (this.autowaittime < 0) {
			this.nextstate = this.autonextstate
		}
	},
}

var BeInvisible = {
	init: function () {
		if (!this.draw) this.definemethod("draw")
		this.setmethodmode("draw", "any")
	},
	draw: function () {
		return true
	},
}

// Follow a Bezier path from current position/velocity to target position/velocity
var TargetBezier = {
	enter: function (opts, nstate) {
		var vx = opts.targetvx || 0, vy = opts.targetvy || 0
		this.path = objbezier(this, opts.targetX, opts.targety, vx, vy)
		this.targetnextstate = nstate
	},
	think: function (dt) {
		this.path.t += dt
		var pva = this.path.pva()
		this.X = pva[0] ; this.y = pva[1]
		var xfactor = this.y + gamestate.worldr
		this.vx = pva[2] * xfactor ; this.vy = pva[3]
		this.lastax = pva[4] * xfactor ; this.lastay = pva[5]
		if (this.path.t > this.path.t0) {
			this.nextstate = this.targetnextstate
		}
	},
}


// ACTUAL INVADER STATES

// Remain invisible for a specified amount of time before transitioning to next state
var HideState = UFX.Thing()
	.addcomp(AutoNextState)
	.addcomp(BeInvisible)
HideState.invulnerable = true

// Just keep doing what you're doing
var DriftState = UFX.Thing()
	.addcomp(BasicMotion)
	.addcomp(ScrunchInMotion)
	.addcomp(AutoNextState)
	.definemethod("draw")

// Maintain a given altitude and x-velocity
var StationKeepingState = UFX.Thing()
//	.addcomp(ApproachAltitude)
	.addcomp(ApproachWaveAltitude)
	.addcomp(ApproachVelocity)
	.addcomp(BasicMotion)
	.addcomp(ScrunchInMotion)
	.definemethod("draw")

// While coming out of the portal
// Moves in a direction perpendicular to the plane of the portal, obvs
var PortalState = UFX.Thing()
	.addcomp({
		enter: function () {
			this.portalx = -100
			this.portalv = 240
			this.X = this.portal.X
			this.y = this.portal.y
		},
		exit: function () {
			this.portal.removeentity(this)
		},
		think: function (dt) {
			var S = this.portal.tiltS, C = -this.portal.tiltC
			this.portalx += dt * this.portalv
            this.vx = this.portalv * S
            this.vy = this.portalv * C
			this.X = this.portal.X + this.portalx * S / this.portal.xfactor
			this.y = this.portal.y + this.portalx * C
			this.ax = this.ay = 0
			if (this.portalx > 100) {
				this.squad.onexitportal(this)
			}
		},
	})
	.addcomp(ClipsToPortal)
	.addcomp(ScrunchInMotion)

var TargetOmega = UFX.Thing()
	.addcomp(ScrunchInMotion)
	.addcomp(TargetBezier)
	.addcomp({
		enter: function () {
			this.alerter = new Alerter(this)
		},
		think: function (dt) {
			this.whiskerA = Math.max(0, this.whiskerA - 0.5 * dt)
		}
	})
	.definemethod("draw")

var InhaleState = UFX.Thing()
	.addcomp(AutoNextState)
	.addcomp({
		draw: function () {
			var s = clip(2 - this.autowaittime * this.autowaittime, 1, 2)
			UFX.draw("t 0 -10 z", 1/s, s, "t 0 10")
		}
	})

var SneezeState = UFX.Thing()
	.addcomp(AutoNextState)
	.addcomp({
		enter: function () {
			this.sneeze = new Sneeze(this)
			this.whiskerA = 0.5
			this.whiskerR = 6
			this.shudders = 0
			this.shudderA = 0
		},
		exit: function () {
			this.sneeze.die()
		},
		think: function (dt) {
			this.shudders = clip(this.shudders + dt * UFX.random(-30, 30), 0.4)
			this.shudderA = clip(this.shudderA + dt * UFX.random(-20, 20), 0.3)
		},
		draw: function () {
			var s = Math.exp(this.shudders)
			UFX.draw("t 0 -10 r", this.shudderA, "z", 1/s, s, "t 0 10")
		},
	})

var DroopState = UFX.Thing()
	.addcomp({
		enter: function () {
			this.vy = 100
			this.alerter.freezepos()
			this.alerter.die()
		},
		think: function (dt) {
			this.ay = -300
			if (this.y < -50) this.die()
		},
	})
	.addcomp(BasicMotion)
	.addcomp(ClipsToGround)
	.addcomp(ScrunchInMotion)

