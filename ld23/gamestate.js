
gamestate = Object.create({
    setworldsize: function (s) {
        this.nslots = Math.floor(s / 50)
        // A cunning algorithm to fairly choose which buildings get destroyed when the world shrinks
        //   or which slots get added when the world grows
        if (this.nslots) {
            var nstructures = new Array(this.nslots)
            for (var j = 0 ; j < this.nslots ; ++j) nstructures[j] = null
            if (structures.length) {
                var dk = UFX.random.rand(this.nslots)
                for (var j = 0 ; j < structures.length ; ++j) {
                    var k = Math.floor((j * this.nslots + dk) / structures.length)
                    if (nstructures[k]) nstructures[k].die()
                    nstructures[k] = structures[j]
                    if (structures[j]) structures[j].x = k * tau / this.nslots
                }
            }
            structures = nstructures
        }

        if (s < 20) s = 20
        this.worldsize = s
        this.worldr = s / tau
        this.hp = 100
        if (this.worldsize < 100) {
            UFX.scene.push(GameOverScene)
        }
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
    
    removestructure: function (slot) {
        if (typeof slot !== "number") slot = this.buildindex(you.x)
        if (!structures[slot]) return
        structures[slot].die()
    },
    
    hurtworld: function (dhp) {
        this.hp -= dhp
        if (this.hp <= 0) {
            GrowScene.newsize = gamestate.worldsize - 100
            UFX.scene.push(GrowScene)
        }
    },
    
    healworld: function (dhp) {
        this.hp += dhp
        if (this.hp > 100) this.hp = 100
    },
})

// Abilities
gamestate.njumps = 2  // How many jumps can you perform
gamestate.bank = 100
gamestate.hp = 100


function disablebutton(bname) {
    var b = document.getElementById(bname)
    b.className = "HUDghost"
    b.disabled = true
}
function hidebutton(bname) {
    var b = document.getElementById(bname)
    b.className = "HUDhidden"
    b.disabled = true
}
function enablebutton(bname) {
    var b = document.getElementById(bname)
    b.className = "HUDbutton"
    b.disabled = false
}

var allbuttons = ["buildspring", "buildbubbler", "buildsilo", "buildhospital"]
function updatebuttons() {
    if (you.y > 0 || structures[gamestate.buildindex(you.x)]) {
        allbuttons.forEach(disablebutton)
    } else {
        allbuttons.forEach(enablebutton)
    }
}
function disableall() {
    allbuttons.forEach(disablebutton)
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
        GrowScene.newsize = gamestate.worldsize + 100
        UFX.scene.push(GrowScene)
    }
    if (button.id === "downgradeworld") {
        GrowScene.newsize = gamestate.worldsize - 100
        UFX.scene.push(GrowScene)
    }
}

function build(button) {
    if (button.id === "buildspring") {
        gamestate.addstructure(new Springboard())
    }
    if (button.id === "buildbubbler") {
        gamestate.addstructure(new Bubbler())
    }
    if (button.id === "buildsilo") {
        gamestate.addstructure(new Silo())
    }
    if (button.id === "buildhospital") {
        gamestate.addstructure(new Hospital())
    }
}


