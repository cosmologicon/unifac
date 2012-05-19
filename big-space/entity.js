var InSpace = {
    init: function (x, y) {
        this.x = x || 0
        this.y = y || 0
    },
    draw: function () {
        context.translate(this.x, this.y)
    },
}

var ApproachesTarget = {
    init: function (vmax) {
        this.targetx = this.x
        this.targety = this.y
        this.vmax = vmax
        this.alpha = 0
        this.targeteffect = null
    },
    settarget: function (x, y) {
        this.targetx = x
        this.targety = y
        if (this.targeteffect) {
            effects.splice(effects.indexOf(this.targeteffect), 1)
        }
        this.targeteffect = TargetEffect(x, y, this.color)
        effects.push(this.targeteffect)
    },
    draw: function () {
        context.rotate(this.alpha)
    },
    think: function (dt) {
        var dx = this.targetx - this.x, dy = this.targety - this.y
        if (dx == 0 && dy == 0) return
        this.alpha = Math.atan2(dx, -dy)
        var d = Math.sqrt(dx*dx + dy*dy)
        var d0 = this.vmax * dt
        if (d <= d0) {
            this.x = this.targetx
            this.y = this.targety
            effects.splice(effects.indexOf(this.targeteffect), 1)
            this.targeteffect = null
        } else {
            this.x += dx * d0 / d
            this.y += dy * d0 / d
        }
    },
}

var IsRound = {
    init: function (r, color) {
        this.r = r
        this.color = color || "white"
        this.grad = context.createRadialGradient(-0.5, -0.5, 0, -0.5, -0.5, 1.8)
        this.grad.addColorStop(0, this.color)
        this.grad.addColorStop(1, "black")
    },
    draw: function () {
        context.scale(this.r, this.r)
        UFX.draw.circle(context, 0, 0, 1, this.grad)
    },
}

var DrawShip = {
    init: function () {
        this.color = "orange"
    },
    draw: function () {
        UFX.draw(context, "( m 0 0 l 6 8 l 0 -8 l -6 8 ) fs rgb(128,64,0) f lw 1 ss rgb(255,128,0) s")
    }
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

var Spins = {
    init: function (omega) {
        this.omega = omega || 6.0
        this.theta = 0
    },
    think: function (dt) {
        this.theta += dt * this.omega
    },
    draw: function () {
        context.rotate(this.theta)
    }
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
        if (this.t > 0.5) effects.splice(effects.indexOf(this), 1)
    },
    draw: function () {
        var p = this.t * 25
        context.globalAlpha = Math.max(1. - (2 * this.t), 0)
        context.strokeStyle = this.color
        context.lineWidth = 2
        context.strokeRect(-p, -p, 2*p, 2*p)
    }
}


function Planet(x, y, r, color) {
    return UFX.Thing()
              .addcomp(InSpace, x, y)
              .addcomp(IsRound, r, color)
              .addcomp(SendsDistress)
}

function Ship(x, y) {
    var vmax = 120
    return UFX.Thing()
              .addcomp(InSpace, x, y)
              .addcomp(ApproachesTarget, vmax)
              .addcomp(DrawShip)
}


function DistressCall(x, y, a) {
    return UFX.Thing()
              .addcomp(InSpace, x, y)
              .addcomp(AtAngle, a)
              .addcomp(Ascends, 600)
              .addcomp(TimesOut, 20)
              .addcomp(TextEffect, "HELP!", "blue")
              
}


function ClickBox(x, y) {
    return UFX.Thing()
              .addcomp(InSpace, x, y)
              .addcomp(GrowingSquare)
}

function TargetEffect(x, y, color) {
    return UFX.Thing()
              .addcomp(InSpace, x, y)
              .addcomp(Spins, 3.0)
              .addcomp(IsSquare, 4, color)
}



