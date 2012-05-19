var InSpace = {
    init: function (x, y) {
        this.x = x || 0
        this.y = y || 0
    },
    draw: function () {
        context.translate(this.x, this.y)
    },
}

var IsRound = {
    init: function (r, color) {
        this.r = r
        this.color = color || "white"
    },
    draw: function () {
        UFX.draw.circle(context, 0, 0, this.r, this.color)
    },
}

var SendsDistress = {
    init: function () {
        this.distressed = false
        this.distresst = 0
        this.distressj = 0
    },
    think: function (dt) {
        if (this.distressed) {
            this.distresst += dt
            while (this.distresst > 0.4) {
                this.distresst -= 0.4
                var a = this.distressj * 2.39996
                this.distressj += 1
                effects.push(DistressCall(this.x, this.y, a))
//                effects.push(DistressCall(this.x, this.y, a + Math.PI))
            }
        }
    },
}

var AtAngle = {
    init: function (a) {
        this.alpha = a || 0
    },
    draw: function () {
        context.rotate(this.alpha)
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

var TimesOut = {
    init: function (t) {
        this.dietimer = t || 1
    },
    think: function (dt) {
        this.dietimer -= dt
        if (this.dietimer <= 0) {
            effects.splice(effects.indexOf(this), 1)
        }
    }
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


function Planet(x, y, r, color) {
    return UFX.Thing()
              .addcomp(InSpace, x, y)
              .addcomp(IsRound, r, color)
              .addcomp(SendsDistress)
}

function DistressCall(x, y, a) {
    return UFX.Thing()
              .addcomp(InSpace, x, y)
              .addcomp(AtAngle, a)
              .addcomp(Ascends, 600)
              .addcomp(TimesOut, 20)
              .addcomp(TextEffect, "HELP!", "blue")
              
}

