var camera = {
	init: function () {
		this.x0 = this.y0 = 0
		this.z = 1
	},
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

function screengrab() {
	var can = document.createElement("canvas")
	can.width = canvas.width
	can.height = canvas.height
	var con = can.getContext("2d")
	con.drawImage(canvas, 0, 0)
	can.draw = function () {
		context.drawImage(this, 0, 0)
	}
	return can
}



