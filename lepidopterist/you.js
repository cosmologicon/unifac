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
        var dx = (this.facingright ? 1 : - 1) * settings.sx / 10
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
        
        context.beginPath()
        context.arc(0, 0, 3, 0, 6.3)
        context.fillStyle = "white"
        context.fill()
    },
}


// Player character state components
IsState = {
    enter: function () {
    },
    exit: function () {
    },
    think: function () {
    },
    draw: function () {
    },
    move: function () {
    },
}

IsLaunch = {
    init: function (vx0, vy0) {
        this.vx0 = vx0 || 0
        this.vy0 = vy0 || 0
    },
    enter: function () {
        this.vx = (this.facingright ? 1 : -1) * this.state.vx0
        this.vy = this.state.vy0
    },
}

CanRun = {
    init: function (vx0) {
        this.vx0 = vx0 || 0
    },
    enter: function () {
        this.vx = 0
    },
    move: function (d) {
        this.vx = this.state.vx0 * d
        if (d > 0) this.facingright = true
        if (d < 0) this.facingright = false
    },
    think: function (dt) {
        this.x += this.vx * dt
    },
}

AboutFace = {
    enter: function () {
        this.facingright = !this.facingright
    },
}

Earthbound = {
    enter: function () {
        this.y = 0
        this.vy = 0
    },
}

ArcMotion = {
    init: function (g) {
        this.g = g || 400
    },
    think: function (dt) {
        this.vy -= dt * this.state.g
        this.x += this.vx * dt
        this.y += this.vy * dt
    },
}

LandsAtGround = {
    think: function (dt) {
        if (this.y < 0) {
            this.nextstate = YouStates.stand
        }
    },
}

// Player character states
YouStates = {
    stand: UFX.Thing()
              .addcomp(IsState)
              .addcomp(Earthbound)
              .addcomp(CanRun, mechanics.runvx)
              .addcomp(IsBlock)
    ,
    jump: UFX.Thing()
              .addcomp(IsState)
              .addcomp(IsLaunch, 40, 200)
              .addcomp(ArcMotion)
              .addcomp(LandsAtGround)
              .addcomp(IsBlock)
    ,
    turn: UFX.Thing()
              .addcomp(IsState)
              .addcomp(AboutFace)
              .addcomp(IsLaunch, mechanics.turnvx, mechanics.turnvy)
              .addcomp(ArcMotion)
              .addcomp(LandsAtGround)
              .addcomp(IsBlock)
    ,
}

HasStates = {
    init: function (state0) {
        this.state = this.state0 = state0
        this.nextstate = null
        this.state.enter.apply(this)
    },
    draw: function () {
        this.state.draw.apply(this, arguments)
    },
    think: function () {
        this.state.think.apply(this, arguments)
        if (this.nextstate) {
            this.state.exit.apply(this)
            this.state = this.nextstate
            this.state.enter.apply(this)
            this.nextstate = null
        }
    },
    move: function () {
        this.state.move.apply(this, arguments)
    },
}



var you = UFX.Thing().
            addcomp(HasPosition, 0, 0).
            addcomp(FacesDirection, true).
            addcomp(LooksAhead).
            addcomp(HasStates, YouStates.stand)


