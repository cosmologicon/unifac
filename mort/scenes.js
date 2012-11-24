function showfps() {
    if (!settings.showfps) return
    var s = UFX.ticker.getfpsstr()
    UFX.draw("[ t 790 10 textalign right textbaseline top fs white ss black")
    context.font = "bold 44px monospace"
    context.fillText(s, 0, 0)
    context.strokeText(s, 0, 0)
    UFX.draw("]")
}

var LoadScene = Object.create(UFX.scene.Scene)

LoadScene.start = function () {
    this.f = 0
}

LoadScene.draw = function () {
	UFX.draw("fs rgb(20,0,20) fr 0 0", settings.sx, settings.sy, "fs rgb(200,0,200) ss black",
		"textalign center textbaseline middle")
	context.font = "80px 'Contrail One' sans-serif"
	var s = "Loading (" + Math.floor(this.f*100) + "%)..."
	context.fillText(s, settings.sx/2, settings.sy/2)
	context.strokeText(s, settings.sx/2, settings.sy/2)
	showfps()
}
LoadScene.onloading = function (f) {
    this.f = f
}

var TitleScene = Object.create(UFX.scene.Scene)

TitleScene.start = function () {
}

TitleScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

TitleScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.act) this.complete()
}

TitleScene.draw = function () {
	var grad0 = UFX.draw.lingrad(0, 0, 0, -30, 0, "red", 1, "rgb(255,100,100)")
	var grad1 = UFX.draw.lingrad(0, 0, 0, -80, 0, "red", 1, "rgb(255,100,100)")
	var grad2 = UFX.draw.lingrad(0, 0, 0, -20, 0, "red", 1, "rgb(255,100,100)")
	var grad3 = UFX.draw.lingrad(0, 0, 0, -40, 0, "blue", 1, "rgb(200,200,255)")
	UFX.draw("fs black f0 [ textbaseline bottom textalign center",
		"fs", grad0, "ss white",
		"t", settings.sx/2, settings.sy*0.3,
			"[ shadowcolor yellow shadowxy 1 1 font bold~40px~'Marcellus~SC' ft0 Mortimer~the ]",
		"fs", grad1, "ss white",
		"t 0 110",
			"[ shadowcolor yellow shadowxy 2 2 font 120px~'Marcellus~SC' ft0 Lepidopterist ]",
		"fs", grad2, "t 0 10 font 22px~'Marko~One' lw 0.5 ft0 Pyweek~edition",
		"[ t 250 40 fs grey font 26px~'Contrail~One' ft0 by~Christopher~Night",
		"t 0 30 ft0 Universe~Factory~games ]",
		"t 0 140 fs", grad3, "font 40px~'Bangers' ft0 press~space~or~enter",
	"]")
	showfps()
}

TitleScene.complete = function () {
	UFX.scene.push(record.maxvisited ? MapScene : CutScene)
}

var MapScene = Object.create(UFX.scene.Scene)

MapScene.start = function () {
	if (settings.unlockall) record.unlocked = settings.nlevels
	MapHUD.init()
	this.udseq = []
	playmusic("girl")
}

MapScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

MapScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	var dx = (kdown.right ? 1 : 0) - (kdown.left ? 1 : 0)
	if (dx) {
		gamestate.level = clip(gamestate.level + dx, 1, record.unlocked)
		this.udseq = []
	}
	if (kdown.up) this.udseq.push(0)
	if (kdown.down) this.udseq.push(1)
	if (this.udseq.length >= 8) {  // cheatz!
		var s = JSON.stringify(this.udseq)
		if (s == "[0,0,1,1,0,0,1,1]" && !settings.easy) {
			settings.easy = true
			MapHUD.addeasymode()
		}
		this.udseq = this.udseq.slice(0, 7)
	}

	if (kdown.act) UFX.scene.swap(CutScene)
	MapHUD.think(dt)
}

MapScene.draw = function () {
	MapHUD.draw()
	showfps()
}


var CutScene = Object.create(UFX.scene.Scene)

CutScene.start = function () {
	if (record.seenscenes[gamestate.level]) {  // Have we already seen this cutscene?
		if (gamestate.level <= settings.nlevels && !settings.alwaysshow) {
			this.complete()
		}
	}
	record.seenscenes[gamestate.level] = true
	this.dq = getdialogue(gamestate.level)
	this.drawtext(this.dq[0])
	playmusic(settings.levelmusic[gamestate.level - 1])
}

CutScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

CutScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.act || kdown.tab) {
		this.dq.splice(0, 1)
		if (this.dq.length) {
			this.drawtext(this.dq[0])
		} else {
			this.complete()
		}
	}
	if (kdown.esc) {
		this.complete()
	}
	if (this.dq[0]) {
		var who = this.dq[0][0]
		for (var j = 0 ; j < 400 ; ++j) {
			if (UFX.random() < dt) {
				this.drawline(UFX.random.rand(40, 240), who)
			}
		}
	}
}

CutScene.complete = function () {
	UFX.scene.swap(TipScene)
}

CutScene.drawtext = function (line) {
	this.backdrop = document.createElement("canvas")
	this.backdrop.width = settings.sx ; this.backdrop.height = settings.sy
	var con = this.context = this.backdrop.getContext("2d")
	var who = line[0], text = line[1]
	var color0, color1 = "black"
	if (who == "m") {
		color0 = "rgb(0,0,128)"
	} else if (who == "e") {
		color0 = "rgb(128,128,0)"
	} else if (who == "s") {
		color0 = "rgb(90,90,90)"
	} else if (who == "v") {
		color0 = "rgb(0,128,0)"
	}
	UFX.draw(this.context, "[ fs black f0 fs", UFX.draw.lingrad(0, 20, 0, -10, 0, color0, 1, color1),
		"ss white lw 1 textalign center textbaseline middle t", settings.sx / 2, settings.sy * 0.5 + 84)
	this.context.font = "38px 'Marko One'"
	var texts = wordwrap(text, 760, this.context)
	texts.forEach(function (text, j) {
		con.fillText(text, 0, 0)
		con.strokeText(text, 0, 0)
		con.translate(0, 42)
	})
	UFX.draw(this.context, "]")
	for (var y = 40 ; y < 240 ; ++y) this.drawline(y, who)
}

CutScene.drawline = function (y, who) {
	var r = UFX.random.rand(144)
	switch (who) {
		case "m":
			var r = UFX.random.rand(144)
			var color = "rgb(" + r + "," + r + ",144)"
			break
		case "e":
			var r = UFX.random.rand(64)
			var color = "rgb(" + (192-r) + "," + (192-2*r) + ",0)"
			break
		case "s":
			var r = UFX.random.rand(64,192)
			var color = "rgb(" + r + "," + r + "," + r + ")"
			break
		case "v":
			var r = UFX.random.rand(64)
			var color = "rgb(" + r + "," + (128+r) + "," + r + ")"
			break
	}
	UFX.draw(this.context, "b m 0", y, "l", settings.sx, y, "ss", color, "lw 1 s")
}

CutScene.draw = function () {
	if (!this.dq[0]) return
	UFX.draw("drawimage0", this.backdrop)
	drawframe("head" + this.dq[0][0])
	showfps()
}

var TipScene = Object.create(UFX.scene.Scene)

TipScene.start = function () {
	this.tip = gettip()
	context.font = "58px 'Contrail One'"
	var texts = wordwrap(this.tip, 600, this.context)
	UFX.draw("fs black f0 fs", UFX.draw.lingrad(0, -32, 0, 32, 0, "black", 1, "rgb(0,100,0)"),
		"ss white [ t", settings.sx * 0.5, 100)
	texts.forEach(function (text, j) {
		context.fillText(text, 0, 0)
		context.strokeText(text, 0, 0)
		context.translate(0, 60)
	})
	UFX.draw("]")
	playmusic(settings.levelmusic[gamestate.level - 1])
}

TipScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

TipScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.act || kdown.esc || kdown.tab) {
		UFX.scene.swap(ActionScene)
	}
}

TipScene.draw = function () {
	showfps()
}


var ActionScene = Object.create(UFX.scene.Scene)

ActionScene.start = function () {
	vista.levelinit()
	gamestate.startlevel()
	You.reset()
	vista.snapto(You.lookingat())
    ActionHUD.levelinit()
	playmusic(settings.levelmusic[gamestate.level - 1])
}

ActionScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down, kstate.pressed, kstate.combo]
}

ActionScene.think = function (dt, kdown, kpressed, kcombo) {
	dt = dt || 0 ; kdown = kdown || {}
	kpressed = kpressed || {} ; kcombo = kcombo || {}
	
	if (kdown.esc) { UFX.scene.push(PauseScene) ; return }
	if (kdown.tab) settings.hidefeatnames = !settings.hidefeatnames
	// TODO: F for fullscreen?
	
	You.move(kdown, kpressed, kcombo)
	You.think(dt)

	vista.lookat(You.lookingat())
	vista.think(dt)
	
	gamestate.think(dt)
	WorldEffects.think(dt)
	ActionHUD.think(dt)
	
	if (gamestate.endingproclaimed && ActionHUD.proclamationscomplete()) {
	    this.complete()
	}
}

ActionScene.complete = function () {
    gamestate.combinemoney()
    gamestate.save()
    UFX.scene.swap(ShopScene)
}

ActionScene.draw = function () {
	function draw(obj) { context.save() ; obj.draw() ; context.restore() }
	UFX.draw("[")
	vista.draw()
	draw(You)
	gamestate.butterflies.forEach(draw)
    draw(WorldEffects)
	UFX.draw("]")
	draw(ActionHUD)
	showfps()
}

var PauseScene = Object.create(UFX.scene.Scene)

PauseScene.start = function () {
	this.effect = new PauseEffect()
	this.img0 = document.createElement("canvas")
	this.img0.width = canvas.width ; this.img0.height = canvas.height
	var con = this.img0.getContext("2d")
	UFX.draw(con, "drawimage0", canvas, "alpha 0.8 fs black f0")
	if (musicplaying) musicplaying.pause()
}

PauseScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

PauseScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.esc) UFX.scene.pop()
	if (kdown.act) {
	    gamestate.proclaimcounts()
	    UFX.scene.pop()
	    ActionScene.complete()
	}
	this.effect.think(dt)
}

PauseScene.draw = function () {
    UFX.draw("drawimage0", this.img0, "[")
	this.effect.draw()
	UFX.draw("]")
	UFX.draw("[ t", settings.sx / 2, settings.sy / 2 + 140, "textalign center textbaseline middle",
	    "fs", UFX.draw.lingrad(0, 30, 0, -30, 0, "black", 1, "darkgrey"), "ss white lw 1")
	context.font = "50px 'Contrail One'"
	context.fillText("Esc: resume    Space: exit level", 0, 0)
	context.strokeText("Esc: resume    Space: exit level", 0, 0)
    UFX.draw("]")
	showfps()
}

PauseScene.stop = function () {
	if (musicplaying) musicplaying.play()
}


var ShopScene = Object.create(UFX.scene.Scene)

ShopScene.start = function () {
	ShopHUD.init()
	playmusic("girl")
}

ShopScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

ShopScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.up) ShopHUD.index = ShopHUD.index ? ShopHUD.index - 1 : ShopHUD.imax
	if (kdown.down) ShopHUD.index = ShopHUD.index < ShopHUD.imax ? ShopHUD.index + 1 : 0
    if (kdown.act || kdown.tab) {
        if (ShopHUD.index == 0) {
            this.complete()
        } else {
		    var fname = mechanics.featnames[ShopHUD.index-1]
		    var n = record.knownfeats[fname], costs = mechanics.feat[fname].ucost
		    if (n > costs.length || record.bank < costs[n-1]) {
		    } else {
		        record.bank -= costs[n-1]
			    gamestate.bars[fname] = ++record.knownfeats[fname]
		    }
	    }
	    gamestate.save()
    }
    if (kdown.esc) {
    	this.complete()
    }
    ShopHUD.think(dt)
}

ShopScene.complete = function () {
    UFX.scene.swap(MapScene)
}

ShopScene.draw = function () {
    ShopHUD.draw()
}




