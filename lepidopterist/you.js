// The player character

HasPosition = {
    init: function (x0, y0) {
        this.x = x0
        this.y = y0
    },
    draw: function () {
        context.translate(this.x, this.y)
    },
}
FacesDirection = {
    init: function() {
        this.facingright = true
    },
}
LooksAhead = {
    lookingat: function() {
        var dx = (this.facingright ? 1 : - 1) * settings.sx / 4
        return [this.x + dx, this.y + 40]
    },
}
IsBlock = {
    draw: function() {
        size = 60
        color = "blue"
        context.beginPath()
        context.moveTo(-size/4, 0)
        context.lineTo(size/4, 0)
        context.lineTo(size/4, size)
        context.lineTo(-size/4, size)
        context.closePath()

        context.save()
        context.globalAlpha = 0.5
        context.fillStyle = color
        context.fill()
        context.restore()
        context.strokeStyle = color
        context.stroke()
    },
}


// Player character state components
CanJumpFrom = {
    jump: function () {
        this.vy = 200
        this.nextstate = JumpState
    },
}

FeelsGravity = {
    think: function (dt) {
        this.vy -= dt * 400
        this.y += this.vy * dt
    },
}

LandsAtGround = {
    think: function (dt) {
        if (this.y < 0) {
            this.y = 0
            this.nextstate = StandState
        }
    },
}

// Player character states
StandState = UFX.Thing().
               addcomp(IsBlock).
               addcomp(CanJumpFrom).
               definemethod("think")

JumpState = UFX.Thing().
               addcomp(IsBlock).
               addcomp(FeelsGravity).
               addcomp(LandsAtGround).
               definemethod("jump")


HasStates = {
    init: function (state0) {
        this.state = this.state0 = state0
        this.nextstate = null
        var machine = this
    },
    draw: function () {
        this.state.draw.apply(this, arguments)
    },
    think: function () {
        this.state.think.apply(this, arguments)
        if (this.nextstate) {
            this.state = this.nextstate
            this.nextstate = null
        }
    },
    jump: function () {
        this.state.jump.apply(this, arguments)
    }
}



var you = UFX.Thing().
            addcomp(HasPosition, 0, 0).
            addcomp(FacesDirection, true).
            addcomp(LooksAhead).
            addcomp(HasStates, StandState)


