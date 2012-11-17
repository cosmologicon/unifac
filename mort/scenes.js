function showfps() {
    if (!settings.showfps) return
    var s = UFX.ticker.getfpsstr()
    UFX.draw("[ t 790 10 textalign right textbaseline top fs white ss black")
    context.font = "bold 44px Arial"
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
	context.font = settings.fonts.loading
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
	context.font = settings.fonts.loading
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
}

CutScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

CutScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.act) {
		this.dq.splice(0, 1)
		if (!this.dq.length) UFX.scene.swap(TipScene)
	}
}

CutScene.draw = function () {
	if (!this.dq[0]) return
	var who = this.dq[0][0], text = this.dq[0][1]
	UFX.draw("fs black f0 fs white textalign center textbaseline middle")
	context.fillText(text, settings.sx/2, settings.sy/2)
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
	this.drawn = false
}

PauseScene.thinkargs = function (dt) {
	var kstate = UFX.key.state()
    return [dt, kstate.down]
}

PauseScene.think = function (dt, kdown) {
	dt = dt || 0 ; kdown = kdown || {}
	if (kdown.esc) UFX.scene.pop()
}

PauseScene.draw = function () {
	if (this.drawn) return
	this.drawn = true
	UFX.draw("[ alpha 0.7 fs black f0 ]")
	showfps()
}






