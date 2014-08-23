
function clamp(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
var tau = 6.283185307179586

var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

UFX.maximize.fill(canvas, "total")
UFX.draw("fs blue f0")

UFX.scene.init({ minups: 5, maxups: 120 })
UFX.mouse.init(canvas)
UFX.touch.active = false
canvas.ontouchstart = function (event) {
	UFX.touch.active = true
	UFX.touch.init(canvas)
	UFX.mouse.active = false
}

background.init()
control.init()

UFX.scene.push({
	thinkargs: function (dt) {
		return [
			dt, 
			UFX.mouse.active && UFX.mouse.state(),
			UFX.touch.active && UFX.touch.state(),
		]
	},
	think: function (dt, mstate, tstate) {
		view.think(dt)
		background.think(dt)
		control.think(dt)
		if (mstate && mstate.left.down) {
			var b = control.buttonat(mstate.left.down)
			if (b) control.selectbutton(b)
		}
	},
	draw: function () {
		background.draw()
		UFX.draw("[")
		view.transform()
		UFX.draw("b o 0 0 0.2 fs blue f")
		UFX.draw("b o 2 1 0.2 fs green f")
		
		UFX.draw("]")
		control.draw()
	},
})


