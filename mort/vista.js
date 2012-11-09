
var vista = {
	vx: 1000, vy: 600,  // size of entire playing field
	x: 0, y: 0,  // Current camera target
	xmin: 0, ymin: -40,
	tx: 0, ty: 0,  // Desired camera target



	lookat: function (p) {
		this.tx = clip(p[0] - settings.sx/2, this.xmin, this.vx - settings.sx)
		this.ty = clip(p[1] - settings.sy/2, this.ymin, this.vy - settings.sy)
	},

	snapto: function (p) {
		this.lookat(p)
		this.x = this.tx ; this.y = this.ty
	},
	
	think: function (dt) {
		var dx = this.tx - this.x
		var dy = this.ty - this.y
		var d = 400 * dt
		this.x = Math.abs(dx) < d ? this.tx : this.x + (dx > 0 ? d : -d)
		this.y = Math.abs(dy) < d ? this.ty : this.y + (dy > 0 ? d : -d)
	},
	
	draw: function () {
		UFX.draw("fs blue f0 t", -this.x, -this.y)
		
	},
}


