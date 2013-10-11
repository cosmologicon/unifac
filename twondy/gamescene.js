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

    if (nkeys.esc) {
        UFX.scene.push(PauseScene)
    }
    
    if (UFX.random() * 3 < dt && monsters.length < 1) {
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
}

function objdraw(obj) {
    context.save()
    obj.draw()
    context.restore()
}

GameScene.drawobjs = function () {
    structures.forEach(objdraw)
    beffects.forEach(objdraw)
    hitters.forEach(objdraw)
    monsters.forEach(objdraw)
    ehitters.forEach(objdraw)
    objdraw(you)
    feffects.forEach(objdraw)
}

GameScene.drawstatus = function () {
    UFX.draw("font 26px~Viga textalign right textbaseline middle fillstyle #AAF ss black lw 1")
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
    HUDeffects.forEach(objdraw)
}

GameScene.draw = function () {
    context.fillStyle = "#111"
    context.fillRect(0, 0, settings.sx, settings.sy)

    context.save()
    camera.orient()
    stars.draw()
    Twondy.draw()
    this.drawobjs()
    context.restore()

    this.drawstatus()
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






