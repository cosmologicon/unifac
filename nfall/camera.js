var camera = {
	x0: 0,
	y0: 0,
	z: 1,
	
	screentoworld: function (p) {
		return p ? [
			(p[0] - this.x0) / this.z,
			(p[1] - this.y0) / this.z,
		] : null
	},
	worldtoscreen: function (p) {
		return p ? [
			p[0] * this.z + this.x0,
			p[1] * this.z + this.y0,
		] : null
	},
	
	pan: function (dx, dy) {
		this.x0 += dx / this.z
		this.y0 += dy / this.z
	},
	draw: function () {
		UFX.draw("t", this.x0, this.y0, "z", this.z, this.z)
	},
}

