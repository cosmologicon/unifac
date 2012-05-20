var InSpace = {
    init: function (x, y) {
        this.x = x || 0
        this.y = y || 0
    },
    draw: function () {
        context.translate(this.x, this.y)
    },
}

var Follows = {
    init: function (parent) {
        this.parent = parent
    },
    draw: function () {
        context.translate(this.parent.x, this.parent.y)
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
            this.targeteffect.die()
        }
        this.targeteffect = TargetEffect(x, y, this.color)
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
            this.targeteffect.die()
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
        this.grad0 = context.createRadialGradient(-0.5, -0.5, 0, -0.5, -0.5, 1.8)
        this.grad0.addColorStop(0, "#333")
        this.grad0.addColorStop(1, "black")
        this.grad1 = context.createRadialGradient(-0.5, -0.5, 0, -0.5, -0.5, 1.8)
        this.grad1.addColorStop(0, this.color)
        this.grad1.addColorStop(1, "black")
    },
    draw: function () {
        context.scale(this.r, this.r)
        var color = this.explored < 1 ? this.grad0 : this.grad1
        UFX.draw.circle(context, 0, 0, 1, color)
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

var DrawSaucer = {
    init: function () {
    },
    draw: function () {
        UFX.draw(context, "fs rgb(64,64,64) lw 1 ss rgb(128,128,128)")
        UFX.draw(context, "[ z 2 1 b o 0 -6 4 ] f s")
        UFX.draw(context, "( m 0 -6 l -12 -6 l -24 -4 q -40 4 0 4 q 40 4 24 -4 l 12 -6 ) f s")
    }
}

var OscillatesWhenIdle = {
    init: function (psi) {
        this.beta = UFX.random(100)
        this.psi = (psi || 1) * UFX.random(0.85, 1.15)
        this.y0 = this.y
    },
    think: function (dt) {
        if (!this.interacting) {
            this.beta += this.psi * dt
        }
        this.y = this.y0 + 20 * Math.sin(this.beta)
    },
    draw: function () {
        context.rotate(0.15 * Math.cos(this.beta))
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
            while (this.distresst > 1) {
                this.distresst -= 1
                var a = this.distressj * 2.39996
                this.distressj += 1
                DistressCall(this.x, this.y, a)
            }
        }
    },
}

var PullsMeteors = {
    init: function () {
        this.meteors = false
        this.meteort = 0
    },
    think: function (dt) {
        if (this.meteors) {
            this.meteort += dt
            while (this.meteort > 0.02) {
                this.meteort -= 0.02
                Meteor(this.x, this.y)
            }
        }
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

var TimesOut = {
    init: function (t) {
        this.dietimer = t || 1
    },
    think: function (dt) {
        this.dietimer -= dt
        if (this.dietimer <= 0) {
            this.die()
        }
    }
}

var ShowsPlanetInfo = {
    init: function () {
        this.infoeffect = undefined
        this.interacting = false
        this.explored = 0
        this.exploretime = 20.0
    },
    interact: function (ship) {
        this.interacting = true
    },
    getinfo: function () {
        if (this.distressed) {
            return ["Planet in distress"]
        } else if (this.explored < 1) {
            return ["Unexplored planet", "" + Math.floor(this.explored * 100) + "% explored"]
        } else {
            return [this.color + " planet"]
        }
    },
    think: function (dt) {
        if (this.interacting) {
            if (!this.infoeffect || effects.indexOf(this.infoeffect) < 0) {
                this.infoeffect = PlanetInfoBox(this)
            }
            this.explored += dt / this.exploretime
        } else {
            if (this.infoeffect) {
                this.infoeffect.disappear()
                if (effects.indexOf(this.infoeffect) < 0) {
                    this.infoeffect = undefined
                }
            }
        }
        this.interacting = false
    },
}

var ShowsSpeechBubble = {
    init: function (info) {
        this.bubble = undefined
        this.interacting = false
        this.info = info
    },
    interact: function (ship) {
        this.interacting = true
    },
    think: function (dt) {
        if (this.interacting) {
            if (!this.bubble || effects.indexOf(this.bubble) < 0) {
                this.bubble = SpeechBubble(this)
            }
        } else {
            if (this.bubble) {
                this.bubble.disappear()
                if (effects.indexOf(this.bubble) < 0) {
                    this.bubble = undefined
                }
            }
        }
        this.interacting = false
    },
}



function Planet(x, y, r, color) {
    return UFX.Thing()
              .addcomp(InSpace, x, y)
              .addcomp(IsRound, r, color)
              .addcomp(SendsDistress)
              .addcomp(PullsMeteors)
              .addcomp(ShowsPlanetInfo)
}

function Ship(x, y) {
    var vmax = 120
    return UFX.Thing()
              .addcomp(InSpace, x, y)
              .addcomp(ApproachesTarget, vmax)
              .addcomp(DrawShip)
}

function Saucer(x, y, tip) {
    return UFX.Thing()
              .definemethod("think")
              .addcomp(InSpace, x, y)
              .addcomp(OscillatesWhenIdle, 2.5)
              .addcomp(DrawSaucer)
              .addcomp(ShowsSpeechBubble, tip.split("|"))
}



