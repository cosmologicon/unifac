
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
	look: function () {
		var s = this.scale()
		UFX.draw("t", canvas.width / 2, canvas.height / 2, "z", s, s)
	},
}
camera.reset()

