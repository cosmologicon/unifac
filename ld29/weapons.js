
var HasLifetime = {
	init: function (t0) {
		this.t0 = t0 || 1
	},
	live: function () {
		this.t = this.t0
		this.alive = true
	},
	think: function (dt) {
		this.t = Math.max(this.t - dt, 0)
		this.f = 1 - this.t / this.t0
		this.alive = this.t > 0
	},
}

var Fades = {
	draw: function () {
		UFX.draw("alpha", 1 - this.f)
	},
}

var HurtsEnemies = {
	init: function (dhp) {
		this.dhp = dhp || 1
	},
	think: function (dt) {
		var x = this.x, y = this.y, r = this.r
		state.monsters.forEach(function (m) {
			if (m.hits(x, y, r)) {
				if (!m.tmercy) {
					m.takedamage(1)
				}
			}
		})
	},
}



function Slash(x, y, r) {
	this.setpos(x, y)
	this.r = r
	this.live()
	state.effects.push(this)
}
Slash.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(HasLifetime, 0.4)
	.addcomp(Fades)
	.addcomp(HurtsEnemies)
	.addcomp({
		draw: function () {
			var r = 1.3 * this.r * (0.5 + 0.5 * this.f)
			UFX.draw("ss rgba(255,255,0,0.5) lw 0.1",
				"b a 0 0", r, "-0.9 0.9 s",
				"b a 0 0", r, "2.24 4.04 s")
		},
	})




