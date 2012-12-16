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

var IntroScene = {
	start: function () {
		this.j = 0
		this.fadetimer = 0
		playmusic("tofuslow")
	},
	thinkargs: function (dt) {
		return [dt, UFX.mouse.state(), UFX.key.state()]
	},
	think: function (dt, mstate, kstate) {
		var kdown = kstate.down
		if (kdown.space || kstate.enter || kstate.tab || mstate.left.down) {
			this.j += 1
			this.fadetimer = 0
			if (this.j >= dialogue.intro.length) {
				UFX.scene.swap(DialogueScene)
			}
		}
		if (kdown.esc) {
			UFX.scene.swap(DialogueScene)
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
	
}

var MenuScene = {
	
}

var DialogueScene = {
	start: function () {
		this.j = 0
		this.lines = dialogue[gamestate.stage]
		this.fadetimer = 0
		playmusic("tofuslow")
	},
	thinkargs: function (dt) {
		return [dt, UFX.mouse.state(), UFX.key.state()]
	},
	think: function (dt, mstate, kstate) {
		var kdown = kstate.down
		if (kdown.space || kstate.enter || kstate.tab || mstate.left.down) {
			this.j += 1
			this.fadetimer = 0
			if (this.j == this.lines.length) {
				this.complete()
			}
		}
		if (kdown.esc) {
			UFX.scene.swap(DialogueScene)
		}
		this.fadetimer += dt
	},
	draw: function () {
		var t = this.lines[this.j]
		if (!t) return
		if (t.substr(0, 1) == "g") {
			UFX.draw("fs white f0 textalign center textbaseline middle",
				"fs black font 70px~'Germania~One' [ t", settings.sx / 2, 400)
		} else if (t.substr(0, 1) == "d") {
			UFX.draw("fs black f0 textalign center textbaseline middle",
				"fs red font 70px~'Jolly~Lodger' [ t", settings.sx / 2, 400)
		}

		wordwrap(t.substr(2), 900).forEach(function (text) {
			context.fillText(text, 0, 0)
			context.translate(0, 80)
		})
		UFX.draw("]")
		UFX.draw("[ alpha", clip(1-2*this.fadetimer, 0, 1), "fs white f0 ]")
	},
	complete: function () {
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
	},
	thinkargs: function (dt) {
		var mstate = UFX.mouse.state()
		var kstate = UFX.key.state()
		return [dt, mstate, kstate]
	},
	think: function (dt, mstate, kstate) {
		dt = dt || 0
		
		var kpress = kstate.pressed
		var dx = (kpress.right ? 1 : 0) - (kpress.left ? 1 : 0)
		var dy = (kpress.down ? 1 : 0) - (kpress.up ? 1 : 0)
		if (dx || dy) vista.scootch(dx * dt, dy * dt)
		if (mstate.wheeldy) vista.zoom(mstate.wheeldy, mstate.pos)
		if (mstate.right.down) vista.pan(mstate.right.down)
		vista.think(dt)

		HUD.think(dt, mstate.pos)
		for (var j = 0 ; j < settings.sins.length ; ++j) {
			if (kpress[j+1]) {
				HUD.selected = settings.sins[j]
			}
		}
		
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
		if (mstate.left.down) HUD.handleclick()
		this.endtime = gamestate.complete() ? this.endtime + dt : 0
		if (this.endtime > 1) this.complete()
		
//		var b = blobs[6]
//		console.log(b.x, b.y, b.vx, b.vy, platforms[3].isabove(b.x, b.y))
	},
	draw: function () {
		UFX.draw("fs lightblue f0 font 18px~Viga fs white ft", UFX.ticker.getfpsstr(), "700 10 [")
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
		UFX.scene.swap(TitleScene)
		playsound("complete")
	},
}


