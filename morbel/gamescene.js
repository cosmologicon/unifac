var GameScene = Object.create(UFX.scene.Scene)

var morbels

GameScene.start = function () {

    terraininit()
    islands = [], backislands = []
    exploredmin = 0, exploredmax = 0

    this.oceangrad = UFX.draw.lingrad(0, 1, 0, 0, 0, "rgb(120,0,120)", 0.5, "rgb(120,0,120)", 1, "rgb(40,40,40)")
    this.skygrad = UFX.draw.lingrad(0, 0, 0, 1, 0, "rgb(40,40,40)", 0.1, "rgb(20,40,0)", 1, "rgb(20,40,0)")
    
    youinit()
    morbels = []
    effects = []
    devices = gamestate.getdevices()
    
    dialogue.init()
    this.winning = false
    this.wintime = 0
}

GameScene.thinkargs = function (dt) {
    var kstate = UFX.key.state()
    return [Math.min(dt, 0.1), kstate.pressed, kstate.down]
}

GameScene.think = function (dt, kpressed, kdowns) {
    You.move(kpressed, kdowns)

    gamestate.generatemorbels(dt)

    camera.think(dt)
    morbels.forEach(function (morbel) { morbel.think(dt) })
    You.think(dt)
    You.updatestate()
    devices.forEach(function (device) { device.think(dt) })
    effects.forEach(function (effect) { effect.think(dt) })
    var f = 1 - Math.exp(-3 * dt)
    camera.x0 += f * (You.x + (You.facingright ? 100 : -100) - camera.x0)
    var f = 1 - Math.exp(-5 * dt)
    camera.y0 += f * (You.y - camera.y0)

    function isalive (obj) { return obj.alive }
    morbels = morbels.filter(isalive)
    effects = effects.filter(isalive)
    devices = devices.filter(isalive)
    
    dialogue.think(dt)
    
    if (kdowns.F1) this.winning = true
    if (kdowns.F2) {
        this.winning = true
        this.wintime = 3
    }
    
    if (gamestate.checkwin()) this.winning = true
    
    if (this.winning) {
        if (this.wintime == 0) playsound("winning")
        this.wintime += dt
        if (this.wintime >= 3) {
            UFX.scene.pop()
            gamestate.stage += 1
            UFX.scene.push(gamestate.stage == 8 ? EndScene : GameScene)
        }
    }
}

GameScene.draw = function () {
    UFX.draw("fs black fr 0 0", settings.sx, settings.sy)

    UFX.draw("[ t", settings.sx/2, settings.sy/2, "z", camera.zoom, camera.zoom)
//    UFX.draw("[ t 0", 1 + settings.sy + camera.y0 - settings.cy0 - 100, "z", settings.sx, 1000, "vflip fs", this.skygrad, "fr 0 0 1 1 ]")
    var y0 = camera.y0 + settings.cy0
    UFX.draw("[ t", -settings.sx/2, -180 + y0, "z", settings.sx, settings.sy, "fs", this.oceangrad, "fr 0 0 1 1 ]")
    UFX.draw("[ vflip t", -camera.x0, -y0)
    function draw(obj) { if (obj.isvisible()) { context.save() ; obj.draw() ; context.restore() } }
    backislands.forEach(function (island) { if (island.isvisible()) island.draw() })
    drawwaves()
    devices.forEach(draw)
    islands.forEach(function (island) { if (island.isvisible()) island.draw() })


    morbels.forEach(draw)
    draw(You)
    effects.forEach(draw)

//    UFX.draw("[ alpha 0.5 fs purple fr 0", settings.sy - camera.y0 + 20, settings.sx, settings.sy, "]")
    UFX.draw("] ]")

    dialogue.draw()
    
    if (this.winning) {
        UFX.draw("[ alpha", Math.min(this.wintime / 1.5, 1), "fs white fr 0 0", settings.sx, settings.sy, "]")
    }

    context.fillStyle = "white"
    context.font = "14px Arial"
    context.fillText(UFX.ticker.getfpsstr(), 5, 15)
    context.fillText("" + Math.floor(You.x), 5, 35)
}




var EndScene = Object.create(UFX.scene.Scene)
EndScene.start = function () {
    this.shown = false
    this.t = 0
    this.xstand = []
    for (var j = 0 ; j < 50 ; ++j) this.xstand.push(UFX.random(settings.sx))
}
EndScene.think = function (dt) {
    this.t += dt
}
EndScene.draw = function () {
    if (this.t < 0.2 || !this.shown) {
        UFX.draw("fs black fr 0 0", settings.sx, settings.sy)
/*        for (var y = 0 ; y < 50 ; ++y) {
            var z = (30 + y) / 15
            UFX.draw("[ t", this.xstand[y], settings.sy/2 - 50 + 5 * y, "z", z, -z)
            DrawGuy.draw()
            UFX.draw("]")
            if (y % 10 == 0) UFX.draw("fs rgba(0,0,0,0.1) fr 0 0", settings.sx, settings.sy)
        }*/
        UFX.draw("[ t", settings.sx/2, settings.sy/2)
        UFX.draw("[ t -300 80 z 4 -4") ; DrawGuy.draw() ; UFX.draw("]")
        UFX.draw("[ t 300 80 z 4 -4") ; DrawGuy.draw() ; UFX.draw("]")
        UFX.draw("[ t 0 150 z 6 -6") ; DrawGuy.draw() ; UFX.draw("]")
        UFX.draw("]")
        this.shown = true
    } else if (this.t < 2.5) {
        UFX.draw("fs white fr 0 0", settings.sx, settings.sy)
    } else {
        context.save()
        UFX.draw("fs white textalign center textbaseline middle")
        context.clearRect(0, 0, settings.sx, settings.sy)
        context.translate(settings.sx / 2, settings.sy / 2)
        context.font = settings.fonts.title
        context.fillText("Rise of the Morbels", 0, 0)
        context.restore()
    }
}



