var background = {
	draw: function () {
		UFX.draw("fs black f0")
		UFX.draw("ss rgba(255,255,255,0.1) lw 1 b")
		var sx = canvas.width, sy = canvas.height
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

