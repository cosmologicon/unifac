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

var DrawGuns = {
	draw: function () {
		for (var j = 0 ; j < 5 ; ++j) {
			UFX.draw("[ r", j * tau / 5 + this.t,
			"fs #AAA ss black lw 0.04 fsr -0.2 0 0.4 1.3",
			"fsr -0.3 0 0.6 1.1",
			"]")
		}
	},
}

var ShootsAround = {
	fire: function () {
		for (var j = 0 ; j < 5 ; ++j) {
			var theta = tau * j / 5 + this.t, S = Math.sin(theta), C = Math.cos(theta)
			UFX.scenes.play.hazards.push(
				new EvilBullet(this.x + C * this.r, this.y + S * this.r, 4 * C, 4 * S)
			)
		}
	},
}

var ShootsForward = {
	fire: function () {
		var vx = this.vx * 2
		UFX.scenes.play.hazards.push(
			new EvilBullet(this.x, this.y, vx, 0)
		)
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
	.addcomp(FiresPeriodically, 5)
	.addcomp(ShootsForward)

function RotoShooter(x, y) {
	var path = ["b o 0 0 1 lw 0.06 fs #00B ss black f s",
		"b o 0 0 0.7 fs #008 f s",
		"( m -0.5 0 q 0 0.5 0.5 0 q 0 -0.5 -0.5 0 fs white f s",
		"b o 0 0 0.3 fs #F00 f s",
	]
	this.construct({
		x: x,
		y: y,
		r: 1,
		path: path,
	})
	this.r = 1
}
RotoShooter.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(WorldBound)
	.addcomp(SnakesAbout)
	.addcomp(Moves)
	.addcomp(TakesDamage, 3)
	.addcomp(DrawGuns)
	.addcomp(DrawPath)
	.addcomp(FiresPeriodically, 2)
	.addcomp(ShootsAround)
	.addcomp(InvulnerableToBullets, 1)

var bosstypes = {
	roger: RotoShooter,
}






