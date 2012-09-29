

var CanNab = {
    init: function (radius) {
        this.radius = radius || 10
    },
    nab: function (objs) {
        for (var j = 0 ; j < objs.length ; ++j) {
            var dx = getdx(this.x, objs[j].x) * this.xfactor
            var dy = this.y + 24 - objs[j].y
            if (dx * dx + dy * dy < this.radius * this.radius) {
                objs[j].benabbed(this)
            }
        }
    },
    interact: function (objs) {
        for (var j = 0 ; j < objs.length ; ++j) {
            if (objs[j]) objs[j].interact(this)
        }
    },
    clonk: function (objs) {
/*        if (this.vy >= 0) return
        for (var j = 0 ; j < objs.length ; ++j) {
            var dx = Math.abs(getdx(this.x, objs[j].x)) * this.xfactor
            if (dx > objs[j].width * objs[j].scale) continue
            var dy = Math.abs(this.y - objs[j].y)
            if (dy > objs[j].height * objs[j].scale) continue
            objs[j].clonk(this, 1)
            this.vy = mechanics.clonkvy
        } */
        // TODO: this logic really doesn't belong here
        var clonker = this
        var dhp = 1
        objs.forEach(function (obj) {
            if (!obj.state.clonkable) return
            if (clonker.vy > obj.vy) return
            if (Math.abs(getdx(clonker.x, obj.x)) * clonker.xfactor > obj.clonkwidth) return
            if (Math.abs(clonker.y - obj.y) > obj.clonkheight) return
            obj.clonk(clonker, dhp)
            clonker.vy = mechanics.clonkvy
        })
    },
}


var CanShock = {
    init: function () {
        this.shockt = 0
    },
    think: function (dt) {
        this.shockt += dt
    },
    shockfrac: function () {
        if (!gamestate.unlocked.shock) return 0
        return Math.min(1, this.shockt / mechanics.shocktimes[gamestate.shocklevel])
    },
    move: function (mkeys, nkeys) {
        if (nkeys.act && this.shockt >= mechanics.shocktimes[gamestate.shocklevel]) {
            this.nextstate = ShockState
            this.shockt = 0
        }
    },
}



var DrawZoop = {
    init: function () {
        this.pose = {
            bodyxshear: 0,
            bodyyshear: 0,
            bodytilt: 0,
            bodystretch: 0,
            headtilt: 0,
            antennaspread: 0,
            antennastretch: 0,
            spin: 0,  // Rotation about center of mass (for aerial maneuvers)
            tilt: 0,  // Rotation about anchor point (for standing on tilted platforms)
        }
        this.lastdraw = Date.now() * 0.001
    },
    maketracers: function () {
        var headpath = "M 4.07 -12.79 C -3.43 -13.37 -8.72 -8.64 -7.85 -1.51 C -6.67 8.20 -0.05 9.83 3.36 11.39 C 7.21 13.14 9.77 11.60 11.18 9.57 C 13.74 5.89 14.88 -0.57 13.25 -5.56 C 12.31 -8.44 10.63 -11.70 4.07 -12.79"
        var bodypath = "M -4.46 3.97 C -6.43 16.11 -9.11 11.29 -9.46 23.97 C -2.50 29.33 4.29 28.61 11.07 24.86 C 12.50 14.33 4.11 17.36 4.11 3.61 C 3.21 -0.32 -3.75 -1.57 -4.46 3.97"
        this.tracers = {
            head: UFX.Tracer([
                // Filled area and clipping region
                "[ b", headpath, "fs #AA0 f clip",
                // Facial spots
                "[ r -0.3 z 0.7 -1 b o 9 0 7 o 20 0 7 o 0 0 4 o 4 -11 6 o -4 -6 1.5 o 2 7 1.5 o 10 -10 8 o 14.3 7.3 1 fs #A80 f",
                "b o 14.2 2 1.5 o 13 -6 1 fs #AA0 f ]",
                // shading and outline
                "] b", headpath, "fs", UFX.draw.radgrad(-4, -8, 0, -4, -8, 35, 0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.5)"),
                "f ss #CC6 lw 0.5 s",
                // eyes
                "[ r -0.15 [ z 0.4 1 fs #008 ss black lw 0.4 b o 18 0 4 f s b o 30 0 4 f s ]",
                "fs white b o 6.4 -2 0.5 o 11.2 -2 0.5 f ]"],
                [-9, -14, 24, 27]
            ),
            body: UFX.Tracer([
                "b", bodypath, "fs #AA0 f [ clip",
                // body spots
                "[ r -0.25 z 0.7 -1 b o 0 -12 5 o -8 -20 5 o 0 -22 6 o 8 -20 5 o -8 -12 2 o -12 -28 6 o -15 -20 1 fs #A80 f",
                "b o -5 -26 4 o 5 -26 4 o 0 -20 1.5 fs #AA0 f ]", // restore from spot rotation
                "]", // restore from clipping region
                // shading and outline
                "b", bodypath, "fs", UFX.draw.lingrad(0, 0, 30, 10, 0, "rgba(0,0,0,0)", 1, "rgba(0,0,0,0.8)"),
                "f ss #CC6 lw 0.5 s"],
                [-10, 0, 23, 28]
            ),
        }
    },
    drawzoop: function (opts) {
        if (!this.tracers) this.maketracers()
        // TODO: refactor this into an update pose method - shouldn't be solving for dt in draw
        var t = Date.now() * 0.001
        var f = 1 - Math.exp(-8 * (t - this.lastdraw))
        this.lastdraw = t
        for (var attrib in this.pose) {
            if (attrib !== "spin" && attrib !== "tilt") {
                this.pose[attrib] = (1-f) * this.pose[attrib] + f * (opts[attrib] || 0)
            }
        }
        this.pose.spin += f * getdx(this.pose.spin, (opts.spin || 0))
        this.pose.tilt += f * getdx(this.pose.tilt, (opts.tilt || 0))
        var p = this.pose
        
        context.rotate(-this.pose.tilt)
        if (!this.facingright) UFX.draw("hflip")

        // Draw body
        UFX.draw("[ t", 18*p.bodyxshear, 18, "r", p.spin, "t", 6*p.bodyxshear, 6, "vflip")
        UFX.draw("[ x 1", p.bodyyshear, -p.bodyxshear, "1 0 0 r", p.bodytilt, "zy", 1+p.bodystretch)
        this.tracers.body.draw(camera.zoom)
        UFX.draw("]") // restore from body shear

        // Draw head
        UFX.draw("[ r", p.headtilt)
        // Back antenna
        var antpath = "b M 0.82 -0.15 C -0.52 -18.17 -5.85 -20.11 -8.62 -19.89 C -17.41 -18.89 -15.41 2.31 -8.27 -0.00 C -5.39 -1.01 -3.67 -5.63 -8.22 -12.10 C -7.05 -10.48 -4.57 -2.75 -8.60 -1.22 C -13.93 0.47 -15.65 -17.52 -8.46 -18.92 C -0.35 -19.01 -0.34 2.28 -0.48 1.94"
        var af = p.antennastretch
        UFX.draw("[ t 3 -7 z -1 1 r", 0.2 + 2*p.antennaspread + af, "yshear", p.antennaspread, "zx", 1-af, antpath, "zx", 1+af, "fs #A80 ss #630 lw 0.3 f s ]")

        this.tracers.head.draw(camera.zoom)
                
        // front antenna
        UFX.draw("t -3 -5",
            "r", -0.3 - af, "yshear", p.antennaspread, "zx", 1+af, antpath, "zx", 1-af, "fs #A80 ss #630 lw 0.3 f s",
            "]",
            "]") // restore from head tilt
    },
}


var StandState = {
    enter: function () {
        this.vy = 0
        this.y = 0
        this.jumps = 0  // Number of times you've jumped
        this.bounces = 0
    },
    exit: function () {
    },
    move: function (mkeys, nkeys, dt) {
        var xmove = (mkeys.right ? 1 : 0) - (mkeys.left ? 1 : 0)

        var k = this.vx > 0 ? 1 : this.vx < 0 ? -1 : xmove
        if (xmove == 0) {  // not holding anything
            var dvx = mechanics.xdecel * dt
            this.vx = Math.abs(this.vx) < dvx ? 0 : this.vx - k * dvx
        } else if (this.vx && k * xmove < 0) { // holding backward
            var dvx = mechanics.xbdecel * dt
            this.vx = Math.abs(this.vx) < dvx ? 0 : this.vx - k * dvx
        } else { // holding forward
            var vx = Math.abs(this.vx)
            if (vx < mechanics.xspeed) {  // going slower than max speed
                vx = Math.min(vx + mechanics.xfaccel * dt, mechanics.xspeed)
            } else if (vx > mechanics.xspeed) {  // going faster than max speed
                vx = Math.max(vx - mechanics.xfdecel * dt, mechanics.xspeed)
            }
            this.vx = vx * k
        }
        if (xmove) this.facingright = xmove > 0

        if (nkeys.up) {
            this.nextstate = LeapState
        }
    },
    think: function (dt) {
        this.x += this.vx * dt / this.xfactor
    },
    draw: function () {
        var a = Math.min(Math.abs(this.vx), 160) / 500
        this.drawzoop({
            bodyxshear: a,
            headtilt: 0.4 * a,
            antennastretch: 1.4 * a
        })
    },
}
var LeapState = {
    hoistable: true,
    enter: function () {
        this.vy = 0
        this.jumps += 1
    },
    exit: function () {
    },
    move: function (mkeys, nkeys) {
        var hmove = (mkeys.right ? 1 : 0) - (mkeys.left ? 1 : 0)
        this.vx = hmove * mechanics.jumphspeed
        if (hmove) this.facingright = hmove > 0
        if (!mkeys.up) this.nextstate = FallState
    },
    think: function (dt) {
        this.vy += mechanics.launchaccel * dt
        if (this.vy >= mechanics.launchspeed) {
            this.nextstate = FallState
            this.vy = mechanics.launchspeed
        }
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
    draw: function () {
        FallState.draw.call(this)
    },
}
var FallState = {
    catchable: true,
    hoistable: true,
    enter: function () {
    },
    exit: function () {
    },
    move: function (mkeys, nkeys, dt) {
        return StandState.move.call(this, mkeys, nkeys, dt)
        var hmove = (mkeys.right ? 1 : 0) - (mkeys.left ? 1 : 0)
        this.vx = hmove * mechanics.jumphspeed
        if (hmove) this.facingright = hmove > 0
        this.resistfall = !!mkeys.up
        if (nkeys.up && this.jumps < gamestate.njumps) {
            this.nextstate = LeapState
        }
    },
    think: function (dt) {
        this.vy -= (this.resistfall ? mechanics.rgravity : mechanics.gravity) * dt
        if (this.y <= 0) {
            this.nextstate = StandState
        }
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
    draw: function () {

        var xfac = Math.min(Math.abs(this.vx), 200) / 400
        var yfac = -Math.max(Math.min(this.vy, 120), -120) / 400
        var a = Math.sin(2 * Math.atan2(this.vy, Math.abs(this.vx)))
        this.drawzoop({
            bodytilt: 1 * a * Math.max(Math.abs(xfac), Math.abs(yfac)) + 0.3 * yfac,
            bodystretch: 0.1 - 0.6 * yfac,
            bodyyshear: 0.5 * yfac,
            headtilt: yfac,
            antennastretch: 1.4 * xfac,
            antennaspread: yfac,
        })
    },
}
var SpringState = {
    enter: function () {
        this.vx = 0
        this.t = 0
    },
    exit: function () {
    },
    move: function (mkeys, nkeys) {
    },
    think: function (dt) {
        this.t += dt
        if (this.t > this.springtime) {
            this.nextstate = FallState
        }
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
    draw: function () {
        FallState.draw.call(this)
    },
}
var ShockState = {
    enter: function () {
        this.vy = Math.max(this.vy, mechanics.shockspeed)
        this.t = 0
        var vs = mechanics.shockwavevs[gamestate.shocklevel]
        var smax = mechanics.shockwavesizes[gamestate.shocklevel]
        ehitters.push(new Wave(this.x, this.y + 24, smax, vs))
    },
    exit: function () {
    },
    move: function (mkeys, nkeys) {
    },
    think: function (dt) {
        this.t += dt
        if (this.t > mechanics.shocktime) {
            this.nextstate = FallState
        }
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
    draw: function () {
        this.drawzoop({
            spin: (0.3 + 0.7 * this.t / mechanics.shocktime) * tau,
            headtilt: -1,
        })
    },
}
var ReelState = {
    catchable: true,
    hoistable: true,
    enter: function () {
        this.t = 0
        this.vx = getdx(this.x, Overlord.x) > 0 ? -500 : 500
        this.vy = 200
    },
    exit: function () {
    },
    move: function (mkeys, nkeys) {
    },
    think: function (dt) {
        this.t += dt
        this.vy -= mechanics.gravity * dt
        if (this.y <= 0) {
            this.nextstate = StandState
        }
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
    draw: function () {
        if (!this.facingright) context.scale(-1, 1)
        context.translate(0, 24)
        context.rotate(this.t * 15)
        this.drawbody()
        this.drawhead()
    },
}


var ClimbState = Object.create(StandState)
ClimbState.enter = function () {
    this.jumps = 0
    this.vy = 0
    this.blocky = 0
    this.bounces = 0
    this.tilt = this.block.xform.A + this.block.xform.dA
}
ClimbState.move = function (mkeys, nkeys, dt) {
    StandState.move.call(this, mkeys, nkeys, dt)
    // TODO: also dismount on kick
    if (this.nextstate === LeapState) this.block.dismount(this)
}
ClimbState.think = function (dt) {
    this.blockx += this.vx * dt * (this.tilt * this.vx > 0 ? 1 : Math.max(0.3, 1 - 0.5 * Math.abs(this.tilt)))
    this.blocky = 0
    var pos = this.block.xform.worldpos(this.blockx, 0, 1)
    var dy = this.block.tower.y + gamestate.worldr
    var x = pos[0], y = pos[1] + dy
    var dx = Math.atan2(x, y)
    this.x = this.block.tower.x + dx
    this.y = Math.sqrt(x*x + y*y) - dy
    this.xfactor = Math.max(gamestate.worldr + this.y, 1)
    var fpos = this.block.xform.worldpos(this.blockx, this.blocky)
    this.block.takeforce(0, -mechanics.zoopweight, fpos[0], fpos[1])
    this.block.takeimpulse(-mechanics.runpush * this.vx * dt, 0, fpos[0], fpos[1])
    if (!this.block.holds(this)) {
        this.jumps = 1
        this.nextstate = FallState
    }
    this.tilt = this.block.xform.A + this.block.xform.dA - dx
}
ClimbState.draw = function () {
    var a = Math.min(Math.abs(this.vx), 160) / 500
    this.drawzoop({
        bodyxshear: a,
        headtilt: 0.4 * a,
        antennastretch: 1.4 * a,
        tilt: this.tilt,
    })
}



var you = UFX.Thing()
             .addcomp(WorldBound)
             .addcomp(HasStates, ["move", "think", "draw"])
             .addcomp(DrawZoop)
             .addcomp(CanNab, 15)
             .addcomp(CanShock)

