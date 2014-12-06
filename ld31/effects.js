
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

