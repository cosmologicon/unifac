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
		this.ymin = this.y0 - canvas.height / this.z * 0.55
		this.ymax = this.y0 + canvas.height / this.z * 0.55
		this.xmin = this.x0 - canvas.width / this.z * 0.55
		this.xmax = this.x0 + canvas.width / this.z * 0.55
		
	},
	
	transform: function () {
		UFX.draw("t", canvas.width/2, canvas.height/2, "z", this.z, -this.z, "t", -this.x0, -this.y0)
	},
	
	visible: function (x, y, r) {
		return x > this.xmin - r && x < this.xmax + r && y > this.ymin - r && y < this.ymax + r
	},
}

