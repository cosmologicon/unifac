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
    devices = [new Device(-400)]
    
    dialogue.init()
}

GameScene.thinkargs = function (dt) {
    var kstate = UFX.key.state()
    return [Math.min(dt, 0.1), kstate.pressed, kstate.down]
}

GameScene.think = function (dt, kpressed, kdowns) {
    if (morbels.length < 10 && UFX.random() < dt) {
        var x = UFX.random(camera.xmin, camera.xmax)
        if (getheight(x) < 0) {
//            morbels.push(new Hopper(x))
//            morbels.push(new Flopper(x))
//            morbels.push(new Gripper(x))
            morbels.push(new Whipper(x))
//            morbels.push(new Flapper(x, UFX.random(200, 300)))
//            morbels.push(new Yapper(x))
        }
    }
    You.move(kpressed, kdowns)

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

    context.fillStyle = "white"
    context.font = "14px Arial"
    context.fillText(UFX.ticker.getfpsstr(), 5, 15)
}

