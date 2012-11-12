
// All effects of this type have a shared cache of text images
var FullCache = {
	init: function () {
		this.imgs = {}
	},
}

// Each instance effect of this type has its own single cached image
var SingleCache = {

}

var NoCache = {
	settext: function (text) {
		this.text = text
	},
	draw: function () {
		this.draw0()
	},
}


var FillStroke = {
	init: function (font, fstyle, sstyle, lwidth) {
		this.font = font
		this.fstyle = fstyle
		this.sstyle = sstyle
		this.lwidth = lwidth
	},
	draw0: function () {
		context.font = this.font
		if (this.fstyle) {
			context.fillStyle = this.fstyle
			context.fillText(this.text, 0, 0)
		}
		if (this.sstyle) {
			if (this.lwidth) context.lineWidth = this.lwidth
			context.strokeStyle = this.sstyle
			context.strokeText(this.text, 0, 0)
		}
	},
}

var AnchorBottomLeft = {
	init: function (dx, dy) {
		this.dx = dx || 0 ; this.dy = dy || 0
	},
	draw: function () {
		UFX.draw("textalign left textbaseline bottom t", this.dx, this.dy)
	},
}
var AnchorBottomRight = {
	init: function (dx, dy) {
		this.dx = dx || 0 ; this.dy = dy || 0
	},
	draw: function () {
		UFX.draw("textalign right textbaseline bottom t", this.dx, this.dy)
	},
}
var AnchorCenter = {
	init: function (dx, dy) {
		this.dx = dx || 0 ; this.dy = dy || 0
	},
	draw: function () {
		UFX.draw("textalign center textbaseline middle t", this.dx, this.dy)
	},
}
var AnchorBottomCenter = {
	init: function (dx, dy) {
		this.dx = dx || 0 ; this.dy = dy || 0
	},
	draw: function () {
		UFX.draw("textalign center textbaseline bottom t", this.dx, this.dy)
	},
}

var Float = {
	init: function (vy) {
		this.vy = vy
	},
	think: function (dt) {
		this.dy -= this.vy * dt
	},
}
var Fade = {
	init: function (t) {
		this.tfade = t || 1
		this.fadetimer = 0
	},
	think: function (dt) {
		this.fadetimer += dt
		this.dead = this.fadetimer > this.tfade
	},
	draw: function () {
		context.globalAlpha = clip(1 - this.fadetimer / this.tfade, 0, 1)
	},
}



var ActionHUD = {
	effects: [
		// progress indicator
		UFX.Thing()
		.addcomp(AnchorBottomRight, settings.sx - 5, settings.sy - 5)
		.addcomp(FillStroke, "bold 40px sans-serif", "white", "black", 2)
		.addcomp(NoCache)
		.addcomp({
			think: function (dt) { this.settext("\u00A3" + gamestate.catchamount + "/" + gamestate.goal) },
		}),
		// countdown indicator
		UFX.Thing()
		.addcomp(AnchorBottomRight, settings.sx * 0.8, settings.sy - 5)
		.addcomp(FillStroke, "bold 40px sans-serif", "rgb(32,255,32)", "black", 2)
		.addcomp(NoCache)
		.addcomp({
			think: function (dt) {
				var t = gamestate.time
				this.settext(t > 0 ? "time:" + Math.floor(t) : "")
				this.fstyle = t > 10 ? "rgb(32,255,32)" : "rgb(255,32,32)"
			},
		}),
		// height indicator
		UFX.Thing()
		.addcomp(AnchorBottomLeft, 10, settings.sy - 5)
		.addcomp(FillStroke, "bold 40px sans-serif", "blue", "black", 2)
		.addcomp(NoCache)
		.addcomp({
			think: function (dt) {
				var h = Math.floor(You.y / 25)
				this.settext("" + h + "ft")
			},
		}),
		// combo indicator
		UFX.Thing()
		.addcomp(AnchorBottomCenter, settings.sx * 0.35, settings.sy - 5)
		.addcomp(FillStroke, "bold 40px sans-serif", "yellow", "black", 2)
		.addcomp(NoCache)
		.addcomp({
			think: function (dt) {
				var c = gamestate.combocount
				this.settext(c > 1 ? "" + c + "xCombo" : "")
			},
		}),
		
	],
	levelinit: function () {
	},
	think: function (dt) {
		this.effects.forEach(function (e) { e.think(dt) })
		this.effects = this.effects.filter(function (e) { return !e.dead })
	},
	draw: function () {
		function draw(e) { context.save() ; e.draw() ; context.restore() }
		this.effects.forEach(draw)
	},

	addcombocasheffect: function (c) {
		this.effects.push(new CashEffect(c, settings.sx * 0.35, settings.sy - 20))
	},
}

function CashEffect(amount, x, y) {
	console.log(amount)
	this.settext("\u00A3" + amount)
	this.dx = x
	this.dy = y
}
CashEffect.prototype = UFX.Thing()
	.addcomp(AnchorCenter)
	.addcomp(Float, 70)
	.addcomp(Fade, 0.5)
	.addcomp(FillStroke, "bold 40px sans-serif", "white", "black", 2)
	.addcomp(NoCache)

