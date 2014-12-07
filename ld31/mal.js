var FiresPeriodically = {
	init: function (firetime) {
		this.tfire = 0
		this.firetime = firetime
	},
	think: function (dt) {
		this.tfire += dt
		if (this.tfire >= this.firetime) {
			this.tfire -= this.firetime
			this.fire()
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

var ShootsAround = {
	fire: function () {
		for (var j = 0 ; j < 6 ; ++j) {
			var theta = tau * j / 6, S = Math.sin(theta), C = Math.cos(theta)
			UFX.scenes.play.hazards.push(
				new EvilBullet(this.x + C * this.r, this.y + S * this.r, 4 * C, 4 * S)
			)
		}
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

function RotoShooter(x, y) {
	this.construct({
		x: x,
		y: y,
		r: 0.6,
	})
}
RotoShooter.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(TakesDamage, 10)
	.addcomp(CircleDraw)
	.addcomp(FiresPeriodically, 2)
	.addcomp(ShootsAround)
	.addcomp(VulnerableToBullets)

var bosstypes = {
	roger: RotoShooter,
}





