
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



function Springboard (x) {
    this.x = x
    this.y = 0
    this.alive = true
    this.think(0)
}
Springboard.prototype = UFX.Thing()
                           .addcomp(WorldBound)
                           .addcomp(CanUpgrade, "springboard")
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
                           .addcomp(Wobbles, 25, 0.6)
                           .addcomp(BlowsBubbles)
                           .addcomp(DrawBubbler)



