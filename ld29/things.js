var WorldBound = {
	setpos: function (x, y) {
		this.x = x
		this.y = y
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var Stands = {
	think: function (dt) {
		if (!this.parent) {
			if (this.upward) {
				var d = Math.min(settings.vyup * dt, this.dup)
				this.y += d
				this.dup -= d
				if (this.dup == 0) {
					this.upward = false
					this.hover = settings.hover
					this.vy = 0
					this.ay = -settings.aydown
				}
			} else if (this.hover) {
				this.hover = Math.max(this.hover - dt, 0)
			} else {
				this.y += dt * this.vy + 0.5 * dt * dt * this.ay
				this.vy += dt * this.ay
			}
		}
	},
}


var MultiLeaper = {
	leap: function () {
		this.parent = null
		this.upward = true
		this.dup = settings.dup
	},
}


function You(x, y) {
	this.setpos(x, y)
	this.parent = null
	this.leap()
	
}

You.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Stands)
	.addcomp(MultiLeaper)
	.addcomp({
		draw: function () {
			UFX.draw("fs green fr -0.2 0 0.4 0.6")
		},
	})




