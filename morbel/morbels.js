
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
        if (this.y < 0) {
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
}

var SquishesVertically = {
    draw: function () {
    }
}

var DrawBall = {
    draw: function () {
        UFX.draw("b o 0 8 8 fs rgb(100,0,100) ss rgb(160,0,160) lw 2 f s")
    },
}

function Hopper(x, y) {
    this.x = x
    this.vx = 0
    this.bounce()
    this.alive = true
    this.think(0)
    
}
Hopper.prototype = UFX.Thing()
    .addcomp(Earthbound)
    .addcomp(FollowsYou, 100)
    .addcomp(DisappearsUnderwater)
    .addcomp(Bounces)
    .addcomp(DrawBall)

