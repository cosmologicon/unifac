
var GameScene = Object.create(UFX.scene.Scene)


GameScene.start = function () {

    Twondy.init()
    this.stars = UFX.random.spread(200, 1, 1600, 1600, -800, -800)
    this.starcolors = []
    this.starrs = []
    while (this.starcolors.length < this.stars.length) {
        this.starcolors.push(UFX.random.choice("#112 #020 #211 #210 #220 #202".split(" ")))
        this.starrs.push(UFX.random.choice([4, 5, 7, 9]))
    }

    // Yes these are supposed to be globals
    hitters = []  // objects that the player can run into
    ehitters = []  // objects that the enemies can run into
    effects = [Indicator]  // text and graphical effects
//    structures = []  // structures
    monsters = []
    HUDeffects = []  // Effects that aren't world-bound


    structures = []
    gamestate.setworldsize(450)

/*
    gamestate.setworldsize(1200)
    gamestate.level = 8
    for (var j = 5 ; j < 24 ; j += 4) {
        var s = new Springboard()
        s.level = 8
        gamestate.addstructure(s, j)
    }
    monsters.push(Overlord)
*/

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
    you.move(mkeys, nkeys, dt)

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

    if (nkeys.esc) {
        UFX.scene.push(PauseScene)
    }


    if (gamestate.level === 0) {
        if (UFX.random(4) < dt || monsters.length < 1) monsters.push(new Fly(UFX.random(tau), 140))
    } else if (gamestate.level === 1) {
        if (UFX.random(6) < dt || monsters.length < 2) monsters.push(new Fly(UFX.random(tau), 200))
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
        if (UFX.random(12) < dt) monsters.push(new FastFly(UFX.random(tau), 500))
        if (UFX.random(12) < dt) monsters.push(new FastGnat(UFX.random(tau), 500))
        if (UFX.random(12) < dt) monsters.push(new FastMite(UFX.random(tau), 500))
    } else if (gamestate.level === 5) {
        if (UFX.random(10) < dt) monsters.push(new FastFly(UFX.random(tau), 600))
        if (UFX.random(10) < dt) monsters.push(new FastGnat(UFX.random(tau), 600))
        if (UFX.random(10) < dt) monsters.push(new FastMite(UFX.random(tau), 600))
    } else if (gamestate.level === 6) {
        if (UFX.random(8) < dt) monsters.push(new FastFly(UFX.random(tau), 700))
        if (UFX.random(8) < dt) monsters.push(new FastGnat(UFX.random(tau), 700))
        if (UFX.random(8) < dt) monsters.push(new FastMite(UFX.random(tau), 700))
    } else if (gamestate.level === 7 || gamestate.level === 9) {
        if (UFX.random(12) < dt) monsters.push(new FasterFly(UFX.random(tau), 700))
        if (UFX.random(12) < dt) monsters.push(new FasterGnat(UFX.random(tau), 700))
        if (UFX.random(12) < dt) monsters.push(new FasterMite(UFX.random(tau), 700))
    } else if (gamestate.level === 8) {
        if (UFX.random(20) < dt) monsters.push(new FasterFly(UFX.random(tau), 800))
        if (UFX.random(20) < dt) monsters.push(new FasterGnat(UFX.random(tau), 800))
        if (UFX.random(20) < dt) monsters.push(new FasterMite(UFX.random(tau), 800))
        var x = Overlord.x + UFX.random(0, 0.5), y = Overlord.y + UFX.random(-10, 150)
        if (UFX.random(6) < dt) monsters.push(new Fly(x, y))
        if (UFX.random(6) < dt) monsters.push(new Gnat(x, y))
        if (UFX.random(6) < dt) monsters.push(new Mite(x, y))
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
        HUDeffects.forEach(function (effect) { effect.think(dt) })
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
        HUDeffects.push(new CheatModeEffect())
        settings.cheat = true
        for (var s in gamestate.buildunlocked) {
            gamestate.buildunlocked[s] = true
        }
        gamestate.unlocked.grow = true
        gamestate.unlocked.shock = 10
        gamestate.unlocked.jumps = 10
        gamestate.unlocked.upgradestruct = 11
        gamestate.unlocked.structures = true
        gamestate.level = 3
    }
    if (nkeys.F8) {
        advancelevel()
    }
    
    if (settings.cheat) {
        gamestate.bank = Math.min(gamestate.bank + Math.floor(5000 * dt), 1000000)
    }
}


GameScene.drawstars = function () {
    // Draw stars
    var t = Date.now() * 0.001
    context.save()
    var s = Math.pow(camera.zoom, -0.85)
    context.scale(s, s)
    // coords = [([2, 1][j % 2], j * math.pi / 5) for j in range(10)]
    // " ".join("l %.2f %.2f" % (r * math.cos(theta), r * math.sin(theta)) for r, theta in coords)
    var path = "( m 2.00 0.00 l 0.81 0.59 l 0.62 1.90 l -0.31 0.95 l -1.62 1.18 l -1.00 0.00 l -1.62 -1.18 l -0.31 -0.95 l 0.62 -1.90 l 0.81 -0.59 )"
    context.strokeStyle = "#333"
    for (var j = 0 ; j < this.stars.length ; ++j) {
        UFX.draw("[ t", this.stars[j][0], this.stars[j][1], "z", this.starrs[j], this.starrs[j])
        if (j % 2) UFX.draw("hflip")
        UFX.draw("r", (0.2 + 0.001 * j) * t % tau)
        UFX.draw(path, "fs", this.starcolors[j], "lw", 0.6/this.starrs[j], "f s ]")
    }
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
    UFX.draw("textalign right textbaseline middle fillstyle #AAF ss black lw 1")
    var y = 18
    function puttext(text) {
        context.strokeText(text, settings.sx - 30, y)
        context.fillText(text, settings.sx - 30, y)
        y += 28
    }
    puttext("health: " + Math.floor(gamestate.hp) + "/100")
    puttext("bank: $" + gamestate.bank)
    puttext(UFX.ticker.getfpsstr())
    if (gamestate.unlocked.shock) {
        var f = you.shockfrac()
        var x0 = settings.sx - 10, y0 = 90
        UFX.draw("b m", x0, y0, "l", x0, y0-80, "ss rgba(0,0,0,0.4) lw 10 s",
                 "b m", x0, y0, "l", x0, y0-80*f, "ss blue lw 8 s lw 1")
    }
    for (var j = 0 ; j < gamestate.njumps ; ++j) {
        UFX.draw("b o", settings.sx-16, 104+22*j, 9,
                 "fs", (j < you.jumps ? "rgba(0,0,0,0.4)" : "green"), "ss white lw 1 f s")
    }
    HUDeffects.forEach(function (effect) { context.save() ; effect.draw() ; context.restore() })

}

GameScene.drawworld = function () {
    Twondy.draw()
}

GameScene.draw = function () {
    context.fillStyle = "#111"
    context.fillRect(0, 0, settings.sx, settings.sy)

    context.save()
    camera.orient()
    this.drawstars()
    this.drawworld()
    this.drawobjs()
    context.restore()

    this.drawstatus()
}


var GrowScene = Object.create(GameScene)

GrowScene.start = function () {
    this.t = 0
}

GrowScene.think = function (dt) {
    this.t += dt
    if (this.t > 6.5) {
        UFX.scene.pop()
    }
    if (this.t > 3.5 && gamestate.worldsize !== this.newsize) {
        gamestate.setworldsize(this.newsize)
        GameScene.think(0)
        camera.y = -gamestate.worldr
    } else if (this.t > 4.5) {
        var nh = mechanics.worldhs[this.newsize] || 0
        var dh = nh - Twondy.h, mh = 0.3 * dt
        if (dh) {
            Twondy.settexture(Math.abs(dh) < mh ? nh : dh > 0 ? Twondy.h + mh : Twondy.h - mh)
        }
    }

    if (this.t < 3) {
        camera.mode = "planet"
        camera.settarget([0, 0])
        camera.think(dt)
    } else if (this.t < 5.5) {
    } else {
        camera.mode = "play"
        camera.settarget(you.lookingat())
        camera.think(dt)
    }
    disableall()
}

GrowScene.drawworld = function () {
    context.save()
    if (this.t > 1 && this.t < 2) {
        var s = 1 + (this.t - 1) * (2 - this.t)
//        s = 1 + Math.min(Math.max(0.7 * Math.sin((this.t - 1) * 20), -0.5), 0.5)
        context.rotate(10 * this.t)
        context.scale(1./s, s)
        context.rotate(-10 * this.t)
    }
    if (this.t > 2 && this.t < 3) {
        var s = 1 + 1.5 * (this.t - 2) * (3 - this.t)
        context.rotate(-10 * this.t)
        context.scale(1./s, s)
        context.rotate(10 * this.t)
    }
    if (this.t > 3.5 && this.t < 4.5) {
        context.scale(1 + 0.4 * Math.cos(this.t * 30) * (4.5 - this.t),
                      1 + 0.4 * Math.sin(this.t * 30) * (4.5 - this.t))
    }
    Twondy.draw()
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
    Twondy.draw()
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

PauseScene = Object.create(UFX.scene.Scene)

PauseScene.think = function (dt) {
    UFX.key.events().forEach(function (event) {
        if (event.type === "down" && event.name === "esc") {
            UFX.scene.pop()
        }
    })
}
PauseScene.draw = function () {
    context.fillStyle = "gray"
    context.fillRect(0, 0, settings.sx, settings.sy)
    context.fillStyle = "black"
    context.font = "40px Viga"
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillText("Esc to resume", settings.sx/2, settings.sy/2)
}






