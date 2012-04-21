// Game objects - will probably separate this out when I get an idea what's actually
// going to be in the game


var WorldBound = {
    init: function (x, y) {
        this.x = x || 0
        this.y = y || 0
        this.vx = 0
        this.vy = 0
        this.facingright = true
    },
    think: function () {
        this.xfactor = gamestate.worldr + this.y
    },
    draw: function () {
        context.rotate(-this.x)
/*        context.beginPath()
        context.moveTo(0, 0)
        context.lineTo(0, this.xfactor)
        context.strokeStyle = "yellow"
        context.stroke()*/
        context.translate(0, this.xfactor)
    },
    lookingat: function () {
        var dx = (this.facingright ? 1 : -1) * Math.min(mechanics.lookahead / this.xfactor, 0.5)
        return [this.x + dx, this.y]
    },
}

var IsBall = {
    init: function (size, color) {
        this.ballsize = size || 10
        this.ballcolor = color || "orange"
    },
    draw: function () {
        context.beginPath()
        context.arc(0, this.ballsize * 0.7, this.ballsize, 0, tau)
        context.strokeStyle = this.ballcolor
        context.lineWidth = 1
        context.stroke()
    }
}

var IsBox = {
    init: function (size, color) {
        this.boxsize = size || 10
        this.boxcolor = color || "purple"
    },
    draw: function () {
        context.strokeStyle = this.boxcolor
        context.strokeRect(-this.boxsize/2, 0, this.boxsize, this.boxsize)
    }
}


var Wobbles = {
    init: function () {
        this.wobblet = 0
    },
    think: function (dt) {
        this.wobblet += dt
    },
    draw: function () {
        var s = 1 + 0.3 * Math.sin(this.wobblet * 4) * Math.exp(-0.4 * this.wobblet)
        context.scale(s, 1/s)
    },
}




var Drifts = {
    init: function (vx, vy) {
        this.vx = vx || 0
        this.vy = vy || 0
    },
    think: function (dt) {
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
}

var Crashes = {
    think: function (dt) {
        this.alive = this.alive && this.y > 0
    },
}
var FadesUpward = {
    init: function (ymax) {
        this.ymax = ymax
    },
    think: function (dt) {
        this.alive = this.alive && this.y < this.ymax
    },
    draw: function () {
        var a = Math.max(0, Math.min(1, (this.ymax - this.y) / 50))
        context.globalAlpha *= a
    },
}

var GivesMoney = {
    init: function (money) {
        this.money = money || 1
    },
    benabbed: function (nabber) {
        if (this.alive) {
            this.alive = false
            gamestate.bank += this.money
            effects.push(new MoneyBox(this.money, this.x, this.y))
        }
    },
}

var GivesBoost = {
    init: function (boostvy) {
        this.boostvy = boostvy
    },
    benabbed: function (nabber) {
        if (this.alive) {
            this.alive = false
            nabber.vy = Math.max(nabber.vy, 0) + this.boostvy
        }
    },
}



function Token(x, y) {
    this.x = x
    this.y = y
    this.vx = UFX.random.choice([-50, 50])
    this.vy = -30
    this.alive = true
    this.think(0)
}
Token.prototype = UFX.Thing()
                     .addcomp(WorldBound)
                     .addcomp(IsBall, 5, "yellow")
                     .addcomp(Drifts)
                     .addcomp(Crashes)
                     .addcomp(GivesMoney)



function Bubble(x, y) {
    this.x = x
    this.y = y
    this.vx = UFX.random(-20, 20)
    this.vy = 20
    this.alive = true
    this.think(0)
}
Bubble.prototype = UFX.Thing()
                     .addcomp(WorldBound)
                     .addcomp(FadesUpward, 200)
                     .addcomp(Wobbles)
                     .addcomp(IsBall, 20, "#AAF")
                     .addcomp(Drifts)
                     .addcomp(GivesBoost, 240)









