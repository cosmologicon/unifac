var GameScene = Object.create(UFX.scene.Scene)

GameScene.thinkargs = function (dt) {
    var kstate = UFX.key.state()
    return [dt, kstate.pressed]
}

GameScene.think = function (dt, kpressed) {
    var dk = (kpressed.right ? 1 : 0) - (kpressed.left ? 1 : 0)
    camera.x0 += dk * dt * 1000
    camera.think(dt)
}

GameScene.draw = function () {
    UFX.draw("fs black fr 0 0", settings.sx, settings.sy)
    UFX.draw("( m -1000 0")
    for (var j = 0 ; j < settings.sx ; j += 1) {
        var x = camera.xmin + j
        var h = getheight(x)
        var y = settings.sy - camera.y0 - 200 * h
        UFX.draw("l", j, y)
    }
    UFX.draw("l", settings.sx, "1000 l 0 1000 ) fs orange f")
    UFX.draw("[ alpha 0.5 fs purple fr 0", settings.sy - camera.y0 + 20, settings.sx, settings.sy, "]")
}

