
function ViewState() {
	this.x0G = 0  // center of viewport in game coordinates
	this.y0G = 0
	this.VzoomG = 32  // zoom value in view units per game unit
	
	this.targetx0G = 0
	this.targety0G = 0
	this.targetVzoomG = 32
	this.vG = null
	this.zcenterV = null
}
ViewState.prototype = {
	think: function (dt) {
		var f = Math.min(1, constants.viewtargetfactor * dt)
		this.x0G += (this.targetx0G - this.x0G) * f
		this.y0G += (this.targety0G - this.y0G) * f
		if (this.targetVzoomG != this.VzoomG) {
			var Vzoom0G = this.VzoomG
			this.VzoomG = Math.exp(Math.log(this.VzoomG) * (1 - f) + Math.log(this.targetVzoomG) * f)
			if (this.zcenterV) {
				var GfV = 1 / Vzoom0G - 1 / this.VzoomG
				this.targetx0G = this.x0G += GfV * this.zcenterV[0]
				this.targety0G = this.y0G += GfV * this.zcenterV[1]
			}
		} else {
			this.zcenterV = null
		}
		if (this.vV) {
			this.snap(this.vV[0] * dt, this.vV[1] * dt)
			var f = Math.exp(-constants.flydecelfactor * dt)
			this.vV[0] *= f
			this.vV[1] *= f
			if (Math.abs(this.vV[0]) + Math.abs(this.vV[1]) < 1) this.vV = null
		}
	},
	clampzoom: function () {
		this.targetVzoomG = clamp(this.targetVzoomG, constants.minVzoomG, constants.maxVzoomG)
		this.VzoomG = clamp(this.VzoomG, constants.minVzoomG, constants.maxVzoomG)
	},
	scootch: function (dxV, dyV, dz, zcenterV) {
		if (dxV) this.targetx0G += dxV / this.VzoomG
		if (dyV) this.targety0G += dyV / this.VzoomG
		if (dz) {
			this.targetVzoomG *= Math.exp(dz)
			this.clampzoom()
			this.zcenterV = zcenterV
		}
	},
	snap: function (dxV, dyV, dz) {
		if (dxV) this.x0G = this.targetx0G += dxV / this.VzoomG
		if (dyV) this.y0G = this.targety0G += dyV / this.VzoomG
		if (dz) {
			this.VzoomG = this.targetVzoomG *= Math.exp(dz)
			this.clampzoom()
		}
	},
	fly: function (vV) {
		this.vV = vV
	},
}



