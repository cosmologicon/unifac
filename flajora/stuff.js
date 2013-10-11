
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
var Expires = {
	init: function (lifetime) {
		this.lifetime = lifetime || 1
		this.tlife = lifetime
	},
	think: function (dt) {
		if (this.tlife <= 0) return
		this.tlife -= dt
		if (this.tlife <= 0) {
			this.die()
		}
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
		var d = Math.sqrt(dx * dx + dy * dy), dd = dr * 1.001 - d
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
		if (dx <= -obj.r || dx >= this.w + obj.r || dy <= -obj.r || dy >= this.h + obj.r) return
		if (0 < dx && dx < this.w) {
			if (dy < this.h/2) obj.y = Math.min(obj.y, this.y - obj.r)
			else obj.y = Math.max(obj.y, this.y + this.h + obj.r)
		} else if (0 < dy && dy < this.h) {
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
			if (!camera.onscreen(this.x, this.y, 4 * this.r + 4)) return
			var xs = this.xs, ys = this.ys
			UFX.draw("[ z", 4 * this.r, 4 * this.r, "( m", xs[0], ys[0])
			for (var j = 0 ; j < 7 ; ++j) {
				var k = (j+1) % 7
				UFX.draw("c", xs[j]-ys[j]/2, ys[j]+xs[j]/2, xs[k]+ys[k]/2, ys[k]-xs[k]/2, xs[k], ys[k])
			}
			UFX.draw(") ] fs #0a0 f ss #0f0 lw 0.2 f s")
		}
	})

function Rock(x, y, r, vx, vy) {
	this.x = this.x0 = x
	this.y = this.y0 = y
	this.A = UFX.random(tau)
	this.phi = UFX.random(2, 4)
	this.r = r
	this.vx = vx
	this.vy = vy
	this.t = 0
}
Rock.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp({
		draw: function () {
			if (!camera.onscreen(this.x, this.y, this.r + 2)) return
			UFX.draw("b o 0 0", this.r, "lw 0.5 fs red ss darkred f s")
		},
		think: function (dt) {
			this.A += dt * this.phi
			this.t += dt
			this.x = this.x0 + this.vx * this.t
			this.y = this.y0 + this.vy * this.t - 4 * Math.abs(Math.sin(this.A))
		},
	})

function Bulkhead(x, y, w, h, dx, dy, A) {
	this.x = this.x0 = x - w/2
	this.y = this.y0 = y - h/2
	this.w = w
	this.h = h
	this.dx = dx
	this.dy = dy
	this.A = A
	this.phi = UFX.random(2, 4)
	this.t = 0
}
Bulkhead.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp({
		init: function () {
			this.setmethodmode("scootch", "any")
		},
		// Don't push players up, that makes it too easy
		scootch: function (obj) {
			if (-Math.sin(this.A) * this.dy < 0) return true
		},
		draw: function () {
			UFX.draw("[ b rr", -0.5, -0.5, this.w + 1, this.h + 1, 0.5, "fs gray ss darkgray f s ]")
		},
		think: function (dt) {
			this.A += dt * this.phi
			this.t += dt
			this.x = this.x0 + Math.sin(this.A) * this.dx
			this.y = this.y0 + Math.cos(this.A) * this.dy
		},
	})
	.addcomp(IsRectangular)

function WindTunnel(x, y, w, h) {
	this.x = x
	this.y = y
	this.w = w
	this.h = h
	this.vy = UFX.random(0, 40)
	this.t = 0
	this.p = 0
	this.dots = UFX.random.spread(10)
}
WindTunnel.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp({
		scootch: function (obj) {
		},
		draw: function () {
			if (this.vy < 5) return
			var p = this.p, w = this.w, h = this.h
			UFX.draw("fs #afa")
			this.dots.forEach(function (dot) {
				var x = dot[0] * w, y = (p + dot[1] * h) % h
				UFX.draw("b o", x, y, "0.2 f")
			})
		},
		think: function (dt) {
			this.p += dt * this.vy
			this.t += dt
			while (this.t > 1) {
				this.t -= 1
				this.vy = UFX.random(0, 40)
				if (this.vy < 10) this.vy = 0
			}
			var dx = you.x - this.x, dy = you.y - this.y
			if (0 <= dx && dx < this.w && 0 <= dy && dy < this.h) {
				you.y += dt * this.vy
			}
		},
	})



function House(x, y, w, h) {
	this.x = x
	this.y = y
	this.w = w
	this.h = h
	frontscenery.push(this)
	var s = UFX.random.seed
	UFX.random.setseed([x, y, w, h])
	this.color = UFX.random.choice(["red", "white", "gray", "blue", "green", "orange", "pink"])
	UFX.random.setseed(s)
}
House.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRectangular)
	.addcomp({
		draw: function () {
			if (!camera.onscreen(this.x, this.y, this.w + this.h)) return
			var a = Math.min(this.w, this.h) / 2
			UFX.draw(
				"[ b rr", -0.5, -0.5, this.w + 1, this.h + 1, 0.5, "clip",
				"fs", this.color, "fr -1 -1", this.w + 2, this.h + 2,
				"( m -1", this.h + 1, "l", a, this.h - a, "l", this.w - a, a, "l", this.w + 1, -1,
				"l", this.w + 1, this.h + 1, ") fs rgba(0,0,0,0.3) f",
				"( m", this.w + 1, this.h + 1, "l", this.w - a, this.h - a, "l", a, a, "l", -1, -1,
				"l", -1, this.h + 1, ") fs rgba(0,0,0,0.1) f",
			"]")
		}
	})

function Lake(x, y, r) {
	this.x = x
	this.y = y
	this.r = r
	backscenery.push(this)
	this.color = UFX.draw.radgrad(0, 0, 0, 0, 0, this.r + 1, 0, "#00f", 1, "#88f")
}
Lake.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp({
		init: function () {
			this.setmethodmode("scootch", "any")
		},
		draw: function () {
			UFX.draw(
				"[ b o 0 0", this.r + 1, "fs", this.color, "f ]"
			)
		},
		scootch: function (obj) {
			return (obj === you && items.airbag)
		},
	})
	.addcomp(IsRound)

function Vortex(x, y, r, A, R, phi) {
	this.x0 = this.x = x
	this.y0 = this.y = y
	this.r = r
	this.A = A
	this.R = R
	this.phi = phi
	this.color = UFX.draw.radgrad(0, 0, 0, 0, 0, this.r + 1, 0, "black", 1, "rgba(0,0,0,0)")
}
Vortex.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp({
		think: function (dt) {
			this.A += this.phi * dt
			this.x = this.x0 + this.R * Math.sin(this.A)
			this.y = this.y0 + this.R * Math.cos(this.A)
			
			var dx = you.x - this.x, dy = you.y - this.y
			if (dx * dx + dy * dy < this.r * this.r) {
				var d = Math.sqrt(dx * dx + dy * dy)
				var v = 20 * (2 - d / this.r)
				you.x -= dt * v * dx / d
				you.y -= dt * v * dy / d
			}
		},
		draw: function () {
			UFX.draw(
				"[ b o 0 0", this.r + 1, "fs", this.color, "f ]"
			)
		},
		scootch: function (obj) {
		},
	})

function Train(x, y) {
	this.x = x - this.w / 2
	this.y = y - this.h / 2
	this.leaving = false
	this.vx = 0
	this.t = 0
	frontscenery.push(this)
}
Train.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp({
		init: function () {
			this.setmethodmode("scootch", "any")
		},
		draw: function () {
			UFX.draw("[ fs darkgrey ss black lw 0.2",
				"b rr -0.5 -0.5", this.w+1, this.h+1, "0.5 f s",
				"b rr", this.w/3, -1, this.w/3, this.h+2, "0.1 f s",
			"]")
		},
		scootch: function (obj) {
			return this.leaving || obj.hasticket || (obj === you && items.ticket)
		},
		contains: function (obj) {
			var dx = obj.x - this.x, dy = obj.y - this.y
			return 0.5 < dx && dx < this.w - 0.5 && 0.5 < dy && dy < this.h - 0.5
		},
		think: function (dt) {
			this.t += dt
			if (!this.leaving) {
				if (this.contains(quests.train.traveller)) {
					this.leaving = true
					quests.train.traveller.x = 100000
					quests.train.traveller.target = null
				} else if (this.contains(you)) {
					you.invisible = true
					UFX.scenes.game.fadeto("desert")
					this.leaving = true
				} else if (this.t > 7) {
					this.leaving = true
				}
			}
			if (this.leaving) {
				this.vx += 50 * dt
				this.x += this.vx * dt
			}
		},
	})
	.addcomp(IsRectangular, 20, 6)


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



function Placename(text) {
	this.text = text
	hudeffects.push(this)
	this.ttrans = 1
}
Placename.prototype = UFX.Thing()
	.addcomp(Transitions)
	.addcomp(Fades)
	.addcomp(Expires, 1)
	.addcomp({
		draw: function () {
			write(this.text, 0.5, 0.8, settings.tstyles.place)
		},
	})




