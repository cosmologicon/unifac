// Conventions:
// x > 0 is to the right
// y > 0 is down

var camera = {
	x0: 0,
	y0: 0,
	z: 20,
	focus: null,
	
	think: function (dt) {
		if (this.focus) {
			this.x0 = this.focus.x
			this.y0 = this.focus.y
		}
		this.ymin = this.y0 - canvas.height / this.z * 0.6
		this.ymax = this.y0 + canvas.height / this.z * 0.6
	},
	
	transform: function () {
		UFX.draw("t", canvas.width/2, canvas.height/2, "z", this.z, -this.z, "t", -this.x0, -this.y0)
	}
}

