var Thing = require('./Thing')

var HUD, gameplay, stage, indicators, critters
var statusbox

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

