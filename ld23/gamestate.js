
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

    upgradestructure: function (slot) {
        if (typeof slot !== "number") slot = this.buildindex(you.x)
        if (!structures[slot]) return
        structures[slot].upgrade()
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
gamestate.level = 0  // overall game scene
gamestate.njumps = 2  // How many jumps can you perform
gamestate.bank = 0
gamestate.hp = 100
gamestate.unlocked = {
    grow: true,
    shock: 4,
    jumps: 4,
    upgradestruct: 4,
    structures: true,
}
gamestate.shocklevel = 1
gamestate.buildunlocked = {
    tower: true,
    hospital: true,
    springboard: true,
    bubbler: true,
    silo: true,
}

gamestate.unlocked = {
    grow: false,
    shock: 1,
    jumps: 2,
    upgradestruct: 0,
    structures: false,
}
gamestate.buildunlocked = {
    tower: true,
    hospital: false,
    springboard: false,
    bubbler: false,
    silo: false,
}





function namebutton(bname, text) {
    var b = document.getElementById(bname)
    b.childNodes[0].nodeValue = text
}
function disablebutton(bname, text) {
    var b = document.getElementById(bname)
    b.className = "HUDghost"
    b.disabled = true
    if (text) b.childNodes[0].nodeValue = text
}
function hidebutton(bname, text) {
    var b = document.getElementById(bname)
    b.className = "HUDhidden"
    b.disabled = true
    if (text) b.childNodes[0].nodeValue = text
}
function enablebutton(bname, text) {
    var b = document.getElementById(bname)
    b.className = "HUDbutton"
    b.disabled = false
    if (text) b.childNodes[0].nodeValue = text
}
function setbutton(bname, enabled) {
    if (enabled) {
        enablebutton(bname)
    }
    if (!enabled) {
        disablebutton(bname)
    }
}


var buildbuttons = ["buildspring", "buildbubbler", "buildsilo", "buildhospital", "buildtower"]
var otherbuttons = ["removestructure", "upgradestructure", "upgradeworld", "downgradeworld", "upgradejump", "upgradekick"]

var buildnames = {
    tower: "Tower",
    hospital: "Healer",
    spring: "Launcher",
    bubbler: "Bubbler",
    silo: "Bomb Silo",
}
var buildkeys = {
    tower: "5",
    hospital: "6",
    spring: "7",
    bubbler: "8",
    silo: "9",
}

//var allbuttons = buildbuttons + otherbuttons
function updatebuttons() {
    var struct = structures[gamestate.buildindex(you.x)]
    var grounded = you.y === 0

    for (var sname in buildnames) {
        if (!gamestate.unlocked.structures || !gamestate.buildunlocked[sname]) {
            hidebutton("build" + sname)
            continue
        }
        var cost = mechanics.buildcost[sname]
        var text = buildkeys[sname] + ": Place " + buildnames[sname] + " $" + cost + ""
        if (struct || !grounded || cost > gamestate.bank) {
            disablebutton("build" + sname, text)
        } else {
            enablebutton("build" + sname, text)
        }
    }

    // Upgrade structure button
    if (!gamestate.unlocked.upgradestruct) {
        hidebutton("upgradestructure")
    } else {
        if (!struct || !grounded) {
            disablebutton("upgradestructure", "1: Upgrade structure")
        } else {
            cost = struct.upgradeamount()
            var text = "1: Upgrade structure" + (cost ? " $" + cost : "")
            if (cost && cost <= gamestate.bank) {
                enablebutton("upgradestructure", text)
            } else {
                disablebutton("upgradestructure", text)
            }
        }
    }
    
    // Remove structure button
    if (!gamestate.unlocked.structures) {
        hidebutton("removestructure")
    } else {
        if (!struct || !grounded) {
            disablebutton("removestructure", "0: Remove structure")
        } else {
            enablebutton("removestructure", "0: Remove structure")
        }
    }
    
    // Upgrade jump button
    if (gamestate.njumps >= gamestate.unlocked.jumps) {
        hidebutton("upgradejump")
    } else {
        var cost = mechanics.upgradejumpcosts[gamestate.njumps]
        var text = "2: Upgrade jump $" + cost + ""
        if (cost <= gamestate.bank) {
            enablebutton("upgradejump", text)
        } else {
            disablebutton("upgradejump", text)
        }
    }

    // Upgrade kick button
    if (gamestate.shocklevel >= gamestate.unlocked.shock) {
        hidebutton("upgradekick")
    } else {
        var cost = mechanics.upgradekickcosts[gamestate.shocklevel]
        var text = "3: Upgrade kick $" + cost + ""
        if (cost <= gamestate.bank) {
            enablebutton("upgradekick", text)
        } else {
            disablebutton("upgradekick", text)
        }
    }

    // Grow button
    if (!gamestate.unlocked.grow) {
        hidebutton("upgradeworld")
    } else {
        var cost = growcost()
        var text = "4: Grow $" + cost + ""
        if (!cost) {
            disablebutton("upgradeworld", "5: Grow")
        } else if (cost <= gamestate.bank) {
            enablebutton("upgradeworld", text)
        } else {
            disablebutton("upgradeworld", text)
        }
    }
}
function disableall() {
    buildbuttons.forEach(disablebutton)
    otherbuttons.forEach(disablebutton)
}

function checklevel() {
    if (gamestate.level === 0) {
        if (gamestate.bank >= 50) {
            advancelevel()
        }
    } else if (gamestate.level === 1) {
        if (gamestate.bank >= 120) {
            advancelevel()
        }
    } else if (gamestate.level === 2) {
        if (gamestate.bank >= 250 && gamestate.hp >= 90) {
            advancelevel()
        }
    }

}
function advancelevel() {
    gamestate.level += 1
    if (gamestate.level === 1) {
        gamestate.unlocked.structures = true
        gamestate.buildunlocked.tower = true
    } else if (gamestate.level === 2) {
        gamestate.buildunlocked.hospital = true
    } else if (gamestate.level === 2) {
        gamestate.buildunlocked.hospital = true
    } else if (gamestate.level === 3) {
        gamestate.unlocked.grow = true
    }
    if (settings.showcutscenes) {
        UFX.scene.push(CutScene)
    }
}


function growcost() {
    for (var j = 0 ; j < mechanics.worldsizes.length ; ++j) {
        var s = mechanics.worldsizes[j], c = mechanics.growcosts[j]
        if (s > gamestate.worldsize) {
            return c
        }
    }
    return 0
}

function cangrow() {
    if (gamestate.hp < 90) return 0
    for (var j = 0 ; j < mechanics.worldsizes.length ; ++j) {
        var s = mechanics.worldsizes[j], c = mechanics.growcosts[j]
        if (s > gamestate.worldsize && c <= gamestate.bank) {
            return [s, c]
        }
    }
    return 0
}
function shrinkto() {
    for (var j = mechanics.worldsizes.length - 1 ; j >= 0 ; --j) {
        var s = mechanics.worldsizes[j]
        if (s < gamestate.worldsize) return s
    }
    return 0
}
function canupgradekick() {
    if (!gamestate.unlocked.shock) return false
    if (gamestate.shocklevel >= gamestate.unlocked.shock) return false
    return mechanics.upgradekickcosts[gamestate.shocklevel]
}


function upgrade(button) {
    if (typeof button !== "string") button = button.id
    if (button === "upgradekick") {
        var c = canupgradekick()
        if (c) {
            gamestate.shocklevel += 1
            gamestate.bank -= c
        }
    }
    if (button === "upgradejump") {
        if (gamestate.njumps >= gamestate.unlocked.jumps) return
        var cost = mechanics.upgradejumpcosts[gamestate.njumps]
        if (cost > gamestate.bank) return
        gamestate.bank -= cost
        gamestate.njumps += 1
    }
    if (button === "upgraderun") {
        mechanics.runspeed += 30
        mechanics.jumphspeed = mechanics.runspeed
        gamestate.bank -= 10
    }
    if (button === "upgradeworld") {
        var sizecost = cangrow()
        if (sizecost) {
            gamestate.bank -= sizecost[1]
            GrowScene.newsize = sizecost[0]
            UFX.scene.push(GrowScene)
        }
    }
    if (button === "downgradeworld") {
        GrowScene.newsize = shrinkto()
        UFX.scene.push(GrowScene)
    }
}

function build(button) {
    var struct = structures[gamestate.buildindex(you.x)]
    var grounded = you.y === 0
    if (struct || !grounded) return

    if (typeof button !== "string") button = button.id
    if (button === "buildspring") {
        var cost = mechanics.buildcost.spring
        if (cost > gamestate.bank) return
        gamestate.addstructure(new Springboard())
        gamestate.bank -= cost
    }
    if (button === "buildbubbler") {
        var cost = mechanics.buildcost.bubbler
        if (cost > gamestate.bank) return
        gamestate.addstructure(new Bubbler())
        gamestate.bank -= cost
    }
    if (button === "buildsilo") {
        var cost = mechanics.buildcost.silo
        if (cost > gamestate.bank) return
        gamestate.addstructure(new Silo())
        gamestate.bank -= cost
    }
    if (button === "buildhospital") {
        var cost = mechanics.buildcost.hospital
        if (cost > gamestate.bank) return
        gamestate.addstructure(new Hospital())
        gamestate.bank -= cost
    }
    if (button === "buildtower") {
        var cost = mechanics.buildcost.tower
        if (cost > gamestate.bank) return
        gamestate.addstructure(new Tower())
        gamestate.bank -= cost
    }
}


