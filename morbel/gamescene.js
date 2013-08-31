var GameScene = {}, morbels

GameScene.start = function () {

    terraininit()
    islands = [], backislands = []
    exploredmin = 0, exploredmax = 0

    this.oceangrad = UFX.draw.lingrad(0, 1, 0, 0, 0, "rgba(40,40,40,0)", 0.5, "rgba(40,40,40,0)", 1, "rgb(40,40,40)")
    this.skygrad = UFX.draw.lingrad(0, 0, 0, 1, 0, "rgb(40,40,40)", 0.1, "rgb(60,30,0)", 1, "rgb(60,30,0)")
    
    youinit()
    morbels = []
    effects = []
    devices = gamestate.getdevices()
    
    dialogue.init()
    this.winning = false
    this.wintime = 0
    
    playsound("hiss")
}

GameScene.thinkargs = function (dt) {
    var kstate = UFX.key.state()
    return [Math.min(dt, 0.1), kstate.pressed, kstate.down]
}

GameScene.think = function (dt, kpressed, kdowns) {
    You.move(kpressed, kdowns)
    if (kdowns.tab) dialogue.skip()

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
        if (dialogue.sound) dialogue.sound.pause()
        stopmusic()
        if (this.wintime == 0) playsound("winning")
        this.wintime += dt
        if (this.wintime >= 3) {
            UFX.scene.pop()
            gamestate.stage += 1
            if (gamestate.stage == 7) {
                UFX.scene.push(CutScene)
            } else {
                UFX.scene.push(gamestate.stage == 8 ? EndScene : GameScene)
            }
        }
    }
}

GameScene.draw = function () {
    UFX.draw("fs black fr 0 0", settings.sx, settings.sy)

    UFX.draw("[ t", settings.sx/2, settings.sy/2, "z", camera.zoom, camera.zoom)
    var y0 = camera.y0 + settings.cy0
    UFX.draw("[ t", -settings.sx/2, -170 + y0, "z", settings.sx, "1000 vflip fs", this.skygrad, "fr 0 0 1 1 ]")
    UFX.draw("[ t", -settings.sx/2, -180 + y0, "z", settings.sx, settings.sy)
    var t = Date.now() / 1000., r = 100 + 50 * Math.sin(0.06 * t + 123), b = 100 + 50 * Math.sin(0.028 * t + 999)
    var oceancolor = "rgb(" + Math.floor(r) + ",0," + Math.floor(b) + ")"
    UFX.draw("fs", oceancolor, "fr 0 0 1 1 fs", this.oceangrad, "fr 0 0 1 1 ]")
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
    
    var alpha = gamestate.stage == 6 ? 0 : Math.min(this.wintime / 1.5, 1)
    if (this.winning) {
        UFX.draw("[ alpha", alpha, "fs white fr 0 0", settings.sx, settings.sy, "]")
    }
/*
    context.fillStyle = "white"
    context.font = "14px Arial"
    context.fillText(UFX.ticker.getfpsstr(), 5, 15)
    context.fillText("" + Math.floor(You.x), 5, 35)
*/
}


// Cutscene that appears after stage 6
var CutScene = {}
CutScene.start = function () {
    this.script = [
        "Huh. That should have worked. Why isn't the terraforming starting?",
        "I'm afraid we can't let you do that, Maker.",
        "Oh crap.",
        "We know what your devices do. We've disabled them.",
        "Oh crap.",
        "We won't let you do that to our planet. We won't let you kill us.",
        "Oh crap.",
        "Please come with us.",
    ]
    this.jline = 0
    this.t = 0
    this.active = true
    this.alpha = 0
}
CutScene.think = function (dt) {
    var k = UFX.key.state()
    if (!this.active) return
    this.t += dt
    var tnext = this.script[this.jline].length * 0.04 + 2
    
    if (this.t > 0.5 && k.down.tab) {
        this.t = 100
        this.alpha = 0
    }

    if (this.t > tnext) {
        this.alpha -= 4 * dt
        if (this.alpha < 0) {
            this.alpha = 0
            this.t = 0
            this.jline += 1
        }
    } else {
        this.alpha = Math.min(this.alpha + 4 * dt, 1)
    }
    if (this.jline >= this.script.length) {
        this.active = false
        UFX.scene.pop()
        UFX.scene.push(GameScene)
    }
}
CutScene.draw = function () {
    if (!this.active) return
    context.save()
    var tcolor
    if (this.jline % 2 == 0) {
//        UFX.draw("hflip")
        context.fillStyle = "rgb(40,40,40)"
        context.fillRect(0, 0, settings.sx, settings.sy)
        context.drawImage(UFX.resource.images.you, settings.sx / 2 - 100, settings.sy / 2 - 100)
        tcolor = "white"
    } else {
        context.fillStyle = "rgb(40,0,40)"
        context.fillRect(0, 0, settings.sx, settings.sy)
        UFX.draw("[ t", settings.sx/2, settings.sy/2)
        UFX.draw("[ t -300 80 z 4 -4") ; DrawGuy.draw() ; UFX.draw("]")
        UFX.draw("[ t 300 80 z 4 -4") ; DrawGuy.draw() ; UFX.draw("]")
        UFX.draw("[ t 0 150 z 6 -6") ; DrawGuy.draw() ; UFX.draw("]")
        UFX.draw("]")
        tcolor = "rgb(255,100,255)"
    }
    this.texts = [this.script[this.jline]]
    UFX.draw("fs", tcolor, "ss black lw 2 alpha", this.alpha, "textalign center textbaseline middle")
    context.translate(settings.sx / 2, settings.sy * 1.05)
    context.font = settings.fonts.dialogue
    this.texts.forEach(function (text, jtext, texts) {
        var y = (-texts.length + jtext) * 30
        context.strokeText(text, 0, y)
        context.fillText(text, 0, y)
    })
    context.restore()
}



// Game over scene that appears after stage 7
var EndScene = {}
EndScene.start = function () {
    this.shown = false
    this.t = 0
    this.xstand = []
    for (var j = 0 ; j < 50 ; ++j) this.xstand.push(UFX.random(settings.sx))
    this.hissed = false
    playsound("hiccup")
}
EndScene.think = function (dt) {
    UFX.key.state()
    this.t += dt
}
EndScene.draw = function () {
    if (this.t < 0.1 || !this.shown) {
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
        if (!this.hissed) {
            playsound("hiss")
            this.hissed = true
        }
    }
}


var IntroScene = {}
IntroScene.start = function () {
}
IntroScene.think = function (dt) {
    var k = UFX.key.state()
    if (k.down.act) {
        UFX.scene.pop()
        UFX.scene.push(GameScene)
    }

}
IntroScene.draw = function () {
    context.fillStyle = "black"
    context.fillRect(0, 0, settings.sx, settings.sy)
    context.fillStyle = "white"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.font = settings.fonts.title
    context.fillText("Rise of the Morbels", settings.sx/2, settings.sy/3)
    context.font = settings.fonts.intro
    context.fillText("Press space or enter to begin", settings.sx/2, 2*settings.sy/3)
}




