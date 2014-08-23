var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

UFX.maximize.fill(canvas, "total")
UFX.draw("fs blue f0")

UFX.scene.init({ minups: 5, maxups: 120 })
UFX.mouse.init(canvas)

background.init()

UFX.scene.push({
	thinkargs: function (dt) {
		return [dt, UFX.mouse.pos || [0, 0]]
	},
	think: function (dt, mpos) {
		this.bpos = control.nearest([2, 1], view.togame(mpos[0], mpos[1]))
		view.think(dt)
		background.think(dt)
	},
	draw: function () {
		background.draw()
		UFX.draw("[")
		view.transform()
		UFX.draw("b m 2 1 l", this.bpos, "ss yellow lw 0.04 s")
		UFX.draw("b o 0 0 0.2 fs blue f")
		UFX.draw("b o 2 1 0.2 fs green f")
		
		UFX.draw("]")
	},
})


