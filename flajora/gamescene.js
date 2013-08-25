

UFX.scenes.game = {
	start: function (scene) {		
		this.opentime = 0
		this.scene = scene
		if (!scene) {
			this.clock = 10
			this.quests = quests
			this.opentime = 2.5
			this.draw()  // so the opening is showing while we load
			this.gcolor = "#afc"
			playsound("hiss")
		} else if (scene === "lake") {
			this.quests = {
				lake: lakequest
			}
			this.gcolor = "#007"
		} else if (scene === "desert") {
			this.quests = {
				desert: desertquest
			}
			this.gcolor = "#ffa"
		} else if (scene === "tree") {
			this.quests = {
				tree: treequest
			}
			this.gcolor = "#6a6"
		} else if (scene === "ship") {
			this.quests = {
				ship: shipquest
			}
			this.gcolor = "#caf"
		}
		you = new You()
		backeffects = []  // stuff written on ground, etc.
		backscenery = []  // objects on ground, etc.
		people = []
		frontscenery = []  // trees, houses
		fronteffects = []  // speech bubbles, etc.
		hudeffects = []  // speech bubbles, etc.

		for (var q in this.quests) this.quests[q].init()

//		new Tree(15, -15, 2)
//		new House(-25, 25, 15, 10)

//		this.ground = UFX.texture.patchygrass({ size: 64 })
//		UFX.draw(this.ground.context, "fs rgba(255,255,255,0.6) f0")
		
		camera.think(0)
		this.nextscene = null
		this.toget = null
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate]
	},
	think: function (dt, kstate) {
		if (this.opentime > 0) {
			this.opentime -= dt
			if (this.opentime > 0) return
		}
		playmusic()
		
		var clockdt = dt / (settings.EASY || 1)
		
		if (this.nextscene) {
			if (this.fadetime == 0) playsound("teleport")
			this.fadetime += 2 * dt
			if (this.fadetime >= 1) {
				UFX.scene.swap("game", this.nextscene)
			}
		}
		if (this.toget) {
			if (!items[this.toget]) UFX.scene.push("get", this.toget)
			this.toget = null
		}

		if (this.nextscene) {
			you.vx = you.vy = 0
		} else {
			you.move(kstate.pressed)
		}

		this.runscripts()

		colliders = [you].concat(people, backscenery, frontscenery)
		function think(obj) { obj.think(dt) }
		think(you)
		people.forEach(think)
		fronteffects.forEach(think)
		hudeffects.forEach(think)
		for (var q in this.quests) {
			if (this.quests[q].think) this.quests[q].think(dt)
		}

		var d2max = mechanics.chatradius * mechanics.chatradius
		this.chatter = null  // closest person who can chat
		for (var j = 0 ; j < people.length ; ++j) {
			var who = people[j]
			var dx = who.x - you.x, dy = who.y - you.y, d2 = dx * dx + dy * dy
			if (d2 > d2max) continue
			if (!who.canchat || !who.canchat()) continue
			d2max = d2
			this.chatter = who
		}
		
		if (this.chatter && kstate.down.space) {
			UFX.scene.push("chat", this.chatter)
		} else if (items.kazoo && kstate.down.backspace) {
			stopmusic()
			UFX.scene.push("kazoo")
		} else if (kstate.down.esc) {
			stopmusic()
			UFX.scene.push("pause")
		}
		
		function isalive(obj) { return !obj.dead }
		fronteffects = fronteffects.filter(isalive)
		frontscenery = frontscenery.filter(isalive)
		hudeffects = hudeffects.filter(isalive)
		
		
		this.clock -= clockdt
		camera.think(dt)
		camera.x = you.x
		camera.y = you.y
		
		this.canwin = items.flask && you.x * you.x + you.y * you.y < 25 && this.clock < 5
		if (this.canwin && kstate.down.space) {
			stopmusic()
			UFX.scene.swap("win")
		}
		if (this.clock <= 0) {
			this.clock = 0
			stopmusic()
			UFX.scene.swap("die")
		}
		
	},
	draw: function () {
		if (this.opentime > 0) {
			UFX.draw("fs black f0")
			write("\n23:59:50 on\n\n\n\n- 10 seconds remain -", 0.5, 0.5, settings.tstyles.open)
			write("The Final Day", 0.5, 0.5, settings.tstyles.subopen)
			return
		}
		UFX.draw("fs", this.gcolor, "f0")
		UFX.draw("[")
		camera.draw()
		for (var x = Math.floor(camera.xmin/64) ; x*64 < camera.xmax ; ++x) {
			for (var y = Math.floor(camera.ymin/64) ; y*64 < camera.ymax ; ++y) {
				//UFX.draw("drawimage", this.ground, x*64, y*64)
			}
		}
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		backeffects.forEach(draw)
		backscenery.forEach(draw)
		if (!this.nextscene) draw(you)
		people.forEach(draw)

		frontscenery.forEach(draw)
		fronteffects.forEach(draw)
		UFX.draw("]")
		hudeffects.forEach(draw)
		UFX.draw("[ z", settings.sy/2000, settings.sy/2000)
		for (var j = 0 ; j < 10 ; ++j) {
			if (items[allitems[j]]) {
				UFX.draw("drawimage", UFX.resource.images[allitems[j]], 0, 200*j)
			}
		}
		UFX.draw("]")

		if (this.chatter || this.canwin) write("Space: talk", 0.5, 0.7, settings.tstyles.chattip)
		write(this.clock.toFixed(1), 0.5, 0.99, settings.tstyles.timer)
		var text = "Esc: pause" + (items.kazoo ? "\nBackspace: use kazoo" : "")
		write(text, 0.99, 1, settings.tstyles.gobacktip)
		if (this.nextscene) {
			UFX.draw("[ alpha", clip(this.fadetime, 0, 1), "fs white f0 ]")
		}
	},
	
	fadeto: function (nextscene) {
		if (this.nextscene) return
		this.nextscene = nextscene
		this.fadetime = 0
	},
	runscripts: function () {
	},
}


UFX.scenes.chat = {
	start: function (chatter) {
		this.chatter = chatter
		this.chatname = this.chatter.name
		this.text = chatter.chat()
		this.t = 0
		playsound("talk")
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		this.t += dt
		if (this.t > 0.4 && kstate.down.space) {
			UFX.scene.pop()
		}
	},
	draw: function () {
		UFX.scenes.game.draw()
		UFX.draw("fs rgba(0,0,0,0.7) f0 [")
		if (this.t < 0.15) UFX.draw("alpha", this.t / 0.15)
		if (this.chatname) {
			write(this.chatname, 0.5, 0.05, settings.tstyles.chat)
		}
		write(this.text, 0.5, 0.25, settings.tstyles.chat)
		UFX.draw("]")
	},
}

UFX.scenes.get = {
	start: function (thing) {
		this.thing = thing
		items[this.thing] = true
		this.t = 0
		playsound("get")
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		this.t += dt
		if (this.t > 0.4 && kstate.down.space) {
			UFX.scene.pop()
		}
		if (items.kazoo && kstate.down.backspace) {
			stopmusic()
			UFX.scene.swap("kazoo")
		}
	},
	draw: function () {
		UFX.scenes.game.draw()
		UFX.draw("fs rgba(0,0,0,0.7) f0 [")
		if (this.t < 0.15) UFX.draw("alpha", this.t / 0.15)
		write(itemnames[this.thing], 0.1, 0.1, settings.tstyles.itemname)
		write(iteminfo[this.thing], 0.5, 0.25, settings.tstyles.iteminfo)
		UFX.draw("[ t", settings.sx, 0, "z", settings.sx/1200, settings.sx/1200,
			"drawimage", UFX.resource.images[this.thing], -200, 0, "]")
		UFX.draw("]")
		if (items.kazoo) {
			write("Backspace: use kazoo", 0.99, 1, settings.tstyles.gobacktip)
		}
	},
}


UFX.scenes.kazoo = {
	start: function () {
		this.t = 0
		this.dots = UFX.random.spread(6)
		savegame()
		this.notet = 0.2
	},
	think: function (dt) {
		this.t += dt
		if (this.t > 1.2) {
			UFX.scene.pop()
			UFX.scene.swap("game")
		}
		this.notet += dt
		while (this.notet > 0.2) {
			playsound("note")
			this.notet -= 0.2
		}
	},
	draw: function () {
		UFX.scenes.game.draw()
		UFX.draw("fs rgba(255,255,255,0.7) f0")
		var sx = settings.sx, sy = settings.sy
		for (var y = 0.3 ; y < 0.55 ; y += 0.05) {
			UFX.draw("b m", sx*0.2, sy*y, "l", sx*0.8, sy*y, "lw 4 ss black s")
		}
		var r = sy / 50
		this.dots.forEach(function (dot) {
			UFX.draw("b o", sx * (0.2 + 0.6 * dot[0]), sy * (0.25 + 0.4 * dot[1]), r, "fs black f")
		})
		write("Let's    go    back    in    time!", 0.5, 0.7, settings.tstyles.backintime)
		UFX.draw("b o", sx * (this.t), sy * (0.66 - 0.1 * Math.abs(Math.sin(40*this.t))), r, "fs red f")
		write("Progress saved", 0.5, 0.9, settings.tstyles.saved)
	},
}


UFX.scenes.pause = {
	start: function () {
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (kstate.down.esc) {
			UFX.scene.pop()
			playmusic()
		}
	},
	draw: function () {
		UFX.scenes.game.draw()
		UFX.draw("fs rgba(0,0,0,0.7) f0")
		write("Esc: resume", 0.5, 0.7, settings.tstyles.chattip)
	},
}


UFX.scenes.die = {
	start: function () {
		this.t = 0
		this.stars = UFX.random.spread(100)
		playsound("die")
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		this.t += dt
		if (kstate.down.esc) UFX.scene.pop()
	},
	draw: function () {
		var sx = settings.sx, sy = settings.sy
		UFX.draw("fs #333 f0 fs white")
		this.stars.forEach(function (s) {
			UFX.draw("[ t", s[0] * sx, s[1] * sy, "b o 0 0 2 f ]")
		})
		UFX.draw("[ t", sx/2, sy*2/3+sx, "z", sx, sx, "b o 0 0 1 fs rg~-0.5~-0.5~0~0~0~1~0~blue~1~#005 f ]")
		var a = (this.t % 0.2) * 5
		UFX.draw("[ t", sx/2, sy*0.7, "z 3 1 b o 0 0", a*100, "alpha", 1-a, "fs red f ]")
		UFX.draw("[ b m", sx/2, sy/3, "l", sx/2, sy*0.7, "ss yellow lw", 40*this.t, "s",
			"alpha", UFX.random(), "ss white s", "alpha", UFX.random(), "ss red s",
		"]")
		var img = UFX.resource.images.ship
		UFX.draw("[ t", sx/2, sy/3, "t", 0, 0.05*sy*Math.sin(19*this.t), "r", 0.07 * Math.cos(19*this.t),
			"drawimage", img, -img.width/2, -img.height/2,
			"[ alpha", 0.6 + 0.4 * Math.sin(11*this.t), "b o 54 -13 18 fs yellow f ]",
			"[ alpha", 0.6 + 0.4 * Math.sin(11*this.t+2), "b o -54 -13 18 fs yellow f ]",
		"]")
		if (this.t > 1) {
			UFX.draw("[ alpha", clip((this.t - 1) * 2, 0, 1), "fs white f0 ]")
		}
		if (this.t > 1.5) {
			write("Flajora has destroyed the world.\n\nThe End", 0.5, 0.5, settings.tstyles.fail)
		}
		if (this.t > 3) {
			UFX.scene.pop()
		}
	},
}


UFX.scenes.win = {
	start: function () {
		this.t = 0
		this.stars = UFX.random.spread(100)
		this.texts = [
			"-Flajora! Look what I've got!",
			"+Hey that's my flask! I paid for it with my own money.",
			"+You can't just go taking other people's things, you know. Give it back.",
			"-You can't get ye flask.",
			"+Ugh, I hate you! I'd blow up your whole stupid planet if it wouldn't also destroy my flask!",
			"-Let this be a lesson to you. People don't like their planets being threatened with destruction!",
			"+Whatever. I'm out of here.",
			"+Your planet is too lame to destroy anyway.",
		]
		this.h = 0
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		this.t += dt
		if (!this.bubble && !this.texts.length && this.h < 1) {
			this.h += dt
			if (this.h >= 1) {
				UFX.scene.swap("thanks")
			}
			return
		}
		if (!this.bubble) {
			var text = this.texts.shift()
			this.x = 0
			this.y = 0
			this.youtalk = text[0] == "-"
			this.bubble = new SpeechBubble(this, text.substr(1))
		}
		if (this.bubble && kstate.down.space) this.bubble.die()
		if (this.bubble) this.bubble.think(dt)
		if (this.bubble && this.bubble.dead) this.bubble = null
	},
	draw: function () {
		var sx = settings.sx, sy = settings.sy
		UFX.draw("fs #333 f0 fs white")
		this.stars.forEach(function (s) {
			UFX.draw("[ t", s[0] * sx, s[1] * sy, "b o 0 0 2 f ]")
		})
		UFX.draw("[ t", sx/2, sy*2/3+sx, "z", sx, sx, "b o 0 0 1 fs rg~-0.5~-0.5~0~0~0~1~0~blue~1~#005 f ]")
		var a = (this.t % 0.2) * 5
		var img = UFX.resource.images.ship
		UFX.draw("[ t", sx/2, sy/3 - this.h * sy,
			"t", 0, 0.05*sy*Math.sin(19*this.t), "r", 0.07 * Math.cos(19*this.t),
			"drawimage", img, -img.width/2, -img.height/2,
			"[ alpha", 0.6 + 0.4 * Math.sin(11*this.t), "b o 54 -13 18 fs yellow f ]",
			"[ alpha", 0.6 + 0.4 * Math.sin(11*this.t+2), "b o -54 -13 18 fs yellow f ]",
		"]")
		if (this.bubble) {
			UFX.draw("[ t", sx/2, sy * (this.youtalk ? 0.7 : 0.4), "z 16 16")
			this.bubble.draw()
			UFX.draw("]")
			write("Space: next", 0.99, 1, settings.tstyles.gobacktip)
		}
	},
}


UFX.scenes.thanks = {
	start: function () {
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (kstate.down.space) {
			UFX.scene.pop()
		}
	},
	draw: function () {
		UFX.draw("fs white f0")
		write("Flajora did not destroy the world.\n\nThanks for playing.", 0.5, 0.5, settings.tstyles.fail, {color: "#009"})
	},
}




