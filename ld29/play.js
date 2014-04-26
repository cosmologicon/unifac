UFX.scenes.play = {
	start: function () {
		state.init()
		this.mode = "play"
		this.buildoff = [0, 0]
		this.vplatform = new VirtualPlatform(0, 0, 3)
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (this.mode == "play") {
			if (kstate.down.up) {
				state.you.leap()
			}
			if (state.you.parent && kstate.down.down) {
				state.you.drop()
			}
			state.you.hmove((kstate.pressed.right ? 1 : 0) - (kstate.pressed.left ? 1 : 0))
			if (kstate.down.space) {
				this.mode = "build"
				this.vplatform.x = Math.floor(state.you.x) + this.buildoff[0]
				this.vplatform.y = Math.floor(state.you.y) + this.buildoff[1]
			}
			if (DEBUG && kstate.down.F4 && state.you.parent) {
				state.platforms = state.platforms.filter(function (p) { return p !== state.you.parent })
				state.you.drop()
			}
		} else if (this.mode == "build") {
			if (kstate.down.left) this.buildoff[0] -= 1
			if (kstate.down.right) this.buildoff[0] += 1
			if (kstate.down.up) this.buildoff[1] += 1
			if (kstate.down.down) this.buildoff[1] -= 1
			this.vplatform.x = Math.floor(state.you.x) + this.buildoff[0]
			this.vplatform.y = Math.floor(state.you.y) + this.buildoff[1]
			if (!kstate.pressed.space) {
				if (state.canplace(this.vplatform)) {
					state.platforms.push(new Platform(this.vplatform.x, this.vplatform.y, this.vplatform.dx))
					state.sortplatforms()
				}
				this.mode = "play"
			}
		} else if (this.mode == "fly") {
			if (kstate.down.left) state.you.x -= 1
			if (kstate.down.right) state.you.x += 1
			if (kstate.down.up) state.you.y += 1
			if (kstate.down.down) state.you.y -= 1
		}

		if (DEBUG && kstate.down.F3) this.mode = this.mode == "fly" ? "play" : "fly"


		if (this.mode == "fly") {
			state.you.think(0)
			state.you.parent = null
		} else {
			state.you.think(dt)
			if (!state.you.parent && state.you.vy < 0) {
				state.forplatforms(state.you.y - 1, state.you.oldy + 1, function (platform) {
					if (platform.catches(state.you)) state.you.land(platform)
				})
			}
		}

		if (this.mode == "build") this.vplatform.think(dt)
		camera.focus = state.you
		camera.think(dt)
	},
	draw: function () {
		UFX.draw("fs black f0")
		context.save()
		camera.transform()
		function draw(obj) {
			context.save()
			obj.draw()
			context.restore()
		}
		state.forplatforms(camera.ymin, camera.ymax, draw)
		draw(state.you)
		if (this.mode == "build") {
			draw(this.vplatform)
		}
		context.restore()
		
		if (DEBUG) {
			var texts = [
				UFX.ticker.getrates(),
				"pos: " + Math.floor(state.you.x) + ", " + Math.floor(state.you.y),
				"F3: toggle fly mode",
				"F4: destroy parent",
			]
			texts.forEach(function (text, j) {
				UFX.draw("fs white [ t 4", 20 * j + 20, "ft0", text.replace(/ /g, "~"), "]")
			})
		}
	},
}

