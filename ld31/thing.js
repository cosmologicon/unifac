// obj.faded: true when the object can be removed from the game state
// obj.die: call when something is destroyed in-game, eg runs out of health

var Ticks = {
	construct: function (args) {
		this.t = args.t || 0
	},
	think: function (dt) {
		this.t += dt
	},
}

var Lifetime = {
	init: function (lifetime) {
		this.lifetime = lifetime || 1
	},
	think: function (dt) {
		if (this.t > this.lifetime) this.faded = true
	},
}

var LastPos = {
	construct: function (args) {
		this.lastx = args.x
		this.lasty = args.y
	},
	think: function (dt) {
		this.lasty = this.y
		this.lastx = this.x
	},
}

var WorldBound = {
	construct: function (args) {
		this.x = args.x
		this.y = args.y
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
	constrain: function () {
	},
}

var ParentBound = {
	construct: function (args) {
		this.x = args.x
		this.y = args.y
		this.parent = null
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
	think: function (dt) {
	},
	constrain: function (parents) {
		for (var j = 0 ; j < parents.length ; ++j) {
			var parent = parents[j]
			if (parent === this.parent) continue
			if (parent.catches(this)) this.land(parent)
		}
		if (this.parent && !this.parent.holds(this)) {
			this.drop()
		}
		if (this.parent) {
			this.parent.constrainchild(this)
		}
	},
	land: function (parent) {
		this.parent = parent
	},
	drop: function () {
		this.parent = null
	},
}

var ParentStuck = {
	construct: function (args) {
		this.parent = args.parent
		this.dx = args.dx === undefined ? this.parent.dx / 2 : args.dx
	},
	think: function (dt) {
		this.x = this.dx + this.parent.x
		this.y = this.parent.y
	},
}

var OnStage = {
	construct: function (args) {
		this.places = {}
		for (var j = 0 ; j < args.places.length ; ++j) this.places[args.places[j]] = true
	},
	isonstage: function () {
		return this.places[state.place]
	},
}

var FacesDirection = {
	init: function () {
		this.facingright = true
	},
	think: function (dt) {
		if (this.vx > 0) this.facingright = true
		if (this.vx < 0) this.facingright = false
	},
	draw: function () {
		if (!this.facingright) UFX.draw("hflip")
	},
}

var TiltsInAir = {
	draw: function () {
		if (!this.parent) {
			UFX.draw("r", 0.05 * this.vy)
		}
	},
}

var ScreenBound = {
	constrain: function (parents) {
		if (this.x <= 0) {
			this.x = 0
			this.vx = Math.max(this.vx, 0)
		}
		if (this.x >= settings.w) {
			this.x = settings.w
			this.vx = Math.min(0, this.vx)
		}
	},
}

var ScreenAlive = {
	think: function (dt) {
		if (this.x < -1 && this.vx <= 0) this.faded = true
		if (this.x > settings.w + 1 && this.vx >= 0) this.faded = true
	}, 
}

var MultiJump = {
	construct: function (args) {
		this.jumps = 0
	},
	land: function () {
		this.jumps = 0
	},
	drop: function () {
		this.jumps = 1
	},
	canleap: function () {
		return this.jumps < state.njump
	},
	leap: function () {
		this.jumps += 1
	},
}

var KeyControl = {
	construct: function (args) {
	},
	control: function (kstate, dt) {
		var dx = (kstate.pressed.left ? -1 : 0) + (kstate.pressed.right ? 1 : 0)
		if (dx * this.vx < 0) {
			this.vx += settings.decel * dx * dt
		} else if (dx) {
			this.vx += settings.ax * dx * dt
		} else if (this.vx > 0) {
			this.vx = Math.max(0, this.vx - settings.friction * dt)
		} else if (this.vx < 0) {
			this.vx = Math.min(0, this.vx + settings.friction * dt)
		}
		this.vx = clamp(this.vx, -settings.vxmax, settings.vxmax)
		if (kstate.down.up && this.canleap()) this.leap()
		
		if (kstate.down.space) {
			UFX.scenes.play.bullets.push(
				new Bullet(this.x, this.y, 20 * (this.facingright ? 1 : -1), 3)
			)
		}
	},
	leap: function () {
		this.parent = null
		this.vy = settings.leapvy
		playsound("jump")
	},
}


var Moves = {
	construct: function (args) {
		this.vx = args.vx || 0
		this.vy = args.vy || 0
	},
	think: function (dt) {
		this.x += dt * this.vx
		this.y += dt * this.vy
	},
}

var SnakesAbout = {
	construct: function (args) {
		this.theta = 0
		this.omega = 1
		this.v0 = 2
	},
	think: function (dt) {
		if (UFX.random.flip(0.2 * dt)) this.omega = -this.omega
		this.theta += this.omega * dt
		var dx = 1.4 * (this.x - settings.w / 2) / settings.w
		var dy = 1.4 * (this.y - settings.h / 2) / settings.h
		this.vx = this.v0 * (Math.sin(this.theta) - dx)
		this.vy = this.v0 * (Math.cos(this.theta) - dy)
	},
}

var Falls = {
	init: function (g) {
		this.g = g || settings.g
	},
	think: function (dt) {
		if (!this.parent) {
			this.vy -= dt * this.g
		}
	},
}


var BlockDraw = {
	construct: function (args) {
		this.dx = args.dx
		this.dy = args.dy
		this.color = UFX.random.color()
	},
	draw: function () {
		UFX.draw("fs", this.color, "fr 0 0", this.dx, this.dy)
	},
}

var Blocks = {
	blocks: function (obj) {
		var dx = obj.x - this.x, dy = obj.y - this.y
		return 0 <= dx && dx <= this.dx && 0 <= dy && dy <= this.dy
	},
}

var PlatformDraw = {
	construct: function (args) {
		this.dx = args.dx
		this.color = "#" + UFX.random.choice("789") + UFX.random.choice("456") + UFX.random.choice("123")
	},
	draw: function () {
		UFX.draw("t", -this.x, -this.y)
		function xform(x, y, z) {
			return [x + 0.01 * z * (settings.w/2 - x) / 2, y + 0.1 * z]
		}
		UFX.draw("fs", this.color, "b",
			"m", xform(this.x, this.y, 0),
			"l", xform(this.x + this.dx, this.y, 0),
			"l", xform(this.x + this.dx, this.y, -4),
			"l", xform(this.x, this.y, -4),
		"f")
		UFX.draw("fs #642 (",
			"m", xform(this.x, this.y, -4),
			"l", xform(this.x + this.dx, this.y, -4),
			"l", xform(this.x + this.dx, this.y - 0.4, -4),
			"l", xform(this.x, this.y - 0.4, -4),
		") f")
	},
}

var DrawPath = {
	construct: function (args) {
		this.path = args.path
	},
	draw: function () {
		UFX.draw(this.path)
	},
}

var CircleDraw = {
	construct: function (args) {
		this.color = args.color || UFX.random.color()
		this.r = args.r || 0.2
	},
	draw: function () {
		UFX.draw("fs", this.color, "b o 0 0", this.r, "f")
	},
}	

var DrawBullet = {
	construct: function (args) {
		this.r = args.r || 0.2
	},
	draw: function () {
		UFX.draw("fs black ss white b o 0 0", this.r, "lw 0.02 f s")
	},
}	

var DrawFlash = {
	construct: function (args) {
		this.r = args.r || 0.2
	},
	draw: function () {
		var color = this.t * 8 % 2 > 1 ? "red" : "blue"
		UFX.draw("fs", color, "b o 0 0", this.r, "f")
	},
}	

var ProvidesPlatform = {
	catches: function (obj) {
		if (this.lasty >= obj.lasty) return false
		if (this.y < obj.y) return false
		var dx = obj.x - this.x
		return 0 <= dx && dx <= this.dx && obj.vy <= this.vy
	},
	holds: function (obj) {
		return obj.x >= this.x && obj.x <= this.x + this.dx
	},
	constrainchild: function (child) {
		child.y = this.y
		child.vy = this.vy
	},
}

var TakesDamage = {
	init: function (hp0) {
		this.hp0 = hp0 || 1
		this.flashtime = 0.5
		this.tflash = 0
	},
	construct: function (args) {
		this.hp0 = args.hp0 || this.hp0
		this.hp = this.hp0
		this.alive = true
	},
	takedamage: function (dhp) {
		if (this.tflash) return
		this.hp -= dhp
		if (this.hp <= 0) this.die()
		this.tflash = this.flashtime
	},
	die: function () {
		this.faded = true
	},
	think: function (dt) {
		if (this.tflash) {
			this.tflash = Math.max(0, this.tflash - dt)
		}
	},
	draw: function () {
		if (this.tflash && this.tflash * 14 % 2 > 1) {
			UFX.draw("alpha 0")
		}
	},
}

var VulnerableToBullets = {
	init: function (rhit) {
		this.rhit = rhit || 0.3
	},
	collide: function (bullets) {
		for (var j = 0 ; j < bullets.length ; ++j) {
			var dx = this.x - bullets[j].x, dy = this.y - bullets[j].y
			if (dx * dx + dy * dy < this.rhit * this.rhit) {
				bullets[j].die()
				this.takedamage(bullets[j].dhp)
				if (this.hp > 0) {
					addeffect(new Smoke(bullets[j].x, bullets[j].y))
					playsound("hurt")
				}
			}
		}
	},
}

var SmokesOnDeath = {
	die: function () {
		addeffect(new Smoke(this.x, this.y))
	},
}

var SoundOnDeath = {
	init: function (soundname) {
		this.deathsoundname = soundname || "hurt"
	},
	die: function () {
		playsound(this.deathsoundname)
	},
}

var InvulnerableToBullets = {
	init: function (rhit) {
		this.rhit = rhit || 0.3
	},
	collide: function (bullets) {
		for (var j = 0 ; j < bullets.length ; ++j) {
			var dx = this.x - bullets[j].x, dy = this.y - bullets[j].y
			if (dx * dx + dy * dy < this.rhit * this.rhit) {
				bullets[j].die()
				playsound("dink")
			}
		}
	},
}

function Block(x, y, dx, dy) {
	this.construct({
		x: x,
		y: y,
		dx: dx,
		dy: dy,
	})
}
Block.prototype = UFX.Thing()
	.addcomp(LastPos)
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(BlockDraw)
	.addcomp(ProvidesPlatform)

function Platform(x, y, dx) {
	this.construct({
		x: x,
		y: y,
		dx: dx,
	})
}
Platform.prototype = UFX.Thing()
	.addcomp(LastPos)
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(PlatformDraw)
	.addcomp(ProvidesPlatform)

function You(x, y) {
	var path = [
		"z 0.06 0.06 b o 0 1 5 lw 0.3 fs #AAF ss black f s",
		"( m -6 4 q 1 4 1 0 l 5 -1 l 4 -5 q -5 -5 -6 4 ) fs red f s",
		"b o -4 -2 4 fs gray f s",
		"b o 4 -3.5 2.5 f s",
	]
	this.construct({
		x: x,
		y: y,
		path: path,
	})
}
You.prototype = UFX.Thing()
	.addcomp(LastPos)
	.addcomp(ParentBound)
	.addcomp(ScreenBound)
	.addcomp(Moves)
	.addcomp(Falls)
	.addcomp(FacesDirection)
	.addcomp(TiltsInAir)
	.addcomp(TakesDamage)
	.addcomp(VulnerableToBullets)
	.addcomp(MultiJump)
	.addcomp(DrawPath)
	.addcomp(KeyControl)



