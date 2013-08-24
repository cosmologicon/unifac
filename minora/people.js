
var IsRound = {  // for the purposes of collision detection, anyway.
	init: function (r) {
		this.r = r || 1
		this.collides = true
	},
	scootch: function (obj) {
		var dx = obj.x - this.x, dy = obj.y - this.y, dr = this.r + obj.r
		if (dx * dx + dy * dy >= dr * dr) return
		var d = Math.sqrt(dx * dx + dy * dy), dd = dr * 1.01 - d
		obj.x += dx * dd / d
		obj.y += dy * dd / d
	},
}

var DrawCircle = {
	draw: function () {
		UFX.draw("z 0.1 0.1 b o 0 0", this.r * 10, "lw 1 fs blue ss black f s")
	},
}


var Steps = {
	step: function (dx, dy) {
		this.x += dx
		this.y += dy
		for (var j = 0 ; j < colliders.length ; ++j) {
			if (colliders[j] === this) continue
			colliders[j].scootch(this)
		}
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
		this.step(dt * this.vx, dt * this.vy)
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
		this.step(step * dx / d, step * dy / d)
	},
}


// Saying/responding refers to the speech bubbles that come up without pressing space.
// Chatting refers to a popup that stops the action

var SaysStuff = {
	say: function (text) {
		if (this.bubble && text === this.bubble.text) return
		if (this.bubble) this.shutup()
		if (text) this.bubble = new SpeechBubble(this, text)
	},
	shutup: function () {
		if (this.bubble) this.bubble.die()
		this.bubble = null
	},
}

// Say a speech bubble when the player gets close enough
var Responds = {
	init: function (rsay) {
		this.rsay = rsay || 4
	},
	think: function (dt) {
		var dx = you.x - this.x, dy = you.y - this.y
		if (dx * dx + dy * dy < this.rsay * this.rsay) {
			this.say(this.response())
		} else {
			this.shutup()
		}
	},
}


function You() {
}
You.prototype = UFX.Thing()
	.addcomp(WorldBound, 0, 0)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(MovesWithArrows)
	.addcomp(SaysStuff)
	.addcomp(DrawCircle)

// Race runner
function Runner(x, y, targetx, targety) {
	this.x = x
	this.y = y
	this.seek(targetx, targety)
	this.name = "Runner"
}
Runner.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SeeksTarget)
	.addcomp(DrawCircle)
	.addcomp({
		response: function () {
			return this.target ? "Get out of my way! I'm racing here!" : ""
		},
		canchat: function () {
			return !this.target
		},
		chat: function () {
			// You get shoes!
			return "Thanks for helping me cheat, you big cheater! I like your style. Take my lucky sneakers, Cheaty McCheaterson. And hey... keep on cheating!"
		},
	})




