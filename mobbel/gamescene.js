var GameScene = Object.create(UFX.scene.Scene)

GameScene.start = function () {
    this.oceangrad = UFX.draw.lingrad(0, 1, 0, 0, 0, "rgb(120,0,120)", 0.7, "rgb(120,0,120)", 1, "rgb(40,40,40)")
    this.skygrad = UFX.draw.lingrad(0, 0, 0, 1, 0, "rgb(40,40,40)", 0.1, "rgb(20,40,0)", 1, "rgb(20,40,0)")
}

GameScene.thinkargs = function (dt) {
    var kstate = UFX.key.state()
    return [dt, kstate.pressed]
}

GameScene.think = function (dt, kpressed) {
    var dkx = (kpressed.right ? 1 : 0) - (kpressed.left ? 1 : 0)
    var dky = (kpressed.up ? 1 : 0) - (kpressed.down ? 1 : 0)
    camera.x0 += dkx * dt * 1000
    camera.y0 -= dky * dt * 200
    camera.think(dt)
}

GameScene.draw = function () {
    UFX.draw("fs black fr 0 0", settings.sx, settings.sy)

    UFX.draw("[ t 0", 1 + settings.sy - camera.y0 - 100, "z", settings.sx, 1000, "vflip fs", this.skygrad, "fr 0 0 1 1 ]")
    UFX.draw("[ t 0", settings.sy - camera.y0 - 100, "z", settings.sx, settings.sy, "fs", this.oceangrad, "fr 0 0 1 1 ]")
    UFX.draw("[ t", -camera.x0, settings.sy - camera.y0, "vflip")
    islands.forEach(function (island) { island.drawfootprint() })
    islands.forEach(function (island) { island.draw() })
//    UFX.draw("[ alpha 0.5 fs purple fr 0", settings.sy - camera.y0 + 20, settings.sx, settings.sy, "]")
    UFX.draw("]")
}

