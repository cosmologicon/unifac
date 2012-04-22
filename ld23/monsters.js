
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
                    .addcomp(Drifts)
                    .addcomp(HasHealth, 1)
                    .addcomp(Clonkable, 15, 15)
                    .addcomp(CarriesReward, 1)

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



