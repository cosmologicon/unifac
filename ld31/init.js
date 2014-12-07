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
	background.reset()
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
//		this.blocks.push(new Platform(0, 0, 10))
//		this.blocks[2].vx = 1
//		this.blocks[2].vy = 2
		this.you = new You(10, 10)
		this.you.hp = state.hp0
		this.mals = []
		this.boss = null
		this.bullets = []  // hurts mals
		this.hazards = []  // hurts player
		this.portals = [
			new Portal(this.ground, 10, "hub", "roger"),
			new Portal(this.ground, 15, "hub", "pilar"),
		]
		var starps = "m 0.000 2.000 l 0.588 0.809 l 1.902 0.618 l 0.951 -0.309 l 1.176 -1.618 l 0.000 -1.000 l -1.176 -1.618 l -0.951 -0.309 l -1.902 0.618 l -0.588 0.809"
		var windowpath = [
			"b m -1 -1 c -1 3 1 3 1 -1 fs #AAC f",
			"b m 0 -1 l 0 2 ss #963 lw 0.2 s",
			"b m -0.8 0 l 0.8 0 ss #963 lw 0.2 s",
			"b m -1 -1 c -1 3 1 3 1 -1 ss #852 lw 0.4 s",
			"b m -1.3 -1 l 1.3 -1 ss #963 lw 0.5 s",
		]
		this.decorations = [
//			new DanglingDecoration(16, settings.h - 4, "b o 0 0 2 fs yellow f", ["tanya"]),
//			new DanglingDecoration(16, settings.h - 4, ["r 0.6 ( a 0.5 0 1", tau/6, tau*5/6, "aa 1.5 0 1", tau*4/6, tau*2/6, ") ss black lw 0.1 s fs white f"], ["hub"]),
			new DanglingDecoration(16, settings.h - 4, ["r 0.6 z 0.3 0.3 (", starps, ") ss black lw 0.1 s fs #FFA f"], ["hub"]),
			new DanglingDecoration(6, settings.h - 3, "b o -1 0 1 o 1 0 1 o 0 0.5 1 ss black lw 0.1 s fs white f", ["hub"]),
			new DanglingDecoration(6, 10, windowpath, ["roger"]),
			new DanglingDecoration(18, 10, windowpath, ["roger"]),
//			new DanglingDecoration(18, settings.h - 6, "b o -1 0 1 o 1 0 1 o 0 0.5 1 ss black lw 0.1 s fs white f", ["hub"]),
		]
		this.effects = []
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
					if (bosstypes[state.place] && !state.donebosses[state.place] && !this.boss) {
						this.mals.push(new Talisman(state.place))
					}
				}
			}
		}
		
		function think(obj) {
			obj.think(dt)
		}
		this.blocks.forEach(think)
		this.mals.forEach(think)
		this.bullets.forEach(think)
		this.hazards.forEach(think)
		this.portals.forEach(think)
		this.decorations.forEach(think)
		think(this.you)
		var blocks = this.blocks, bullets = this.bullets
		this.you.constrain(blocks)
		this.mals.forEach(function (mal) { mal.constrain(blocks) })
		this.mals.forEach(function (mal) { mal.collide(bullets) })
		this.you.collide(this.hazards)
		this.bullets.forEach(function (bullet) { bullet.constrain(blocks) })
		this.hazards.forEach(function (bullet) { bullet.constrain(blocks) })
		
		
		function unfaded(obj) {
			return !obj.faded
		}
		this.mals = this.mals.filter(unfaded)
		this.bullets = this.bullets.filter(unfaded)
		this.effects = this.effects.filter(unfaded)
		this.hazards = this.hazards.filter(unfaded)
		
		if (this.boss && this.boss.faded) {
			state.beatboss(this.bossname)
		}
		background.think(dt)
	},
	draw: function () {
		background.draw()
		var z = sy / settings.h
		UFX.draw("[ t", 0, sy, "z", z, -z)
		function draw(obj) {
			context.save()
			obj.draw()
			context.restore()
		}
		this.decorations.forEach(draw)
		UFX.draw("[ fs black alpha 0.3 fr 0 0", settings.w, settings.h, "]")
		this.blocks.forEach(draw)
		this.portals.forEach(draw)
		this.mals.forEach(draw)
		draw(this.you)
		this.bullets.forEach(draw)
		this.hazards.forEach(draw)
		this.effects.forEach(draw)
		UFX.draw("]")
		for (var j = 0 ; j < state.maxhp ; ++j) {
			UFX.draw("ss white fs", j < this.you.hp ? "red" : "black", "lw", f(0.04),
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

