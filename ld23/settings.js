

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
    
    springspeed: [250, 300, 350, 400],
    springtime: [0.1, 0.4, 0.5, 0.6, 0.8],
    bubbletime: [20, 15, 10, 5, 4],
    maxbombs: [1, 2, 3, 4],
    bombtime: [60, 30, 30, 30],
    healtime: [30, 25, 20, 15],


    shockspeed: 140,
    shocktime: 0.5,

    clonkvy: 200,
    
    gravity: 400,  // non-resisted gravity
    rgravity: 400,  // resisted gravity
    
    lookahead: 100,

    upgradecost: {   // cost to upgrade buildings
        springboard: [10, 20, 30, 40],
        bubbler: [10, 20, 30],
        silo: [10, 20, 30],
        hospital: [10, 20, 30],
        tower: [10, 20, 30],
        mine: [10, 20, 30],
    },
    
    maxlevel: {
        springboard: 3,
        bubbler: 3,
        silo: 3,
        hospital: 3,
        tower: 3,
        mine: 3,
    },

}


