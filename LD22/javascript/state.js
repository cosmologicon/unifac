var Thing = require('./Thing')
var gamejs = require('gamejs')

var HUD, gameplay, stage, indicators, critters
var statusbox

// Sprite groups
exports.tokens = new Array()
exports.players = new Array()
exports.hazards = new Array()
exports.mhazards = new Array()
exports.monsters = new Array()
exports.selected = new Array()

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

exports.currentlevel = 0
exports.loadlevel = function(level) {
    if (!level) {
        if (exports.currentlevel == 0) {
            level = 21
        } else if (exports.currentlevel == 21) {
            level = 1
        }
    }
    exports.currentlevel = level


    if (exports.currentlevel == 21) {
        exports.title = "Quest for the forgotten Spells"
        exports.subtitle = "Four adventurers remain"
    }

    if (exports.currentlevel == 1) {
        makelayers()
        for (var j = 0 ; j < playerstates.length ; ++j) {
            var player = new Thing.Adventurer(playerstates[j])
            var pos = [Math.random() * 400 - 200, Math.random() * 400 - 200]
            player.attachto(exports.critters).setstagepos(pos)
            exports.players.push(player);
            player.castshadow()
        }
        exports.monsterq = ["lump", "lump", "lump"]
    }
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
    xpspent: 0,
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
    xpspent: 0,
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
    xpspent: 0,
    deserted: 0,
}]
var completedlevel = 0
exports.xp = 0


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

