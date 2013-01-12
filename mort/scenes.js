function showfps() {
    if (!settings.showfps) return
    var s = UFX.ticker.getfpsstr()
    UFX.draw("[ t 790 10 textalign right textbaseline top fs white ss black")
    context.font = "bold 44px monospace"
    context.fillText(s, 0, 0)
    context.strokeText(s, 0, 0)
    UFX.draw("]")
}

var keystatus = {
	init: function () {
		var klist = this.klist = {}
		UFX.key.watchlist.forEach(function (kname) {
			klist[kname] = 100
		})
	},
	think: function (dt, kdown) {
		for (var k in this.klist) {
			this.klist[k] = kdown[k] ? 0 : this.klist[k] + dt
		}
	},
	draw: function () {
		if (!settings.showkeys) return
		var klist = this.klist
		UFX.draw("[ textalign center textbaseline bottom t 50", settings.sy - 10, "z 2 2 fs white ss black font bold~24px~'Contrail~One'")
		UFX.key.watchlist.forEach(function (kname) {
			UFX.draw("[ alpha", 0.2 + 0.8 * Math.exp(-8 * klist[kname]), "fst0", kname, "] t 50 0")
		})
		UFX.draw("]")
	},
}

UFX.scenes.load = {
	start: function () {
		this.f = 0
		keystatus.init()
	},
	draw: function () {
		UFX.draw("fs black f0 fs rgb(200,0,200) ss black textalign center textbaseline middle",
			"font 80px~'Contrail~One'~sans-serif fst Loading~(" + Math.floor(this.f*100) + "%)...",
			settings.sx/2, settings.sy/2)
		showfps()
	},
	onloading: function (f) {
	    this.f = f
	}
}

UFX.scenes.title = {
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.down]
	},
	think: function (dt, kdown) {
		dt = dt || 0 ; kdown = kdown || {}
		keystatus.think(dt, kdown)
		if (kdown.act) this.complete()
	},
	draw: function () {
		var grad0 = UFX.draw.lingrad(0, 0, 0, -30, 0, "red", 1, "rgb(255,100,100)")
		var grad1 = UFX.draw.lingrad(0, 0, 0, -80, 0, "red", 1, "rgb(255,100,100)")
		var grad2 = UFX.draw.lingrad(0, 0, 0, -20, 0, "red", 1, "rgb(255,100,100)")
		var grad3 = UFX.draw.lingrad(0, 0, 0, -40, 0, "blue", 1, "rgb(200,200,255)")
		UFX.draw("fs black f0 [ textbaseline bottom textalign center",
			"fs", grad0, "ss white",
			"t", settings.sx/2, settings.sy*0.3,
				"[ shadowcolor yellow shadowxy 1 1 font bold~40px~'Marcellus~SC' ft0 Mortimer~the ]",
			"fs", grad1, "ss white",
			"t 0 110",
				"[ shadowcolor yellow shadowxy 2 2 font 120px~'Marcellus~SC' ft0 Lepidopterist ]",
			"fs", grad2, "t 0 10 font 22px~'Marko~One' lw 0.5 ft0 PyWeek~edition",
			"[ t 250 40 fs grey font 26px~'Contrail~One' ft0 by~Christopher~Night",
			"t 0 30 ft0 Universe~Factory~games ]",
			"t 0 140 fs", grad3, "font 40px~'Bangers' ft0 press~space~or~enter",
		"]")
		showfps()
		keystatus.draw()
	},
	complete: function () {
		UFX.scene.swap(record.unlocked > 1 ? "map" : "cutscene")
	},
}

UFX.scenes.map = {
	start: function () {
		if (settings.unlockall) record.unlocked = settings.nlevels
		gamestate.level = clip(gamestate.level, 1, record.unlocked)
		MapHUD.init()
		this.udseq = []
		playmusic("girl")
		pushrecording("map")
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.down]
	},
	think: function (dt, kdown) {
		dt = dt || 0 ; kdown = kdown || {}
		keystatus.think(dt, kdown)
		var dx = (kdown.right ? 1 : 0) - (kdown.left ? 1 : 0)
		if (dx) {
			gamestate.level = clip(gamestate.level + dx, 1, record.unlocked)
			this.udseq = []
		}
		if (kdown.up) this.udseq.push(0)
		if (kdown.down) this.udseq.push(1)
		if (this.udseq.length >= 8) {  // cheatz!
			var s = JSON.stringify(this.udseq)
			if (s == "[0,0,1,1,0,0,1,1]" && !settings.easy) {
				settings.easy = true
				MapHUD.addeasymode()
			}
			this.udseq = this.udseq.slice(0, 7)
		}

		if (kdown.act) UFX.scene.swap("cutscene")
		MapHUD.think(dt)
	},
	draw: function () {
		MapHUD.draw()
		showfps()
		keystatus.draw()
	},
}

UFX.scenes.cutscene = {
	start: function () {
		if (record.seenscenes[gamestate.level]) {  // Have we already seen this cutscene?
			if (gamestate.level <= settings.nlevels && !settings.alwaysshow) {
				this.complete()
			}
		}
		record.seenscenes[gamestate.level] = true
		this.dq = getdialogue(gamestate.level)
		this.drawtext(this.dq[0])
		this.atick = 0  // time since automatically advancing
		playmusic(settings.levelmusic[gamestate.level - 1])
		pushrecording("cut")
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.down]
	},
	think: function (dt, kdown) {
		dt = dt || 0 ; kdown = kdown || {}
		keystatus.think(dt, kdown)
		this.dtick += dt
		this.atick += dt
		if (((kdown.act || kdown.tab) && this.atick > 0.4) || (this.dtick > this.dtime)) {
			if (this.dtick > this.dtime) this.atick = 0
			this.dq.splice(0, 1)
			if (this.dq.length) {
				this.drawtext(this.dq[0])
			} else {
				this.complete()
			}
		}
		if (kdown.esc) {
			this.complete()
		}
		if (this.dq[0]) {
			var who = this.dq[0][0]
			for (var j = 0 ; j < 400 ; ++j) {
				if (UFX.random() < dt) {
					this.drawline(UFX.random.rand(40, 240), who)
				}
			}
		}
	},
	complete: function () {
		UFX.scene.swap("tip")
	},
	drawtext: function (line) {
		this.backdrop = document.createElement("canvas")
		this.backdrop.width = settings.sx ; this.backdrop.height = settings.sy
		var con = this.context = this.backdrop.getContext("2d")
		var who = line[0], text = line[1]
		var color0, color1 = "black"
		if (who == "m") {
			color0 = "rgb(0,0,128)"
		} else if (who == "e") {
			color0 = "rgb(128,128,0)"
		} else if (who == "s") {
			color0 = "rgb(90,90,90)"
		} else if (who == "v") {
			color0 = "rgb(0,128,0)"
		}
		UFX.draw(this.context, "[ fs black f0 fs", UFX.draw.lingrad(0, 20, 0, -10, 0, color0, 1, color1),
			"ss white lw 1 textalign center textbaseline middle t", settings.sx / 2, settings.sy * 0.5 + 84)
		this.context.font = "38px 'Marko One'"
		var texts = wordwrap(text, 760, this.context)
		texts.forEach(function (text, j) {
			con.fillText(text, 0, 0)
			con.strokeText(text, 0, 0)
			con.translate(0, 42)
		})
		UFX.draw(this.context, "]")
		for (var y = 40 ; y < 240 ; ++y) this.drawline(y, who)
		this.dtime = settings.dialoguetime(text)
		this.dtick = 0
	},
	drawline: function (y, who) {
		var r = UFX.random.rand(144)
		switch (who) {
			case "m":
				var r = UFX.random.rand(144)
				var color = "rgb(" + r + "," + r + ",144)"
				break
			case "e":
				var r = UFX.random.rand(64)
				var color = "rgb(" + (192-r) + "," + (192-2*r) + ",0)"
				break
			case "s":
				var r = UFX.random.rand(64,192)
				var color = "rgb(" + r + "," + r + "," + r + ")"
				break
			case "v":
				var r = UFX.random.rand(64)
				var color = "rgb(" + r + "," + (128+r) + "," + r + ")"
				break
		}
		UFX.draw(this.context, "b m 0", y, "l", settings.sx, y, "ss", color, "lw 1 s")
	},
	draw: function () {
		if (!this.dq[0]) return
		UFX.draw("drawimage0", this.backdrop)
		drawframe("head" + this.dq[0][0])
		showfps()
		keystatus.draw()
	},
}

UFX.scenes.end = Object.create(UFX.scenes.cutscene)
UFX.scenes.end.start = function () {
	this.dq = getdialogue(7)
	this.drawtext(this.dq[0])
	playmusic(settings.levelmusic[5])
	pushrecording("end")
}
UFX.scenes.end.complete = function () {
	UFX.scene.swap("credits")
}

UFX.scenes.tip = {
	start: function () {
		this.tip = gettip()
		context.font = "58px 'Contrail One'"
		var texts = wordwrap(this.tip, 600, context)
		UFX.draw("fs black f0 fs", UFX.draw.lingrad(0, -32, 0, 32, 0, "black", 1, "rgb(0,100,0)"),
			"ss white [ t", settings.sx * 0.5, 100)
		texts.forEach(function (text, j) {
			context.fillText(text, 0, 0)
			context.strokeText(text, 0, 0)
			context.translate(0, 60)
		})
		UFX.draw("]")
		playmusic(settings.levelmusic[gamestate.level - 1])
		this.dtime = settings.dialoguetime(this.tip)
		this.dtick = 0
		this.vistadrawn = false
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.down]
	},
	think: function (dt, kdown) {
		dt = dt || 0 ; kdown = kdown || {}
		keystatus.think(dt, kdown)
		this.dtick += dt
		if (kdown.act || kdown.esc || kdown.tab || this.dtick > this.dtime) {
			UFX.scene.swap("action")
		}
		if (!this.vistadrawn) {
			vista.levelinit()
			this.vistadrawn = true
		}
	},
	draw: function () {
		showfps()
		keystatus.draw()
	},
}

UFX.scenes.action = {
	startargs: function () {
		return [UFX.random.setseed()]
	},
	start: function (seed) {
		UFX.random.setseed(seed)
		gamestate.startlevel()
		You.reset()
		vista.snapto(You.lookingat())
		ActionHUD.levelinit()
		playmusic(settings.levelmusic[gamestate.level - 1])
		UFX.key.clearcombos(true)
		pushrecording("action")
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.down, kstate.pressed, kstate.combo]
	},
	think: function (dt, kdown, kpressed, kcombo) {
		dt = dt || 0 ; kdown = kdown || {}
		kpressed = kpressed || {} ; kcombo = kcombo || {}
		keystatus.think(dt, kdown, kpressed, kcombo)
	
		if (kdown.esc) { UFX.scene.push("pause") ; return }
		if (kdown.tab) settings.hidefeatnames = !settings.hidefeatnames
		if (kdown.F12) window.open(canvas.toDataURL())
		// TODO: F for fullscreen?
	
		You.move(kdown, kpressed, kcombo)
		You.think(dt)

		vista.lookat(You.lookingat())
		vista.think(dt)
	
		gamestate.think(dt)
		WorldEffects.think(dt)
		ActionHUD.think(dt)
	
		if (gamestate.endingproclaimed && ActionHUD.proclamationscomplete()) {
			this.complete()
		}
	},
	complete: function () {
		gamestate.combinemoney()
		gamestate.save()
		UFX.scene.swap(gamestate.level == 7 ? "end" : "shop")
	},
	draw: function () {
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		UFX.draw("[")
		vista.draw()
		draw(You)
		gamestate.butterflies.forEach(draw)
		draw(WorldEffects)
		UFX.draw("]")
		draw(ActionHUD)
		showfps()
		keystatus.draw()
	},
}

UFX.scenes.pause = {
	start: function () {
		this.effect = new PauseEffect()
		this.img0 = document.createElement("canvas")
		this.img0.width = canvas.width ; this.img0.height = canvas.height
		var con = this.img0.getContext("2d")
		UFX.draw(con, "drawimage0", canvas, "alpha 0.8 fs black f0")
		if (musicplaying) musicplaying.pause()
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.down]
	},
	think: function (dt, kdown) {
		dt = dt || 0 ; kdown = kdown || {}
		keystatus.think(dt, kdown)
		if (kdown.esc) UFX.scene.pop()
		if (kdown.act) {
			gamestate.proclaimcounts()
			UFX.scene.pop()
			UFX.scenes.action.complete()
		}
		this.effect.think(dt)
	},
	draw: function () {
		UFX.draw("drawimage0", this.img0, "[")
		this.effect.draw()
		UFX.draw("]")
		UFX.draw("[ t", settings.sx / 2, settings.sy / 2 + 140, "textalign center textbaseline middle",
			"fs", UFX.draw.lingrad(0, 30, 0, -30, 0, "black", 1, "darkgrey"), "ss white lw 1")
		context.font = "50px 'Contrail One'"
		context.fillText("Esc: resume    Space: exit level", 0, 0)
		context.strokeText("Esc: resume    Space: exit level", 0, 0)
		UFX.draw("]")
		showfps()
		keystatus.draw()
	},
	stop: function () {
		if (musicplaying) musicplaying.play()
	},
}

UFX.scenes.shop = {
	start: function () {
		ShopHUD.init()
		playmusic("girl")
		pushrecording("shop")
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.down]
	},
	think: function (dt, kdown) {
		dt = dt || 0 ; kdown = kdown || {}
		keystatus.think(dt, kdown)
		if (kdown.up) ShopHUD.index = ShopHUD.index ? ShopHUD.index - 1 : ShopHUD.imax
		if (kdown.down) ShopHUD.index = ShopHUD.index < ShopHUD.imax ? ShopHUD.index + 1 : 0
		if (kdown.act || kdown.tab) {
		    if (ShopHUD.index == 0) {
		        this.complete()
		    } else {
				var fname = mechanics.featnames[ShopHUD.index-1]
				var n = record.knownfeats[fname], costs = mechanics.feat[fname].ucost
				if (n > costs.length || record.bank < costs[n-1]) {
				} else {
				    record.bank -= costs[n-1]
					gamestate.bars[fname] = ++record.knownfeats[fname]
				}
			}
			gamestate.save()
		}
		if (kdown.esc) {
			this.complete()
		}
		ShopHUD.think(dt)
	},
	complete: function () {
		UFX.scene.swap("map")
	},
	draw: function () {
		ShopHUD.draw()
		showfps()
		keystatus.draw()
	},
}

UFX.scenes.credits = {
	start: function () {
		playmusic("girl")
		UFX.resource.sounds.girl.currentTime = 4
		UFX.resource.sounds.girl.loop = false
	//	UFX.resource.sounds.girl.play()
		this.t = 0
		UFX.resource.sounds.girl.volume = 0
		UFX.resource.sounds.xylo.volume = musicvolume
		UFX.resource.sounds.xylo.play()

		this.img0 = document.createElement("canvas")
		this.img0.width = canvas.width ; this.img0.height = canvas.height
		var con = this.img0.getContext("2d")
		UFX.draw(con, "drawimage0", canvas)
	},
	think: function (dt) {
		this.t += dt
	},
	draw: function () {
		UFX.draw("fs black f0 [ textbaseline bottom textalign center ss white")
		if (this.t < 4) {
			var f = clip((this.t - 1) / 2.0, 0, 1)
			UFX.resource.sounds.xylo.volume = (1 - f) * musicvolume
			UFX.resource.sounds.girl.volume = f * musicvolume
			f = clip(this.t * 0.5, 0, 1)
			UFX.draw("drawimage0", this.img0, "fs black alpha", f, "f0")
		} else if (this.t < 7 || this.t >= 19) {
			var grad0 = UFX.draw.lingrad(0, 0, 0, -30, 0, "red", 1, "rgb(255,100,100)")
			var grad1 = UFX.draw.lingrad(0, 0, 0, -80, 0, "red", 1, "rgb(255,100,100)")
			var grad2 = UFX.draw.lingrad(0, 0, 0, -20, 0, "red", 1, "rgb(255,100,100)")
			UFX.draw(
				"fs", grad0, "t", settings.sx/2, settings.sy*0.4,
					"[ shadowcolor yellow shadowxy 1 1 font bold~40px~'Marcellus~SC' ft0 Mortimer~the ]",
				"fs", grad1, "t 0 110",
					"[ shadowcolor yellow shadowxy 2 2 font 120px~'Marcellus~SC' ft0 Lepidopterist ]",
				"fs", grad2, "t 0 10 font 22px~'Marko~One' lw 0.5 ft0 PyWeek~version"
			)
			if (this.t >= 19) {
				var t = 0
				for (var level in record.hiscore) t += record.hiscore[level]
				UFX.draw(
					"fs white t 0 60 font 17px~Rosarivo ft0 High~score~total:~\u00A3" + t
				)
			
			}
		} else if (this.t < 11) {
			var grad0 = UFX.draw.lingrad(0, 0, 0, -48, 0, "lightgray", 1, "gray")
			UFX.draw(
				"fs", grad0, "font 48px~'Contrail~One' t", settings.sx/2, settings.sy*0.5, "fst0 by~Christopher~Night",
				"t 0 64 fst0 Universe~Factory~games"
			)
		} else {
			var s
			if (this.t < 13) {
				s = "Gnosseinne 1 by Erik Satie, arranged by Chad Crouch"
			} else if (this.t < 15) {
				s = "The Annual New England Xylophone Symposium by DoKashiteru"
			} else if (this.t < 17) {
				s = "Another Girl (Instrumental) by duckett"
			} else {
				s = "One Five Nine (SR Mix) by IamTheStev"
			}
			var grad0 = UFX.draw.lingrad(0, 0, 0, -48, 0, "lightblue", 1, "blue")
			UFX.draw(
				"fs", grad0, "font 48px~'Contrail~One'",
				"t", settings.sx/2, settings.sy*0.38, "fst0 Music~credits",
				"t 0 90"
			)
			wordwrap(s, 550).forEach(function (text) {
				context.fillText(text, 0, 0)
				context.strokeText(text, 0, 0)
				context.translate(0, 48)
			})
		}
		UFX.draw("]")
		showfps()
	},
}



