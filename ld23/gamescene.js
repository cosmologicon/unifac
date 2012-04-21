
var GameScene = Object.create(UFX.scene.Scene)


GameScene.start = function () {

    gamestate.worldr = gamestate.worldsize / tau

    this.ptexture = context.createRadialGradient(0, 4, 3, 2, 2, 5)
    this.ptexture.addColorStop(0, "blue")
    this.ptexture.addColorStop(0.1, "green")
    this.ptexture.addColorStop(0.2, "blue")
    this.ptexture.addColorStop(0.3, "green")
    this.ptexture.addColorStop(0.39, "green")
    this.ptexture.addColorStop(0.4, "blue")
    this.ptexture.addColorStop(0.49, "blue")
    this.ptexture.addColorStop(0.5, "green")
    this.ptexture.addColorStop(0.59, "green")
    this.ptexture.addColorStop(0.6, "blue")
    this.ptexture.addColorStop(0.69, "blue")
    this.ptexture.addColorStop(0.7, "green")
    this.ptexture.addColorStop(0.8, "blue")
    this.ptexture.addColorStop(0.9, "green")
    this.ptexture.addColorStop(1.0, "blue")

}

GameScene.think = function (dt) {

    // Handle keyboard input
    var mkeys = {
        up: !!(UFX.key.ispressed.up || UFX.key.ispressed.W),
        down: !!(UFX.key.ispressed.down || UFX.key.ispressed.S),
        left: !!(UFX.key.ispressed.left || UFX.key.ispressed.A),
        right: !!(UFX.key.ispressed.right || UFX.key.ispressed.D),
    }
    var nkeys = {}
    UFX.key.events().forEach(function (event) {
        if (event.type === "down") {
            nkeys[event.name] = true
        }
    })
    you.move(mkeys, nkeys)
    
    you.think(dt)

    you.updatestate()
    
    camera.settarget(you.lookingat())
    camera.think(dt)
    
}

GameScene.draw = function () {
    context.fillStyle = "#333"
    context.fillRect(0, 0, settings.sx, settings.sy)

    context.save()
    context.translate(settings.sx/2, settings.sy/2)
    context.scale(camera.zoom, -camera.zoom)
    context.translate(0, -camera.y - gamestate.worldr)
    context.rotate(camera.x / gamestate.worldr)

    // Draw world
    context.save()
    context.scale(gamestate.worldr, gamestate.worldr)
    context.beginPath()
    context.arc(0, 0, 1, 0, tau)
    context.lineWidth = 0.01
    context.fillStyle = this.ptexture
    context.strokeStyle = "black"
    context.fill()
    context.stroke()
    context.restore()

    you.draw()

    context.restore()

//    document.title = UFX.ticker.getfpsstr()
}


