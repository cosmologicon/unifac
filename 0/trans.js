// Object transitions


var FiniteLife = {
	init: function (T) {
		this.T = T || 1
	},
	think: function (dt) {
		if (this.t > this.T) {
			this.t = this.T
			this.done = true
		}
	},
}
var LinearTrans = {
	think: function (dt) {
		this.f = this.t / this.T
	},
}
var NonLinearTrans = {
	init: function (p) {
		this.p = p || 0
		this.A = p ? 1 / (Math.exp(this.p) - 1) : 0
	},
	think: function (dt) {
		var f = this.t / this.T
		this.f = this.p ? this.A * (Math.exp(this.p * f) - 1) : f
	},
}



function Spin() {
	this.t = 0
}
Spin.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(FiniteLife, 0.8)
	.addcomp(NonLinearTrans, -1)
	.addcomp({
		draw: function (obj) {
			UFX.draw("r", this.f * tau)
		},
	})

function Deploy() {
	this.t = 0
}
Deploy.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(FiniteLife, 0.8)
	.addcomp(NonLinearTrans, -1)
	.addcomp({
		draw: function (obj) {
			UFX.draw("t", -obj.x * (1-this.f), -obj.y * (1-this.f))
		},
	})
	


// Effects

function Ghost(thing0, thing1) {
	this.thing0 = thing0
	this.thing1 = thing1
	var dx = thing1.x - thing0.x, dy = thing1.y - thing0.y
	this.T = Math.sqrt(Math.max(dx * dx + dy * dy, 1)) / settings.ghostv
	this.think(0)
}
Ghost.prototype = UFX.Thing()
	.addcomp(Ticks)
	.addcomp(FiniteLife, 0.3)
	.addcomp(NonLinearTrans)
	.addcomp({
		getf: function (t) {
			var f = clip(t / this.T, 0, 1)
			return this.p ? this.A * (Math.exp(this.p * f) - 1) : f
		},
		getpos: function (t) {
			var f = this.getf(t)
			return [
				this.thing1.x * f + this.thing0.x * (1 - f),
				this.thing1.y * f + this.thing0.y * (1 - f),
			]
		},
		draw: function () {
			UFX.draw("[ t", this.getpos(this.t), "b o 0 0 0.4 f ]")
			UFX.draw("[ t", this.getpos(this.t - 0.02), "b o 0 0 0.3 f ]")
			UFX.draw("[ t", this.getpos(this.t - 0.03), "b o 0 0 0.2 f ]")
		},
		halts: function () {
			return true
		},
	})


