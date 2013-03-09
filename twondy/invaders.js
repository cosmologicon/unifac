
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
	this.alive = true
}
Aphid.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(PortalUser)
	.addcomp(HasStates, ["draw", "think"])
	.addcomp(IsBall, 6, "gray")
	.addcomp(Sneezes)
	.setmethodmode("draw", "any")
Aphid.prototype.vmax = 400
Aphid.prototype.amax = 400
