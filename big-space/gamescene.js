
var GameScene = Object.create(UFX.scene.Scene)


GameScene.start = function () {
    this.stars = UFX.random.spread(2000, settings.sx, settings.sy)

    planets = []
    UFX.random.spread(100, settings.sx, settings.sy).forEach(function (p) {
        var color = UFX.random.choice("red yellow green blue gray".split(" "))
        planets.push(Planet(p[0], p[1], UFX.random(20, 40), color))
    })
    effects = []
    ships = [Ship(1000, 1000)]
    
    planets[0].distressed = true
    
    mask.make([1000,2000], [1000,1600], [800,800])
}

GameScene.think = function (dt) {
    document.title = UFX.ticker.getfpsstr()

    UFX.mouse.events().forEach(function (event) {
        if (event.type == "down") {
            if (event.button == 0) {
                ships[0].settarget(event.pos[0], event.pos[1])
            }
            camera.settarget(event.pos[0], event.pos[1])
            effects.push(ClickBox(event.pos[0], event.pos[1]))
        }
    })

    var think = function (e) { e.think(dt) }

    camera.think(dt)
    planets.forEach(think)
    effects.forEach(think)
    ships.forEach(think)
}

GameScene.drawtitle = function () {
    context.save()
    context.translate(settings.sx/3, 2*settings.sy/3)
    context.scale(settings.sy/1000, settings.sy/1000)
    context.rotate(-0.5)
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.font = "100px Syncopate"
    context.fillStyle = "rgb(0,0,12)"
    context.fillText("BIG", 0, -100)
    context.fillText("SPACE", 0, 0)
    context.font = "24px 'Russo One'"
    context.fillText("by Christopher Night", 92, 50)
    context.restore()
}

GameScene.drawbackground = function () {
    context.fillStyle = "black"
    context.fillRect(0, 0, settings.sx, settings.sy)
    this.drawtitle()
    context.fillStyle = "white"
    this.stars.forEach(function (star, j, stars) {
        if (j % 100 == 0) {
            var k = 32 + Math.floor(j * 196 / stars.length)
            context.fillStyle = "rgb(" + k + "," + k + "," + k + ")"
        }
        context.fillRect(star[0], star[1], 2, 2)
    })
}

GameScene.draw = function () {
    this.drawbackground()

    var draw = function (e) { context.save() ; e.draw() ; context.restore() }
    planets.forEach(draw)
    ships.forEach(draw)
    effects.forEach(draw)
    
    draw(mask)
}


