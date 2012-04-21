

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

    clonkvy: 200,
    
    gravity: 800,  // non-resisted gravity
    rgravity: 400,  // resisted gravity
    
    lookahead: 100,

}


