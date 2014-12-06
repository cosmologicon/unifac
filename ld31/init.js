function clamp(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
var tau = 6.283185307179586
if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}

var canvas = document.getElementById("canvas")
canvas.width = 640
canvas.height = 360
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

var sx, sy
UFX.maximize.onadjust = function (canvas, csx, csy) {
	sx = csx
	sy = csy
}
function fH(n) {
	return Math.ceil(sy / 16 * n)
}
function f(n) {
	return Math.ceil(sy / 24 * n)
}
UFX.maximize.fill(canvas, "aspect")
UFX.scene.init({ ups: 120, maxupf: 20 })
UFX.key.init()
UFX.resource.loadwebfonts("Viga")

UFX.resource.onload = function () {
	UFX.scene.push("play")
}


UFX.scenes.play = {
	start: function () {
		this.blocks = []
		this.blocks.push(new Platform(5, 5, 10))
		this.blocks.push(new Platform(0, 0, 10))
		this.blocks[1].vx = 1
		this.blocks[1].vy = 2
		this.you = new You(10, 10)
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		function think(obj) {
			obj.think(dt)
		}
		this.blocks.forEach(think)
		think(this.you)
		this.you.resolveparent(this.blocks)
	},
	draw: function () {
		UFX.draw("fs #222 f0")
		var z = sy / 24
		UFX.draw("[ t", 0, sy, "z", z, -z)
		function draw(obj) {
			context.save()
			obj.draw()
			context.restore()
		}
		this.blocks.forEach(draw)
		draw(this.you)
		UFX.draw("]")
		if (settings.DEBUG) {
			UFX.draw("[ font " + fH(1) + "px~'Viga' fs white textalign left textbaseline bottom")
			context.fillText(UFX.ticker.getrates(), fH(0.2), sy - fH(0.2))
			UFX.draw("]")
		}
	},
}

