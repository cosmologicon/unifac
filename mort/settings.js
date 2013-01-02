var settings = {
	gamename: "mortimer",
	version: "pyweek-0",
	savegamename: "mortimersave",
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
		nab:   { keys: "act",         learnat: 0, ucost: [  5, 10,  30,  80,  200], vx: 400 , vy:   0, time: 1, r: 50, dx: 40, dy: 80, },
		leap:  { keys: "up",          learnat: 0, ucost: [ 10, 20,  60, 140,  300], vx: 200 , vy: 200, time: 1, },
		turn:  { keys: "back",        learnat: 2, ucost: [ 20, 50, 120, 280,  400], vx: 200 , vy: 200, time: 1, },
		twirl: { keys: "act up",      learnat: 4, ucost: [ 80,200, 450, 800, 2000], vx:   0 , vy: 200, time: 1, r: 80, dx: 0, dy: 80 },
		bound: { keys: "back up",     learnat: 6, ucost: [ 80,200, 450, 800, 2000], vx:-100 , vy: 250, time: 1, },
		dart:  { keys: "forward up",  learnat: 8, ucost: [ 80,200, 450, 800, 2000], vx: 250 , vy: 300, time: 1, },
		roll:  { keys: "act forward", learnat:10, ucost: [200,500,2000,5000,20000], vx: 250 , vy: 250, time: 1, r: 80, dx: 0, dy: 50 },
	},

	nabtime: 0.25,
	runvx: 300,
	g: 500,
	easyg: 250,
	
	growtime: function (n, m) {  // how long to refill the nth bar if there are m total bars?
		return 2.0 + 0.5 * (m - n)
	},
	
	// blue yellow red white gray purple green | blue red green

	levelinfo: [ {},
		{ w: 1000, h:  600, goal:  12, t:  60, btime: [8, 8, 8, 0, 0, 0, 0, 0, 0, 0] },
		{ w:  800, h: 1000, goal:  40, t:  60, btime: [0, 8, 0, 8, 0, 8, 0, 0, 0, 0] },
		{ w: 1400, h: 1200, goal: 100, t:  90, btime: [6, 0, 6, 6, 0, 0, 8, 6, 0, 0] },
		{ w: 1400, h: 1200, goal: 250, t: 120, btime: [0, 6, 0, 6, 6, 0, 0, 6, 6, 0] },
		{ w:  800, h: 1600, goal: 300, t:  60, btime: [0, 0, 4, 0, 6,10, 0, 0, 0,12] },
		{ w: 1000, h: 2000, goal: 600, t:  90, btime: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8] },
	],
	
	butterfly: [
		{ name: "blue",   fname: "Bourgeois Blue",       value: 1, ymin:  40, ymax: 260, vx0: 100, vy0:  20, ftime: 0.5 },
		{ name: "yellow", fname: "Homely Swallowtail",   value: 2, ymin: 200, ymax: 320, vx0: 200, vy0:  40, ftime: 0.5 },
		{ name: "red",    fname: "Deposed Monarch",      value: 4, ymin: 260, ymax: 500, vx0: 300, vy0:  60, ftime: 0.5 },
		{ name: "white",  fname: "Salty Peppered Moth",  value: 4, ymin: 260, ymax: 500, vx0: 300, vy0:  60, ftime: 0.5 },
		{ name: "grey",   fname: "Two Ply Moth",         value: 6, ymin: 220, ymax: 600, vx0:  40, vy0: 400, ftime: 0.5 },
		{ name: "purple", fname: "Splotched Fritillary", value: 4, ymin: 260, ymax: 500, vx0: 300, vy0:  60, ftime: 0.5 },
		{ name: "green",  fname: "Rib Tickling Skipper", value: 3, ymin:  60, ymax: 500, vx0: 400, vy0: 200, ftime: 0.5 },

		{ name: "bfairy", fname: "Strident Kokiri Fairy", value:  8, ymin: 300, ymax: 500, vx0: 600, vy0: 200, ftime: 2 },
		{ name: "rfairy", fname: "Manic Dreamgirl Pixie", value: 12, ymin: 400, ymax: 600, vx0: 600, vy0: 200, ftime: 2 },
		{ name: "gfairy", fname: "Laminated Yosei",       value: 15, ymin: 500, ymax: 900, vx0: 600, vy0: 600, ftime: 2 },
	],

}
mechanics.featlookup = {}
for (var fname in mechanics.feat) { mechanics.featlookup[mechanics.feat[fname].keys] = fname }



