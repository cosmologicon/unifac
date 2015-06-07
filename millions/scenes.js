UFX.scenes.menu = {
	start: function () {
		this.ready = false
		this.f = 0
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.down]
	},
	think: function (dt, keys) {
		if (keys.space && this.ready) {
			UFX.scene.push("play")
			UFX.scene.push("intro")
		}
	},
	draw: function () {
		var grad = UFX.draw.lingrad(0, 0, sx, sy, 0, "#004", 1, "#00A")
		UFX.draw("fs", grad, "f0 [")
		var h = sy / 14
		var t = this.ready ? "press~space~to~begin" : "Loading...~" + (this.f * 100).toFixed(0) + "%"
		UFX.draw(
			"textalign center textbaseline middle fs white shc black",
			"font " + 1.4*h + "px~'Aclonica' shxy", h/10, h/10, "ft A~Thousand~Million", sx/2, 4*h,
			"font " + 1.4*h + "px~'Aclonica' shxy", h/10, h/10, "ft Slimy~Things", sx/2, 5.5*h,
			"font " + 0.7*h + "px~'Aclonica' shxy", h/20, h/20, "ft by~Christopher~Night", sx/2, 7*h,
			"font " + 0.7*h + "px~'Aclonica' shxy", h/20, h/20, "ft music:~creative-sound.org", sx/2, 8*h,
			"font " + 0.9*h + "px~'Aclonica' shxy", h/18, h/18, "ft", t, sx/2, 10*h,
			"]"
		)
	},
}

UFX.scenes.intro = {
	ftime: 0.4,
	start: function () {
		this.lines = [
			"All I want is a few billions years of peace and quiet. Is that too much to ask?",
			"I finally got rid of those lizards, and what happens just a few million years later?",
			"More animals, all over my surface now.",
			"And worse, they're starting to... build things.",
			"The animals' laser defense system will destroy asteroids. Rotate to prevent it from getting a lock.",
			"How long can you keep the population below 20,000 million?",
		]
		this.t = 0
		this.fading = 0
		UFX.resource.sounds.music.currentTime = 0
		UFX.resource.sounds.music.play()
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.down]
	},
	think: function (dt, keys) {
		this.t += dt
		if (keys.space && !this.fading && this.t > this.ftime) {
			this.fading = this.ftime
		}
		if (this.fading) {
			this.fading -= dt
			if (this.fading <= 0) this.advance()
		}
	},
	advance: function () {
		this.t = 0
		this.fading = 0
		this.lines.shift()
		if (!this.lines.length) UFX.scene.pop()
	},
	draw: function () {
		UFX.draw("fs black f0")
		if (!this.lines.length) return
		var alpha = (this.fading || this.t) / this.ftime
		var h = Math.round(sy / 10)
		var fname = this.lines.length <= 2 ? "Jockey~One" : "Miltonian~Tattoo"
		var color = this.lines.length <= 2 ? "#BBB" : "#44F"
		UFX.draw("textalign center textbaseline middle font " + h + "px~'" + fname + "' fs " + color + " ss white")
		UFX.draw("[ alpha", alpha, "t", sx/2, sy/2) //, "shc #666 shxy", h/20, h/20)
		wordwrap(this.lines[0], sx * 0.8).forEach(function (line, j, lines) {
			UFX.draw("[ t 0", 1.2 * h * (j - (lines.length - 1) / 2))
			context.fillText(line, 0, 0)
			UFX.draw("]")
		})
		UFX.draw("]")
		UFX.draw("[ alpha 0.5 fs black f0 ]")
	},
}

UFX.scenes.play = {
	start: function () {
		world.init()
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.pressed]
	},
	think: function (dt, keys) {
		dt *= 0.6
		world.think(dt, keys)
	},
	draw: function () {
		UFX.draw("fs black f0")
		world.drawstars()
		UFX.draw("[ t", sx/2, sy/2, "z", world.R, world.R)
		UFX.draw("[ r", world.theta)
		terrain.draw()
		UFX.draw("]")
		world.draw()
		UFX.draw("]")
		var h = Math.round(sy / 14)
		UFX.draw("[ font " + h + "px~bold~'Aclonica' textalign right textbaseline bottom",
			"t", sx - h/4, sy - h/4, "sh #006", h/10, h/10, 0, "fs white")
		var p = world.totalpop()
		var s = (p >= 1000 ? (p / 1000).toFixed(3).replace(/\./, ",") : p) + "~million"
		UFX.draw("ft world~population:", 0, -1.2*h)
		UFX.draw("ft", s, "0 0 ]")

		var w = h * 6, x0 = h * 0.3, y0 = sy - h * 1.3
		UFX.draw("fs yellow fr", x0, y0, w * world.laserlock, h)
		UFX.draw("lw", h/12, "ss yellow sr", x0, y0, w, h)
		UFX.draw("font " + 0.7*h + "px~bold~'Anton' textalign center textbaseline middle fs red ss black")
		UFX.draw("st LASER", x0 + w / 2, y0 + h / 2)
		UFX.draw("ft LASER", x0 + w / 2, y0 + h / 2)

		if (world.ending) {
			UFX.draw("[ alpha", 1 - world.ending, "fs black f0 ]")
		}

	},
}

