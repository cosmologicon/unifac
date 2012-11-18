var frameoffsets = {
	stand: [94, 150],
	run0: [84, 145],
	run1: [84, 150],
	run2: [84, 145],
	nab0: [94, 150],
	nab1: [94, 150],
	nab2: [94, 150],
	nab3: [94, 150],
	skynab0: [94, 150],
	skynab1: [94, 150],
	skynab2: [94, 150],
	skynab3: [94, 150],
	bound: [94, 150],
	dart: [94, 150],
	roll: [94, 150],
	twirl0: [84, 150],
	twirl1: [84, 150],
	twirl2: [84, 150],
	twirl3: [84, 150],
	
	blue0: [36, 36],
	blue1: [36, 36],
	yellow0: [36, 36],
	yellow1: [36, 36],
	red0: [36, 36],
	red1: [36, 36],
	green0: [36, 36],
	green1: [36, 36],
	grey0: [36, 36],
	grey1: [36, 36],
	purple0: [36, 36],
	purple1: [36, 36],
	white0: [36, 36],
	white1: [36, 36],

	bfairy: [36, 36],
	rfairy: [36, 36],
	gfairy: [36, 36],

	headm: [-100, -40],
	heade: [-500, -40],
	heads: [-500, -40],
	headv: [-500, -40],
}

function drawframe(fname, hflip) {
	UFX.draw("[")
	if (hflip) UFX.draw("hflip")
	var off = frameoffsets[fname]
	UFX.draw("drawimage", UFX.resource.images[fname], -off[0], -off[1], "]")
}


var WorldBound = {
	draw: function () {
		UFX.draw("t", this.x, -this.y)
	},
}

var BoxConstrain = {
	init: function (xborder, yborder) {
		this.xborder = xborder || 0
		this.yborder = yborder || 0
	},
	think: function (dt) {
		this.x = clip(this.x, this.xborder, vista.vx - this.xborder)
		this.y = clip(this.y, this.yborder, vista.vy - this.yborder)
	},
}

var DrawSprite = {
	init: function () {
		this.frame = null
	},
	draw: function () {
		drawframe(this.frame, !this.facingright)
	},
}

var Flutters = {
	flutter: function () {
		var theta = UFX.random(6.283)
		this.vx = this.info.vx0 * Math.cos(theta)
		this.vy = this.info.vy0 * Math.sin(theta)
	},
	think: function (dt) {
		if (UFX.random(this.info.ftime) < dt) this.flutter()
		if (this.flaps) {
			this.tflap += dt * UFX.random(0.8, 1.2)
			this.frame = this.info.name + (Math.floor(this.tflap / 0.1) % 2)
		} else {
			this.frame = this.info.name
		}
		this.x += this.vx * dt
		this.y = clip(this.y + this.vy * dt, this.info.ymin, this.info.ymax)
		this.facingright = this.vx < 0 // TODO: flip all the butterfly images so they're facing right
	},
}

function Butterfly(info) {
	this.info = info
	this.flaps = this.info.name.indexOf("fairy") == -1  // fairies don't flap
	this.tflap = UFX.random(1)
	this.x = UFX.random(vista.xmin, vista.vx)
	this.y = UFX.random(this.info.ymin, this.info.ymax)
	this.flutter()
}

Butterfly.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Flutters)
	.addcomp(BoxConstrain)
	.addcomp(DrawSprite)




