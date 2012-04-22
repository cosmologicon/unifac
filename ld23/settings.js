

var settings = {
    sx: 600,
    sy: 600,
    tickmult: 5,  // number of times we call think(). I know I know, I should be fixing my timestep. It's LD, buddy!
    showcutscenes: false,
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
    healtime: [20, 10, 7, 5, 4, 3, 2.5, 2, 1.5, 1.2, 1, 0.8],


    shockwavevs: [140, 140, 150, 150, 160, 170, 180, 200, 220, 250, 300, 350],
    shockwavesizes: [50, 54, 60, 67, 77, 87, 97, 107, 117, 130],
    shocktimes: [10, 8, 6.5, 5, 4, 3, 2.5, 2, 1.5, 1],  // shock recharge times
    shocktime: 0.5,  // Time spent kicking
    shockspeed: 80,  // speed while kicking

    upgradekickcosts: [1, 1, 1, 1, 1],
    upgradejumpcosts: [0, 10, 20, 30, 40],

    clonkvy: 200,
    
    gravity: 400,  // non-resisted gravity
    rgravity: 400,  // resisted gravity
    
    lookahead: 100,

    buildcost: {
        tower: 50,
        hospital: 120,
        spring: 3,
        bubbler: 3,
        silo: 3,
    },

    upgradecost: {   // cost to upgrade buildings
        tower: [100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 1000],
        hospital: [100, 110, 120, 140, 160, 180, 200, 240, 300, 400, 500],
        spring: [10, 20, 30, 40, 50, 60],
        bubbler: [10, 20, 30, 40, 50, 60],
        silo: [10, 20, 30, 40, 50, 60],
    },
    
    worldsizes: [100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700],
    growcosts: [100, 200, 300, 400, 500],

}


