var LastPos = {
	construct: function (args) {
		this.lastx = args.x
		this.lasty = args.y
	},
}

var WorldBound = {
	construct: function (args) {
		this.x = args.x
		this.y = args.y
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var ParentBound = {
	construct: function (args) {
		this.x = args.x
		this.y = args.y
		this.parent = null
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
	think: function (dt) {
		this.lasty = this.y
	},
	resolveparent: function (parents) {
		for (var j = 0 ; j < parents.length ; ++j) {
			var parent = parents[j]
			if (parent === this.parent) continue
			if (parent.catches(this)) this.parent = parent
		}
		if (this.parent && !this.parent.holds(this)) {
			this.parent = null
		}
		if (this.parent) {
			this.parent.constrainchild(this)
		}
	},
}

var Moves = {
	construct: function (args) {
		this.vx = args.vx || 0
		this.vy = args.vy || 0
	},
	think: function (dt) {
		this.x += dt * this.vx
		this.y += dt * this.vy
	},
}

var Falls = {
	think: function (dt) {
		if (!this.parent) {
			this.vy -= dt * settings.g
		}
	},
}


var BlockDraw = {
	construct: function (args) {
		this.dx = args.dx
		this.dy = args.dy
		this.color = UFX.random.color()
	},
	draw: function () {
		UFX.draw("fs", this.color, "fr 0 0", this.dx, this.dy)
	},
}

var Blocks = {
	blocks: function (obj) {
		var dx = obj.x - this.x, dy = obj.y - this.y
		return 0 <= dx && dx <= this.dx && 0 <= dy && dy <= this.dy
	},
}

var PlatformDraw = {
	construct: function (args) {
		this.dx = args.dx
		this.color = UFX.random.color()
	},
	draw: function () {
		UFX.draw("ss", this.color, "lw 0.2 b m 0 0 l", this.dx, "0 s")
	},
}

var CircleDraw = {
	construct: function (args) {
		this.color = UFX.random.color()
		this.r = args.r || 0.2
	},
	draw: function () {
		UFX.draw("fs", this.color, "b o 0 0", this.r, "f")
	},
}	

var ProvidesPlatform = {
	catches: function (obj) {
		if (this.lasty >= obj.lasty) return false
		if (this.y < obj.y) return false
		var dx = obj.x - this.x
		return 0 <= dx && dx <= this.dx && obj.vy <= this.vy
	},
	holds: function (obj) {
		return obj.x >= this.x && obj.x <= this.x + this.dx
	},
	constrainchild: function (child) {
		child.y = this.y
		child.vy = this.vy
	},
}

function Block(x, y, dx, dy) {
	this.construct({
		x: x,
		y: y,
		dx: dx,
		dy: dy,
	})
}
Block.prototype = UFX.Thing()
	.addcomp(LastPos)
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(BlockDraw)
	.addcomp(ProvidesPlatform)

function Platform(x, y, dx) {
	this.construct({
		x: x,
		y: y,
		dx: dx,
	})
}
Platform.prototype = UFX.Thing()
	.addcomp(LastPos)
	.addcomp(WorldBound)
	.addcomp(Moves)
	.addcomp(PlatformDraw)
	.addcomp(ProvidesPlatform)

function You(x, y) {
	this.construct({
		x: x,
		y: y,
	})
}
You.prototype = UFX.Thing()
	.addcomp(LastPos)
	.addcomp(ParentBound)
	.addcomp(Moves)
	.addcomp(Falls)
	.addcomp(CircleDraw)



