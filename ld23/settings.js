

var settings = {
    sx: 600,
    sy: 600,
    tickmult: 5,  // number of times we call think(). I know I know, I should be fixing my timestep. It's LD, buddy!
}

var mechanics = {
    runspeed: 120,
    jumphspeed: 120,
    launchspeed: 140,
    launchaccel: 2000,
    
    springspeed: 400,
    springtime: 0.8,

    shockspeed: 140,
    shocktime: 0.5,

    clonkvy: 200,
    
    gravity: 400,  // non-resisted gravity
    rgravity: 400,  // resisted gravity
    
    lookahead: 100,

    upgrades: {   // cost to upgrade buildings
        springboard: [10, 20, 30, 40],
        bubbler: [10, 20, 30],
        silo: [10, 20, 30],
    },

}


