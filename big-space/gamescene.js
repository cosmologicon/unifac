
var GameScene = Object.create(UFX.scene.Scene)


GameScene.start = function () {
    this.stars = UFX.random.spread(500, settings.sx, settings.sy)

    this.x = []
    this.y = []
    this.vx = []
    this.vy = []
    for (var j = 0 ; j < 500 ; ++j) {
        this.x.push(UFX.random(settings.sx))
        this.y.push(UFX.random(settings.sy))
        this.vx.push(UFX.random(-100, 100))
        this.vy.push(UFX.random(-100, 100))
    }
    this.texttheta = 0
    
    planets = []
    UFX.random.spread(100, settings.sx, settings.sy).forEach(function (p) {
        var color = UFX.random.choice("red yellow green blue gray".split(" "))
        planets.push(Planet(p[0], p[1], UFX.random(20, 40), color))
    })
    effects = []
    
    planets[0].distressed = true
}

GameScene.think = function (dt) {
    document.title = UFX.ticker.getfpsstr()
    var think = function (e) { e.think(dt) }
    planets.forEach(think)
    effects.forEach(think)
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

GameScene.drawstars = function () {
    context.fillStyle = "black"
    context.fillRect(0, 0, settings.sx, settings.sy)
    this.drawtitle()
    context.fillStyle = "white"
    this.stars.forEach(function (star) {
        context.fillRect(star[0], star[1], 2, 2)
    })
}

GameScene.draw = function () {
    this.drawstars()

    var draw = function (e) { context.save() ; e.draw() ; context.restore() }
    planets.forEach(draw)
    effects.forEach(draw)
}


