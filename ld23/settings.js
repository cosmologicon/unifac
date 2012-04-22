

var settings = {
    sx: 600,
    sy: 600,
    tickmult: 5,  // number of times we call think(). I know I know, I should be fixing my timestep. It's LD, buddy!
}

var mechanics = {
    runspeed: 160,
    jumphspeed: 160,
    launchspeed: 140,
    launchaccel: 2000,
    
    springspeed: [250, 300, 350, 400],
    springtime: [0.1, 0.4, 0.5, 0.6, 0.8],
    bubbletime: [20, 15, 10, 5, 4],
    maxbombs: [1, 2, 3, 4],
    bombtime: [60, 30, 30, 30],
    healtime: [30, 25, 20, 15],


    shockwavevs: [120, 140, 160, 180, 200],
    shockwavesizes: [50, 60, 70, 85, 100],
    shocktimes: [4, 3, 2, 1, 0.5],  // shock recharge times
    shocktime: 0.5,  // Time spent kicking
    shockspeed: 80,  // speed while kicking

    upgradekickcosts: [1, 1, 1, 1, 1],
    upgradejumpcosts: [0, 10, 20, 30, 40],

    clonkvy: 200,
    
    gravity: 400,  // non-resisted gravity
    rgravity: 400,  // resisted gravity
    
    lookahead: 100,

    buildcost: {
        tower: 3,
        hospital: 3,
        spring: 3,
        bubbler: 3,
        silo: 3,
    },

    upgradecost: {   // cost to upgrade buildings
        tower: [10, 20, 30, 40, 50, 60],
        hospital: [10, 20, 30, 40, 50, 60],
        spring: [10, 20, 30, 40, 50, 60],
        bubbler: [10, 20, 30, 40, 50, 60],
        silo: [10, 20, 30, 40, 50, 60],
    },
    
    worldsizes: [100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700],
    growcosts: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

}


