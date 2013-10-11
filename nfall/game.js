var settings = {
	gamename: "nightfall",
	version: "BGJ-0",
	DEBUG: window.location.href.indexOf("DEBUG") > -1,
	silent: window.location.href.indexOf("SILENT") > -1,
	
	sx: 800,
	sy: 600,
	clickr: 20,
}

function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
function rmod(x,z){return(x%z+z)%z}
function zmod(x,z){return((x+z/2)%z+z)%z-z/2}
var tau = 6.283185307179586

var beaten = {}

function savegame() {
	localStorage[settings.gamename + ":" + settings.version + ":save"] = JSON.stringify(beaten)
}
function loadgame() {
	beaten = JSON.parse(localStorage[settings.gamename + ":" + settings.version + ":save"] || "{}")
}
function resetgame() {
	delete localStorage[settings.gamename + ":" + settings.version + ":save"]
	window.location = window.location
}
loadgame()


function overlay(amount, color) {
	if (amount <= 0) return
	amount = clip(amount, 0, 1)
	color = color || "white"
	UFX.draw("[ alpha", amount, "fs", color, "f0 ]")
}


UFX.scenes.menu = {
	start: function () {
		this.t = 0
		var levels = getlevels()
		var buttons = this.buttons = []
		levels.forEach(function (level, j) {
			var label = level[0], levelname = level[1]
			buttons.push({
				x: canvas.width * 0.5 - 200 + 240 * Math.floor(j / 6),
				y: 160 + 60 * (j % 6),
				w: 160,
				h: 45,
				text: label,
				levelname: levelname,
			})
		})
		
	},
	thinkargs: function (dt) {
		var mstate = UFX.mouse.active && UFX.mouse.state()
		return [dt, mstate]
	},
	think: function (dt, mstate) {
		this.t += dt
		if (mstate && mstate.left.down) {
			var x = mstate.pos[0], y = mstate.pos[1]
			this.buttons.forEach(function (button) {
				if (x < button.x || x > button.x + button.w) return
				if (y < button.y || y > button.y + button.h) return
				UFX.scene.swap("transin", button.levelname)
			})
		}
	},
	draw: function () {
		UFX.draw("fs black f0 textalign center textbaseline middle",
			"[ t", canvas.width/2, "50 font 64px~'Trade~Winds' fs white ft0 Nightfall ]",
			"[ t", canvas.width/2, "100 font 22px~'Trade~Winds' fs gray ft0 by~Christopher~Night ]",
			"font 32px~'Trade~Winds'"
		)
		this.buttons.forEach(function (button) {
			var rect = [button.x, button.y, button.w, button.h]
			var color = beaten[button.levelname] ? "#040" : "#400"
			UFX.draw("[",
				"fs", color, "ss white lw 3 fr", rect, "sr", rect,
				"t", button.x + 0.5 * button.w, button.y + 0.5 * button.h + 1,
				"fs white ss black lw 1 st0", button.text, "ft0", button.text,
			"]")
		})
		overlay((0.5 - this.t) / 0.5)
	},
}


UFX.scenes.transin = {
	start: function (levelname) {
		this.levelname = levelname
		this.t = 0
		this.back = screengrab()
	},
	think: function (dt) {
		this.t += dt
		if (this.t > 0.5) UFX.scene.swap("action", this.levelname)
	},
	draw: function () {
		this.back.draw()
		var x0 = 0.5 * canvas.width, y0 = 0.5 * canvas.height
		var g = UFX.draw.radgrad(x0, y0, 0, x0, y0, this.t * 1600,
			0, "white", 0.5, "white", 1, "rgba(255,255,255,0)"
		)
		UFX.draw("fs", g, "f0")
	},
}

UFX.scenes.transout = {
	addstars: function () {
		var w = this.stars.width, h = this.stars.height
		var x = UFX.random.rand(w), y = UFX.random.rand(h)
		UFX.draw(this.starcon2, "c0")
		this.starcon2.drawImage(this.stars, x, y)
		this.starcon2.drawImage(this.stars, x-w, y)
		this.starcon2.drawImage(this.stars, x, y-h)
		this.starcon2.drawImage(this.stars, x-w, y-h)
		this.starcon.drawImage(this.stars2, 0, 0)
	},
	start: function () {
		this.t = 0
		this.st = 0
		this.back = screengrab()
		this.stars = document.createElement("canvas")
		this.stars.width = canvas.width
		this.stars.height = canvas.height
		this.starcon = this.stars.getContext("2d")
		this.stars2 = document.createElement("canvas")
		this.stars2.width = canvas.width
		this.stars2.height = canvas.height
		this.starcon2 = this.stars2.getContext("2d")
		for (var j = 0 ; j < 10 ; ++j) {
			var x = UFX.random.rand(this.stars.width), y = UFX.random.rand(this.stars.height)
			UFX.draw(this.starcon, "fs white fr", x, y, 2, 2)
		}
	},
	think: function (dt) {
		this.t += dt
		if (this.t > 4) UFX.scene.swap("menu")
		if (this.t > 1.8) {
			this.st += dt
			while (this.st > 0.1) {
				this.addstars()
				this.st -= 0.1
			}
		}
	},
	draw: function () {
		if (this.t < 1.8) {
			this.back.draw()
			overlay(this.t / 1.3, "black")
		} else {
			context.drawImage(this.stars, 0, 0)
		}
	},
}




UFX.scenes.action = {
	start: function (levelname) {
		camera.init()
		this.levelname = levelname
		loadlevel(levelname)
		this.selected = null
		this.t = 0
	},
	
	thinkargs: function (dt) {
		var clicked = false
		var mstate = UFX.mouse.active && UFX.mouse.state()
		return [dt, mstate]
	},
	think: function (dt, mstate) {
		this.t += dt

		if (mstate && mstate.pos) {
			var mx = mstate.pos[0] - 0.5 * canvas.width
			var my = mstate.pos[1] - 0.5 * canvas.height
			if (mstate.left.down) {
				if (mstate.pos[0] < 60 && mstate.pos[1] < 30) {
					UFX.scene.swap("menu")
					return
				}
				var selected = camera
				suns.concat(moons).forEach(function (obj) {
					var p = camera.worldtoscreen([obj.x, obj.y])
					var dx = mx - p[0], dy = my - p[1]
					if (dx * dx + dy * dy < settings.clickr * settings.clickr) {
						selected = obj
					}
				})
				this.selected = selected
				console.log(selected)
			}
			if (mstate.left.up) {
				this.selected = null
			}
			
			if (this.selected && mstate.left.drag) {
				if (this.selected === camera) {
					camera.pan(mstate.left.drag.dx, mstate.left.drag.dy)
				} else {
					var p = camera.screentoworld([mx, my])
					var dx = p[0] - this.selected.wheel.x, dy = p[1] - this.selected.wheel.y
					this.selected.wheel.A0 = Math.atan2(dx, -dy) - this.selected.A
				}
			}
		}


		function think(obj) { obj.think(dt) }
		planets.forEach(think)
		moons.forEach(think)
		suns.forEach(think)
		
		planets.forEach(function (planet) { planet.stowers() })
		
		if (planets.every(function (planet) { return planet.shaded() })) {
			beaten[this.levelname] = true
			savegame()
			UFX.scene.swap("transout")
		}
	},
	
	draw: function () {
		UFX.draw("fs black f0")
		
		context.save()
		context.translate(0.5 * canvas.width, 0.5 * canvas.height)
		camera.draw()
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		wheels.forEach(draw)
		moons.forEach(draw)
		planets.forEach(draw)
		suns.forEach(function (sun) { sun.drawshade() })
		suns.forEach(draw)
		context.restore()
		UFX.draw("fs white font 22px~Viga ft back 30 15")
		overlay((0.5 - this.t) / 0.5)
	},

}



var WorldBound = {
	init: function (x, y) {
		this.x = x || 0
		this.y = y || 0
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var OnWheel = {
	init: function (wheel, A, r) {
		this.wheel = wheel
		this.A = A || 0
		this.wr = r || 0
	},
	think: function (dt) {
		var A = this.wheel.A0 + this.A
		this.x = this.wheel.x + this.wr * Math.sin(A)
		this.y = this.wheel.y - this.wr * Math.cos(A)
	},
}

var DrawCircle = {
	init: function (r, color) {
		this.r = r || 10
		this.color = color || "blue"
	},
	draw: function () {
		UFX.draw("b o 0 0", this.r, "fs", this.color, "f")
	},
}

var HasShade = {
	init: function () {
		this.shade = null
	},
	// TODO: consider caching shades, though it doesn't really seem worth it.
	think: function (dt) {
		this.shade = new Shade(this, planets.concat(moons))
	},
	shaded: function (obj) {
		return this.shade.shaded(obj)
	},
	drawshade: function () {
		this.shade.draw()
	},
}

var HasTowers = {
	addtowers: function (towerspec) {
		var towers = this.towers = [], r = this.r, x0 = this.x, y0 = this.y
		towerspec.forEach(function (tspec) {
			var tA = tspec[0], tr = tspec[1] + r
			towers.push({
				A: tA,
				r: tr,
				shaded: false,
				x: x0 + tr * Math.sin(tA),
				y: y0 - tr * Math.cos(tA),
			})
		})
	},
	stowers: function () {
		this.towers.forEach(function (tower) {
			tower.shaded = suns.every(function (sun) { return sun.shaded(tower) })
//			console.log(suns[0].shade.shaded(tower))
		})
	},
	draw: function () {
		var x0 = this.x, y0 = this.y
		this.towers.forEach(function (tower) {
			UFX.draw("[ r", tower.A, "fs green fr -1 0 2", -tower.r)
			UFX.draw("fs", (tower.shaded ? "white" : "red"), "b o 0", -tower.r, "3 f ]")
		})
	},
	shaded: function () {
		return this.towers.every(function (tower) { return tower.shaded })
	},
}

var ConnectChildren = {
	draw: function () {
		UFX.draw("r", this.A0, "b m 0 0 o 0 0 3 m 0 0")
		var A = 0
		this.children.forEach(function (child) {
			UFX.draw("l", child.wr * Math.sin(A), child.wr * -Math.cos(A))
			var dA = zmod(child.A - A, tau)
			UFX.draw((dA > 0 ? "a" : "aa"), 0, 0, child.wr, A-tau/4, A-tau/4+dA)
			A = child.A
		})
		UFX.draw("ss #121212 lw 6 s ss #090909 lw 4 s")
	},
}




function Planet(x, y, r, towerspec) {
	this.x = x || 0
	this.y = y || 0
	this.r = r || this.r
	this.addtowers(towerspec || [])
}
Planet.prototype = UFX.Thing()
	.addcomp(WorldBound, 0, 0)
	.addcomp(HasTowers)
	.addcomp(DrawCircle, 20, "blue")
	.definemethod("think")

function Sun(wheel, A, r) {
	this.wheel = wheel
	this.wheel.children.push(this)
	this.A = A
	this.wr = r
}
Sun.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(OnWheel)
	.addcomp(HasShade)
	.addcomp(DrawCircle, 8, "yellow")

function Moon(wheel, A, wr, r) {
	this.wheel = wheel
	this.wheel.children.push(this)
	this.A = A
	this.wr = wr
	this.r = r || this.r
}
Moon.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(OnWheel)
	.addcomp(DrawCircle, 12, "gray")

function Wheel(x, y, A0) {
	this.x = x || 0
	this.y = y || 0
	this.A0 = A0 || 0
	this.children = []
}
Wheel.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(ConnectChildren)
	.definemethod("think")



var planets = []
var moons = []
var suns = []
var wheels = []



function Shade(source, bodies) {
	this.source = source
	this.x = source.x
	this.y = source.y
	this.color = source.color
	this.build(bodies)
}
Shade.prototype = {
	build: function (bodies) {
		this.specs = []
		for (var j = 0 ; j < bodies.length ; ++j) {
			var body = bodies[j]
			var dx = body.x - this.x, dy = body.y - this.y
			var d = Math.sqrt(dx * dx + dy * dy), A0 = Math.atan2(dx, -dy)
			if (body.r >= 0.999 * d) continue  // too close to body to cast shadow
			var h = Math.sqrt(d * d - body.r * body.r)
			var dA = Math.asin(body.r / d)
			this.specs.push({
				A0: A0,  // angle of body center
				dA: dA,  // angular radius of body
				d: d,    // distance to body center
				h: h,    // distance to body horizon
				A1: A0 - dA,
				S1: Math.sin(A0 - dA),
				C1: Math.cos(A0 - dA),
				A2: A0 + dA,
				S2: Math.sin(A0 + dA),
				C2: Math.cos(A0 + dA),
			})
		}
	},
	draw: function () {
		context.save()
		UFX.draw("t", this.x, this.y)
		var R = 2000
		this.specs.forEach(function (spec) {
			UFX.draw(
				"( m", spec.h * spec.S2, spec.h * -spec.C2,
				"l", R * spec.S2, R * -spec.C2,
				"a", 0, 0, R, spec.A2 - tau/4, spec.A1 - tau/4 + tau,
				"l", spec.h * spec.S1, spec.h * -spec.C1,
				") clip"
			)
		})
		UFX.draw("fs white alpha 0.15 fr -10000 -10000 20000 20000")
		context.restore()
	},
	shaded: function (obj) {
		var dx = obj.x - this.x, dy = obj.y - this.y
		var d = Math.sqrt(dx * dx + dy * dy), A = Math.atan2(dx, -dy)
		return this.specs.some(function (spec) {
			return Math.abs(zmod(spec.A0 - A, tau)) < spec.dA && spec.h < d
		})
	},
}


var leveldata = {
	train0: {
		planets: [
			[0, 0, 24, [[0, 18]]]
		],
		wheels: [
			[0, 0, 0],
		],
		suns: [
			[0, 0, 120],
		],
		moons: [
		],
	},
	train1: {
		planets: [
			[0, 0, 24, [[0.6, 18]]]
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[0, 0, 120],
			[1, 0.5, 200],
			[1, -0.5, 200],
		],
		moons: [
		],
	},
	train2: {
		planets: [
			[0, 0, 24, [[0.6, 18], [0, 18]]]
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[1, 0.5, 200],
			[1, -0.5, 200],
		],
		moons: [
			[0, 0, 150],
		],
	},
	offset: {
		planets: [
			[0, 0, 24, [[0, 18]]]
		],
		wheels: [
			[30, 0, 0],
			[-30, 0, 0],
		],
		suns: [
			[1, 0, 200],
			[1, tau/3, 200],
			[1, tau/3*2, 200],
		],
		moons: [
			[0, 0, 100],
			[0, tau/4, 100],
			[0, tau/2, 100],
			[0, tau/4*3, 100],
		],
	},
	crossbeam: {
		planets: [
			[0, 0, 24, [[0, 18], [tau/2, 18]]]
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[0, 1.5, 200],
			[1, -1.5, 200],
		],
		moons: [
			[0, 3.5, 120],
			[1, -3.5, 120],
		],
	},


	doubletrip: {
		planets: [
			[-200, 0, 24, [[0, 18], [tau/2, 18]]]
		],
		wheels: [
			[0, 0, 0],
			[200, 0, 0],
		],
		suns: [
			[1, 0, 50],
			[1, tau/3, 60],
			[1, -tau/3, 70],
		],
		moons: [
			[0, 0, 40],
			[0, tau/3, 50],
			[0, -tau/3, 60],
		],
	},

	sevenmoons: {
		planets: [
			[200, 0, 22, [[0, 24], [tau/2, 24]]]
		],
		wheels: [
			[-160, 0, 0],
			[-160, 0, 0],
		],
		suns: [
			[1, 0, 70],
			[1, tau/2, 70],
		],
		moons: [
			[0, 0, 100],
			[0, tau/7, 100],
			[0, 2*tau/7, 100],
			[0, 3*tau/7, 100],
			[0, 4*tau/7, 100],
			[0, 5*tau/7, 100],
			[0, 6*tau/7, 100],
		],
	},


	twoworlds: {
		planets: [
			[200, 0, 22, [[tau/2, 22]]],
			[-200, 0, 22, [[tau/6, 22]]],
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[1, 0, 30],
		],
		moons: [
			[0, 0, 69],
			[0, tau/3, 69],
			[0, -tau/3, 69],
		],
	},
	layercake: {
		planets: [
			[0, 0, 22, [[0, 22]]],
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[1, 0, 120],
			[1, 2, 120],
			[2, 0, 160],
			[2, 3, 160],
			[3, 0, 200],
			[3, 4, 200],
		],
		moons: [
			[0, 1.5, 80],
			[4, -1.5, 80],
		],
	},
	cornered: {
		planets: [
			[0, 0, 22, [[tau/4, 22]]],
			[0, 0, 22, [[-tau/4, 22]]],
		],
		wheels: [
			[0, 0, 1],
			[0, 0, 2],
			[0, 0, 3],
		],
		suns: [
			[0, -1, 140],
			[1, 0, 155],
			[2, 1, 170],
		],
		moons: [
			[0, -2, 80],
			[1, 2, 95],
			[2, -1, 110],
		],
	},
	pentacle: {
		planets: [
			[0, 0, 22, [[0, 22], [tau/5, 22], [tau/5*2, 22], [tau/5*3, 22], [-tau/5, 22]]],
		],
		wheels: [
			[40, 0, 0],
			[-40, 0, 0],
			[-40, 0, 0],
		],
		suns: [
			[0, 0, 260],
			[0, tau/2, 260],
		],
		moons: [
			[1, 0, 100],
			[1, tau/2, 100],
			[2, 0, 130],
			[2, tau/2, 130],
		],
	},
	couple: {
		planets: [
			[-70, 0, 22, [[0.4, 22], [tau/2-0.4, 22]]],
			[70, 0, 22, [[tau/2+0.4, 22], [-0.4, 22]]],
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[0, 0, 240],
			[0, tau/2, 240],
		],
		moons: [
			[1, 0, 160],
			[1, tau/2, 160],
		],
	},
	awash: {
		planets: [
			[0, 0, 22, [[0, 16]]],
		],
		wheels: [
			[0, 0, 0],
			[50, 0, 0],
			[-50, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[0, 0, 240],
			[0, 1*tau/7, 240],
			[0, 2*tau/7, 240],
			[0, 3*tau/7, 240],
			[0, 4*tau/7, 240],
			[0, 5*tau/7, 240],
			[0, 6*tau/7, 240],
		],
		moons: [
			[1, 0, 110],
			[1, tau/4, 110],
			[1, tau/2, 110],
			[1, tau/4*3, 110],
			[2, 0, 120],
			[2, tau/4, 120],
			[2, tau/2, 120],
			[2, tau/4*3, 120],
			[3, tau/2, 210],
		],
	},
	0: {
		planets: [
			[0, 0, 22, [[0, 10]]]
		],
		wheels: [
			[60, 0, 0],
			[-60, 0, 0],
		],
		suns: [
			[0, 0, 100],
		],
		moons: [
			[1, 0, 100],
		],
	},
}

function loadlevel(lname) {
	var level = leveldata[lname]
	planets = []
	wheels = []
	suns = []
	moons = []
	level.planets.forEach(function (planet) {
		planets.push(new Planet(planet[0], planet[1], planet[2], planet[3]))
	})
	level.wheels.forEach(function (wheel) {
		wheels.push(new Wheel(wheel[0], wheel[1], wheel[2]))
	})
	level.moons.forEach(function (moon) {
		moons.push(new Moon(wheels[moon[0]], moon[1], moon[2]))
	})
	level.suns.forEach(function (sun) {
		suns.push(new Sun(wheels[sun[0]], sun[1], sun[2]))
	})
}
		
function getlevels() {
	var r = [
//		["test", "test"],
		["Lurff", "train0"],
	]
	if (beaten.train0) r = r.concat([
		["Trisol", "train1"],
		["Eclyn", "train2"],
	])
	if (beaten.train1 && beaten.train2) r = r.concat([
		["Mesel", "crossbeam"],
		["Pognon", "offset"],
		["Solena", "twoworlds"],
		["Wiptar", "layercake"],
		["Gorps", "couple"],
		["Nelda", "cornered"],
		["Tyz", "pentacle"],
		["Ofod", "awash"],
		["Fulcra", "doubletrip"],
	])
	return r
}




var camera = {
	init: function () {
		this.x0 = this.y0 = 0
		this.z = 1
	},
	screentoworld: function (p) {
		return p ? [
			(p[0] - this.x0) / this.z,
			(p[1] - this.y0) / this.z,
		] : null
	},
	worldtoscreen: function (p) {
		return p ? [
			p[0] * this.z + this.x0,
			p[1] * this.z + this.y0,
		] : null
	},
	
	pan: function (dx, dy) {
		this.x0 += dx / this.z
		this.y0 += dy / this.z
	},
	draw: function () {
		UFX.draw("t", this.x0, this.y0, "z", this.z, this.z)
	},
}

function screengrab() {
	var can = document.createElement("canvas")
	can.width = canvas.width
	can.height = canvas.height
	var con = can.getContext("2d")
	con.drawImage(canvas, 0, 0)
	can.draw = function () {
		context.drawImage(this, 0, 0)
	}
	return can
}



if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}

var canvas = document.getElementById("canvas")
canvas.width = settings.sx
canvas.height = settings.sy

var context = canvas.getContext("2d")
UFX.draw.setcontext(context)
UFX.mouse.init(canvas)
UFX.mouse.qup = false
UFX.mouse.qdown = true
UFX.touch.active = false
UFX.touch.capture = {
	start: true,
}
canvas.ontouchstart = function (event) {
	UFX.touch.active = true
	UFX.touch.init(canvas)
	UFX.mouse.active = false
}


UFX.resource.onload = function () {
	UFX.maximize.resizemode = "total"
	UFX.scene.init({
		minups: 10,
		maxups: 200,
	})
	UFX.scene.push("menu")
}
UFX.resource.loadwebfonts("Condiment", "Allan", "Trade Winds", "Viga")

var nmusic = 0
function music() {
	nmusic += 1
	nmusic %= 5
	;[1,2,3,4].forEach(function (j) {
		if (j == nmusic) {
			document.getElementById("music" + j).play()
		} else {
			document.getElementById("music" + j).pause()
		}
	})
	document.getElementById("music").innerHTML = [
		"Music is off",
		"Track 1: Arcadia",
		"Track 2: Moonlight Hall",
		"Track 3: The Complex",
		"Track 4: Minima",
	][nmusic]
}
music()


