
// Each instance effect of this type has its own single cached image
var SingleCache = {
	init: function (imgw, imgh, imgedge) {
		this.img = document.createElement("canvas")
		this.imgedge = imgedge || 0
		this.imgw = imgw
		this.imgh = imgh
		this.img.width = this.imgw + 2 * this.imgedge
		this.img.height = this.imgh + 2 * this.imgedge
		this.context = this.img.getContext("2d")
	},
	settext: function (text) {
		if (this.text == text) return
		this.text = text
		UFX.draw(this.context, "c0")
		if (settings.tracecaches) {
			UFX.draw(this.context, "fs rgba(255,255,255,0.3) f0 ss red lw 4 sr 0 0", this.img.width, this.img.height)
		}
		UFX.draw(this.context, "[ t", this.imgedge + this.imgw * this.hafactor, this.imgedge + this.imgh * this.vafactor)
		this.align(this.context)
		this.draw0(this.context)
		UFX.draw(this.context, "]")
	},
	draw: function () {
		UFX.draw("[ t", -this.imgedge - this.imgw * this.hafactor, -this.imgedge - this.imgh * this.vafactor, "drawimage0", this.img, "]")
//		this.draw0()
	},
}

// All effects of this type have a shared cache of text images
var FullCache = {
	init: function (imgw, imgh, imgedge) {
		this.imgs = {}
		this.imgedge = imgedge || 0
		this.imgw = imgw
		this.imgh = imgh
	},
	settext: function (text) {
		if (this.text == text) return
		this.text = text
		if (!this.imgs[text]) {
			var img = this.imgs[text] = document.createElement("canvas")
			img.width = this.imgw + 2 * this.imgedge
			img.height = this.imgh + 2 * this.imgedge
			var con = img.getContext("2d")
			if (settings.tracecaches) {
				UFX.draw(con, "c0 fs rgba(255,255,255,0.3) f0 ss red lw 4 sr 0 0", img.width, img.height)
			}
			UFX.draw(con, "[ t", this.imgedge + this.imgw * this.hafactor, this.imgedge + this.imgh * this.vafactor)
			this.align(con)
			this.draw0(con)
			UFX.draw(con, "]")
		}
		this.img = this.imgs[text]
	},
	draw: function () {
		UFX.draw("[ t", -this.imgedge - this.imgw * this.hafactor, -this.imgedge - this.imgh * this.vafactor, "drawimage0", this.img, "]")
//		this.draw0()
	},
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
	draw0: function (con) {
		con = con || context
		con.font = this.font
		if (this.fstyle) con.fillStyle = this.fstyle
		if (this.sstyle) con.strokeStyle = this.sstyle
		if (this.lwidth) con.lineWidth = this.lwidth
		if (this.text.indexOf("|") > -1) {
			var lines = this.text.split("|")
			// Get the text size for multiple lines
			// Note: this method has all kinds of problems, but it should work with my data
			var tsize = this.font.split(" ").map(function (a) { return parseInt(a) }).filter(function (a) { return a })[0]
			con.save()
			con.translate(0, -this.vafactor * tsize * (lines.length - 1))
			for (var j = 0 ; j < lines.length ; ++j) {
				if (this.fstyle) con.fillText(lines[j], 0, 0)
				if (this.sstyle) con.strokeText(lines[j], 0, 0)
				con.translate(0, tsize)
			}
			con.restore()
		} else {
			if (this.fstyle) con.fillText(this.text, 0, 0)
			if (this.sstyle) con.strokeText(this.text, 0, 0)
		}
	},
}

function Anchor(valign, halign) {
	var hafactor = {left: 0, center: 0.5, right: 1}[halign]
	var vafactor = {bottom: 1, middle: 0.5, top: 0}[valign]
	return {
		init: function (x, y) {
			this.x = x || 0 ; this.y = y || 0
			this.hafactor = hafactor
			this.vafactor = vafactor
		},
		align: function (con) {
			UFX.draw(con || context, "textalign", halign, "textbaseline", valign)
		},
		draw: function () {
			this.align()
			UFX.draw("t", this.x, this.y)
		},
	}
}
var AnchorTopRight = Anchor("top", "right")
var AnchorBottomLeft = Anchor("bottom", "left")
var AnchorBottomRight = Anchor("bottom", "right")
var AnchorCenter = Anchor("middle", "center")
var AnchorBottomCenter = Anchor("bottom", "center")

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



function drawkey(keyname) {
	UFX.draw("[ fs white ss black lw 1 rr 0 0 26 26 5 f s t 13 13")
	if (!You.facingright) UFX.draw("hflip")
	if (keyname == "forward") UFX.draw("r 1.571")
	if (keyname == "back") UFX.draw("r -1.571")
	if (keyname != "act") UFX.draw("fs lightblue ss black lw 1 ( m 0 -11 l -8 0 l -2 -2 l -4 10 l 4 10 l 2 -2 l 8 0 ) f s")
	UFX.draw("]")
}


var ActionHUD = {
	effects: [
		// progress indicator
		UFX.Thing()
		.addcomp(AnchorBottomRight, settings.sx - 5, settings.sy + 3)
		.addcomp(FillStroke, "bold 44px 'Norican'", "silver", "black", 1.5)
		.addcomp(ZoomOnChange)
		.addcomp(SingleCache, 180, 60, 20)
		.addcomp({
			think: function (dt) { this.settext("\u00A3" + gamestate.catchamount + "/" + gamestate.goal) },
		}),
		// countdown indicator
		UFX.Thing()
		.addcomp(AnchorBottomRight, settings.sx * 0.73, settings.sy - 1)
		.addcomp(FillStroke, "bold italic 40px 'Shojumaru'", "rgb(32,255,32)", "black", 1.5)
		.addcomp({
			init: function () {
				this.grad0 = UFX.draw.lingrad(0, -40, 0, -30, 0, "rgb(32,255,32)", 0.5, "rgb(100,100,255)", 1, "rgb(32,255,32)")
			},
			think: function (dt) {
				var t = gamestate.time
				this.settext(t > 0 ? "TIME:" + Math.floor(t) : "")
				this.fstyle = t > 10 ? this.grad0 : "rgb(255,32,32)"
			},
			draw: function () {
				if (gamestate.time < 10) context.scale(1.2, 1.2)
			},
		})
		.addcomp(SingleCache, 180, 60, 20),
		// height indicator
		UFX.Thing()
		.addcomp(AnchorBottomLeft, 10, settings.sy + 7)
		.addcomp(FillStroke, "bold 60px 'Kaushan Script'",
			UFX.draw.lingrad(0, 0, 100, -100, 0, "blue", 0.2, "white", 0.4, "blue", 0.6, "white", 0.8, "blue", 1, "white"),
			"black", 1.5)
		.addcomp(FullCache, 160, 90)
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
		.addcomp(FillStroke, "bold 40px 'Contrail One'", UFX.draw.lingrad(0, -35, 0, -15, 0, "yellow", 0.5, "white", 1, "orange"), "black", 1.5)
		.addcomp(ZoomOnChange, 1.5)
		.addcomp(FullCache, 200, 90)
		.addcomp({
			think: function (dt) {
				var c = gamestate.combocount
				this.settext(c > 1 ? "" + c + "xCombo" : "")
			},
		}),
		// Feat listings
		UFX.Thing()
		.addcomp(AnchorTopRight, 84, 4)
		.addcomp({
			draw: function () {
				if (settings.hidefeatnames) {
					UFX.draw("t -82 0")
				}
				context.font = "bold 32px 'Marko One'"
				context.fillStyle = "rgb(255,200,200)"
				context.strokeStyle = "black"
				for (var j = 0 ; j < mechanics.featnames.length ; ++j) {
					var fname = mechanics.featnames[j]
					if (!record.knownfeats[fname]) continue
					UFX.draw("[ t 0", 30*j)
					if (!settings.hidefeatnames) {
						UFX.draw("[")
						if (fname == "bound") UFX.draw("xscale 0.75")
						context.fillText(fname, 0, 0)
						context.strokeText(fname, 0, 0)
						UFX.draw("]")
					}
					var keys = mechanics.feat[fname].keys.split(" ")
					if (keys.length == 1) {
						UFX.draw("t 17 7")
						drawkey(keys[0])
					} else {
						UFX.draw("t 4 7")
						drawkey(keys[0])
						UFX.draw("t 26 0")
						drawkey(keys[1])
					}
					UFX.draw("]")
				}
				var w = settings.hidefeatnames ? 7 : 16
				UFX.draw("[ alpha 0.5 t 60 7 fs black ss white lw 2 b")
				for (var j = 0 ; j < mechanics.featnames.length ; ++j) {
					var fname = mechanics.featnames[j]
					if (!record.knownfeats[fname]) continue
					for (var k = gamestate.bars[fname] ; k < record.knownfeats[fname] ; ++k) {
						UFX.draw("[ t", (w+2)*k, 30*j, "m 0 0 l", w, "0 l", w, "26 l 0 26 l 0 0 ]")
					}
				}
				UFX.draw("f s fs red b")
				for (var j = 0 ; j < mechanics.featnames.length ; ++j) {
					var fname = mechanics.featnames[j]
					if (!record.knownfeats[fname]) continue
					for (var k = 0 ; k < gamestate.bars[fname] ; ++k) {
						UFX.draw("[ t", (w+2)*k, 30*j, "m 0 0 l", w, "0 l", w, "26 l 0 26 l 0 0 ]")
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
		var rgrad = UFX.draw.lingrad(0, -100, 0, 100, 0, "yellow", 1, "red")
		var ggrad = UFX.draw.lingrad(0, 0, 0, 60, 0, "green", 1, "blue")
		for (var j = 0 ; j < 3 ; ++j) {
			var StageName =	UFX.Thing()
				.addcomp(DelayEntry, 0.1 + 0.15 * j)
				.addcomp(AnchorCenter, settings.sx * 0.5 + [-100, 0, 100][j], settings.sy * 0.5 + [-110, 0, 110][j])
				.addcomp(FillStroke, "140px 'Ceviche One'", ggrad, "black", 2)
				.addcomp(FlyAcross, [-100, 100, -100][j], [-3000, 3000, -3000][j], 0.6)
//				.addcomp({ draw: function () { context.scale(1.3, 1) } })
				.addcomp(SingleCache, 600, 100, 30)
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
				.addcomp(FillStroke, "italic 240px 'Bangers'", rgrad, "black", 3)
				.addcomp(SingleCache, 700, 300, 30)
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
		//UFX.draw("ss red lw 1 b m 0 388 l 800 388 s")
	},

	addcombocasheffect: function (c) {
		this.effects.push(new CashEffect(c, settings.sx * 0.3 - 65, settings.sy - 20))
	},
	addheightcasheffect: function (c) {
		this.effects.push(new CashEffect(c, 50, settings.sy - 20))
	},
	addproclamations: function (r) {
		for (var j = 0 ; j < r.length ; ++j) {
			this.effects.push(new Proclamation(r[j], j))
		}
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
	.addcomp(FullCache, 80, 60)

function WorldCashEffect(amount, x, y) {
	this.settext("\u00A3" + amount)
	this.x = x
	this.y = -y
}
WorldCashEffect.prototype = UFX.Thing()
	.addcomp(AnchorCenter)
	.addcomp(Float, -500)
	.addcomp(Decelerate, 5)
	.addcomp(FadeOut, 0.8)
	.addcomp(FillStroke, "bold 40px 'Norican'", "white", "black", 1)
	.addcomp(FullCache, 80, 60)

function Proclamation(text, delay) {
	this.settext(text)
	this.tenter = delay
}
Proclamation.prototype = UFX.Thing()
	.addcomp(DelayEntry, 0)
	.addcomp(AnchorCenter, settings.sx * 0.5, settings.sy * 0.7)
	.addcomp(ZoomIn, 0.2, 2)
	.addcomp(FadeIn, 0.2)
	.addcomp(FadeOut, 1.2, 0.2)
	.addcomp(FillStroke, "italic 80px 'Bangers'", UFX.draw.lingrad(0, -40, 0, 40, 0, "yellow", 1, "red"), "black", 2)
	.addcomp(FullCache, 700, 200)


