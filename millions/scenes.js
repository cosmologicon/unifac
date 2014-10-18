UFX.scenes.play = {
	init: function () {
		world.init()
	},
	think: function (dt) {
	
	},
	draw: function () {
		UFX.draw("fs black f0")
		UFX.draw("[ t", sx/2, sy/2, "z", 2, 2)
		terrain.draw()
		UFX.draw("]")
	},
}

