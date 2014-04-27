var WorldBound = {
	setpos: function (x, y) {
		this.x = x
		this.y = y
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var Stands = {
	think: function (dt) {
		if (this.parent) {
			if (!this.parent.supports(this)) {
				this.drop()
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
	die: function () {
		new Splat(this.x, this.y, 1)
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
		this.parent = null
		this.upward = true
		this.dup = settings.dup
		this.hanging = settings.hangtime
		new Slash(this.x, this.y + 0.3, 0.8)
	},
}

var DrawLine = {
	init: function (color) {
		this.color = color || "white"
	},
	draw: function () {
		UFX.draw("ss", this.color, "lw 0.08 b m 0 0 l", this.dx, "0 s")
	},
}

var DrawPlacable = {
	think: function (dt) {
		this.color = state.canplace(this) ? "white" : "red"
	},
}

var FliesLissajous = {
	settrack: function (x0, y0, dx, dy, omegax, omegay) {
		this.tfly = 0
		this.x0 = x0
		this.y0 = y0
		this.dx = dx || 3
		this.dy = dy || 1
		this.omegax = omegax || 1.1
		this.omegay = omegay || 1.6
	},
	think: function (dt) {
		this.tfly += dt
		this.x = this.x0 + this.dx * Math.sin(this.tfly * this.omegax)
		this.y = this.y0 + this.dy * Math.sin(this.tfly * this.omegay)
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


function You(x, y) {
	this.setpos(x, y)
	this.parent = null
	this.leap()
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
			UFX.draw("fs green fr -0.2 0 0.4 0.6")
		},
	})

function Platform(x, y, dx) {
	this.setpos(x, y)
	this.dx = dx
	state.claimtiles(this)
}
Platform.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsSurface)
	.addcomp(DrawLine, "#266")

function VirtualPlatform(x, y, dx) {
	this.setpos(x, y)
	this.dx = dx
}
VirtualPlatform.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(DrawLine, "white")
	.addcomp(DrawPlacable)

function House(x, y) {
	this.setpos(x, y)
	this.r = 3
}
House.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp({
		draw: function () {
			UFX.draw("fs #026 fr -1 0 2 2.4")
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
	.addcomp(FliesLissajous)
	.addcomp(HitZone, 0.2)
	.addcomp(HasHealth, 1)
	.addcomp(SplatsOnDeath)
	.addcomp({
		draw: function () {
			var h = 0.2 * [0, 1, 0, -1][Math.floor(this.tfly * 20 % 4)]
			UFX.draw("ss #B00 lw 0.05 b m -0.5", h, "l 0 0 l 0.5", h, "s")
			UFX.draw("fs #700 fr -0.2 -0.2 0.4 0.4")
		},
	})
