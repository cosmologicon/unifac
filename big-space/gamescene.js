
var GameScene = Object.create(UFX.scene.Scene)


GameScene.start = function () {
    UFX.resource.sounds.music.play(-1)
    stars = UFX.random.spread(2000, settings.sx, settings.sy)

    qinit()
    planets = [qplanets.first]
    effects = []
    ships = [Ship(100, 100)]
    this.jship = 0
    saucers = [
        qsaucers.mothership,
        qsaucers.greeter,
    ]
    
//    qcomplete("first")
//    planets.forEach(function (p) { p.explored = 1 })
    
//    mask.make([1000,2000], [1000,1600], [800,800])
    
    this.initsun()
    
}

GameScene.think = function (dt) {
    dt *= settings.speedfactor
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
        } else if (event.type == "up" && event.name == "space") {
            camera.settarget(ship.x, ship.y)
        }
    })


    planets.forEach(function (planet) { planet.interacting = false })
    saucers.forEach(function (saucer) { saucer.interacting = false })

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
            if (dx * dx + dy * dy < 100 * 100) {
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
    
    if (state.unlocked.rescuer && state.rescues < 5 && !distressed && UFX.random(60) < dt) {
        var planet = UFX.random.choice(planets)
        if (planet.explored >= 1) {
            distressed = planet
            distressed.distressed = true
            planet.distresst = 0
        }
    }
}

GameScene.drawtitle = function () {
    context.save()
    context.translate(settings.sx/3, 0.8*settings.sy)
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
    context.fillText("Space: center on ship", 0, 30)
    context.restore()

    if (ships.length > 1) {
        context.save()
        context.translate(2100, 1800)
        context.rotate(0.1)
        context.font = "30px 'Russo One'"
        context.fillStyle = "rgb(0,0,64)"
        context.fillText("Tab: select different ship", 0, 0)
        context.restore()
    }
}

GameScene.drawbackground = function () {
    context.fillStyle = "black"
    context.fillRect(0, 0, settings.sx, settings.sy)
    this.drawtitle()
    context.fillStyle = "white"
    stars.forEach(function (star, j, stars) {
        if (j % 100 == 0) {
            var k = 32 + Math.floor(j * 196 / stars.length)
            context.fillStyle = "rgb(" + k + "," + k + "," + k + ")"
        }
        context.fillRect(star[0], star[1], 2, 2)
    })
    this.drawsun()
}

GameScene.drawguideline = function () {
    var p = UFX.mouse.pos
    if (p) {
        var s = ships[this.jship]
        UFX.draw(context, "b m", s.x, s.y, "l", p[0], p[1], "lw 0.1 ss white s")
    }
}

GameScene.initsun = function () {
    var s = this.suns = 64
    this.sunrs = []
    this.sunthetas = []
    this.sunidata = context.createImageData(s, s)
    this.suncanvas = document.createElement("canvas")
    this.suncanvas.width = this.suncanvas.height = s
    for (var y = 0, j = 0, k = 0 ; y < s ; ++y) {
        for (var x = 0 ; x < s; ++x, j += 4, ++k) {
            var dx = ((x - s/2) + 0.5) / s * 10, dy = ((y - s/2) + 0.5) / s * 10
            var r = Math.sqrt(dx * dx + dy * dy)
            var theta = Math.atan2(dy, dx) * 16 / Math.PI
            this.sunrs.push(r)
            this.sunthetas.push(theta)
        }
    }
}

GameScene.drawsun = function () {
    var data = this.sunidata.data
    var t = Date.now() * 0.001
    var jmax = this.suns * this.suns
    for (var j = 0, k = 0 ; j < jmax ; ++j) {
        var r = this.sunrs[j], theta = this.sunthetas[j]
        var v = UFX.noise([3*r - 1*t, theta, 0.5*t], [256, 32, 256])
        v += 1.5 -0.5 * r
//                v1 = 2 * v1 - 1 + (y - s/3) * 0.03
//                var color = flamemap(v)
        data[k++] = 255
        data[k++] = 196 + 300 * v
        data[k++] = 400 * v
        data[k++] = Math.min(Math.max(128 + 600 * v, 0), 255)
    }
    this.suncanvas.getContext("2d").putImageData(this.sunidata, 0, 0)
    context.save()
    context.translate(settings.sx/2, settings.sy/2)
    context.scale(600/this.suns, 600/this.suns)
    context.drawImage(this.suncanvas, -this.suns/2, -this.suns/2)
    context.restore()
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


