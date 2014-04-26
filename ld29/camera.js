// Conventions:
// x > 0 is to the right
// y > 0 is down

var camera = {
	x0: 0,
	y0: 0,
	z: 20,
	
	transform: function () {
		UFX.draw("t", canvas.width/2, canvas.height/2, "z", this.z, -this.z, "t", -this.x0, -this.y0)
	}
}

