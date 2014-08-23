var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

UFX.maximize.fill(canvas, "total")
UFX.draw("fs blue f0")

UFX.scene.init()

UFX.scene.push({
	think: function (dt) {
		view.think(dt)
	},
	draw: function () {
		background.draw()
	},
})


