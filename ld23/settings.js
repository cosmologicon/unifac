

var settings = {
    sx: 600,
    sy: 600,
    tickmult: 5,  // number of times we call think(). I know I know, I should be fixing my timestep. It's LD, buddy!
    showcutscenes: true,
}

var mechanics = {
    runspeed: 160,
    jumphspeed: 160,
    launchspeed: 140,
    launchaccel: 2000,
    
    springspeed: [250, 270, 290, 310, 330, 350, 370, 390, 410, 430, 450, 470, 490],
    springtime: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1],
    bubbletime: [20, 10, 7, 5, 4, 3, 2.5, 2, 1.5, 1.2, 1, 0.8],
    maxbombs: [1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
    bombtime: [60, 30, 20, 15, 12, 10, 9, 8, 7, 6, 5],
    healtime: [20, 10, 7, 5, 4, 3, 2.5, 2, 1.5, 1.2, 1, 0.8],


    shockwavevs: [140, 140, 150, 150, 160, 170, 180, 200, 220, 250, 300, 350, 400, 400, 400],
    shockwavesizes: [50, 54, 60, 67, 77, 87, 97, 107, 117, 130, 130, 130, 130],
    shocktimes: [10, 8, 6.5, 5, 4, 3, 2.5, 2, 1.5, 1, 0.05, 0.05, 0.05],  // shock recharge times
    shocktime: 0.5,  // Time spent kicking
    shockspeed: 80,  // speed while kicking

    upgradekickcosts: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    upgradejumpcosts: [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000],

    clonkvy: 200, // how fast you bounce off of monsters
    
    gravity: 400,  // non-resisted gravity
    rgravity: 400,  // resisted gravity
    
    lookahead: 100,

    buildcost: {
        tower: 50,
        hospital: 120,
        bubbler: 120,
        spring: 200,
        silo: 200,
    },

    upgradecost: {   // cost to upgrade buildings
        tower: [100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 1000],
        hospital: [100, 110, 120, 140, 160, 180, 200, 240, 300, 400, 500],
        bubbler: [100, 110, 120, 140, 160, 180, 200, 240, 300, 400, 500],
        spring: [200, 250, 300, 350, 400, 500, 600, 700, 800, 1000, 1500, 2000],
        silo: [100, 110, 120, 140, 160, 180, 200, 240, 300, 400, 500],
    },
    
    worldsizes: [100, 250, 450, 600, 800, 1000, 1200, 1400, 1800],
    growcosts: [100, 200, 300, 400, 600, 1000, 1500, 2200, 3000],

}

