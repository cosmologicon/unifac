var background = {
	init: function () {
		var colors = [
			[0,100,255],
			[255,0,0],
			[180,0,180],
			[200,100,0],
			[0,220,0],
		]
		var color = colors[state.level % colors.length], r = color[0], g = color[1], b = color[2]
		this.plasma = [
			UFX.texture.nightsky({
		        size: 512, r0: r, dr: 0, g0: g, dg: 0, b0: b, db: 0, a0: 10, da: 10, fraclevel: 3, scale: 4, rstar1: 0.4,
		    }),
			UFX.texture.overcast({
		        size: 512, r0: r, dr: 0, g0: g, dg: 0, b0: b, db: 0, a0: 10, da: 10, fraclevel: 3, scale: 4,
		    }),
			UFX.texture.overcast({
		        size: 512, r0: r, dr: 0, g0: g, dg: 0, b0: b, db: 0, a0: 10, da: 10, fraclevel: 3, scale: 4,
		    }),
			UFX.texture.overcast({
		        size: 512, r0: r, dr: 0, g0: g, dg: 0, b0: b, db: 0, a0: 10, da: 10, fraclevel: 3, scale: 4,
		    }),
		]
		this.t = 0
		this.x0 = 0
		this.y0 = 0
	},
	think: function (dt) {
		this.t += dt
	},
	
	draw: function () {
		var sx = canvas.width, sy = canvas.height
		UFX.draw("fs black f0")
		for (var j = 0 ; j < 4 ; ++j) {
			var x = this.x0 + (j ? 18 * Math.sin(1 + 2 * j) * this.t : 0)
			var y = this.y0 + (j ? 18 * Math.cos(1 + 2 * j) * this.t : 0)
			var px0 = Math.floor(x), py0 = Math.floor(y)
			for (var px = px0 - 512 * Math.ceil(px0 / 512) ; px < sx ; px += 512) {
				for (var py = py0 - 512 * Math.ceil(py0 / 512) ; py < sy ; py += 512) {
					UFX.draw("drawimage", this.plasma[j], px, py)
				}
			}
		}
		UFX.draw("ss rgba(255,255,255,0.05) lw 1 b")
		var pmin = view.togame(0, 0), pmax = view.togame(sx, sy)
		for (var x = Math.ceil(pmin[0] + 0.5) - 0.5 ; x <= pmax[0] ; ++x) {
			var screenx = view.toscreen(x, 0)[0]
			UFX.draw("m", screenx, 0, "l", screenx, sy)
		}
		for (var y = Math.ceil(pmin[1] + 0.5) - 0.5 ; y <= pmax[1] ; ++y) {
			var screeny = view.toscreen(0, y)[1]
			UFX.draw("m", 0, screeny, "l", sx, screeny)
		}
		UFX.draw("s")
	},
}

