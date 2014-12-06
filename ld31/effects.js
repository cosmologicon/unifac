
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

