// OH SNAP NOT ONLY ARE MY INVADERS COMPONENT-BASED ENTITIES, WITH ONE OF THOSE COMPONENTS BEING
// A FINITE STATE AUTOMATON, BUT THE STATES THEMSELVES ARE COMPONENT-BASED ENTITIES. I HAVE
// COMPLETELY LOST TRACK OF THE NUMBER OF LAYERS OF INDIRECTION I'M EMPLOYING HERE. AT THIS POINT
// I'M BASICALLY GETTING AS FAR AWAY FROM THE ORIGINAL SPACE INVADERS AS FUNCTIONALLY POSSIBLE.
// PUN INTENDED.

// COMPONENTS OF INVADER STATES

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
		this.ax = 0
		this.ay = 0
	},
}

// Takes an initialization object with targety
var ApproachAltitude = {
	enter: function (obj) {
		this.targety = obj.targety
		this.approachyalpha = obj.approachyalpha || 2
		this.approachybeta = obj.approachybeta || 2
	},
	think: function (dt) {
        this.ay = -this.approachyalpha * this.vy + -this.approachybeta * (this.y - this.targety)
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

// Load up a later state after a specified time
var AutoNextState = {
	enter: function (nstate, t) {
		this.autonextstate = nstate
		this.autowaittime = t
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

// ACTUAL INVADER STATES

// Remain invisible for a specified amount of time before transitioning to next state
var HideState = UFX.Thing()
	.addcomp(AutoNextState)
	.addcomp(BeInvisible)		

// Just keep doing what you're doing
var DriftState = UFX.Thing()
	.addcomp(BasicMotion)
	.definemethod("draw")

// Maintain a given altitude and x-velocity
var StationKeepingState = UFX.Thing()
	.addcomp(ApproachAltitude)
	.addcomp(ApproachVelocity)
	.addcomp(BasicMotion)
	.definemethod("draw")

// While coming out of the portal
// Moves in a direction perpendicular to the plane of the portal, obvs
var PortalState = UFX.Thing()
	.addcomp({
		enter: function () {
			this.portalx = -100
			this.portalv = 400
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


