
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
	draw: function () {
		UFX.draw("textalign left textbaseline bottom")
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


var ActionHUD = {
	bankindicator: UFX.Thing()
		.addcomp(AnchorBottomRight, settings.sx - 5, settings.sy - 5)
		.addcomp(FillStroke, "bold 40px sans-serif", "white", "black", 2)
		.addcomp(NoCache)
		.addcomp({
			think: function (dt) { this.settext("\u00A3" + gamestate.catchamount + "/" + gamestate.goal) }
		})
	,
	levelinit: function () {
	},
	think: function (dt) {
		this.bankindicator.think(dt)
	},
	draw: function () {
		function draw(e) { context.save() ; e.draw() ; context.restore() }
		draw(this.bankindicator)
	},
}



