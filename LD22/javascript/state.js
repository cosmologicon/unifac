var Thing = require('./Thing')
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
    lump: Thing.Lump
}

exports.gameevents = function(dt) {
    

    if (exports.currentlevel == 1) {
        while (monsterq.length && monsterq[0][0] >= exports.monsters.length) {
            var wave = monsterq.splice(0, 1)[0]
            var theta = Math.random() * 1000, r = 600
            for (var j = 1 ; j < wave.length ; ++j) {
                theta += 0.3
                r += 100
                var pos = [r * Math.cos(theta), r * Math.sin(theta)]
                var type = mtypes[wave[j]]
                var m = (new type()).attachto(exports.critters).setstagepos(pos)
                exports.monsters.push(m)
                m.castshadow()
            }
        }
        if (exitportal.parent) {
            checkexitportal()
        } else if (!monsterq.length && !exports.monsters.length) {
            placeexitportal()
        }
    }
}

placeexitportal = function() {
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
    // TODO: increment unlocked level
    // TODO: desertion
    exports.loadlevel(71)
}



exports.currentlevel = 0
exports.loadlevel = function(level) {
    if (!level) {
        if (exports.currentlevel == 0) {
            level = 21
        } else if (exports.currentlevel == 21) {
            level = 1
        } else if (exports.currentlevel == 1) {
            level = 10
        } else if (exports.currentlevel == 10) {
            level = 21
        } else if (exports.currentlevel == 71) {
            // TODO: should be cutscene
            level = 10
        } else if (exports.currentlevel == 72) {
            level = 10
        }
    }
    exports.currentlevel = level


    creategroups()

    if (exports.currentlevel == 21) {
        exports.title = "Quest for the forgotten Spells"
        exports.subtitle = "Four adventurers remain"
    }

    if (exports.currentlevel == 71) {
        exports.title = "Quest completed"
        exports.subtitle = " " // TODO: hasty explanation?
    }
    if (exports.currentlevel == 72) {
        exports.title = "Quest failed"
        exports.subtitle = " "
    }



    if (exports.currentlevel == 1) {
        makelayers()
        for (var j = 0 ; j < playerstates.length ; ++j) {
            if (playerstates[j].deserted) continue
            var player = new Thing.Adventurer(playerstates[j])
            var pos = [Math.random() * 400 - 200, Math.random() * 400 - 200]
            player.attachto(exports.critters).setstagepos(pos)
            exports.players.push(player);
            player.castshadow()
        }
        monsterq = [[0,"lump","lump","lump"], [1,"lump","lump","lump"]]
        exitportal = new Thing.ExitPortal()
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
        var sel = exports.selected.indexOf(upgrademenu[j].player) > -1
        upgrademenu[j].attachto(sel ? exports.HUD : null)
    }
}

exports.upgradeamt = function(type, who) {
    return 1 + playerstates[who].upgrades[type]
}
exports.upgrade = function(type, who) {
    var amt = exports.upgradeamt(type, who)
    if (exports.xp < amt) return
    exports.xp -= amt
    switch (type) {
        case 0:
            playerstates[who].hp0 += 5
            break
        case 1:
            playerstates[who].mp0 += 5
            break
        case 2:
            playerstates[who].speed += 10
            break
        case 3:
            playerstates[who].range += 10
            break
    }
    playerstates[who].xpspent += amt
    playerstates[who].upgrades[type] += 1
    for (var j in upgrademenu) upgrademenu[j].image = null
}


var playerstates = [
{
    name: "dana",
    size: 30,
    skill: "bolt",
    hp0: 200,
    mp0: 200,
    speed: 100,
    range: 100,
    strength: 3,
    xpspent: 0,
    upgrades: [0, 0, 0, 0],
    deserted: 0,
},
{
    name: "lisa",
    size: 30,
    skill: "bolt",
    hp0: 200,
    mp0: 200,
    speed: 100,
    range: 100,
    strength: 3,
    xpspent: 0,
    upgrades: [0, 0, 0, 0],
    deserted: 0,
},
{
    name: "theo",
    size: 30,
    skill: "bolt",
    hp0: 200,
    mp0: 200,
    speed: 100,
    range: 100,
    strength: 3,
    xpspent: 0,
    upgrades: [0, 0, 0, 0],
    deserted: 0,
}]
var completedlevel = 0
exports.xp = 50


// The state is the overall quest state, doesn't include things that reset
// when you start a level over
exports.savestate = function() {
    var obj = [exports.xp, completedlevel, playerstates]
    localStorage.lastadvstate = JSON.stringify(obj)
}

exports.loadstate = function() {
    var obj = JSON.parse(localStorage.lastadvstate)
    exports.xp = obj[0]
    currentlevel = obj[1]
    playerstates = obj[2]
}

exports.resetstate = function() {
    delete localStorage.lastadvstate
    window.location.reload()
}

