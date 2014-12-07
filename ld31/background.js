var background = {
	cache: {},
	f: 0,
	last: null,
	reset: function () {
		this.cache = {}
		this.f = 0
		this.last = null
		this.current = null
		this.t = 0
		this.flasht = 0
		this.drops = []
	},
	think: function (dt) {
		if (state.place != this.current) {
			this.last = this.current
			this.f = 1
		}
		this.current = state.place
		this.f -= dt * 1
		if (this.f <= 0) {
			this.last = null
			this.f = 0
		}
		this.t += dt
		if (this.scenes[this.current] == "rain") {
			if (UFX.random.flip(0.1 * dt)) {
				this.flasht = 0.4
			}
			if (UFX.random.flip(10 * dt)) {
				this.drops.push({ x: UFX.random(sx), t: this.t })
			}
		}
		if (this.flasht) {
			this.flasht = Math.max(this.flasht - dt, 0)
		}
		var t0 = this.t
		this.drops = this.drops.filter(function (drop) { return t0 - drop.t < 0.5 })
	},
	draw: function () {
		if (this.f) {
			UFX.draw("[ drawimage0", this.get(this.last), "alpha", 1 - this.f, "drawimage0",
				this.get(this.current), "]")
		} else {
			UFX.draw("drawimage0", this.get(this.current))
		}
		var t0 = this.t
		this.drops.forEach(function (drop) {
			var y = ((t0 - drop.t) * 2) * sy
			var x = drop.x - (1 - (t0 - drop.t) * 2) * sy / 10
			UFX.draw("lw 2 [ t", x, y, "b m 0 0 l", sx/100, sx/10, "ss #44A s ]")
		})
		if (this.flasht && this.flasht * 10 % 2 > 1) UFX.draw("fs white f0")
	},
	scenes: {
		"hub": "day",
		"lex": "day",
		"roger": "dungeon",
		"tanya": "dungeon",
		"eli": "dungeon",
		"polly": "night",
		"sally": "night",
		"pilar": "rain",
	},
	get: function (name) {
		name = this.scenes[name] || name
		if (this.cache[name]) return this.cache[name]
		var surf = this.cache[name] = document.createElement("canvas")
		surf.width = sx
		surf.height = sy
		var con = surf.getContext("2d")
		function fillwith(overlay) {
			for (var x = 0 ; x < surf.width ; x += overlay.width) {
				for (var y = 0 ; y < surf.height ; y += overlay.height) {
					con.drawImage(overlay, x, y)
				}
			}
		}
		switch (name) {
			case "day":
				UFX.draw(con, "fs", UFX.draw.lingrad(0, 0, 0, sy, 0, "#AAF", 1, "#DDF"), "f0")
				var z = sy / settings.h
				UFX.draw(con, "t", 0, sy, "z", z, -z)
				for (var h = 14 ; h > 2 ; --h) {
					var color = "rgb(20," + (140 - 5 * h) + ",20)"
					var x = (0.4567 + 0.619 * h) % 1 * settings.w
					UFX.draw(con, "[ t", x, h, "( m -12 -12 c 0 0 0 0 12 -12 ) fs", color, "f ]")
				}
				break
			case "night":
				fillwith(this.get("day"))
				UFX.draw(con, "fs black alpha 0.5 f0")
				break
			case "rain":
				fillwith(this.get("night"))
				break
			case "dungeon":
				fillwith(UFX.texture.stone({ size: 512 }))
				fillwith(UFX.texture.roughshade({ size: 512 }))
				break
			default:
				UFX.draw(con, "fs #222 f0")
				break
		}
		return surf
	},
}

