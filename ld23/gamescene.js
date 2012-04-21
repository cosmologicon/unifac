
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
        stars.push([p[0] * 4000 - 2000, p[1] * 4000 - 2000])
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
    if (UFX.random(10) < dt) {
        hitters.push(new Bubble(UFX.random(tau), 0))
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
        camera.settarget([0, 0], 0.3, 0)
    } else {
        camera.settarget(you.lookingat())
    }
    camera.think(dt * n)
    
   
}

GameScene.draw = function () {
    context.fillStyle = "#333"
    context.fillRect(0, 0, settings.sx, settings.sy)

    context.save()
    context.translate(settings.sx/2, settings.sy/2)
    context.scale(camera.zoom, -camera.zoom)
    context.translate(0, -camera.y - gamestate.worldr)
    context.rotate(camera.x)
    
    // Draw stars
    context.fillStyle = "white"
    this.stars.forEach(function (star) {
        context.beginPath()
        context.arc(star[0], star[1], 1, 0, tau)
        context.fill()
    })

    // Draw world
    context.save()
    context.scale(gamestate.worldr, gamestate.worldr)
    context.beginPath()
    context.arc(0, 0, 1, 0, tau)
    context.lineWidth = 0.01
    context.fillStyle = this.ptexture
    context.fill()
    context.fillStyle = this.stexture
    context.fill()
    context.strokeStyle = "black"
    context.stroke()
    context.restore()


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

    context.restore()

    updatebuttons()

    document.title = UFX.ticker.getfpsstr()
}


