

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
    init: function () {
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
            } else {
                this.vh = 0
            }
        }
    },
    draw: function () {
        context.rotate(this.vh * 0.005)
        context.translate(0, this.h)
    },
}

var DrawYou = {
    draw: function () {
        UFX.draw("b m 0 -8 l 8 20 l -8 20 l 0 -8 o 0 24 4 fs gray f")
    }
}


var You = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(ControlMove)
    .addcomp(LandBound)
    .addcomp(FeelsGravity)
    .addcomp(Hops)
    .addcomp(DrawYou)

You.vy = 0
You.x = 0
You.y = 200


