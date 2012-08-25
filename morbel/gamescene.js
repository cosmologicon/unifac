var GameScene = Object.create(UFX.scene.Scene)

var morbels

GameScene.start = function () {
    this.oceangrad = UFX.draw.lingrad(0, 1, 0, 0, 0, "rgb(120,0,120)", 0.7, "rgb(120,0,120)", 1, "rgb(40,40,40)")
    this.skygrad = UFX.draw.lingrad(0, 0, 0, 1, 0, "rgb(40,40,40)", 0.1, "rgb(20,40,0)", 1, "rgb(20,40,0)")
    
    morbels = []
}

GameScene.thinkargs = function (dt) {
    var kstate = UFX.key.state()
    return [Math.min(dt, 0.1), kstate.pressed]
}

GameScene.think = function (dt, kpressed) {
    if (morbels.length < 40 && UFX.random() < dt) {
        var x = UFX.random(camera.xmin, camera.xmax)
        if (getheight(x) > 0) {
//            morbels.push(new Flopper(x))
            morbels.push(new Yapper(x))
//            morbels.push(new Flapper(x, UFX.random(200, 300)))
        }
    }

    camera.think(dt)
    You.move(kpressed)
    morbels.forEach(function (morbel) { morbel.think(dt) })
    You.think(dt)
    camera.x0 = You.x
    camera.y0 = You.y
}

GameScene.draw = function () {
    UFX.draw("fs black fr 0 0", settings.sx, settings.sy)

    UFX.draw("[ t 0", 1 + settings.sy + camera.y0 - settings.cy0 - 100, "z", settings.sx, 1000, "vflip fs", this.skygrad, "fr 0 0 1 1 ]")
    UFX.draw("[ t 0", settings.sy + camera.y0 - settings.cy0 - 100, "z", settings.sx, settings.sy, "fs", this.oceangrad, "fr 0 0 1 1 ]")
    UFX.draw("[ t", -camera.x0 + settings.sx / 2, settings.sy + camera.y0 - settings.cy0, "vflip")
    drawwaves()
    islands.forEach(function (island) { if (island.isvisible()) island.draw() })


    function draw(obj) { if (obj.isvisible()) { context.save() ; obj.draw() ; context.restore() } }
    morbels.forEach(draw)
    draw(You)

//    UFX.draw("[ alpha 0.5 fs purple fr 0", settings.sy - camera.y0 + 20, settings.sx, settings.sy, "]")
    UFX.draw("]")

    context.fillStyle = "white"
    context.font = "14px Arial"
    context.fillText(UFX.ticker.getfpsstr(), 5, 15)
}

