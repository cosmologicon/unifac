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


var MapScene = Object.create(UFX.scene.Scene)

MapScene.start = function () {
	if (settings.unlockall) record.unlocked = settings.nlevels
	context.font = "80px 'Contrail One' sans-serif"
	this.udseq = []
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
	if (this.udseq.length >= 8) {  // TODO: cheatz!
	
	}

	if (kdown.act) UFX.scene.swap(CutScene)
}

MapScene.draw = function () {
	UFX.draw("fs black f0 fs white")
	context.fillText("Current level: " + gamestate.level, settings.sx/2, settings.sy/2)
	showfps()
}


var CutScene = Object.create(UFX.scene.Scene)

CutScene.start = function () {
	if (record.maxvisited >= gamestate.level) {  // Have we already seen this cutscene?
		if (gamestate.level <= settings.nlevels && !settings.alwaysshow) {
			UFX.scene.swap(TipScene)
		}
	}
	this.dq = getdialogue(gamestate.level)
	this.drawtip(this.dq[0])
}

CutScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

CutScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.act) {
		this.dq.splice(0, 1)
		if (this.dq.length) {
			this.drawtip(this.dq[0])
		} else {
			UFX.scene.swap(TipScene)
		}
	}
	if (kdown.esc) {
		UFX.scene.swap(TipScene)
	}
}

CutScene.drawtip = function (tip) {
	var who = tip[0], text = tip[1]
	var color0 = "rgb(24,24,24)", color1 = "rgb(64,64,64)"
	UFX.draw("[ fs black f0 fs", UFX.draw.lingrad(0, -24, 0, 24, 0, color0, 1, color1),
		"ss white textalign center textbaseline middle t", settings.sx / 2, settings.sy * 0.5 + 84)
	context.font = "44px 'Marko One'"
	var texts = wordwrap(text, 760, context)
	texts.forEach(function (text, j) {
		context.fillText(text, 0, 0)
		context.strokeText(text, 0, 0)
		context.translate(0, 44)
	})
	UFX.draw("]")
}

CutScene.draw = function () {
	if (!this.dq[0]) return
	showfps()
}

var TipScene = Object.create(UFX.scene.Scene)

TipScene.start = function () {
	this.tip = gettip()
}

TipScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

TipScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.act) {
		UFX.scene.swap(ActionScene)
	}
}

TipScene.draw = function () {
	UFX.draw("fs black f0 fs white textalign center textbaseline middle")
	context.fillText(this.tip, settings.sx/2, settings.sy/2)
	showfps()
}


var ActionScene = Object.create(UFX.scene.Scene)

ActionScene.start = function () {
	vista.levelinit()
	gamestate.startlevel()
	You.reset()
	vista.snapto(You.lookingat())
    ActionHUD.levelinit()
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


var ShopScene = Object.create(UFX.scene.Scene)

ShopScene.start = function () {
    ShopHUD.init()
}

ShopScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

ShopScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.up) ShopHUD.index--
	if (kdown.down) ShopHUD.index++
	ShopHUD.index = (ShopHUD.index + (ShopHUD.imax+1)) % (ShopHUD.imax+1)
    if (kdown.act) {
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
    }
    ShopHUD.think(dt)
}

ShopScene.complete = function () {
    UFX.scene.swap(MapScene)
}

ShopScene.draw = function () {
    ShopHUD.draw()
}




