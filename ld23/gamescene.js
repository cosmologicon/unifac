
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
    gamestate.setworldsize(450)
/*    var s = new Springboard()
    s.level = 3
    gamestate.addstructure(s)
  monsters.push(Overlord) */

}

GameScene.think = function (dt) {
    if (UFX.key.ispressed.backspace) dt *= 3

    if (dt > 0.1) dt = 0.1

    // Handle keyboard input
    var mkeys = {
        up: !!(UFX.key.ispressed.up || UFX.key.ispressed.W || UFX.key.ispressed.comma || UFX.key.ispressed["key#188"]),
        down: !!(UFX.key.ispressed.down || UFX.key.ispressed.S || UFX.key.ispressed.O),
        left: !!(UFX.key.ispressed.left || UFX.key.ispressed.A),
        right: !!(UFX.key.ispressed.right || UFX.key.ispressed.D || UFX.key.ispressed.E),
        act: !!(UFX.key.ispressed.space || UFX.key.ispressed.enter),
    }
    mkeys.act == mkeys.act || mkeys.down
    var nkeys = {}
    UFX.key.events().forEach(function (event) {
        if (event.type === "down") {
            nkeys[event.name] = true
        }
    })
    nkeys.up = nkeys.up || nkeys.W || nkeys.comma || nkeys["key#188"]
    nkeys.down = nkeys.down || nkeys.S || nkeys.O
    nkeys.left = nkeys.left || nkeys.A
    nkeys.right = nkeys.right || nkeys.D || nkeys.E
    nkeys.act = nkeys.space || nkeys.enter || nkeys.down
    you.move(mkeys, nkeys)

    if (nkeys["1"]) gamestate.upgradestructure()
    if (nkeys["2"]) upgrade("upgradejump")
    if (nkeys["3"]) upgrade("upgradekick")
    if (nkeys["4"]) upgrade("upgradeworld")
    if (nkeys["5"]) build("buildtower")
    if (nkeys["6"]) build("buildhospital")
    if (nkeys["7"]) build("buildspring")
    if (nkeys["8"]) build("buildbubbler")
    if (nkeys["9"]) build("buildsilo")
    if (nkeys["0"]) gamestate.removestructure()


    if (gamestate.level === 0) {
        if (UFX.random(6) < dt) monsters.push(new FastFly(UFX.random(tau), 400))
//        if (UFX.random(4) < dt) monsters.push(new Fly(UFX.random(tau), 140))
    } else if (gamestate.level === 1) {
        if (UFX.random(6) < dt) monsters.push(new Fly(UFX.random(tau), 200))
        if (UFX.random(6) < dt) monsters.push(new Gnat(UFX.random(tau), 200))
    } else if (gamestate.level === 2) {
        if (UFX.random(7) < dt) monsters.push(new Fly(UFX.random(tau), 300))
        if (UFX.random(7) < dt) monsters.push(new Gnat(UFX.random(tau), 300))
        if (UFX.random(7) < dt) monsters.push(new Mite(UFX.random(tau), 300))
    } else if (gamestate.level === 3) {
        if (UFX.random(12) < dt) monsters.push(new Fly(UFX.random(tau), 400))
        if (UFX.random(12) < dt) monsters.push(new Gnat(UFX.random(tau), 400))
        if (UFX.random(12) < dt) monsters.push(new Mite(UFX.random(tau), 400))
        if (UFX.random(6) < dt) monsters.push(new FastFly(UFX.random(tau), 400))
    } else if (gamestate.level === 4) {
        if (UFX.random(6) < dt) monsters.push(new FastFly(UFX.random(tau), 500))
        if (UFX.random(6) < dt) monsters.push(new FastGnat(UFX.random(tau), 500))
        if (UFX.random(6) < dt) monsters.push(new FastMite(UFX.random(tau), 500))
    } else if (gamestate.level === 5) {
        if (UFX.random(5) < dt) monsters.push(new FastFly(UFX.random(tau), 600))
        if (UFX.random(5) < dt) monsters.push(new FastGnat(UFX.random(tau), 600))
        if (UFX.random(5) < dt) monsters.push(new FastMite(UFX.random(tau), 600))
    } else if (gamestate.level === 6) {
        if (UFX.random(10) < dt) monsters.push(new FastFly(UFX.random(tau), 700))
        if (UFX.random(10) < dt) monsters.push(new FastGnat(UFX.random(tau), 700))
        if (UFX.random(10) < dt) monsters.push(new FastMite(UFX.random(tau), 700))
        if (UFX.random(10) < dt) monsters.push(new FasterFly(UFX.random(tau), 700))
        if (UFX.random(10) < dt) monsters.push(new FasterGnat(UFX.random(tau), 700))
        if (UFX.random(10) < dt) monsters.push(new FasterMite(UFX.random(tau), 700))
    } else if (gamestate.level === 7) {
        if (UFX.random(6) < dt) monsters.push(new FasterFly(UFX.random(tau), 700))
        if (UFX.random(6) < dt) monsters.push(new FasterGnat(UFX.random(tau), 700))
        if (UFX.random(6) < dt) monsters.push(new FasterMite(UFX.random(tau), 700))
    } else if (gamestate.level === 8) {
        if (UFX.random(5) < dt) monsters.push(new FasterFly(UFX.random(tau), 800))
        if (UFX.random(5) < dt) monsters.push(new FasterGnat(UFX.random(tau), 800))
        if (UFX.random(5) < dt) monsters.push(new FasterMite(UFX.random(tau), 800))
    }
/*
    if (UFX.random(10) < dt) {
        monsters.push(new Gnat(UFX.random(tau), 200))
    }
    if (UFX.random(10) < dt) {
        monsters.push(new Mite(UFX.random(tau), 200))
    }*/

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
    if (dt) {
        checklevel()
    }
    
    if (nkeys.F7) {
        gamestate.bank = Math.min(gamestate.bank * 2, 1000000)
    }
    if (nkeys.F8) {
        advancelevel()
    }
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
    if (gamestate.worldsize < 1) return
    // Draw world
    context.save()
    var s = gamestate.worldr + 50 / Math.max(gamestate.worldr, 15)
    context.scale(s, s)
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
        context.strokeText(text, settings.sx - 30, y)
        context.fillText(text, settings.sx - 30, y)
        y += 28
    }
    puttext("health: " + Math.floor(gamestate.hp) + "/100")
    puttext("bank: $" + gamestate.bank)
    if (gamestate.unlocked.shock) {
        var f = you.shockfrac()
        var x0 = settings.sx - 10, y0 = 90
        context.beginPath()
        context.moveTo(x0, y0)
        context.lineTo(x0, y0 - 80)
        context.strokeStyle = "rbga(0, 0, 0, 0.4)"
        context.lineWidth = 10
        context.stroke()
        context.beginPath()
        context.moveTo(x0, y0)
        context.lineTo(x0, y0 - 80*f)
        context.strokeStyle = "blue"
        context.lineWidth = 8
        context.stroke()
        context.lineWidth = 1
    }
    for (var j = 0 ; j < gamestate.njumps ; ++j) {
        context.beginPath()
        context.arc(settings.sx - 16, 104 + 22 * j, 9, 0, tau)
        context.fillStyle = j < you.jumps ? "rgba(0, 0, 0, 0.4)" : "green"
        context.strokeStyle = "white"
        context.lineWidth = 1
        context.fill()
        context.stroke()
    }
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
        GameScene.think(0)
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

var GameOverScene = Object.create(GameScene)

GameOverScene.start = function () {
    this.alpha = 0
    this.t = 0
    gamestate.worldsize = 99
    gamestate.worldr = gamestate.worldsize / tau
}

GameOverScene.think = function (dt) {
    this.t += dt
    gamestate.worldsize -= 120 * dt
    gamestate.worldr = gamestate.worldsize / tau
    if (this.t > 0.7) {
        this.alpha = Math.min(this.alpha + dt, 0.8)
        camera.mode = "planet"
        camera.settarget([you.x, you.y + 44])
        camera.think(dt)
        GameOverTitle.think(dt)
        disableall()
    }
}

GameOverScene.draw = function () {
    context.fillStyle = "#333"
    context.fillRect(0, 0, settings.sx, settings.sy)
    context.save()
    camera.orient()
    this.drawstars()
    this.drawworld()
    you.draw()
    context.restore()
    context.globalAlpha = this.alpha
    context.fillStyle = "black"
    context.fillRect(0, 0, settings.sx, settings.sy)
    context.globalAlpha = 1
    context.save()
    GameOverTitle.draw()
    context.restore()
}

GameOverScene.drawstatus = function () {
    context.save()
    context.globalAlpha = 0.2
    GameScene.drawstatus.call(this)
    context.restore()
}

