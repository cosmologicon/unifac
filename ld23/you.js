

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
            objs[j].interact(this)
        }
    },
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
}
var SpringState = {
    enter: function () {
        this.vy = mechanics.springspeed
        this.t = 0
    },
    exit: function () {
    },
    move: function (mkeys, nkeys) {
    },
    think: function (dt) {
        this.t += dt
        if (this.t > mechanics.springtime) {
            this.nextstate = FallState
        }
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
}



var you = UFX.Thing()
             .addcomp(WorldBound)
             .addcomp(HasStates, StandState)
             .addcomp(IsBall)
             .addcomp(CanNab, 15)

