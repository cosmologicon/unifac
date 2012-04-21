
gamestate = Object.create({
    setworldsize: function (s) {
        this.worldsize = s
        this.worldr = s / (2 * Math.PI)
        this.nslots = Math.floor(s / 50)
    },
    // If player is at x, where's the nearest building location?
    buildindex: function(x) {
        var n = Math.floor(x / tau * this.nslots + 0.5)
        return ((n % this.nslots) + this.nslots) % this.nslots
    },

    buildat: function (x) {
        return this.buildindex(x) * tau / this.nslots
    },
})

// Abilities
gamestate.njumps = 2  // How many jumps can you perform
gamestate.bank = 100
gamestate.hp = 100


gamestate.setworldsize(400)




function upgrade(button) {
    if (button.id === "upgradejump") {
        mechanics.launchspeed += 50
        gamestate.bank -= 10
    }
    if (button.id === "upgraderun") {
        mechanics.runspeed += 30
        mechanics.jumphspeed = mechanics.runspeed
        gamestate.bank -= 10
    }
    if (button.id === "upgradeworld") {
        gamestate.setworldsize(gamestate.worldsize + 100)
    }
}

function build(button) {
    if (button.id === "buildspring") {
        structures.push(new Springboard(you.x))
    }
    if (button.id === "buildbubbler") {
        structures.push(new Bubbler(you.x))
    }
}



