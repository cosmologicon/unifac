// Text and special effects

var Floats = {
    init: function (vy) {
        this.vy = vy || 0
    },
    think: function (dt) {
        this.y += this.vy * dt
    },
}

var Fades = {
    init: function (valpha) {
        this.alpha = 1
        this.valpha = valpha || 1
    },
    think: function (dt) {
        this.alpha -= this.valpha * dt
        this.alive = this.alpha > 0
    },
    draw: function () {
        context.globalAlpha = Math.max(this.alpha, 0)
    },
}

var SolidText = {
    init: function (text, color) {
        this.text = text || "???"
        this.color = color || "black"
        this.font = "24px Viga"
    },
    settext: function (text, color) {
        this.text = text || this.text || "???"
        this.color = color || this.color || "black"
    },
    draw: function () {
        context.scale(1, -1)
        context.font = this.font
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillStyle = this.color
        context.fillText(this.text, 0, 0)
    },
}

var IsDart = {
    init: function () {
        this.t = 0
    },
    think: function (dt) {
        this.t += dt
        if (this.t > 0.5) this.alive = false
    },
    draw: function () {
        var sx = 1 - this.t / 0.5
        var sy = Math.sin(this.t / 0.5 * tau / 2)
        context.scale(sx * 10, sy * 40)
        context.strokeStyle = "red"
        context.lineWidth = 0.1
        context.beginPath()
        var ps = [[-2, 1], [2, 1], [-1, 2], [1, 2]]
        ps.forEach(function (p) {
            context.moveTo(0, 0)
            context.lineTo(p[0], p[1])
        })
        context.stroke()
    },
}


function MoneyBox (amount, px, py) {
    this.alpha = 1
    this.x = px
    this.y = py
    this.settext("+$" + amount)
    this.alive = true
    this.think(0)
}
MoneyBox.prototype = UFX.Thing()
                        .addcomp(WorldBound)
                        .addcomp(Floats, 100)
                        .addcomp(Fades)
                        .addcomp(SolidText, "", "yellow")


function EntryPoint (px, py, size) {
    this.x = px
    this.y = py
    this.size = size || 1
    this.t = 0
    this.alive = true
    this.think(0)
}
EntryPoint.prototype = UFX.Thing()
                          .addcomp(WorldBound)
                          .addcomp(IsDart)


