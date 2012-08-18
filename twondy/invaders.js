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

var Rocks = {
    init: function (omega, beta) {
        this.rockomega = omega || 1.
        this.rockbeta = beta || 0.3
    },
    think: function (dt) {
        if (this.rockphi === undefined) this.rockphi = UFX.random(tau)
        this.rockphi += dt * this.state.rockomega
    },
    draw: function () {
        context.rotate(this.state.rockbeta * Math.sin(this.rockphi))
    },
}

var SpringStepper = {
    init: function (omega, smax, hmax) {
        this.springomega = omega || 1.
        this.springsmax = smax || 0.3
        this.springhmax = hmax || 3
    },
    think: function (dt) {
        if (this.springphi === undefined) this.springphi = UFX.random(tau)
        this.springphi += dt * this.state.springomega
    },
    draw: function () {
        var s = this.state.springsmax * Math.sin(this.springphi)
        var h = this.state.springhmax * Math.cos(this.springphi)
        context.translate(0, h)
        context.scale(1+s, 1-s)
    },
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
    },
}

// Follow a flight path
var FlightState = UFX.Thing({
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
        } else if (UFX.random() * 20 < dt || this.y < 20) {
            this.nextstate = DrillState
        }
    },
    draw: function () {
    },
})
.addcomp(Rocks, 3)
.addcomp(SpringStepper, 8, 0.2)


// Drill into the surface
var DrillState = {
    enter: function () {
        this.tdrill = 0
        this.sdrill = 0
        this.Adrill = 0
        this.drill = new DrillLaser(this)
        effects.push(this.drill)
    },
    exit: function () {
    },
    think: function (dt) {
        this.tdrill += dt
        this.vx = 0
        this.vy = 0
        this.sdrill = Math.min(Math.max(this.sdrill + dt * UFX.random(-30, 30), -0.4), 0.4)
        this.Adrill = Math.min(Math.max(this.Adrill + dt * UFX.random(-20, 20), -0.3), 0.3)
        if (this.tdrill > 5) {
            this.nextstate = PenetrateState
        }
    },
    draw: function () {
        var s = Math.exp(this.sdrill)
        UFX.draw("t", 0, -10, "z", s, 1/s, "r", this.Adrill, "t", 0, 10)
    },
}

var PenetrateState = {
    enter: function () {
        this.y0 = this.y
        this.vy = 100
    },
    exit: function () {
    },
    think: function (dt) {
        this.vy -= 400 * dt
        this.y += this.vy * dt
        if (this.y < 0) {
            this.alive = false
            if (this.drill) this.drill.alive = false
        }
    },
    draw: function () {
        var s = this.y / this.y0
        UFX.draw("[ t 0", -this.y - 10, "b m -1000 0 l 1000 0 l 0 1000 ] clip z", s, (s < 0.5 ? 2 : 1/s))
    },

}

function PathTracer (obj) {
    this.obj = obj
    this.alive = true
    this.ps = []
    this.nps = 500
    this.dps = 40
    this.jps = 0
    this.think = function (dt) {
        if (this.jps == 0) {
            this.ps.push(getpos(this.obj.x, this.obj.y))
            while (this.ps.length > this.nps) {
                this.ps.shift()
            }
        }
        this.jps = (this.jps + 1) % this.dps
    }
    this.draw = function () {
        UFX.draw("b m", this.ps[0])
        for (var j = 0 ; j < this.ps.length ; ++j)
            UFX.draw("l", this.ps[j])
        UFX.draw("lw 1 ss rgba(255,255,255,0.3) s")
    }
}

function DrillLaser (obj) {
    this.obj = obj
    this.t = 0
    this.alive = true
    this.think = function (dt) {
        this.t += dt
        while (this.t > 0.4) this.t -= 0.4
    }
    this.draw = function () {
        UFX.draw("r", -this.obj.x, "t", 0, gamestate.worldr, "b m 0 -10 l 0", this.obj.y-10,
            "ss white lw", this.t * 10, "s ss darkred lw 2 s [ t 0 -10 z 1 0.3 b o 0 0", this.t * 80, "] ss red lw 1 s")
    }
}


var DrawAphid = {
    draw: function () {
        UFX.draw("[ z 2 2 ( m 4 4 l -4 4 l -7 0 l -3 -1 l -4 -8 l 0 -10 l 4 -8 l 3 -1 l 7 0 ) lw 0.6 fs gray ss black f s ]")
    },
}


function Aphid(portal) {
    this.v = 60
    this.x = 0
    this.y = 120
    this.alive = true
//    this.path = new LoopPath(this)
    this.path = new LevelPath(this)
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
//                    .addcomp(Rocks, 3)
//                    .addcomp(SpringStepper, 8, 0.2)
                    .addcomp(HasStates, ["think", "draw"])
                    .addcomp(DrawAphid)
//                    .addcomp(DrawCircle, "white")
//                    .addcomp(HasHealth, 1)
//                    .addcomp(Clonkable, 15, 15)
//                    .addcomp(CarriesReward, 10)
//                    .addcomp(Shatters)


