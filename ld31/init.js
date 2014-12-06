function clamp(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
var tau = 6.283185307179586
if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}

var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

var sx, sy
UFX.maximize.onadjust = function (canvas, csx, csy) {
	sx = csx
	sy = csy
}
function fH(n) {
	return Math.ceil(Math.min(sx, sy) / 16 * n)
}
UFX.maximize.fill(canvas, "total")
UFX.scene.init({ ups: 120, maxupf: 20 })
UFX.mouse.init(canvas)
UFX.mouse.capture.wheel = true
UFX.mouse.qclick = true
UFX.touch.active = false
canvas.ontouchstart = function (event) {
	UFX.touch.active = true
	UFX.touch.init(canvas)
	UFX.mouse.active = false
	canvas.ontouchstart = function () {}
}
UFX.resource.loadwebfonts("Viga")

UFX.resource.onload = function () {
	UFX.scene.push("test")
}


UFX.scenes.test = {
	start: function () {
		this.spots = []
	},
	thinkargs: function (dt) {
		var mstate = UFX.mouse.active ? UFX.mouse.state() : null
		var tstate = UFX.touch.active ? UFX.touch.state() : null
		return [dt, mstate, tstate]
	},
	think: function (dt, mstate, tstate) {
		if (mstate) {
			if (mstate.left.down) {
				this.spots.push({
					pos: mstate.left.down,
					t: 1,
					color: UFX.random.color(),
				})
			}
		}
		if (tstate) {
			var spots = this.spots
			tstate.tap.forEach(function (event) {
				spots.push({
					pos: event.pos,
					t: 1,
					color: UFX.random.color(),
				})
			})
		}
		this.spots.forEach(function (spot) { spot.t -= dt })
		this.spots = this.spots.filter(function (spot) { return spot.t > 0 })
	},
	draw: function () {
		UFX.draw("fs #222 f0")
		this.spots.forEach(function (spot) {
			UFX.draw("fs", spot.color, "b o", spot.pos, fH(0.5), "f")
		})
		if (settings.DEBUG) {
			UFX.draw("[ font " + fH(1) + "px~'Viga' fs white textalign left textbaseline bottom")
			context.fillText(UFX.ticker.getrates(), fH(0.2), sy - fH(0.2))
			UFX.draw("]")
		}
	},
}

