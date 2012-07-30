// Text and special effects

var ScreenBound = {
    init: function (x, y) {
        this.x = x || 0
        this.y = y || 0
    },
    draw: function () {
        context.translate(settings.sx/2 + this.x, settings.sy/2 + this.y)
    },
}

var Floats = {
    init: function (vy) {
        this.vy = vy || 0
    },
    think: function (dt) {
        this.y += this.vy * dt
    },
}

var ScrollsLeft = {
    init: function (vx0, vx1) {
        this.vx0 = vx0 || 0
        this.vx1 = vx1 || 0
    },
    think: function (dt) {
        var vx = Math.abs(this.x) < this.vx1 * 0.5 ? this.vx1 : this.vx0
        this.x -= vx * dt
        this.alive = this.x > -settings.sx
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

var Italic = {
    draw: function () {
        UFX.draw("xshear -0.4")
    }
}

var StrokedText = {
    init: function (text, color0, color1) {
        this.text = text || "???"
        this.color0 = color0 || "white"
        this.color1 = color1 || "black"
        this.font = "48px Viga"
    },
    settext: function (text, color0, color1) {
        this.text = text || this.text || "???"
        this.color0 = color0 || this.color0 || "white"
        this.color1 = color1 || this.color1 || "black"
    },
    draw: function () {
        context.font = this.font
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillStyle = this.color0
        context.fillText(this.text, 0, 0)
        context.strokeStyle = this.color1
        context.strokeText(this.text, 0, 0)
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


function CheatModeEffect() {
    this.x = settings.sx
    this.alive = true
}
CheatModeEffect.prototype = UFX.Thing()
       .addcomp(ScreenBound)
       .addcomp(ScrollsLeft, 4000, 100)
       .addcomp(Italic)
       .addcomp(StrokedText, "cheat mode enabled", "yellow", "orange")


// TODO: organize all these components better
var CarriesEntities = {
    addentity: function (e) {
        this.entities.push(e)
    },
    removeentity: function (e) {
        this.entities = this.entities.filter(function (ent) { return ent !== e })
    },
    think: function (dt) {
        this.entities = this.entities.filter(function (e) { return e.alive })
        if (dt && !this.entities.length) this.disappearing = true
    },
}

var GrowsInShrinksOut = {
    init: function () {
        this.zfactor = 0
        this.disappearing = false
        this.vz = 2
    },
    think: function (dt) {
        if (this.disappearing) {
            this.zfactor = Math.max(0, this.zfactor - this.vz * dt)
            if (!this.zfactor) this.alive = false
        } else {
            this.zfactor = Math.min(1, this.zfactor + this.vz * dt)
        }
    },
    draw: function () {
        UFX.draw("z", this.zfactor, this.zfactor)
    },
}

var HasTilt = {
    draw: function () {
        UFX.draw("r", this.A)
    },
}

var DrawReticule = {
    init: function (sx, sy) {
        this.sizex = sx || 10
        this.sizey = sy || 10
        this.rtheta = 0
        this.romega = 2
    },
    think: function (dt) {
        this.rtheta += this.romega * dt
    },
    draw: function () {
        UFX.draw("[ [ z", this.sizex, this.sizey, "b o 0 0 1 ]",
                 "fs rgb(0,0,0) f lw 0.8 ss blue s clip",
                 "[ z", this.sizex, this.sizey, "b o 0 0.5 1 o 0 1 1 o 0 1.5 1 ] lw 0.3 s ]",
                 "[ z", this.sizex, this.sizey, "r", this.rtheta,
                 "b m 0 1.2 l 0 2 m 0 -1.2 l 0 -2 m 1.2 0 l 2 0 m -1.2 0 l -2 0",
                 "m 1.2 0 a 0 0 1.2 0 1.57 m 1.4 0 a 0 0 1.4 0 1.57",
                 "m -1.2 0 a 0 0 1.2 3.14 4.71 m -1.4 0 a 0 0 1.4 3.14 4.71 ]",
                 "lw 0.8 ss blue s"
        )
    },
    setclip: function () {
        UFX.draw("[")
        WorldBound.draw.apply(this)
        HasTilt.draw.apply(this)
        UFX.draw("z", this.sizex, this.sizey, "( m 100 0 l 1 0 a 0 0 1 0 3.14 l -100 0 l -100 -100 l 100 -100 ) ] clip")
    },
}

function Portal(x, y) {
    this.x = x
    this.y = y
    this.A = UFX.random(-0.5, 0.5)
    this.entities = []
    this.alive = true
    this.think(0)
}
Portal.prototype = UFX.Thing()
                    .addcomp(WorldBound)
                    .addcomp(CarriesEntities)
                    .addcomp(GrowsInShrinksOut)
                    .addcomp(HasTilt)
                    .addcomp(DrawReticule, 16, 6)




