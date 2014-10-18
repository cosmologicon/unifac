UFX.scenes.play = {
	init: function () {
		world.init()
	},
	thinkargs: function (dt) {
		var kstate = UFX.key.state()
		return [dt, kstate.pressed]
	},
	think: function (dt, keys) {
		world.think(dt, keys)
	},
	draw: function () {
		UFX.draw("fs black f0")
		world.drawstars()
		UFX.draw("[ t", sx/2, sy/2, "z", world.R, world.R)
		UFX.draw("[ r", world.theta)
		terrain.draw()
		UFX.draw("]")
		world.draw()
		UFX.draw("]")
		var s = "world~population:~" + world.totalpop() + "~million"
		UFX.draw("fs white ft", s, 10, 10)
	},
}

