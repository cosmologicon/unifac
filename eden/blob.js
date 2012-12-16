var HasStates = {
	init: function (methodnames) {
		var methods = {}
		methodnames.forEach(function (methodname) {
			methods[methodname] = function () {
				return this.state[methodname] ? this.state[methodname].apply(this, arguments) : null
			}
		})
		this.addcomp(methods)
	},
	setstate: function (state) {
		if (this.state && this.state.exit) {
			this.state.exit.call(this)
		}
		this.state = state
		if (this.state.enter) this.state.enter.call(this)
		this.nextstate = null
		this.think(0)
	},
	updatestate: function () {
		if (this.nextstate) {
			if (this.state.exit) this.state.exit.call(this)
			this.state = this.nextstate
			if (this.state.enter) this.state.enter.call(this)
			this.nextstate = null
			this.think(0)
		}
	},
}

var blobtracers = {
	normal: UFX.Tracer([
		"( m 0 5 c 12 5 18 5 18 0 c 18 -20 10 -30 0 -30 c -10 -30 -18 -20 -18 0 c -18 5 -12 5 0 5 )",
		"fs", UFX.draw.radgrad(20, -20, 10, 20, -20, 44, 0, "blue", 1, "rgb(100,100,255)"),
		"ss darkblue lw 1.5 f s",
		"[ t 3 -15 r -0.15 z 3 6 b o 0 0 1 ] fs white ss black f s",
		"[ t 10 -17 r -0.15 z 3 6 b o 0 0 1 ] fs white ss black f s",
		"( m -2 -4 l 10 0 l 16 -8 ) fs darkblue ss black f s",
	], [-20, -32, 40, 40]),
	pride: UFX.Tracer([
		"( b o 0 -12 17 )",
		"fs white ss gray lw 1.5 f s",
		"b o 0 -25 2 fs black f b o 5 -26 2 f",
		"b m -5 -22 q 5 -20 13 -24 ss black lw 1 s",
	], [-20, -32, 40, 40]),
	gorge: UFX.Tracer([
		"( m 0 5 c 12 5 18 5 18 0 c 18 -20 10 -30 0 -30 c -10 -30 -18 -20 -18 0 c -18 5 -12 5 0 5 )",
		"fs purple ss darkpurple lw 1.5 f s",
		"[ t 3 -20 r -0.15 z 1.5 3 b o 0 0 1 ] fs white ss black f s",
		"[ t 10 -22 r -0.15 z 1.5 3 b o 0 0 1 ] fs white ss black f s",
		"b m -2 3 q 3 -3 -2 -9 m 16 0 q 11 -6 16 -12 m 1 -3 l 13 -6 lw 1 ss black s",
	], [-20, -32, 40, 40]),
	defy: UFX.Tracer([
		"( m 0 5 c 12 5 18 5 18 0 c 18 -20 10 -30 0 -30 c -10 -30 -18 -20 -18 0 c -18 5 -12 5 0 5 )",
		"fs yellow ss orange lw 1.5 f s",
		"[ t 3 -15 r -0.15 z 3 6 b o 0 0 1 ] lw 1 fs white ss black f s",
		"[ t 10 -17 r -0.15 z 3 6 b o 0 0 1 ] fs white ss black f s",
		"( m -2 -4 l 10 0 l 16 -8 ) fs orange ss black f s",
		"b m -5 -24 l 8 -20 l 17 -26 lw 2 ss black s",
	], [-20, -32, 40, 40]),
	want: UFX.Tracer([
		"( m 0 5 c 12 5 18 5 18 0 c 18 -20 10 -30 0 -30 c -10 -30 -18 -20 -18 0 c -18 5 -12 5 0 5 )",
		"fs green ss darkgreen lw 1.5 f s",
		"[ t 3 -15 r -0.15 z 3 6 b o 0 0 1 ] lw 1 fs white ss black f s",
		"[ t 10 -17 r -0.15 z 3 6 b o 0 0 1 ] fs white ss black f s",
		"[ t 7 -5 r -0.15 z 8 3 b o 0 0 1 ] fs darkgreen ss black f s",
	], [-20, -32, 40, 40]),
	rage: UFX.Tracer([
		"( m 0 5 c 12 5 18 5 18 0 c 18 -20 10 -30 0 -30 c -10 -30 -18 -20 -18 0 c -18 5 -12 5 0 5 )",
		"fs red ss darkred lw 1.5 f s",
		"[ t 3 -15 r -0.15 z 3 6 b o 0 0 1 ] fs white ss black f s",
		"[ t 10 -17 r -0.15 z 3 6 b o 0 0 1 ] fs white ss black f s",
		"b m -2 2 q 10 -10 16 -2 ss black s",
		"b m -5 -24 l 8 -20 l 17 -26 lw 2 ss black s",
	], [-20, -32, 40, 40]),
	stun: UFX.Tracer([
		"( m 0 5 c 12 5 18 5 18 0 c 18 -20 10 -30 0 -30 c -10 -30 -18 -20 -18 0 c -18 5 -12 5 0 5 )",
		"fs gray ss darkgray lw 1.5 f s",
		"[ t 3 -15 r -0.15 z 3 6 b m 1 1 l -1 -1 m -1 1 l 1 -1 ] fs white ss black f s",
		"[ t 10 -17 r -0.15 z 3 6 b m 1 1 l -1 -1 m -1 1 l 1 -1 ] fs white ss black f s",
		"b m -2 2 q 10 -10 16 -2 ss black s",
	], [-20, -32, 40, 40]),
}


var ChillState = {
	draw: function () {
		UFX.draw("b o 0", -this.h, this.h + 2, "fs blue ss darkblue lw 2 f s")
	},
}

var HopState = {
	enter: function () {
		this.hoptick = 0
	},
	think: function (dt) {
		if (this.platform) {
			this.hoptick += dt
			if (this.hoptick > settings.hopdelay) {
				this.vx = settings.hopvx * (this.facingright ? 1 : -1)
				this.vy = -settings.hopvy
				this.platform = null
			}
		} else {
			this.x += this.vx * dt
			this.y += this.vy * dt + 0.5 * settings.gravity * dt * dt
			this.vy += settings.gravity * dt
		}
	},
	draw: function () {
		blobtracers.normal.draw(vista.scale)
	},
	land: function (platform) {
		this.platform = platform
		var p = this.platform.constrain(this.x, this.y)
		this.x = p[0] ; this.y = p[1]
		this.hoptick = 0
		this.vx = 0 ; this.vy = 0
	},
	bounce: function (platform) {
		var p = platform.constrain(this.x, this.y)
		var v = platform.bouncevector(this.vx, this.vy)
		this.vx = v[0]
		this.vy = v[1]
		this.facingright = this.vx > 0
		this.x = p[0] + this.vx * 0.001
		this.y = p[1] + this.vy * 0.001
	},
}

var DefyState = Object.create(HopState)
DefyState.defiant = true

DefyState.draw = function () {
	blobtracers.defy.draw(vista.scale)
}

var WantState = {
	greedy: true,
	enter: function () {
		this.vx = 0
		this.vy = 0
		this.platform = null
		this.target = gamestate.nearestgem(this.x, this.y)
	},
	think: function (dt) {
		this.x += this.vx * dt
		this.y += this.vy * dt
		var dx = this.target.x - this.x, dy = this.target.y - this.y
		var d = Math.sqrt(dx * dx + dy * dy)
		this.vx += settings.wanta * dt * dx / d
		this.vy += settings.wanta * dt * dy / d
		var v = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
		if (v > settings.wantv) {
			this.vx *= settings.wantv / v
			this.vy *= settings.wantv / v
		}
		this.facingright = this.vx > 0
	},
	draw: function () {
		blobtracers.want.draw(vista.scale)
	},
	land: function (platform) {
	},
	bounce: function (platform) {
	},
}

var RageState = Object.create(HopState)
RageState.enter = function () {
	this.hoptick = 0
	this.ragetick = 0
}
RageState.think = function (dt) {
	this.ragetick += dt
	if (this.platform) {
		if (this.ragetick > settings.ragetime) {
			this.nextstate = HopState
		} else {
			this.vx = 0
			this.vy = -settings.ragehopvy
			this.platform = null
			for (var j = 0 ; j < blobs.length ; ++j) {
				var b = blobs[j]
				if (b === this || b.state.dead) continue
				var dx = b.x - this.x, dy = b.y - this.y
				if (dx * dx + dy * dy < settings.ragerange * settings.ragerange) {
					b.nextstate = StunState
					b.stunner = this
				}
			}
		}
	} else {
		this.x += this.vx * dt
		this.y += this.vy * dt + 0.5 * settings.ragegravity * dt * dt
		this.vy += settings.ragegravity * dt
	}
}
RageState.draw = function () {
	blobtracers.rage.draw(vista.scale)
}

var GorgeState = Object.create(HopState)
GorgeState.enter = function () {
	this.hoptick = 0
	this.gorgetick = 0
}
GorgeState.think = function (dt) {
	this.gorgetick += dt
	if (this.gorgetick > settings.gorgetime) {
		this.nextstate = PopState
	}
}
GorgeState.draw = function () {
	var ax = 1 + 2 * this.gorgetick / settings.gorgetime
	var ay = 1 + 0.5 * this.gorgetick / settings.gorgetime
	var sx = 1 + 0.2 * Math.sin(10 * this.gorgetick)
	var sy = 1 + 0.2 * Math.cos(10 * this.gorgetick)
	UFX.draw("z", ax*sx, ay*sy)
	blobtracers.gorge.draw(ax * vista.scale)
}

var PrideState = {
	defy: true,
	enter: function () {
		this.pridetick = 0
		this.vx = settings.pridevx * (this.facingright ? 1 : -1)
		this.vy = 0
	},
	think: function (dt) {
		this.pridetick += dt
		if (this.pridetick > settings.pridetime) {
			this.nextstate = HopState
		}
		this.x += this.vx * dt
		this.y += this.vy * dt
		var t = (this.pridetick - 2) * 2
		this.vy = -settings.pridevy / (1 + t * t)
	},
	draw: function () {
		var a = 1 + clip(this.pridetick, 0, 2) * 0.5
		UFX.draw("z", a, a)
		blobtracers.pride.draw(a * vista.scale)
	},
}


var DeadState = {
	dead: true,
}

var PopState = {
	dead: true,
	enter: function () {
		this.particles = []
		for (var j = 0 ; j < 80 ; ++j) {
			this.particles.push({
				x: UFX.random(-20, 20),
				y: UFX.random(-20, 20),
				r: UFX.random(2, 4),
				vx: UFX.random(-400, 400),
				vy: UFX.random(-400, 0),
				color: "purple",
			})
		}
		this.poptick = 0
	},
	think: function (dt) {
		this.poptick += dt
		if (this.poptick > 1) return
		this.particles.forEach(function (p) {
			p.x += p.vx * dt
			p.y += p.vy * dt
			p.vy += 1000 * dt
		})
	},
	draw: function () {
		if (this.poptick > 1) return
		UFX.draw("alpha", 1 - this.poptick)
		this.particles.forEach(function (p) {
			UFX.draw("b o", p.x, p.y, p.r, "fs", p.color, "f")
		})
	},
}

var StunState = {
	dead: true,
	enter: function () {
		this.vx = 300 * (this.stunner.x > this.x ? -1 : 1)
		this.vy = -300
	},
	think: function (dt) {
		this.x += this.vx * dt
		this.y += this.vy * dt
		this.vy += 1000 * dt
	},
	draw: function () {
		blobtracers.stun.draw(vista.scale)
	},
}


var Squishes = {
	draw: function () {
		if (this.vx || this.vy) {
			UFX.draw("r", -0.2 * Math.sin(2 * Math.atan2(this.vy, this.vx)))
		}
		var s = 1 + clip(this.vy / 600, -0.2, 0.2)
		UFX.draw("z", 1/s, s)
	},
}

var DieSoHigh = {
	think: function (dt) {
		if (this.y > gamestate.ymax + 200 && !this.state.dead) this.nextstate = DeadState
	},
}

function Blob(x, y) {
	this.x = x
	this.y = y
	this.vx = 0
	this.vy = 0
	this.h = settings.blobheight
	this.setstate(HopState)
}
Blob.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(KeepsLastPosition)
	.addcomp(Squishes)
	.addcomp(FacesDirection)
	.addcomp(HasStates, ["think", "draw", "land", "bounce"])
	.addcomp(DieSoHigh)
	.addcomp({
		applysin: function (sin) {
			var nextstate = {
				defy: DefyState,
				want: WantState,
				rage: RageState,
				gorge: GorgeState,
				pride: PrideState,
			}[sin]
			if (nextstate === this.state) return false
			this.nextstate = nextstate
			return true
		},
	})
	.addcomp({ think: function (dt) { this.updatestate() } })

var blobs = []


