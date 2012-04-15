// The main gameplay Scene

var PlayScene = Object.create(UFX.scene.Scene)
PlayScene.start = function () {
    this.color = "black"
    UFX.key.watchlist = "up down left right space escape".split(" ")
    UFX.key.qcombo = true
    UFX.key.qdown = true
    UFX.key.qup = false
}
PlayScene.thinkargs = function (dt) {
    return [dt, UFX.key.events(), UFX.key.ispressed, UFX.key.combos()]
}
PlayScene.think = function (dt, keyevents, pressed, combos) {
    var scene = this
    keyevents.forEach(function (event) {
        if (event.name === "escape") {
            UFX.pause()
        }
    })
    combos.forEach(function (combo) {
        var swap = !you.facingright && settings.swapcontrols
        var cstring = combo.kstring
            .replace("left", (swap ? "forward" : "back"))
            .replace("right", (swap ? "back" : "forward"))
    
        if (cstring === "up") {
            you.nextstate = JumpState
        } else if (cstring === "back") {
            you.nextstate = TurnState
        }
    })
    you.move((pressed.right ? 1 : 0) - (pressed.left ? 1 : 0))
    you.think(dt)
    vista.settarget(you.lookingat())
    vista.think(dt)
}
PlayScene.draw = function () {
    context.fillStyle = this.color
    context.fillRect(0, 0, settings.sx, settings.sy)
    vista.draw()
    context.save()
    var p0 = vista.screenpos([0, 0])
    context.translate(p0[0], p0[1])
    context.scale(1, -1)
    context.save()
    you.draw()
    context.restore()
    context.restore()
}

