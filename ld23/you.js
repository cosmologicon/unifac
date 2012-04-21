
var WorldBound = {
    init: function () {
        this.x = 0
        this.y = 0
        this.vx = 0
        this.vy = 0
        this.facingright = true
    },
    think: function () {
        this.xfactor = gamestate.worldr + this.y
    },
    draw: function () {
        context.rotate(-this.x)
        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(0, this.xfactor)
        context.strokeStyle = "yellow"
        context.stroke()
        context.translate(0, this.xfactor)
    },
    lookingat: function () {
        var dx = (this.facingright ? 1 : -1) * Math.min(mechanics.lookahead / this.xfactor, 0.5)
        return [this.x + dx, this.y]
    },
}

var IsBall = {
    draw: function () {
        context.beginPath()
        context.arc(0, 7, 10, 0, tau)
        context.strokeStyle = "orange"
        context.lineWidth = 1
        context.stroke()
    }
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
        }
    },
}


var StandState = {
    enter: function () {
        this.vy = 0
        this.y = 0
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
    },
    exit: function () {
    },
    move: function (mkeys, nkeys) {
        var hmove = (mkeys.right ? 1 : 0) - (mkeys.left ? 1 : 0)
        this.vx = hmove * mechanics.jumphspeed
        if (hmove) this.facingright = hmove > 0
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



var you = UFX.Thing()
             .addcomp(WorldBound)
             .addcomp(HasStates, StandState)
             .addcomp(IsBall)

