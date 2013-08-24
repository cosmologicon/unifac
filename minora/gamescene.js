

UFX.scenes.game = {
	start: function () {
		this.opentime = 0.5
		this.draw()  // so the opening is showing while we load
		// loading screen
		
		this.clock = 10
		this.you = new You()
		this.people = [
			new Runner(5, 10, -20, 10),
			new Runner(5, 8, -20, 8),
		]
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

		this.you.move(kstate.pressed)

		function think(obj) { obj.think(dt) }
		think(this.you)
		this.people.forEach(think)
		
		this.clock -= dt
		camera.think(dt)
		camera.x = this.you.x
		camera.y = this.you.y
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
		UFX.draw("[ t -3 -4 r -0.2 z 0.1 0.1 fs rgba(255,0,0,0.2) textalign center font 40px~'Mouse~Memoirs' ft0 ATTACK~HERE ]")
		// Draw people
		draw(this.you)
		this.people.forEach(draw)
		UFX.draw("]")
		
		write(this.clock.toFixed(1), 0.5, 0.99, settings.tstyles.timer)
	},
}


