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
		if (this.parent) {
			if (!this.parent.supports(this)) {
				this.drop()
				this.y += 0.002
			}
		} else {
			if (this.upward) {
				var d = Math.min(settings.vyup * dt, this.dup)
				this.y += d
				this.dup -= d
				if (this.dup == 0) {
					this.drop()
				}
			} else if (this.hover) {
				this.hover = Math.max(this.hover - dt, 0)
			} else {
				this.oldy = this.y
				this.y += dt * this.vy + 0.5 * dt * dt * this.ay
				this.vy += dt * this.ay
			}
		}
	},
	drop: function () {
		this.upward = false
		this.hover = settings.hover
		this.y -= 0.001
		this.vy = 0
		this.ay = -settings.aydown
		this.parent = null
	},
	land: function (parent) {
		this.parent = parent
		this.y = this.parent.y
		this.vy = 0
		this.upward = false
		this.hover = false
	},
}


var MovesHorizontal = {
	hmove: function (dx) {
		this.vx = (dx || 0) * settings.vx
	},
	think: function (dt) {
		this.x += this.vx * dt
	},
}

var IsSurface = {
	supports: function (obj) {
		return obj.x >= this.x && obj.x <= this.x + this.dx
	},
	catches: function (obj) {
		return obj.y < this.y && obj.oldy >= this.y && this.supports(obj)
	},
}


var MultiLeaper = {
	leap: function () {
		this.parent = null
		this.upward = true
		this.dup = settings.dup
	},
}

var DrawLine = {
	init: function (color) {
		this.color = color || "white"
	},
	draw: function () {
		UFX.draw("ss", this.color, "lw 0.08 b m 0 0 l", this.dx, "0 s")
	},
}

var DrawPlacable = {
	think: function (dt) {
		this.color = state.canplace(this) ? "white" : "red"
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
	.addcomp(MovesHorizontal)
	.addcomp({
		draw: function () {
			UFX.draw("fs green fr -0.2 0 0.4 0.6")
		},
	})

function Platform(x, y, dx) {
	this.setpos(x, y)
	this.dx = dx
	state.claimtiles(this)
}
Platform.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsSurface)
	.addcomp(DrawLine, "#266")

function VirtualPlatform(x, y, dx) {
	this.setpos(x, y)
	this.dx = dx
}
VirtualPlatform.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(DrawLine, "white")
	.addcomp(DrawPlacable)

