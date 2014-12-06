function clamp(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
var tau = 6.283185307179586
if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}

var canvas = document.getElementById("canvas")
canvas.width = settings.w
canvas.height = settings.h
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
	return Math.ceil(sy / settings.h * n)
}
UFX.maximize.fill(canvas, "aspect")
UFX.scene.init({ ups: 60, maxupf: 12 })
UFX.key.init()
UFX.resource.loadwebfonts("Viga")

UFX.resource.onload = function () {
	UFX.scene.push("play")
}


UFX.scenes.play = {
	start: function () {
		this.ground = new Platform(-1, 1, settings.w + 2)
		this.blocks = [this.ground]
		this.blocks.push(new Platform(5, 5, 10))
		this.blocks.push(new Platform(0, 0, 10))
		this.blocks[2].vx = 1
		this.blocks[2].vy = 2
		this.you = new You(10, 10)
		this.mals = []
		this.bullets = []
		this.portals = [
			new Portal(this.ground, 10, "hub", "roger")
		]
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (state.place == "roger" && UFX.random.flip(dt)) {
			this.mals.push(new Waver())
		}
		this.you.control(kstate)
		if (kstate.down.down && this.you.parent) {
			for (var j = 0 ; j < this.portals.length ; ++j) {
				var portal = this.portals[j]
				if (portal.goesto() && portal.nearby(this.you)) {
					state.place = portal.goesto()
				}
			}
		}
		
		function think(obj) {
			obj.think(dt)
		}
		this.blocks.forEach(think)
		this.mals.forEach(think)
		this.bullets.forEach(think)
		this.portals.forEach(think)
		think(this.you)
		var blocks = this.blocks, bullets = this.bullets
		this.you.constrain(blocks)
		this.mals.forEach(function (mal) { mal.constrain(blocks) })
		this.mals.forEach(function (mal) { mal.collide(bullets) })
		this.bullets.forEach(function (bullet) { bullet.constrain(blocks) })
		
		function unfaded(obj) {
			return !obj.faded
		}
		this.mals = this.mals.filter(unfaded)
		this.bullets = this.bullets.filter(unfaded)
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
		this.portals.forEach(draw)
		this.mals.forEach(draw)
		this.bullets.forEach(draw)
		draw(this.you)
		UFX.draw("]")
		for (var j = 0 ; j < state.maxhp ; ++j) {
			UFX.draw("ss white fs", j < state.hp ? "red" : "black", "lw", f(0.04),
				"fsr", f(0.55 * j + 0.1), f(0.1), f(0.35), f(0.8))
		}

		if (settings.DEBUG) {
			UFX.draw("[ font " + fH(0.3) + "px~'Viga' fs white textalign left textbaseline bottom")
			context.fillText(UFX.ticker.getrates(), fH(0.2), sy - fH(0.2))
			context.fillText("Location: " + state.place, fH(0.2), sy - fH(0.6))
			UFX.draw("]")
		}
	},
}

