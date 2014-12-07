
var CausesDamage = {
	init: function (dhp) {
		this.dhp = dhp || 1
	},
}

var HitsPlatforms = {
	constrain: function (platforms) {
		for (var j = 0 ; j < platforms.length ; ++j) {
			if (platforms[j].catches(this)) this.die()
		}
	},
	die: function () {
		this.faded = true
	},
}

var LeadsSomewhere = {
	construct: function (args) {
		this.place0 = args.place0
		this.place1 = args.place1
	},
	goesto: function () {
		if (state.place == this.place0) return this.place1
		if (state.place == this.place1) return this.place0
		return null
	},
}

var DrawPortal = {
	construct: function (args) {
		this.shards = []
		while (this.shards.length < 16) {
			this.shards.push({
				x0: UFX.random(-0.3, 0.3),
				y0: UFX.random(0.6, 1),
				r: UFX.random(0.2, 0.4),
				omega: UFX.random(1, 2) * UFX.random.choice([-1, 1]),
				phi0: UFX.random(tau),
				color: UFX.random.color(),
			})
		}
	},
	nearby: function (who) {
		return who.parent === this.parent && Math.abs(who.x - this.x) < 1
	},
	draw: function () {
		if (!this.goesto()) return
		var t = this.t
		var ps = this.shards.map(function (shard) {
			var phi = shard.phi0 + t * shard.omega
			return [shard.x0 + shard.r * Math.sin(phi), shard.y0 + shard.r * Math.cos(phi)]
		})
		UFX.draw("alpha 0.25")
		for (var j = 0 ; j < ps.length ; j += 2) {
			UFX.draw("fs", this.shards[j].color, "b m 0 0 l", ps[j], "l", ps[j+1], "f")
		}
	},
}

var Dangles = {
	construct: function (args) {
		this.x0 = args.x0
		this.y0 = args.y0
		this.y1 = settings.h + 5
		this.L = this.y1 - this.y0
		this.path = args.path
		this.x = this.x0
		this.y = this.y1
		this.swing = 0.5
		this.vx = 0
		this.vy = 0
		this.omega = UFX.random(2, 3)
	},
	think: function (dt) {
		if (this.isonstage()) {
			if (Math.abs(this.vy) > 0.01 || this.y > this.y0 + 0.01) {
				this.vy -= dt * 70
				this.y += dt * this.vy
				if (this.y < this.y0 && this.vy < 0) {
					this.vy *= -1 / 4
					this.y = this.y0
				}
			} else {
				this.vy = 0
				this.y = this.y0
			}
			this.swing *= 1 - 0.2 * dt
			this.x = this.x0 + this.swing * Math.sin(this.omega * this.t)
		} else {
			if (this.y == this.y0 && this.vy == 0) {
				this.vy = -2
			}
			this.vy += dt * 50
			this.y += dt * this.vy
			if (this.y > this.y1) {
				this.y = this.y1
				this.vy = 0
				this.swing = 0.5
			}
		}
	},
	draw: function () {
		UFX.draw("b m 0 0 l", this.x0 - this.x, this.y1 - this.y, "ss #642 lw 0.14 s ss #852 lw 0.07 s")
		UFX.draw("r", (this.x - this.x0) / Math.max(this.y1 - this.y, 0.1))
	},
}


var FadesOffstage = {
	think: function (dt) {
		if (!this.isonstage() && this.y == this.y1) this.faded = true
	},
}

var UnleashesBoss = {
	die: function () {
		UFX.scenes.play.bossname = this.bossname
		UFX.scenes.play.boss = new bosstypes[this.bossname](this.x, this.y)
		UFX.scenes.play.mals.push(UFX.scenes.play.boss)
	},
}

var KillsBoss = {
	die: function () {
		var boss = UFX.scenes.play.boss
		if (boss) {
			boss.takedamage(1)
			state.bombs[this.place] = false
		}
	}
}

function Bullet(x, y, vx, vy) {
	this.construct({
		x: x,
		y: y,
		vx: vx,
		vy: vy,
		r: 0.1,
	})
}
Bullet.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(Lifetime, 1)
	.addcomp(LastPos)
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(Falls)
	.addcomp(CausesDamage, 1)
	.addcomp(HitsPlatforms)
	.addcomp(CircleDraw)

function EvilBullet(x, y, vx, vy) {
	this.construct({
		x: x,
		y: y,
		vx: vx,
		vy: vy,
		r: 0.1,
	})
}
EvilBullet.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(Lifetime, 2)
	.addcomp(LastPos)
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(Falls, 4)
	.addcomp(CausesDamage, 1)
	.addcomp(HitsPlatforms)
	.addcomp(DrawFlash)

function Meteor() {
	var vx = 1, vy = -4
	var x = UFX.random(settings.w), y = UFX.random(settings.h)
	while (y < settings.h) {
		x -= vx
		y -= vy
	}
	this.construct({
		x: x,
		y: y,
		vx: vx,
		vy: vy,
		r: 0.3,
		color: "blue",
	})
}
Meteor.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(LastPos)
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(CausesDamage, 1)
	.addcomp(HitsPlatforms)
	.addcomp(CircleDraw)
	.addcomp(ScreenAlive)


function Portal(parent, dx, place0, place1) {
	this.construct({
		parent: parent,
		dx: dx,
		place0: place0,
		place1: place1,
	})
	this.think(0)
}
Portal.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(WorldBound)
	.addcomp(ParentStuck)
	.addcomp(LeadsSomewhere)
	.addcomp(DrawPortal)


function DanglingDecoration(x0, y0, path, places) {
	this.construct({
		x0: x0,
		y0: y0,
		path: path,
		places: places,
	})
	this.x = this.x0
	this.y = this.y1
}
DanglingDecoration.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(WorldBound)
	.addcomp(OnStage)
	.addcomp(Dangles)
	.addcomp(DrawPath)

function Talisman(place) {
	var path = [
		"[ z 0.4 1.2 fs",
		UFX.draw.lingrad(-1, 0, 1, 0, 0, "#800", 0.3, "#C00", 1, "#800"),
		"fr -1 -1 2 2 ]",
		"b m -0.5 1.2 l 0.5 1.2 m -0.6 0 l 0.6 0 m -0.5 -1.2 l 0.5 -1.2",
		"ss #444 lw 0.2 s ss #666 lw 0.07 s",
		"b o 0 0 0.2 fs #004 ss #00B f s",
	]
	this.construct({
		x0: settings.w / 2,
		y0: settings.h / 2,
		path: path,
		places: [place],
	})
	this.bossname = place
	this.x = this.x0
	this.y = this.y1
}
Talisman.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(TakesDamage, 2)
	.addcomp(VulnerableToBullets)
	.addcomp(Dangles)
	.addcomp(OnStage)
	.addcomp(FadesOffstage)
	.addcomp(DrawPath)
	.addcomp(UnleashesBoss)

function Bomb(place) {
	var path = [
		"[ r 0.2 fs",
		UFX.draw.radgrad(-1, -1, 0, -1, -1, 2, 0, "#333", 1, "black"),
		"b o 0 0 1 f",
		"z 0.05 -0.05 textalign center textbaseline middle font 10px~Viga fs white",
		"ft BOSS 0 -5 ft KILLER 0 5",
		"]"
	]
	this.construct({
		x0: settings.w / 2,
		y0: settings.h / 2,
		path: path,
		places: [place],
		r: 1,
	})
	this.place = place
	this.x = this.x0
	this.y = this.y1
}
Bomb.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(TakesDamage, 10)
	.addcomp(VulnerableToBullets, 1)
	.addcomp(Dangles)
	.addcomp(OnStage)
	.addcomp(FadesOffstage)
	.addcomp(DrawPath)
	.addcomp(KillsBoss)

