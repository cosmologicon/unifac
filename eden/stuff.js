// AFTER LITTLE CONSIDERATION I HAVE DECIDED THAT THE CONVENTION FOR THIS GAME WILL BE
// THAT "DOWN" IS THE POSITIVE Y DIRECTION AND "UP" IS THE NEGATIVE Y DIRECTION. SO BE IT.


var WorldBound = {
	draw: function () {
		UFX.draw("t", this.x, this.y)
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
		draw: function () {
			UFX.draw("( m 30 -50 l -30 -70 l -30 -30 ) fs red f")
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
	.addcomp(ActionRadius, 10)
	.addcomp({
		draw: function () {
			UFX.draw("( m 0 20 l 10 0 l 0 -20 l -10 0 ) fs green f")
		},
		interact: function (obj) {
			if (!obj.state.greedy) return
			obj.nextstate = HopState
		},
	})

