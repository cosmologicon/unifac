
// States for a state machine - copied from Twondy and Zoop
var HasStates = {
    init: function (methodnames) {
        var methods = {}
        methodnames.forEach(function (methodname) {
            methods[methodname] = function () {
                return this.state[methodname].apply(this, arguments)
            }
        })
        this.addcomp(methods)
    },
    // Call this to set the state immediately.
    // For state changes that should be set at the end of the think cycle, assign to this.nextstate
    setstate: function (state) {
        if (this.state) {
            this.state.exit.call(this)
        }
        this.state = state
        this.state.enter.call(this)
        this.nextstate = null
        this.think(0)
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

var CanActivate = {
    move: function (kpress, kdowns) {
        if (kdowns.act) {
            morbels.forEach(function (morbel) {
                if (morbel.nearyou()) {
                    morbel.activate()
                }
            })
        }
    },
}


var AlwaysVisible = {
    isvisible: function () {
        return true
    },
}

var HorizontalClipping = {
    init: function (margin) {
        this.hcmargin = margin || 60
    },
    isvisible: function () {
        return this.x + 60 > camera.xmin && this.x - 60 < camera.xmax
    },
}


var Earthbound = {
    draw: function () {
        UFX.draw("t", this.x, this.y)
    },
}

var LandBound = {
    think: function () {
        while (this.vx > 0 && getheight(this.x) < 0) {
            this.x -= 0.01
        }
        while (this.vx < 0 && getheight(this.x) < 0) {
            this.x += 0.01
        }
    },
}

var FeelsGravity = {
    think: function (dt) {
        this.vy -= dt * mechanics.gravity
        this.y += this.vy * dt
        var ymin = getheight(this.x)
        if (this.y <= ymin) {
            this.y = ymin
            this.vy = 0
        }
    }
}

var ControlMove = {
    init: function () {
        this.facingright = true
    },
    move: function (kpressed) {
        var dkx = (kpressed.right ? 1 : 0) - (kpressed.left ? 1 : 0)
        var dky = (kpressed.up ? 1 : 0) - (kpressed.down ? 1 : 0)
        this.vx = dkx * mechanics.walkspeed
        if (this.vx) this.facingright = this.vx > 0
    },
    think: function (dt) {
        this.x += this.vx * dt
    },
    draw: function () {
        if (!this.facingright) UFX.draw("hflip")
    },
}

var Hops = {
    enter: function () {
        this.h = 0
        this.vh = 0
    },
    think: function (dt) {
        this.vh -= dt * mechanics.hopgravity
        this.h += this.vh * dt
        if (this.h <= 0) {
            this.h = 0
            if (this.vx) {
                this.vh = mechanics.hopspeed
                playsound("step")
            } else {
                this.vh = 0
            }
        }
    },
    draw: function () {
        if (this.y < getheight(this.x) + 10) {
            context.rotate(this.vh * 0.002)
            context.translate(0, this.h)
        }
    },
}

var RideCarrier = {
    think: function () {
        this.x = this.carrier.x
        this.y = this.carrier.y + 12
    },
    draw: function () {
    
    }
}

var DrawYou = {
    draw: function () {
        if (camera.zoom < 3) {
            UFX.draw("vflip")
            context.drawImage(UFX.resource.images.youz5, -96/5, -282/5)
        } else {
            UFX.draw("z 0.2 -0.2")
            context.drawImage(UFX.resource.images.you, -96, -282)
        }
    }
}

var LandState = UFX.Thing()
    .definemethod("enter")
    .definemethod("exit")
    .addcomp(ControlMove)
    .addcomp(CanActivate)
    .addcomp(Hops)
    .addcomp(LandBound)
    .addcomp(FeelsGravity)
    .addcomp(DrawYou)

// Carried by a flopper
var CarriedState = UFX.Thing()
    .definemethod("enter")
    .definemethod("exit")
    .definemethod("move")
    .addcomp(RideCarrier)
    .addcomp(DrawYou)


function youinit() {
    You = UFX.Thing()
        .addcomp(Earthbound)
        .addcomp(AlwaysVisible)
        .addcomp(HasStates, ["think", "draw", "move"])

    You.setstate(LandState)
    You.vy = 0
    You.x = 0
    You.y = 200
}

