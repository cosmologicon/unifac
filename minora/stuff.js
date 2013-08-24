
var Transitions = {
	init: function (Ttrans) {
		this.Ttrans = Ttrans || 0.3
		this.ttrans = 0
		this.dying = false
		this.ftrans = 0
		this.full = false
	},
	think: function (dt) {
		if (this.dying) {
			this.ttrans -= dt
			if (this.ttrans <= 0) this.dead = true
		} else {
			this.ttrans = Math.min(this.ttrans + dt, this.Ttrans)
		}
		this.ftrans = clip(this.ttrans / this.Ttrans, 0, 1)
		this.full = this.ttrans >= this.Ttrans
	},
	die: function () {
		this.dying = true
	},
}
var Fades = {
	draw: function () {
		UFX.draw("alpha", this.ftrans)
	},
}


var WorldBound = {
	init: function (x, y) {
		this.x = x || 0
		this.y = y || 0
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var FollowsPerson = {
	draw: function () {
		UFX.draw("t", this.person.x, this.person.y)
	},
}





function SpeechBubble(who, text) {
	this.person = who
	this.text = text
	fronteffects.push(this)
}
SpeechBubble.prototype = UFX.Thing()
	.addcomp(FollowsPerson)
	.addcomp(Transitions)
	.addcomp(Fades)
	.addcomp({
		draw: function () {
			var metrics = splittext(this.text, settings.tstyles.bubble)
			var w = metrics[1] + 20, h = metrics[2] + 12, r = 8, x = -w/2, y = -h
			UFX.draw("[ t 2 -2 [ z 0.1 0.1 fs white ss black lw 1",
				"( m", x+r, y,
				"arcto", x+w, y, x+w, y+h, r,
				"arcto", x+w, y+h, 5, y+h, r,
				"l 3 0 q 3 15 -15 15 q -3 15 -3 0",
				"arcto", x, y+h, x, y, r,
				"arcto", x, y, x+w, y, r,
				") [", (this.full ? "shadow black 4 4 0 f" : "f"), "] lw 0.5 s ]")
			worldwrite(this.text, settings.tstyles.bubble)
			UFX.draw("]")
		},
	})




