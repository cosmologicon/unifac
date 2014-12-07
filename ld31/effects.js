
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
	nearby: function (who) {
		return who.parent === this.parent && Math.abs(who.x - this.x) < 0.5
	},
	draw: function () {
		if (!this.goesto()) return
		UFX.draw("fs rgba(255,255,255,0.2) b m 0 0 l -0.5 1 l 0.3 0.7 f")
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
			this.x = this.x0 + this.swing * Math.sin(2.5 * this.t)
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
		UFX.draw("ss brown lw 0.1 b m 0 0 l", this.x0 - this.x, this.y1 - this.y, "s")
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
	.addcomp(CircleDraw)


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
	this.think(0)
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
	]
	this.construct({
		x0: settings.w / 2,
		y0: settings.h / 2,
		path: path,
		places: [place],
	})
	this.bossname = place
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


