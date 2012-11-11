var settings = {
	sx: 800,
	sy: 400,
	
	nlevels: 6,
	levelnames: [
		"Stage 1: Mortimer's backyard",
		"Stage 2: Dojo of the Royal Lepidopteral Society",
		"Stage 3: Bucolic Meadow of Doom",
		"Stage 4: Some field you have to cross",
		"Stage 5: Imperial palace of|the Royal Society of Lepidopterists",
		"Final stage:|The Lost Buttefly Garden of Verdania"
    ],
	
	
	fonts: {
		loading: "80px sans-serif",
	},
	
	savegamename: "mortimersave",
	
	
	hidefeatnames: false, 
	alwaysshow: true, // show cutscenes you've already seen
	
	// Cheat modes
	easy: false,
	unlockall: false,
}

var mechanics = {
	feat: {
		nab:   { keys: "act",         vx: 400 , vy:   0, time: 1, },
		leap:  { keys: "up",          vx: 200 , vy: 200, time: 1, },
		turn:  { keys: "back",        vx: 200 , vy: 200, time: 1, },
		twirl: { keys: "act up",      vx:   0 , vy: 200, time: 1, },
		bound: { keys: "back up",     vx:-100 , vy: 250, time: 1, },
		dart:  { keys: "forward up",  vx: 250 , vy: 300, time: 1, },
		roll:  { keys: "act forward", vx: 250 , vy: 250, time: 1, },
	},

	nabtime: 0.25,
	runvx: 300,
	g: 500,   // TODO: 250 in easy mode
	
	growtime: function (n, m) {  // how long to refill the nth bar if there are m total bars?
		return 2.0 + 0.5 * (m - n)
	},
}
mechanics.featlookup = {}
for (var fname in mechanics.feat) { mechanics.featlookup[mechanics.feat[fname].keys] = fname }



