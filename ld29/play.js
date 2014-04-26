UFX.scenes.play = {
	start: function () {
		state.init()
		this.mode = "play"
		this.buildoff = [0, 0]
		this.vplatform = new VirtualPlatform(0, 0, 1)
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
		} else if (this.mode == "build") {
			if (kstate.down.left) this.buildoff[0] -= 1
			if (kstate.down.right) this.buildoff[0] += 1
			if (kstate.down.up) this.buildoff[1] += 1
			if (kstate.down.down) this.buildoff[1] -= 1
			this.vplatform.x = Math.floor(state.you.x) + this.buildoff[0]
			this.vplatform.y = Math.floor(state.you.y) + this.buildoff[1]
			if (!kstate.pressed.space) {
				state.platforms.push(new Platform(this.vplatform.x, this.vplatform.y, this.vplatform.dx))
				this.mode = "play"
			}
		}


		state.you.think(dt)
		if (!state.you.parent && state.you.vy < 0) {
			state.platforms.forEach(function (platform) {
				if (platform.catches(state.you)) state.you.land(platform)
			})
		}
		camera.x0 = state.you.x
		camera.y0 = state.you.y
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
		state.platforms.forEach(draw)
		draw(state.you)
		if (this.mode == "build") {
			draw(this.vplatform)
		}
		context.restore()
	},
}

