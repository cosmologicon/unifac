
var Clonkable = {
    init: function (width, height) {
        this.clonkwidth = width || 10
        this.clonkheight = height || this.width
    },
    draw: function () {
//        context.strokeRect(-this.width, 0, 2*this.width, this.height)
    },
    clonk: function (you, dhp) {
        if (this.hp <= this.dhp) {
            this.reward += 2 * you.bounces
            you.bounces += 1
        }
        this.takedamage(dhp)
    },
}


var KillsEffects = {
    die: function () {
        if (this.drill) this.drill.alive = false
    }
}

var DrawCircle = {
    init: function (color, size) {
        this.color = color || "gray"
        this.size = size || 6
    },
    draw: function () {
        UFX.draw("b o 0 0", this.size, "alpha 0.2 fs", this.color, "f alpha 1 ss", this.color, "s")
    },
}

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
        this.portalp = -200
        this.portal.addentity(this)
        this.portalv = 400
    },
    exit: function () {
        this.portal.removeentity(this)
    },
    think: function (dt) {
        if (this.portal.open) {
            this.portalp += this.portalv * dt
            this.vx = Math.sin(this.portal.A) * this.portalv
            this.vy = -Math.cos(this.portal.A) * this.portalv
        } else {
            this.vx = 0
            this.vy = 0
        }
        this.X = this.portal.X + Math.sin(this.portal.A) * this.portalp / this.portal.xfactor
        this.y = this.portal.y - Math.cos(this.portal.A) * this.portalp
        if (this.portalp > 40) {
            this.nextstate = MatchSpeedState
        }
    },
    draw: function () {
        // TODO: how to do this???
        context.restore()
        context.save()
        this.portal.setclip()
        WorldBound.draw.apply(this)
    },
}

// Speed up or slow down to full speed
var MatchSpeedState = {
    enter: function () {
        this.vfinal = this.v
        this.t0v = 0.25
    },
    exit: function () {
    },
    think: function (dt) {
        var v = Math.sqrt(this.vx * this.vx + this.vy * this.vy), f, next
        if (v > this.vfinal) {
            f = Math.exp(-dt / this.t0v)
            next = v * f <= this.vfinal
        } else {
            f = Math.exp(dt / this.t0v)
            next = v * f >= this.vfinal
        }
        if (next) {
            this.path = new LevelPath(this)
            this.nextstate = FlightState
            f = this.vfinal / v
        }
        this.vx *= f
        this.vy *= f
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
    draw: function () {
    },
}

var DriftState = {
    clonkable: true,
    enter: function () {
    },
    exit: function () {
    },
    think: function (dt) {
        this.X += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
    draw: function () {
    },
}

var TargetState = {
    clonkable: true,
    enter: function () {
        this.targetX = this.X + UFX.random(-2, 2)
        this.targety = UFX.random(Math.max(1, this.y - 50), this.y + 50)
    },
    exit: function () {
    },
    think: function (dt) {
        var dx = (this.targetX - this.X) * this.xfactor, dy = this.targety - this.y
        var d = Math.sqrt(dx * dx + dy * dy)
        this.vx = this.v * dx / d
        this.vy = this.v * dy / d
        if (this.v * dt < d) {
            this.X += this.vx * dt / this.xfactor
            this.y += this.vy * dt
        } else {
            this.X = this.targetX
            this.y = this.targety
            this.nextstate = TargetState
        }
    },
    draw: function () {
    },
}

// Follow a flight path
var FlightState = UFX.Thing({
    init: function () {
        this.clonkable = true
    },
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
//            this.nextstate = DrillState
        }
    },
    draw: function () {
    },
})
.addcomp(Rocks, 3)
.addcomp(SpringStepper, 8, 0.2)


// Drill into the surface
var DrillState = {
    clonkable: true,
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
        if (this.y < 0 && this.drill) this.drill.alive = false
        if (this.y < -100) this.alive = false
    },
    draw: function () {
        var s = Math.max(this.y / this.y0, 0.1)
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
            this.ps.push(getpos(this.obj.X, this.obj.y))
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

var HasHangingDrill = {
    draw: function () {
        UFX.draw("( m 2 0 l 2 -15 l 4 -17 l 4 -19 l -4 -19 l -4 -17 l -2 -15 l -2 0 ) fs rgb(160,160,80) ss black f s")
    },
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
        var d = 10
        UFX.draw("r", -this.obj.X, "t", 0, gamestate.worldr, "b m 0 -10 l 0", this.obj.y-d,
            "ss white lw", this.t * 10, "s ss darkred lw 2 s [ t 0 -10 z 1 0.3 b o 0 0", this.t * 80, "] ss red lw 1 s")
    }
}

var wpaths = [
  UFX.Tracer("lw 0.8 ss black ( m -2 0 l 2 0 l 2 32 l -2 32 ) fs gray f s ( m -4 18 l -4 29 l 4 29 l 4 18 ) fs rgba(180,180,180,1) f s", [-5, 0, 10, 30]),
  UFX.Tracer("lw 0.8 ss black ( m -2 0 l 2 0 l 2 32 l -2 32 ) fs gray f s fs rgba(180,180,180,1) ( m -6 18 l -6 22 l 6 22 l 6 18 ) f s ( m -6 25 l -6 29 l 6 29 l 6 25 ) f s", [-7, 0, 14, 34]),
  UFX.Tracer("lw 0.8 ss black ( m -2 0 l 2 0 l 2 32 l -2 32 ) fs gray f s ( m -8 29 aa 0 29 8 0 3.141 ) fs rgba(180,180,180,1) f s", [-9, 0, 18, 34]),
  UFX.Tracer("lw 0.8 ss black ( m -2 0 l 2 0 l 2 20 l -2 20 ) fs gray f s ( m -5 18 l 0 33 l 5 18 ) fs rgba(180,180,180,1) f s", [-6, 0, 12, 35]),
  UFX.Tracer("lw 0.8 ss black ( m -4 0 l -4 23 l 0 21 l -3 30 l 7 14 l 0 17 l 4 0 ) fs gray f s", [-5, 0, 14, 32]),
]
function Whisker(A, path) {
    this.A0 = A
    this.sx = -Math.sin(A)
    this.sy = Math.cos(A)
    this.path = path || UFX.random.choice(wpaths)
        
}
Whisker.prototype = {
    draw: function (vx, vy) {
        var A = this.A0 + 0.005 * Math.min(Math.max(vx * this.sy - vy * this.sx, -100), 100)
        UFX.draw("[ r", A)
        this.path.draw(camera.zoom)
        UFX.draw("]")
    },
}
var DrawWhiskers = {
    init: function (nwhiskers) {
        this.nwhiskers = nwhiskers || 4
    },
    draw: function () {
        if (!this.whiskers) {
            this.whiskers = []
            var w = this.whiskers
            UFX.random.spread1d(this.nwhiskers, 1).forEach(function (p) {
                w.push(new Whisker((p * 0.8 + 0.6) * tau))
            })
        }
        var vx = this.vx, vy = this.vy
        if (this.state.springhmax) {
            vx = 0
            vy = 20 * this.state.springhmax * Math.cos(this.springphi)
        } else if (this.state === DrillState) {
//            vx = UFX.random(-40, 40)
//            vy = UFX.random(-40, 40)
            vy = this.sdrill * 200
            vx = this.Adrill * 200

        }
        for (var j = 0 ; j < this.whiskers.length ; ++j) this.whiskers[j].draw(vx, vy)
    },
}

var DrawAphid = {
    init: function () {
        this.aphidpaths = [
            UFX.Tracer(
                "ss black lw 1 ( m -7 10 l 7 10 l 7 -10 l -7 -10 ) fs gray f s " +
                "( m -11 6 l 11 6 l 11 -6 l -11 -6 ) fs rgb(170,170,170) f s " +
                "lw 0.5 b m -8 -6 l -8 6 m 8 -6 l 8 6 m -5 -6 l -5 6 m 5 -6 l 5 6 m 0 -6 l 0 6 s",
            [-12, -12, 24, 24]),
            UFX.Tracer(
                "[ vflip ss black lw 1 ( m 0 -9 q -16 -9 -8 2 c 0 14 0 14 8 2 q 16 -9 0 -9 ) fs gray f s " +
                "lw 0.5 b m 0 -9 c -14 -8 -3 5 0 11 m 0 -9 c 14 -8 3 5 0 11 s " +
                "lw 1 ( m 3 -10 l -3 -10 l -3 -1 l -11 -1 l -8 4 l 8 4 l 11 -1 l 3 -1 ) fs rgb(170,170,170) f s ]",
            [-12, -12, 24, 24]),
        ]
    },
    draw: function () {
        if (!this.aphidpath) this.aphidpath = UFX.random.choice(this.aphidpaths)
        this.aphidpath.draw(camera.zoom)
    },
}


function Aphid(portal) {
    this.v = 60
    this.X = 0
    this.y = 120
    this.alive = true
//    this.path = new LoopPath(this)
//    this.path = new LevelPath(this)
    this.portal = portal
    this.setstate(PortalState)
//    effects.push(new PathTracer(this))
}
Aphid.prototype = UFX.Thing()
                    .addcomp(ClipsToCamera, 50)
                    .addcomp(WorldBound)
//                    .addcomp(HasHangingDrill)
                    .addcomp(HasStates, ["think", "draw"])
                    .addcomp(DrawWhiskers, 4)
                    .addcomp(DrawAphid)
//                    .addcomp(DrawCircle, "white")
                    .addcomp(HasHealth, 1)
                    .addcomp(Clonkable, 15, 5)
                    .addcomp(KillsEffects)
//                    .addcomp(CarriesReward, 10)
//                    .addcomp(Shatters)


