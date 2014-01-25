
function ViewState() {
	this.x0G = 0  // center of viewport in game coordinates
	this.y0G = 0
	this.VzoomG = 32  // zoom value in view units per game unit
}
ViewState.prototype = {
	think: function (dt) {
		this.x0G += 1.0 * dt
		this.y0G += 0.5 * dt
		this.VzoomG = 32 * Math.exp(0.3 * Math.sin(Date.now() * 0.01))
	},
}



