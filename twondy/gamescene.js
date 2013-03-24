var GameScene = {}


GameScene.start = function () {

    UFX.random.seed = 14045

    stars.init()
    Twondy.init()

    // Yes these are supposed to be globals
    squads = []
    hitters = []  // objects that the player can run into
    ehitters = []  // objects that the enemies can run into
    beffects = []  // effects that appear behind the characters
    feffects = []
    monsters = []
    HUDeffects = []  // Effects that aren't world-bound


    structures = [new BlockTower(tau/6), new BlockTower(tau/2), new BlockTower(5*tau/6)]
    gamestate.setworldsize(300)

    you.y = 0
    you.X = 0
    you.vx = 0
    you.vy = 0
    you.setstate(StandState)
}

GameScene.thinkargs = function (dt) {
    // Handle keyboard input
    var keystate = UFX.key.state()
    var mkeys = keystate.pressed
    var nkeys = keystate.down
    return [dt, mkeys, nkeys]
}

GameScene.think = function (dt, mkeys, nkeys) {
    mkeys = mkeys || {}
    nkeys = nkeys || {}
    if (mkeys.backspace) dt *= 3

    if (dt > 0.1) dt = 0.1

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
    
    if (nkeys.F5) {
        localStorage.twondyrecord = JSON.stringify(UFX.scene.record)
        console.log(localStorage.twondyrecord.length)
    }

    if (UFX.random() * 3 < dt && monsters.length < 1) {
//        var p = new Portal(UFX.random(tau), UFX.random(100, 200))
//        var p = new Portal(0, 120)
//        beffects.push(p)
//        monsters.push(new Aphid(p))
//        monsters.push(new Aphid())
//        squads.push(new StationSquad(10, 20, 50))
//        squads.push(new StationSquad(7, 40, 50))
        squads.push(new StationSquad(12, 70, -50))
//		squads.push(new ScorpionSquad())
    }

    hitters.forEach(function (obj) { obj.think(dt) })
    ehitters.forEach(function (obj) { obj.think(dt) })
    feffects.forEach(function (effect) { effect.think(dt) })
    beffects.forEach(function (effect) { effect.think(dt) })
    structures.forEach(function (structure) { structure.think(dt) })
    squads.forEach(function (obj) { obj.think(dt) })
    monsters.forEach(function (monster) { monster.think(dt) })
    HUDeffects.forEach(function (effect) { effect.think(dt) })
    you.think(dt)
    stars.think(dt)

    function stillalive(arr) {
        return arr.filter(function (x) { return x.alive })
    }

    you.updatestate()
    monsters.forEach(function (m) { m.updatestate() })

    you.nab(hitters)
    you.interact(structures)
    you.clonk(monsters)

    ehitters.forEach(function (ehitter) {
        ehitter.hit(monsters)
    })

    hitters = stillalive(hitters)
    ehitters = stillalive(ehitters)
    feffects = stillalive(feffects)
    beffects = stillalive(beffects)
    monsters = stillalive(monsters)
    structures = stillalive(structures)
    HUDeffects = stillalive(HUDeffects)

    camera.think(dt)
    
    updatebuttons()
    if (dt) {
        checklevel()
    }
}

GameScene.drawobjs = function () {
    function draw(obj) {
        context.save()
        obj.draw()
        context.restore()
    }

    structures.forEach(draw)
    beffects.forEach(draw)
    hitters.forEach(draw)
    monsters.forEach(draw)
    ehitters.forEach(draw)
    draw(you)
    feffects.forEach(draw)
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
    if (settings.DEBUG) puttext(UFX.ticker.getrates())
    puttext("health: " + Math.floor(gamestate.hp) + "/100")
    puttext("bank: $" + gamestate.bank)
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
    stars.draw()
    this.drawworld()
    this.drawobjs()
    context.restore()
    if (settings.DEBUG) {
	    UFX.draw("[ t", worldtoscreen(you.X, you.y), "b o 0 0 4 fs red f ]")
    }

    this.drawstatus()
}


var GrowScene = Object.create(GameScene)

GrowScene.start = function () {
    this.t = 0
    Twondy.beginwobble()
}

GrowScene.think = function (dt) {
    var k = UFX.key.state().pressed
    if (k.shift) dt *= 0.2
/*
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
    }*/
    
    Twondy.think(dt)
    
    if (Twondy.wobblet) {
        camera.mode = CameraModes.planet
    } else {
        this.t += dt
        if (this.t > 1) {
            UFX.scene.pop()
        }
        camera.mode = CameraModes.action
    }
    camera.think(dt)
    disableall()
}

GrowScene.drawworld = function () {
    context.save()
    Twondy.draw()
    context.restore()
}

GrowScene.drawstatus = function () {
    context.save()
    context.globalAlpha = 0.2
    GameScene.drawstatus.call(this)
    context.restore()
}

PauseScene = {}

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






