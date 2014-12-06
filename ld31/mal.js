var TakesDamage = {
	init: function (hp0) {
		this.hp0 = hp0 || 1
	},
	construct: function (args) {
		this.hp0 = args.hp0 || this.hp0
		this.hp = this.hp0
		this.alive = true
	},
	takedamage: function (dhp) {
		this.hp -= dhp
		if (this.hp <= 0) this.die()
	},
	die: function () {
		this.faded = true
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

var MovesWavey = {
	construct: function (args) {
		this.vymax = args.vymax || 2
		this.omega = args.omega || 10
		this.phi = args.phi || UFX.random(tau)
	},
	think: function (dt) {
		this.phi += dt * this.omega
		this.vy = this.vymax * Math.sin(this.phi)
	},
}


function Waver() {
	var right = UFX.random.flip()
	this.construct({
		x: right ? settings.w + 1 : -1,
		y: UFX.random(3, settings.h - 3),
		vx: right ? -3 : 3,
		r: 0.1,
		color: "red",
	})
}
Waver.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(MovesWavey)
	.addcomp(Moves)
	.addcomp(ScreenAlive)
	.addcomp(CircleDraw)
	.addcomp(TakesDamage)
	.addcomp(VulnerableToBullets)


