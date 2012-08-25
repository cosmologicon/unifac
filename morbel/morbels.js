
var ReactsNearYou = {
    nearyou: function () {
        return Math.abs(this.x - You.x) < 100 && Math.abs(this.y - You.y) < 50
    },
    draw: function () {
        if (this.nearyou()) {
            UFX.draw("b o 0 20 2 fs white f")
        }
    },
}

var Discharges = {
    activate: function () {
        effects.push(new Discharge(this.x, this.y + 10))
        this.alive = false
    },
}


var FollowsYou = {
    init: function (vxmax) {
        this.vxmax = vxmax
    },
    think: function (dt) {
        if (this.nearyou()) {
            var d = You.x - this.x
            this.vx += dt * 50 * (d > 0 ? 1 : -1)
            this.vx = Math.min(Math.max(this.vx, -this.vxmax), this.vxmax)
        } else {
            this.vx *= Math.exp(-2 * dt)
        }
        this.x += this.vx * dt
    },
}

var DisappearsUnderwater = {
    draw: function () {
        if (this.y < 10) {
            UFX.draw("( m -100", -this.y, "l 100", -this.y, "l 0 100 ) clip")
        }
    },
}

var Bounces = {
    bounce: function () {
        this.y = getheight(this.x)
        this.vy = UFX.random(200, 300)
    },
    think: function (dt) {
        this.vy -= dt * mechanics.gravity
        this.y += this.vy * dt
        if (this.y < getheight(this.x)) {
            this.bounce()
        }
    },
    draw: function () {
        var s = 1 + this.vy / 1000
        UFX.draw("z", 1/s, s)
    },
}

var SwimsAbout = {
    bounce: function () {
        this.y = Math.max(getheight(this.x), -10)
        this.vy = UFX.random(200, 300)
    },
    think: function (dt) {
        this.vy -= dt * mechanics.gravity
        this.y += this.vy * dt
        this.x += this.vx * dt
        if (this.y < getheight(this.x) || this.y < -10) {
            this.bounce()
        }
    },
}

var FliesAbout = {
    init: function (fxmax, fymax) {
        this.fxmax = fxmax || 200
        this.fymax = fymax || 200
    },
    think: function (dt) {
        this.vx = Math.min(Math.max(this.vx + dt * 50 * (this.x > this.x0 ? -1 : 1), -this.fxmax), this.fxmax)
        this.vy = Math.min(Math.max(this.vy + dt * 8 * (this.y > this.y0 ? -1 : 1), -this.fymax), this.fymax)
        this.y += this.vy * dt
        this.x += this.vx * dt
    },
}

var TalksToYou = {
    init: function (text) {
        this.text = text || "yello"
    },
    think: function (dt) {
        this.talking = Math.abs(this.x - You.x) < 20
    },
    draw: function () {
        if (this.talking) {
            context.font = "40px bold Arial"
            UFX.draw("fs white ss black lw 0.5 [ t 20 30 vflip")
            context.fillText(this.text, 0, 0)
            context.strokeText(this.text, 0, 0)
            UFX.draw("]")
        }
    }
}


var AvoidsLand = {
    bounce: function () {
        if (getheight(this.x) > 0) {
            this.vx = -this.vx
        }
    },
}

var BouncesRandomDirections = {
    bounce: function () {
        if (!this.nearyou()) {
            this.vx = this.vx / 2 + UFX.random(-40, 40)
            if (getheight(this.x) > 0) this.vx += getgrad(this.x) * 35
        }
    },
}


var PointsForward = {
    draw: function () {
        if (!this.vx && !this.vy) return
        UFX.draw("r", Math.atan2(this.vy, this.vx))
    },
}

var PointsUpward = {
    draw: function () {
        if (!this.vx && !this.vy) return
        if (this.vx > 0) {
            UFX.draw("r", Math.atan2(this.vy, this.vx))
        } else {
            UFX.draw("hflip r", Math.atan2(this.vy, -this.vx))
        }
    },
}

var StandsUpward = {
    draw: function () {
        UFX.draw("r", Math.atan2(0.5 * getgrad(this.x), 1))
    }
}

var DrawBall = {
    draw: function () {
        UFX.draw("b o 0 8 8 fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
    },
}

var DrawFish = {
    draw: function () {
        UFX.draw("b o 0 0 8 fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
        UFX.draw("( m -8 0 l -16 8 l -16 -8 ) fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
    }
}

var DrawBird = {
    draw: function () {
        UFX.draw("b o 0 0 8 fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
        UFX.draw("( m 5 5 l 14 0 l 20 12 ) f s")
        UFX.draw("( m -5 5 l -14 0 l -20 12 ) f s")
    }
}

var DrawGuy = {
    draw: function () {
        UFX.draw("fs rgb(100,0,100) ss rgb(160,0,160) lw 2")
        UFX.draw("( m -8 0 l 8 0 l 0 8 ) f s")
        UFX.draw("( m 2 5 l 0 13 l 8 16 ) f s")
        UFX.draw("( m -2 5 l 0 13 l -8 16 ) f s")
        UFX.draw("b o 0 24 8 f s")
    }
}


function Hopper(x) {
    this.x = x
    this.vx = 0
    this.bounce()
    this.alive = true
    this.think(0)
    
}
Hopper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(FollowsYou, 100)
    .addcomp(BouncesRandomDirections)
    .addcomp(DisappearsUnderwater)
    .addcomp(ReactsNearYou)
    .addcomp(Discharges)
    .addcomp(Bounces)
    .addcomp(DrawBall)


function Flopper(x) {
    this.x = x
    this.vx = UFX.random.choice([-1, 1]) * UFX.random(80, 140)
    this.bounce()
    this.alive = true
    this.think(0)
}
Flopper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(SwimsAbout)
    .addcomp(AvoidsLand)
    .addcomp(DisappearsUnderwater)
    .addcomp(PointsForward)
    .addcomp(DrawFish)


function Flapper(x, y) {
    this.x0 = this.x = x
    this.y0 = this.y = y
    this.vy = UFX.random(10, 20)
    this.vx = UFX.random.choice([-1, 1]) * UFX.random(80, 140)
    this.alive = true
    this.think(0)
}
Flapper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(FliesAbout)
    .addcomp(PointsUpward)
    .addcomp(DrawBird)


function Yapper(x) {
    this.x = x
    this.y = getheight(x)
    this.y0 = this.x0 = 0
    this.alive = true
    this.think(0)
}
Yapper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(HorizontalClipping)
    .addcomp(TalksToYou)
    .addcomp(StandsUpward)
    .addcomp(DrawGuy)


