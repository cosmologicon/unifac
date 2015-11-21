// Game coordinate system:
// (0, 0) is center of screen. Positive x is right. Positive y is down.

var camera = {
	reset: function () {
		this.x0 = 0  // Center of the screen in game units
		this.y0 = 0
		this.R = 100  // half-radius of the screen in game units
	},
	setstate: function (obj) {
		this.x0 = obj.x0
		this.y0 = obj.y0
		this.R = obj.R
	},
	getstate: function () {
		return {
			x0: this.x0,
			y0: this.y0,
			R: this.R,
		}
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
			(spos[0] - canvas.width / 2) / s + this.x0,
			(spos[1] - canvas.height / 2) / s + this.y0,
		]
	},
	// convert game coordinates to screen coordinates
	toscreen: function (gpos) {
		var s = this.scale()
		return [
			(gpos[0] - this.x0) * s + canvas.width / 2,
			(gpos[1] - this.y0) * s + canvas.height / 2,
		]
	},
	look: function () {
		var s = this.scale()
		UFX.draw("t", canvas.width / 2, canvas.height / 2, "z", s, s, "t", -this.x0, -this.y0)
	},
	scoot: function (dmpos) {
		var s = this.scale()
		this.x0 -= dmpos[0] / s
		this.y0 -= dmpos[1] / s
	},
	
	drawstars: function () {
		if (!this.stars) {
			this.stars = []
			while (this.stars.length < 10000) {
				var x = UFX.random(1e6, 2e6), y = UFX.random(1e6, 2e6), z = UFX.random(0.2, 1)
				var c = "0123456789ABCDEF"[Math.floor(z * 16)], color = "#" + c + c + c
				this.stars.push({ x: x, y: y, z: z, color: color })
			}
		}
		UFX.draw("fs black f0")
		var s = this.scale() * 0.5
		for (var j = 0 ; 1000 * j < canvas.width * canvas.height ; ++j) {
			var star = this.stars[j]
			var px = Math.floor(star.x - this.x0 * s * star.z) % canvas.width
			var py = Math.floor(star.y - this.y0 * s * star.z) % canvas.height
			UFX.draw("fs", star.color, "fr", px, py, 1, 1)
		}
	},
}
camera.reset()

