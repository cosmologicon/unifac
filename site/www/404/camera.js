// Game coordinate system:
// (0, 0) is center of screen. Positive x is right. Positive y is down.

var camera = {
	reset: function () {
		this.x0 = 0  // Center of the screen in game units
		this.y0 = 0
		this.R = 100  // half-radius of the screen in game units
	},
	// Pixels per game unit
	scale: function () {
		var s = Math.min(canvas.width, canvas.height)
		return s / (2 * this.R)
	},
	// convert screen coordinates to game coordinates
	togame: function (spos) {
		var s = this.scale()
		return [
			(spos[0] - canvas.width / 2) / s,
			(spos[1] - canvas.height / 2) / s,
		]
	},
	// convert game coordinates to screen coordinates
	toscreen: function (gpos) {
		var s = this.scale()
		return [
			gpos[0] * s + canvas.width / 2,
			gpos[1] * s + canvas.height / 2,
		]
	},
	look: function () {
		var s = this.scale()
		UFX.draw("t", canvas.width / 2, canvas.height / 2, "z", s, s)
	},
}
camera.reset()

