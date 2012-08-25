
var FollowsYou = {
    init: function (vxmax) {
        this.vxmax = vxmax
    },
    think: function (dt) {
        var d = You.x - this.x
        if (Math.abs(d) < mechanics.followdist) {
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

var AvoidsLand = {
    bounce: function () {
        if (getheight(this.x) > 0) {
            this.vx = -this.vx
        }
    },
}


var PointsForward = {
    draw: function () {
        if (!this.vx && !this.vy) return
        var A = Math.atan2(this.vy, this.vx)
        UFX.draw("r", A)
    },
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
    .addcomp(DisappearsUnderwater)
    .addcomp(Bounces)
    .addcomp(DrawBall)


function Flopper(x, y) {
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


