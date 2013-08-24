
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

var IsRectangular = {
	init: function (w, h) {
		this.w = w
		this.h = h
		this.collides = true
	},
	scootch: function (obj) {
		var dx = obj.x - this.x, dy = obj.y - this.y
		if (dx < -obj.r || dx > this.w + obj.r || dy < -obj.r || dy > this.h + obj.r) return
		if (0 <= dx && dx < this.w) {
			if (dy < this.h/2) obj.y = Math.min(obj.y, this.y - obj.r)
			else obj.y = Math.max(obj.y, this.y + this.h + obj.r)
		} else if (0 <= dy && dy < this.h) {
			if (dx < this.w/2) obj.x = Math.min(obj.x, this.x - obj.r)
			else obj.x = Math.max(obj.x, this.x + this.w + obj.r)
		} else {
			for (var j = 0 ; j < 4 ; ++j) {
				var Dx = dx - [0, 0, this.w, this.w][j], Dy = dy - [0, this.h, 0, this.h][j]
				if (Dx * Dx + Dy * Dy >= obj.r * obj.r) continue
				var d = Math.sqrt(Dx * Dx + Dy * Dy), dd = obj.r * 1.01 - d
				obj.x += Dx * dd / d
				obj.y += Dy * dd / d
			}
		}
	},
}


var FollowsPerson = {
	draw: function () {
		UFX.draw("t", this.person.x, this.person.y)
	},
}




function Tree(x, y, r) {
	this.x = x
	this.y = y
	this.r = r
	frontscenery.push(this)
	this.xs = []
	this.ys = []
	var s = UFX.random.seed
	UFX.random.setseed([this.x, this.y])
	for (var j = 0 ; j < 7 ; ++j) {
		this.xs.push(Math.cos(j * 3/7 * tau) + UFX.random(-0.1, 0.1))
		this.ys.push(Math.sin(j * 3/7 * tau) + UFX.random(-0.1, 0.1))
	}
	UFX.random.setseed(s)
}
Tree.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp({
		draw: function () {
			var xs = this.xs, ys = this.ys
			UFX.draw("[ z", 4 * this.r, 4 * this.r, "( m", xs[0], ys[0])
			for (var j = 0 ; j < 7 ; ++j) {
				var k = (j+1) % 7
				UFX.draw("c", xs[j]-ys[j]/2, ys[j]+xs[j]/2, xs[k]+ys[k]/2, ys[k]-xs[k]/2, xs[k], ys[k])
			}
			UFX.draw(") ] fs #0a0 f ss #0f0 lw 0.2 f s")
		}
	})


function House(x, y, w, h) {
	this.x = x
	this.y = y
	this.w = w
	this.h = h
	frontscenery.push(this)
}
House.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRectangular)
	.addcomp({
		draw: function () {
			var a = Math.min(this.w, this.h) / 2
			UFX.draw(
				"[ b rr", -0.5, -0.5, this.w + 1, this.h + 1, 0.5, "clip",
				"fs red fr -1 -1", this.w + 2, this.h + 2,
				"( m -1", this.h + 1, "l", a, this.h - a, "l", this.w - a, a, "l", this.w + 1, -1,
				"l", this.w + 1, this.h + 1, ") fs rgba(0,0,0,0.3) f",
				"( m", this.w + 1, this.h + 1, "l", this.w - a, this.h - a, "l", a, a, "l", -1, -1,
				"l", -1, this.h + 1, ") fs rgba(0,0,0,0.1) f",
			"]")
		}
	})


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




