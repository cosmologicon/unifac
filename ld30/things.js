var WorldBound = {
	init: function (x, y) {
		this.x = x || 0
		this.y = y || 0
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var Circular = {
	init: function (color, r) {
		this.color = color || "blue"
		this.r = r || 0.2
	},
	draw: function () {
		UFX.draw("b o 0 0", this.r, "fs", this.color, "f")
	},
}

var SpansLength = {
	init: function (dx, dy, color) {
		this.dx = dx || 0
		this.dy = dy || 0
		this.color = color || "#077"
	},
	draw: function () {
		UFX.draw("b m 0 0 l", this.dx, this.dy, "lw 0.12 ss white s lw 0.09 ss", this.color, "s")
	},
}


function Toid(x, y) {
	if (!(this instanceof Toid)) return new Toid(x, y)
	this.x = x
	this.y = y
}
Toid.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Circular, "gray", 0.3)

function Bridge(toid0, toid1) {
	if (!(this instanceof Bridge)) return new Bridge(toid0, toid1)
	this.x = toid0.x
	this.y = toid0.y
	this.dx = toid1.x - toid0.x
	this.dy = toid1.y - toid0.y
}
Bridge.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(SpansLength)


