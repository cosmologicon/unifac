

var stars = {
	init: function () {
		// Box size
		this.b = 1400
		this.n = Math.floor(this.b * this.b * settings.detail.fstars / 10000) + 1
		this.ps = UFX.random.spread(this.n, 1, this.b, this.b, -this.b/2, -this.b/2)
		this.colors = []
		this.rs = []
		for (var j = 0 ; j < this.n ; ++j) {
			this.colors.push(UFX.random.choice("#112 #020 #211 #210 #220 #202".split(" ")))
			this.rs.push(UFX.random.choice([4, 5, 7, 9]))
		}
		this.t = 0

		// The path for a unit-sized five-pointed star
		// coords = [([2, 1][j % 2], j * math.pi / 5) for j in range(10)]
		// " ".join("l %.2f %.2f" % (r * math.cos(theta), r * math.sin(theta)) for r, theta in coords)
		this.path = "( m 2 0 l 0.81 0.59 l 0.62 1.90 l -0.31 0.95 l -1.62 1.18 l -1 0 l -1.62 -1.18 " +
			"l -0.31 -0.95 l 0.62 -1.90 l 0.81 -0.59 )"

		this.zpow = -0.85
	},
	think: function (dt) {
		this.t += dt
	},
	draw: function () {
		if (!settings.detail.stars) return
		var s = Math.pow(camera.zoom, this.zpow)
		UFX.draw("[ z", s, s, "ss #333")
		// camera position in zoomed coordinates
		var cx = camera.p0[0]/s
		var cy = camera.p0[1]/s
		var ndraw = 0
		var diag = Math.sqrt(settings.sx * settings.sx + settings.sy * settings.sy) / 2
		var rmax = diag/(s*camera.zoom)+12, r2max = rmax * rmax
		for (var j = 0 ; j < this.n ; ++j) {
			var p = this.ps[j], r = this.rs[j], color = this.colors[j]
			var dx = zmod(p[0]-cx, this.b), dy = zmod(p[1]-cy, this.b)
			if (dx * dx + dy * dy > r2max) continue
			ndraw++
			UFX.draw("[ t", cx + dx, cy + dy, "z", r, r)
			if (j % 2) UFX.draw("hflip")
			UFX.draw("r", (0.2 + 0.001 * j) * this.t % tau)
			UFX.draw(this.path, "fs", color, "lw", 0.6/r, "f s ]")
		}
		UFX.draw("]")
	},
}


