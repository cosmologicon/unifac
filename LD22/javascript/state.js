var Thing = require('./Thing')
var sound = require('./sound')
var ShopThing = require('./ShopThing')
var gamejs = require('gamejs')

var HUD, gameplay, stage, indicators, critters
var statusbox

// Sprite groups
function creategroups() {
    exports.tokens = new Array()
    exports.players = new Array()
    exports.hazards = new Array()
    exports.mhazards = new Array()
    exports.monsters = new Array()
    exports.selected = new Array()
}

// Remove dead members - should be called periodically
exports.filtergroups = function() {
    exports.tokens = exports.tokens.filter(function (t) { return t.parent })
    exports.players = exports.players.filter(function (t) { return t.parent })
    exports.hazards = exports.hazards.filter(function (t) { return t.parent })
    exports.mhazards = exports.mhazards.filter(function (t) { return t.parent })
    exports.selected = exports.selected.filter(function (t) { return t.parent })
    exports.monsters = exports.monsters.filter(function (t) { return t.parent })
}

// Select new players
var sindicators = []
exports.applyselection = function(newselected) {
    if (newselected && newselected.length) sound.play("select-0")
    for (var j in sindicators) {
        sindicators[j].die()
    }
    sindicators = []
    exports.selected = newselected || []
    for (var j in exports.selected) {
        var i = (new Thing.Indicator(exports.selected[j], 20, null, "yellow")).attachto(exports.indicators)
        sindicators.push(i)
    }
}



// Layers during gameplay:

// - gameplay
//    - stage
//      - indicators (things on the ground)
//      - critters
// - HUD

makelayers = function() {
    HUD = new Thing.Thing()
    gameplay = new Thing.Thing()
    var fps = (new Thing.FPSCounter()).attachto(HUD)
    statusbox = (new Thing.TextBox()).attachto(HUD).setpos([10, 440])

    stage = (new Thing.Stage()).attachto(gameplay)
    indicators = (new Thing.StagedThing()).attachto(stage)
    critters = (new Thing.StagedThing()).attachto(stage)

    exports.HUD = HUD
    exports.gameplay = gameplay
    exports.stage = stage
    exports.indicators = indicators
    exports.critters = critters
    exports.statusbox = statusbox

}

makeshoplayers = function() {
    HUD = new Thing.Thing()
    gameplay = new Thing.Thing()
    var fps = (new Thing.FPSCounter()).attachto(HUD)
    statusbox = (new Thing.TextBox()).attachto(HUD).setpos([10, 440])

    stage = (new Thing.Stage()).attachto(gameplay)
    indicators = (new Thing.StagedThing()).attachto(stage)
    critters = (new Thing.StagedThing()).attachto(stage)

    exports.HUD = HUD
    exports.gameplay = gameplay
    exports.stage = stage
    exports.indicators = indicators
    exports.critters = critters
    exports.statusbox = statusbox

}

var mtypes = {
    lump: Thing.Lump,
    largelump: Thing.LargeLump,
    spike: Thing.Spike,
    largespike: Thing.LargeSpike,
    skull: Thing.Skull,
    zoltar: Thing.Zoltar,
    birdy: Thing.Birdy,
}

exports.gameevents = function(dt) {
    gamet += dt

    if (exports.currentlevel < 10) {
        while (monsterq.length && monsterq[0][0] >= exports.monsters.length) {
            var wave = monsterq.splice(0, 1)[0]
            var theta = Math.random() * 1000, r = 600
            for (var j = 1 ; j < wave.length ; ++j) {
                theta += 0.3
                r += 100
                var pos = [r * Math.cos(theta), r * Math.sin(theta)]
                var type = mtypes[wave[j]]
                if (wave[j] == "zoltar") pos = [0,0,600]
                if (wave[j] == "birdy") pos = [pos[0],pos[1],120]
                var m = (new type()).attachto(exports.critters).setstagepos(pos)
                exports.monsters.push(m)
                m.castshadow()
            }
        }
        if (!exports.players.length) {
            loselevel()
        }
        if (exitportal.parent) {
            checkexitportal()
        }

        if (exports.currentlevel == 2) {
            if (Math.random() * 2 < dt) {
                var n = Math.floor(Math.sqrt(Math.sqrt(gamet))) + 1
                var mons = [n]
                for (var j = 0 ; j < n ; ++j) mons.push("lump") //Math.random() < 0.3 ? "largelump" : "lump")
                monsterq = [mons]
            }
        }

        
        // End conditions
        if (exports.currentlevel == 1 || exports.currentlevel == 3 || exports.currentlevel == 4 || exports.currentlevel == 5) {  // Kill all monsters
            if (!monsterq.length && !exports.monsters.length) {
                placeexitportal()
            }
        } else if (exports.currentlevel == 2) {  // Kill the crystal
            if (!crystal.parent) {
                placeexitportal()
            }
        }
    }
}

placeexitportal = function() {
    if (exitportal.parent) return
    sound.play("portal-0")
    exitportal.attachto(exports.indicators)
    exitportal.reposition()
    exitportal.r *= 2
    while (exports.players.length && exitportal.contains(exports.players[0])) {
        exitportal.reposition()
    }
    exitportal.r /= 2
}
checkexitportal = function () {
    var n = 0
    for (var j = 0 ; j < exports.players.length ; ++j) {
        if (exitportal.contains(exports.players[j])) n += 1
    }
    if (n >= exports.players.length) beatlevel()
}

beatlevel = function() {
    completedlevel = exports.currentlevel
    if (exports.currentlevel == 1) {
        for (var j in playerstates) {
            playerstates[j].mp0 = 10
        }
    }

    // Desertion
    var n = 0, xpmax = -1
    deserted = null
    for (var j in playerstates) {
        if (playerstates[j].deserted) continue
        if (playerstates[j].xpspent > xpmax) {
            deserted = j
            n = 1
            xpmax = playerstates[j].xpspent
        } else if (playerstates[j].xpspent == xpmax) {
            if (Math.random() * (n + 1) < 1) {
                deserted = j
                n += 1
            }
        }
    }
    if (deserted !== null) {
        playerstates[deserted].deserted = true
    }
    exports.savestate()

    exports.loadlevel(completedlevel < 5 ? 71 : 26)
}
loselevel = function() {
    exports.savestate()
    exports.loadlevel(72)
}
exports.beatlevel = beatlevel

var musics = {
    1: "happy-0",
    2: "happy-1",
    3: "happy-2",
    4: "happy-0",
    5: "happy-1",
    10: "fast-0",
}



exports.currentlevel = 0
exports.loadlevel = function(level) {
    gamet = 0
    if (!level) {
        if (exports.currentlevel == 0) {  // start -> first title
            level = 21 + completedlevel
        } else if (exports.currentlevel > 20 && exports.currentlevel < 30) {  // title ->  gameplay
            level = exports.currentlevel - 20
        } else if (exports.currentlevel == 1) {   // gameplay -> shop. shouldn't be here.
            level = 10
        } else if (exports.currentlevel == 10) {  // shop -> title
            level = 21 + completedlevel
        } else if (exports.currentlevel == 71) {  // end title -> cutscene
            // TODO: should be cutscene
            level = 10
        } else if (exports.currentlevel == 72) {  // end title -> shop
            level = 10
        }
    }
//    alert([exports.currentlevel, level])
    exports.currentlevel = level

    if (musics[level]) sound.playmusic(musics[level])

    creategroups()

    if (exports.currentlevel == 21) {
        exports.title = "Quest for the Lost Spells"
        exports.subtitle = "Five adventurers remain"
    }
    if (exports.currentlevel == 22) {
        exports.title = "Quest for the Crystal Key"
        exports.subtitle = "Four adventurers remain"
    }
    if (exports.currentlevel == 23) {
        exports.title = "The Cavern of Ryor"
        exports.subtitle = "Three adventurers remain"
    }
    if (exports.currentlevel == 24) {
        exports.title = "Zoltar's Lair"
        exports.subtitle = "Two adventurers remain"
    }
    if (exports.currentlevel == 25) {
        exports.title = "The Last Adventure"
        exports.subtitle = "One adventurer remains"
    }


    if (exports.currentlevel == 71) {
        exports.title = "Quest completed"
        exports.subtitle = "But one adventurer could not continue..."
    }
    if (exports.currentlevel == 72) {
        exports.title = "Quest failed"
        exports.subtitle = "Try again"
    }
    if (exports.currentlevel == 26) {
        exports.title = "The adventure is over"
        exports.subtitle = "Thanks for playing"
    }



    if (exports.currentlevel < 10) {
        makelayers()
        for (var j = 0 ; j < playerstates.length ; ++j) {
            if (playerstates[j].deserted) continue
            var player = new Thing.Adventurer(playerstates[j])
            var pos = [Math.random() * 400 - 200, Math.random() * 400 - 200]
            player.attachto(exports.critters).setstagepos(pos)
            exports.players.push(player);
            player.castshadow()
        }
        exitportal = new Thing.ExitPortal()
        monsterq = new Array()
    }

    if (exports.currentlevel == 1) {  // Fixed monster queue
        monsterq = [[0,"lump","lump","lump"], [1,"lump","lump","lump"], [2,"lump","lump","lump"],
            [3,"lump","lump","lump","lump"],
            [4,"lump","lump","lump","lump","largelump"],
            [5,"lump","lump","lump","lump","lump","largelump"],
        ]
    } else if (exports.currentlevel == 2) {
        crystal = (new Thing.Crystal()).attachto(exports.critters)
        exports.monsters.push(crystal)
    } else if (exports.currentlevel == 3) {
        monsterq = [[0,"lump","spike","lump"], [1,"spike","spike","spike"],
            [2,"spike", "spike", "spike"],
            [3,"largespike"],
            [0,"largelump", "largelump", "largelump", "lump","spike","largelump","lump","lump", "largespike", "spike"],
            [0,"skull"], [2,"skull"], [2,"skull"],
        ]
    } else if (exports.currentlevel == 4) {
        monsterq = [[0,"largelump","largelump","largelump"],
            [1,"largespike", "largespike", "largespike"],
            [2,"largelump", "largespike", "largespike", "largespike", "largespike"],
            [0,"zoltar"],
        ]
//        monsterq =[[0,"zoltar"]]
    } else if (exports.currentlevel == 5) {
        monsterq = [[0,"largelump","largelump","largelump"],
            [1,"largespike", "largespike", "largespike"],
            [2,"largelump", "largespike", "largespike", "largespike", "largespike"],
            [0,"zoltar"],
        ]
        monsterq =[[0,"birdy"]]

    }
    if (exports.currentlevel == 10) {
        makeshoplayers()
        upgrademenu = new Array()
        var theta0 = Math.random() * 1000
        for (var j = 0 ; j < playerstates.length ; ++j) {
            if (playerstates[j].deserted) continue
            var player = new Thing.Adventurer(playerstates[j])
            var theta = 2 * Math.PI * j / playerstates.length + theta0
            var pos = [360 * Math.sin(theta), 360 * Math.cos(theta)]
            player.attachto(exports.critters).setstagepos(pos)
            exports.players.push(player);
            player.castshadow()
            player.hp = player.hp0  // Gotta look your best for the shop
            player.mp = player.mp0
            upgrademenu[j] = new ShopThing.UpgradeMenu(player, playerstates, j)
        }
        var bbox = new ShopThing.BankBox()
        bbox.attachto(exports.HUD)
        greeting = new ShopThing.Greeting()
        greeting.attachto(exports.HUD)
        var button = new Thing.Button("DONE", [800, 400], exports.loadlevel)
        button.attachto(exports.HUD)
    }
}

exports.setshopvisibility = function() {
    greeting.attachto(exports.selected.length == 0 ? exports.HUD : null)
    for (var j = 0 ; j < upgrademenu.length ; ++j) {
        if (!upgrademenu[j]) continue
        var sel = exports.selected.indexOf(upgrademenu[j].player) > -1
        upgrademenu[j].attachto(sel ? exports.HUD : null)
    }
}

exports.upgradeamt = function(type, who) {
    return 1 + playerstates[who].upgrades[type]
}
exports.upgrade = function(type, who) {
    var amt = exports.upgradeamt(type, who)
    if (exports.xp < amt) {
        sound.play("no-0")
        return
    }
    sound.play("powerup-0")
    exports.xp -= amt
    switch (type) {
        case 0:
            playerstates[who].hp0 += 5
            break
        case 1:
            playerstates[who].mp0 += 5
            break
        case 2:
            playerstates[who].strength += 1
            break
        case 3:
            playerstates[who].speed += 10
            break
        case 4:
            playerstates[who].range += 20
            break
    }
    playerstates[who].xpspent += amt
    playerstates[who].upgrades[type] += 1
    for (var j in upgrademenu) {
        if (upgrademenu[j]) {
            upgrademenu[j].image = null
        }
    }
    exports.savestate()
}


var playerstates = [
  { name: "dana", size: 28, skill: "quake", hp0: 20, mp0: 0, speed: 90,  range: 100, strength: 3, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
  { name: "lisa", size: 28, skill: "bolt",  hp0: 40, mp0: 0, speed: 60,  range: 100, strength: 2, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
  { name: "theo", size: 28, skill: "quake", hp0: 20, mp0: 0, speed: 80,  range:  60, strength: 2, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
  { name: "rosa", size: 28, skill: "bolt",  hp0: 20, mp0: 0, speed: 120, range:  60, strength: 2, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
  { name: "mort", size: 28, skill: "drain", hp0: 40, mp0: 0, speed: 50,  range: 140, strength: 1, xpspent: 0, upgrades: [0, 0, 0, 0, 0], deserted: 0, },
]
var completedlevel = 0
exports.xp = 0


// The state is the overall quest state, doesn't include things that reset
// when you start a level over
exports.savestate = function() {
    var obj = [exports.xp, completedlevel, playerstates]
    localStorage.lastadvstate = JSON.stringify(obj)
}

exports.loadstate = function() {
    if (localStorage.lastadvstate) {
        var obj = JSON.parse(localStorage.lastadvstate)
        exports.xp = obj[0]
        completedlevel = obj[1]
        playerstates = obj[2]
    }
    exports.savestate()
}

//delete localStorage.lastadvstate  // TODO: remove
exports.loadstate()

exports.resetstate = function() {
    delete localStorage.lastadvstate
    window.location.reload()
}
document.getElementById("resetstate").onclick = exports.resetstate



if (false) { // TODO: remove
    for (var j in playerstates) playerstates[j].mp0 = 100
    completedlevel = 1
    exports.xp = 1000
}





