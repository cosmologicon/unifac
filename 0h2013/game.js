var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

UFX.maximize.fill(canvas, "total")
UFX.resource.loadwebfonts("Viga", "Contrail One")

UFX.resource.onload = function () {
	UFX.mouse.init(canvas)
	UFX.key.init()
	UFX.scene.init()
	UFX.scene.push("game")
}


UFX.scenes.game = {
	init: function () {
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state(), UFX.mouse.state(), canvas.width, canvas.height]
	},
	think: function (dt, kstate, mstate, sx, sy) {
		UFX.draw("fs cyan f0")
		UFX.draw("[ t", sx/2, sy/3, "textalign center fs black font 80px~Viga ft0 0h~game ]")
	},
}

