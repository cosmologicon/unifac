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

var ExpandingLines = {
    init: function (size) {
        this.size = size || 100
        this.linet = 0
        this.nlines = 20

        this.lines = new Array(200)
        for (var j = 0 ; j < 200 ; ++j) {
            var c = UFX.random.rand(0, 192)
            var color = "rgb(" + c + "," + c + "," + c + ")"
            this.lines[j] = [UFX.random(-1, 1), UFX.random(-1, 1), UFX.random(5, 10), UFX.random(100), color]
        }
    },
    think: function (dt) {
        this.linet += dt
    },
    draw: function () {
        for (var j = 0 ; j < this.nlines ; ++j) {
            var line = this.lines[j]
            context.strokeStyle = line[4]
            context.save()
            context.translate(line[0] * this.linet * this.size, line[1] * this.linet * this.size)
            context.rotate(line[2] * this.linet + line[3])
            context.beginPath()
            context.moveTo(0, this.size / 5)
            context.lineTo(0, -this.size / 5)
            context.stroke()
            context.restore()
        }
    }
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

var IsArrow = {
    draw: function () {
        ps = [[-8, -16], [-2, -14], [-4, -32], [4, -32], [2, -14], [8, -16]]
        context.beginPath()
        context.moveTo(0, -6)
        ps.forEach(function (p) { context.lineTo(p[0], p[1]) })
        context.closePath()
        context.fillStyle = "rgba(255,255,0,0.5)"
        context.fill()
        context.strokeStyle = "rgba(255,0,0,0.5)"
        context.stroke()
    },
}

var FollowsPlayer = {
    init: function () {
        this.alive = true
    },
    think: function (dt) {
        this.visible = you.y <= 0
        this.x = gamestate.buildat(you.x)
    },
    draw: function () {
        if (!this.visible) {
            context.globalAlpha = 0
        }
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

function DamageBox (amount, px, py) {
    this.alpha = 1
    this.x = px
    this.y = py
    this.settext("-" + amount)
    this.alive = true
    this.think(0)
}
DamageBox.prototype = UFX.Thing()
                        .addcomp(WorldBound)
                        .addcomp(Floats, 100)
                        .addcomp(Fades)
                        .addcomp(SolidText, "", "red")

function HealBox (amount, px, py) {
    this.alpha = 1
    this.x = px
    this.y = py
    this.settext("+" + amount)
    this.alive = true
    this.think(0)
}
HealBox.prototype = UFX.Thing()
                        .addcomp(WorldBound)
                        .addcomp(Floats, 100)
                        .addcomp(Fades)
                        .addcomp(SolidText, "", "green")

function UpgradeBox (px, py) {
    this.alpha = 1
    this.x = px
    this.y = py
    this.alive = true
    this.think(0)
}
UpgradeBox.prototype = UFX.Thing()
                        .addcomp(WorldBound)
                        .addcomp(Floats, 60)
                        .addcomp(Fades, 0.5)
                        .addcomp(SolidText, "upgrade!", "white")



var GameOverTitle = {
    alpha: 0,
    t: 0,
    think: function (dt) {
        this.t += dt
        this.alpha = Math.min(Math.max(this.t - 1, 0), 1)
    },
    draw: function () {
        context.font = "80px Viga"
        context.fillStyle = "blue"
        context.strokeSTyle = "black"
        context.globalAlpha = this.alpha
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText("GAME OVER", settings.sx/2, settings.sy/2)
        context.strokeText("GAME OVER", settings.sx/2, settings.sy/2)
    },
}


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

Indicator = UFX.Thing()
               .addcomp(FollowsPlayer)
               .addcomp(WorldBound)
               .addcomp(IsArrow)

function Rubble(px, py) {
    this.x = px
    this.y = py
    this.alive = true
    this.think(0)
}
Rubble.prototype = UFX.Thing()
                      .addcomp(WorldBound)
                      .addcomp(FadesOutward, 40, 60, 0, "brown")

function Shatter(px, py, size, n) {
    this.x = px
    this.y = py
    this.size = size
    this.nlines = n || 20
    this.alive = true
    this.think(0)
}
Shatter.prototype = UFX.Thing()
                      .addcomp(WorldBound)
                      .addcomp(FadesAway, 0.5)
                      .addcomp(ExpandingLines)
