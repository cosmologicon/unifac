var view = {
	x0: 0,
	y0: 0,
	Z: 4,
	z: Math.exp(4),
	
	think: function (dt) {
		this.z = Math.exp(this.Z)
	},
	transform: function () {
		UFX.draw("t", canvas.width/2, canvas.height/2, "z", this.z, this.z, "t", -this.x0, -this.y0)
	},
	zoom: function (amt, spos) {
		var xoff = spos[0] - canvas.width / 2
		var yoff = spos[1] - canvas.height / 2
		this.Z = clamp(this.Z + amt, 2.5, 5.5)
		var newz = Math.exp(this.Z)
		this.x0 -= xoff * (1/newz - 1/this.z)
		this.y0 -= yoff * (1/newz - 1/this.z)
		this.z = newz
	},
	drag: function (dpos) {
		this.x0 -= dpos[0] / this.z
		this.y0 -= dpos[1] / this.z
		background.x0 += dpos[0] * 0.5
		background.y0 += dpos[1] * 0.5
	},
	
	toscreen: function (gamex, gamey) {
		return [
			canvas.width / 2 + (gamex - this.x0) * this.z,
			canvas.height / 2 + (gamey - this.y0) * this.z,
		]
	},
	togame: function (screenx, screeny) {
		return [
			this.x0 + (screenx - canvas.width / 2) / this.z,
			this.y0 + (screeny - canvas.height / 2) / this.z,
		]
	},
}

