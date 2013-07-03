
function overlay(amount, color) {
	if (amount <= 0) return
	amount = clip(amount, 0, 1)
	color = color || "white"
	UFX.draw("[ alpha", amount, "fs", color, "f0 ]")
}


UFX.scenes.menu = {
	start: function () {
		this.t = 0
		var levels = getlevels()
		var buttons = this.buttons = []
		levels.forEach(function (level, j) {
			var label = level[0], levelname = level[1]
			buttons.push({
				x: canvas.width * 0.5 - 200 + 240 * Math.floor(j / 6),
				y: 160 + 60 * (j % 6),
				w: 160,
				h: 45,
				text: label,
				levelname: levelname,
			})
		})
		
	},
	thinkargs: function (dt) {
		var mstate = UFX.mouse.active && UFX.mouse.state()
		return [dt, mstate]
	},
	think: function (dt, mstate) {
		this.t += dt
		if (mstate && mstate.left.down) {
			var x = mstate.pos[0], y = mstate.pos[1]
			this.buttons.forEach(function (button) {
				if (x < button.x || x > button.x + button.w) return
				if (y < button.y || y > button.y + button.h) return
				UFX.scene.swap("transin", button.levelname)
			})
		}
	},
	draw: function () {
		UFX.draw("fs black f0 textalign center textbaseline middle",
			"[ t", canvas.width/2, "50 font 64px~'Trade~Winds' fs white ft0 Nightfall ]",
			"[ t", canvas.width/2, "100 font 22px~'Trade~Winds' fs gray ft0 by~Christopher~Night ]",
			"font 32px~'Trade~Winds'"
		)
		this.buttons.forEach(function (button) {
			var rect = [button.x, button.y, button.w, button.h]
			var color = beaten[button.levelname] ? "#040" : "#400"
			UFX.draw("[",
				"fs", color, "ss white lw 3 fr", rect, "sr", rect,
				"t", button.x + 0.5 * button.w, button.y + 0.5 * button.h + 1,
				"fs white ss black lw 1 st0", button.text, "ft0", button.text,
			"]")
		})
		overlay((0.5 - this.t) / 0.5)
	},
}


UFX.scenes.transin = {
	start: function (levelname) {
		this.levelname = levelname
		this.t = 0
		this.back = screengrab()
	},
	think: function (dt) {
		this.t += dt
		if (this.t > 0.5) UFX.scene.swap("action", this.levelname)
	},
	draw: function () {
		this.back.draw()
		var x0 = 0.5 * canvas.width, y0 = 0.5 * canvas.height
		var g = UFX.draw.radgrad(x0, y0, 0, x0, y0, this.t * 1600,
			0, "white", 0.5, "white", 1, "rgba(255,255,255,0)"
		)
		UFX.draw("fs", g, "f0")
	},
}

UFX.scenes.transout = {
	addstars: function () {
		var w = this.stars.width, h = this.stars.height
		var x = UFX.random.rand(w), y = UFX.random.rand(h)
		UFX.draw(this.starcon2, "c0")
		this.starcon2.drawImage(this.stars, x, y)
		this.starcon2.drawImage(this.stars, x-w, y)
		this.starcon2.drawImage(this.stars, x, y-h)
		this.starcon2.drawImage(this.stars, x-w, y-h)
		this.starcon.drawImage(this.stars2, 0, 0)
	},
	start: function () {
		this.t = 0
		this.st = 0
		this.back = screengrab()
		this.stars = document.createElement("canvas")
		this.stars.width = canvas.width
		this.stars.height = canvas.height
		this.starcon = this.stars.getContext("2d")
		this.stars2 = document.createElement("canvas")
		this.stars2.width = canvas.width
		this.stars2.height = canvas.height
		this.starcon2 = this.stars2.getContext("2d")
		for (var j = 0 ; j < 10 ; ++j) {
			var x = UFX.random.rand(this.stars.width), y = UFX.random.rand(this.stars.height)
			UFX.draw(this.starcon, "fs white fr", x, y, 2, 2)
		}
	},
	think: function (dt) {
		this.t += dt
		if (this.t > 4) UFX.scene.swap("menu")
		if (this.t > 1.8) {
			this.st += dt
			while (this.st > 0.1) {
				this.addstars()
				this.st -= 0.1
			}
		}
	},
	draw: function () {
		if (this.t < 1.8) {
			this.back.draw()
			overlay(this.t / 1.3, "black")
		} else {
			context.drawImage(this.stars, 0, 0)
		}
	},
}




UFX.scenes.action = {
	start: function (levelname) {
		camera.init()
		this.levelname = levelname
		loadlevel(levelname)
		this.selected = null
		this.t = 0
	},
	
	thinkargs: function (dt) {
		var clicked = false
		var mstate = UFX.mouse.active && UFX.mouse.state()
		return [dt, mstate]
	},
	think: function (dt, mstate) {
		this.t += dt

		if (mstate && mstate.pos) {
			var mx = mstate.pos[0] - 0.5 * canvas.width
			var my = mstate.pos[1] - 0.5 * canvas.height
			if (mstate.left.down) {
				if (mstate.pos[0] < 60 && mstate.pos[1] < 30) {
					UFX.scene.swap("menu")
					return
				}
				var selected = camera
				suns.concat(moons).forEach(function (obj) {
					var p = camera.worldtoscreen([obj.x, obj.y])
					var dx = mx - p[0], dy = my - p[1]
					if (dx * dx + dy * dy < settings.clickr * settings.clickr) {
						selected = obj
					}
				})
				this.selected = selected
				console.log(selected)
			}
			if (mstate.left.up) {
				this.selected = null
			}
			
			if (this.selected && mstate.left.drag) {
				if (this.selected === camera) {
					camera.pan(mstate.left.drag.dx, mstate.left.drag.dy)
				} else {
					var p = camera.screentoworld([mx, my])
					var dx = p[0] - this.selected.wheel.x, dy = p[1] - this.selected.wheel.y
					this.selected.wheel.A0 = Math.atan2(dx, -dy) - this.selected.A
				}
			}
		}


		function think(obj) { obj.think(dt) }
		planets.forEach(think)
		moons.forEach(think)
		suns.forEach(think)
		
		planets.forEach(function (planet) { planet.stowers() })
		
		if (planets.every(function (planet) { return planet.shaded() })) {
			beaten[this.levelname] = true
			savegame()
			UFX.scene.swap("transout")
		}
	},
	
	draw: function () {
		UFX.draw("alpha 1 fs black f0")
		
		context.save()
		context.translate(0.5 * canvas.width, 0.5 * canvas.height)
		camera.draw()
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		wheels.forEach(draw)
		moons.forEach(draw)
		planets.forEach(draw)
		suns.forEach(function (sun) { sun.drawshade() })
		suns.forEach(draw)
		context.restore()
		UFX.draw("fs white font 22px~Viga ft back 30 15")
		overlay((0.5 - this.t) / 0.5)
	},

}



