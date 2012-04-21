
var gamestate = {
    worldsize: 400,

    // Abilities
    njumps: 2,  // How many jumps can you perform
    
    
    bank: 100,
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
        gamestate.worldsize += 100
        gamestate.worldr = gamestate.worldsize / tau
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



