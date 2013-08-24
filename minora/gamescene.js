

UFX.scenes.game = {
	start: function () {
		this.opentime = 0.5
		this.draw()  // so the opening is showing while we load
		// loading screen
		
		this.clock = 10
		you = new You()
		this.runner1 = new Runner(5, 10, -20, 10)
		this.runner2 = new Runner(6, 8, -20, 8)

		people = [
			this.runner1,
			this.runner2,
		]
		fronteffects = []  // speech bubbles
		this.ground = UFX.texture.patchygrass()
		camera.think(0)
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate]
	},
	think: function (dt, kstate) {
		if (this.opentime > 0) {
			this.opentime -= dt
			return
		}

		you.move(kstate.pressed)

		this.runscripts()

		colliders = [you].concat(people)
		function think(obj) { obj.think(dt) }
		think(you)
		people.forEach(think)
		fronteffects.forEach(think)

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
		}
		
		function isalive(obj) { return !obj.dead }
		fronteffects = fronteffects.filter(isalive)
		
		
		this.clock -= dt
		camera.think(dt)
		camera.x = you.x
		camera.y = you.y
	},
	draw: function () {
		if (this.opentime > 0) {
			UFX.draw("fs black f0")
			write("23:59:50 on the last day\n10 seconds remain", 0.5, 0.5, settings.tstyles.open)
			return
		}
		UFX.draw("fs white f0 [")
		camera.draw()
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		// Draw stuff on the ground
		UFX.draw("[ lw 1 ss rgba(255,0,0,0.2) b o 0 0 0.5 s b o 0 0 2 s b o 0 0 3.5 s ]")
		UFX.draw("[ r -0.3 t 0 8 z 0.1 0.1 fs rgba(255,0,0,0.2) textalign center font 40px~'Mouse~Memoirs' ft0 ATTACK~HERE ]")
		// Draw people
		draw(you)
		people.forEach(draw)
		fronteffects.forEach(draw)
		UFX.draw("]")

		if (this.chatter) write("Space: talk", 0.5, 0.3, settings.tstyles.chattip)
		write(this.clock.toFixed(1), 0.5, 0.99, settings.tstyles.timer)
		write("Backspace: use kazoo", 0.99, 0, settings.tstyles.gobacktip)
	},
	
	runscripts: function () {
		if (you.x * you.x + you.y * you.y < 2 * 2) {
			you.say("This does not look good. I better get the hell out of here using the arrow keys!")
		} else {
			you.shutup()
		}
	},
}


UFX.scenes.chat = {
	start: function (chatter) {
		this.chatter = chatter
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
		write(this.text, 0.5, 0.2, settings.tstyles.chat)
	},
}




