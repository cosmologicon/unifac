
var CrashDamage = {
    init: function (dhp) {
        this.dhp = dhp || 1
    },
    think: function (dt) {
        if (this.alive && this.y <= 0) {
            this.alive = false
            gamestate.hurtworld(this.dhp)
            effects.push(new EntryPoint(this.x, this.y))
            effects.push(new DamageBox(this.dhp, this.x, this.y))
        }
    },
}

var Clonkable = {
    init: function (width, height) {
        this.width = width || 10
        this.height = height || this.width
    },
    draw: function () {
//        context.strokeRect(-this.width, 0, 2*this.width, this.height)
    },
    clonk: function (you, dhp) {
        this.takedamage(dhp)
    },
}

var CarriesReward = {
    init: function (reward) {
        this.reward = reward || 1
    },
    die: function () { 
        gamestate.bank += this.reward
        effects.push(new MoneyBox(this.reward, this.x, this.y))
    },
}

var Shatters = {
    die: function () {
        effects.push(new Shatter(this.x, this.y, 100))
    },
}

var EludesYou = {
    init: function (vx, vy, accel, vxmax) {
        this.vx = vx || 0
        this.vy = vy || 0
        this.accel = accel || 400
        this.vxmax = vxmax || 60
    },
    think: function (dt) {
        var dx = getdx(you.x, this.x) * this.xfactor
        if (Math.abs(dx) < 400) {
            this.vx += (dx > 0 ? 1 : -1) * dt * this.accel
            this.vx = Math.max(Math.min(this.vx, this.vxmax), -this.vxmax)
        }
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
}

var DartsAbout = {
    init: function (vx0, vy0, k) {
        this.vx0 = vx0 || 150
        this.vy0 = vy0 || 10
        this.vx = 0
        this.vy = 0
        this.k = k || 0.3
    },
    think: function (dt) {
        var f = Math.exp(-this.k * dt)
        this.vx *= f
        this.vy *= f
        if (Math.abs(this.vx) < 10) {
            this.vx = UFX.random(-this.vx0, this.vx0)
            this.vy = UFX.random(-this.vy0, this.vy0/3)
        }
        this.x += this.vx * dt / this.xfactor
        this.y += this.vy * dt
    },
}


var SmacksYou = {
    draw: function () {
        context.strokeStyle = "orange"
        context.strokeRect(-200, -120, 400, 90)
    },

    think: function (dt) {
        var dx = Math.abs(getdx(this.x, you.x)) * this.xfactor
        if (dx > 200) return
        if (you.y > this.y - 30 || you.y < this.y - 120) return
        if (you.state !== ReelState) {
            you.nextstate = ReelState
        }
    },

}



var DrawGnat = {
    init: function () {
        this.t = 0
    },
    think: function (dt) {
        this.t += dt
    },
    draw: function () {
        var S = 20 * Math.sin(this.t * 2), C = 20 * Math.cos(this.t * 2)
        context.beginPath()
        context.moveTo(S, C)
        context.lineTo(-S, -C)
        context.moveTo(S, -C)
        context.lineTo(-S, C)
        context.strokeStyle = "black"
        context.lineWidth = 1
        context.stroke()

        context.lineWidth = 0.6
        context.beginPath()
        context.moveTo(0, 16)
        context.lineTo(-10, 0)
        context.lineTo(0, -16)
        context.lineTo(10, 0)
        context.closePath()
        context.fillStyle = "gray"
        context.fill()

        context.moveTo(0, 16)
        context.lineTo(0, -16)
        context.moveTo(10, 0)
        context.lineTo(-10, 0)
        context.stroke()
        context.strokeStyle = "black"
        context.stroke()
        
    },

}


var DrawFly = {
    init: function () {
        this.t = 0
    },
    think: function (dt) {
        this.t += dt
    },
    draw: function () {
        var r0 = 12 + 10 * Math.sin(this.t * 2)
        var r1 = 24 - r0
        var s3 = 0.83
        context.lineWidth = 0.6
        context.strokeStyle = "black"

        context.beginPath()
        context.moveTo(0, r0)
        context.lineTo(s3*r1, 0.5*r1)
        context.lineTo(s3*r0, -0.5*r0)
        context.lineTo(0, -r1)
        context.lineTo(-s3*r0, -0.5*r0)
        context.lineTo(-s3*r1, 0.5*r1)
        context.closePath()

        context.fillStyle = "white"
        context.fill()
        context.stroke()

        context.beginPath()
        context.moveTo(0, r1)
        context.lineTo(s3*r0, 0.5*r0)
        context.lineTo(s3*r1, -0.5*r1)
        context.lineTo(0, -r0)
        context.lineTo(-s3*r1, -0.5*r1)
        context.lineTo(-s3*r0, 0.5*r0)
        context.closePath()

        context.fillStyle = "gray"
        context.fill()
        context.stroke()
    },

}

var DrawMite = {
    init: function () {
        this.t = 0
    },
    think: function (dt) {
        this.t += dt
    },
    draw: function () {
        context.save()
        context.rotate(this.t * 1.4)
        context.lineWidth = 1
        context.strokeStyle = "black"
        context.beginPath()
        context.moveTo(0, 12)
        context.lineTo(0, 18)
        context.moveTo(0, -12)
        context.lineTo(0, -18)
        context.stroke()

        context.lineWidth = 4
        context.beginPath()
        context.arc(0, 0, 10, 0, tau)
        context.stroke()
        context.lineWidth = 2
        context.strokeStyle = "gray"
        context.stroke()
        context.restore()
        
        context.rotate(0.5 * Math.sin(this.t))
        context.lineWidth = 1
        context.strokeStyle = "black"
        context.beginPath()
        context.moveTo(0, 20)
        context.lineTo(0, -20)
        context.stroke()
        context.beginPath()
        context.fillStyle = "black"
        context.arc(0, 0, 6, 0, tau)
        context.fill()
        context.beginPath()
        context.fillStyle = "#CCC"
        context.arc(0, 0, 5, 0, tau)
        context.fill()
        
    },

}


var DrawOverlord = {
    init: function () {
        this.propt = 0
    },
    think: function (dt) {
        this.propt += dt
    },
    draw: function () {
        context.fillStyle = "gray"
        context.strokeStyle = "black"
        context.lineWidth = 2


        function drawpoly(ps) {
            context.beginPath()
            context.moveTo(ps[0], ps[1])
            for (var j = 2 ; j < ps.length ; j += 2) {
                context.lineTo(ps[j], ps[j+1])
            }
            context.closePath()
            context.fill()
            context.stroke()
        }

        // Dome on top
        context.fillStyle = "#AAF"
        context.beginPath()
        context.arc(0, 0, 40, 0, tau)
        context.fill()
        context.stroke()


        // Main body
        context.fillStyle = "#888"
        drawpoly([40, 0, 200, -40, -200, -40, -40, 0])
        context.fillStyle = "#555"
        drawpoly([180, -120, 200, -40, -200, -40, -180, -120])
        context.fillStyle = "#333"
        drawpoly([180, -120, 0, -140, -180, -120])


        // Propellors
        context.fillStyle = "#AFA"
        function drawprop(x, s, a) {
            context.save()
            context.translate(x, -80)
            context.scale(s, 1)
            context.rotate(a)
            for (var j = 0 ; j < 3 ; ++j) {
                context.beginPath()
                context.moveTo(0, 0)
                context.lineTo(-10, 60)
                context.lineTo(0, 70)
                context.lineTo(10, 60)
                context.closePath()
                context.fill()
                context.stroke()
                context.rotate(tau/3)
            }
            context.restore()
        }
        drawprop(0, 1, this.propt)
        drawprop(110, 0.8, -1.2 * this.propt)
        drawprop(180, 0.5, 1.1 * this.propt)
        drawprop(-110, 0.8, -1.3 * this.propt)
        drawprop(-180, 0.5, 0.9 * this.propt)
    },
}


function Gnat(x, y) {
    this.x = x
    this.y = y
    this.vy = -10
    this.vx = UFX.random(-40, 40)
    this.alive = true
    this.think(0)
}
Gnat.prototype = UFX.Thing()
                    .addcomp(WorldBound)
                    .addcomp(CrashDamage, 1)
                    .addcomp(FadesIn, 5)
                    .addcomp(DrawGnat)
//                    .addcomp(EludesYou, 0, -10, 100, 40)
                    .addcomp(DartsAbout, 250, 20, 1)
                    .addcomp(HasHealth, 1)
                    .addcomp(Clonkable, 15, 15)
                    .addcomp(CarriesReward, 1)
                    .addcomp(Shatters)

function Fly(x, y) {
    this.x = x
    this.y = y
    this.vy = -10
    this.vx = UFX.random(-40, 40)
    this.alive = true
    this.think(0)
}
Fly.prototype = UFX.Thing()
                    .addcomp(WorldBound)
                    .addcomp(CrashDamage, 1)
                    .addcomp(FadesIn, 5)
                    .addcomp(DrawFly)
                    .addcomp(Drifts)
                    .addcomp(HasHealth, 1)
                    .addcomp(Clonkable, 15, 15)
                    .addcomp(CarriesReward, 1)
                    .addcomp(Shatters)

function Mite(x, y) {
    this.x = x
    this.y = y
    this.vy = -10
    this.vx = UFX.random(-40, 40)
    this.alive = true
    this.think(0)
}
Mite.prototype = UFX.Thing()
                    .addcomp(WorldBound)
                    .addcomp(CrashDamage, 1)
                    .addcomp(FadesIn, 5)
                    .addcomp(DrawMite)
                    .addcomp(Drifts)
                    .addcomp(HasHealth, 1)
                    .addcomp(Clonkable, 15, 15)
                    .addcomp(CarriesReward, 1)
                    .addcomp(Shatters)

Overlord = UFX.Thing()
            .addcomp(WorldBound, 0, 400)
            .addcomp(CrashDamage, 1)
            .addcomp(FadesIn, 1)
            .addcomp(DrawOverlord)
            .addcomp(Drifts, 40, 0)
            .addcomp(Clonkable, 15, 15)
            .addcomp(SmacksYou)

Overlord.alive = true

