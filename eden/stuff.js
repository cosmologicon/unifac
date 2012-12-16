// AFTER LITTLE CONSIDERATION I HAVE DECIDED THAT THE CONVENTION FOR THIS GAME WILL BE
// THAT "DOWN" IS THE POSITIVE Y DIRECTION AND "UP" IS THE NEGATIVE Y DIRECTION. SO BE IT.


var WorldBound = {
	draw: function (con) {
		UFX.draw(con || context, "t", this.x, this.y)
	},
}

var Tilts = {
	init: function (A) {
		this.A = A || 0
	},
	draw: function () {
		UFX.draw("r", this.A)
	},
}

var FacesDirection = {
	init: function () {
		this.facingright = true
	},
	draw: function () {
		if (!this.facingright) UFX.draw("hflip")
	},
}

var KeepsLastPosition = {
	think: function (dt) {
		this.oldx = this.x
		this.oldy = this.y
	},
}

var ActionRadius = {
	init: function (r) {
		this.r = r || 0
	},
	withinrange: function (obj) {
		var dx = obj.x - this.x, dy = obj.y - this.y + this.h
		return dx * dx + dy * dy < this.r * this.r
	},
}


// A sign that will turn a blob back the other way
function Turner(x, y, right, platform) {
	this.x = x
	this.y = y
	this.facingright = right
	this.A = 0
	this.h = 50
	this.platform = platform
	if (platform) {
		var p = platform.constrain(this.x, this.y)
		this.x = p[0] ; this.y = p[1]
		this.A = platform.A
	}
}
Turner.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Tilts)
	.addcomp(FacesDirection)
	.addcomp(ActionRadius, 50)
	.addcomp({
		init: function () {
			this.tracer = UFX.Tracer([
				"fs rgb(200,100,0) ss rgb(80,40,0) lw 2",
				"( m -3 0 l -5 -50 l 4 -49 l 3 0 ) f s",
				"( m -20 -12 l 20 -13 l 22 -39 l -23 -50 ) f s",
				"( m 16 -26 l 5 -39 l 6 -30 l -18 -32 l -18 -20 l 6 -22 l 5 -14 ) fs rgb(255,100,100) ss rgb(144,0,0) lw 1 f s",
			], [-30, -55, 60, 60])
			this.rocktime = 0
		},
		think: function (dt) {
			this.rocktime += dt
		},
		draw: function () {
			var a = 0.2 * Math.sin(5 * this.rocktime)
			UFX.draw("z", 1, 1 + a*a, "xshear", a)
			this.tracer.draw(vista.scale)
		},
		interact: function (obj) {
			if (obj.facingright == this.facingright) return
			if (obj.state.defiant) return
			obj.facingright = this.facingright
			obj.vx = -obj.vx
		},
	})

// Gem that will attract the greedy blobbies
function Gem(x, y) {
	this.x = x
	this.y = y
	this.h = 20
}
Gem.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(ActionRadius, 30)
	.addcomp({
		init: function () {
			this.tracer = UFX.Tracer([
				"( m 0 40 l 20 0 l 0 -40 l -20 0 ) fs green f",
				"( m 0 -40 l 20 0 l -20 0 ) alpha 0.5 fs white f",
				"( m 0 -40 l 0 40 l -20 0 ) alpha 0.5 fs white f",
				"( m 0 20 l 10 0 l 0 -20 l -10 0 ) alpha 1 fs lightgreen f",
			], [-20, -40, 40, 80])
			this.gemtime = 0
		},
		think: function (dt) {
			this.gemtime += dt
		},
		draw: function () {
			UFX.draw("alpha", 0.5 + 0.1 * Math.sin(2 * this.gemtime))
			this.tracer.draw(vista.scale)
			var a = Math.sin(4 * this.gemtime), b = Math.cos(4 * this.gemtime)
			UFX.draw("alpha 1 fs rgb(0,255,0)")
			UFX.draw("r", 0.738 * this.gemtime)
			UFX.draw("b o", 60 * a, 10 * b, "2 f")
			UFX.draw("b o", -60 * a, -10 * b, "2 f")
			UFX.draw("b o", 10 * a, 60 * b, "2 f")
			UFX.draw("b o", -10 * a, -60 * b, "2 f")
		},
		interact: function (obj) {
			if (!obj.state.greedy) return
			obj.nextstate = HopState
		},
	})

