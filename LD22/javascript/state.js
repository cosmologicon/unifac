var Thing = require('./Thing')

var HUD, gameplay, stage, indicators, critters
var statusbox

// Sprite groups
exports.tokens = new Array()
exports.players = new Array()
exports.hazards = new Array()
exports.monsters = new Array()
exports.selected = new Array()

// Remove dead members - should be called periodically
exports.filtergroups = function() {
    exports.tokens = exports.tokens.filter(function (t) { return t.parent })
    exports.players = exports.players.filter(function (t) { return t.parent })
    exports.hazards = exports.hazards.filter(function (t) { return t.parent })
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
    exports.selected = newselected
    for (var j in exports.selected) {
//        sindicators.push((new Thing.Indicator(exports.selected[j], 20, null, "yellow")).attachto(exports.indicators))
    }
}



// Layers during gameplay:

// - gameplay
//    - stage
//      - indicators (things on the ground)
//      - critters
// - HUD

function makelayers() {
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


exports.makelayers = makelayers

