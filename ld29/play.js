UFX.scenes.play = {
	start: function () {
		state.init()
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (kstate.down.up) {
			state.you.leap()
		}
		state.you.think(dt)
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
		draw(state.you)
		context.restore()
	},
}

