
gamestate = Object.create({
    setworldsize: function (s) {
        this.worldsize = s
        this.worldr = s / tau
        this.nslots = Math.floor(s / 50)
        structures.length = this.nslots
    },
    // If player is at x, where's the nearest building location?
    buildindex: function(x) {
        var n = Math.floor(x / tau * this.nslots + 0.5)
        return ((n % this.nslots) + this.nslots) % this.nslots
    },

    buildat: function (x) {
        return this.buildindex(x) * tau / this.nslots
    },
    
    addstructure: function (structure, slot) {
        if (typeof slot !== "number") slot = this.buildindex(you.x)
        structures[slot] = structure
        structure.x = slot * tau / this.nslots
    },
})

// Abilities
gamestate.njumps = 2  // How many jumps can you perform
gamestate.bank = 100
gamestate.hp = 100


function disablebutton (bname) {
    var b = document.getElementById(bname)
    b.className = "HUDghost"
    b.disabled = true
}
function hidebutton (bname) {
    var b = document.getElementById(bname)
    b.className = "HUDhidden"
    b.disabled = true
}
function enablebutton (bname) {
    var b = document.getElementById(bname)
    b.className = "HUDbutton"
    b.disabled = false
}

function updatebuttons () {
    var allbuttons = ["buildspring", "buildbubbler"]
    if (you.y > 0 || structures[gamestate.buildindex(you.x)]) {
        allbuttons.forEach(disablebutton)
    } else {
        allbuttons.forEach(enablebutton)
    }
}



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
        gamestate.addstructure(new Springboard())
    }
    if (button.id === "buildbubbler") {
        gamestate.addstructure(new Bubbler())
    }
}



