
var vista = {

	levelinit: function (level) {
		level = level || gamestate.level
		this.xmin = 0 ; this.ymin = -40
		this.vx = 1000 ; this.vy = 600  // size of entire playing field
		this.snapto([0, 0])
		
		this.backdrop = document.createElement("canvas")
		var bx = this.vx - this.xmin, by = this.vy - this.ymin
		var h = 200  // distance from horizon to bottom of viewport
		this.backdrop.width = bx
		this.backdrop.height = by
		var context = this.backdrop.getContext("2d")

		var gzx = 8, gzy = 2
		var ground = UFX.texture.dirt({ width: bx / gzx, height: h / gzy })
		var szx = 6, szy = 6
		var sky = UFX.texture.overcast({ size: 256 })
		var c0 = "rgba(128,128,128,0)", c1 = "rgba(128,128,128,1)"

		UFX.draw(context,
			"[ z", szx, szy, "drawimage0", sky, "]",
			"[ t 0", by-h, "z", gzx, gzy, "drawimage0", ground, "]",
			"fs", UFX.draw.lingrad(context, 0, by, 0, 0, 0.3*h/by, c0, h/by, c1, 1.7*h/by, c0), "f0"
		)
		
	},

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
		UFX.draw("t", -this.x, this.y+settings.sy,
			"drawimage", this.backdrop, this.xmin, -this.backdrop.height - this.ymin)
		
	},
}


