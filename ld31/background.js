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
		
		this.nightsky = UFX.texture.nightsky({ size: 512 })
		this.stone = UFX.texture.stone({ size: 512 })
		this.roughshade = UFX.texture.roughshade({ size: 512 })
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
		if (this.f && this.last != "intro") {
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
		"lex": "day",
		"cain": "night",
		"roger": "dungeon",
		"tanya": "dungeon",
		"eli": "dungeon",
		"sally": "dungeon",
		"polly": "rain",
		"pilar": "day",
		carmen: "night",
		dana: "space",
		meg: "rain",
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
			case "space":
				fillwith(this.nightsky)
				break
			case "dungeon":
				fillwith(this.stone)
				fillwith(this.roughshade)
				break
			default:
				UFX.draw(con, "fs #222 f0")
				break
		}
		return surf
	},
	drawcurtain: function () {
		if (this.last != "intro" || this.f == 0) return
		UFX.draw("[ t 0", -sy * (1 - this.f), "( m", sx, "0 l 0 0 l 0", sy)
		for (var j = 0 ; j <= 10 ; ++j) {
			var x0 = j * sx / 10, x1 = x0 + sx / 20, x2 = x1 + sx / 20, dy = sx / 80
			UFX.draw("q", x1, sy + dy, x2, sy)
		}
		UFX.draw(") fs #800 f ]")
	},
	drawtitle: function () {
		UFX.draw("[ textalign center textbaseline middle font " + fH(2) + "px~Viga fs white")
		context.fillText(settings.gamename, sx/2, sy/3)
		UFX.draw("font " + fH(1) + "px~Viga fs white")
		context.fillText("by Christopher Night", sx/2, sy/2)
		UFX.draw("]")
	},
	drawsubtitle: function (text) {
		UFX.draw("[ textalign center textbaseline middle font " + fH(1) + "px~Viga fs white")
		context.fillText(text, sx/2, 2*sy/3)
		UFX.draw("]")
	},
}

