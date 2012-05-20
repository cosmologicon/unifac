
var GameScene = Object.create(UFX.scene.Scene)


GameScene.start = function () {
    this.stars = UFX.random.spread(2000, settings.sx, settings.sy)

    planets = []
    UFX.random.spread(100, settings.sx, settings.sy).forEach(function (p) {
        var color = UFX.random.choice("red yellow green blue gray".split(" "))
        planets.push(Planet(p[0], p[1], UFX.random(20, 40), color))
    })
    effects = []
    ships = [Ship(100, 100), Ship(300, 300)]
    this.jship = 0
    saucers = [
        Saucer(600, 400, "Use your browser's zoom|function to get a wide view,|or close up to read info!|Ctrl+0 to return to normal zoom."),
        Saucer(1000, 400, "Hey you. Want to help me explore?|Just park your ship at this planet|here until it reaches 100%. Then|come back and talk to me again."),
    ]
    planets[0].distressed = true
    planets[1].meteors = true
    
    mask.make([1000,2000], [1000,1600], [800,800])
    
}

GameScene.think = function (dt) {
    document.title = UFX.ticker.getfpsstr()

    var ship = ships[this.jship], gscene = this
    UFX.mouse.events().forEach(function (event) {
        if (event.type == "down") {
            if (event.button == 0) {
                ship.settarget(event.pos[0], event.pos[1])
            }
            camera.settarget(event.pos[0], event.pos[1])
            effects.push(ClickBox(event.pos[0], event.pos[1]))
        }
    })
    UFX.key.events().forEach(function (event) {
        if (event.type == "up" && event.name == "tab") {
            gscene.jship++
            gscene.jship %= ships.length
        }
    })



    ships.forEach(function (ship) {
        if (ship.x != ship.targetx) return
        var x = ship.x, y = ship.y
        planets.forEach(function (planet) {
            var dx = x - planet.x, dy = y - planet.y
            if (dx * dx + dy * dy < 80 * 80) {
                planet.interact(ship)
            }
        })
        saucers.forEach(function (saucer) {
            var dx = x - saucer.x, dy = y - saucer.y
            if (dx * dx + dy * dy < 50 * 50) {
                saucer.interact(ship)
            }
        })
    })

    var think = function (e) { e.think(dt) }
    camera.think(dt)
    planets.forEach(think)
    effects.forEach(think)
    ships.forEach(think)
    saucers.forEach(think)
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

    context.save()
    context.translate(200, 200)
    context.rotate(0.3)
    context.font = "30px 'Russo One'"
    context.fillStyle = "rgb(0,0,64)"
    context.fillText("Left click: move ship", 0, -30)
    context.fillText("Right click: pan", 0, 0)
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

GameScene.drawguideline = function () {
    var p = UFX.mouse.pos
    if (p) {
        var s = ships[this.jship]
        UFX.draw(context, "b m", s.x, s.y, "l", p[0], p[1], "lw 0.1 ss white s")
    }
}

GameScene.draw = function () {
    this.drawbackground()
    this.drawguideline()
    
    var draw = function (e) { context.save() ; e.draw() ; context.restore() }
    planets.forEach(draw)
    saucers.forEach(draw)
    ships.forEach(draw)
    effects.forEach(draw)
    
//    draw(mask)
}


