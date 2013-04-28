
var camera = {
	think: function (dt, zfactor) {
		var sx = canvas.width, sy = canvas.height, s = Math.min(sx, sy)
		this.x0 = sx / 2
		this.y0 = sy / 2
		this.z = s / 28 * (zfactor || 1)
	},
	screentoworld: function (p) {
		if (!p) return null
		return [
			(p[0] - this.x0) / this.z,
			(p[1] - this.y0) / this.z,
		]
	},
	draw: function () {
		UFX.draw("t", this.x0, this.y0, "z", this.z, this.z)
	},
}


