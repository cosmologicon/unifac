
var gamestate = {
    worldsize: 1000,
    
    bank: 100,
}


function upgrade(button) {
    if (button.id === "upgradejump") {
        mechanics.launchspeed += 50
        gamestate.bank -= 10
    }
}


