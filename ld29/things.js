var WorldBound = {
	setpos: function (x, y) {
		this.x = x
		this.y = y
	},
	draw: function () {
		UFX.draw("t", this.x*100, this.y*100)
	},
}

var Stands = {
	think: function (dt) {
		if (this.parent) {
			if (!this.parent.supports(this)) {
				this.drop()
				this.kjump = 1
				this.y += 0.002
			}
		} else {
			if (this.upward) {
				var d = Math.min(settings.vyup * dt, this.dup)
				this.y += d
				this.dup -= d
				if (this.dup == 0) {
					this.drop()
				}
			} else if (this.hover) {
				this.hover = Math.max(this.hover - dt, 0)
			} else {
				this.oldy = this.y
				if (this.hanging) {
					var a = -settings.ahang
					this.hanging = Math.max(this.hanging - dt, 0)
				} else {
					var a = this.ay
				}
				this.y += dt * this.vy + 0.5 * dt * dt * a
				this.vy += dt * a
			}
		}
	},
	drop: function () {
		this.upward = false
		this.hover = settings.hover
		this.y -= 0.001
		this.vy = 0
		this.ay = -settings.aydown
		this.parent = null
	},
	land: function (parent) {
		this.kjump = 0
		this.parent = parent
		this.y = this.parent.y
		this.vy = 0
		this.upward = false
		this.hover = false
	},
}

var HasHealth = {
	init: function (maxhp) {
		this.maxhp = maxhp || 1
		this.alive = true
	},
	heal: function (dhp) {
		if (dhp === undefined) {
			this.hp = this.maxhp
		} else {
			this.hp = Math.min(this.hp + dhp, this.maxhp)
		}
	},
	takedamage: function (dhp) {
		if (this.hp <= 0) return
		this.hp = Math.max(this.hp - dhp, 0)
		if (this.hp <= 0) {
			this.die()
		}
	},
	die: function () {
		this.alive = false
	},
}

var SplatsOnDeath = {
	takedamage: function () {
		new Splat(this.x, this.y, 1)
	},
}

var GivesMoney = {
	init: function (amt) {
		this.amt = amt || 1
	},
	die: function () {
		state.gp += this.amt
	},
}

var MercyInvulnerable = {
	takedamage: function () {
		this.tmercy = settings.tmercy
	},
	think: function (dt) {
		this.tmercy = Math.max(this.tmercy - dt, 0)
	},
	draw: function () {
		if (!this.tmercy) return
		UFX.draw("alpha", this.tmercy * 20 % 2 >= 1 ? 0.1 : 0.9)
	},
}


var MovesHorizontal = {
	hmove: function (dx) {
		this.vx = (dx || 0) * settings.vx
	},
	think: function (dt) {
		this.x += this.vx * dt
	},
}

var IsSurface = {
	supports: function (obj) {
		return obj.x >= this.x && obj.x <= this.x + this.dx
	},
	catches: function (obj) {
		return obj.y < this.y && obj.oldy >= this.y && this.supports(obj)
	},
}


var MultiLeaper = {
	leap: function () {
		this.kjump += 1
		this.parent = null
		this.upward = true
		this.dup = settings.dup
		this.hanging = settings.hangtimes[state.jhang]
		if (state.jhang > 0) {
			new Slash(this.x, this.y + 0.3, settings.slashsizes[state.jhang])
		}
	},
}

var DrawLine = {
	init: function (color) {
		this.color = color || "white"
	},
	draw: function () {
		var color = this.ischeck ? "yellow" : this.color
		UFX.draw("ss", color, "lw 8 b m 0 0 l", this.dx*100, "0 s")
	},
}
var DrawDebugLine = {
	init: function (color) {
		this.color = color || "white"
	},
	draw: function () {
		if (!DEBUG) return
		var color = this.ischeck ? "yellow" : this.color
		UFX.draw("ss", color, "lw 8 b m 0 0 l", this.dx*100, "0 s")
	},
}

var DrawPlacable = {
	think: function (dt) {
		this.color = state.canplace(this) ? "white" : "red"
	},
}

var FliesLissajous = {
	init: function (dx, dy, omegax, omegay) {
		this.dx = dx || 3
		this.dy = dy || 1
		this.omegax = omegax || 1.1
		this.omegay = omegay || 1.6
	},
	settrack: function (x0, y0) {
		this.tfly = 0
		this.x0 = x0
		this.y0 = y0
	},
	think: function (dt) {
		this.tfly += dt
		this.x = this.x0 + this.dx * Math.sin(this.tfly * this.omegax)
		this.y = this.y0 + this.dy * Math.sin(this.tfly * this.omegay)
	},
}
var LissajousPulses = {
	init: function () {
		this.tpulse = 0
		this.dx0 = this.dx
		this.dy0 = this.dy
	},
	think: function (dt) {
		this.tpulse += dt
		this.dx = (1 + 0.4 * Math.sin(2 * this.tpulse)) * this.dx0
		this.dy = (1 + 0.4 * Math.cos(2 * this.tpulse)) * this.dy0
	},
}	

var FliesToroidal = {
	init: function (r0, dr, omegar, omegap) {
		this.r0 = r0 || 1
		this.dr = dr || 0.8
		this.omegar = omegar || 5
		this.omegap = omegap || 1
	},
	settrack: function (x0, y0) {
		this.tfly = 0
		this.x0 = x0
		this.y0 = y0
	},
	think: function (dt) {
		this.tfly += dt
		var r = this.r0 + this.dr * Math.sin(this.tfly * this.omegar)
		var phi = this.tfly * this.omegap
		this.x = this.x0 + 2 * r * Math.sin(phi)
		this.y = this.y0 + 0.6 * r * Math.cos(phi)
	},
}

var FliesErratic = {
	init: function (dx, dy, v) {
		this.dx = dx || 1
		this.dy = dy || 1
		this.v = v || 3
	},
	settrack: function (x0, y0) {
		this.tfly = 0
		this.x0 = x0
		this.y0 = y0
		this.x = this.x0
		this.y = this.y0
	},
	think: function (dt) {
		this.tfly += dt
		if (!this.target) {
			this.target = [
				this.x0 + this.dx * UFX.random(-1, 1),
				this.y0 + this.dy * UFX.random(-1, 1),
			]
		}
		var dx = this.target[0] - this.x, dy = this.target[1] - this.y
		var d = Math.sqrt(dx * dx + dy * dy)
		if (d < this.v * dt) {
			this.x = this.target[0]
			this.y = this.target[1]
			this.target = null
			return
		}
		this.x += (this.v * dt) * dx / d
		this.y += (this.v * dt) * dy / d
	},
}


var HitZone = {
	init: function (r) {
		this.r = r || 0
	},
	hits: function (x, y, r) {
		return Math.abs(x - this.x) < r + this.r && Math.abs(y - this.y) < r + this.r
	},
}

var CheckBoss = {
	die: function () {
		state.checkbosses()
	},
}

var WithinSector = {
	settrack: function (x0, y0) {
		var sx = Math.floor(x0 / settings.sectorsize)
		var sy = Math.floor(y0 / settings.sectorsize)
		this.sectorkey = sx + "," + sy
	},
}


function You(x, y) {
	this.setpos(x, y)
	this.parent = null
	this.kjump = 999
	this.drop()
	this.heal()
}

You.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Stands)
	.addcomp(MultiLeaper)
	.addcomp(MovesHorizontal)
	.addcomp(HasHealth, 3)
	.addcomp(MercyInvulnerable)
	.addcomp({
		draw: function () {
			if (state.jhang) {
				var a = this.upward || this.hover ? -0.9 : this.parent || this.hanging ? 0.15 : 0.8
				UFX.draw("fs white [ t 0 50 r", a, "( m 0 0 l 80 0 l 40 20 ) f ]")
				UFX.draw("fs white [ t 0 50 r", -a, "( m 0 0 l -80 0 l -40 20 ) f ]")
			}
			UFX.draw("fs green ( m -25 0 l -15 60 l 15 60 l 25 0 ) f")
		},
		land: function (parent) {
			state.lastlanding = parent
			if (parent.ischeck) state.savegame()
		},
	})

function Platform(x, y, dx) {
	this.setpos(x, y)
	this.dx = dx
	state.claimtiles(this)
	var c = UFX.random.rand(100,120) + "," + UFX.random.rand(100,120) + "," + UFX.random.rand(100,120)
	this.grad = UFX.draw.lingrad(0, 0, 0, -100, 0, "rgb(" + c + ")", 1, "rgba(" + c + ",0)")
}
Platform.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsSurface)
	.addcomp({
		draw: function () {
			UFX.draw("fs", this.grad, "fr 0 -100", this.dx*100, 100)
		},
	})
	.addcomp(DrawDebugLine, "#266")

function VirtualPlatform(x, y, dx) {
	this.setpos(x, y)
	this.dx = dx
}
VirtualPlatform.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(DrawLine, "white")
	.addcomp(DrawPlacable)

function House(x, y, name) {
	this.setpos(x, y)
	this.name = name
	this.r = 3
}
House.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp({
		draw: function () {
			UFX.draw("fs #424 ss #848 lw 8 ( m -85 0 q -85 100 0 200 q 85 100 85 0 ) f s")
			UFX.draw("fs #242 ss #484 lw 8 ( m -20 0 c -20 100 -100 100 -60 180 c -50 100 50 100 60 180 c 100 100 20 100 20 0 ) f s")
			UFX.draw("fs #224 ss #448 lw 8 ( m -100 0 q 0 -20 100 0 q 100 15 90 30 q 0 18 -90 30 q -100 15 -100 0 ) f s")
//			UFX.draw("fs #026 fr -100 0 200 240")
		},
	})


function Bat(x0, y0) {
	this.setpos(x0, y0)
	this.settrack(x0, y0)
	this.tfly = UFX.random(1000)
	this.heal()
	state.monsters.push(this)
}
Bat.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(WithinSector)
	.addcomp(FliesLissajous, 3, 1, 0.7, 0.4)
	.addcomp(HitZone, 0.2)
	.addcomp(HasHealth, 1)
	.addcomp(GivesMoney, 1)
	.addcomp(SplatsOnDeath)
	.addcomp({
		draw: function () {
			var h = 20 * [0, 1, 0, -1][Math.floor(this.tfly * 20 % 4)]
			UFX.draw("ss #B00 lw 5 b m -50", h, "l 0 0 l 50", h, "s")
			UFX.draw("fs #700 fr -20 -20 40 40")
		},
	})

function Zat(x0, y0) {
	this.setpos(x0, y0)
	this.settrack(x0, y0)
	this.tfly = UFX.random(1000)
	this.heal()
	state.monsters.push(this)
}
Zat.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(WithinSector)
	.addcomp(FliesLissajous, 5, 3, 0.7, 1.2)
	.addcomp(HitZone, 0.3)
	.addcomp(HasHealth, 1)
	.addcomp(GivesMoney, 2)
	.addcomp(SplatsOnDeath)
	.addcomp({
		draw: function () {
			var h = 20 * [0, 1, 0, -1][Math.floor(this.tfly * 20 % 4)]
			UFX.draw("z 1.5 1.5 ss #BB0 lw 5 b m -50", h, "l 0 0 l 50", h, "s")
			UFX.draw("fs #770 fr -20 -20 40 40")
		},
	})

function Wat(x0, y0) {
	this.setpos(x0, y0)
	this.settrack(x0, y0)
	this.tfly = UFX.random(1000)
	this.heal()
	state.monsters.push(this)
}
Wat.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(WithinSector)
	.addcomp(FliesLissajous, 5, 3, 0.7, 1.2)
	.addcomp(HitZone, 0.4)
	.addcomp(HasHealth, 1)
	.addcomp(GivesMoney, 3)
	.addcomp(SplatsOnDeath)
	.addcomp({
		draw: function () {
			var h = 20 * [0, 1, 0, -1][Math.floor(this.tfly * 20 % 4)]
			UFX.draw("z 2 2 ss #0BB lw 5 b m -50", h, "l 0 0 l 50", h, "s")
			UFX.draw("fs #077 fr -20 -20 40 40")
		},
	})

function Lance(x0, y0, tfrac) {
	this.setpos(x0, y0)
	this.settrack(x0, y0)
	this.tfly = tau * tfrac
	this.heal()
	state.monsters.push(this)
}
Lance.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(WithinSector)
	.addcomp(FliesLissajous, 2, 1, 1, 2)
	.addcomp(LissajousPulses)
	.addcomp(HitZone, 0.4)
	.addcomp(HasHealth, 1)
	.addcomp(SplatsOnDeath)
	.addcomp(CheckBoss)
	.addcomp({
		draw: function () {
			UFX.draw("r", this.tfly * 5 % tau)
			UFX.draw("ss #B00 lw 5 b m -80 0 l 80 0 m 0 -80 l 0 80 s")
			UFX.draw("fs #700 fr -30 -30 60 60")
		},
	})

function Wilson(x0, y0, tfrac) {
	this.setpos(x0, y0)
	this.settrack(x0, y0)
	this.tfly = tau * tfrac
	this.heal()
	state.monsters.push(this)
}
Wilson.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(WithinSector)
	.addcomp(FliesToroidal)
	.addcomp(HitZone, 0.4)
	.addcomp(HasHealth, 1)
	.addcomp(SplatsOnDeath)
	.addcomp(CheckBoss)
	.addcomp({
		draw: function () {
			UFX.draw("r", this.tfly * 5 % tau)
			UFX.draw("ss #B00 lw 5 b m -80 0 l 80 0 m 0 -80 l 0 80 s")
			UFX.draw("fs #700 fr -30 -30 60 60")
		},
	})

function Percy(x0, y0) {
	this.setpos(x0, y0)
	this.settrack(x0, y0)
	this.tfly = UFX.random(100)
	this.heal()
	state.monsters.push(this)
}
Percy.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(WithinSector)
	.addcomp(FliesErratic, 5, 2, 5)
	.addcomp(HitZone, 0.4)
	.addcomp(HasHealth, 1)
	.addcomp(SplatsOnDeath)
	.addcomp(CheckBoss)
	.addcomp({
		draw: function () {
			UFX.draw("r", this.tfly * 5 % tau)
			UFX.draw("ss #B00 lw 5 b m -80 0 l 80 0 m 0 -80 l 0 80 s")
			UFX.draw("fs #700 fr -30 -30 60 60")
		},
	})


