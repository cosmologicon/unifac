var camera = {
	x0: 0,
	y0: 0,
	z: 1,
	
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

