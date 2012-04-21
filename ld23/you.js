
var WorldBound = {
    init: function () {
        this.x = 0
        this.y = 0
        this.vx = 0
        this.vy = 0
        this.facingright = true
    },
    draw: function () {
        context.rotate(-this.x / gamestate.worldr)
        context.translate(0, gamestate.worldr + this.y)
    },
    lookingat: function () {
        return [this.x + (this.facingright ? 1 : -1) * mechanics.lookahead / (gamestate.worldr + this.y),
                this.y]
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
    },
    move: function (mkeys) {
        this.state.move.call(this, mkeys)
    },
    think: function (dt) {
        this.state.think.call(this, dt)
    },
}
var StandState = {
    move: function (mkeys) {
        var hmove = (mkeys.right ? 1 : 0) - (mkeys.left ? 1 : 0)
        this.vx = hmove * mechanics.runspeed
        if (hmove) this.facingright = hmove > 0
    },
    think: function (dt) {
        this.x += this.vx * dt
    },
}





var you = UFX.Thing()
             .addcomp(WorldBound)
             .addcomp(HasStates, StandState)
             .addcomp(IsBall)

