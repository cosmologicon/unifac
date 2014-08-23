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

