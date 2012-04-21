
var CrashDamage = {
    init: function (dhp) {
        this.dhp = dhp || 1
    },
    think: function (dt) {
        if (this.alive && this.y <= 0) {
            this.alive = false
            gamestate.hp -= this.dhp
            effects.push(new EntryPoint(this.x, this.y))
        }
    },
}

var Clonkable = {
    init: function (width, height) {
        this.width = width || 10
        this.height = height || this.width
    },
    draw: function () {
        context.strokeRect(-this.width, 0, 2*this.width, this.height)
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


function Gnat(x, y) {
    this.x = x
    this.y = y
    this.vy = -100
    this.vx = UFX.random(-40, 40)
    this.alive = true
    this.think(0)
}
Gnat.prototype = UFX.Thing()
                    .addcomp(WorldBound)
                    .addcomp(CrashDamage, 1)
                    .addcomp(IsBall, 5, "gray")
                    .addcomp(Drifts)
                    .addcomp(HasHealth, 1)
                    .addcomp(Clonkable, 15, 15)
                    .addcomp(CarriesReward, 1)



