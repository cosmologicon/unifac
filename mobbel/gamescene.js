var GameScene = Object.create(UFX.scene.Scene)

GameScene.start = function () {
    this.oceangrad = UFX.draw.lingrad(0, 1, 0, 0, 0, "rgb(120,0,120)", 0.7, "rgb(120,0,120)", 1, "rgb(40,40,40)")
    this.skygrad = UFX.draw.lingrad(0, 0, 0, 1, 0, "rgb(40,40,40)", 0.1, "rgb(20,40,0)", 1, "rgb(20,40,0)")
}

GameScene.thinkargs = function (dt) {
    var kstate = UFX.key.state()
    return [Math.min(dt, 0.1), kstate.pressed]
}

GameScene.think = function (dt, kpressed) {
    camera.think(dt)
    You.move(kpressed)
    You.think(dt)
    camera.x0 = You.x
    camera.y0 = You.y
}

GameScene.draw = function () {
    UFX.draw("fs black fr 0 0", settings.sx, settings.sy)

    UFX.draw("[ t 0", 1 + settings.sy + camera.y0 - settings.cy0 - 100, "z", settings.sx, 1000, "vflip fs", this.skygrad, "fr 0 0 1 1 ]")
    UFX.draw("[ t 0", settings.sy + camera.y0 - settings.cy0 - 100, "z", settings.sx, settings.sy, "fs", this.oceangrad, "fr 0 0 1 1 ]")
    UFX.draw("[ t", -camera.x0 + settings.sx / 2, settings.sy + camera.y0 - settings.cy0, "vflip")
    islands.forEach(function (island) { island.drawfootprint() })
    islands.forEach(function (island) { island.draw() })

    context.save() ; You.draw() ; context.restore()

//    UFX.draw("[ alpha 0.5 fs purple fr 0", settings.sy - camera.y0 + 20, settings.sx, settings.sy, "]")
    UFX.draw("]")
}

