
var GameScene = Object.create(UFX.scene.Scene)


GameScene.start = function () {

    this.ptexture = context.createRadialGradient(0, 2, 1, 2, 0, 3)
    for (var j = 0 ; j < 5 ; ++j) {
        var a = j * 0.2
        this.ptexture.addColorStop(a, "blue")
        this.ptexture.addColorStop(a + 0.08, "blue")
        this.ptexture.addColorStop(a + 0.09, "black")
        this.ptexture.addColorStop(a + 0.1, "green")
        this.ptexture.addColorStop(a + 0.18, "green")
        this.ptexture.addColorStop(a + 0.19, "black")
    }
    this.stexture = context.createRadialGradient(0, 0.5, 0, 0, 0.5, 1.5)
    this.stexture.addColorStop(0, "rgba(0,0,0,0)")
    this.stexture.addColorStop(1, "rgba(0,0,0,1)")



    var stars = this.stars = []
    UFX.random.spread(400).forEach(function (p) {
        stars.push([p[0] * 1600 - 800, p[1] * 1600 - 800])
    })

    // Yes these are supposed to be globals
    hitters = []  // objects that the player can run into
    ehitters = []  // objects that the enemies can run into
    effects = [Indicator]  // text and graphical effects
//    structures = []  // structures
    monsters = [] 


    structures = []
    gamestate.setworldsize(400)    
    gamestate.addstructure(new Springboard())

}

GameScene.think = function (dt) {
    if (dt > 0.1) dt = 0.1

    // Handle keyboard input
    var mkeys = {
        up: !!(UFX.key.ispressed.up || UFX.key.ispressed.W),
        down: !!(UFX.key.ispressed.down || UFX.key.ispressed.S),
        left: !!(UFX.key.ispressed.left || UFX.key.ispressed.A),
        right: !!(UFX.key.ispressed.right || UFX.key.ispressed.D),
        act: !!(UFX.key.ispressed.space || UFX.key.ispressed.enter),
    }
    var nkeys = {}
    UFX.key.events().forEach(function (event) {
        if (event.type === "down") {
            nkeys[event.name] = true
        }
    })
    nkeys.up = nkeys.up || nkeys.W
    nkeys.down = nkeys.down || nkeys.S
    nkeys.left = nkeys.left || nkeys.A
    nkeys.right = nkeys.right || nkeys.D
    nkeys.act = nkeys.space || nkeys.enter
    you.move(mkeys, nkeys)

    if (UFX.random(10) < dt) {
        hitters.push(new Token(UFX.random(tau), 400))
    }
    if (UFX.random(1) < dt) {
        monsters.push(new Gnat(UFX.random(tau), 200))
    }

    var n = settings.tickmult
    dt /= n
    for (var jit = 0 ; jit < n ; ++jit) {
        hitters.forEach(function (obj) { obj.think(dt) })
        ehitters.forEach(function (obj) { obj.think(dt) })
        effects.forEach(function (effect) { effect.think(dt) })
        structures.forEach(function (structure) { if (structure) structure.think(dt) })
        monsters.forEach(function (monster) { monster.think(dt) })
        you.think(dt)


        function stillalive(arr) {
            var narr = []
            arr.forEach(function (x) { if (x.alive) narr.push(x) })
            return narr
        }

        you.updatestate()

        you.nab(hitters)
        you.interact(structures)
        you.clonk(monsters)

        ehitters.forEach(function (ehitter) {
            ehitter.hit(monsters)
        })

        hitters = stillalive(hitters)
        ehitters = stillalive(ehitters)
        effects = stillalive(effects)
        monsters = stillalive(monsters)
        for (var j = 0 ; j < structures.length ; ++j) {
            if (structures[j] && !structures[j].alive) {
                structures[j] = null
            }
        }

    }

    if (UFX.key.ispressed.shift) {
        camera.mode = "planet"
        camera.settarget([0, 0])
    } else {
        camera.mode = "play"
        camera.settarget(you.lookingat())
    }
    camera.think(dt * n)
    
    updatebuttons()
}


GameScene.drawstars = function () {
    // Draw stars
    context.save()
    var s = Math.pow(camera.zoom, -0.85)
    context.scale(s, s)
    context.fillStyle = "white"
    this.stars.forEach(function (star) {
        context.beginPath()
//        context.arc(star[0], star[1], 1, 0, tau)
//        context.fill()
        context.fillRect(star[0], star[1], 2, 2)
    })
    context.restore()
}


GameScene.drawworld = function () {
    if (gamestate.worldsize <= 0) return
    // Draw world
    context.save()
    context.scale(gamestate.worldr, gamestate.worldr)
    context.beginPath()
    context.arc(0, 0, 1, 0, tau)
    context.fillStyle = this.ptexture
    context.fill()
    // draw the eyes
    context.save()
    context.lineWidth = 0.03
    context.scale(1, 2)
    context.fillStyle = "black"
    context.beginPath()
    context.arc(0.4, 0.1, 0.18, 0, tau)
    context.fill()
    context.beginPath()
    context.arc(-0.4, 0.1, 0.18, 0, tau)
    context.fill()
    context.restore()
    context.fillStyle = "white"
    context.beginPath()
    context.arc(0.35, 0.3, 0.05, 0, tau)
    context.fill()
    context.beginPath()
    context.arc(-0.45, 0.3, 0.05, 0, tau)
    context.fill()

    // draw the shadow
    context.beginPath()
    context.arc(0, 0, 1, 0, tau)
    context.fillStyle = this.stexture
    context.fill()
    context.lineWidth = 0.01
    context.strokeStyle = "black"
    context.stroke()
    context.restore()
}

GameScene.drawobjs = function () {
    function draw(obj) {
        context.save()
        obj.draw()
        context.restore()
    }

    structures.forEach(function (s) { if (s) { draw(s) } })
    hitters.forEach(draw)
    monsters.forEach(draw)
    ehitters.forEach(draw)
    draw(you)
    effects.forEach(draw)
}

GameScene.drawstatus = function () {
    context.font = "26px Viga"
    context.textAlign = "right"
    context.textBaseline = "middle"
    context.fillStyle = "#AAF"
    context.strokeStyle = "black"
    context.lineWidth = 1
    var y = 18
    function puttext(text) {
        context.strokeText(text, settings.sx - 10, y)
        context.fillText(text, settings.sx - 10, y)
        y += 28
    }
    puttext("health: " + gamestate.hp + "/100")
}


GameScene.draw = function () {
    context.fillStyle = "#333"
    context.fillRect(0, 0, settings.sx, settings.sy)

    context.save()
    camera.orient()
    this.drawstars()
    this.drawworld()
    this.drawobjs()
    context.restore()

    this.drawstatus()

    document.title = UFX.ticker.getfpsstr()
}


var GrowScene = Object.create(GameScene)

GrowScene.start = function () {
    this.t = 0
}

GrowScene.think = function (dt) {
    this.t += dt
    if (this.t < 1) {
        this.wobbling = false
    } else if (this.t < 2) {
        this.wobbling = true
    } else if (this.t < 2.5) {
        this.wobbling = false
    } else {
        UFX.scene.pop()
    }
    if (this.t > 2 && gamestate.worldsize !== this.newsize) {
        gamestate.setworldsize(this.newsize)
    }

    camera.mode = "planet"
    camera.settarget([0, 0])
    camera.think(dt)
    disableall()
}

GrowScene.drawworld = function () {
    context.save()
    if (this.wobbling) {
        context.rotate(this.t * 10)
        context.scale(0.8, 1.2)
        context.rotate(-this.t * 10)
    }
//    context.scale(s, s)
    GameScene.drawworld.call(this)
    context.restore()
}

GrowScene.drawstatus = function () {
    context.save()
    context.globalAlpha = 0.2
    GameScene.drawstatus.call(this)
    context.restore()
}





