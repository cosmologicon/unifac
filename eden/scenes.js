var LoadScene = {
	start: function () {
		this.f = 0
	},
	draw: function () {
		var s = "Loading....~(" + Math.floor(this.f*100) + "%)"
		UFX.draw("fs darkblue f0 font 80px~Viga fs white ss black textalign center textbaseline middle",
			"[ t", settings.sx/2, settings.sy/2, "fst0", s, "]")
	},
}

var BeginScene = {
	start: function () {
		UFX.touch.active = false
		canvas.onmousedown = function () {
			if (UFX.touch.active) return
			UFX.mouse.init(canvas)
			UFX.scene.swap(IntroScene)
		}
		canvas.ontouchstart = function () {
			UFX.touch.active = true
			UFX.touch.init(canvas)
			UFX.mouse.active = false
			UFX.maximize.fill(canvas)
			UFX.scene.swap(IntroScene)
			settings.allowzoom = false
			settings.tradius = settings.touchtradius
		}
	},
	draw: function () {
		UFX.draw("fs", UFX.draw.lingrad(0, 0, settings.sx, settings.sy, 0, "gray", 1, "black"), "f0")
		UFX.draw("[ textalign center textbaseline middle t", settings.sx/2,
			"100 font 68px~Eater fs red sh black 2 2 0 ft0 The~Devil's~Handiwork ]")
		UFX.draw("[ textalign center textbaseline middle t 740 180 font italic~22px~'Viga' fs lightgray sh black 1 1 0 ft0 by~Christopher~Night ]")
		UFX.draw("[ textalign center textbaseline middle t 740 205 font italic~22px~'Viga' fs lightgray sh black 1 1 0 ft0 Universe~Factory~games ]")
		var s = "Click~or~tap~to~begin"
		UFX.draw("[ font 80px~Viga fs white sh black 3 3 0 textalign center textbaseline middle",
			"[ t", settings.sx/2, settings.sy*0.7, "ft0", s, "] ]")
	},
}


var IntroScene = {
	start: function () {
		this.j = 0
		this.fadetimer = 0
		playmusic("tofuslow")
		if (gamestate.seen.intro) this.complete()
		gamestate.seen.intro = true
		gamestate.save()
	},
	thinkargs: function (dt) {
		var mstate = UFX.mouse.active ? UFX.mouse.state() : null
		var tstate = UFX.touch.active ? UFX.touch.state() : null
		var kstate = UFX.key.active ? UFX.key.state() : null
		return [dt, mstate, tstate, kstate]
	},
	think: function (dt, mstate, tstate, kstate) {
		var next = ((kstate && (kstate.down.space || kstate.down.enter || kstate.downtab)) ||
		            (mstate && mstate.left.down) ||
		            (tstate && tstate.start.length))
		if (next) {
			this.j += 1
			this.fadetimer = 0
			if (this.j >= dialogue.intro.length) {
				this.complete()
			}
		}
		if (kstate && kstate.down.esc) {
			this.complete()
		}
		this.fadetimer += dt
	},
	draw: function () {
		var t = dialogue.intro[this.j]
		if (!t) return
		UFX.draw("fs white f0 textalign center textbaseline middle",
			"fs black font 70px~'Almendra~SC' [ t", settings.sx / 2, 100)
		wordwrap(t, 640).forEach(function (text) {
			context.fillText(text, 0, 0)
			context.translate(0, 80)
		})
		UFX.draw("]")
		UFX.draw("[ alpha", clip(1-2*this.fadetimer, 0, 1), "fs white f0 ]")
	},
	complete: function () {
		UFX.scene.swap(MenuScene)
	},
}

var MenuScene = {
	start: function () {
		this.fadetimer = 0
		MenuHUD.init()
		playmusic("tofuslow")
	},
	thinkargs: function (dt) {
		var mstate = UFX.mouse.active ? UFX.mouse.state() : null
		var tstate = UFX.touch.active ? UFX.touch.state() : null
		var kstate = UFX.key.active ? UFX.key.state() : null
		return [dt, mstate, tstate, kstate]
	},
	think: function (dt, mstate, tstate, kstate) {
		MenuHUD.think(dt, (mstate ? mstate.pos : null))
		this.fadetimer += dt
		if (mstate && mstate.left.down) {
			if (MenuHUD.handleclick()) {
				UFX.scene.swap(DialogueScene)
			}
		}
		if (tstate && tstate.tap.length) {
			if (MenuHUD.handleclick(tstate.tap[0].pos)) {
				UFX.scene.swap(DialogueScene)
			}
		}
	},
	draw: function () {
		UFX.draw("fs", UFX.draw.lingrad(0, 0, settings.sx, settings.sy, 0, "gray", 1, "black"), "f0")
		UFX.draw("[ textalign center textbaseline middle t", settings.sx/2,
			"100 font 68px~Eater fs red shadowxy 2 2 shadowcolor black ft0 The~Devil's~Handiwork ]")
		UFX.draw("[ textalign center textbaseline middle t 740 180 font italic~22px~'Viga' fs lightgray shadowxy 1 1 shadowcolor black ft0 by~Christopher~Night ]")
		UFX.draw("[ textalign center textbaseline middle t 740 205 font italic~22px~'Viga' fs lightgray shadowxy 1 1 shadowcolor black ft0 Universe~Factory~games ]")
		MenuHUD.draw()
		UFX.draw("[ alpha", clip(1-2*this.fadetimer, 0, 1), "fs white f0 ]")
	},
}

var DialogueScene = {
	start: function () {
		this.completed = false
		this.j = 0
		this.lines = dialogue[gamestate.stage] || []
		this.fadetimer = 0
		playmusic("tofuslow")
		if (gamestate.seen[gamestate.stage]) {
			this.complete()
			return
		}
		if (gamestate.stage != 666) {
			gamestate.seen[gamestate.stage] = true
		}
		gamestate.save()
		if (!this.lines.length) this.complete()
	},
	thinkargs: function (dt) {
		var mstate = UFX.mouse.active ? UFX.mouse.state() : null
		var tstate = UFX.touch.active ? UFX.touch.state() : null
		var kstate = UFX.key.active ? UFX.key.state() : null
		return [dt, mstate, tstate, kstate]
	},
	think: function (dt, mstate, tstate, kstate) {
		if (this.completed) return
		var next = ((kstate && (kstate.down.space || kstate.down.enter || kstate.down.tab)) ||
		            (mstate && mstate.left.down) ||
		            (tstate && tstate.start.length))
		if (next) {
			this.j += 1
			// Don't show mouse-only tips for touch interface and vice versa
			if (UFX.mouse.active) {
				while (this.j < this.lines.length && this.lines[this.j][0] == "t") this.j += 1
			} else {
				while (this.j < this.lines.length && this.lines[this.j][0] == "i") this.j += 1
			}			
			this.fadetimer = 0
			if (this.j == this.lines.length) {
				this.complete()
			}
		}
		if (kstate && kstate.down.esc) {
			this.complete()
		}
		this.fadetimer += dt
	},
	draw: function () {
		if (this.completed) return
		var t = this.lines[this.j]
		if (!t) return
		if (t[0] == "g") {
			UFX.draw("fs", UFX.draw.radgrad(200, 200, 0, 200, 200, 400, 0, "yellow", 1, "white"),
				"f0 textalign center textbaseline middle",
				"fs black font 70px~'Germania~One' [ t", settings.sx / 2, 360)
		} else if (t[0] == "d") {
			UFX.draw("fs", UFX.draw.radgrad(760, 200, 0, 760, 200, 400, 0, "darkgreen", 1, "black"),
				"f0 textalign center textbaseline middle",
				"fs red font 70px~'Jolly~Lodger' [ t", settings.sx / 2, 400)
		} else if (t[0] == "i" || t[0] == "t") {
			UFX.draw("fs", UFX.draw.lingrad(0, 0, settings.sx, settings.sy, 0, "rgb(0,0,60)", 1, "black"),
				"f0 textalign center textbaseline middle",
				"fs white font 70px~'Viga' [ t", settings.sx / 2, 240)
		}

		wordwrap(t.substr(2), 900).forEach(function (text) {
			context.fillText(text, 0, 0)
			context.translate(0, 70)
		})
		UFX.draw("]")
		UFX.draw("[ alpha", clip(1-2*this.fadetimer, 0, 1), "fs white f0 ]")
	},
	complete: function () {
		this.completed = true
		if (gamestate.stage == 666) {
			UFX.scene.swap(MenuScene)
			return
		}
		var s = "Loading~stage...."
		UFX.draw("fs darkblue f0 font 80px~Viga fs white ss black textalign center textbaseline middle",
			"[ t", settings.sx/2, settings.sy/2, "fst0", s, "]")
		setTimeout(function () {
			UFX.scene.swap(ActionScene)
			gamestate.loadstage()
			vista.init()
			HUD.init()
		}, 10)
	},
}

var ActionScene = {
	start: function () {
		this.endtime = 0
		playmusic("ninja")
	},
	thinkargs: function (dt) {
		var mstate = UFX.mouse.active ? UFX.mouse.state() : null
		var tstate = UFX.touch.active ? UFX.touch.state() : null
		var kstate = UFX.key.active ? UFX.key.state() : null
		return [dt, mstate, tstate, kstate]
	},
	think: function (dt, mstate, tstate, kstate) {
		dt = dt || 0
		
		if (kstate) {
			if (kstate.down.esc) this.incomplete()
			var kpress = kstate.pressed
			var dx = (kpress.right ? 1 : 0) - (kpress.left ? 1 : 0)
			var dy = (kpress.down ? 1 : 0) - (kpress.up ? 1 : 0)
			if (dx || dy) vista.scootch(dx * dt, dy * dt)
			for (var j = 0 ; j < settings.sins.length ; ++j) {
				if (kpress[j+1]) {
					HUD.selected = settings.sins[j]
				}
			}
		}
		if (mstate) {
			if (mstate.wheeldy) vista.zoom(mstate.wheeldy, mstate.pos)
			if (mstate.right.down) vista.pan(mstate.right.down)
		}
		if (tstate) {
			if (tstate.ids.length == 1) {
				vista.drag(tstate.deltas[tstate.ids[0]])
			} else if (tstate.ids.length == 2) {
				var t2state = UFX.touch.twotouchstate(tstate)
				if (t2state) {
					vista.zoom(Math.log(t2state.rratio) / settings.zfactor, t2state.center)
				}
			}
		}
		vista.think(dt)
		HUD.think(dt, mstate ? mstate.pos : null)

		
		function think(obj) { obj.think(dt) }
		blobs.forEach(think)
		scenery.forEach(think)
//		platforms.forEach(think)

		blobs.forEach(function (blob) {
			if (blob.state.dead) return
			scenery.forEach(function (obj) {
				if (obj.withinrange(blob)) {
					obj.interact(blob)
				}
			})
			if (blob.platform) return
			platforms.forEach(function (platform) {
				if (platform.catches(blob)) {
					if (platform.canhold(blob.x, blob.y)) {
						blob.land(platform)
					} else {
						blob.bounce(platform)
					}
				}
			})
		})

		if (mstate && mstate.left.down) HUD.handleclick()
		if (tstate) tstate.tap.forEach(function (tap) { HUD.handleclick(tap.pos) })

		this.endtime = gamestate.complete() ? this.endtime + dt : 0
		if (this.endtime > 1) this.complete()
		
//		var b = blobs[6]
//		console.log(b.x, b.y, b.vx, b.vy, platforms[3].isabove(b.x, b.y))
	},
	draw: function () {
//		UFX.draw("fs lightblue f0 font 18px~Viga fs white ft", UFX.ticker.getfpsstr(), "700 10 [")
		UFX.draw("[")
		vista.drawclouds()
		vista.draw()
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		scenery.forEach(draw)
//		platforms.forEach(draw)
		blobs.forEach(draw)
		UFX.draw("]")
		HUD.draw()
		HUD.drawcursor()
	},
	complete: function () {
		gamestate.completed[gamestate.stage] = true
		if (gamestate.stage < 6) {
			gamestate.unlocked[gamestate.stage + 1] = true
		}
		var t = Math.floor(HUD.elapsed)
		if (!gamestate.besttime[gamestate.stage] || gamestate.besttime[gamestate.stage] > t) {
			gamestate.besttime[gamestate.stage] = Math.floor(HUD.elapsed)
		}
		gamestate.save()
		if (gamestate.stage == 6) {
			gamestate.stage = 666
			UFX.scene.swap(DialogueScene)
		} else {
			UFX.scene.swap(MenuScene)
		}
		playsound("complete")
	},
	incomplete: function () {
		UFX.scene.swap(MenuScene)
	},
}


