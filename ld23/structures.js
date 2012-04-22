
CanUpgrade = {
    init: function (sched) {
        this.level = 1
        this.schedule = mechanics.upgrades[sched]
        this.maxlevel = this.schedule.length
    },
    draw: function () {
        var n = this.maxlevel
        for (var j = 0 ; j < n ; ++j) {
            var x = 5 * (j - (n - 1) / 2.), y = -8
            if (n > 6) {
                x *= 0.5
                if (j % 2) y -= 4
            }
            context.beginPath()
            context.arc(x, y, 2.5, 0, tau)
            context.strokeStyle = "black"
            context.lineWidth = 1
            context.fillStyle = j < this.level ? "red" : "gray"
            context.fill()
            context.stroke()
        }
    },
}

CanDemolish = {
    die: function () {
        this.alive = false
        effects.push(new Rubble(this.x, this.y + 16))
    },
}


SpringsYou = {
    interact: function (you) {
        if (you.vy < 0 && you.y > 0 && you.y < 40) {
            var dx = Math.abs(getdx(this.x, you.x))
            if (dx * this.xfactor < 20) {
                you.y = 40
                you.nextstate = SpringState
                this.wobble()
            }
        }
    },
}


BlowsBubbles = {
    think: function (dt) {
        if (UFX.random(10) < dt) {
            hitters.push(new Bubble(this.x, this.y + 30))
            this.wobble()
        }
    },
}

TossesBombs = {
    init: function () {
        this.maxbombs = 3
        this.tbomb = 0
        this.rechargetime = 3
    },
    think: function (dt) {
        this.tbomb += dt
        var nbombs = []
        this.bombs.forEach(function (b) { if (b.alive) nbombs.push(b) } )
        this.bombs = nbombs
        if (this.bombs.length < this.maxbombs && this.tbomb > this.rechargetime) {
            var bomb = new Bomb(this.x, this.y + 40)
            hitters.push(bomb)
            this.bombs.push(bomb)
            this.wobble()
            this.tbomb = 0
        }
    },
}

HealsTheWorld = {
    init: function () {
        this.theal = 0
        this.rechargetime = 3
    },
    think: function (dt) {
        this.theal += dt
        if (gamestate.hp < 100 && this.theal > this.rechargetime) {
            gamestate.healworld(1)
            this.theal = 0
            effects.push(new HealBox(1, this.x, this.y + 40))
            this.wobble()
        }
    },
}



DrawSpringboard = {
    draw: function () {
        var ps = [[-4, 20], [-4, 4], [-12, -1], [-4, -3], [4, -3], [12, -1], [4, 4,], [4, 20]]
        context.beginPath()
        context.moveTo(0, 20)
        ps.forEach(function (p) { context.lineTo(p[0], p[1]) })
        context.fillStyle = "yellow"
        context.strokeStyle = "black"
        context.fill()
        context.stroke()
        context.fillStyle = "gray"
        context.strokeStyle = "black"
        context.strokeRect(-16, 16, 32, 8)
        context.fillRect(-16, 16, 32, 8)
    }
}

DrawBubbler = {
    draw: function () {
        context.beginPath()
        context.moveTo(4, -1)
        context.quadraticCurveTo(4, 12, 16, 16)
        context.lineTo(-16, 16)
        context.quadraticCurveTo(-4, 12, -4, -1)
        context.closePath()
        context.fillStyle = "blue"
        context.strokeStyle = "black"
        context.fill()
        context.stroke()
        context.strokeRect(-16, 16, 32, 8)
        context.fillRect(-16, 16, 32, 8)
    },
}

DrawSilo = {
    draw: function () {
        context.fillStyle = "#90F"
        context.strokeStyle = "black"
        context.lineWidth = 1
        context.beginPath()
        context.moveTo(-16, -2)
        context.quadraticCurveTo(0, -8, 16, -2)
        context.bezierCurveTo(12, 12, -12, 12, -16, -2)
        context.closePath()
        context.fill()
        context.stroke()

        context.fillStyle = "#60F"
        context.beginPath()
        context.moveTo(-12, 4)
        context.quadraticCurveTo(0, 0, 12, 4)
        context.bezierCurveTo(8, 20, -8, 20, -12, 4)
        context.closePath()
        context.fill()
        context.stroke()

        context.fillStyle = "#30F"
        context.beginPath()
        context.moveTo(-8, 12)
        context.quadraticCurveTo(0, 8, 8, 12)
        context.bezierCurveTo(8, 24, -8, 24, -8, 12)
        context.closePath()
        context.fill()
        context.stroke()

        context.fillStyle = "black"
        context.scale(2.5, 1)
        context.beginPath()
        context.arc(0, 19, 2, 0, tau)
        context.fill()
    },
}

DrawHospital = {
    draw: function () {
        context.beginPath()
        context.moveTo(0, 12)
        context.lineTo(8, 24)
        context.lineTo(0, 36)
        context.lineTo(-8, 24)
        context.closePath()
        context.fillStyle = "red"
        context.strokeStyle = "black"
        context.fill()
        context.stroke()
    },
}


function Springboard (x) {
    this.x = x
    this.y = 0
    this.alive = true
    this.think(0)
}
Springboard.prototype = UFX.Thing()
                           .addcomp(WorldBound)
                           .addcomp(CanUpgrade, "springboard")
                           .addcomp(CanDemolish)
                           .addcomp(SpringsYou)
                           .addcomp(Wobbles, 25, 0.6)
                           .addcomp(DrawSpringboard)


function Bubbler (x) {
    this.x = x
    this.y = 0
    this.alive = true
    this.think(0)
}
Bubbler.prototype = UFX.Thing()
                           .definemethod("interact")
                           .addcomp(WorldBound)
                           .addcomp(CanUpgrade, "bubbler")
                           .addcomp(CanDemolish)
                           .addcomp(Wobbles, 25, 0.6)
                           .addcomp(BlowsBubbles)
                           .addcomp(DrawBubbler)


function Silo (x) {
    this.x = x
    this.y = 0
    this.bombs = []
    this.alive = true
    this.think(0)
}
Silo.prototype = UFX.Thing()
                    .definemethod("interact")
                    .addcomp(WorldBound)
                    .addcomp(CanUpgrade, "silo")
                    .addcomp(CanDemolish)
                    .addcomp(Wobbles, 25, 0.6)
                    .addcomp(TossesBombs)
                    .addcomp(DrawSilo)

function Hospital (x) {
    this.x = x
    this.y = 0
    this.alive = true
    this.think(0)
}
Hospital.prototype = UFX.Thing()
                    .definemethod("interact")
                    .addcomp(WorldBound)
                    .addcomp(CanUpgrade, "hospital")
                    .addcomp(CanDemolish)
                    .addcomp(HealsTheWorld)
                    .addcomp(Wobbles, 25, 0.6)
                    .addcomp(DrawHospital)



