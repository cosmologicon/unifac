
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

var AnchorTopRight = {
	init: function (dx, dy) {
		this.x = dx || 0 ; this.y = dy || 0
	},
	draw: function () {
		UFX.draw("textalign right textbaseline top t", this.x, this.y)
	},
}
var AnchorBottomLeft = {
	init: function (dx, dy) {
		this.x = dx || 0 ; this.y = dy || 0
	},
	draw: function () {
		UFX.draw("textalign left textbaseline bottom t", this.x, this.y)
	},
}
var AnchorBottomRight = {
	init: function (dx, dy) {
		this.x = dx || 0 ; this.y = dy || 0
	},
	draw: function () {
		UFX.draw("textalign right textbaseline bottom t", this.x, this.y)
	},
}
var AnchorCenter = {
	init: function (dx, dy) {
		this.x = dx || 0 ; this.y = dy || 0
	},
	draw: function () {
		UFX.draw("textalign center textbaseline middle t", this.x, this.y)
	},
}
var AnchorBottomCenter = {
	init: function (dx, dy) {
		this.x = dx || 0 ; this.y = dy || 0
	},
	draw: function () {
		UFX.draw("textalign center textbaseline bottom t", this.x, this.y)
	},
}


var DelayEntry = {
	init: function (tenter) {
		this.tenter = tenter || 0
		this.entertick = 0
		this.setmethodmode("think", "any")
		this.setmethodmode("draw", "any")
	},
	think: function (dt) {
		this.entertick += dt
		return this.entertick < this.tenter
	},
	draw: function () {
		return this.entertick < this.tenter
	},
}
	
var Float = {
	init: function (vy) {
		this.vy = vy
	},
	think: function (dt) {
		this.y += this.vy * dt
	},
}
var Decelerate = {
	init: function (tdecel) {
		this.tdecel = tdecel || 0.4
	},
	think: function (dt) {
		this.vy *= Math.exp(-dt * this.tdecel)
	},
}
var FadeOut = {
	init: function (t, delay) {
		this.tfade = t || 1
		this.fadedelay = delay || 0
		this.fadetimer = 0
	},
	think: function (dt) {
		this.fadetimer += dt
		this.dead = this.fadetimer > this.tfade + this.fadedelay
	},
	draw: function () {
		context.globalAlpha = clip(1 - (this.fadetimer - this.fadedelay) / this.tfade, 0, context.globalAlpha)
	},
}
var FadeIn = {
	init: function (t) {
		this.tfadein = t || 1
		this.fadeintimer = 0
	},
	think: function (dt) {
		this.fadeintimer += dt
	},
	draw: function () {
		context.globalAlpha = clip(this.fadeintimer / this.tfadein, 0, context.globalAlpha)
	},
}
var ZoomIn = {
	init: function (t, zfactor) {
		this.tzoomin = t || 1
		this.zoominfactor = zfactor || 2
		this.zoomintimer = 0
	},
	think: function (dt) {
		this.zoomintimer += dt
	},
	draw: function () {
		var s = Math.exp(this.zoominfactor * clip(1 - this.zoomintimer / this.tzoomin, 0, 1))
		context.scale(s, s)
	},
}
var FlyAcross = {
	init: function (vx0, vx1, span) {
		this.flyvx0 = vx0 || 100
		this.flyvx1 = vx1 || 5000
		this.flyspan = span || 0.4
		this.tfly = -this.flyspan - 0.3
	},	
	think: function (dt) {
		this.tfly += dt
		this.flydx = this.tfly * this.flyvx0
		if (Math.abs(this.tfly) > this.flyspan)
			this.flydx += (this.tfly > 0 ? 1 : -1) * (Math.abs(this.tfly) - this.flyspan) * this.flyvx1
		this.dead = this.tfly > this.flyspan + 0.3
	},
	draw: function () {
		context.translate(this.flydx, 0)
	},
}
var WobbleIn = {
	init: function (tau, beta) {
		this.wobblet = 0
		this.wobbletau = tau || 0.3
		this.wobblebeta = beta || 0.03
	},
	think: function (dt) {
		this.wobblet += dt
	},
	draw: function () {
		var s = 1 + 0.8 * Math.exp(-this.wobblet / this.wobbletau) * Math.sin(this.wobblet / this.wobblebeta)
		UFX.draw("z", s, 1/s)
	},
}
var ZoomOnChange = {
	init: function (zfactor, ztime) {
		this.zfactor = zfactor || 1.2
		this.ztime = ztime || 0.25
		this.ztick = 0
	},
	settext: function (text) {
		if (text != this.text) this.ztick = this.ztime
	},
	think: function (dt) {
		this.ztick -= dt
	},
	draw: function () {
		if (this.ztick > 0) context.scale(this.zfactor, this.zfactor)
	},
}



var ActionHUD = {
	effects: [
		// progress indicator
		UFX.Thing()
		.addcomp(AnchorBottomRight, settings.sx - 5, settings.sy)
		.addcomp(FillStroke, "bold 44px 'Norican'", "silver", "black", 1.5)
		.addcomp(ZoomOnChange)
		.addcomp(NoCache)
		.addcomp({
			think: function (dt) { this.settext("\u00A3" + gamestate.catchamount + "/" + gamestate.goal) },
		}),
		// countdown indicator
		UFX.Thing()
		.addcomp(AnchorBottomRight, settings.sx * 0.73, settings.sy - 5)
		.addcomp(FillStroke, "bold italic 40px 'Shojumaru'", "rgb(32,255,32)", "black", 1.5)
		.addcomp({
			think: function (dt) {
				var t = gamestate.time
				this.settext(t > 0 ? "TIME:" + Math.floor(t) : "")
				this.fstyle = t > 10 ? "rgb(32,255,32)" : "rgb(255,32,32)"
			},
			draw: function () {
				if (gamestate.time < 10) context.scale(1.2, 1.2)
			},
		})
		.addcomp(NoCache),
		// height indicator
		UFX.Thing()
		.addcomp(AnchorBottomLeft, 10, settings.sy)
		.addcomp(FillStroke, "bold 60px 'Kaushan Script'", "rgb(200,200,255)", "black", 1.5)
		.addcomp(NoCache)
		.addcomp({
			think: function (dt) {
				var h = Math.floor(You.y / 25)
				this.settext("" + h + "ft")
				gamestate.checkheightrecord(h)
			},
		}),
		// combo indicator
		UFX.Thing()
		.addcomp(AnchorBottomCenter, settings.sx * 0.32, settings.sy)
		.addcomp(FillStroke, "bold 40px 'Contrail One'", "yellow", "black", 1.5)
		.addcomp(ZoomOnChange, 1.5)
		.addcomp(NoCache)
		.addcomp({
			think: function (dt) {
				var c = gamestate.combocount
				this.settext(c > 1 ? "" + c + "xCombo" : "")
			},
		}),
		// Feat listings
		UFX.Thing()
		.addcomp(AnchorTopRight, 110, 4)
		.addcomp({
			draw: function () {
				context.font = "bold 32px 'Marko One'"
				context.fillStyle = "rgb(255,200,200)"
				context.strokeStyle = "black"
				for (var j = 0 ; j < mechanics.featnames.length ; ++j) {
					var fname = mechanics.featnames[j]
					if (!record.knownfeats[fname]) continue
					UFX.draw("[ t 0", 30*j)
					context.fillText(fname, 0, 0)
					context.strokeText(fname, 0, 0)
					UFX.draw("]")
				}
				UFX.draw("[ alpha 0.5 t 23 6 fs black ss white lw 2 b")
				for (var j = 0 ; j < mechanics.featnames.length ; ++j) {
					var fname = mechanics.featnames[j]
					if (!record.knownfeats[fname]) continue
					for (var k = gamestate.bars[fname] ; k < record.knownfeats[fname] ; ++k) {
						UFX.draw("[ t", 18*k, 30*j, "m 0 0 l 16 0 l 16 26 l 0 26 l 0 0 ]")
					}
				}
				UFX.draw("f s fs red b")
				for (var j = 0 ; j < mechanics.featnames.length ; ++j) {
					var fname = mechanics.featnames[j]
					if (!record.knownfeats[fname]) continue
					for (var k = 0 ; k < gamestate.bars[fname] ; ++k) {
						UFX.draw("[ t", 18*k, 30*j, "m 0 0 l 16 0 l 16 26 l 0 26 l 0 0 ]")
					}
				}
				UFX.draw("f s ]")
			},
		})
		.definemethod("think"),
		
	],
	levelinit: function () {
		var linfo = mechanics.levelinfo[gamestate.level]
		var names = [
			settings.levelnames[gamestate.level-1][0],
			"Collect",
			"\u00A3" + linfo.goal + " in " + linfo.t + "s"
		]
		for (var j = 0 ; j < 3 ; ++j) {
			var StageName =	UFX.Thing()
				.addcomp(DelayEntry, 0.1 + 0.15 * j)
				.addcomp(AnchorCenter, settings.sx * 0.5 + [-100, 0, 100][j], settings.sy * 0.5 + [-110, 0, 110][j])
				.addcomp(FillStroke, "140px 'Ceviche One'", "rgb(200,255,200)", "black", 2)
				.addcomp(FlyAcross, [-100, 100, -100][j], [-3000, 3000, -3000][j], 0.6)
//				.addcomp({ draw: function () { context.scale(1.3, 1) } })
				.addcomp(NoCache)
			StageName.settext(names[j])
			this.effects.push(StageName)
		}
		for (var j = 0 ; j < 3 ; ++j) {
			var Directive = UFX.Thing()
				.addcomp(DelayEntry, 2 + 0.3 * j)
				.addcomp(AnchorCenter, settings.sx * 0.5, settings.sy * 0.5)
				.addcomp(ZoomIn, 0.2, 2)
				.addcomp(FadeIn, 0.2)
				.addcomp(FadeOut, 0.2, 0.2)
				.addcomp(FillStroke, "italic 240px 'Bangers'", "red", "black", 3)
				.addcomp(NoCache)
			Directive.settext(["READY", "SET", "COLLECT"][j])
			this.effects.push(Directive)
		}
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
		this.effects.push(new CashEffect(c, settings.sx * 0.3 - 65, settings.sy - 20))
	},
	addheightcasheffect: function (c) {
		this.effects.push(new CashEffect(c, 50, settings.sy - 20))
	},
}

var WorldEffects = {
	effects: [],
	levelinit: function () {
		this.effects = []
	},
	think: function (dt) {
		this.effects.forEach(function (e) { e.think(dt) })
		this.effects = this.effects.filter(function (e) { return !e.dead })
	},
	draw: function () {
		function draw(e) { context.save() ; e.draw() ; context.restore() }
		this.effects.forEach(draw)
	},
	addcasheffect: function (v, x, y) {
		x = clip(x, vista.xmin + 40, vista.vx - 40)
		this.effects.push(new WorldCashEffect(v, x, y))
	},
}


function CashEffect(amount, x, y) {
	this.settext("\u00A3" + amount)
	this.x = x
	this.y = y
}
CashEffect.prototype = UFX.Thing()
	.addcomp(AnchorCenter)
	.addcomp(Float, -300)
	.addcomp(Decelerate, 5)
	.addcomp(FadeOut, 0.5)
	.addcomp(FillStroke, "bold 40px 'Norican'", "white", "black", 1)
	.addcomp(NoCache)

function WorldCashEffect(amount, x, y) {
	this.settext("\u00A3" + amount)
	this.x = x
	this.y = y
}
WorldCashEffect.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Float, 500)
	.addcomp(Decelerate, 5)
	.addcomp(FadeOut, 0.8)
	.addcomp(FillStroke, "bold 40px 'Norican'", "white", "black", 1)
	.addcomp(NoCache)


