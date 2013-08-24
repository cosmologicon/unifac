
var DrawCircle = {
	draw: function () {
		UFX.draw("z 0.1 0.1 b o 0 0 10 lw 1 fs blue ss black f s")
	},
}

var MovesWithArrows = {
	init: function () {
		this.v = mechanics.walkspeed
	},
	move: function (kdown) {
		var dx = (kdown.right || 0) - (kdown.left || 0)
		var dy = (kdown.down || 0) - (kdown.up || 0)
		
		if (dx && dy) {
			dx *= 0.707
			dy *= 0.707
		}
		this.vx = dx * this.v
		this.vy = dy * this.v
	},
	think: function (dt) {
		this.x += dt * this.vx
		this.y += dt * this.vy
	},
}


var SeeksTarget = {
	init: function (v) {
		this.v = v || 10
	},
	seek: function (x, y) {
		this.target = [x, y]
	},
	think: function (dt) {
		if (!this.target) return
		var dx = this.target[0] - this.x, dy = this.target[1] - this.y
		var d = Math.sqrt(dx * dx + dy * dy)
		var step = this.v * dt
		if (d <= step) {
			this.x = this.target[0]
			this.y = this.target[1]
			this.target = null
			return
		}
		this.x += step * dx / d
		this.y += step * dy / d
	},
}


function You() {
}
You.prototype = UFX.Thing()
	.addcomp(WorldBound, 0, 0)
	.addcomp(MovesWithArrows)
	.addcomp(DrawCircle)

// Race runner
function Runner(x, y, targetx, targety) {
	this.x = x
	this.y = y
	this.seek(targetx, targety)
}
Runner.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(SeeksTarget)
	.addcomp(DrawCircle)




