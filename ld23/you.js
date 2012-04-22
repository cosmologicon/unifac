

var CanNab = {
    init: function (radius) {
        this.radius = radius || 10
    },
    nab: function (objs) {
        for (var j = 0 ; j < objs.length ; ++j) {
            var dx = getdx(this.x, objs[j].x) * this.xfactor
            var dy = this.y - objs[j].y
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
        if (this.vy >= 0) return
        for (var j = 0 ; j < objs.length ; ++j) {
            var dx = Math.abs(getdx(this.x, objs[j].x)) * this.xfactor
            if (dx > objs[j].width * objs[j].scale) continue
            var dy = Math.abs(this.y - objs[j].y)
            if (dy > objs[j].height * objs[j].scale) continue
            objs[j].clonk(this, 1)
            this.vy = mechanics.clonkvy
        }
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


function drawantenna() {
    context.lineCap = "round"
    context.strokeStyle = "green"
    context.lineWidth = 1.5
    context.beginPath()
    context.moveTo(-7, 4)
    context.quadraticCurveTo(-14, 16, 2, 22)
    context.stroke()
}
function drawhead() {
    drawantenna()

    context.beginPath()
    context.arc(0, 0, 12, 0, tau)
    context.fillStyle = "#AA0"
    context.fill()
    context.strokeStyle = "#FF7"
    context.stroke()
    context.strokeStyle = "black"
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(4, -4)
    context.lineTo(4, 4)
    context.stroke()
    context.beginPath()
    context.moveTo(8, -4)
    context.lineTo(8, 4)
    context.stroke()

    context.rotate(0.4)
    drawantenna()
}

function drawbody() {
    var ps = [[-4, -8], [-6, -16], [-12, -24], [-4, -28], [4, -28], [12, -24], [6, -16], [4, -8]]
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(0, -8)
    ps.forEach(function (p) { context.lineTo(p[0], p[1]) })
    context.closePath()
    context.fillStyle = "#F70"
    context.fill()
    context.strokeStyle = "#FA7"
    context.stroke()
}


// States for our state machine
var HasStates = {
    init: function (state0) {
        this.state = state0
        this.state.enter.call(this)
        this.nextstate = null
    },
    move: function (mkeys, nkeys) {
        this.state.move.call(this, mkeys, nkeys)
    },
    think: function (dt) {
        this.state.think.call(this, dt)
    },
    draw: function () {
        this.state.draw.call(this)
    },
    updatestate: function () {
        if (this.nextstate) {
            this.state.exit.call(this)
            this.state = this.nextstate
            this.state.enter.call(this)
            this.nextstate = null
            this.think(0)
        }
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
    move: function (mkeys, nkeys) {
        var hmove = (mkeys.right ? 1 : 0) - (mkeys.left ? 1 : 0)
        this.vx = hmove * mechanics.runspeed
        if (hmove) this.facingright = hmove > 0
        if (nkeys.up) {
            this.nextstate = LeapState
        }
    },
    think: function (dt) {
        this.x += this.vx * dt / this.xfactor
    },
    draw: function () {
        var a = Math.min(Math.abs(this.vx) / 700, 0.5)
        if (!this.facingright) context.scale(-1, 1)
    
        context.save()
        context.transform(1,0,a,1,24*a,24)
        drawbody()
        context.restore()
        
        context.save()
        context.translate(24*a, 24)
        drawhead()
        context.restore()
    },
}
var LeapState = {
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
    enter: function () {
    },
    exit: function () {
    },
    move: function (mkeys, nkeys) {
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
        if (!this.facingright) context.scale(-1, 1)
        context.translate(0, 24)
        context.save()
        var a = -0.3 * Math.sin(2 * Math.atan2(this.vy, this.vx))
        var s = 1 + Math.max(Math.min(this.vy / 1000, 0.2), -0.2)
        context.rotate(a)
        context.scale(1, s)
        drawbody()
        context.restore()
        var a = Math.max(Math.min(this.vy / 400, 0.5), -0.5)
        context.rotate(a)
        drawhead()
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
        if (!this.facingright) context.scale(-1, 1)
        context.translate(0, 24)
        context.rotate(this.t / mechanics.shocktime * tau)
        drawbody()
        drawhead()
    },
}
var ReelState = {
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
        drawbody()
        drawhead()
    },
}


var ClimbState = Object.create(StandState)
ClimbState.enter = function () {
    this.jumps = 0
    this.vy = 0
    this.bounces = 0
}
ClimbState.think = function (dt) {
    StandState.think.call(this, dt)
    if (!this.tower.holds(this)) {
        this.jumps = 1
        this.nextstate = FallState
    }
}





var you = UFX.Thing()
             .addcomp(WorldBound)
             .addcomp(HasStates, StandState)
             .addcomp(CanNab, 15)
             .addcomp(CanShock)

