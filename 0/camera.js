
var camera = {
	think: function (dt, zfactor) {
		var sx = canvas.width, sy = canvas.height, s = Math.min(sx, sy)
		var xmax = 12, ymax = 12
		things.forEach(function (thing) {
			if (thing.x) xmax = Math.max(thing.x, xmax)
			if (thing.y) ymax = Math.max(thing.y, ymax)
		})
		this.x0 = sx / 2
		this.y0 = sy / 2
		this.z = Math.min(sx/(2*xmax+4), sy/(2*ymax+4)) * (zfactor || 1)
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


