
var vista = {

	levelinit: function (level) {
		level = level || gamestate.level
		this.xmin = 0 ; this.ymin = -40
		this.vx = mechanics.levelinfo[level].w ; this.vy = mechanics.levelinfo[level].h
		this.snapto([0, 0])
		
		this.backdrop = document.createElement("canvas")
		var bx = this.vx - this.xmin, by = this.vy - this.ymin
		var h = 200  // distance from horizon to bottom of viewport
		this.backdrop.width = bx
		this.backdrop.height = by
		var con = this.backdrop.getContext("2d")

		var gzx = 8, gzy = 2
		var szx = 6, szy = 6

        if (level == 1) {
		    var ground = UFX.texture.dirt()
		    var sky = UFX.texture.overcast()
		    var c0 = "rgba(128,128,128,0)", c1 = "rgba(128,128,128,1)"
	    } else if (level == 2) {
		    var ground = UFX.texture.cement()
		    var sky = UFX.texture.overcast()
		    var c0 = "rgba(128,128,128,0)", c1 = "rgba(128,128,128,1)"
	    } else if (level == 3) {
		    var ground = UFX.texture.grass()
		    var sky = UFX.texture.overcast()
		    var c0 = "rgba(128,128,128,0)", c1 = "rgba(128,128,128,1)"
	    } else if (level == 4) {
		    var ground = UFX.texture.patchydirt()
		    var sky = UFX.texture.clouds()
		    var c0 = "rgba(128,128,128,0)", c1 = "rgba(128,128,128,1)"
	    } else if (level == 5) {
		    var ground = UFX.texture.stone({scale: 16})
		    UFX.draw(ground.context, "drawimage0", UFX.texture.roughshade())
		    var sky = UFX.texture.clouds({scale: 16, sharpness: -2, size: 1024})
		    var c0 = "rgba(128,128,128,0)", c1 = "rgba(128,128,128,1)"
		    gzx = 4 ; gzy = 1
		    szx = 4 ; szy = 2
	    } else if (level == 6) {
		    var ground = UFX.texture.grass()
		    var sky = UFX.texture.clouds()
		    var c0 = "rgba(128,128,128,0)", c1 = "rgba(128,128,128,1)"
	    }
	    

        UFX.draw(con, "fs darkblue f0")
		UFX.draw(con,
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


