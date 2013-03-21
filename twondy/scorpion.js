// The Scorpion is this boss that's like a glorified Aphid with a shell

var Scorpion = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(PortalUser)
	.addcomp(HasStates, ["think", "draw"])
	.addcomp({
		init: function () {
			this.shines = []
			this.tshine = 0
			var S = Math.sin(tau/12), C = Math.cos(tau/12)
			var radialGradient3796 = UFX.draw.radgrad(-15.37,28.23,0.00,-15.37,28.23,35.19,0.00, "rgba(204,204,204,1)",1.00,"rgba(124,124,124,1)")
			this.shell = UFX.Tracer([
	"( m 0.00 0.00 l 16.79 5.02 l 24.50 17.55 l 34.72 20.01 c 30.27 27.65 24.74 32.71 16.57 36.49 c 5.75 40.85 -3.95 41.45 -16.67 36.43 c -26.11 31.54 -30.56 26.83 -34.66 19.92 l -27.46 12.44 l -12.72 11.93 )",
		"alpha 1.00 lw 0.50 fs", radialGradient3796, "f ss #000000 s",
	"( m 35.88 20.55 l 24.50 17.55 l 16.79 5.02 l 0.00 0.00 l -12.72 11.93 l -27.46 12.44 l -35.49 20.74 l -34.20 22.72 l -26.38 14.64 l -11.56 14.02 l 0.54 2.32 l 15.45 6.83 l 23.21 19.29 l 34.64 22.25 )",
		"lw 0.80 fs #b3b3b3 f ss #000000 s",
	"( m -14.02 37.50 c -7.45 30.87 -3.72 27.40 -1.01 16.92 c 1.58 12.25 7.07 9.66 9.79 10.42 c 15.22 12.50 16.35 16.42 15.34 23.23 c 14.02 30.05 10.73 35.29 5.49 40.47 c 2.27 42.93 0.82 43.44 -5.93 42.87 c -8.65 42.30 -13.13 41.35 -14.02 37.50 )",
		"lw 0.50 fs #b89d81 f ss #000000 s",
	"( m -9.53 40.56 l -4.55 35.54 c 0.28 37.69 5.21 37.15 8.30 36.24 c 6.91 38.39 3.57 41.29 3.57 41.29 c 0.09 42.30 -4.26 42.58 -9.53 40.56 )",
		"lw 0.40 fs #dc8c72 f ss #000000 s",
	"( m -2.43 33.08 c -1.42 31.91 0.54 29.45 1.17 26.11 c 5.30 27.50 9.47 27.97 12.85 27.78 c 12.12 30.56 11.30 32.04 9.94 34.06 c 6.19 34.72 3.03 34.66 -2.43 33.08 )",
		"lw 0.40 fs #dc8c72 f ss #000000 s",
	"( m 2.12 23.36 c 2.12 23.36 3.85 18.66 5.43 16.95 c 8.11 17.90 12.72 18.28 13.89 17.96 c 13.89 17.96 14.65 21.24 13.67 24.97 c 10.26 25.29 5.81 24.72 2.12 23.36 )",
		"lw 0.40 fs #dc8c72 f ss #000000 s",
			], [-40, -5, 80, 50])
			this.open = 1
		},
		think: function (dt) {
			for (this.tshine += dt ; this.tshine > 0 ; this.tshine -= 0.02) {
				this.shines.push({
					t: 0, A: UFX.random(tau),
					x: UFX.random(0.5, 1.2), y: UFX.random(0.2, 0.4),
					color: "#" + UFX.random.word(3, "BDF"),
				})
			}
			this.shines.forEach(function (obj) { obj.t += dt })
			this.shines = this.shines.filter(function (obj) { return obj.t < 0.6 })
		},
		draw: function () {
			for (var j = 0 ; j < 3 ; ++j) {
				var y = 40 * this.open
				UFX.draw("[ r", j*tau/3,
					"( m 0 0 q 0", y, "-30", y+20, "l 30", y+20, "q 0", y, "0 0 )",
					"alpha 0.4 fs #630 ss #B60 lw 2 f s",
				"]")
			}

			if (this.open) {
				UFX.draw("[ fs white")
				this.shines.forEach(function (obj) {
					var s = 40 * Math.pow(obj.t, 0.2), a = 0.2 * clip(1 - obj.t / 0.6, 0, 1)
					UFX.draw("[ alpha", a, "r", obj.A, "z", s * obj.x, s * obj.y, "b o 0 0 1 fs", obj.color, "f ]")
				})
				UFX.draw("]")
			}
			for (var j = 0 ; j < 3 ; ++j) {
				UFX.draw("[ r", j*tau/3, "t 0", 40 * this.open)
				this.shell.draw(camera.zoom)
				UFX.draw("]")
			}
		},
	})
	.addcomp({
		beclonked: function () {},
	})
//	.addcomp(Clonkable)
Scorpion.vmax = 600
Scorpion.amax = 600
Scorpion.scrunchfactor = 4000

var ScorpionStates = {}
ScorpionStates.roll = UFX.Thing()
	.addcomp(AutoNextState)
	.addcomp(BasicMotion)
	.addcomp(BouncesOnGround, 0.8, 40)
	.addcomp(ScrunchInMotion)
	.addcomp({
		enter: function () {
			this.A = 0
		},
		think: function (dt) {
			this.ay -= 1000
			this.A -= this.vx * dt / 50
		},
		draw: function () {
			UFX.draw("r", this.A)
		},
	})
	.definemethod("draw")
ScorpionStates.roll.invulnerable = true

ScorpionStates.wander = UFX.Thing()
	// TODO: some common component for this and TargetBezier
	.addcomp(AutoNextState)
	.addcomp({
		enter: function (obj) {
			var y = UFX.random(60, 120), X = this.X + UFX.random.choice([-3, 3])
			var vx = UFX.random(-100, 100), vy = UFX.random(-10, 100)
			this.path = objbezier(this, X, y, vx, vy)
			this.targetnextstate = ScorpionStates.wander
		},
		think: function (dt) {
			this.path.t += dt
			var pva = this.path.pva()
			this.X = pva[0] ; this.y = pva[1]
			var xfactor = this.y + gamestate.worldr
			this.vx = pva[2] * xfactor ; this.vy = pva[3]
			this.lastax = pva[4] * xfactor ; this.lastay = pva[5]
			if (this.path.t > this.path.t0) {
				this.nextstate = this.targetnextstate
			}
		},
	})
	.definemethod("draw")
	.addcomp(ScrunchInMotion)
ScorpionStates.wander.invulnerable = true

ScorpionStates.sneeze = UFX.Thing()
	.definemethod("think")
	.definemethod("draw")



function ScorpionSquad() {
	this.member = Scorpion
	this.member.alive = true
	this.portal = new Portal(-1, 400, 1.5, 40)
	camera.nextstate = [CameraStates.tofollow, this.portal, 1, 2]
	this.member.squad = this
	this.member.joinportal(this.portal, 5, 1000)
	monsters.push(this.member)
	this.alive = true
}

ScorpionSquad.prototype = {
	think: function (dt) {
	},
	onexitportal: function (who) {
		who.nextstate = [ScorpionStates.roll, {t: 5},
			[ScorpionStates.wander, {t: 5},
			[TargetOmega, {targetX: 0, targety: 100},
			[ScorpionStates.sneeze, {}
		]]]]
		camera.nextstate = [CameraStates.tofollow, who, 3, 0.5]
	},
}

