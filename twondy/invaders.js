/*
var EntersThroughPortal = {
    init: function () {
        this.portalvx = 0
        this.portalvy = -40
    },
    setportal: function (portal) {
        this.portal = portal
        var d = 20 * (1 + portal.entities.length)
        this.x = portal.x - Math.sin(portal.A) * d
        this.y = portal.y + Math.cos(portal.A) * d
        this.portal.addentity(this)
    },
    think: function (dt) {
        if (this.portal) {
            if (this.portal.zfactor == 1) {
                var S = Math.sin(this.portal.A), C = Math.cos(this.portal.A)
                this.vx = this.portalvx * C - this.portalvy * S
                this.vy = this.portalvx * S + this.portalvy * C
            } else {
                this.vx = 0
                this.vy = 0
            }
            if (this.portal.y - this.y > 40) {
                this.portal.removeentity(this)
                this.portal = null
            }
        }
    },
}*/

var DrawCircle = {
    init: function (color, size) {
        this.color = color || "gray"
        this.size = size || 6
    },
    draw: function () {
        UFX.draw("b o 0 0", this.size, "alpha 0.2 fs", this.color, "f alpha 1 ss", this.color, "s")
    },
}
/*
var LevelsOut = {
    think: function (dt) {
        if (this.y < 100) {
            var v = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
            var a = tau/4.01 * (100 - this.y) / 100.0
            this.vy = -v * Math.cos(a)
            this.vx = v * Math.sin(a)
        }
    }
}*/

var Crashes = {
    think: function (dt) {
        if (this.alive && this.y <= 0) {
            this.alive = false
        }
    },
}

function drawinvader() {
    DrawCircle.draw.apply({ size: 8, color: "white" })
}

var PortalState = {
    enter: function () {
        
    },
    exit: function () {
    },
    think: function (dt) {
    
    },
    draw: function () {
        this.portal.setclip()
        drawinvader()
    },
}

var DriftState = {
    enter: function () {
    },
    exit: function () {
    },
    think: function (dt) {
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
    draw: function () {
        drawinvader()
    },
}

var TargetState = {
    enter: function () {
        this.targetx = this.x + UFX.random(-2, 2)
        this.targety = UFX.random(Math.max(1, this.y - 50), this.y + 50)
    },
    exit: function () {
    },
    think: function (dt) {
        var dx = (this.targetx - this.x) * this.xfactor, dy = this.targety - this.y
        var d = Math.sqrt(dx * dx + dy * dy)
        this.vx = this.v * dx / d
        this.vy = this.v * dy / d
        if (this.v * dt < d) {
            this.x += this.vx * dt / this.xfactor
            this.y += this.vy * dt
        } else {
            this.x = this.targetx
            this.y = this.targety
            this.nextstate = TargetState
        }
    },
    draw: function () {
        drawinvader()
    },
}
/*
function swoop (obj, dx, dy) {
    return {
        x0: obj.x,
        y0: obj.y,
        x1: obj.x + dx/2,
        y1: obj.y,
        x2: obj.x + dx/2,
        y2: obj.y + dy,
        x3: obj.x + dx,
        y3: obj.y + dy,
        x: function (h) {
            return (1-h)*(1-h)*(1-h)*this.x0 + 3*h*(1-h)*(1-h)*this.x1 + 3*h*h*(1-h)*this.x2 + h*h*h*this.x3
        },
        y: function (h) {
            return (1-h)*(1-h)*(1-h)*this.y0 + 3*h*(1-h)*(1-h)*this.y1 + 3*h*h*(1-h)*this.y2 + h*h*h*this.y3
        },
        len: function () {
            var p0 = getpos(this.x0, this.y0)
            for (var j = 1 ; j <= 40 ; ++j) {
                var p = getpos(this.x(j/40.), this.y(j/40.))
                
            }
        },
    }
}*/

// Follow a flight path
var FlightState = {
    enter: function () {
        this.path.start()
    },
    exit: function () {
    
    },
    think: function (dt) {
        this.path.update(dt)
        if (!this.path.alive) {
            this.vx = 0
            this.vy = 0
            this.nextstate = DriftState
        }
    },
    draw: function () {
        drawinvader()
    },
}
/*
function PathTracer (obj) {
    this.obj = obj
    this.alive = true
    this.think = function (dt) { }
    this.draw = function () {
        var p = this.obj.path
        UFX.draw("b m", getpos(p.x(0), p.y(0)))
        for (var h = 1 ; h <= 40 ; ++h)
            UFX.draw("l", getpos(p.x(h/40.), p.y(h/40.)))
        UFX.draw("lw 1 ss rgba(255,255,255,0.3) s")
        UFX.draw("b m", getpos(p.x0, p.y0))
        for (var h = 1 ; h <= 40 ; ++h)
            UFX.draw("l", getpos(((40-h)*p.x0+h*p.x1)/40., ((40-h)*p.y0+h*p.y1)/40.))
        UFX.draw("m", getpos(p.x2, p.y2))
        for (var h = 1 ; h <= 40 ; ++h)
            UFX.draw("l", getpos(((40-h)*p.x2+h*p.x3)/40., ((40-h)*p.y2+h*p.y3)/40.))
//                   "m", getpos(p.x2, p.y2), "l", getpos(p.x3, p.y3),
        UFX.draw("ss rgba(255,0,0,0.3) s")
    }
}*/


function Aphid(portal) {
    this.v = 60
    this.x = 0
    this.y = 100
    this.alive = true
    this.path = new SinePath(this)
    this.setstate(FlightState)
//    effects.push(new PathTracer(this))
}
Aphid.prototype = UFX.Thing()
/*                    .addcomp({ draw: function () {
                        var r0 = this.y + gamestate.worldr, r1 = this.targety + gamestate.worldr
                        UFX.draw("b m", r0 * Math.sin(this.x), r0 * Math.cos(this.x),
                                   "l", r1 * Math.sin(this.targetx), r1 * Math.cos(this.targetx),
                                   "lw 1 ss white s")
                    } })*/
//                    .addcomp(ClipsToPortal)
                    .addcomp(WorldBound)
//                    .addcomp(EntersThroughPortal)
                    .addcomp(HasStates, ["think", "draw"])
//                    .addcomp(DrawCircle, "white")
                    .addcomp(Crashes)
//                    .addcomp(HasHealth, 1)
//                    .addcomp(Clonkable, 15, 15)
//                    .addcomp(CarriesReward, 10)
//                    .addcomp(Shatters)


