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
    init: function () {
        this.alive = true
    },
    think: function (dt) {
        this.alive = this.alive && this.y > 0
    },
}


var CanNab = {
    init: function (radius) {
        this.radius = radius || 10
    },
    nab: function (objs) {
        for (var j = 0 ; j < objs.length ; ++j) {
            var dx = getdx(this.x, objs[j].x) * this.xfactor
            var dy = this.y - objs[j].y
            if (dx * dx + dy * dy < this.radius * this.radius) {
                objs[j].benabbed(this)
            }
        }
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


function Token() {
    return UFX.Thing()
              .addcomp(WorldBound, UFX.random(tau), 400)
              .addcomp(IsBall, 5, "yellow")
              .addcomp(Drifts, UFX.random.choice([-50, 50]), -30)
              .addcomp(Crashes)
              .addcomp(GivesMoney)
}









