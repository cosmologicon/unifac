var IsEffect = {
    init: function () {
        effects.push(this)
    },
    die: function () {
        effects.splice(effects.indexOf(this), 1)
    },
}

var Offset = {
    init: function (dx, dy) {
        this.offx = dx || 0
        this.offy = dy || 0
    },
    draw: function () {
        context.translate(this.offx, this.offy)
    },
}

var Ascends = {
    init: function (vh) {
        this.h = 0
        this.vh = vh || 0
    },
    think: function (dt) {
        this.h += this.vh * dt
    },
    draw: function () {
        context.translate(0, -Math.pow(this.h, 0.75)*3)
    },
}

var Descends = {
    init: function (h0, vh) {
        this.h = h0
        this.vh = vh || 0
    },
    think: function (dt) {
        this.h = Math.max(this.h - this.vh * dt, 0)
        if (this.h <= 0) this.die()
    },
    draw: function () {
        context.translate(0, this.h)
    },
}

var AtAngle = {
    init: function (a) {
        this.zeta = a || 0
    },
    draw: function () {
        context.rotate(this.zeta)
    },
}


var Fades = {
    init: function (fadetime) {
        this.alpha = 0
        this.fadetime = fadetime || 0.8
        this.disappearing = false
    },
    disappear: function () {
        this.disappearing = true
    },
    think: function (dt) {
        if (this.disappearing) {
            this.alpha = Math.max(0, this.alpha - dt / this.fadetime)
            if (!this.alpha) this.die()
        } else {
            this.alpha = Math.min(1, this.alpha + dt / this.fadetime)
        }
    },
    draw: function () {
        context.globalAlpha *= this.alpha
    },
}

var AutoFadesOut = {
    think: function (dt) {
        if (this.alpha >= 1) this.disappear()
    },
}

var GetsPlanetInfo = {
    init: function (planet) {
        this.planet = planet
    },
    think: function () {
        this.texts = this.planet.getinfo()
        this.color = this.planet.explored < 1 ? "gray" : this.planet.color
    },
}

var TextEffect = {
    init: function (text, color, font) {
        this.text = text
        this.color = color || "white"
        this.font = font || "30px 'Russo One'"
    },
    draw: function () {
        context.scale(0.5, 1)
        context.fillStyle = this.color
        context.font = this.font
        context.textAlign = "center"
        context.fillText(this.text, 0, 0)
    },
}

var IsSquare = {
    init: function (r, color) {
        this.r = r
        this.color = color || "white"
    },
    draw: function () {
        context.strokeStyle = this.color
        context.lineWidth = 2
        context.strokeRect(-this.r, -this.r, 2*this.r, 2*this.r)
    }
}

var GrowingSquare = {
    init: function () {
        this.color = "blue"
        this.t = 0
    },
    think: function (dt) {
        this.t += dt
        if (this.t > 0.5) this.die()
    },
    draw: function () {
        var p = this.t * 25
        context.globalAlpha = Math.max(1. - (2 * this.t), 0)
        context.strokeStyle = this.color
        context.lineWidth = 2
        context.strokeRect(-p, -p, 2*p, 2*p)
    }
}

var DrawReticule = {
    init: function (color, r) {
        this.ralpha = 0
        this.color = color || "white"
        this.r = r || 40
        var r1 = r + 4, r2 = r + 20
        var dstr = "b m 0 " + r + " l 0 " + r2 + " m " + r + " 0 l " + r2 + " 0 s " +
                   "b a 0 0 " + r + " 0 1.5708 s b a 0 0 " + r1 + " 0 1.5708 s"
        this.drawstring = dstr + " r 3.1416 " + dstr
    },
    think: function (dt) {
        this.ralpha += 0.8 * dt
    },
    draw: function () {
        context.save()
        context.rotate(this.ralpha)
        UFX.draw(context, "lw 1 ss " + this.color + " " + this.drawstring)
        context.restore()
    },
}

var DrawInfo = {
    init: function (texts, color, r) {
        this.texts = texts || ["planet or something", "isn't it pretty?"]
        this.color = color || "white"
        this.r = r || 30
    },
    draw: function () {
        context.textAlign = "left"
        context.textBaseline = "middle"
        context.font = "14px 'Chau Philomene One'"
        UFX.draw(context, "fs", this.color, "ss", this.color, "lw 1 b o 0 0 2 f")
        var r = this.r, w = context.measureText(this.texts[0]).width
        UFX.draw(context, "b m 0 0 l", r, -r, "l", r + w + 8, -r, "s")
        this.texts.forEach(function (text, j) {
            if (j == 1) context.font = "12px 'Chau Philomene One'"
            context.fillText(text, (j ? r + 8 : r + 4), (j ? -r-4 + 14 * j : -r-8))
        })
    },
}

var DrawSpeech = {
    init: function (texts) {
        this.texts = texts || ["planet or something", "isn't it pretty?"]
    },
    draw: function () {
        context.textAlign = "center"
        context.textBaseline = "bottom"
        context.font = "12px 'Chau Philomene One'"
        context.fillStyle = "white"
        var w = 0, h = 0, d = 4
        this.texts.forEach(function (text) {
            var m = context.measureText(text)
            w = Math.max(w, m.width)
            h += 16
        })
        var x0 = w/2, x1 = w/2+d, y0 = h, y1 = h+d
        UFX.draw(context, "( m", -x0, -y1, "q", -x1, -y1, -x1, -y0, "l", -x1, 0, "q", -x1, d, -x0, d,
                    "l -3", d, "q -3 12 -12 12 q 3 12 3", d, "l", x0, d, "q", x1, d, x1, 0,
                    "l", x1, -y0, "q", x1, -y1, x0, -y1, ") f")
        context.fillStyle = "black"
        this.texts.forEach(function (text, j) {
            context.fillText(text, 0, -h + 16 + j * 16)
        })
    },
}

var DrawMeteor = {
    draw: function () {
        UFX.draw.circle(context, 0, 0, 2, "rgb(100,0,0)")
    },
}


function DistressCall(x, y, a) {
    return UFX.Thing()
              .addcomp(IsEffect)
              .addcomp(InSpace, x, y)
              .addcomp(AtAngle, a)
              .addcomp(Ascends, 600)
              .addcomp(TimesOut, 20)
              .addcomp(TextEffect, "HELP!", "blue")              
}

function Meteor(x, y) {
    return UFX.Thing()
              .addcomp(IsEffect)
              .addcomp(InSpace, x, y)
              .addcomp(AtAngle, UFX.random(100))
              .addcomp(Descends, UFX.random(300, 5000), 400)
              .addcomp(Fades, 0.3)
              .addcomp(AutoFadesOut)
              .addcomp(DrawMeteor)
}


function ClickBox(x, y) {
    return UFX.Thing()
              .addcomp(IsEffect)
              .addcomp(InSpace, x, y)
              .addcomp(GrowingSquare)
}

function TargetEffect(x, y, color) {
    return UFX.Thing()
              .addcomp(IsEffect)
              .addcomp(InSpace, x, y)
              .addcomp(Spins, 3.0)
              .addcomp(IsSquare, 4, color)
}

function InfoBox(obj) {
    return UFX.Thing()
              .addcomp(IsEffect)
              .addcomp(Follows, obj)
              .addcomp(Fades)
              .addcomp(DrawInfo, null, "#AAF")
}

function PlanetInfoBox(planet) {
    return UFX.Thing()
              .addcomp(IsEffect)
              .addcomp(Follows, planet)
              .addcomp(GetsPlanetInfo, planet)
              .addcomp(Fades)
              .addcomp(DrawInfo, null, planet.color, planet.r*2)
              .addcomp(DrawReticule, planet.color, planet.r + 4)
}

function SpeechBubble(talker) {
    return UFX.Thing()
              .addcomp(IsEffect)
              .addcomp(Follows, talker)
              .addcomp(Offset, 30, -30)
              .addcomp(Fades)
              .addcomp(DrawSpeech, talker.info)
}



