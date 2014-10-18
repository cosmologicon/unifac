function clamp(x, a, b) { return x < a ? a : x > b ? b : x }
var tau = 2 * Math.PI

var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")

UFX.draw.setcontext(context)
var sx, sy
UFX.maximize.onadjust = function (canvas, width, height) {
	sx = width
	sy = height
}
UFX.maximize.fill(canvas, "total")
UFX.scene.init({ minfps: 10, maxfps: 60 })
UFX.scene.push("play")
UFX.key.init()

world.init()
terrain.init()



