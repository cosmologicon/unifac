

var KeepsEffects = {
	addeffect: function (effect) {
		if (!this.effects) this.effects = []
		this.effects.push(effect)
		effects.push(effect)
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
	joinportal: function (portal, tdelay) {
		if (typeof tdelay != "number") tdelay = portal.nexttime()
		this.setstate([HideState, {t: tdelay}, PortalState])
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
		this.die()
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
	.addcomp(IsBall, 6, "gray")
	.addcomp(Sneezes)
	.addcomp(Clonkable, 10, 5)
	.setmethodmode("draw", "any")
Aphid.prototype.vmax = 400
Aphid.prototype.amax = 400
