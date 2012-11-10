
var vista = {


	levelinit: function (level) {
		level = level || gamestate.level
		this.xmin = 0 ; this.ymin = -40
		this.vx = 1000 ; this.vy = 600  // size of entire playing field
		this.snapto([0, 0])
		
		this.backdrop = document.createElement("canvas")
		var bx = this.vx - this.xmin, by = this.vy - this.ymin
		this.backdrop.width = bx
		this.backdrop.height = by
		var context = this.backdrop.getContext("2d")
		UFX.draw(context, "fs rgb(20,20,80) f0")
		UFX.random.spread().forEach(function (p) {
			UFX.draw(context, "b o", p[0]*bx, p[1]*by, "10 fs white f")
		})
		UFX.draw(context, "lw 20 ss yellow sr 0 0", bx, by)
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
		UFX.draw("t", -this.x, this.y+settings.sy, "[ vflip drawimage", this.backdrop, this.xmin, this.ymin, "]")
		
	},
}


