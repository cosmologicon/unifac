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
UFX.key.remaparrows(true)
UFX.key.remap({ enter: "space" })
UFX.key.watchlist = "up down left right space".split(" ")
UFX.resource.loadwebfonts("Viga")

UFX.resource.onloading = function (f) {
	UFX.scenes.load.f = f
}
UFX.resource.onload = function () {
	UFX.scenes.load.loaded = true
}

UFX.scenes.load = {
	start: function () {
		this.f = 0
		this.loaded = false
	},
	think: function (dt) {
		var kstate = UFX.key.state()
		if (this.loaded && kstate.down.space) {
			UFX.scene.swap("play")
		}
	},
	draw: function () {
		UFX.draw("fs #A00 f0")
		background.drawtitle()
		if (this.loaded) {
			background.drawsubtitle("Space: begin")
		} else {
			background.drawsubtitle("Loading... (" + Math.round(100 * this.f) + "%)")
		}
	},
}
UFX.scene.push("load")


UFX.scenes.play = {
	start: function () {
		resetstate()
		background.current = "intro"
		this.ground = new Platform(-1, 1, settings.w + 2)
		this.blocks = [
			this.ground,
			new Platform(6, 3, 5),
			new Platform(14, 5, 4),
			new Platform(19, 7, 2),
			new Platform(18, 10, 2),
			new Platform(13, 12, 4),
			new Platform(4, 13, 5),
			new Platform(3, 8, 3),
		]
		this.you = new You(10, 10)
		this.you.hp = state.maxhp
		this.mals = []
		this.boss = null
		this.bullets = []  // hurts mals
		this.hazards = []  // hurts player
		this.portals = [
			new Portal(this.ground, 17, "cain", "polly"),
			new Portal(this.ground, 16, "carmen", "dana"),
			new Portal(this.blocks[1], undefined, "lex", "sally"),
			new Portal(this.blocks[1], undefined, "dana", "pilar"),
			new Portal(this.blocks[2], undefined, "meg", "eli"),
			new Portal(this.blocks[4], undefined, "polly", "pilar"),
			new Portal(this.blocks[5], undefined, "lex", "cain"),
			new Portal(this.blocks[5], undefined, "dana", "roger"),
			new Portal(this.blocks[6], undefined, "carmen", "tanya"),
			new Portal(this.blocks[7], undefined, "polly", "carmen"),
			new Portal(this.blocks[7], undefined, "pilar", "meg"),
		]
		var starps = "m 0.000 2.000 l 0.588 0.809 l 1.902 0.618 l 0.951 -0.309 l 1.176 -1.618 l 0.000 -1.000 l -1.176 -1.618 l -0.951 -0.309 l -1.902 0.618 l -0.588 0.809"
		var windowpath = [
			"b m -1 -1 c -1 3 1 3 1 -1 fs #AAC f",
			"b m 0 -1 l 0 2 ss #963 lw 0.2 s",
			"b m -0.8 0 l 0.8 0 ss #963 lw 0.2 s",
			"b m -1 -1 c -1 3 1 3 1 -1 ss #852 lw 0.4 s",
			"b m -1.3 -1 l 1.3 -1 ss #963 lw 0.5 s",
		]
		var sunpath = "( m 0.000 1.400 l 0.410 1.128 l 0.900 1.072 l 1.039 0.600 l 1.379 0.243 l 1.182 -0.208 l 1.212 -0.700 l 0.771 -0.919 l 0.479 -1.316 l 0.000 -1.200 l -0.479 -1.316 l -0.771 -0.919 l -1.212 -0.700 l -1.182 -0.208 l -1.379 0.243 l -1.039 0.600 l -0.900 1.072 l -0.410 1.128 ) fs yellow ss black lw 0.05 f s b o 0 0 1.1 f s"
		var moonpath = ["r 0.6 ( a 0.5 0 1", tau/6, tau*5/6, "aa 1.5 0 1", tau*4/6, tau*2/6, ") ss black lw 0.1 s fs white f"]
		var cloudpath = ["b o -1 0 1 o 1 0 1 o 0 0.5 1 ss black lw 0.1 s fs white f"]
		var planetpath = [
			"[ r -0.2 b o 0 0 1 fs purple f",
			"[ z 2 0.5 lw 0.3 ss orange b o 0 0 1 s ]",
			"tr -2 0 4 4 clip b o 0 0 1 fs purple f ]",
		]
		this.decorations = [
			new DanglingDecoration(20, 13, sunpath, ["lex", "pilar"]),
			new DanglingDecoration(16, 9, moonpath, ["cain", "carmen"]),
			new DanglingDecoration(3, 10, ["r 0.6 z 0.3 0.3 (", starps, ") ss black lw 0.1 s fs #FFA f"], ["cain", "carmen"]),
			new DanglingDecoration(6, 10, planetpath, ["dana"]),
			new DanglingDecoration(11, 11, ["r 0.6 z 0.3 0.3 (", starps, ") ss black lw 0.1 s fs #FAF f"], ["cain", "carmen", "dana"]),
			new DanglingDecoration(22, 12, ["r 0.6 z 0.3 0.3 (", starps, ") ss black lw 0.1 s fs #AFF f"], ["cain", "carmen", "dana"]),
			new DanglingDecoration(21, 12, cloudpath, ["polly", "meg"]),
			new DanglingDecoration(9, 10, cloudpath, ["polly", "meg", "lex", "pilar"]),
			new DanglingDecoration(8, 8, windowpath, ["sally", "tanya", "roger", "eli"]),
			new DanglingDecoration(16, 8, windowpath, ["sally", "tanya", "roger", "eli"]),
//			new DanglingDecoration(18, settings.h - 6, "b o -1 0 1 o 1 0 1 o 0 0.5 1 ss black lw 0.1 s fs white f", ["hub"]),
		]
		this.effects = []
	},
	thinkargs: function (dt) {
		return [dt, UFX.key.state()]
	},
	think: function (dt, kstate) {
		if (background.scenes[state.place] == "day") {
			if (UFX.random.flip(0.2 * dt)) {
				this.mals.push(new Waver())
			}
		} else if (background.scenes[state.place] == "space") {
			if (UFX.random.flip(0.6 * dt)) {
				this.hazards.push(new Meteor())
			}
		}
		this.you.control(kstate, dt)
		if (kstate.down.down && this.you.parent) {
			for (var j = 0 ; j < this.portals.length ; ++j) {
				var portal = this.portals[j]
				if (portal.goesto() && portal.nearby(this.you)) {
					state.place = portal.goesto()
					if (bosstypes[state.place] && !state.donebosses[state.place] && !this.boss) {
						this.mals.push(new Talisman(state.place))
					}
					if (state.bombs[state.place]) {
						this.mals.push(new Bomb(state.place))
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
		if (this.boss) {
			for (var j = 0 ; j < 3 ; ++j) {
				UFX.draw("ss white fs", j < this.boss.hp ? "blue" : "black", "lw", f(0.04),
					"fsr", f(0.55 * j + 0.1), f(1.1), f(0.35), f(0.8))
			}
		} else {
			UFX.draw("font " + fH(0.5) + "px~'Viga' textalign right textbaseline bottom fs white")
			;["f11: fullscreen", "down: scene change", "up: double jump", "space/enter: shoot"].forEach(function (text, j) {
				context.fillText(text, sx - fH(0.2), sy - fH(0.2 + 0.6 * j))
			})
		}
		background.drawcurtain()

		if (settings.DEBUG) {
			UFX.draw("[ font " + fH(0.5) + "px~'Viga' fs white textalign left textbaseline bottom")
			context.fillText(UFX.ticker.getrates(), fH(0.2), sy - fH(0.2))
			context.fillText("Location: " + state.place, fH(0.2), sy - fH(0.8))
			UFX.draw("]")
		}
	},
}

