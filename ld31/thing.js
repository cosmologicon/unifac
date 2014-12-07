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
	control: function (kstate) {
		var vx = (kstate.pressed.left ? -1 : 0) + (kstate.pressed.right ? 1 : 0)
		this.vx = vx * 4
		if (kstate.down.up && this.canleap()) this.leap()
		
		if (kstate.down.space) {
			UFX.scenes.play.bullets.push(
				new Bullet(this.x, this.y, 10 * (this.facingright ? 1 : -1), 1)
			)
		}
	},
	leap: function () {
		this.parent = null
		this.vy = 6
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
		this.color = UFX.random.color()
	},
	draw: function () {
		UFX.draw("ss", this.color, "lw 0.2 b m 0 0 l", this.dx, "0 s")
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
	this.construct({
		x: x,
		y: y,
	})
}
You.prototype = UFX.Thing()
	.addcomp(LastPos)
	.addcomp(ParentBound)
	.addcomp(ScreenBound)
	.addcomp(Moves)
	.addcomp(Falls)
	.addcomp(FacesDirection)
	.addcomp(TakesDamage)
	.addcomp(VulnerableToBullets)
	.addcomp(MultiJump)
	.addcomp(CircleDraw)
	.addcomp(KeyControl)



