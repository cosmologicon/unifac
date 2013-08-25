

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
		} else if (scene === "ship") {
			this.quests = {
				ship: shipquest
			}
			this.gcolor = "#caf"
		}
		you = new You()
		backeffects = []  // stuff written on ground, etc.
		backscenery = []  // stuff written on ground, etc.
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
		
		if (settings.easymode) dt *= 0.4
		
		if (this.nextscene) {
			this.fadetime += 2 * dt
			if (this.fadetime >= 1) {
				UFX.scene.swap("game", this.nextscene)
			}
		}

		you.move(kstate.pressed)

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
			UFX.scene.push("kazoo")
		} else if (kstate.down.esc) {
			UFX.scene.push("pause")
		}
		
		function isalive(obj) { return !obj.dead }
		fronteffects = fronteffects.filter(isalive)
		frontscenery = frontscenery.filter(isalive)
		hudeffects = hudeffects.filter(isalive)
		
		
		this.clock -= dt
		camera.think(dt)
		camera.x = you.x
		camera.y = you.y
		
		this.canwin = items.flask && you.x * you.x + you.y * you.y < 25
		if (this.canwin && kstate.down.space) {
			UFX.scene.swap("win")
		}
		
	},
	draw: function () {
		if (this.opentime > 0) {
			UFX.draw("fs black f0")
			write("23:59:50 on\nThe Final Day\n\n- 10 seconds remain -", 0.5, 0.5, settings.tstyles.open)
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
		// Draw stuff on the ground
		backeffects.forEach(draw)
		backscenery.forEach(draw)
		// Draw people
		draw(you)
		people.forEach(draw)

		frontscenery.forEach(draw)
		fronteffects.forEach(draw)
		UFX.draw("]")
		hudeffects.forEach(draw)

		if (this.chatter || this.canwin) write("Space: talk", 0.5, 0.3, settings.tstyles.chattip)
		write(this.clock.toFixed(1), 0.5, 0.99, settings.tstyles.timer)
		if (items.kazoo) {
			write("Backspace: use kazoo", 0.99, 0, settings.tstyles.gobacktip)
		}
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
		write(itemnames[this.thing], 0.1, 0.1, settings.tstyles.itemname)
		write(iteminfo[this.thing], 0.5, 0.25, settings.tstyles.iteminfo)
		UFX.draw("[ t", settings.sx, 0, "z", settings.sx/1200, settings.sx/1200,
			"drawimage", UFX.resource.images[this.thing], -200, 0, "]")
		UFX.draw("]")
	},
}


UFX.scenes.kazoo = {
	start: function () {
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
		if (this.t > 1.2) {
			UFX.scene.pop()
			UFX.scene.swap("game")
		}
	},
	draw: function () {
		UFX.scenes.game.draw()
		UFX.draw("fs rgba(0,0,0,0.7) f0")
	},
}


UFX.scenes.pause = {
	start: function () {
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (kstate.down.esc) UFX.scene.pop()
	},
	draw: function () {
		UFX.scenes.game.draw()
		UFX.draw("fs rgba(0,0,0,0.7) f0")
	},
}


UFX.scenes.die = {
	start: function () {
		this.t = 0
		this.stars = UFX.random.spread(100)
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
		if (this.t > 2.5) {
			UFX.scene.swap("game")
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
//			"+You can't just go taking people's things, you know. Give it back.",
//			"-You can't get ye flask.",
//			"+Ugh, what if I don't destroy your planet?",
//			"-Aaaaaand....?",
//			"+Whatever. I'm out of here. Your planet is too lame to destroy anyway.",
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
		write("Flajora has not destroyed the world.\n\nThanks for playing.", 0.5, 0.5, settings.tstyles.fail, {color: "#009"})
	},
}




