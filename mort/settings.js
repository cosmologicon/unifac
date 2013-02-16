var settings = {
	gamename: "mortimer",
	version: "pyweek-2",
	savegamename: "mortimerpw2save",
	sessionname: UFX.random.word(),
	
	review: window.location.href.indexOf("review") > -1,

	sx: 800,
	sy: 400,

	nlevels: 6,
	levelnames: [
		["Stage 1", "Mortimer's backyard"],
		["Stage 2", "Dojo of the Royal Lepidopteral Society"],
		["Stage 3", "Bucolic Meadow of Doom"],
		["Stage 4", "Some field you have to cross"],
		["Stage 5", "Imperial palace of the Royal Society of Lepidopterists"],
		["Final stage", "The Lost Butterfly Garden of Verdania"]
	],

	levelmusic: "gnos one xylo gnos one xylo".split(" "),

	musicvolume: 0.4,
	
	dialoguetime: function (line) {
		return 1.0 + 0.06 * line.length
	},

	hidefeatnames: false, 
	alwaysshow: false, // show cutscenes you've already seen
	showfps: false,
	showkeys: false,
	tracecaches: false,

	// Cheat modes
	easy: false,
	unlockall: false,
}

var mechanics = {
    featnames: "nab leap turn twirl bound dart roll".split(" "),

	feat: {
		nab:   { keys: "act",         learnat: 0, ucost: [  5, 10,  20,  40,   80], vx: 400 , vy:   0, time: 1, r: 50, dx: 40, dy: 80, },
		leap:  { keys: "up",          learnat: 0, ucost: [ 10, 20,  40,  80,  160], vx: 200 , vy: 200, time: 1, },
		turn:  { keys: "back",        learnat: 2, ucost: [ 15, 30,  60, 120,  240], vx: 200 , vy: 200, time: 1, },
		twirl: { keys: "act up",      learnat: 4, ucost: [ 30, 60, 120, 240,  480], vx:   0 , vy: 200, time: 1, r: 80, dx: 0, dy: 80 },
		bound: { keys: "back up",     learnat: 6, ucost: [ 50,100, 200, 400,  800], vx:-100 , vy: 250, time: 1, },
		dart:  { keys: "forward up",  learnat: 8, ucost: [ 50,100, 200, 400,  800], vx: 250 , vy: 300, time: 1, },
		roll:  { keys: "act forward", learnat:10, ucost: [100,200, 400, 800, 1600], vx: 250 , vy: 250, time: 1, r: 80, dx: 0, dy: 50 },
	},

	nabtime: 0.25,
	runvx: 300,
	g: 500,
	easyg: 250,
	
	growtime: function (n, m) {  // how long to refill the nth bar if there are m total bars?
		return 2.0 + 0.5 * (m - n)
	},
	
	// blue yellow red white gray purple green | blue red green

	// brate is approximate number of butterflies per minute
	levelinfo: [ {},
		{ w: 1000, h:  600, goal:  12, t:  60, brate: [ 8, 8, 8, 0, 0, 0, 0, 0, 0, 0] },
		{ w:  800, h: 1000, goal:  30, t:  60, brate: [ 4, 8, 0,10, 0,12, 0, 0, 0, 0] },
		{ w: 1400, h: 1200, goal:  60, t:  90, brate: [ 5, 0, 8, 8, 0, 0, 6, 8, 0, 0] },
		{ w: 1400, h: 1200, goal: 100, t: 120, brate: [ 0, 4, 0, 5, 6, 0, 0, 8,12, 0] },
		{ w:  800, h: 1600, goal: 140, t:  60, brate: [ 0, 0,10, 0,15,10, 0, 4, 4,15] },
		{ w: 1000, h: 2000, goal: 300, t:  90, brate: [12,12,12,12,12,12,12,12,12,12] },
	],
	
	butterfly: [
		{ name: "blue",   fname: "Bourgeois Blue",       value: 1, ymin:  40, ymax: 260, vx0:  60, vy0:  60, ftime: 0.5 },
		{ name: "yellow", fname: "Homely Swallowtail",   value: 1, ymin: 160, ymax: 320, vx0: 120, vy0: 120, ftime: 0.5 },
		{ name: "red",    fname: "Deposed Monarch",      value: 1, ymin: 260, ymax: 500, vx0: 180, vy0: 180, ftime: 0.5 },
		{ name: "white",  fname: "Salty Peppered Moth",  value: 2, ymin: 180, ymax: 500, vx0: 240, vy0: 240, ftime: 0.5 },
		{ name: "grey",   fname: "Two Ply Moth",         value: 2, ymin: 220, ymax: 600, vx0: 120, vy0: 250, ftime: 0.5 },
		{ name: "purple", fname: "Splotched Fritillary", value: 2, ymin: 220, ymax: 500, vx0: 360, vy0:  60, ftime: 0.5 },
		{ name: "green",  fname: "Rib Tickling Skipper", value: 2, ymin:  60, ymax: 500, vx0: 250, vy0: 250, ftime: 0.5 },

		{ name: "bfairy", fname: "Strident Kokiri Fairy", value: 3, ymin: 300, ymax: 500, vx0: 250, vy0: 250, ftime: 2 },
		{ name: "rfairy", fname: "Manic Dreamgirl Pixie", value: 3, ymin: 400, ymax: 600, vx0: 300, vy0: 300, ftime: 2 },
		{ name: "gfairy", fname: "Laminated Yosei",       value: 3, ymin: 500, ymax: 900, vx0: 400, vy0: 400, ftime: 2 },
	],

}
mechanics.featlookup = {}
for (var fname in mechanics.feat) { mechanics.featlookup[mechanics.feat[fname].keys] = fname }



