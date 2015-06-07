// settings for the js version

var qopts = {}
window.location.search.slice(1).split("&").forEach(function (qstr) {
    var a = qstr.split("=")
    qopts[a[0]] = a.length == 1 ? true : decodeURIComponent(a[1])
})

var settings = {
	scr_w: 800,
	scr_h: 600,
	gamename: "Robot Underground",
	version: "0",
	music: true,
	sfx: true,
	cursor: true,
	antialias: true,
	linewidth: 1,
	nolog: false,
}
settings.savename = settings.gamename + "|" + settings.version + "|save"
settings.savesettingsname = settings.gamename + "|" + settings.version + "|settings"
settings.save = function () {
	localStorage[this.savesettingsname] = JSON.stringify([
		this.music,
		this.sfx,
		this.cursor,
		this.antialias,
		this.linewidth,
	])
}
settings.load = function () {
	if (!localStorage[this.savesettingsname]) return
	var obj = JSON.parse(localStorage[this.savesettingsname])
	this.music = obj[0]
	this.sfx = obj[1]
	this.cursor = obj[2]
	this.antialias = obj[3]
	this.linewidth = obj[4]
}
settings.load()


if (qopts.h) {
	settings.scr_h = +qopts.h
	settings.scr_w = Math.round(+qopts.h * 4 / 3)
}

var DEBUG = {}
if (qopts.DEBUG) {
	DEBUG.expose = true // expose convenience methods, eg zoomout and zoomin
	DEBUG.testdialogue = qopts.testdialogue  // put Putney by the starting position
	DEBUG.testinventory = qopts.testinventory  // put Hammersmith by the starting position
	DEBUG.levelskip = qopts.levelskip // skip to the named level, eg levelskip=act1.town
	DEBUG.minidungeons = qopts.minidungeons // dungeons are much smaller for easier completion
	DEBUG.failhard = true  // shut down with error mesasge on throw
	DEBUG.showfps = true
	DEBUG.showscene = true
	DEBUG.fixcanvas = true
	if (qopts.softcursoroff) settings.cursor = false
	if (qopts.nomusic) settings.music = false
	settings.nolog = true
	var DEBUGform = document.getElementById("DEBUG")
	DEBUGform.style.display = "block"
}

// I guess pyglet's font sizes are not in pixels, but for whatever reason I need to scale the
//   font sizes. This looks about right.
var FONT_FACTOR = 1.35


/// TEXTMENU DEFAULTS ///
var TEXTMENU_FONTNAME = "Hockey is Lif"
var TEXTMENU_COLORS = {
    "selected" : [255, 255, 0, 255],
    "normal" : [127, 127, 0, 255],
    "greyed" : [127, 127, 127, 255],
    "text" : [255, 255, 255, 255],
}


/// INVENTORY MENU ///
INVMENU_BORDER = [1.0, 1.0, 1.0, 1.0]
INVMENU_BACKGROUND = [0.0, 0.0, 0.0, 0.8]
INVMENU_MARGIN = 0.06
INVMENU_PADDING = 0.03
INVMENU_SIZE = [0.50, 0.32]
INVMENU_SCROLLSENSITIVITY = 0.7

INVMENU_BUTTON_SIZE = 0.03
INVMENU_BUTTON_COLORS = {
    "normal" : [1.0, 1.0, 1.0],
    "selected" : [0.2, 1.0, 0.2],
    "greyed" : [0.5, 0.5, 0.5],
}

INVMENU_TEXT_FONTNAME = "Hockey is Lif"
INVMENU_TEXT_FONTSIZE = 0.02 * FONT_FACTOR
INVMENU_TEXT_PADDING = 0.02
INVMENU_TEXT_MARGIN = 0.02
INVMENU_TEXT_SPACING = 0.01

INVMENU_ICON_FONTNAME = "Hockey is Lif"
INVMENU_ICON_FONTSIZE = 0.15 * FONT_FACTOR
INVMENU_ICON_TEXTCOLOR = [255, 255, 255, 255]
INVMENU_ICON_PADDINGRATIO = 0.2
INVMENU_ICON_BACKGROUND = [0.0, 0.0, 0.0, 1.0]
INVMENU_ICON_COLORS = {
    "normal" : [0.5, 0.5, 0.5],
    "selected" : [1.0, 1.0, 1.0],
}

INVMENU_ICON_MODE = "pixicon"
if (INVMENU_ICON_MODE == "pixicon") {
	INVMENU_ICON_PERROW = 6
	INVMENU_ICON_PERCOL = null
} else if (INVMENU_ICON_MODE == "texticon") {
	INVMENU_ICON_PERROW = 2
	INVMENU_ICON_PERCOL = 4
}


/// NOT IN USE YET ///
GAMEMENU_BACKGROUND = [0.0, 0.0, 0.0, 0.0]
GAMEMENU_CREDITS_BACKGROUND = [0.0, 0.0, 0.2, 0.9]

GAMEMENU_TEXT_FONTNAME = "Hockey is Lif"
GAMEMENU_TEXT_FONTSIZE_SMALL = 0.025 * FONT_FACTOR
GAMEMENU_TEXT_FONTSIZE_LARGE = 0.05 * FONT_FACTOR
GAMEMENU_TEXT_PADDING = 0.02
GAMEMENU_TEXT_MARGIN = 0.02
GAMEMENU_TEXT_SPACING = 0.02

// Display parameters
MAX_FRAME_RATE = 60

BEZIER_POINTS = 4

MENU_FONT = "Hockey is Lif"
MENU_FONT_SMALL = 0.025 * FONT_FACTOR
MENU_FONT_LARGE = 0.05 * FONT_FACTOR
MENU_TEXT_SPACING = 0.03 * FONT_FACTOR
MENU_COLOR_NORMAL = [127, 127, 0, 255]
MENU_COLOR_SELECTED = [255, 255, 0, 255]
MENU_COLOR_GREYED = [127, 127, 127, 255]
MENU_COLOR_TEXT = [255, 255, 255, 255]
MENU_OPTION_PAD = 0.01

WORLD_SCREEN_HEIGHT = 800

MOUSEOVER_PAD = 0.01

FLOATY_FONT = "Hockey is Lif"
FLOATY_FONT_SIZE = 0.02 * FONT_FACTOR
FLOAT_DIST = 30
FLOAT_SPEED = 1
FLOAT_SCATTER = 5
FLOAT_LEVEL_DELAY = 16
FLOAT_HEAL_DELAY = 8
FLOAT_COMBO_DELAY = 5

// Changed from the original 4-tuples because these are drawn to a 2d canvas
FLOATY_XP_COLOUR = "#FFFFFF"
FLOATY_PICKUP_COLOUR = "#FFFF00"
FLOATY_LEVEL_UP_COLOUR = "#FFFF00"
FLOATY_DAMAGE_COLOUR = "#FF0000"
FLOATY_HEALING_COLOUR = "#00FF00"
FLOATY_COMBO_COLOUR = "#00FFFF"

EXPLOSION_TIME = 30
EXPLOSION_BRANCH_P = .2
EXPLOSION_MINIMUM = 5

SHOTGUN_PELLETS = 12

WEAPON_ICON_COLOURS = {Active: [1,1,1], Inactive: [.3,.3,.3], Autofire: [0,1,0]}
WEAPON_ICON_BORDER_NORMAL = [1,1,1]
WEAPON_ICON_BORDER_FIRING = [.8,0,0]
WEAPON_ICON_BORDER_FLASH_FRAMES = 2

DAMAGE_AGGREGATE_TIME = 10
XP_AGGREGATE_TIME = 10
PICKUP_AGGREGATE_TIME = 5

NAME_BOX_PAD = 0.12
NAME_BOX_BOTTOM = 0.4

DIALOGUE_FONT = "Hockey is Lif"
DIALOGUE_FONT_SIZE = 0.03 * FONT_FACTOR
DIALOGUE_BOX_PAD = 0.1
DIALOGUE_BOX_WIDTH = 0.35
DIALOGUE_BOX_TOP = 0.35
DIALOGUE_BOX_SPACING = 0.02
DIALOGUE_CLICK_PROTECTION_FRAMES = 8

PORTRAIT_TOP = 0.9
PORTRAIT_BOTTOM = 0.4
PORTRAIT_PAD = 0.1
PORTRAIT_ASPECT = 0.7 // 1/sqrt(2)

HUD_FONT_NAME = "Hockey is Lif"
HUD_FONT_SMALL = 0.02 * FONT_FACTOR
HUD_FONT_LARGE = 0.04 * FONT_FACTOR
HUD_MARGIN = 0.02
HUD_SPACING = 0.01
HUD_PORTRAIT_BOTTOM = 0.76
HUD_PORTRAIT_ASPECT = 0.7
HUD_ICON_SIZE = 0.08
HUD_MOUSEOVER_WIDTH = 0.50
HUD_TARGETINFO_TOP = 0.5
HUD_TARGETINFO_LEFT = 0.02
HUD_TARGETINFO_PAD = 0.01
HUD_TARGETINFO_WIDTH = 0.2

INVENTORY_FONT = "Hockey is Lif"
INVENTORY_FONT_SIZE = 0.02 * FONT_FACTOR
INVENTORY_SPACING = 0.006
INVENTORY_MARGIN = 0.06
INVENTORY_PAD = 0.02
INVENTORY_WIDTH = 0.5
INVENTORY_LENGTH = 8
INVENTORY_ARROW = 0.03
INVENTORY_DIALOG_WIDTH = 0.50
INVENTORY_BUTTON_COLOR = [1.0, 1.0, 1.0]
INVENTORY_BUTTON_HIGHLIGHT = [0.0, 1.0, 0.0]

FPS_FONT_NAME = "Hockey is Lif"
FPS_FONT_SIZE = 0.08 * FONT_FACTOR

BOX_GUTTER = 0.03


// Gameplay parameters
CURSOR_RADIUS = 10

MOVEMENT_STEP = 10 // entities moving with speed greater than this will have
                   // their movement broken up into steps for proper collisions

ENTITY_TICK_DISTANCE = 1.5 * WORLD_SCREEN_HEIGHT
PACK_SPAWN_DISTANCE = 1.4 * WORLD_SCREEN_HEIGHT

LEVEL_0_EXPONENT = 7  // 7 = 128

ROBOT_INITIAL_ATTACK = 3
ROBOT_INITIAL_DEFENCE = 3
ROBOT_INITIAL_HP = 100
ROBOT_BASE_SPEED = 10

ROBOT_ATTACK_INCREASE = 1
ROBOT_DEFENCE_INCREASE = 1
ROBOT_HP_INCREASE = 25
ROBOT_INITIAL_MAX_ENERGY = 20 * MAX_FRAME_RATE

ROBOT_DUNGEON_TIME_LIMIT = 5 * 60 * MAX_FRAME_RATE

PROTAGONIST_LOGGING_INTERVAL = 10 * MAX_FRAME_RATE

PROTAGONIST_TALKRANGE = 85
PROTAGONIST_RADIUS = 15

WEAPON_RANGE_MULTIPLIER = 100

MAX_NUM_WEAPONS = 6

SUMMON_TRIES = 10
NINJA_TRIES = 10

METALS = ["Cobalt", "Zinc", "Molybdenum", "Bismuth", "Technetium"]
METAL_SYMS = ["Co", "Zn", "Mo", "Bi", "Tc"]

WEAPON_ADJECTIVES = ["Super-", "Super-Duper-", "Hyper-", "Ultra-", "Mega-", "Giga-", "Tera-", "Omega-"]
ARMOUR_ADJECTIVES = ["Extra-", "Double-", "Triple-", "Tetra-", "Penta-", "Hexa-", "Multi-", "Poly-"]

var Damage = {
	physical: "physical",
	fire: "fire",
	laser: "laser",
	explosion: "explosion",
	electric: "lightning",
	shotgun: "shotgun",
	claw: "claw",
}

// Musics
MENU_MUSIC = "HowItBegins"
TOWN_MUSIC = "RadioMartini"
OZ_MUSIC = "LongTimeComing"
MISSION_MUSIC = "ElectroSketch"
CAMP_MUSIC = "Klockworx"
LO_BOSS_MUSIC ="LongTimeComing"
HI_BOSS_MUSIC = "Chase"





function initPlotState(ps) {
	for (var s in ps) delete ps[s]
	ps.act = 1
	ps.sweetheart = "Victoria"
	ps["angel.rescued"] = true
	ps.nextScene = "act1.firstmission"
}

function setupMission(ps, m) {
	if (ps.nextScene in setups) {
		setups[ps.nextScene](ps, m)
	} else {
		throw "Unknown scene: " + ps.nextScene
	}
}

var setups = {}

setups.gameover = function (ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])
	m.setStartScript([
		["blank"],
		["say_l", "Camden was never seen again."],
		["say_l", "The world was destroyed in flames."],
		["say_l", "Your game is over."],
		["end_game"],
	])
}

setups["act1.town"] = function (ps, m) {
	makeTown(m)
	var camden = m.addProtag([41, 640])
	
	m.setStartScript([
		["change_music", TOWN_MUSIC],
		["if_first", "act1.goldhawk.intro", [
			["speaker_l", "Camden"],
			["speaker_r", "Goldhawk"],
			["say_l", "I'm alive! By Pancras, it's a miracle!"],
			["say_r", "Congratulations, Camden."],
			["say_r", "You got yourself into trouble back there, but you got yourself out again. That's the mark of a true soldier."],
			["say_r", "In any case, welcome to the town of Dollis Hill."],
			["say_l", "Dollis Hill? That's where I was supposed to be heading all along!"],
			["say_r", "Well, yes."],
			["say_r", "I was aware that you had been posted here, so when you didn't arrive, I set out to look for you in the Outer Zones."],
			["say_r", "I am Commander Goldhawk of the Order of Knightsbridge."],
			["say_l", "Sir!"],
			["say_r", "Oh, there's no need to be so formal."],
			["say_r", "Right now, you and I are the only soliders stationed here."],
			["say_r", "Most of the others are archaeologists here on the dig."],
			["say_r", "Why don't you go take a look around and introduce yourself?"],
			["say_r", "If you want to save, there's a duck by the fountain."],
		], [
			["speaker_r", "Goldhawk"],
			["say_r", "Welcome back, Camden."],
		]],
	])

	m.actorTalkScript([
		["speaker_r", "Goldhawk"],
		["say_r", "Camden, as soldiers of Knightsbridge, it's our duty to regularly patrol the Outer Zones."],
		["say_r", "As well as keeping the enemies there in check, you can bring back precious metals, and sometimes even salvaged arms and armour."],
		["ask_r", "Would you like to go there now?", [
			["Yes",
				["say_r", "Remember, you can eject from the Outer Zones at any time."],
				["say_r", "If things turn nasty, there's no shame in retreating."],
				["change_scene", 'act1.ozmission'],
			],
			["No",
				["say_r", "Talk to me again if you'd like to go adventuring later."],
			],
		]],
	], [35, 535], 'Goldhawk', null, 0xbad)

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["speaker_l", "Camden"],
		["if_first", "act1.putney.intro", [
			["say_r", "Everyone else seems to be doing such important things."],
			["say_r", "Do you think there's room in life for everyone to make an important contribution in their own way?"],
			["ask_l", "What should I say?", [
				["Absolutely.",
					["say_r", "Sometimes I wonder."],
				],
				["Life is what you make of it.", 
					["say_r", "I don't know whether I should be pleased to hear that, or terrified."],
				],
				["What a philosophical question.",
					["say_r", "Sorry."],
					["say_r", "You probably aren't interested at all."],
				],
			]],
		], [
			["say_r","What a funny old world it is."],
		]],
	], [1650, 1730], "Putney", null, 240)
	
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Angel"],
		["if_first", 'act1.angel.intro', [
			["say_l", "Hello!"],
			["say_r", "You must be Camden, right?"],
			["say_r", "I'm Angel, the expedition leader."],
			["say_l", "Expedition leader? Oh, there's some sort of archaeological thing going on here, isn't there?"],
			["say_r", "Yes, we're out here on the very edge of Zone 6 looking for an ancient relic called the Charing Cross."],
			["say_r", "I imagine someone probably explained this to you already, but you never know."],
			["say_r", "Anyway, you should go and talk to Hammersmith about getting the scanner array set up."],
			["say_r", "If you want to make yourself useful here, that is."],
			["say_l", "I should? Um, alright then."],
			["say_r", "See you later!"],
			"terminated",
		]],
		["say_r", "Hi, Camden."],
		["if_not_plotstate", 'act1.hammersmith.scanner', [
			["say_r", "I'm still waiting for that scanner array."],
			["if_not_plotstate", 'act1.hammersmith.quest', [
				["say_r", "You should go and talk to Hammersmith."],
		   	], [
				["if_first", 'act1.angel.cobalt', [
					["say_r", "You should go and talk to Hammersmith."],
					["say_l", "Um, I did."],
					["say_l", "He wants me to give him a load of cobalt."],
					["say_r", "Well, do that, then. You must have loads, right?"],
					["say_r", "If you don't, you can totally find some in the Outer Zones."],
				], [
					["say_r", "You should fetch Hammersmith that cobalt he wanted."],
				]],
			]],
			["say_l", "Um, right."],
			"terminated",
		]],
		["if_not_plotstate", 'act1.cleartheway', [
			["if_first", 'act1.angel.foundtemple', [
				["say_l", "Um, I brought the spanner array."],
				["say_r", "Oh, you have it? Give it here."],
				["say_r", "With this, I should totally be able to get a fix on the location of the ancient temple we were looking for."],
				["say_r", "Just a moment ..."],
				["say_r", "Right, there we go. Oh look, it was just over there all along."],
			]],
			["say_r", "Well, now we have the location of the temple, which is awesome, but you just know the route there is going to be crawling with monsters."],
			["say_r", "You're a soldier, so it's your responsibility to clear them out of the way, right?"],
			["ask_r", "Want to go and do it now?", [
				["Sure.",
					["say_r", "Then let's go!"],
					["change_scene", 'act1.cleartheway'],
				],
				["No way!",
					["say_r", "Later, then."],
				],
			]],
		], [
			["say_r", "Since you've cleared the way to the ancient temple, we can go there now if you like."],
			["ask_r", "Shall we?", [
				["Let's do it.",
					["say_r", "Ok!"],
					["change_scene", 'act1.bossfight'],
				],
				["No way!",
					["say_r", "Later, then."],
				],
			]],
		]],
	], [43, 725], "Angel", null, 325)
	
	var chalatscript = [
		["speaker_l", "Camden"],
		["speaker_r", "Chalfont & Latimer"],
		["if_first", 'act1.cnl.intro', [
			["say_l", "Hello!"],
			["speaker_r", "Latimer &"],
			["say_r", "Good day."],
			["say_r", "Corporal Camden, of the Order of Knightsbridge, presumably."],
			["say_l", "Um, yes, that's correct."],
			["say_r", "I am Sub-Inquisitor Latimer of the Holy Robot Empire, and this is my associate, Cardinal Chalfont."],
			["speaker_r", "Chalfont"],
			["say_r", "Bzzt! Bdrrrr zeep zeep kkzt scrweeeeeeeeee!"],
			["speaker_r", "Latimer &"],
			["say_r", "Quite so, my lord."],
			["say_r", "In any case, his Holiness the Robo-Pope is taking a very keen interest in this expedition, so we are here to keep an eye on our flock."],
			["say_r", "Please don't hesitate to consult us about your spiritual wellbeing at any time."],
			["say_l", "Um, right."],
		], [
			["speaker_r", "Chalfont"],
			["say_r", "Breeeeeep! Pip pip pip zreeeee!"],
			["speaker_r", "Latimer &"],
			["say_r", "Absolutely, my lord, at the first sign that they might have found it."],
			["say_r", "If we can pull this off, his Excellency will be most pleased with us."],
			["say_l", "I hope this isn't too overly cynical of me, but I'm somehow compelled to think that those two are suspicious."],
		]],
	]
	m.actorTalkScript(chalatscript, [755, 1001], "Chalfont", null, 90)
	m.actorTalkScript(chalatscript, [743, 964], "Latimer", null, 90)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Great Portland"],
		["if_first", 'act1.portland.intro', [
			["say_l", "Hello!"],
			["say_r", "Greetings, young one."],
			["say_r", "I am Great Portland, elder of Dollis Hill."],
			["say_r", "I sense that your arrival is a portentous one."],
			["say_l", "Um, okay."],
		], [
			["say_l", "I'm not sure I want to talk to him again. He scares me."],
		]],
	], [1088, 280], "Great Portland", null, 90, 45)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Hammersmith"],
		["say_l", "Hello!"],
		["say_r", "Hello there, son."],
		["if_first", 'act1.hammersmith.intro', [
			["say_r", "I'm Colonel Hammersmith of the Order of Knightsbridge."],
			["say_l", "Sir!"],
			["say_r", "Oh, there's no need to be so formal."],
			["say_r", "Besides, I'm retired now. You and Commander Goldhawk are the only active soldiers in the village."],
			["say_l", "Oh, I see. Sorry."],
			["say_r", "It's a while since I've seen combat, but I'm still your man if you need any new parts attaching."],
		]],
		
		["if_plotstate", 'act1.angel.intro', [
			["if_first", 'act1.hammersmith.quest', [
				["say_l", "Um, Angel said I had to come to you and get something called a spanner array ..."],
				["say_r", "Oh, the scanner array? Yes, I remember. That Angel does like to make these strange requests."],
				["say_r", "I can put it together, but it'll take a fair amount of cobalt. About sixty-four units should do the trick."],
				["say_l", "Um, right."],
			]],
		]],
		
		["if_plotstate", 'act1.hammersmith.quest', [
			["if_not_plotstate", 'act1.hammersmith.scanner', [
				["if_has_metal", "Cobalt", 64, [
					["ask_l", "Shall I give Hammersmith 64 cobalt?", [
						["Yes",
							["set_plotstate", 'act1.hammersmith.scanner'],
							["change_metal", -64, "Cobalt"],
							["say_r", "There you go, son."],
							["say_r", "I'm sure Angel will be pleased to have that."],
							["say_l", "Um, thank you."],
							["say_l_unlabelled", "Received the SCANNER ARRAY."],
							["speaker_l", "Camden"],
						],
						["No",
							["say_r", "If you bring me 64 units of cobalt, I can put the scanner array together for you."],
						],
					]],
				], [
					["say_r", "If you bring me 64 units of cobalt, I can put the scanner array together for you."],
				]],
			]],
		]],
		
		["if_first", 'act1.hammersmith.inventory.intro', [
			["say_r", "I can help you out by explaning the properties of any items you've found."],
			["say_r", "I'll open your inventory for you, and if you look at a particular item, you can see the options for it."],
			["say_r", "If you don't know what it is yet, I'll appraise it for a small fee. If you do, I can attach it for you. In either case, I'll take it off your hands if you like."],
		]],

		["ask_r", "Need anything?", [
			["Inventory",
				["inventory"],
				// I'm adding this because clicks immediately after the inventory menu skip the first line
				// TODO: is there a better way?
				["say_r", ""],
				["if_first", 'act1.hammersmith.inventory.autofire', [
					["say_r", "I see you've found a weapon with the Autofire option available there."],
					["say_r", "Weapons with that mod can be either on, off, or autofiring, which will highlight them in green."],
					["say_r", "When autofiring, they will choose their own target, rather than taking your direction."],
					["say_r", "This can be either a blessing or a curse. Choose wisely."],
				]],
				["say_r", "Come back any time."],
			],
			["Leave",
			],
		]],
	], [1453, 2057], "Hammersmith", null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden"],
		["if_first", 'act1.harlesden.intro', [
			["say_l", "Hello!"],
			["say_l", "Um, I'm Camden. Who are you?"],
			["say_r", "I'm Professor Harlesden."],
			["say_r", "I came to join the dig because I'm an expert on the anthropological significance of the relics of the era of St Pancras."],
			["say_r", "But no-one seems to care."],
			["ask_l", "What should I say to him?", [
				["That's terrible.",
					["say_r", "I know."],
				],
				["Maybe you should pay more attention to the modern world.",
					["say_r", "I don't think I could cope with that, at my age."],
				],
			]],
		]],
		["say_r", "Oh, woe is me."],
	], [970, 1800], 'Harlesden', null, 290)
	
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Pimlico"],
		["say_r", "I sometimes try and target enemies and miss and end up moving."],
		["say_r", "It totally throws my balance off, but if you right-click or hold the Ctrl key, that doesn't happen."],
	], [1533, 664], "Pimlico", null, 312)

	m.actorTalkScript([
		["speaker_r", "Cutty Sark"],
		["ask_r", "Quack quack quack quack, quack quack?", [
			["Save", 
				["save"],
				["say_r", "Saved."],
			],
			["Cancel",
			],
		]],
	], [940, 1090], "Cutty Sark", null, 289)

	if (!ps['act1.hammersmithgospel']) {
		gospel = m.addNPC([1437, 1944], 78, "Father Gospel")
		camden.addAreaScript([
			["set_plotstate", 'act1.hammersmithgospel'],
			["wait", 10],
			["deny"],
			["speaker_l", "Camden"],
			["say_l", "I hear raised voices ahead..."],
			["freeze", 20],
			["clear_l"],
			["speaker_r", "Hammersmith"],
			["say_r", "I don't care what you think! Putney and I are just fine!"],
			["speaker_l", "Gospel"],
			["say_l", "But the boy is growing up without the love of St Pancras!"],
			["say_l", "Do you wish to damn him as well?"],
			["say_r", "Oh, so I'm damned now, am I?"],
			["say_l", "Only the love of St Pancras can save you."],
			["say_r", "Well I guess I'm damned then!"],
			["say_l", "Do not say such things!"],
			["say_r", "I'll say what I want in my shop, and you say what you want in yours."],
			["say_l", "Hmph!"],
			["set_script_path", gospel, [[1385, 1847], [1608, 1592], [1584, 1211], [1607, 524], [633, 590], [619, 332], [743, 182]], 85],
			// There's some complicated business here with wait_until_moved but honestly I don't
			//   see the benefit.
			//["set_script_path", gospel, [[1385, 1847], [1608, 1592], [1584, 1211]], null],
			//["wait_until_moved", [gospel]],
			//["set_script_path", gospel, [[1607, 524], [633, 590], [619, 332], [743, 182]], 85],
		], [900, 1600], [800, 300])
		gospel.setTalkScript([
			["speaker_r", "Gospel"],
			["say_r", "That Hammersmith robot is insufferable!"],
			["say_r", "And poor Putney..."],
		])
	} else {
		m.actorTalkScript([
			["speaker_l", "Camden"],
			["say_l", "Hi, my name's Camden."],
			["speaker_r", "Gospel"],
			["say_r", "Good day to you, my son. I am Father Gospel, of the church of St Pancras."],
			["say_l", "May the light of St Pancras shine upon you."],
		], [743, 182], "Father Gospel", null, 85)
	}
}

setups["act1.firstmission"] = function (ps, m) {
	m.map = makeDungeon2({
		top: "controlroom",
		bottom: "3rooms",
		maxrooms: 6,
	})
	var camden = m.addProtag(m.map.bottomPos([150, 150]))
	m.placeEnemiesRandomlyAnywhere({ Spider: 12, Scorpion: 8 })
	m.setStartScript([
		["change_music", null],
		["speaker_l", "Camden"],
		["say_l", "This is it ... I've had it."],
		["say_l", "How did I get myself into this mess? My first proper mission, and I'm going to die alone in this wasteland."],
		["say_l", "Dammit!"],
		["sound", "radio"],
		["say_r", "... you hear me? Repeat, can you hear me?"],
		["say_l", "What? Who's that? Is salvation at hand?"],
		["say_l", "Who is that?"],
		["say_r", "This is Commander Goldhawk of the Order of Knightsbridge.", "Goldhawk"],
		["say_r", "I can get you out of there, but you're going to have to follow my instructions carefully."],
		["say_l", "I'll do my best!"],
		["say_r", "First, make sure you can move."],
		["say_r", "Clicking on a patch of ground will move you there, assuming there's nothing in the way."],
		["say_r", "You will keep moving towards the cursor until you let go of the button, and then keep going to the latest target."],
		["say_r", "Try this now by moving into the room to your right."],
	])

	if (DEBUG.testdialogue) {
		m.actorTalkScript([
			["speaker_r", "Putney"],
			["speaker_l", "Camden"],
			["if_first", "act1.putney.intro", [
				["say_r", "Everyone else seems to be doing such important things."],
				["say_r", "Do you think there's room in life for everyone to make an important contribution in their own way?"],
				["ask_l", "What should I say?", [
					["Absolutely.",
						["say_r", "Sometimes I wonder."],
					],
					["Life is what you make of it.", 
						["say_r", "I don't know whether I should be pleased to hear that, or terrified."],
					],
					["What a philosophical question.",
						["say_r", "Sorry."],
						["say_r", "You probably aren't interested at all."],
					],
				]],
			], [
				["say_r","What a funny old world it is."],
			]],
		], m.map.bottomPos([50, 250]), "Putney", null, 240)
	}

	if (DEBUG.testinventory) {
		m.actorTalkScript([
			["speaker_l", "Camden"],
			["speaker_r", "Hammersmith"],
			["say_l", "Hello!"],
			["say_r", "Hello there, son."],
			["ask_r", "Need anything?", [
				["Inventory",
					["inventory"],
				],
				["Leave",
				],
			]],
			["say_r", "Come back any time."],
		], m.map.bottomPos([50, 50]), "Hammersmith", null, 270)
	}

	
	camden.addAreaScript([
		["wait", 25],
		["sound", "radio"],
		["wait", 5],
		["say_r", "Good work.", "Goldhawk"],
		["say_r", "Now, in the next room there's an enemy."],
		["say_r", "If you click on an enemy, it becomes your current target, and you'll continue to attack it until you select a different target or it dies."],
		["say_r", "You can move around while attacking, as long as you keep the target in sight and within range of your weapons, and as long as you have at least one active weapon."],
		["say_r", "You have a longer range than this enemy, so keep your distance and he can't hit you."],
		["say_r", "You can activate and deactivate your weapons by clicking the weapon icons on the lower left, or pressing the number key corresponding to their position."],
		["say_r", "Right now you only have one weapon, though, so probably best to keep it on."],
		["say_r", "Good luck, soldier."],
	], [300 + m.map.bottom_offs[0], 0 + m.map.bottom_offs[1]], [300, 300])	

	m.enemyDeathScript([
		["drop_metal", METALS[0], 4],
		["die"],
		["wait", 15],
		["sound", "radio"],
		["wait", 5],
		["say_r", "Good work!", "Goldhawk"],
		["say_r", "You'll notice that the enemy dropped some precious " + METALS[0].toLowerCase() + ", which you can pick up by moving over it."],
		["say_r", "Now, I'm working on restoring the extraction mechanism so that you can get out of there, but you'll need to get a little closer."],
		["say_r", "Move to the top of this area. There are more enemies on the way, but I'm sure you can handle them."],
		["say_r", "One more thing: if you right-click or hold down Ctrl when you click, you'll target enemies but not move."],
		["speaker_l", "Camden"],
		["say_l", "Right, I'll do what I can."],
		["say_r", "Just keep your distance, and remember: if you're getting hurt, switch on your repair kit. Just like a weapon, click the icon."],
		["say_r", "Be careful, though. If you leave it switched on, it could drain energy from your weapons in a pinch."],
		["change_music", MISSION_MUSIC],
	], "Spider", [250 + m.map.bottom_offs[0], 650 + m.map.bottom_offs[1]])

	camden.addAreaScript([
		["sound", "radio"],
		["wait", 5],
		["say_r", "Nearly there, soldier.", "Goldhawk"],
		["say_r", "In the room up ahead are a powerful enemy and two minions."],
		["say_r", "Defeat those three and I should be able to get you out."],
	], [300 + m.map.top_offs[0], 0 + m.map.top_offs[1]], [2000, 300])

	var killScorpions = [
		["die_no_drop"],
		["increment", "killedScorpions"],
		["ifeq", "killedScorpions", 3, [
			["drop_weapon", ["MachineGun", null, ["Autofiring", 1]], [
				["wait", 25],
				["sound", "radio"],
				["wait", 5],
				["say_r", "Ah, a weapon. When you get back to town, Colonel Hammersmith should be able to help you out with that.", "Goldhawk"],
				["say_r", "Now, I've managed to restore the extraction mechanism."],
				["say_r", "There should be an eject button in the bottom right corner of your screen."],
				["say_r", "You'll need to click on it, and then click again to confirm."],
				["say_r", "You can do so as soon as you're ready."],
				["canEject", true],
			]],
			["wait", 25],
			["sound", "radio"],
			["wait", 5],
			["say_r", "Excellent work.", "Goldhawk"],
			["say_r", "I see the scorpions were hoarding something of worth. You should pick it up and bring it with you."],
		]],
	]
	m.enemyDeathScript(killScorpions, "IntimidatingScorpion", [550 + m.map.top_offs[0], 750 + m.map.top_offs[1]], 270)
	m.enemyDeathScript(killScorpions, "Scorpion", [350 + m.map.top_offs[0], 650 + m.map.top_offs[1]], 290)
	m.enemyDeathScript(killScorpions, "Scorpion", [750 + m.map.top_offs[0], 650 + m.map.top_offs[1]], 250)
	
	m.canEject = false

	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act1.town"],
	])

}

setups["act1.cleartheway"] = function (ps, m) {
	m.map = makeDungeon2({
		left: "entry_left",
		maxrooms: 12,
	})
	var camden = m.addProtag(m.map.leftPos([50, 150]))
	m.placeEnemiesRandomlyAnywhere({
		Spider: 8,
		Scorpion: 4,
		SpikeDrone: 8,
		StagBeetle: 12,
	})
	
	m.canEject = true
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", "act1.cleartheway.intro", [
			["speaker_l", "Camden"],
			["sound", "radio"],
			["say_r", "Okay, Camden, I'll be monitoring the scanners. Good luck.", "Goldhawk"],
			["clear_r"],
			["say_l", "Right. I can do this."],
		]],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act1.town"],
	])
		
	m.setClearScript([
		["set_plotstate", 'act1.cleartheway'],
		["speaker_l", "Camden"],
		["sound", "radio"],
		["say_r", "That was the last one. Eject whenever you're ready.", "Goldhawk"],
		["add_xp", 64],
	])
}

setups["act1.bossfight"] = function (ps, m) {
	m.map = makeDungeon2({
		top: "temple_end",
		bottom: "entry_bottom",
		maxrooms: 20,
		minroomsize: 2,
		maxroomsize: 3,
	})
	var camden = m.addProtag(m.map.bottomPos([250, 150]))
	m.placeEnemiesRandomlyAnywhere({
		Spider: 8,
		SpiderQueen: 2,
		SpikeDrone: 32,
		BladeDrone: 16,
		MiniTank: 16,
	})

	m.entities.add(makeEnemy("BladeDrone", m, m.map.topPos([150, 450]), 0))
	m.entities.add(makeEnemy("BladeDrone", m, m.map.topPos([150, 850]), 0))
	m.entities.add(makeEnemy("BladeDrone", m, m.map.topPos([750, 450]), 180))
	m.entities.add(makeEnemy("BladeDrone", m, m.map.topPos([750, 850]), 180))

	var door = m.entities.add(makeScenery("BlastDoor", m, m.map.topPos([450,650]), 90, true))
	
	m.setStartScript([
		["change_music", MISSION_MUSIC],
	])

	var boss = m.addBoss("Monument", m.map.topPos([450, 1750]), 270)
	boss.hostile = false
	boss.setTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Monument Asleep"],
		["say_l", "What's this?"],
		["say_l", "It looks really old ..."],
		["speaker_r", "Monument Awake"],
		["say_r", "INTRUSION DETECTED. ADOPTING COUNTERMEASURES."],
		["say_l", "Uh oh."],
		["change_music", LO_BOSS_MUSIC],
		["set_hostile", true],
		["do", door.close.bind(door)],
		["canEject", false],
	])

	boss.setDeathScript([
		["die"],
		["kill_type", "Minument"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "Look! It's the Charing Cross!"],
		["say_l", "I should eject and tell Angel at once!"],
		["canEject"],
	])

	m.canEject = true
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["if_boss_dead", [
			["change_scene", "act1.party"],
		], [
			["change_scene", "act1.town"],
		]],
	])

}

setups["act1.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		SpikeDrone: 16,
		BladeDrone: 16,
		Spider: 16,
		Scorpion:16,
		StagBeetle: 16,
		MiniTank: 16,
		SpiderQueen: 8,
		ScorpionPack: 8,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([
		["change_music", OZ_MUSIC],
		["if_first", 'ozmission', [
			["sound", "radio"],
			["say_r", "Listen up, Camden. In the Outer Zones we can't sustain your power supply indefinitely.", "Goldhawk"],
			["say_r", "After five standard minutes, you will no longer regain energy. Clear what you can, but don't be a hero."],
		]],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act1.town"],
	])
}

setups["act1.party"] = function (ps, m) {
	makeTown(m)
	camden = m.addProtag([1201, 1230])
	camden.bearing = 71
	
	m.setStartScript([
		["change_music", TOWN_MUSIC],
		["say_l", "Back at Dollis Hill, a spontaneous party has broken out to celebrate the recovery of the Charing Cross."],
		["speaker_l", "Camden"],
		["say_r", "Camden!"],
		["speaker_r", "Angel"],
		["say_r", "Camden! Over here."],
		["say_l", "Oh, hi, Angel. Everyone's having a good time."],
		["say_r", "So join us, join me, have a drink."],
		["say_l", "As soldier of Knightsbridge I have a duty..."],
		["say_r","You have a right to enjoy your victories. You should talk to everyone here, they all want to thank you."],
		["say_r", "Including me."],
		["set_plotstate", 'act1.party.counter', 0],
	])
	
	var theftScript = [
		["say_l", "Suddenly..."],
		["blank"],
		["speaker_l", "Camden"],
		["say_l", "What happened to the light?"],
		["speaker_r", "Goldhawk"],
		["say_r", "Easy, soldier. I'll sort it out."],
		["say_r", "..."],
		["freeze", 40],
		["say_r", "This should fix it."],
		["blank", false],
		["freeze", 10],
		["say_l", "Phew. What hap-"],
		["speaker_r", "Angel"],
		["say_r", "It's gone! The Cross has been stolen!"],
		["speaker_l", "Great Portland"],
		["say_l", "What's this?"],
		["speaker_r", "Harlesden cape"],
		["say_r", "That can't be true!"],
		["speaker_r", "Putney"],
		["say_r", "..."],
		["speaker_l", "Cutty Sark"],
		["say_l", "... Quack."],
		["clear_r"],
		["clear_l"],

		["blank"],
		["say_l", "A commotion arose amidst the party. Nobody knew who had taken the Charing Cross. Suspicion was rife."],
		["speaker_l", "Camden"],
		["speaker_r", "Angel"],
		["say_l", "What's going on, Angel? Who would steal it?"],
		["say_r", "I can't say. Sub-Inquisitor Latimer says he saw Putney leaving the party. So he's currently suspect."],
		["say_l", "Putney? No, I can't believe that. I mean, I don't really know him..."],
		["say_r", "Maybe none of us really did."],
		["say_l", "Well, I'm going to find out who did this. I'm responsible for losing it, after all."],
		["say_r", "It's not your fault. But thanks, I'll help you with your search. Together, we'll find out who did this!"],

		["set_plotstate", "act", 2],
		["addWeaponSlot"],
		["change_scene", "act2.town"],
	]

	m.actorTalkScript([
		["speaker_r", "Goldhawk"],
		["speaker_l", "Camden"],
		["if_first", 'act1.party.goldhawk', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Good work, soldier!"],
			["say_l", "Thank you, sir."],
			["say_r", "Cut it out with the 'sir', this is a party."],
			["say_l", "Sorry, but I feel that I should be on the look out for trouble."],
			["say_r", "That you should, but leave it today. You're no good to anyone if you're on edge the whole time."],
			["say_l", "Understood, sir. I mean... okay."],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "Keep up the good work."],
		]],
	], [812, 1105], 'Goldhawk', null, 76)


	m.actorTalkScript([
		["speaker_r", "Putney"],
		["speaker_l", "Camden"],
		["if_first", 'act1.party.putney', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "We found the cross, thanks to you and everyone else."],
			["ask_l", "(Should I..)", [
				["Agree",
					["say_l", "Yes, it's good to feel part of something like this."],
					["say_r", "(Sigh.)"],
				],
				["Disagree",
					["say_l", "Don't forget your part in all this."],
					["say_r", "..."],
				],
			]],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["ask_r", "Enjoying the party?", [
				["Yes",
					["say_r", "Good."],
				],
				["No",
					["say_r", "Oh..."],
				],
			]],
		]],
	], [912, 918], "Putney", null, 43)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Angel"],
		["if_first", 'act1.party.angel', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Camden, finding the cross and this party, its all thanks to you."],
			["say_l", "Thanks, but it is my duty to..."],
			["say_r", "No, it isn't because of your duty, you do it out of goodness. I want you to know that we... that I really appreciate it."],
			["say_l", "... Thanks."],
			["clear_r"],
			["say_l", "... Was she... ? No... probably not."],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "Weeeeeeeeeeee!"],
		]],
	], [1214, 1291], "Angel", null, 197)

	var cnlscript = [
		["speaker_l", "Camden"],
		["if_first", 'act1.party.cnl', [
			["increment_plotstate", 'act1.party.counter'],
			["speaker_r", "Latimer &"],
			["say_r", "Corporal Camden, his Holiness the Robo-Pope will be very pleased to hear of this progress."],
			["say_l", "That's good news. So what are the duties of a 'Sub-Inquisitor'?"],
			["speaker_r", "Chalfont &"],
			["say_r", "Brrzt bkzz. Peep peep krzz srweee."],
			["speaker_r", "Latimer &"],
			["say_r", "That's right."],
			["say_l", "..."],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["speaker_r", "Chalfont &"],
			["say_r", "Buzz pip pip."],
		]],
	]
	m.actorTalkScript(cnlscript, [1152, 1102], "Chalfont", null, 135)
	m.actorTalkScript(cnlscript, [1182, 1122], "Latimer", null, 149)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Great Portland"],
		["if_first", 'act1.party.portland', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Greetings, young one!"],
			["say_l", "Um, hi."],
			["say_r", "Your achievements here have been great, but I sense they are the start of a greater darkness."],
			["say_l", "Um, okay?"],
			["say_r", "Keep your guard up."],
			["clear_r"],
			["say_l", "That guy really makes me nervous."],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "(Mutter mutter) terrible evil (mutter mutter) impending doom (mutter mutter)."],
			["say_l", "Best to not disturb him."],
		]],
	], [770, 1301], "Great Portland", null, 311, 45)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Hammersmith"],
		["if_first", 'act1.party.hammersmith', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Easy there, son. You've done a good job!"],
			["say_l", "So I'm told. Although everything has happened quite suddenly."],
			["say_r", "Get used to it. When I was in Knightsbridge you had to stay ahead of the game."],
			["say_l", "I'm surprised that the dig needed me. Commander Goldhawk seems to have everything under control."],
			["say_r", "With a find like this, we could be drawing a lot of attention. Shouldn't be surprised if the two of you aren't enough."],
			["say_l", "(Gulp.)"],
			["say_r", "Ha ha ha! Don't worry, son, I'll back you up"],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "It's a great day to be alive."],
		]],
	], [1195, 1346], "Hammersmith", null, 210)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden cape"],
		["if_first", 'act1.party.harlesden', [
			["increment_plotstate", 'act1.party.counter'],
			["say_r", "Ah, hello, Camden. Don't you think this is an incredible find?"],
			["say_l", "I don't really understand..."],
			["say_r", "The relics from the era of St. Pancras were mostly destroyed. Finding the Charing Cross has profound significance."],
			["say_r", "St. Pancras used the cross to restore life."],
			["say_l", "You mean, from a backup?"],
			["say_r", "Without a backup, dear boy."],
			["ask_l", "Wow.", [
				["I can see why you're excited.",
					["say_r", "Indeed."],
				],
				["Why are you dressed up?", 
					["say_r", "Oh this, I thought it was a costume party. So I put on my wizard's hat and cape."],
					["say_r", "I miss my youth."],
				],
			]],
			["if_plotstate_counter", 'act1.party.counter', 4, [["runScript", theftScript, 50]]],
		], [
			["say_r", "When I speak, how can I know that you hear?"],
		]],
	], [862, 1377], "Harlesden", null, 287)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Gospel"],
		["if_first", "act1.party.gospel", [
			["increment_plotstate", "act1.party.counter"],
			["say_r", "Good evening, my son."],
			["say_r", "You are the heroic soldier that brought this boon of St. Pancras upon us. Blessing to you."],
			["say_l", "Um... Thanks?"],
			["say_r", "And modest too, truly, you are a noble soul. Through you is manifested the love of St. Pancras himself."],
		], [
			["say_r", "Praise to St. Pancras, my son."],
		]],
	], [962, 968], 'Father Gospel', null, 190)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Cutty Sark"],
		["say_r", "Quack... quack..."],
		["say_l", "He's muttering in his sleep."],
	], [950, 1140], 'Cutty Sark', null, 129)
		
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Pimlico"],
		["say_r", "When I get tired and need a break, I go talk to the duck to save my progress."],
		["say_r", "He's asleep now though."],
	], [729, 978], "Pimlico", null, 26)
}

setups["act2.town"] = function (ps, m) {
	makeTown(m)
	camden = m.addProtag([41,640])

	m.setStartScript([
		["change_music", TOWN_MUSIC],
		["if_first", 'act2.town', [
			["say_r", "Following the commotion at the party, an uneasy state of suspicion has spread throughout Dollis Hill."],
		]],
		["if_plotstate", 'act2.makewayforthepope', [
			["if_first", 'act2.popearrives', [
				["blank"],
				["speaker_r", "Latimer"],
				["say_r", "Make way for his Holiness, Robo-Pope Hornchurch 0x0D!"],
				["speaker_l", "Chalfont"],
				["say_l", "Skrrzzt! Beep beep beep! Bzzzzzrrrrr.... ZEEP!"],
				["speaker_r", "Hornchurch"],
				["say_r", "Thank you, Cardinal Chalfont, your kind words are much appreciated."],
				["say_l", "Bzzzzt. Skrzzzzzzzzeeep!"],
				["say_r", "Indeed."],
				["speaker_l", "Angel"],
				["say_l", "Welcome to Dollis Hill, your Holiness. I am Angel, leader of the archaeological expedition here."],
				["say_r", "Ah, so it was you who found and lost the Charing Cross."],
				["say_l", "No, that was Camden. I mean, Camden..."],
				["say_r", "Who is this Camden?"],
				["speaker_l", "Camden"],
				["say_l", "That's me, your Popeliness."],
				["say_r", "You will address me by my proper title, young man. I am much displeased with your performance here."],
				["say_r", "Your lack of vigilance has led to the loss of the Charing Cross. I shall be having harsh words with your superior officer."],
				["say_l", "Nice to meet you too."],
				["speaker_l", "Great Portland"],
				["say_l", "Harumph. What's going on here? Who's this chap?"],
				["speaker_r", "Chalfont"],
				["say_r", "Zzzzzzp! KZZZEEP! KZZZEEP!"],
				["say_l", "What's he doing here?"],
				["say_r", "Brrrrzzzt."],
				["say_l", "Well, I never voted for him."],
				["speaker_r", "Hornchurch"],
				["say_r", "Who is this insolent robot?"],
				["say_l", "Name's Great Portland, elder of this village. And I don't much care for your tone, whippersnapper."],
				["say_l", "Young Camden has been nothing but helpful in finding the Charing Cross."],
				["say_l", "It's not his fault that the Cross was stolen. I'd suggest you look elsewhere for your thief."],
				["say_r", "There shall be repercussions. Be warned."],
				["speaker_l", "Victoria"],
				["say_l", "What's all this commotion?"],
				["say_r", "Princess Victoria, you should not concern yourself with this rabble."],
				["say_l", "Oh, nonsense, Mr Pope. I'm sure they're lovely people. I'm sure Camden will be perfectly capable of escorting me back to town. You may leave."],
				["say_r", "Very well, your Majesty."],
				["say_r", "Come, Cardinal Chalfont, Sub-Inquisitor Latimer. We have business to attend to."],
				["speaker_l", "Chalfont &"],
				["say_l", "Kzzzzzrp! Bzzzzk bzzzzk bzzzzk."],
				["speaker_l", "Latimer &"],
				["say_l", "Coming, my Lord!"],
				["speaker_l", "Camden"],
				["speaker_r", "Angel"],
				["say_r", "Sorry, Camden. I think I landed you in it there. I feel terrible."],
				["ask_l", "What should I say?", [
					["Don't worry, it's not your fault.",
						["say_r", "It's very nice of you to say so."],
						["say_r", "You're always so nice to me."],
					],
					["That was a little mean of you.",
						["say_r", "I know. I'm really sorry. I'm a little bit thoughtless sometimes."],
					],
				]],
				["say_r", "Anyway, we should get back to town and try to find out who stole the Cross."],
				["say_l", "Sure, coming."],
				["speaker_r", "Victoria"],
				["say_r", "Hi, I'm a princess."],
				["say_l", "Hello, I'm Camden."],
				["say_r", "You're supposed to bow, you know. I am a princess."],
				["say_l", "Oh, sorry."],
				["say_r", "Don't worry. Daddy says it's important to be nice to peasants."],
				["say_r", "You can take me back to town now."],
				["clear_l"],
				["clear_r"],
				["blank", false],
				["say_l", "Camden leads Angel and Victoria back to town."],
				["speaker_r", "Angel"],
				["say_r", "You should ask around to see if anyone's heard anything about the Cross."],
				["say_r", "I'll be here if you find anything."],
			]],
		]],
	])

	m.actorTalkScript([
		["speaker_r", "Goldhawk"],
		["say_r", "Terrible business with the theft of the Charing Cross."],
		["if_first", 'act2.goldhawk', [
			["say_r", "As soldiers of Knightsbridge, it's our duty to remain ever vigilant against such crimes."],
			["say_r", "However, all this suspicion and accusation is tearing this community apart."],
			["say_r", "If you're smart, you won't get involved in these matters."],
			["if_plotstate", 'act2.makewayforthepope', [
				["say_r", "Leave the inquisitors of the Holy Robot Empire to their business."],
			]],
		]],
		["ask_r", "Anyway, would you like to go to the Outer Zones?", [
			["Yes",
				["say_r", "Good luck, soldier."],
				["change_scene", 'act2.ozmission'],
			],
			["No",
				["say_r", "Come back later if you change your mind."],
				["say_r", "And stay out of trouble."],
			],
		]],
	], [34, 535], "Goldhawk", null, 0xbad)

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["if_plotstate", 'act2.putneycleared', [
			["speaker_l", "Camden"],
			["say_r", "Thanks for helping to clear me, Camden."],
			["say_l", "Don't mention it."],
			["say_r", "But don't tell my dad, please."],
		], [
			["say_r", "What's going on? Why is everybody looking at me funny?"],
		]],
	], [1653, 1736], "Putney", null, 270)

	// Warning! Complicated dialogue tree ahead!
	var angelaskspope = [
		["say_r", "I know we're hunting for the Charing Cross, but you've got another mission too."],
		["say_r", "Robo-Pope Hornchurch is quite annoyed that we lost it, so he's coming over here to kick up a fuss."],
		["say_l", "The Robo-Pope is coming here?"],
		["say_r", "Yes, and he's a very powerful man, so it's important that we not get on his bad side."],
		["say_l", "He's not happy about the whole Cross thing then, is he?"],
		["say_r", "No, Camden, he's not."],
		["say_r", "Since you're a Knightsbridge soldier, you have to clear the way for him and his entourage."],
	]
	var putneyalibi = [
		["set_plotstate", 'act2.putneycleared'],
		["say_l", "Wait, I have proof that he's not."],
		["say_l", "Father Gospel says that he was with Putney at the time of the theft."],
		["say_r", "That's great! Chalfont and Latimer can't doubt the word of a robot of the cloth."],
		["say_r", "Let's go tell everyone!"],
		["blank"],
		["clear_l"],
		["clear_r"],
		["speaker_r", "Latimer"],
		["speaker_l", "Chalfont"],
		["say_r", "And so we find that the boy Putney, using powers of advanced hypnotism, has caused us all to become unable to perceive cruciform, that is, cross-shaped objects."],
		["say_l", "Bzzzzzzk! Zzzzzeeep!"],
		["say_r", "As his Eminence says, under orders from powers hostile to the Holy Robot Empire and our beloved Robo-Pope, he has spirited the cross away to be melted down to make an unholy pair of scissors."],
		["say_r", "With these scissors, he shall cut the very strands which support our beloved..."],
		["speaker_l", "Camden"],
		["say_l", "Wait!"],
		["say_l", "We have proof that Putney is innocent!"],
		["speaker_r", "Latimer &"],
		["say_r", "The very strands which..."],
		["speaker_l", "Gospel"],
		["say_l", "It is true, your Lordship."],
		["say_l", "At the time of the theft, Putney was with me."],
		["say_l", "I swear before St Pancras himself that he could not have stolen the Cross."],
		["speaker_r", "Chalfont &"],
		["say_r", "Skrrrrrrzp?"],
		["say_l", "Certainly, your Eminence."],
		["say_l", "I beg your leave now, to return to my duties."],
		["say_r", "Beeep! Zzzzzzrrrr."],
		["speaker_l", "Camden"],
		["say_l", "So now Putney is cleared."],
		["speaker_r", "Latimer &"],
		["say_r", "Not so fast. The Holy Inquisition is not so easily swayed."],
		["speaker_l", "Victoria"],
		["say_l", "Oh, don't be silly, Latimer. Putney's obviously innocent."],
		["speaker_r", "Chalfont &"],
		["say_r", "Zzzzrrrpeeep!"],
		["say_l", "Stop being a silly little cardinal man."],
		["say_l", "I say Putney's innocent, and I'm a princess."],
		["say_l", "Don't make me get Daddy."],
		["say_r", "Skzzzzt. Zzzoop. Beep beep bzzt."],
		["speaker_r", "Latimer &"],
		["say_r", "Your wisdom is, as ever, unbounded, my Lord."],
		["say_r", "We shall retire for further deliberations."],
		["speaker_r", "Putney"],
		["say_r", "Thanks, Miss Princess, ma'am!"],
		["say_r", "I was really worried what my dad would think when he found out."],
		["say_l", "That's OK. Hornchurch and his cronies are always trying to boss people around."],
		["say_r", "If there's ever anything I can do to repay you..."],
		["say_l", "Don't be silly. I'm a princess. What could you do to repay me?"],
		["say_l", "Anyway, I'm going to go look around."],
		["say_l", "I've never seen a proper peasant village before."],
		["clear_l"],
		["blank", false],
		["speaker_r", "Angel"],
		["say_r", "Now that Putney is cleared, we should look for the real thief."],
		["speaker_l", "Camden"],
		["say_l", "And you think that Chalfont and Latimer are involved?"],
		["say_r", "Well, I can't see why they'd come up with such a ridiculous theory if they weren't covering something up."],
		["say_l", "Good point."],
		["say_r", "They have a little hideout just outside of town. I found it one day when I was on the dig."],
		["say_r", "We should go investigate."],
	]
	m.actorTalkScript([
		["speaker_r", "Angel"],
		["speaker_l", "Camden"],
		["say_r", "Hi, Camden."],
		["if_first", "act2.angel.intro", [
			["say_r", "What are we going to do, Camden? This is terrible!"],
			["ask_l", "What should I say?", [
				["We should try to find the thief.",
					["say_r", "I don't know, that sounds like it could be dangerous."],
				],
				["It's someone else's problem.",
					["say_r", "That doesn't sound like you, Camden."],
					["say_l", "I guess I just don't know where to start."],
					["say_r", "Don't worry, I'll help."],
				],
			]],
		]],
		["if_plotstate", 'act2.makewayforthepope', [
			["if_plotstate", 'act2.putneycleared', [
				["say_r", "So, we think Chalfont and Latimer took the Cross?"],
				["say_r", "They're probably keeping it at their hideout. It could be dangerous though. You should make sure you're prepared."],
				["ask_r", "Want to go there now?", [
					["Cool!", 
						["say_r", "Right, let's go."],
						["change_scene", "act2.findthehideout"],
					],
					["No way!",
						["say_r", "Later, then."],
					],
				]],
			], [
				["say_r", "Chalfont and Latimer seem to think Putney is the thief."],
				["if_plotstate", 'act2.putneyalibi', putneyalibi, [
					["say_r", "But to be honest, I think those two are pretty suspicious themselves."],
				]],
			]],
		], [
			["if_first", "act2.angelaskspope", angelaskspope, [
				["say_r", "You still haven't cleared the way for the Robo-Pope."],
			]],
			["ask_r", "Want to do it now?", [
				["Ok.",
					["say_r", "Right!"],
					["change_scene", "act2.makewayforthepope"],
				],
				["No way!",
					["say_r", "Later, then."],
				],
			]],
		]],
	], [43, 725], "Angel", null, 325)

	if (plotstate['act2.makewayforthepope']) {
		m.actorTalkScript([
			["speaker_r", "Victoria"],
			["speaker_l", "Camden"],
			["if_first", "act2.victoria.intro", [
				["say_l", "So you're a princess?"],
				["say_r", "Yes."],
				["say_l", "..."],
				["say_r", "You may speak."],
				["say_l", "I don't really know what to say."],
				["say_r", "Hmmph."],
			], [
				["if_plotstate", 'act2.putneycleared', [
					["say_l", "That was really nice of you, what you did for Putney."],
					["say_r", "Of course it was. I'm a princess."],
				], [
					["say_l", "Do you know who stole the Cross?"],
					["say_r", "I'm a princess. I don't talk to thieves."],
				]],
			]],
		], [1151, 1325], "Victoria", null, 270)
	}

	var cnlscript = [
		["speaker_l", "Camden"],
		["speaker_r", "Latimer &"],
		["if_first", "act2.putneyaccused", [
			["say_r", "You will be glad to know that you have been removed from our investigation."],
			["speaker_r", "Chalfont"],
			["say_r", "Skrrrrrrzoop!"],
			["speaker_r", "Latimer &"],
			["say_r", "His Eminence Cardinal Chalfont extends his deepest apologies."],
			["say_l", "Tell him thanks."],
			["speaker_r", "Chalfont"],
			["say_r", "ZZZZZZZRRRRTT! KZZZEEEEEEEEE! Zoop! Zoop!"],
			["speaker_r", "Latimer &"],
			["say_r", "His Eminence can understand you perfectly himself. He's not an idiot."],
			["say_l", "Sorry."],
			["say_r", "Our investigations now center on the child Putney."],
		], [
			["if_plotstate", "act2.putneycleared", [
				["say_r", "It seems we were wrong about the child Putney."],
				["speaker_r", "Chalfont &"],
				["say_r", "Bzrzt. Krzee peep."],
				["speaker_r", "Latimer &"],
				["say_r", "Agreed, your eminence."],
			], [
				["say_r", "Our investigations still center on the child Putney."],
				["if_plotstate", "act2.putneyalibi", [
					["say_l", "What if I had someone who could vouch-"],
					["speaker_r", "Chalfont"],
					["say_r", "Bzeeeep zip zip zooop zeep dreeeeeeeeeee ping ping!"],
					["speaker_r", "Latimer &"],
					["say_r", "You presume that one such as yourself has the slightest scrap of wisdom to offer our investigation?"],
					["say_r", "His Eminence is mortally offended at your presumptuousness."],
					["clear_r"],
					["say_l", "Hmm... maybe I need Angel to back me up."],
				]],
			]],
		]],
	]
	m.actorTalkScript(cnlscript, [755, 1001], "Chalfont", null, 270)
	m.actorTalkScript(cnlscript, [743, 964], "Latimer", null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Great Portland"],
		["if_first", "act2.portland.intro", [
			["say_r", "This is a dark trial that has been put before us."],
			["say_l", "What do you mean?"],
			["say_r", "The theft, young one. It implies that one amongst us is a thief."],
			["say_l", "But who would want the Cross?"],
			["say_r", "Almost anyone. It is said to have the power to restore life."],
			["say_l", "Do you suspect anyone?"],
			["say_r", "I must not say."],
		], [
			["say_r", "..."],
			["say_l", "He seems to be thinking."],
		]],
	], [1088, 280], 'Great Portland', null, 90, 45)

	m.actorTalkScript([
		["speaker_r", "Hammersmith"],
		["ask_r", "What can I get you, son?", [
			["Inventory",
				["inventory"],
			],
			["Leave",
			],
		]],
	], [1453, 2057], "Hammersmith", null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden"],
		["if_first", "act2.harlesden.intro", [
			["say_r", "This is terrible."],
			["say_l", "I'm going to get it back!"],
			["say_r", "I hope you do, I really hope you do."],
		], [
			["say_r", "This is very bad."],
		]],
	], [970,1800], "Harlesden", null, 290)

	m.actorTalkScript([
		["speaker_r", "Cutty Sark"],
		["ask_r", "Quack quack quack quack, quack quack?", [
			["Save", 
				["save"],
				["say_r", "Saved."],
			],
			["Cancel",
			],
		]],
	], [940, 1090], "Cutty Sark", null, 289)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Gospel"],
		["if_first", 'act2.gospel', [
			["if_plotstate", "act1.party.gospel", [], [
				["say_r", "Greetings, my son."],
				["say_l", "Hi, my name's Camden."],
				["say_r", "I am Gospel, priest of the Church of St. Pancras. But of course I know who you are..."],
				["say_r", "You are the heroic soldier that brought this boon of St. Pancras upon us. Blessings to you."],
				["say_l", "Um... Thanks?"],
				["say_r", "And modest too. Truly you are a noble soul. Through you is manifested the love of St. Pancras himself."],
			]],
		]],
		["if_plotstate", 'act2.makewayforthepope', [
			["if_first", "act2.gospel.alibi", [
				["say_l", "Father Gospel, Cardinal Chalfont & Sub-Inquisitor Latimer are convinced that Putney stole the Cross."],
				["say_r", "Really? That is interesting."],
				["say_l", "Do you know something?"],
				["say_r", "Well, I may just be able to provide the boy with an alibi."],
				["say_l", "Oh?"],
				["say_r", "Of course, it is really beneath one such as myself to involve myself in these mundane affairs of burglary."],
				["say_r", "Perhaps a donation to the chapel's coffers would ease my mind."],
				["say_l", "..."],
				["say_r", "All donations are welcome, but about 128 zinc would be much appreciated."],
			], [
				["if_plotstate", "act2.putneyalibi", [], [
					["say_r", "Yes, a donation of 128 zinc would definitely be the thing."],
				]],
			]],
			
			// TODO: I removed the ability to donate extra zinc, the logic was confusing and didn't
			//   seem worth it. Consider putting it back.
			["if_has_metal", "Zinc", 128, [
				["if_plotstate", "act2.putneyalibi", [
					["say_r", "Blessings of St. Pancras be upon you."],
				], [
					["ask_l", "Shall I give Gospel 128 zinc?", [
						["Yes",
							["set_plotstate", 'act2.putneyalibi'],
							["change_metal", -128, "Zinc"],
							["say_r", "Bless you, my son, for your kind donation."],
							["say_l", "Alibi?"],
							["say_r", "Yes, I was with Putney throughout the party. There is no way he could have left to steal the Cross."],
							["say_l", "That's it? That's your alibi?"],
							["say_r", "Are you doubting the words of a priest of St. Pancras?"],
							["say_l", "Ah, no, of course not."],
							["say_r", "Good, because their Eminences Chalfont and Latimer most certainly will not do so either."],
							["say_l", "I see..."],
						],
						["No",
							["say_r", "Blessings of St. Pancras be upon you."],
						],
					]],
				]],
			], [
				["say_r", "Blessings of St. Pancras be upon you."],
			]],
		], [
			["say_r", "Blessings of St. Pancras be upon you."],
		]],
	], [768, 134], 'Father Gospel', null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Pimlico"],
		["say_r", "When I'm on a mission I like to press tab to hide my HUD!"],
		["say_l", "When you're on a mission?"],
	], [1533, 664], "Pimlico", null, 312)
}

setups["act2.makewayforthepope"] = function (ps, m) {
	m.map = makeDungeon2({
		left: "entry_left",
		maxrooms: 12,
	})
	var camden = m.addProtag(m.map.leftPos([50,50]))
	m.placeEnemiesRandomlyAnywhere({
		BladeDrone: 12,
		SpiderQueen: 4,
		MachineGunTank: 8,
		FireScorpion: 16
	})
	
	m.canEject = true
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", "act2.makewayforthepope.intro", [
			["speaker_l", "Camden"],
			["sound", "radio"],
			["say_r", "Make sure you clear out everything before the pope arrives. Good luck, Camden!", "Angel"],
		]],
	])

	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act2.town"],
	])
		
	m.setClearScript([
		["set_plotstate", 'act2.makewayforthepope'],
		["sound", "radio"],
		["say_r", "That's great, Camden! The area's clear. You can come back now.", "Angel"],
		["add_xp", 64],
	])
}

setups["act2.findthehideout"] = function (ps, m) {
	m.map = makeDungeon2({
		top: 'entry_top',
		bottom: 't5base',
		maxrooms: 15,
	})
	var camden = m.addProtag(m.map.topPos([50,550]))
	m.placeEnemiesRandomlyAnywhere({
		MachineGunTank: 8,
		HeavyTank: 16,
		DrillTank: 16,
		SentryDroid: 14,
	})

	m.entities.add(makeEnemy("SentryDroid", m, m.map.bottomPos([350,1850])))
	m.entities.add(makeEnemy("SentryDroid", m, m.map.bottomPos([950,1450])))
	
	m.canEject = true
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", "act2.findthehideout.intro", [
			["speaker_l", "Camden"],
			["sound", "radio"],
			["say_r", "Okay, the hideout is a little beyond here.", "Angel"],
			["say_r", "See if you can get inside and find out what's going on."],
			["say_l", "Right, I'm on my way."],
		]],
	])
			
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act2.town"],
	])

	camden.addAreaScript([
		["sound", "radio"],
		["wait", 10],
		["speaker_l", "Camden"],
		["say_r", "Camden? Camden? Come in, Camden!", "Angel"],
		["say_l", "Angel? This is Camden."],
		["say_r", "Camden, where are you? Have you reached the hideout yet?"],
		["say_l", "Yes, I'm inside. What's wrong?"],
		["say_r", "Camden, I think you should get out of there. It's ..."],
		["sound", "roar"],
		["blank"],
		["change_music", LO_BOSS_MUSIC],
		["speaker_r", "Arsenal"],
		["say_r", "Awright!"],
		["say_l", "Oh, my..."],
		["say_r", "You're going down, boy-o! Prepare to eat rust!"],
		["change_scene", "act2.bossfight"],
	], [m.map.bottom_offs[0], m.map.bottom_offs[1]], [800, 800])
}

setups["act2.bossfight"] = function (ps, m) {
	m.map = loadFixedMap('t5interior')
	camden = m.addProtag([150,150])
	camden.bearing = 45
	
	m.setStartScript([
		["change_music", LO_BOSS_MUSIC],
	])

	m.setEjectScript([
		["set_plotstate", "act", 3],
		["addWeaponSlot"],
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act3.town"],
	])

	// This is a particularly inelegant way of handling the fact that script specs are not
	//   arbitrary functions, like they were in the python version.
	// Try to avoid this sort of thing, okay?
	var setupcnl = (function (m, camden) {
		return function () {
			playmusic(LO_BOSS_MUSIC)
			camden.pos = [450,350]
			camden.currenthp = camden.getMaxHP()
			m.entities.add(camden)
			var chalfont = m.addEnemy("Chalfont", [250,550], 0)
			var latimer = m.addEnemy("Latimer", [650,550], 180)
			var cnlkillspec = [
				["die"],
				["increment", "cnlkilled"],
				["ifeq", "cnlkilled", 2, [
					["wait", 50],
					["speaker_l", "Camden"],
					["say_l", "Oh, my goodness."],
					["say_l", "What am I supposed to do now?"],
					["say_l", "Better eject back to town."],
					["canEject", true],
				]],
			]
			chalfont.setDeathScript(cnlkillspec)
			latimer.setDeathScript(cnlkillspec)
		}
	})(m, camden)

	m.enemyDeathScript([
		["change_music", null],
		["die"],
		["wait", 75],
		["speaker_l", "Camden"],
		["say_l", "Thank goodness."],
		["say_l", "What on earth was that?"],
		["sound", "radio"],
		["say_r", "Camden?", "Angel"],
		["say_l", "Angel?"],
		["say_r", "Camden, thank Pancras you're alright! Um, I ..."],
		["say_l", "Angel, what's going on? Who or what was that and how did ..."],
		["sound", "roar"],
		["speaker_r", "Arsenal"],
		["say_r", "Raaaaarrrgh!"],
		["say_r", "If I go down, I'm taking you with me!"],
		["kill_protag"],
		["set_zoom", 3],
		["wait", 50],
		["blank"],
		["set_zoom", 1],
		["clear_l"],
		["clear_r"],
		["say_l", "..."],
		["say_l", "....."],
		["say_l", "......."],
		["speaker_l", "Angel"],
		["say_l", "Camden?"],
		["speaker_r", "Camden"],
		["say_r", "Angel?"],
		["say_r", "What's going on?"],
		["say_r", "And is that ..."],
		["say_l", "Yes, it's the Charing Cross."],
		["say_l", "Camden, I'm so sorry."],
		["clear_l"],
		["say_r", "How did you ..."],
		["say_r", "Wait!"],
		["say_l", "Apologies, my recently-resurrected friend."],
		["say_l", "Her apparent change of heart just now notwithstanding, your floozy there has played you for a fool."],
		["say_l", "How wretched it must be, to be unable to penetrate even such a transparent deception."],
		["speaker_l", "Chalfont"],
		["say_l", "Bzzt skkkkrt bi-deep deep wheeeeeeeee!"],
		["speaker_l", "Chalfont & Latimer"],
		["say_r", "You!"],
		["speaker_l", "Latimer &"],
		["say_l", "How foolish of you to think you could oppose the might of the Holy Robot Empire!"],
		["say_r", "Angel! Wait!"],
		["say_l", "Don't disregard his lordship, thou heathen worm! We shall detain you here, by force if we have to!"],
		["do", setupcnl],
	], "Arsenal", [650,650], bearing=215)
}

setups["act2.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		DrillTank: 16,
		HeavyTank: 16,
		MachineGunTank: 16,
		FireScorpion: 16,
		SentryDroid: 16,
		BladeDrone: 16,
		Minument: 8,
		TankPack: 8,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([
		["change_music", OZ_MUSIC],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act2.town"],
	])
}

setups["act3.town"] = function (ps, m) {
	makeTown(m)
	var camden = m.addProtag([100,800])

	var hammersmithScript = [
		["sound", "radio"],
		["say_r", "Camden, come in, son. This is Hammersmith, I need you to come see me in town.", "Hammersmith"],
		["say_r", "I have important information for you."],
	]
	
	m.setStartScript([
		["change_music", TOWN_MUSIC],
		["if_first", 'act3.town', [
			["set_plotstate", 'act3.quests', 0],
			["speaker_l", "Camden"],
			["speaker_r", "Putney"],
			["say_l", "Putney?"],
			["say_r", "Camden, the fountain is surrounded by tanks!"],
			["say_l", "What? Why?"],
			["say_r", "Robo-Pope Hornchurch has seized control of the village. He's just marched in!"],
			["say_l", "Hornchurch? Oh no, Angel must've been in league with him! This is all part of their plan!"],
			["speaker_r", "Victoria"],
			["say_r", "I always knew that rotten Hornchurch was no good."],
			["speaker_r", "Putney"],
			["say_r", "They're after Victoria, they're searching all over for her."],
			["say_l", "Why, Victoria?"],
			["speaker_r", "Victoria"],
			["say_r", "Because I'm a princess."],
			["speaker_r", "Putney"],
			["say_r", "We have to get her out of here. It's not safe."],
			["say_l", "But where shall we go?"],
			["say_r", "I know a cave, it's infested with vermin, but I'm sure you can clear it out."],
			["speaker_r", "Victoria"],
			["say_r", "Infested? No, that won't do, you'll have to find me somewhere else."],
			["say_l", "I'm sorry, Princess, but you may not have a choice."],
			["say_r", "Insolence!"],
			["say_l", "Call it what you will. I don't work for Hornchurch though, I'm on your side. Your chances are better with me than here on your own."],
			["speaker_r", "Putney"],
			["say_r", "Talk to me when you're ready."],
		]],
	])

	var tankps = [[1255, 1445], [1255, 949], [750, 949], [750, 1445]]
	var bearings = [225, 135, 45, 315]
	for (var j = 0 ; j < 4 ; ++j) {
		if (!ps["act3.tank" + j + "dead"]) {
			m.enemyDeathScript([
				["set_plotstate", "act3.tank" + j + "dead"],
				["die"],
			], "TownTank", tankps[j], bearings[j])
		}
	}

	if (!ps["act3.killsomespiders"]) {
		m.actorTalkScript([
			["speaker_r", "Goldhawk"],
			["say_r", "Stick it out, soldier. We'll get through this."],
		], "Goldhawk", [1530, 1450], null, 0)

		m.actorTalkScript([
			["speaker_r", "Victoria"],
			["say_r", "I'm a princess! I don't want to live in a cave!"],
		], [135, 835], "Victoria", null, 265)
	}

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["if_plotstate", 'act3.killsomespiders', [
			["say_r", "I hope Victoria's okay."],
			["ask_r", "Do you need something?", [
				["Outer Zones", 
					["say_r", "Right!"],
					["set_plotstate", 'act3.ozfrom', 'act3.town'],
					["change_scene", "act3.ozmission"],
				],
				["Victoria's Secret Cave",
					["say_r", "Right!"],
					["change_scene", "act3.camp"],
				],
				["Nothing",
					["say_r", "Later, then."],
				],
			]],
		], [
			["ask_r", "Do you need something?", [
				["Clear the cave",
					["say_r", "Right!"],
					["change_scene", "act3.killsomespiders"],
				],
				["Outer Zones",
					["say_r", "Right!"],
					["set_plotstate", 'act3.ozfrom', 'act3.town'],
					["change_scene", "act3.ozmission"],
				],
				["Nothing",
					["say_r", "Later, then."],
				],
			]],
		]],
	], [131, 761], "Putney", null, 95)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Great Portland"],
		["if_plotstate", 'act3.portland.questdone', [
			["say_r", "..."],
			["say_l", "..."],
			["say_r", "...?"],
			["say_l", "Wow. How did you do that?"],
			["say_r", "The young are too impatient to learn."],
			"terminated",
		]],
		["if_plotstate", "act3.killsomespiders", [
			["if_first", "act3.portland.quest", [
				["say_r", "This is a time of uncertain futures, young one. We all must come together or be torn apart."],
				["say_r", "I have, for you, an important quest. I dare say the most important quest there is."],
				["say_r", "It will challenge every aspect of your fitness and faculties. It will push you to achieve more."],
				["say_r", "More importantly, it will ensure the safety of this village and all who live in it."],
				["say_r", "You, Camden, must fetch me 32 units of molybdenum."],
				["say_l", "That's it?"],
				["say_r", "Yes. Now go."],
			], [
				["say_r", "Camden, I yet await those 32 units of molybdenum."],
			]],
			["if_has_metal", "Molybdenum", 32, [
				["ask_l", "Shall I give Great Portland 32 molybdenum?", [
					["Yes",
						["set_plotstate", 'act3.portland.questdone'],
						["increment_plotstate", 'act3.quests'],
						["change_metal", -32, "Molybdenum"],
						["say_r", "Excellent work, young one, now leave me."],
						["if_plotstate_counter", 'act3.quests', 2, [["runScript", hammersmithScript, 50]]],
					],
					["No",
					],
				]],
			]],
		], [
			["say_r", "These are dark times for our village."],
		]],
	], [1088, 280], "Great Portland", null, 90, 45)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Hammersmith"],
		["if_plotstate_counter", 'act3.quests', 2, [
			["if_first", 'act3.hammersmith.mission', [
				["say_r", "Good to see you, son."],
				["say_l", "What's up?"],
				["say_r", "Goldhawk's gone missing. He went undercover in the enemy base but he hasn't reported in."],
				["say_r", "You've gotta go in there and find him, son."],
				["say_l", "Okay, I'm there."],
				["say_r", "Are you sure? This is a dangerous mission. There's no telling if you'll come back."],
				["say_l", "Definitely. Goldhawk pulled me out of a mess just before I got here."],
				["say_l", "I owe him a favour, as my CO and my friend."],
				["say_r", "You got it, son. I know you're gonna go far."],
			], [
				["say_r", "Goldhawk's still not back."],
			]],
			["ask_r", "What will you do?", [
				["Rescue Goldhawk",
					["say_r", "Good luck, son!"],
					["change_scene", "act3.assaultthebase"],
				],
				["Inventory",
					["inventory"],
					["say_r", "Come back any time."],
				],
				["Nothing",
				],
			]],
		], [
			["ask_r", "Need anything?", [
				["Inventory",
					["inventory"],
					["say_r", "Come back any time."],
				],
				["Leave",
				],
			]],
		]],
	], [1453, 2057], 'Hammersmith', null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden"],
		["if_plotstate", 'act3.harlesden.questdone', [
			// The hell is this...?
			["say_r", "What if I am a butterfly who dreams of being a robot?"],
			"endConversation",
			["say_r", "What if I am a butterfly who dreams of being a robot?"],
			["say_l", "What if you're a butterfly who dreams of being a flying egg-thing with dangly arms?"],
			"endConversation",
			["say_r", "Your questions pierce me to my core. Am I my form, or am I my nature?"],
			"endConversation",
			["say_r", "Am I my form, or am I my nature?"],
			["say_l", "Are you always this philosophical, or are you on drugs?"],
		], [
			["if_plotstate", 'act3.killsomespiders', [
				["if_first", "act3.harlesden.quest", [
					["say_r", "Camden, I would like to ask you a favour."],
					["say_r", "I am currently working on a particularly incisive research project."],
					["say_r", "However, progress is stalled for want of a large amount of molybdenum."],
					["say_r", "If you could fetch me 32 units, that would be very useful."],
				], [
					["say_r", "I could still use 32 units of molybdenum."],
				]],
				["if_has_metal", "Molybdenum", 32, [
					["ask_l", "Shall I give Harlesden 32 molybdenum?", [
						["Yes",
							["set_plotstate", 'act3.harlesden.questdone'],
							["increment_plotstate", 'act3.quests'],
							["change_metal", -32, "Molybdenum"],
							["say_r", "Excellent. Now I can equip my flamethrower!"],
							["say_l", "Research project?"],
							["say_r", "Hmmm?"],
							["if_plotstate_counter", 'act3.quests', 2, [["runScript", hammersmithScript, 50]]],
						],
					]],
				]],
			], [
				["say_r", "How now, brown cow."],
				["say_r", "I am working. Please return later."],
			]],
		]],
	], [630, 309], "Harlesden", null, 6)

	m.actorTalkScript([
		["speaker_r", "Cutty Sark"],
		["ask_r", "Quack quack quack quack, quack quack?", [
			["Save", 
				["save"],
				["say_r", "Saved."],
			],
			["Cancel",
			],
		]],
	], [40, 560], "Cutty Sark", null, 7)

	m.actorTalkScript([
		["speaker_r", "Gospel"],
		["say_r", "The so-called 'Holy' Robot Empire knows nothing of true faith. Do not be deceived by their lies, my son."],
	], [768, 134], "Father Gospel", null, 270)
		
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Pimlico"],
		["say_r", "I sometimes try to target enemies but miss and end up moving instead."],
		["say_r", "It totally throws my balance off, but if you right-click or hold the Ctrl key when you click, that doesn't happen!"],
	], [1533, 664], "Pimlico", null, 312)
}


setups["act3.camp"] = function (ps, m) {
	m.map = loadFixedMap("camp")
	var camden = m.addProtag([250,250])
	m.style = 'cave'

	var hammersmithScript = [
		["sound", "radio"],
		["say_r", "Camden, come in, son. This is Hammersmith, I need you to come see me in town.", "Hammersmith"],
		["say_r", "I have important information for you."],
	]

	m.setStartScript([
		["change_music", CAMP_MUSIC],
		["if_first", 'act3.camp', [
			["speaker_l", "Putney"],
			["speaker_r", "Victoria"],
			["say_r", "This is it?"],
			["say_l", "Yeah, it's great isn't it?"],
			["say_r", "It's rotten."],
			["say_l", "... But you'll be safe."],
			["say_r", "Camden, you can't expect me to stay here."],
			["speaker_l", "Camden"],
			["say_l", "You will be safer here than in town. We don't know how far Hornchurch's hand stretches, so we have to keep you hidden."],
			["say_r", "Hmph. I do not approve. But I suppose I will give you a chance."],
		]],
	])

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["say_r", "What do you think of the place? Neat, huh?"],
		["ask_r", "Do you need something?", [
			["Outer Zones",
				["say_r", "Right!"],
				["set_plotstate", 'act3.ozfrom', 'act3.camp'],
				["change_scene", "act3.ozmission"],
			],
			["Town",
				["say_r", "Right!"],
				["change_scene", "act3.town"],
			],
			["Nothing",
				["say_r", "Later, then."],
			],
		]],
	], [118, 779], "Putney", null, 95)
			
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Victoria"],
		["if_plotstate", 'act3.victoria.questdone', [
			["say_r", "I guess this cave isn't too bad."],
			"terminated",
		]],
		["if_first", "act3.victoria.quest", [
			["say_r", "This cave is horrible. It's all your fault."],
			["say_l", "Sorry, but you're safer here than in town."],
			["say_r", "Well, you can at least make up for it by bringing me 32 molybdenum."],
			["say_l", "..."],
		], [
			["say_r", "I'm still waiting for some molybdenum."],
		]],
		["if_has_metal", "Molybdenum", 32, [
			["ask_l", "Shall I give Victoria 32 molybdenum?", [
				["Yes",
					["set_plotstate", 'act3.victoria.questdone'],
					["increment_plotstate", 'act3.quests'],
					["change_metal", -32, "Molybdenum"],
					["say_r", "Excellent. I can at least make this place liveable."],
					["if_plotstate_counter", 'act3.quests', 2, [["runScript", hammersmithScript, 50]]],
				],
				["No",
				],
			]],
		]],
	], [250, 350], "Victoria", null, 270)
}

setups["act3.killsomespiders"] = function (ps, m) {
	m.map = makeDungeon2({
		top: "entry_top",
		bottom: "camp",
		maxrooms: 16,
	})
	var camden = m.addProtag(m.map.topPos([200, 200]))
	m.placeEnemiesRandomlyAnywhere({
		GreaterFireScorpion: 16,
		NinjaSpider: 16,
		JadeBeetle: 16,
	})
	
	m.canEject = true
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", "act3.killsomespiders.intro", [
			["speaker_l", "Camden"],
			["sound", "radio"],
			["say_r", "You're very brave, Camden.", "Putney"],
			["say_r", "Some of the monsters in there are pretty scary, but I'm sure you can beat them!"],
		]],
	])

	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act3.town"],
	])

	m.setClearScript([
		["set_plotstate", 'act3.killsomespiders'],
		["wait", 45],
		["sound", "radio"],
		["wait", 5],
		["speaker_l", "Camden"],
		["say_r", "Camden, did you really get rid of all of those spiders by yourself?", "Putney"],
		["say_r", "You're amazing!"],
		["say_r", "Come back to town now and we can get ready to smuggle Victoria over there."],
		["add_xp", 64],
	])
}

setups["act3.assaultthebase"] = function (ps, m) {
	m.map = makeDungeon2({
		top: "goldhawk_base",
		bottom: "entry_bottom",
		maxrooms: 24,
	})
	var camden = m.addProtag(m.map.bottomPos([255, 255]))
	m.placeEnemiesRandomlyAnywhere({
		MechDroid: 16,
		Copter: 4,
		SawDrone: 32,
		SentryDroid: 32
	})
	
	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["if_first", 'act3.assaultthebase.intro', [
			["sound", "radio"],
			["speaker_l", "Camden"],
			["say_r", "Good luck, son.", "Hammersmith"],
			["say_l", "Thanks. I'll do my best."],
		]],
	])

	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["if_plotstate", 'act3.assaultthebase', [
			["set_plotstate", 'act', 4],
			["addWeaponSlot"],
			["change_scene", "act4.camp"],
		], [
			["change_scene", "act3.town"],
		]],
	])

	var door = m.entities.add(makeScenery("BlastDoor", m, m.map.topPos([250, 150]), 90, true))

	var goldhawk = m.entities.add(makeEnemy("Goldhawk", m, m.map.topPos([250, 950]), 270))
	goldhawk.hostile = false
	
	var droids = [], dxs = [150, 200, 300, 350], dys = [800, 750, 700, 650, 600]
	dxs.forEach(function (dx) { dys.forEach(function (dy) {
		var d = m.addEnemy("SentryDroid", m.map.topPos([dx, dy]), 90)
		d.hostile = false
		d.setTalkScript([
			["speaker_l", "Camden"],
			["say_l", "It's not responding."],
		])
		droids.push(d)
	})})

	goldhawk.setTalkScript([
		["change_music", HI_BOSS_MUSIC],
		["speaker_l", "Camden"],
		["speaker_r", "Goldhawk"],
		["say_l", "Goldhawk?"],
		["say_r", "Oh, Camden. I bet Hammersmith sent you here, didn't he?"],
		["say_l", "I don't understand ... are they keeping you here?"],
		["say_l", "No ... it's not that, is it? What did the Robo-Pope buy you with?"],
		["say_r", "I'm not one to be bought, Camden. I came to him of my own accord, and don't you ever say otherwise."],
		["say_l", "Goldhawk, we don't have to do this. You could call off the troops and come back to Dollis Hill."],
		["say_r", "And you'd forget about what I've done, just like that?"],
		["ask_l", "What should I say?", [
			["Of course I would.",
				["say_r", "Camden, you idiot."],
				["say_r", "If you don't quit being so foolishly trusting, you'll end up in the Robo-Papal dungeons just like that simpleton Prince Regent."],
				["say_l", "You're holding the Prince Regent captive?"],
				["say_r", "Yes, and that irritating Angel girl as well. If you don't want to end up rusting away to nothing alongside them, I suggest you prepare to fight for your life!"],
			],
			["I wouldn't forget, but I might forgive.",
				["say_r", "You and your stupid platitudes, Camden."],
				["say_r", "You remind me of that irritating Angel girl we now have languishing in the Robo-Papal dungeon."],
				["say_l", "You're holding Angel captive? Wasn't she working for you?"],
				["say_r", "She's locked up right next to the Prince Regent. And yes, she was."],
				["say_r", "But I am not as trusting as you are, Camden, which is why I'm still alive, while you are shortly not to be."],
				["say_r", "Now prepare to fight!"],
			],
		]],
		["set_hostile", true],
		["canEject", false],
		["do", door.close.bind(door)],
		["do", droids.forEach.bind(droids, function (d) { d.hostile = true })],
	])

	goldhawk.setDeathScript([
		["do", droids.forEach.bind(droids, function (d) { d.kill() })],
		["canEject"],
		["set_plotstate", 'act3.assaultthebase'],
		["speaker_l", "Camden"],
		["speaker_r", "Goldhawk"],
		["say_r", "Damn you, Camden! This isn't over!"],
		["clear_r"],
		["die"],
		["wait", 50],
		["say_l", "I have a feeling I haven't seen the last of him."],
		["say_l", "Anyway, I should probably get out of here."],
	])
}

setups["act3.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		GreaterFireScorpion: 16,
		NinjaSpider: 16,
		JadeBeetle: 16,
		MechDroid: 16,
		Copter: 4,
		SawDrone: 8,
		SawDronePack: 8,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([
		["change_music", OZ_MUSIC],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", ps["act3.ozfrom"]],
	])
}

setups["act4.camp"] = function (ps, m) {
	m.map = loadFixedMap("camp")
	var camden = m.addProtag([250, 250])
	m.style = 'cave'

	m.setStartScript([
		["change_music", CAMP_MUSIC],
		["if_first", 'act4.camp', [
			["speaker_l", "Camden"],
			["speaker_r", "Victoria"],
			["say_r", "Camden?"],
			["say_l", "Goldhawk has turned against us. He was with Hornchurch all along."],
			["say_l", "We can't go back to town now at all. Hornchurch's allies are surely looking for all of us."],
			["say_r", "So what do we do? I'm not staying here forever"],
			["say_l", "Well, there is one stroke of luck. Goldhawk gave away something when I found him."],
			["say_l", "He told me that Angel had been imprisoned by the Holy Robot Empire."],
			["say_r", "Angel? The horrid girl? Serves her right."],
			["say_l", "I want to rescue her."],
			["ask_r", "What?! Why?", [
				["She might help us.",
					["say_l", "Because if they imprisoned her then perhaps she's not on their side. We need allies."],
				],
				["Sweet revenge.",
					["say_l", "So I can show her that betrayal comes with a high price."],
				],
				["Love has a face.",
					["say_l", "Well, I'm fairly sure she was hitting on me at that party."],
				],
			]],
			["say_l", "Besides, there's someone else they've got I want to see."],
			["say_r", "Who?"],
			["say_l", "Your father."],
			["say_r", "Daddy?"],
			["say_l", "Yes. Get ready, we're heading out."],
			["clear_l"],
			["clear_r"],
			["speaker_r", "Putney"],
			["say_r", "..."],
		]],
		["if_plotstate", 'act4.villagecutscene', [
			["if_first", 'act4.camp.aftervillagecutscene', [
				["say_r", "Back at camp..."],
				["speaker_l", "Camden"],
				["speaker_r", "Putney"],
				["say_l", "Putney?"],
				["say_r", "Hi, Camden? Who are these people?"],
				["say_l", "This is Cockfosters and Marylebone, we're helping them out, and I need your help with that."],
				["say_r", "You do? Um... okay."],
				["say_l", "There's a monster of some kind up in the pass that stole their child. I'm going to go and distract it while you retrieve the child."],
				["ask_r", "Really? Me? Are you sure?", [
					["Absolutely", 
 						["say_l", "Yes, I know you can do this Putney. I believe in you"],
						["say_r", "Thanks, Camden. I won't let you down."],
					],
					["Lesser of two evils",
						["say_l", "Well, it's you or Victoria. I'm not spoilt for choice."],
						["say_r", "Oh."],
					],
				]],
				["say_l", "Make sure you're ready. We're heading out soon."],
				["say_r", "Let me know when you're ready."],
			]],
		]],
		["if_plotstate", 'act4.defendthevillage', [
			["if_first", 'act4.camp.aftervillage', [
				["say_r", "Back at camp..."],
				["speaker_l", "Putney"],
				["say_l", "We did it! We saved the child."],
				["speaker_r", "Marylebone"],
				["say_r", "Oh, Pancras be praised, this is a blessing."],
				["speaker_r", "Cockfosters"],
				["say_r", "Thank you, sirs. We are in your debt."],
				["speaker_l", "Camden"],
				["say_l", "It was nothing. We wanted to get across the pass anyway."],
				["say_l", "Good work, Putney."],
				["speaker_r", "Putney"],
				["say_r", "Thanks, Camden. I'm surprised at myself."],
				["speaker_r", "Victoria"],
				["say_r", "Can we go find Daddy now?"],
				["say_l", "Yes we can. Once we're over the mountains it'll be clear paths to our destination."],
				["say_r", "Good, I'll be waiting once you're ready."],
			]],
		]],
	])
				
	m.actorTalkScript([
		["speaker_r", "Putney"],
		["if_plotstate", 'act4.villagecutscene', [
			["if_plotstate", 'act4.defendthevillage', [
				["if_first", "act4.putney.aftervillage", [
					["say_r", "Thanks, Camden. I feel like I'm part of things."],
				]],
				["ask_r", "Need anything?", [
					["Outer Zones",
						["say_l", "Sure thing."],
						["change_scene", "act4.ozmission"],
					],
					["Leave",
					],
				]],
			], [
				["say_r", "I guess I'm ready when you are."],
				["ask_r", "What do you need?", [
					["Save the baby",
						["say_r", "... Okay."],
						["change_scene", "act4.defendthevillage"],
					],
					["Outer Zones",
						["say_r", "Okay."],
						["change_scene", "act4.ozmission"],
					],
					["Nothing",
					],
				]],
			]],
		], [
			["say_r", "I'm sorry about Goldhawk, Camden."],
			["ask_r", "Need anything?", [
				["Outer Zones",
					["say_l", "Sure thing."],
					["change_scene", "act4.ozmission"],
				],
				["Leave",
				],
			]],
		]],
	], [250, 450], "Putney", null, 270)
			
	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Victoria"],
		["if_plotstate", 'act4.villagecutscene', [
			["if_plotstate", 'act4.defendthevillage', [
				["ask_r", "Ready to go save my dad?", [
					[ "Yes",
						["say_l", "Let's go then."],
						["change_scene", "act4.savetheprince"],
					],
					["Not yet",
						["say_l", "Well, hurry up!"],
					],
				]],
			], [
				["say_r", "Hmph, sharing my cave with peasants..."],
			]],
		], [
			["say_r", "I'm ready when you are."],
			["ask_r", "Ready to go?", [
				["Yes",
					["change_scene", "act4.villagecutscene"],
				],
				["No",
				],
			]],
		]],
	], [250, 350], "Victoria", null, 270)

	if (ps['act4.defendthevillage']) {
		m.actorTalkScript([
			["speaker_r", "Cockfosters"],
			["say_r", "Thanks for helping us."],
			["if_plotstate", 'act4.cockfosters.questdone', [
			], [
				["if_first", "act4.cockfosters.quest", [
					["say_r", "I used to work in a mine, so believe me when I say this cave is structurally unsound."],
					["say_r", "I could build some supports for you, but I'll need some materials. Say, 64 bismuth?"],
				], [
					["say_r", "I'll need some bismuth if you want those supports."],
				]],
				["if_has_metal", "Bismuth", 64, [
					["ask_l", "Shall I give Cockfosters 64 bismuth?", [
						["Yes",
							["set_plotstate", 'act4.cockfosters.questdone'],
							["change_metal", -64, "Bismuth"],
							["say_r", "Excellent, I'll get these up in no time."],
						],
						["No",
						],
					]],
				]],
			]],
		], [450, 450], "Cockfosters", null, 270)

		m.actorTalkScript([
			["speaker_r", "Marylebone"],
			["say_r", "Thank you for your help."],
		], [550, 450], "Marylebone", null, 270)
	}

	m.actorTalkScript([
		["speaker_r", "Cutty Sark"],
		["ask_r", "Quack quack quack quack, quack quack?", [
			["Save",
				["save"],
				["say_r", "Saved."],
			],
			["Cancel",
			],
		]],
	], [640, 170], "Cutty Sark", null, 295)

	m.actorTalkScript([
		["speaker_r", "Canary Wharf"],
		["say_r", "Quack quack quack! Quack, quack quack quack!"],
		["inventory"],
	], [625, 125], "Canary Wharf", null, 350)
}

setups["act4.villagecutscene"] = function (ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])

	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["set_plotstate", 'act4.villagecutscene'],
		["blank"],
		["freeze", 10],
		["speaker_l", "Camden"],
		["speaker_r", "Victoria"],
		["say_r", "Camden, this is a peasant village."],
		["say_l", "Yes, I know."],
		["say_r", "But I'm a princess."],
		["say_l", "We need to scout out the pass before we can cross. The best way to do that is to ask the locals."],
		["say_r", "But they're peasants, what will they know?"],
		["say_l", "A lot, I hope."],
		["say_r", "I don't think that-"],
		["clear_r", ],
		["say_r", "Eeeeeeeeeek!"],
		["say_l", "Who was that?"],
		["speaker_r", "Marylebone"],
		["say_r", "It's taken our baby! The demon has taken our baby!"],
		["say_r", "Cockfosters, our baby is gone. Baby Goodge, he's been taken by the demon!"],
		["speaker_r", "Cockfosters"],
		["say_r", "Egads! What'll we do?"],
		["say_l", "Excuse me, but what is this demon?"],
		["speaker_r", "Marylebone"],
		["say_r", "Oh, it's a foul thing and no mistake! Vile and horrid! It lives up on the pass and it'll come down and preys on us poor village folk!"],
		["say_l", "We shall defeat this monster and retrieve your child."],
		["speaker_r", "Victoria"],
		["say_r", "We shall?"],
		["say_l", "Well, I shall."],
		["say_r", "Look, we're supposed to be finding my daddy."],
		["say_l", "That'll be more quickly accomplished if we can cross the mountains. Besides, we'd be helping out these villagers."],
		["say_r", "They're peasants, Camden..."],
		["say_l", "And?"],
		["say_r", "..."],
		["say_l", "Come on, we should go back to camp first, I'll need Putney's help."],
		["speaker_r", "Cockfosters"],
		["say_r", "Oh, thank you, sir."],
		["change_scene", 'act4.camp'],
	])
}
  
setups["act4.defendthevillage"] = function (ps, m) {
	m.map = loadFixedMap('openarea')
	camden = m.addProtag([897, 685])
	
	m.setStartScript([
		["change_music", LO_BOSS_MUSIC],
		["blank", ],
		["say_l", "On the mountain pass..."],
		["speaker_l", "Camden"],
		["say_l", "This must be it, but I don't see-"],
		["say_r", "DEEEEEATH..."],
		["say_l", "What was that?"],
		["say_r", "DEEEEEATH..."],
		["say_l", "I don't see-"],
		["speaker_r", "Hyde"],
		["say_r", "DEEEEEATH..."],
		["say_l", "Oh, now I see."],
		["say_l", "Okay Putney, don't let me down..."],
		["say_l", "Here I come!"],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act4.camp"],
	])
	
	m.enemyDeathScript([
		["die"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "I defeated it... That seems too easy."],
		["say_l", "Shouldn't complain, I guess."],
		["set_plotstate", 'act4.defendthevillage'],
		["canEject"],
	], "Hyde", [1111, 730], 200)
}

setups["act4.savetheprince"] = function (ps, m) {
	m.map = makeDungeon2({
		left: 'entry_left',
		right: 'grid',
	})
	var camden = m.addProtag(m.map.leftPos([96, 96]))
	
	m.placeEnemiesRandomlyAnywhere({
		JusticeDrone: 16,
		Copter: 32,
		RailgunTank: 32,
		RocketTank: 32,
	})

	m.setStartScript([
		["change_music", MISSION_MUSIC],
		["speaker_l", "Camden"],
		["say_l", "Right, here I go."],
		["sound", "radio"],
		["say_r", "I hope you can save Daddy, Camden!", "Victoria"],
		["ask_l", "What shall I say?", [["Don't worry!"], ["So do I."], ["Anything for you."]]],
	])

	m.canEject = true
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act4.camp"],
	])

	var door_in = m.entities.add(makeScenery("BlastDoor", m, m.map.rightPos([1050, 50]), 0, true))
	var door_out = m.entities.add(makeScenery("BlastDoor", m, m.map.rightPos([1750, 750]), 90, false))
	
	var cnl = m.addEnemy("ChalfontAndLatimer", m.map.rightPos([1100, 700]), 270)
	cnl.hostile = false
	cnl.setDeathScript([
		["die"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "Well, those two were full of surprises."],
		["say_l", "Now, time to see if I can find Angel and the Prince Regent."],
		["do", door_out.open.bind(door_out)],
	])

	camden.addAreaScript([
		["wait", 50],
		["set_plotstate", 'act4.savetheprince'],
		["set_plotstate", 'act', 5],
		["addWeaponSlot"],
		["change_scene", 'act5.intro'],
	], m.map.rightPos([1650, 750]), [200,200])

	camden.addAreaScript([
		["speaker_l", "Camden"],
		["say_l", "You!"],
		["speaker_r", "Chalfont"],
		["say_r", "B'deeeee zzzzt zzp skreeeeeeow piiiii!"],
		["speaker_r", "Latimer &"],
		["say_r", "And here returns the prodigal son to slay our fatted calf."],
		["speaker_r", "Chalfont"],
		["say_r", "Prrrrrrrrrrr dipdipdip bee bee beeeeeeee pzow!"],
		["speaker_r", "Latimer &"],
		["say_r", "Well, no, my lord, but I felt it appropriate."],
		["say_r", "Corporal Camden of the Order of Knightsbridge, I am hereby relieving you of your rank with immediate notice."],
		["say_l", "What?"],
		["say_r", "You heard me. You are hereby returned to civilian status, effective immediately."],
		["say_l", "Since when can you do that?"],
		["say_r", "You will find, ex-Corporal Camden, that the Holy Robot Empire holds a great deal of influence in a great many circles."],
		["say_r", "Fortunately it seems that the Prince Regent has finally decided to acknowledge our great and bountiful wisdom ..."],
		["say_r", "And has abdicated his gubernatorial responsibilities to His Holiness the Robo-Pope."],
		["say_l", "Enough of the florid language, sub-Inquisitor. You and I know that this was a coup d'etat, plain and simple."],
		["speaker_r", "Chalfont"],
		["say_r", "Pdbdbdbd prrr beee eee beeee!"],
		["speaker_r", "Latimer &"],
		["say_r", "Most eloquently put, my lord. History will bear us out, ex-Corporal. But you will not be there to see it."],
		["say_l", "Ha! I beat you handily last time, you unholy double-act, and I'll do it again!"],
		["say_r", "I see the folly of youth knows no bounds. Prepare to face our full fury!"],
		["speaker_l", "Latimer"],
		["speaker_r", "Chalfont"],
		["change_music", LO_BOSS_MUSIC],
		["say_l", "Inquisitorial and Robo-Cardinal digitally-enhanced combat mode activation sequence ..."],
		["say_l", "... combine and transform!"],
		["say_r", "Skreeeow!"],
		["speaker_l", "Camden"],
		["speaker_r", "Chalfont/Latimer Fusion"],
		["say_l", "What the ..."],
		["do", (function () { this.hostile = true }).bind(cnl)],
		["do", door_in.close.bind(door_in)],
	], m.map.rightPos([600, 150]), [1000, 1000])
}

setups["act4.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		JusticeDrone: 16,
		SupportCopterPack: 8,
		RailgunTank: 16,
		RocketTank: 8,
		PincerTank: 16,
		MoonSpider: 16,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([["change_music", OZ_MUSIC]])
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act4.camp"],
	])
}

setups["act5.town"] = function (ps, m) {
	makeTown(m)
	var camden = m.addProtag([1051, 401])
	camden.bearing = 275

	m.setStartScript([  // plot dump - seriously needs rewriting
		["change_music", TOWN_MUSIC],
		["if_first", "act5.plotdump", [
			["speaker_l", "Camden"],
			["speaker_r", "Great Portland"],
			["say_r", "... well, we seem to be in a very grave situation."],
			["say_r", "The safe return of Prince Regent is something of a blessing, but nonetheless we have little cause to rejoice."],
			["say_r", "According to Hammersmith's scouts, Robo-Pope Hornchurch has taken the Charing Cross and headed deep into the blasted wastes of the Outer Zones."],
			["say_r", "I cannot be certain of his precise intention..."],
			["say_r", "... but I fear that he may intend to release the seal on the ancient Tomb of St. Pancras itself."],
			["say_l", "Unseal the Tomb of St. Pancras?"],
			["say_l", "But that would be the utmost heresy! What could he possibly have to gain from doing that?"],
			["say_r", "There is a rumour which continues to resurface among those who deal in forbidden magicks concerning the Tomb of St. Pancras."],
			["say_r", "A rumour never spoken, yet often whispered."],
			["say_r", "It is said that St. Pancras had some powerful item sealed within the tomb, which would bring great power to any brave enough to break the seal."],
			["say_r", "Brave ... or foolish."],
			["speaker_l", "Victoria"],
			["say_l", "And is it true?"],
			["say_r", "True?"],
			["say_r", "Is it true?"],
			["say_r", "Whether or not it is true that St. Pancras had a powerful magical item sealed within his tomb is entirely immaterial!"],
			["say_r", "The unsealing of the Tomb of St. Pancras would be a cosmological event akin to the sinking of Atlantis or the extinction of the humans!"],
			["say_r", "I do not know whether Robo-Pope Hornchurch knows this; he may be misled, or simply very, very foolish."],
			["speaker_l", "Camden"],
			["say_l", "But if he unseals the tomb, it could unleash some kind of disaster?"],
			["say_r", "Oh, no, my boy."],
			["say_r", "Ah, I should have known better than to expect one so young to appreciate the gravity of the situation."],
			["say_r", "Unsealing the tomb will most certainly unleash a great many kinds of disaster!"],
			["say_l", "Right."],
			["say_l", "Then we have to stop him!"],
			["speaker_r", "Victoria"],
			["say_r", "Stop him how?"],
			["say_l", "We'll do whatever it takes."],
			["speaker_r", "Great Portland"],
			["say_r", "Robo-Pope Hornchurch is a powerful and dangerous creature."],
			["say_r", "If he thinks you are an obstacle to his plans, he will not hesitate to remove you."],
			["say_r", "Are you brave enough to face him?"],
			["ask_l", "", [["I know no fear."], ["My wits will see me through."], ["My friends are my shield."]]],
			["say_r", "You are strong."],
			["say_r", "However, even the strongest warrior cannot pass through the furthest Outer Zones unaided."],
			["say_r", "Hornchurch carries the Charing Cross, which will shield him from harm."],
			["say_r", "But even one such as you would not pass through unshielded."],
			["ask_l", "", [["There must be something we can do!"], ["If this is the end, I'll face it with dignity."]]],
			["say_r", "This is something that I did not expect that I would ever do."],
			["say_r", "However, given the circumstances, and your most peculiar resolve ... I think it is fitting that I bequeath this to you."],
			["say_l_unlabelled", "Received the KING'S CROSS."],
			["say_r", "Carry that with you, and you may be able to pursue Robo-Pope Hornchurch through the Outer Zones."],
			["say_r", "Young Camden, the fate of all our people now rests with you."],
			["speaker_l", "Camden"],
			["say_l", "Thank you, Great Portland. I won't let you down."],
			["say_r", "I am confident that you will not."],
			["say_r", "Speak to me when you are ready to depart."],
		]],
	])

	m.actorTalkScript([
		["speaker_r", "Putney"],
		["say_r", "You're very brave, Camden."],
		["ask_r", "Do you want to go to the Outer Zones?", [
			["Yes",
				["change_scene", "act5.ozmission"],
			],
			["No"],
		]],
	], [1653, 1736], "Putney", null, 270)

	if (ps['angel.rescued']) {
		m.actorTalkScript([
			["speaker_r", "Angel"],
			["speaker_l", "Camden"],
			["say_r", "You chose to rescue me even after what I did to you, Camden."],
			["say_r", "I won't forget that."],
		], [43, 725], "Angel", null, 325)
	}
		
	m.actorTalkScript([
		["speaker_r", "Victoria"],
		["speaker_l", "Camden"],
		["say_l", "So you're a princess?"],
		["say_r", "Hadn't you heard?"],
	], [1156, 399], "Victoria", null, 261)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Great Portland"],
		["say_r", "This is the final battle, young Camden. After this point, there can be no turning back."],
		["ask_r", "Are you ready?", [
			["I'm ready.", 
				["change_scene", "act5.bossfight1"],
			],
			["I need more time."],
		]],
	], [1088, 280], "Great Portland", null, 90, 45)

	m.actorTalkScript([
		["speaker_r", "Hammersmith"],
		["ask_r", "What can I get you, son?", [
			["Inventory",
				["inventory"],
			],
			["Leave"],
		]],
	], [1453, 2057], "Hammersmith", null, 270)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Harlesden"],
		["say_r", "Would you like a backrub?"],
	], [970, 1800], "Harlesden", null, 290)

	m.actorTalkScript([
		["speaker_r", "Cutty Sark"],
		["ask_r", "Quack quack quack quack, quack quack?", [
			["Save", 
				["save"],
				["say_r", "Saved."],
			],
			["Cancel"],
		]],
	], [940, 1090], "Cutty Sark", null, 289)

	m.actorTalkScript([
		["speaker_l", "Camden"],
		["speaker_r", "Gospel"],
		["say_r", "Blessings of St. Pancras be upon you."],
	], [768, 134], "Father Gospel", null, 270)

	ps["act5.superdungeon.next"] = ps["act5.superdungeon.next"] || 1
	if (ps['act5.superdungeon.next'] < 101) {
		m.actorTalkScript([
			["speaker_l", "Camden"],
			["speaker_r", "Pimlico"],
			["say_r", "I once killed a man just to watch him die!"],
			["say_l", "You're just messing with me, aren't you?"],
			["say_r", "..."],
			["say_l", "Well, I hope you're just messing."],
			["say_r", "I've found a cave with some really tough enemies in. Do you want to come explore it with me?"],
			["ask_r", "Shall we go?", [
				["With you? Of course!",
					["change_scene", "act5.superdungeon"],
				],
				["Helpful as your tips have been, I'm not sure I'm ready for this."],
			]],
		], [1533, 664], "Pimlico", null, 312)
	}
}

setups["act5.intro"] = function (ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])
	
	m.setStartScript([
		["blank"],
		["speaker_l", "Camden"],
		["say_l", "Angel? Angel!"],
		["speaker_r", "Angel"],
		["say_r", "Camden!"],
		["say_r", "What are you doing here?"],

		["set_plotstate", "sweetheart", "Victoria"],
		["ask_l", "", [
			["I'm here to save you.",
				["say_r", "Me? Why?"],
				["ask_l", "", [
					["I believe in second chances.",
						["set_plotstate", "whyrescue", "secondchance"],
					],
					["Because I love you.",
						["set_plotstate", "whyrescue", "love"],
					],
					["I lied. I'm actually here for Prince Regent.",
						["set_plotstate", "whyrescue", "regent"],
					],
				]],
			],
			["I'm here to save Prince Regent.",
				["set_plotstate", "whyrescue", "regent"],
			],
		]],

		["if_eq_plotstate", "whyrescue", "regent", [
			["say_r", "What, this old lunatic?"],
			["speaker_r", "Regent"],
			["say_r", "Hello, moonbeams!"],
			["speaker_l", "Victoria"],
			["say_l", "Daddy!"],
			["say_r", "Good afternoon, my splendid seeker after truths and teeth."],
			["speaker_r", "Angel"],
			["say_r", "That's why you fought your way in here?"],
			["say_l", "Shut up, you."],
			["speaker_l", "Camden"],
			["ask_l", "", [
				["Sorry about her, Angel.",
					["ask_r", "So, are you going to take me with you as well?", [
						["Yes",
							["say_r", "Thank you, Camden. I really am sorry for what I've done."],
							["set_plotstate", "angel.rescued"],
						],
						["Sorry",
							["say_l", "Sorry, Angel. I can't forgive you so easily."],
							["say_r", "Would it help if I apologised?"],
							["say_l", "No."],
							["clear_l"],
							["say_r", "Hey, wait! Hey! Come back! Camden!"],
						],
					]],
				],
				["Shut up, Angel.",
					["say_r", "Camden! I can't believe you. Wandering around with this brainless princess trying to save her lunatic father!"],
					["speaker_r", "Victoria"],
					["say_r", "Hey, I'm not the one who betrayed her so-called 'friends'."],
					["speaker_r", "Angel"],
					["say_r", "Yeah, well, I didn't..."],
					["speaker_l", "Regent"],
					["say_l", "Interjection! There's no such word as didn't, except in very expensive dictionaries."],
					["say_r", "..."],
					["speaker_r", "Victoria"],
					["say_r", "..."],
					["speaker_l", "Camden"],
					["speaker_r", "Angel"],
					["ask_r", "So, are you going to get me out of here, too?", [
						["Yes",
							["say_r", "Well, at least that's something. Let's get going."],
							["set_plotstate", "angel.rescued"],
						],
						["(Leave)",
							["clear_l"],
							["say_r", "... Hey! Camden! Come back here!"],
							["say_r", "Please come back..."],
						],
					]],
				],
			]],
		]],
		["if_eq_plotstate", "whyrescue", "secondchance", [
			["say_r", "So does that mean you're getting me out of here?"],
			["say_l", "Yes, you and Prince Regent as well."],
			["speaker_r", "Regent"],
			["say_r", "And well you might, or at least, you might as well."],
			["set_plotstate", "sweetheart", "Angel"],
			["set_plotstate", "angel.rescued"],
		]],
		["if_eq_plotstate", "whyrescue", "love", [
			["say_r", "..."],
			["speaker_r", "Victoria"],
			["say_r", "..."],
			["speaker_r", "Angel"],
			["say_r", "You... you do?"],
			["say_l", "..."],
			["speaker_r", "Regent"],
			["say_r", "Well I think we've all come to a very special place."],
			["say_r", "A special place with wind chimes and matchboxes."],
			["say_r", "Now let us wend our wiggly way westwards."],
			["ask_l", "Take Angel with you?", [
				["Yes",
					["speaker_r", "Angel"],
					["say_r", "Camden..."],
					["set_plotstate", "sweetheart", "Angel"],
					["set_plotstate", "angel.rescued"],
				],
				["No",
					["speaker_r", "Angel"],
					["say_r", "Camden? I don't understand."],
					["clear_l"],
					["say_r", "Why are you leaving?"],
					["say_r", "Camden... I love you, too."],
				],
			]],
		]],
		["clear_l"],
		["freeze", 20],
		["clear_r"],
		["change_scene", "act5.town"],
	])
}

setups["act5.bossfight1"] = function (ps, m) {
	m.map = loadFixedMap("clearing")
	var camden = m.addProtag([1000, 234])
	m.canEject = false
	
	m.setStartScript([
		["change_music", null],
		["blank"],
		["say_l", "Protected by the King's Cross, Camden treks for many miles across the impossible wastelands of the Outer Zones."],
		["speaker_l", "Camden"],
		["say_l", "It can't be far now."],
		["say_l", "I think that must be the tomb of St. Pancras just ahead."],
		["say_r", "Not so fast, soldier."],
		["say_r", "This is as far as you go."],
		["say_l", "Goldhawk!"],
		["blank", false],
		["change_music", LO_BOSS_MUSIC],
		["speaker_r", "Goldhawk"],
		["say_r", "Yes, Camden, I'm still alive."],
		["say_l", "I can't believe you're protecting the Robo-Pope, Goldhawk."],
		["say_l", "Don't you understand what it is he plans to do?"],
		["say_l", "Won't you die along with everyone else if he brings his plans to fruition?"],
		["say_r", "You're still so naive, Camden."],
		["say_r", "I'm here to protect his Holiness. That's all that matters."],
		["say_l", "I wish it didn't have to be this way, Goldhawk. But I have a job to do, for the sake of all my friends."],
		["say_r", "And you'll die doing it!"],
	])

	m.enemyDeathScript([
		["die_no_drop"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "Goldhawk ..."],
		["say_l", "Why wouldn't you listen to me?"],
		["say_l", "Well, I've come this far."],
		["say_l", "Time to confront the Robo-Pope himself."],
		["clear_l"],
		["freeze", 10],
		["blank"],
		["freeze", 10],
		["change_scene", "act5.bossfight2"],		
	], "GoldhawkReloaded", [1000, 456], 270)
}

setups["act5.bossfight2"] = function (ps, m) {
	m.map = loadFixedMap("crypt")
	var camden = m.addProtag([750, 234])
	m.canEject = false

	m.setStartScript([
		["change_music", LO_BOSS_MUSIC],
		["speaker_l", "Camden"],
		["say_l", "Stop right there!"],
		["say_l", "I won't let you unseal the tomb!"],
		["say_l", "Whatever it is you think you stand to gain from it, you're wrong!"],
		["speaker_r", "Hornchurch"],
		["say_r", "What confidence you have."],
		["say_r", "I might ask how you presume to know what it is I expect to accomplish here."],
		["say_r", "But frankly, I don't care. In mere moments, the seal will open and the ultimate power of St. Pancras will flow into me!"],
		["say_r", "Prepare to bow down before your new god!"],
	])

	m.enemyDeathScript([
		["die_no_drop"],
		["wait", 50],
		["speaker_l", "Camden"],
		["say_l", "Is he ..."],
		["say_l", "Is he dead?"],
		["say_l", "It feels like whatever he was trying to do... is still going on..."],
		["say_l", "In fact..."],
		["clear_l"],
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act5.bossfight3"],
	], "Hornchurch", [250, 550], 270)
}

setups["act5.bossfight3"] = function (ps, m) {
	m.map = loadFixedMap("plane")
	var camden = m.addProtag([450, 50])
	m.canEject = false

	m.setStartScript([
		["change_music", null],
		["blank"],
		["speaker_l", "Camden"],
		["say_l", "Where am I?"],
		["say_l", "What's going on?"],
		["say_l", "And what in the world..."],
		["change_music", HI_BOSS_MUSIC],
		["speaker_r", "Pancras happy"],
		["say_r", "I AM ALPHA."],
		["say_r", "I AM OMEGA."],
		["say_r", "I AM THE GLORIOUS ARC OF THE UNIVERSE AND I AM THE MOTE IN A PROTON'S EYE."],
		["say_r", "FINALLY THE SEAL IS BROKEN."],
		["speaker_r", "Pancras angry"],
		["say_r", "FINALLY I AM FREED TO RULE AGAIN."],
		["say_r", "ALL WILL BEND TO MY WILL..."],
		["say_r", "OR BE BROKEN AT MY COMMAND!"],
		["speaker_r", "Pancras happy"],
		["say_l", "You expect us to bow down before you?"],
		["speaker_r", "Pancras angry"],
		["say_r", "OBEY OR YOU WILL BE CRUSHED!"],
		["say_l", "Never!"],
		["say_l", "I, Camden, on behalf of the people of this world, stand before you now and I say: We will not surrender!"],
		["say_l", "We will not be destroyed!"],
		["say_r", "YOU DARE DEFY ME?"],
		["say_r", "TASTE MY WRATH!"],
	])

	m.enemyDeathScript([
		["speaker_r", "Pancras angry"],
		["speaker_l", "Camden"],
		["say_r", "I DON'T UNDERSTAND... HOW ARE YOU STILL ALIVE?"],
		["say_l", "My resolve is far stronger than you can imagine."],
		["say_l", "Only Death can stop me, but not before he stops you too!"],
		["say_r", "FOOLISH MACHINE... YOU THINK I CAN BE BEATEN? YOU ARE MORTAL!"],
		["say_r", "YOU WILL SUCCUMB TO RUST AND CRUMBLE INTO THE EARTH BEFORE THE SLIGHTEST OF MY STRENGTH BEGINS TO WANE."],
		["say_l", "(He's right, I've been fighting for so long, and he seems barely fatigued! There must be a way to finish this...)"],
		["if_eq_plotstate", "sweetheart", "Angel", [
			["speaker_r", "Angel"],
			["say_r", "Camden. Listen to my voice."],
			["say_l", "Angel? Angel!"],
			["say_r", "Camden, I am not Angel. But I am everything you love in her."],
			["say_l", "You're what?"],
			["say_r", "Your love, Camden. Every ounce of it embodied."],
			["say_r", "Now you must focus, there is so much at stake but everything to gain."],
			["say_r", "Take your love for Angel and the world and all the robots within it."],
			["say_l", "What is this power I can feel?"],
			["say_r", "That is your gift, Camden. Now unleash it! Unleash your passion!"],
			["say_l", "..."],
			["say_l", "For this world, and everyone in it. For the skies and the seas, for every creature..."],
			["say_l", "AND FOR ANGEL, I VANQUISH YOU!"],
		]],
		["if_eq_plotstate", "sweetheart", "Victoria", [
			["speaker_r", "Victoria"],
			["say_r", "Camden! I demand you hear me!"],
			["say_l", "Victoria? But... how?"],
			["say_r", "I am not Victoria, Camden. I merely manifest your love for her."],
			["say_l", "You manifest my... hey, what is this?"],
			["say_r", "Focus, child. Focus on your love."],
			["say_l", "Focus?"],
			["say_r", "Yes, and quickly! Focus on everything you love in this world. Focus on all the good things that are worth fighting for."],
			["say_r", "Focus on Victoria. Gather your love of all things deep within you..."],
			["say_l", "What is this power I can feel?"],
			["say_r", "Your gift, child. Now unleash it! Unleash your love!"],
			["say_l", "..."],
			["say_l", "For this world, and everyone in it. For the skies and the seas, for every creature..."],
			["say_l", "AND FOR VICTORIA, I VANQUISH YOU!"],
		]],
		["speaker_r", "Pancras angry"],
		["say_r", "Aaaaaarrrrrggghhhh!"],
		["die_no_drop"],
		["clear_r"],
		["blank"],
		["say_l", "I've won..."],
		["freeze", 40],
		["change_scene", "finale"],
	], "StPancras", [450, 450], 270)
}

setups["act5.ozmission"] = function (ps, m) {
	m.map = makeDungeon1()
	m.addProtagAnywhere()
	m.placeEnemiesRandomlyAnywhere({
		InjusticeDrone: 16,
		GiantBladeDrone: 16,
		FlameAvatar: 16,
		TerrorTank: 16,
		WarChopper: 16,
		CombatDroidZero: 16,
		VarietySpiderPack: 8,
	})
	m.canEject = true
	m.isTimed = true
	
	m.setStartScript([["change_music", OZ_MUSIC]])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act5.town"],
	])
}
	
setups["act5.superdungeon"] = function (ps, m) {
	m.map = loadFixedMap("clearing")
	var camden = m.addProtag([900, 234])

	var div = Math.floor(ps['act5.superdungeon.next'] / 10)
	var rem = ps['act5.superdungeon.next'] % 10
	if (rem == 0) {
		m.canEject = true
		var pimlico = makeEnemy("Pimlico", m, [1000, 234], 180)
		pimlico.hostile = false
		m.entities.add(pimlico)
		pimlico.setTalkScript([
			["speaker_l", "Camden"],
			["speaker_r", "Pimlico"],
			["say_r", "Well done!"],
			["if_eq_plotstate", "act5.superdungeon.next", 100, [
				["say_r", "No-one's ever made it this far with me before!"],
				["change_music", HI_BOSS_MUSIC],
				["say_r", "That will make your soul all the tastier!!"],
				["set_hostile", true],
				["canEject", false],
			], [
				["ask_r", "Ready to keep going?", [
					["Of course!",
						["increment_plotstate", 'act5.superdungeon.next'],
						["say_r", "I'll see you further down..."],
						["change_scene", "act5.superdungeon"],
					],
					["Inventory",
						["inventory"],
					],
					["Not yet.",
						["say_r", "Maybe later then..."],
					],
				]],
			]],
		])
		pimlico.setDeathScript([
			["die_no_drop"],
			["drop_weapon", "SpiderThrower"],
		])
	} else {
		var enemygroups = [
			["Spider", "Scorpion", "MiniTank", "StagBeetle", "SpikeDrone"],
			["BladeDrone", "SpiderQueen", "FireScorpion", "MachineGunTank"],
			["DrillTank", "HeavyTank", "SentryDroid", "GreaterFireScorpion"],
			["JadeBeetle", "NinjaSpider", "Bat", "Monument"],
			["MechDroid", "SawDrone", "Copter", "Arsenal"],
			["RailgunTank", "RocketTank", "JusticeDrone", "PincerTank", "MoonSpider"],
			["InjusticeDrone", "TerrorTank", "FlameAvatar"],
			["TerrorTank", "CombatDroidZero", "WarChopper"],
			["InjusticeDrone", "TerrorTank", "FlameAvatar", "TerrorTank", "CombatDroidZero", "WarChopper"],
			["SuperRocketTank", "Arachne", "AssassinDroid", "NinjaDrone"],
		]
	
		for (var i = 0 ; i < rem ; ++i) {
			var etype = UFX.random.choice(enemygroups[div])
			m.entities.add(makeEnemy(etype, m, [750, 50 + (100 * i)], 0))
		}
		m.canEject = false
	}
   
	m.setStartScript([
		["change_music", OZ_MUSIC],
		["say_l", "Level " + ps['act5.superdungeon.next']],
	])
	
	m.setClearScript([
		["increment_plotstate", 'act5.superdungeon.next'],
		["wait", 45],
		["if_plotstate_counter", 'act5.superdungeon.next', 101, [
			["speaker_l", "Camden"],
			["say_l", "Okay, seriously."],
			["say_l", "Who on earth was she?"],
			["canEject", true],
		], [
			["speaker_r", "Pimlico"],
			["say_r", "Well done, keep coming..."],
			["add_xp", 1 << (12+div)],
			["wait", 25],
			["change_scene", "act5.superdungeon"],
		]],
	])
	
	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["change_scene", "act5.town"],
	])
}

setups["finale"] = function (ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])
	
	m.setStartScript([
		["change_music", MENU_MUSIC],
		["blank"],
		["freeze", 40],
		["speaker_l", "Camden"],
		["say_l", "Hi, there. My name's Camden."],
		["say_l", "Of course, you know that already. I just wanted to say thanks for playing the game."],
		["say_l", "I'm assured that it was a lot of fun creating. I'm even told that this game and its engine may see updates or improvements in the future."],
		["say_l", "So stay tuned. Oh and pay attention after the credits to find out what we characters are up to."],
		["clear_l", ],
		["say_l", "Hi there, I did loads of hacking on the combat and scripting engines and wrote a bunch of content.", "Adam Biltcliffe"],
		["say_r", "Hi, I did programming. Especially SVG code the scripting engine.", "Martin O'Leary"],
		["say_l", "Hi, I drew everything! I hope you liked it!", "Carrie Oliver"],
		["say_r", "Hey, I programmed all the interface components and scripted lots of content.", "Richard Thomas"],
		["say_l", "I wrote item generation and did game balance.", "John-Joseph Wilks"],
		["say_r", "I ported the game to JavaScript.", "Christopher Night"],
		["say_l_unlabelled", "Also thanks to Kevin MacLeod (incompetech.com), for all the game music..."],
		["say_l_unlabelled", "... Thanks to Tom Murphy for the in-game font which we liked."],
		["say_l_unlabelled", "... And thanks to David Birch for some bug testing."],
		["say_l_unlabelled", "Special thanks to Richard Jones for organising PyWeek."],

		["speaker_l", "Cockfosters"],
		["clear_r", ],
		["say_r", "Cockfosters eventually moved to the city and got a job as a mining safety consultant."],

		["speaker_r", "Marylebone"],
		["clear_l", ],
		["say_l", "Marylebone works in a seedy bar, but manages to pay the bills and is putting aside the money to send Baby Goodge to university."],
		
		["speaker_l", "Gospel"],
		["clear_r", ],
		["say_r", "Father Gospel became a missionary and now lives in the Caribbean."],

		["speaker_r", "Harlesden"],
		["clear_l", ],
		["say_l", "Harlesden eventually got tenure and now carries on an illicit affair with his beautiful young lab assistant."],

		["speaker_l", "Hammersmith"],
		["clear_r", ],
		["say_r", "Hammersmith decided he was becoming soft after years away from the front line, and so now works as a drugs education outreach worker in schools."],

		["speaker_r", "Chalfont & Latimer"],
		["clear_l", ],
		["say_l", "Chalfont and Latimer survived the collapse of the Holy Robot Empire and took the semi-professional ten-pin bowling world by storm."],

		["speaker_l", "Great Portland"],
		["clear_r", ],
		["say_r", "Great Portland eventually found a publisher for his crime novel and now writes regularly under the pseudonym of Temperance Brennan."],

		["speaker_r", "Putney"],
		["clear_l", ],
		["say_l", "Putney finally found his place in life as an entertainer for children's parties."],

		["speaker_l", "Regent"],
		["clear_r", ],
		["say_r", "Prince Regent went back to Philadephia to live with his mother."],

		["if_plotstate_counter", 'act5.superdungeon.next', 101, [
			["speaker_r", "Pimlico"],
			["clear_l", ],
			["say_l", "Pimlico fled to a secret base in the jungles of South America, where she plots to one day rule the world."],
		], [
			["speaker_r", "Pimlico"],
			["clear_l", ],
			["say_l", "Pimlico is now in secondary school. Her teachers report that she is doing very well, especially in drama and creative writing."],
		]],

		["if_eq_plotstate", 'sweetheart', 'Angel', [
			["speaker_l", "Victoria"],
			["clear_r", ],
			["say_r", "Victoria is now Princess Regina, and her rule is perhaps a little less haphazard than her father's."],
		], [
			["if_plotstate", 'angel.rescued', [
				["speaker_l", "Angel"],
				["clear_r", ],
				["say_r", "Angel went back to the dig site. The revelation of St. Pancras changed a lot, and there was much to learn."],
			], [
				["speaker_l", "Angel"],
				["clear_r", ],
				["say_r", "Angel was never heard from again..."],
			]],
		]],

		["speaker_r", ps['sweetheart']],
		["speaker_l", "Camden"],
		["say_l", "And as for us... that's another story."],
		["freeze", 20],
		["clear_r", ],
		["freeze", 30],
		["clear_l", ],
		["say_l", "Fin."],
		["clear_l", ],
		["freeze", 20],
		"endGame",
	])
}









function CombatStats(attack, defence, hp, speed) {
	return { attack: attack, defence: defence, maxhp: hp, speed: speed }
}

// renamed from main.control.plotstate and main.control.robotstate
var plotstate = {}

var robotstate = {
	init: function (protag_level) {
		this.name = UFX.random.word()
		this.xp = 0
		this.level = 0
		this.stats = CombatStats(
			ROBOT_INITIAL_ATTACK,
			ROBOT_INITIAL_DEFENCE,
			ROBOT_INITIAL_HP,
			ROBOT_BASE_SPEED
		)
		this.weaponslots = 2
		this.weaponry = [makeWeapon("LightLaser"), makeWeapon("LightRepairKit")]
		this.armoury = makeArmour()
		this.maxenergy = ROBOT_INITIAL_MAX_ENERGY
		if (protag_level && protag_level > 4) {
			// TODO: cheat code
		}
		this.armoury.isIdentified = true
		this.weaponry.forEach(function (weap) { weap.isIdentified = true })
		this.inventory = []
		this.metal = [0,0,0,0,0]

		if (DEBUG.testinventory) {
			for (var level = 1 ; level <= 22 ; ++level) {
				this.addItem(makeWeapon(treasuretables.getRandomWeaponSpec(level)))
				this.addItem(makeArmour.apply(null, treasuretables.getRandomArmourSpec(level)))
			}
			//for (var j = 0 ; j < 50 ; ++j) this.addItem(makeWeapon("LightLaser"))
			this.metal = [1000000, 1000000, 1000000, 1000000, 1000000]
		}
	},
	addXP: function (amt) {
		this.xp += amt
		var levelled_up = false
		// Can't use bit shift operators here - I found that out the hard way when I killed Pimlico.
		var nextlevel = 1 << LEVEL_0_EXPONENT
		for (var j = 0 ; j < this.level ; ++j) nextlevel *= 2
		while (this.xp >= nextlevel) {
			this.levelup()
			levelled_up = true
			nextlevel *= 2
		}
		return levelled_up
	},
	addMetal: function (amt, metal_name) {
		if (!metal_name) metal_name = UFX.random.choice(METALS)
		var idx = METALS.indexOf(metal_name)
		this.metal[idx] += amt
		// TODO: gamelog
	},
	changeMetal: function () { return this.addMetal.apply(this, arguments) },
	
	addItem: function (newItem) {
		this.inventory.push(newItem)
		// TODO: gamelog
	},
	canAfford: function (metals) {
		for (var j = 0 ; j < this.metal.length ; ++j) {
			if (this.metal[j] < metals[j]) return false
		}
		return true
	},
	getMetal: function (metaltype) {
		return this.metal[METALS.indexOf(metaltype)]
	},
	addMetals: function (metals) {
		for (var j = 0 ; j < this.metal.length ; ++j) {
			this.metal[j] += metals[j]
		}
	},
	removeMetals: function (metals) {
		for (var j = 0 ; j < this.metal.length ; ++j) {
			this.metal[j] -= metals[j]
		}
	},
	setWeapon: function (weapon, slotNumber) {
		if (slotNumber >= this.weaponSlots) return
		if (this.weaponry[slotNumber]) {
			this.inventory.push(this.weaponry[slotNumber])
		}
		this.weaponry[slotNumber] = weapon
		this.inventory.splice(this.inventory.indexOf(weapon), 1)
	},
	addWeaponSlot: function () {
		this.weaponslots += 1
		this.weaponry.push(null)
	},
	setArmour: function (armour) {
		if (this.armoury) {
			this.inventory.push(this.armoury)
		}
		this.armoury = armour
		this.inventory.splice(this.inventory.indexOf(armour), 1)
	},
	levelup: function () {
		this.level += 1
		// TODO: gamelog
		this.stats.attack += ROBOT_ATTACK_INCREASE
		this.stats.defence += ROBOT_DEFENCE_INCREASE
		this.stats.maxhp += ROBOT_HP_INCREASE
	},

	getAttack: function () {
		return this.stats.attack * (1 + 0.01 * this.armoury.getPercentage("attack"))
	},
	getDefence: function () {
		return this.stats.defence * (1 + 0.01 * this.armoury.getPercentage("defence"))
	},
	getMaxHP: function () {
		return this.stats.maxhp * (1 + 0.01 * this.armoury.getPercentage("hp"))
	},
	getSpeed: function () {
		return this.stats.speed * (1 + 0.01 * this.armoury.getPercentage("speed"))
	},
	getMaxEnergy: function () {
		return this.maxenergy * (1 + 0.01 * this.armoury.getPercentage("maxenergy"))
	},
	getEnergyRegen: function () {
		return 1 + 0.01 * this.armoury.getPercentage("energyregen")
	},
	getResistance: function (damageType) {
		return 1 + 0.01 * this.armoury.getResistance(damageType)
	},
}

function getstate() {
	var weaponspecs = robotstate.weaponry.map(function (w) { return w && w.getItemSpec() })
	var armourspec = robotstate.armoury.getItemSpec()
	var inventoryspecs = robotstate.inventory.map(function (i) { return i.getItemSpec() })
	return [plotstate, robotstate.xp, robotstate.level, robotstate.stats, robotstate.weaponslots,
		weaponspecs, armourspec, robotstate.maxenergy, inventoryspecs, robotstate.metal,
		robotstate.name]
}

function setstate(state) {
	plotstate = state[0]
	robotstate.xp = state[1]
	robotstate.level = state[2]
	robotstate.stats = state[3]
	robotstate.weaponslots = state[4]
	robotstate.weaponry = state[5].map(makeItem)
	robotstate.armoury = makeItem(state[6])
	robotstate.maxenergy = state[7]
	robotstate.inventory = state[8].map(makeItem)
	robotstate.metal = state[9]
	robotstate.name = state[10]
}

function savegame(slot) {
	localStorage[settings.savename + "|" + slot] = JSON.stringify(getstate())
}
function slotfilled(slot) {
	return (settings.savename + "|" + slot) in localStorage
}
function loadgame(slot) {
	setstate(JSON.parse(localStorage[settings.savename + "|" + slot]))
}
function deletesavedgame(slot) {
	delete localStorage[settings.savename + "|" + slot]
}




// I'm not trying to replicated the python version's logs here.
// These are things I think would be useful for my own balancing, etc.

function log() {
	log.record.push([Date.now()].concat([].slice.apply(arguments)))
}
log.sessionname = UFX.random.word()

log.startscene = function () {
	this.record = []
	
	this.mission = UFX.scenes.missionmode.mission
	
	this.protagweapids = robotstate.weaponry.map(function (w) { return w && w.id })

	this.weaponlogs = {}

	this("session", this.sessionname)
	this("useragent", navigator.userAgent)
	this("windowsize", window.innerWidth, window.innerHeight)
	this("settings", clone(settings))
	this("scene", plotstate.nextScene)
	this("gamestate", clone(getstate()))
	this("protagweapids", this.protagweapids)
}
log.error = function (error, url, line) {
	if (!this.record) this.record = []
	this("useragent", navigator.userAgent)
	this("settings", clone(settings))
	this("error", error, url, line)
	this.send()
}
log.damage = function (weapid, amount, target) {
	var targettype = target === this.mission.protag ? "protag" : "other"

	var key = weapid + "|" + targettype, wl = this.weaponlogs[key]
	if (!wl) {
		wl = this.weaponlogs[key] = {
			hits: 0,
			kills: 0,
			nominaldamage: 0,
			actualdamage: 0,
		}
	}
	wl.hits++
	wl.kills += amount >= target.currenthp ? 1 : 0
	wl.nominaldamage += amount
	wl.actualdamage += Math.min(amount, target.currenthp)
}

log.send = function () {
	var records = this.record.splice(0)
	if (settings.nolog) return
	var obj = {
		url: window.location.href,
		gamename: settings.gamename,
		gameversion: settings.version,
		sessionname: this.sessionname,
		statename: robotstate.name,
		records: records,
		weaponlogs: this.weaponlogs,
	}
    var req = new XMLHttpRequest()
    req.open("POST", "http://universefactory.net/tools/rawjsondump/", true)
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send("data=" + encodeURIComponent(JSON.stringify(obj)))
}




function EntityIndex(csize) {
	this.ei = {}
	this.es = {}  // All entities
	this.max_entity_radius = 0
	this.csize = csize || 1000
}
EntityIndex.prototype = {
	// This is the original function, returns an [x,y] pair
	indexForPos: function (pos) {
		return [Math.floor(pos[0]/this.csize), Math.floor(pos[1]/this.csize)]
	},
	// Convenience function that returns a single index
	indexPos: function (pos) {
		return gridn(Math.floor(pos[0]/this.csize), Math.floor(pos[1]/this.csize))
	},
	add: function (e) {
		var n = this.indexPos(e.pos)
		if (!this.ei[n]) this.ei[n] = {}
		this.ei[n][e.id] = e
		this.es[e.id] = e
		e.indices.push(this)
		this.max_entity_radius = Math.max(this.max_entity_radius, e.r)
		return e
	},
	remove: function (e) {
		var that = this
		e.indices = e.indices.filter(function (index) { return index !== that })
		delete this.ei[this.indexPos(e.pos)][e.id]
		delete this.es[e.id]
	},
	addSet: function (es) {
		for (var id in es) { this.add(es[id]) }
	},
	removeSet: function (es) {
		for (var id in es) { this.remove(es[id]) }
	},
	moveEntity: function (e, oldpos, newpos) {
		delete this.ei[this.indexPos(oldpos)][e.id]
		var n = this.indexPos(newpos)
		if (!this.ei[n]) this.ei[n] = {}
		this.ei[n][e.id] = e
	},
	entitiesAt: function (pos) {
		return this.entitiesWithin(pos, 0)
	},
	entitiesWithin: function (pos, radius) {
		var tx = pos[0], ty = pos[1], rmax = radius + this.max_entity_radius
		var cmin = this.indexForPos([tx - rmax, ty - rmax]), cxmin = cmin[0], cymin = cmin[1]
		var cmax = this.indexForPos([tx + rmax, ty + rmax]), cxmax = cmax[0], cymax = cmax[1]
		var res = {}
		for (var cx = cxmin ; cx <= cxmax ; ++cx) {
			for (var cy = cymin ; cy <= cymax ; ++cy) {
				var n = gridn(cx, cy), ei = this.ei[n]
				if (!ei) continue
				for (var id in ei) {
					var e = ei[id], dx = e.pos[0] - tx, dy = e.pos[1] - ty, dr = e.r + radius
					if (dx * dx + dy * dy < dr * dr) {
						res[id] = e
					}
				}
			}
		}
		return res
	},
	canMove: function (entity, pos, radius) {
		if (!entity.solid) return true
		// I'm reusing some code here, hope I'm doing it right!
		var es = this.entitiesWithin(pos, radius)
		for (var id in es) {
			if (es[id].solid && es[id] !== entity) return false
		}
		return true
	},
	entitiesWithinRect: function (pos, size, precise) {
		var tx = pos[0], ty = pos[1], rmax = this.max_entity_radius
		var sx = size[0], sy = size[1]
		var cmin = this.indexForPos([tx - rmax, ty - rmax]), cxmin = cmin[0], cymin = cmin[1]
		var cmax = this.indexForPos([tx + sx + rmax, ty + sx + rmax]), cxmax = cmax[0], cymax = cmax[1]
		var res = {}
		for (var cx = cxmin ; cx <= cxmax ; ++cx) {
			for (var cy = cymin ; cy <= cymax ; ++cy) {
				var n = gridn(cx, cy), ei = this.ei[n]
				if (!ei) continue
				for (var id in ei) {
					// Note: precise is always false, so let's make this a little simpler....
					var e = ei[id]
					if (e.pos[0] + e.r > tx && e.pos[0] - e.r < tx + sx + 1 &&
					    e.pos[1] + e.r > ty && e.pos[1] - e.r < ty + sy + 1) {
						res[id] = e
					}
				}
			}
		}
		return res
	},
	// applys the given function to each entity
	forEach: function (f) {
		var ids = Object.keys(this.es)
		ids.sort()
		for (var j = 0 ; j < ids.length ; ++j) {
			f.apply(this.es[ids[j]])
		}
	},
}


var nentities = 0
function Entity(mission, pos, radius, bearing, solid, name) {
	this.init(mission, pos, radius, bearing, solid, name)
}
Entity.prototype = {
	init: function (mission, pos, radius, bearing, solid, name) {
		this.id = nentities++
		this.mission = mission
		this.pos = pos
		this.r = radius
		this.bearing = bearing || 0
		this.solid = solid === undefined ? true : solid
		this.indices = []
		this.anim_state = null
		this.name = name || "???"
		this.visible = true
	},

	setPos: function (newpos) {
		for (var j = 0 ; j < this.indices.length ; ++j) {
			this.indices[j].moveEntity(this, this.pos, newpos)
		}
		this.pos = newpos
	},

	tick: function () {
	},
	
	describe: function () {
		return this.name
	},
	die: function () {
		this.mission.dead[this.id] = this
	},
}

function extend(obj, attribs) {
	var ret = Object.create(obj)
	for (var x in attribs) ret[x] = attribs[x]
	return ret
}






function Actor(mission, pos, stats, radius, bearing, hostile, name) {
	this.init(mission, pos, stats, radius, bearing, hostile, name)
}
Actor.prototype = extend(Entity.prototype, {
	isactor: true,
	init: function (mission, pos, stats, radius, bearing, hostile, name) {
		if (bearing === undefined) bearing = UFX.random(360)
		if (radius === undefined) radius = 15
		Entity.prototype.init.call(this, mission, pos, radius, bearing, true, name)
		this.stats = stats || CombatStats(1, 1, 1, 5)
		this.currenthp = this.stats.maxhp
		this.hostile = hostile
		this.dest = null
		this.scriptNodes = []
		this.scriptBearing = null
		this.name = name
		this.deathScript = null
		this.talkScript = null
		this.areaScripts = []
		var r = this.resistances = {}
		mod.rskeys.forEach(function (rskey) { r[Damage[rskey]] = 0 })
		
		this.pendingDamage = 0
		this.pendingDamageCtr = 0
		
		this.setDeathScript([["die"]])
	},

	setTalkScript: function (spec) {
		this.talkScript = new Script(spec, this.mission, this)
	},
	addAreaScript: function (spec, pos, size, multifire) {
		this.areaScripts.push({
			pos: pos,
			size: size,
			x0: pos[0],
			y0: pos[1],
			x1: pos[0] + size[0],
			y1: pos[1] + size[1],
			multifire: multifire,
			script: new Script(spec, this.mission, this),
		})
	},
	setDeathScript: function (spec) {
		this.deathScript = new Script(spec, this.mission, this)
	},

	takeDamage: function (amount, type, weapid) {
		if (DEBUG.onehit && this.mission.protag !== this) amount *= 1000
		if (DEBUG.onehit && this.mission.protag === this) amount /= 1000
		if (this.currenthp <= 0) return
		if (!this.hostile && this.mission.protag !== this) return
		amount /= this.getDefence() * (1 + this.getResistance(type)/100)
		// weapid will be undefined for mines and projectiles killing themselves
		if (weapid !== undefined) log.damage(weapid, amount, this)
		this.currenthp -= amount
		if (this.currenthp <= 0) {
			if (this.deathScript) {
				this.mission.runScript(this.deathScript)
			}
			this.mission.dispatch_event("on_damage", this.pos, amount + this.pendingDamage)
			this.pendingDamage = 0
		} else {
			this.pendingDamage += amount
			if (this.pendingDamageCtr == 0) {
				this.pendingDamageCtr = DAMAGE_AGGREGATE_TIME
			}
		}
	},
	kill: function (silent) {  // Does not invoke deathScript
		if (!silent) {
			this.mission.dispatch_event("on_damage", this.pos, this.currenthp + this.pendingDamage)
		}
		this.currenthp = 0
		this.die()
	},
	set_dest: function (dest) {
		this.dest = dest
		var dx = dest[0] - this.pos[0], dy = dest[1] - this.pos[1]
		this.bearing = 57.3 * Math.atan2(dy, dx)
	},
	move: function (tripScripts) {
		if (tripScripts === undefined) tripScripts = true
		var m = this.mission, e = this
		function unobstructed(pos) {
			return m.map.circleClear(pos, e.r) && m.entities.canMove(e, pos, e.r)
		}
		if (this.dest) {
			var totalspeed = this.getSpeed()
			while (totalspeed) {
				if (!this.dest) break
				var dx = this.dest[0] - this.pos[0], dy = this.dest[1] - this.pos[1]
				var dist = Math.sqrt(dx*dx + dy*dy)
				var step = Math.min(totalspeed, MOVEMENT_STEP)
				totalspeed -= step
				if (dist <= step) {
					var newpos = this.dest
					this.dest = null
				} else {
					var newpos = [this.pos[0] + dx * step/dist, this.pos[1] + dy * step/dist]
				}
				if (unobstructed(newpos)) {
					this.realMove(newpos, tripScripts)
				} else {  // try sliding horizontally
					newpos = [this.pos[0] + ((dx>0)-(dx<0))*Math.min(step,Math.abs(dx)), this.pos[1]]
					if (dx && unobstructed(newpos)) {
						this.realMove(newpos, tripScripts)
					} else {  // try sliding vertically
						newpos = [this.pos[0], this.pos[1] + ((dy>0)-(dy<0))*Math.min(step,Math.abs(dy))]
						if (dy && unobstructed(newpos)) {
							this.realMove(newpos, tripScripts)
						} else {  // give up
							this.dest = null
						}
					}
				}
			}
		}
	},

	realMove: function (newpos, tripScripts) {
		if (!tripScripts) {
			this.setPos(newpos)
			return
		}
		var denied = false
		if (this.areaScripts.length) {
			var nx = newpos[0], ny = newpos[1]
			for (var j = 0 ; j < this.areaScripts.length ; ++j) {
				var ascr = this.areaScripts[j]
				if (ascr.x0 <= nx && nx <= ascr.x1 && ascr.y0 <= ny && ny <= ascr.y1) {
					this.mission.runScript(ascr.script)
					if (ascr.script.denyFlag) denied = true
					if (!ascr.multifire) ascr.fired = true
				}
			}
			this.areaScripts = this.areaScripts.filter(function (a) { return !a.fired })
		}
		if (denied) {
			this.dest = null
		} else {
			this.setPos(newpos)
		}
	},

	scriptMove: function () {
		var d = this.dest = this.scriptNodes[0]
		this.bearing = 57.3 * Math.atan2(d[1] - this.pos[1], d[0] - this.pos[0])
		this.move(false)
		if (!this.dest) {
			// Problem! Obstacle encountered. Jump to next node to ensure script terminates.
			this.setPos(this.scriptNodes[0])
		}
		if (this.pos[0] == this.scriptNodes[0][0] && this.pos[1] == this.scriptNodes[0][1]) {
			this.scriptNodes.shift()
			if (!this.scriptNodes.length && this.scriptBearing !== null) {
				this.bearing = this.scriptBearing
			}
		}
	},
		
	setScriptPath: function (nodes, bearing) {
		this.scriptNodes = nodes.slice()
		this.scriptBearing = bearing
	},
	
	describe: function () {
		return this.name + (this.hostile ? " (" + Math.ceil(this.currenthp) + " HP)" : "")
	},
	
	tick: function () {
		if (this.scriptNodes.length) {
			this.scriptMove()
		} else {
			this.move()
		}
		if (this.pendingDamageCtr > 0) {
			this.pendingDamageCtr -= 1
			if (this.pendingDamageCtr <= 0) {
				this.mission.dispatch_event("on_damage", this.pos, this.pendingDamage)
				this.pendingDamage = 0
			}
		}
	},
	
	die: function () {
		// this.mission.dispatch_event("on_destroy")  // No-op apparently
		Entity.prototype.die.apply(this)
	},
	
	heal: function (amount) {
		this.currenthp += amount
		this.mission.dispatch_event("on_heal", this.pos, amount)
	},
	
	getAttack: function () { return this.stats.attack },
	getDefence: function () { return this.stats.defence },
	getMaxHP: function () { return this.stats.maxhp },
	getSpeed: function () { return this.stats.speed },
	getResistance: function (damageType) {
		return 1 + this.resistances[damageType] * 0.01
	},

	isObjective: function () {
		return this.hostile
	},
})

function Protag(mission, pos) {
	this.init(mission, pos)
}
Protag.prototype = extend(Actor.prototype, {
	init: function (mission, pos) {
		Actor.prototype.init.call(this, mission, pos, robotstate.stats, PROTAGONIST_RADIUS, 0, false, "Camden")
		this.robotstate = robotstate
		this.weaponry = this.robotstate.weaponry
		this.currentEnergy = this.robotstate.getMaxEnergy()
		this.currenthp = this.robotstate.getMaxHP()
		this.targ = null
		this.numticks = 0
		this.explosions = 2
		this.anim_state = "static"
		
		this.setDeathScript([
			["die"],
			["canEject", false],
			["set_zoom", 3],
			["wait", 50],
			["change_scene", "gameover"],
		])
	},
	move: function (tripScripts) {
		if (tripScripts === undefined) tripScripts = true
		if (this.targ && !this.targ.hostile) {
			var dx = this.pos[0] - this.targ.pos[0], dy = this.pos[1] - this.targ.pos[1]
			var dr = PROTAGONIST_TALKRANGE + this.targ.r
			if (dx * dx + dy * dy < dr * dr) return
		}
		Actor.prototype.move.call(this, tripScripts)
		var localStuff = this.mission.entities.entitiesWithin(this.pos, this.r)
		for (var id in localStuff) {
			var thing = localStuff[id]
			if (thing.pickUp) {
				thing.pickUp()
				if (thing.pickUpScript) {
					this.mission.runScript(thing.pickUpScript)
				}
			}
		}
	},
	tick: function () {
		Actor.prototype.tick.call(this)
		this.numticks++
		// TODO: gamelog
		if (this.numticks == ROBOT_DUNGEON_TIME_LIMIT && this.mission.isTimed) {
			this.mission.dispatch_event("on_time_out")
		} else if (this.numticks < ROBOT_DUNGEON_TIME_LIMIT || !this.mission.isTimed) {
			this.currentEnergy = Math.min(this.robotstate.getMaxEnergy(),
				this.currentEnergy + this.robotstate.getEnergyRegen())
		}
		this.weaponry.forEach(function (w) { if (w) w.tick() })
		this.attack()
		if (this.targ && !this.targ.hostile) {
			var dx = this.pos[0] - this.targ.pos[0], dy = this.pos[1] - this.targ.pos[1]
			var dr = PROTAGONIST_TALKRANGE + this.targ.r
			if (dx * dx + dy * dy < dr * dr) {
				if (this.targ.talkScript) {
					// TODO: gamelog
					this.mission.runScript(this.targ.talkScript)
				}
				this.targ = null
				this.dest = null
			} else {
				if (!this.dest || this.dest !== this.targ.pos) {
					// Have hit a wall and failed, or changed mind
					this.targ = null
				}
			}
		}
		this.anim_state = this.dest ? "walking" : "static"
	},
	
	attack: function () {
		if (this.targ && this.targ.currenthp <= 0) {
			this.targ = null
		}
		for (var j = 0 ; j < this.weaponry.length ; ++j) {
			var w = this.weaponry[j]
			if (!w) continue
			if (w.mode == "Inactive") continue
			if (w.mode == "Autofire" && w.cooldown <= 0) {
				var temptarg = this.mission.closestHostileTo(this.pos, w.getRange(), true, true, true)
			} else {
				var temptarg = this.targ && this.targ.hostile ? this.targ : null
			}
			if (w.canFire(this, temptarg) && this.currentEnergy > w.getEnergyUse()) {
				w.fire(this, temptarg)
				this.currentEnergy -= w.getEnergyUse()
			}
		}
		if (this.targ && this.mission.dead[this.targ.id]) {
			this.targ = null
		}
	},
	
	heal: function (amount) {
		Actor.prototype.heal.call(this, amount)
		this.currenthp = Math.min(this.currenthp, this.getMaxHP())
	},
	
	getAttack: function () { return this.robotstate.getAttack() },
	getDefence: function () { return this.robotstate.getDefence() },
	getMaxHP: function () { return this.robotstate.getMaxHP() },
	getSpeed: function () { return this.robotstate.getSpeed() },
	getResistance: function (damageType) {
		return this.robotstate.getResistance(damageType)
	},
	
	addXp: function (xpvalue) {
		var levelled_up = robotstate.addXP(xpvalue)
		this.mission.dispatch_event("on_gain_xp", xpvalue)
		if (levelled_up) {
			this.mission.dispatch_event("on_level_up")
			this.heal(robotstate.stats.maxhp)
		}
	},

	die: function () {
		var r = this.r * this.r
		for (var n = 0 ; n < this.explosions ; ++n) {
			this.mission.entities.add(new Explosion(this.mission, this.pos, r, n))
			r *= 0.6
		}
		Actor.prototype.die.apply(this)
	},
})




function Treasure(mission, pos, radius, name) {
	this.init(mission, pos, radius, name)
}
Treasure.prototype = extend(Entity.prototype, {
	istreasure: true,
	init: function (mission, pos, radius, name) {
		Entity.prototype.init.call(this, mission, pos, radius, 0, false, name || "???")
		this.mission.born[this.id] = this
		this.pickUpScript = null
	},
	
	setPickUpScript: function (spec) {
		this.pickUpScript = new Script(spec, this.mission, this)
	},
	
	pickUp: function () {
		this.mission.dispatch_event("on_pick_up")
		Entity.prototype.die.apply(this)
	},
})

function Metal(mission, name, amount, pos) {
	this.init(mission, name, amount, pos)
}
Metal.prototype = extend(Treasure.prototype, {
	init: function (mission, name, amount, pos) {
		Treasure.prototype.init.call(this, mission, pos, 7, name)
		this.amount = amount
	},
	
	pickUp: function () {
		robotstate.addMetal(this.amount, this.name)
		Treasure.prototype.pickUp.apply(this)
	},
	
	describe: function () {
		return this.name + " (" + this.amount + ")"
	},
})

function DroppedEquippable(mission, item, pos) {
	this.init(mission, item, pos)
}
DroppedEquippable.prototype = extend(Treasure.prototype, {
	init: function (mission, item, pos) {
		Treasure.prototype.init.call(this, mission, pos, 16, "DroppedEquipment")
		this.item = item
	},
	
	pickUp: function () {
		robotstate.addItem(this.item)
		Treasure.prototype.pickUp.apply(this)
	},
	
	describe: function () {
		return this.item.fullname()
	},
})



// For logging purposes (to balance weapon strengths), every item is assigned a unique id
// This id is *not* preserved between game sessions!
var nitems = 0

function Equippable (name) {
	this.init(name)
}
Equippable.prototype = {
	init: function (name) {
		this.name = name
		this.basedescription = name
		this.isIdentified = false
		this.itemLevel = 1
		this.id = nitems++
	},
	// These are properties/cached in the original, but there's not a lot I can do about that!
	description: function () {
		return this.isIdentified ? this.appraisedname() + "\n" + this.effects() : "Unappraised " + this.name
	},
	fullname: function () {
		return this.isIdentified ? this.appraisedname() : "Unappraised " + this.name
	},
	appraisedname: function () {
		// It would take about a minute to move this into the subclasses, but I'm really lazy
		return this.modList.map(this.isweapon ? getWeaponModName : getArmourModName).join("") + this.name
	},
	effects: function () {
		return ""
	},
	equipcost: function () {
		var level = this.itemLevel
		return [
			1 << Math.min(8, level),
			level >  6 ? 1 << Math.min(8, level -  7) : 0,
			level > 11 ? 1 << Math.min(7, level - 12) : 0,
			level > 15 ? 1 << Math.min(6, level - 16) : 0,
			level > 19 ? 1 << Math.min(6, level - 10) : 0,
		]
	},
	salevalue: function () {
		var level = this.itemLevel
		return [
			1 << Math.min(6, level),
			level >  7 ? 1 << Math.min(5, level -  8) : 0,
			level > 12 ? 1 << Math.min(4, level - 13) : 0,
			level > 16 ? 1 << Math.min(3, level - 17) : 0,
			level > 20 ? 1 << Math.min(3, level - 21) : 0,
		]
	},
	appraisecost: function () {
		return this.salevalue()
	},
	getPercentage: function (which) {
		return clip(this.percentages[which], -80, 300)
	},
	getResistance: function (which) {
		return clip(this.resistances[which], -80, 300)
	},
	getItemSpec: function () {
		return [
			this.isweapon ? "weapon" : this.isarmour ? "armour" : "",
			this.spec,
			this.isIdentified,
		]
	},
}

function makeItem(type, spec, isIdentified) {
	if (type === null) return null
	if (type.pop) return makeItem.apply(this, type)
	if (type == "weapon") {
		var item = makeWeapon(spec)
	} else if (type == "armour") {
		var item = makeArmour.apply(null, spec)
	} else {
		throw "Unknown item type: " + type
	}
	item.isIdentified = isIdentified
	return item
}





armournames = ["Breastplate", "Helmet", "Greaves", "Gauntlets", "Gloves", "Vambraces", "Bracer", "Visor",
               "Suit", "Mail", "Shield", "Great Shield", "Tower Shield", "Plate", "Backpack", "Exoskeleton",
               "Armour", "Scale", "Medallion", "Talisman", "Dogtags", "Faceplate", "Keychain", "Armlet",
               "Bracelet", "Amulet", "Dustbin Lid", "Shades", "Rollcage", "Kneepads", "Sunglasses", "Boots",
               "Thong", "Sandals", "Jetpack", "Battery Pack", "Rollerblades"]

function Armour(name) {
	this.init(name)
}
Armour.prototype = extend(Equippable.prototype, {
	isarmour: true,
	init: function (name) {
		Equippable.prototype.init.call(this, name)
		var pc = this.percentages = {}
		mod.pckeys.forEach(function (key) {
			pc[key] = 0
		})
		var rs = this.resistances = {}
		mod.rskeys.forEach(function (key) {
			rs[Damage[key]] = 0
		})
		this.modList = []
	},
	effects: function () {
		var efx = []
		if (this.isIdentified) {
			for (var type in this.percentages) {
				var value = Math.round(this.getPercentage(type))
				if (value > 0) efx.push(value + "% increased " + type + ".")
				if (value < 0) efx.push(-value + "% decreased " + type + ".")
			}
			for (var type in this.resistances) {
				var value = Math.round(this.getResistance(type))
				if (value > 0) efx.push(value + "% increased resistance to " + type + " damage.")
				if (value < 0) efx.push(-value + "% decreased resistance to " + type + " damage.")
			}
		}
		return efx.join("\n")
	},
})

// If seed is not specified, it will be automatically generated.
function makeArmour(mods, itemLevel, seed) {
//	if (mods && mods.pop) return makeArmour.apply(this, mods)  // Also accepts 3-arrays as args
	seed = seed || UFX.random.rand()
	UFX.random.pushseed(seed)
	var a = new Armour(UFX.random.choice(armournames))
	if (mods) {
		for (var j = 0 ; j < mods.length ; j += 2) {
			applyArmourMod(a, mods[j], mods[j+1])
		}
	}
	if (itemLevel) a.itemLevel = itemLevel
	a.spec = [mods, itemLevel, seed]
	UFX.random.popseed()
	return a
}

// Construct weapons via the makeWeapon factory.
// Takes 4 args: type, args, mods, itemLevel (args and mods can be null if empty, itemLevel = 0 for default)
// type is a string, usually the class name from the python version, eg "LightLaser", "GatlingGun"
// args are additional arguments passed to the weapon constructor, not used for the most part,
//   but Summon uses it (anything else?)
// mods are concatenated 2-arrays of (mod name, awesomeness) values

// Examples (python version -> js version)

// weapon.WimpyClaw() -> "WimpyClaw"
// weapon.Summon(Spider, 1.5, 40, 4) -> "Summon", ["Spider", 1.5, 40, 4]
// weapon.Railgun().applyMod(mod.HighPowered(10)) -> "Railgun", null, ["HighPowered", 10]
// weapon.Drill().applyMod(mod.BOSS(3)).applyMod(mod.Accurate(1))
//   -> "Drill", null, ["BOSS", 3, "Accurate", 1]

function Weapon() {
}
Weapon.prototype = extend(Equippable.prototype, {
	isweapon: true,
	init: function (damagetype, range, cooldowntime, damage, energydrain, name, effectname) {
		Equippable.prototype.init.call(this, name || "???")
		this.effectname = effectname || damagetype
		this.damagetype = damagetype
		this.baserange = WEAPON_RANGE_MULTIPLIER * range
		this.basecooldown = cooldowntime
		this.basedamage = damage
		this.cooldown = this.basecooldown
		this.baseenergydrain = energydrain === undefined ? 1 : energydrain
		var pc = this.percentages = {}
		mod.wpckeys.forEach(function (key) {
			pc[mod[key]] = 0
		})
		this.mode = "Active"
		this.canAutofire = false
		this.allowactive = true
		this.modList = []
	},
	getDamage: function () {
		return UFX.random(0.8, 1.2) * this.basedamage * (1 + 0.01 * this.getPercentage(mod.damage))
	},
	getRange: function () {
		return this.baserange * (1 + 0.01 * this.getPercentage(mod.range))
	},
	getEnergyUse: function () {
		return this.baseenergydrain * (1 + 0.01 * this.getPercentage(mod.energy))
	},
	getCooldown: function () {
		return this.basecooldown / (1 + 0.01 * this.getPercentage(mod.rate))
	},
	canFire: function (owner, target) {
		if (this.mode == "Inactive") return false
		if (!target) return false
		if (this.cooldown > 0) return false
		if (distanceBetween(owner.pos, target.pos) > this.getRange()) return false
		return owner.mission.map.hasLOS(owner.pos, target.pos)
	},
	fire: function (owner, target) {
		target.takeDamage(this.getDamage() * owner.getAttack(), this.damagetype, this.id)
		this.cooldown = this.getCooldown()
		owner.mission.dispatch_event("on_weapon_fire", this, owner, target)
		return true
	},
	tick: function () {
		this.cooldown -= 1
	},
	toggle: function (owner) {
		switch (this.mode) {
			case "Autofire": this.mode = this.allowactive ? "Active" : "Inactive" ; break
			case "Active": this.mode = "Inactive" ; break
			case "Inactive": this.mode = this.canAutofire ? "Autofire" : "Active" ; break
		}
	},
	effects: function () {
		var efx = []
		if (this.isIdentified) {
			for (var type in this.percentages) {
				var value = Math.round(this.getPercentage(type))
				if (value > 0) efx.push(value + "% increased " + type + ".")
				if (value < 0) efx.push(-value + "% decreased " + type + ".")
			}
			if (this.canAutofire) efx.push("Autofire mode available.")
		}
		return efx.join("\n")
	},
})

function Healing() {
}
Healing.prototype = extend(Weapon.prototype, {
	init: function (healing, cooldowntime, energydrain, name) {
		Weapon.prototype.init.call(this, null, 20, cooldowntime, healing, energydrain, name || "Repair Kit")
		applyWeaponMod(this, "Smart", 1)
		this.mode = "Inactive"
		this.allowactive = false
	},
	canFire: function (owner, target) {
		if (this.mode == "Inactive") return false
		if (this.cooldown > 0) return false
		return owner.currenthp < owner.getMaxHP()
	},
	fire: function (owner, target) {
		this.cooldown = this.getCooldown()
		owner.heal(this.getDamage())
		return true
	},
})

function ProjectileWeapon() {
}
ProjectileWeapon.prototype = extend(Weapon.prototype, {
	// Note that the order of cooldowntime and damage are swapped! This is because that's how the
	//   numbers appear in most of the subclass constructors.
	init: function (cons, range, cooldowntime, damage, energydrain, name, cone, normal_los) {
		Weapon.prototype.init.call(this, null, range, cooldowntime, damage, energydrain, name)
		this.cons = cons
		this.cone = cone * 0.0174532925
		this.normal_los = normal_los
	},
	canFire: function (owner, target) {
		if (this.mode == "Inactive") return false
		if (!target) return false
		if (this.cooldown > 0) return false
		if (distanceBetween(owner.pos, target.pos) > this.getRange()) return false
		if (this.normal_los) {
			return owner.mission.map.hasLOS(owner.pos, target.pos)
		}
		var radius = projdata[this.cons][0]
		return owner.mission.map.hasWideLOS(owner.pos, target.pos, radius)
	},
	fire: function (owner, target) {
		this.cooldown = this.getCooldown()
		var truebearing = Math.atan2(target.pos[1] - owner.pos[1], target.pos[0] - owner.pos[0])
		var bearing = truebearing + (this.cone ? UFX.random(-this.cone, this.cone) : 0)
		// This was originally damagefunc but I don't see any reason for that.
		var damageamt = this.getDamage() * owner.getAttack()
		var projectile = makeProjectile(this.cons, owner, bearing, damageamt, this.id)
		owner.mission.born[projectile.id] = projectile
		owner.mission.dispatch_event("on_projectile_fire", owner, projectile)
	},
})

function Summon() {
}
Summon.prototype = extend(Weapon.prototype, {
	init: function (cons, range, cooldowntime, limit, supply) {
		range = range === undefined ? 2 : range
		cooldowntime = cooldowntime === undefined ? 150 : cooldowntime
		Weapon.prototype.init.call(this, null, range, cooldowntime, 0, 0, null)
		this.cons = cons
		this.limit = limit || 5
		this.children = []
		this.supply = supply || null
	},
	canFire: function (owner, target) {
		if (this.cooldown > 0) return false
		if (distanceBetween(owner.pos, target.pos) > owner.guardradius) return false
		this.children = this.children.filter(function (c) { return c.currenthp > 0 })
		if (this.supply !== null && this.supply < 1) return false
		return (this.limit === null) || this.children.length < this.limit
	},
	fire: function (owner, target) {
		var beast = makeEnemy(this.cons, owner.mission, owner.pos)
		var born = owner.mission.born
		function tooclose (id) {
			var r = beast.r + born[id].r
			return d2between(pos, born[id].pos) <= r * r
		}
		for (var tries = 0 ; tries < SUMMON_TRIES ; ++tries) {
			var xd = owner.pos[0] + UFX.random(-this.baserange, this.baserange)
			var yd = owner.pos[1] + UFX.random(-this.baserange, this.baserange)
			var pos = [xd, yd]
			if (!owner.mission.map.circleClear(pos, beast.r)) continue
			if (Object.keys(owner.mission.entities.entitiesWithin(pos, beast.r)).length) continue
			if (Object.keys(born).some(tooclose)) continue
			beast.pos = pos
			owner.mission.born[beast.id] = beast
			// Seems to be a no-op
			//owner.mission.dispatch_event("on_summon", beast, owner)
			this.children.push(beast)
			if (this.supply !== null) --this.supply
			this.cooldown = this.getCooldown()
			break
		}
	},
})

function MineLayer() {
}
MineLayer.prototype = extend(Weapon.prototype, {
	init: function (cons, damage, cooldowntime, energydrain, blast, name) {
		Weapon.prototype.init.call(this, null, 0, cooldowntime, damage, energydrain, name)
		this.cons = cons
		this.blast = blast
	},
	toggle: function (owner) {
		this.fire(owner, null)
	},
	fire: function (owner, target) {
		this.cooldown = this.getCooldown()
		// This was originally a callback damagefunc but that seems unnecessary
		var damageamt = this.getDamage() * owner.getAttack()
		var mine = makeMine(this.cons, owner, damageamt, this.blast, this.id)
		owner.mission.born[mine.id] = mine
		owner.mission.dispatch_event("on_mine_lay", owner, mine)
		return true
	},
})

// NB: SuicideBomb is merely a pseudo-weapon used by mines. No need for its spec to be JSONable
function SuicideBomb() {
}
SuicideBomb.prototype = extend(Weapon.prototype, {
	init: function (damageamt, damagetype, blast) {
		Weapon.prototype.init.call(this, null, 0, 0, 0, 0, "")
		this.damageamt = damageamt
		this.damagetype = damagetype
		this.blast = blast
		this.exploded = false
	},
	canFire: function (owner, target) {
		return false
	},
	fire: function (owner, target) {
		var mkt = new MultikillTracker(owner.mission)
		if (this.exploded) return false
		this.exploded = true
		if (!this.blast) return true
		var victims = owner.mission.entities.entitiesWithin(owner.pos, this.blast)
		for (var id in victims) {
			var v = victims[id]
			if (v === owner) continue
			if (v.isactor) mkt.applyDamage(v, this.damageamt, this.damagetype, this.id)
		}
		owner.mission.entities.add(new Explosion(owner.mission, owner.pos, this.blast, 2))
		owner.mission.entities.add(new Explosion(owner.mission, owner.pos, 0.6 * this.blast, 0))
		return true
	},
})

function ChainLightningGun() {
	this.init()
}
ChainLightningGun.prototype = extend(Weapon.prototype, {
	init: function () {
		Weapon.prototype.init.apply(this, weapondata.ChainLightningGun)
	},
	fire: function (owner, target) {
		if (owner !== owner.mission.protag) {
			return Weapon.prototype.fire.call(this, owner, target)
		}
		this.cooldown = this.getCooldown()
		var mkt = new MultikillTracker(owner.mission)
		var origin = owner, range = this.getRange(), hit = {}, mission = owner.mission
		var damage = this.getDamage() * owner.getAttack()
		while (damage > 0.5 && target) {
			mkt.applyDamage(target, damage, this.damagetype, this.weapid)
			mission.dispatch_event("on_weapon_fire", this, origin, target)
			damage *= 0.5
			origin = target
			hit[target.id] = true
			var viabletargets = mission.entities.entitiesWithin(target.pos, 0.5*range)
			target = null
			var td2 = (range + 1) * (range + 1)
			var vtkeys = Object.keys(viabletargets)
			vtkeys.sort()
			vtkeys.forEach(function (vtkey) {
				var vt = viabletargets[vtkey]
				if (vt.isenemy && vt.visible && !hit[vtkey] && mission.map.hasLOS(origin.pos, vt.pos)) {
					var vtd2 = d2between(vt.pos, origin.pos)
					if (vtd2 < td2) {
						target = vt
						td2 = vtd2
					}
				}
			})
		}
		return true
	},
})



// damage type, range, cooldowntime, damage, energydrain, name, effectname
var weapondata = {
	"Taser": [Damage.electric, 3, 40, 8, 50, "Taser"],
	"LightningGun": [Damage.electric, 6, 30, 12, 120, "Lightning Gun"],
	"ChainLightningGun": [Damage.electric, 6, 30, 12, 120, "Chain Lightning Gun"],
	"LightLaser": [Damage.laser, 5, 25, 1, 10, "Light Laser"],
	"HeavyLaser": [Damage.laser, 4, 30, 8, 30, "Heavy Laser"],
	"UberLaser": [Damage.laser, 5, 15, 30, 20, "Uber Laser"],
	"MachineGun": [Damage.physical, 3, 5, 0.5, 6, "Machine Gun"],
	"Shotgun": [Damage.physical, 1.5, 25, 10, 50, "Shotgun", Damage.shotgun],
	"SniperRifle": [Damage.physical, 10, 300, 75, 300, "Sniper Rifle"],
	"GatlingGun": [Damage.physical, 3, 3, 10, 20, "Gatling Gun"],
	"IncendiaryRifle": [Damage.fire, 6, 20, 15, 30, "Incendiary Rifle"],
	"WimpyClaw": [Damage.physical, 0.75, 20, 1, 0, "Claw", Damage.claw],
	"Drill": [Damage.physical, 0.75, 15, 8, 0, "Claw", Damage.claw],
	"PopGun": [Damage.physical, 5, 25, 1, 1],
}
// healing, cooldowntime, energydrain, name
var healingdata = {
	"LightRepairKit": [5, 5, 50, "Light Repair Kit"],
	"SuperRepairKit": [15, 5, 100, "Super Repair Kit"],
}
// cons, range, cooldowntime, damage, energydrain, name, cone, normal_los
var projweapondata = {
	"Flamethrower": ["Fireball", 1.5, 4, 2, 10, "Flamethrower", 30, true],
	"Bazooka": ["Shell", 5, 20, 10, 30, "Bazooka"],
	"Cannon": ["Cannonball", 5, 60, 15, 30, "Cannon"],
	"Railgun": ["RailgunSlug", 10, 50, 120, 150, "Railgun"],
	"NapalmThrower": ["Napalm", 3, 4, 7, 10, "Napalm Thrower", 10, true],
	"PlasmaGun": ["Plasma", 5, 3, 9, 10, "Plasma Gun", 3],
	"RocketLauncher": ["Rocket", 8, 100, 200, 200, "Rocket Launcher"],
	"NinjaStarLauncher": ["NinjaStar", 8, 30, 10, 0, "NinjaStarLauncher"],
	"HomingMissileLauncher": ["HomingMissile", 6, 60, 20, 0, "HomingMissileLauncher"],
	"SpiderThrower": ["FireSpider", 6, 2, 20, 1, "Spider Thrower", 20],
}
// cons, damage, cooldowntime, energydrain, blast, name
var minelayerdata = {
	TimedMineLayer: ["TimedMine", 50, 150, 200, 40, "Timed Mine Layer"],
	ProximityMineLayer: ["ProximityMine", 250, 250, 500, 60, "Proximity Mine Layer"],
}

function makeWeapon(type, args, mods, itemLevel, seed) {
	if (type.pop) return makeWeapon.apply(this, type)  // Also accepts 4-arrays as args
	seed = seed || UFX.random.rand()
	UFX.random.pushseed(seed)
	var w
	if (type == "ChainLightningGun") {
		w = new ChainLightningGun()
	} else if (type in weapondata) {
		w = new Weapon()
		w.init.apply(w, weapondata[type])
	} else if (type in healingdata) {
		w = new Healing()
		w.init.apply(w, healingdata[type])
	} else if (type in projweapondata) {
		w = new ProjectileWeapon()
		w.init.apply(w, projweapondata[type])
		if (type == "SpiderThrower") {
			w.mode = "Autofire"
			w.canAutofire = true
		}
	} else if (type in minelayerdata) {
		w = new MineLayer()
		w.init.apply(w, minelayerdata[type])
	} else if (type == "SuicideBomb") {
		w = new SuicideBomb()
		w.init.apply(w, args)
	} else if (type == "Summon") {
		w = new Summon()
		w.init.apply(w, args)
	} else {
		throw "Unrecognized weapon type: " + type
	}

	if (mods) {
		for (var j = 0 ; j < mods.length ; j += 2) {
			applyWeaponMod(w, mods[j], mods[j+1])
		}
	}
	if (itemLevel) w.itemLevel = itemLevel
	w.spec = [].slice.call(arguments)
	UFX.random.popseed()
	return w
}

function Projectile() {
}
Projectile.prototype = extend(Entity.prototype, {
	init: function (owner, radius, bearing, damageamt, damagetype, velocity, name, onehit, blast, ttl, trail) {
		Entity.prototype.init.call(this, owner.mission, owner.pos, radius, 57.2957795 * bearing, false, name)
		this.owner = owner
		this.damageamt = damageamt
		this.damagetype = damagetype
		this.onehit = onehit
		this.blast = blast
		this.ttl = ttl
		this.trail = trail
		this.hitalready = {}
		this.exploded = false
		this.dx = Math.cos(bearing) * velocity
		this.dy = Math.sin(bearing) * velocity
		this.mkt = new MultikillTracker(owner.mission)
	},
	tick: function () {
		var newpos = [this.pos[0] + this.dx, this.pos[1] + this.dy]
		if (this.trail) {
			this.mission.dispatch_event("on_projectile_move", this.pos, this.bearing, this.trail)
		}
		var victims = this.mission.entities.entitiesWithin(newpos, this.r)
		var ids = Object.keys(victims)
		ids.sort()
		for (var j = 0 ; j < ids.length ; ++j) {
			var id = ids[j], v = victims[id]
			if (!v.solid || v === this.owner || this.hitalready[id]) continue
			if (v.isactor && !this.blast) {
				this.mkt.applyDamage(v, this.damageamt, this.damagetype, this.weapid)
				this.hitalready[id] = true
			}
			if (this.onehit) {
				this.explode()
				break
			}
		}
		if (!this.mission.map.circleClear(newpos, this.r)) {
			this.explode()
		}
		this.setPos(newpos)
		if (this.ttl !== null) {
			--this.ttl
			if (this.ttl <= 0) this.explode()
		}
	},
	explode: function () {
		if (this.exploded) return
		this.die()
		this.mission.dispatch_event("on_explode", this)
		if (!this.blast) return
		var victims = this.mission.entities.entitiesWithin(this.pos, this.blast)
		for (var id in victims) {
			var v = victims[id]
			if (v.isactor) {
				this.mkt.applyDamage(v, this.damageamt, this.damagetype)
			}
		}
		this.mission.entities.add(new Explosion(this.mission, this.pos, this.blast, 2))
		this.mission.entities.add(new Explosion(this.mission, this.pos, 0.6 * this.blast, 0))
	},
})

// radius=5, damagetype, velocity=20, name, onehit=true, blast=null, ttl=50, trail=null
var projdata = {
	Cannonball: [10, Damage.physical, 15, "Cannonball", true, null, null, null],
	RailgunSlug: [5, Damage.physical, 18, "Railgun Slug", false, null, null, "railgun"],
	Fireball: [10, Damage.fire, 3, "Fireball", false, null, 40, null],
	Napalm: [10, Damage.fire, 4, "Napalm", false, null, 80, null],
	Plasma: [8, Damage.electric, 5, "Plasma", true, null, 80, null],
	Shell: [15, Damage.explosion, 10, "Shell", true, 50, null, "smoke"],
	Rocket: [10, Damage.explosion, 12, "Rocket", true, 150, null, "fire"],
	NinjaStar: [6, Damage.physical, 8, "Ninja Star", true, null, null, null],
	FireSpider: [10, Damage.fire, 8, "Fire Spider 0", false, null, 80, null],
	
	// HomingMissile is a special case, since it's a subclass of Mine. Behaves differently.
	HomingMissile: [10, null, 5, "Rocket", null, 20],
}

function makeProjectile(type, owner, bearing, damageamt, weapid) {
	var p
	if (type == "HomingMissile") {
		p = new HomingMissile()
		p.init(owner, bearing, damageamt)
	} else if (type in projdata) {
		p = new Projectile()
		var data = projdata[type], radius = data[0], damagetype = data[1], velocity = data[2]
		var name = data[3], onehit = data[4], blast = data[5], ttl = data[6], trail = data[7]
		p.init(owner, radius, bearing, damageamt, damagetype, velocity, name, onehit, blast,
			ttl, trail)
	} else {
		throw "Unrecognized projectile type " + type
	}
	p.weapid = weapid
	return p
}


function Explosion(mission, pos, blast, number) {
	this.init(mission, pos, blast, number)
}
Explosion.prototype = extend(Entity.prototype, {
	init: function (mission, pos, blast, number) {
		Entity.prototype.init.call(this, mission, pos, 0, UFX.random(360), false, "Explosion " + (number || 0))
		this.blast = blast
		this.age = 0
	},
	tick: function () {
		this.r += 0.1 * (this.blast - this.r)
		if (UFX.random() < EXPLOSION_BRANCH_P) {
			var r = UFX.random(this.blast - this.r)
			if (r > EXPLOSION_MINIMUM) {
				var A = UFX.random(360)
				var x = this.r * Math.cos(A) + this.pos[0]
				var y = this.r * Math.sin(A) + this.pos[1]
				this.mission.entities.add(new Explosion(this.mission, [x,y], r, (UFX.random() < 0.5 ? 1 : 0)))
			}
		}
		if (++this.age > EXPLOSION_TIME) this.die()
	},
})

function MultikillTracker(mission) {
	this.mission = mission
	this.kills = 0
}
MultikillTracker.prototype = {
	applyDamage: function (target, damage, effect, weapid) {
		target.takeDamage(damage, effect, weapid)
		if (target.currenthp <= 0) {
			if (++this.kills > 1) {
				this.mission.dispatch_event("on_multi_kill", target.pos, this.kills)
			}
		}
	},
}




var mod = {
	// Weapons percentages
	damage: "damage",
	range: "range",
	energy: "energy",
	rate: "rate",
	wpckeys: "damage range energy rate".split(" "),

	// Character percentages
	attack: "offensive power",
	defence: "defensive strength",
	hp: "hit points",
	speed: "speed",
	maxenergy: "energy capacity",
	energyregen: "energy regeneration",
	pckeys: "attack defence hp speed maxenergy energyregen".split(" "),

	physical: Damage.physical,
	laser: Damage.laser,
	fire: Damage.fire,
	electric: Damage.electric,
	explosion: Damage.explosion,
	rskeys: "physical laser fire electric explosion".split(" "),
}

// Make sure you set the UFX.random seed appropriately before calling this
function applyWeaponMod(weapon, type, a) {  // a = awesomeness
	var pcs = { damage: 0, range: 0, energy: 0, rate: 0 }, afire = false, name = type
	switch (type) {
		case "Smart": afire = true ; break
		case "HighPowered": pcs.damage = a ; name = "High-Powered" ; break
		case "Accurate": pcs.range = a ; break
		case "Efficient": pcs.energy = -a ; break
		case "SuperCooled": pcs.rate = a ; break
		case "Overclocked": pcs.damage = a ; pcs.energy = a ; name = "Over-clocked" ; break
		case "RapidFire": pcs.rate = a ; pcs.damage = -a ; name = "Rapid-fire" ; break
		case "Scoped": pcs.range = a ; pcs.rate = -Math.floor(a/2) ; break
		case "Assault": pcs.damage = a ; pcs.energy = a ; pcs.range = -(5-Math.floor(a/2)) ; break
		case "Autofiring": pcs.damage = a-5 ; afire = true ; name = "Auto-firing" ; break
		case "MasterCrafted": pcs.energy = -a ; pcs.range = a ; break
		case "Holy": pcs.damage = a*2 ; pcs.range = a ; break
		case "BOSS": pcs.damage = (a+1)*(a+1) ; pcs.range = a*2 ; pcs.rate = a*2 ; pcs.energy = -3*a ; afire = true ; break
	}
	for (var t in pcs) {
		if (pcs[t]) weapon.percentages[t] += (pcs[t] + UFX.random(-0.5, 0.5)) * 10
	}
	if (afire) {
		weapon.canAutofire = true
		weapon.mode = "Autofire"
	}
	weapon.modList.push([name, a])
}


// Make sure you set the UFX.random seed appropriately before calling this
// I'm not crazy about how armour mod strengths are calculated, but that's the way it is
//   in the python version.
function applyArmourMod(armour, type, c) {  // c = cool
	var ps = { attack: 0, defence: 0, hp: 0, speed: 0, maxenergy: 0, energyregen:0 }  // percentages
	var rs = { physical: 0, laser: 0, fire: 0, electric: 0, explosion: 0 }   // resistances
	switch (type) {
		case "Rubber": rs.electric = c*3 ; ps.speed = -c/2 ; break
		case "Iron": rs.physical = c*3 ; ps.speed = -c/2 ; break
		case "Mercury": rs.fire = -c ; ps.speed = c ; break
		case "Chrome": rs.laser = c*3 ; ps.attack = -c ; break
		case "Asbestos": rs.fire = c*3 ; ps.hp = -c/2 ; break
		case "Spiky": ps.attack = c*2 ; ps.speed = -c/2 ; break
		case "Lightning": rs.electric = c*2 ; ps.energyregen = c*2 ; break
		case "Phoenix": rs.fire = c*2 ; ps.hp = c ; break
		case "Giants": rs.explosion = c*3 ; ps.maxenergy = c*2 ; break
		case "Chromatic": rs.laser = c*2 ; ps.speed = c ; break
		case "Turtles": rs.physical = c*3 ; ps.defence = 1.5*c ; ps.speed = -c ; break
		case "Juggernaut": rs.physical = c*2 ; ps.attack = c ; break
		case "Conductive": rs.electric = -c ; ps.speed = 1.5*c ; break
		case "Crystal": rs.laser = c*3 ; ps.defence = -c ; break
		case "Wooden": rs.fire = -c ; rs.electric = c*3 ; break
		case "Sturdy": rs.physical = c*2 ; break
		case "Shiny": rs.laser = c*2 ; break
		case "FlameRetardant": rs.fire = c*2 ; break
		case "Insulated": rs.electric = c*2 ; break
		case "BlastProof": rs.explosion = c*2 ; break
		case "Warriors": ps.attack = c ; break
		case "Tough": ps.defence = c ; break
		case "Oiled": ps.speed = c ;  break
		case "Capacitative": ps.maxenergy = c ; break
		case "Inductive": ps.energyregen = c ; break
		case "Medical": ps.hp = c ; break
		case "Berserkers": ps.attack = c*2 ; ps.speed = c*2 ; ps.hp = -c ; break
		case "Glass": rs.explosion = -c ; rs.laser = c*3 ; break
		case "Alcoholic": rs.fire = -c*3 ; ps.defence = -c ; rs.electric = c*6 ; break
		case "Elemental": rs.fire = c*4 ; rs.electric = c*4 ; rs.laser = c*4 ; rs.physical = -c*2 ; break
		case "Mighty": rs.physical = c*3 ; ps.attack = c*2 ; rs.explosion = c*3 ; rs.electric = -c*2 ; break
		case "Enchanted": rs.laser = c*4 ; ps.speed = c*2 ; ps.energyregen = c*4 ; ps.hp = -c ; break
		case "Energetic": ps.maxenergy = c*2 ; ps.energyregen = c*4 ; break
		case "Overlords": rs.physical = c*4 ; ps.hp = c ; ps.attack = c*3 ; ps.defence = c*3 ; ps.speed = -c ; break
		default: throw "Unrecognized armour mod type " + type ; break
	}
	// If I made a typo in the above table, this should catch it.
	if (Object.keys(ps).length != mod.pckeys.length || Object.keys(rs).length != mod.rskeys.length) {
		throw "Incorrect assignment on armour mod type " + type
	}
	mod.pckeys.forEach(function (pckey) {
		if (ps[pckey]) armour.percentages[pckey] += (ps[pckey] + UFX.random(-0.5, 0.5)) * 10
	})
	mod.rskeys.forEach(function (rskey) {
		if (rs[rskey]) armour.resistances[rskey] += (rs[rskey] + UFX.random(-0.5, 0.5)) * 10
	})
	armour.modList.push([type, c])
}

//dict((name, getattr(mod, name).level) for name in dir(mod) if inspect.isclass(getattr(mod, name)) and (issubclass(getattr(mod, name), mod.ArmourMod) or issubclass(getattr(mod, name), mod.WeaponMod)))
var modtypeLevels = {'Mercury': 1, 'FlameRetardant': 1, 'Phoenix': 2, 'Chrome': 1, 'Warriors': 1, 'RapidFire': 1, 'Turtles': 2, 'Elemental': 2, 'Rubber': 1, 'WeaponMod': 1, 'SuperCooled': 1, 'Autofiring': 2, 'Conductive': 1, 'Overlords': 3, 'Overclocked': 1, 'Smart': 2, 'Berserkers': 2, 'Insulated': 1, 'BlastProof': 1, 'Holy': 2, 'Enchanted': 2, 'Asbestos': 1, 'Oiled': 1, 'Chromatic': 2, 'Glass': 1, 'Assault': 2, 'Scoped': 1, 'Inductive': 1, 'Giants': 2, 'Spiky': 1, 'Capacitative': 1, 'Sturdy': 1, 'Wooden': 1, 'Medical': 1, 'BOSS': 3, 'Crystal': 1, 'Iron': 1, 'Lightning': 2, 'Shiny': 1, 'MasterCrafted': 2, 'Energetic': 2, 'Tough': 1, 'Juggernaut': 2, 'Alcoholic': 1, 'Accurate': 1, 'ArmourMod': 1, 'Efficient': 1, 'Mighty': 2, 'HighPowered': 1}


function getWeaponModName(mod) {
	var modtype = mod[0], a = mod[1]
	var cname = ({
		HighPowered: "High-Powered",
		Overclocked: "Over-clocked",
		RapidFire: "Rapid-fire",
		Autofiring: "Auto-firing",
	}[modtype] || modtype) + " "
	var adjs = WEAPON_ADJECTIVES.length
	if (a <= 1) return cname
	if (a <= adjs + 1) return WEAPON_ADJECTIVES[a - 2] + cname
	return WEAPON_ADJECTIVES[adjs-1] + cname + "+" + (a - adjs - 1) + " "
}

function getArmourModName(mod) {
	var modtype = mod[0], cool = mod[1]
	if (modtype == "Giants") return "Giant's+" + cool  // Seems a little strange this one is different....
	var cname = ({
		Turtles: "Turtle's",
		FlameRetardant: "Flame-Retardant",
		Warriors: "Warrior's",
		Berserkers: "Berserker's",
		Overlords: "Overlord's",
	}[modtype] || modtype) + " "
	var adjs = ARMOUR_ADJECTIVES.length
	if (cool > adjs + 1) {
		cname = ARMOUR_ADJECTIVES[adjs-1] + cname
		cool -= adjs + 1
	}
	if (cool <= 1) return cname
	return ARMOUR_ADJECTIVES[cool-2] + cname
}
	


// Do things a little different than in the python version
// Don't instantiate these, instead call them and set the enemy to this

var AI = {
	tick: function () {
		for (var j = 0 ; j < this.allweapons.length ; ++j) {
			if (this.allweapons[j].canFire(this, this.protag)) {
				this.allweapons[j].fire(this, this.protag)
			}
		}
	},
}

var StupidAI = {
	tick: function () {
		AI.tick.apply(this)
		var protagDistance = distanceBetween(this.pos, this.protag.pos)
		if (protagDistance <= this.weapon.getRange() / 2) {
			if (this.mission.map.hasLOS(this.pos, this.protag.pos)) {
				this.dest = null
			}
		}
		if (protagDistance < this.guardradius || this.currenthp < this.getMaxHP()) {
			if (protagDistance > this.weapon.getRange() || !this.mission.map.hasLOS(this.pos, this.protag.pos)) {
				this.set_dest(this.protag.pos)
			}
		}
	},
}

// TODO TurretAI

var DroneAI = {
	init: function (zipradius, wait_time, always_shoot) {
		this.zipradius = zipradius || 80
		this.always_shoot = always_shoot
		this.wait_time = wait_time || 30
		this.aicounter = 0
	},
	tick: function () {
		if (this.always_shoot || !this.dest) AI.tick.call(this)
		if (this.dest) return
		var protagDistance = distanceBetween(this.pos, this.protag.pos)
		if (protagDistance >= this.guardradius && this.currenthp >= this.getMaxHP()) return
		if (this.counter) {
			--this.counter
		} else {
			var r = this.weapon.getRange() / 2
			var x = this.protag.pos[0] + UFX.random.normal(0, r)
			var y = this.protag.pos[1] + UFX.random.normal(0, r)
			this.set_dest([x, y])
			this.counter = this.wait_time
		}
	},
}


var SneakyAI = {
	init: function (ninjosity, movelength, wait_time) {
		this.ninjosity = ninjosity === undefined ? 0.9 : ninjosity
		this.movelength = movelength === undefined ? 100 : movelength
		this.wait_time = wait_time === undefined ? 30 : wait_time
		this.counter = 0
	},
	tick: function () {
		AI.tick.apply(this)
		if (this.dest) return
		if (this.counter > 0) {
			--this.counter
			return
		}
		protagDistance = distanceBetween(this.pos, this.protag.pos)
		if (protagDistance < this.guardradius || this.currenthp < this.getMaxHP()) {
			var is_brazen = UFX.random() > this.ninjosity
			for (var n = 0 ; n < NINJA_TRIES ; ++n) {
				var x = UFX.random.normal(this.pos[0], this.movelength)
				var y = UFX.random.normal(this.pos[1], this.movelength)
				if (is_brazen == this.mission.map.hasLOS([x, y], this.protag.pos)) break
			}
			this.set_dest([x, y])
			this.counter = this.wait_time
		}
	},
}

var RangedAI = {
	init: function (preferred_dist, aggressive, movelength, always_shoot) {
		this.preferred_dist = preferred_dist === undefined ? 0.9 : preferred_dist
		this.always_shoot = always_shoot === undefined ? true : always_shoot
		this.aggressive = aggressive == undefined ? true : aggressive
		if (this.aggressive) {
			this.ninjosity = 0
			this.movelength = movelength === undefined ? 100 : movelength
			this.wait_time = 0
			this.counter = 0
		}
	},
	tick: function () {
		var protagDistance = distanceBetween(this.pos, this.protag.pos)
		if (this.always_shoot || protagDistance >= this.preferred_dist * this.weapon.getRange()) {
			AI.tick.apply(this)
		}
		if (this.aggressive && !this.mission.map.hasLOS(this.pos, this.protag.pos)) {
			SneakyAI.tick.apply(this)
		} else {
			var ppos = this.protag.pos, px = ppos[0], py = ppos[1]
			if (protagDistance == 0) {
				var x = px + this.preferred_dist * this.weapon.getRange()
				var y = py
				this.set_dest([x, y])
			} else if (protagDistance < this.guardradius) {
				var scale = this.preferred_dist * this.weapon.getRange() / protagDistance
				var x = px + (this.pos[0] - px) * scale
				var y = py + (this.pos[1] - py) * scale
				this.set_dest([x, y])
			}
			this.bearing = 57.3 * Math.atan2(py - this.pos[1], px - this.pos[0])
		}
	},
}

var BlindAI = {
	tick: function () {
		if (this.mission.map.hasLOS(this.pos, this.protag.pos)) {
			StupidAI.tick.apply(this)
		}
	},
}

var ProximityMineAI = {
	init: function (owner) {
		this.owner = owner
	},
	tick: function () {
		var ents = this.mission.entities.entitiesAt(this.pos)
		for (var id in ents) {
			var e = ents[id]
			if (!e.solid || !(e.hostile || e === this.mission.protag)) continue
			if (e !== this.owner && e !== this) {
				this.takeDamage(this.getMaxHP(), Damage.explosion)
				return
			}
		}
	},
}

var TimedMineAI = {
	init: function (timer) {
		this.timer = timer
	},
	tick: function () {
		if (this.timer <= 0) this.takeDamage(this.getMaxHP(), Damage.explosion)
		--this.timer
	},
}

var HomingAI = {
	init: function (owner) {
		this.owner = owner
	},
	tick: function () {
		StupidAI.tick.call(this)
		if (this.mission.map.circleClear(this.pos, 2*this.r)) {
			ProximityMineAI.tick.call(this)
		} else {
			this.takeDamage(this.getMaxHP(), Damage.explosion)
		}
	},
}




function Enemy() {
}
Enemy.prototype = extend(Actor.prototype, {
	isenemy: true,
	init: function (mission, pos, weapons, stats, guardradius, size, xpvalue, name, bearing,
			explosions, ai, aiargs, dropLevel) { 
		Actor.prototype.init.call(this, mission, pos, stats, size, bearing, true, name)
		this.guardradius = this.mission.map.csize * guardradius
		this.xpvalue = xpvalue
		this.allweapons = weapons
		this.weapon = this.allweapons[0]
		this.protag = this.mission.protag
		this.level = dropLevel || 0
		this.explosions = explosions
		this.ai = ai
		if (ai.init) ai.init.apply(this, aiargs)
	},
	
	tick: function () {
		Actor.prototype.tick.apply(this)
		if (!this.hostile) return
		if (this.protag.currenthp <= 0) return
		for (var j = 0 ; j < this.allweapons.length ; ++j) this.allweapons[j].tick()
		this.ai.tick.apply(this)
	},
	
	// Leaving out getSquad since it doesn't seem to ever be used
	
	dropStuff: function () {
		treasuretables.drop(this.mission, this.pos, this.level)
	},
	
	die: function (allowDrop) {
		if (allowDrop === undefined || allowDrop) this.dropStuff()
		var r = this.r
		for (var n = 0 ; n < this.explosions ; ++n) {
			this.mission.entities.add(new Explosion(this.mission, this.pos, r, n))
			r *= 0.6
		}
		if (this.xpvalue > 0) this.mission.protag.addXp(this.xpvalue)
		// TODO gamelog
		Actor.prototype.die.apply(this)
	},
})

// packs should be an interleaved Array of enemy types + counts eg ["Spider", 4, "Scorpion", 8]
function PackSpawner() {
}
PackSpawner.prototype = extend(Enemy.prototype, {
	init: function (mission, pos, pack, spawnradius) {
		spawnradius = spawnradius || 2
		var ws = []
		for (var j = 0 ; j < pack.length ; j += 2) {
			var etype = pack[j], ecount = pack[j+1]
			ws.push(makeWeapon("Summon", [etype, spawnradius, 0, null, ecount]))
		}
		var speed = mission.protag.stats.speed * 2
		var stats = CombatStats(1, 1, 1, speed)
		Enemy.prototype.init.call(this, mission, pos, ws, stats, 100, 1, 0, "Pack Spawner", 0, 1,
			RangedAI, [0, false, 100, false])
		this.visible = false
		this.solid = false
		this.preferred_dist = PACK_SPAWN_DISTANCE / ws[0].getRange()
	},
	takeDamage: function () {
	},
	isObjective: function () {
		return false
	},
	tick: function () {
		Enemy.prototype.tick.apply(this)
		if (this.allweapons.every(function (w) { return w.supply <= 0 })) {
			this.die()
		}
	},
})


// Only used below in enemyinfo - this is pulled out for readability
var eweapspecs = {
	summonspider: ["Summon", ["Spider", 1.5, 40, 4]],
	accmachgun: ["MachineGun", [], ["Accurate", 5]],
	bosspgun: ["PlasmaGun", [], ["BOSS", 2]],
	bossdrill: ["Drill", [], ["BOSS", 2]],
	bossggun1: ["GatlingGun", [], ["BOSS", 1]],
	bossggun2: ["GatlingGun", [], ["BOSS", 2]],
	bossrlaunch: ["RocketLauncher", [], ["BOSS", 2]],
	hprailgun: ["Railgun", [], ["HighPowered", 10]],
	montaser: ["Taser", [], ["Scoped", 10]],
	summonmin: ["Summon", ["Minument", 5, 250, 3]],
	summonmc: ["Summon", ["MicroCopter", 1.5, 150, 3, 6]],
	summonsd: ["Summon", ["SentryDroid", 2.5, 25, 6, 12]],
	bossnjstar2: ["NinjaStarLauncher", [], ["BOSS", 2]],
	bossnjstar5: ["NinjaStarLauncher", [], ["BOSS", 5]],
}
// allweapons, [attack, defence, hp, speed], guardradius, size, xpvalue, dropLevel, explosions,
//  ai, aiargs, resistances [laser physical fire electric explosion], 
var enemyinfo = {
	// Insect subclasses - base resistances: [50, 0, -50, 0, 0]
	Spider: [["WimpyClaw"], [1, 2, 5, 4], 4, 15, 8, 1, 1, BlindAI, [], [50, 0, -50, 0, 0]],
	Scorpion: [["WimpyClaw"], [2, 3, 5, 3], 4, 25, 8, 1, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	StagBeetle: [["WimpyClaw"], [7, 5, 10, 4], 5, 25, 16, 3, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	SpiderQueen: [[eweapspecs.summonspider], [1, 9, 25, 4], 12, 30, 32, 5, 1, SneakyAI, [1], [70, 0, -50, 0, 0]],
	FireScorpion: [["Flamethrower"], [5, 9, 25, 4], 4, 20, 64, 6, 1, BlindAI, [], [50, 0, 50, 0, 0]],
	GreaterFireScorpion: [["NapalmThrower"], [5, 15, 50, 4], 5, 40, 1024, 11, 1, RangedAI, [], [50, 0, 50, 0, 0]],
	JadeBeetle: [["Drill"], [10, 15, 30, 5], 5, 25, 512, 10, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	NinjaSpider: [["NinjaStarLauncher"], [8, 15, 20, 6], 8, 20, 1024, 10, 1, SneakyAI, [], [50, 0, -50, 0, 0]],
	Bat: [[eweapspecs.accmachgun], [10, 10, 50, 7], 5, 40, 16384, 10, 1, DroneAI, [75, 20, true], [50, 0, -50, 0, 0]],
	MoonSpider: [["PlasmaGun"], [5, 10, 150, 4], 5, 25, 32768, 15, 1, RangedAI, [], [50, 0, -50, 0, 0]],
	FlameAvatar: [["NapalmThrower"], [25, 30, 200, 5], 5, 40, 262144, 18, 1, RangedAI, [], [50, 0, 250, 0, 0]],
	Arachne: [[eweapspecs.bosspgun], [35, 50, 500, 7], 5, 30, 1<<22, 25, 1, StupidAI, [], [50, 300, -50, 0, 0]],
	IntimidatingScorpion: [["PopGun"], [4, 4, 10, 2], 6, 40, 64, 2, 3, RangedAI, [], [20, 0, 0, 0, 0]],
	SmallScorpion: [["WimpyClaw"], [2, 3, 3, 4], 4, 20, 4, 1, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	TinyScorpion: [["WimpyClaw"], [1, 1, 1, 5], 4, 15, 2, 1, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	// Note: in the original, Variety Spiders do not show HP when targeted. Seems like this is just a bug.
	VarietySpiderR: [["NapalmThrower"], [7, 30, 44, 5], 5, 20, 65536, 18, 1, RangedAI, [], [0, 0, 300, 0, 0]],
	VarietySpiderY: [["LightningGun"], [7, 30, 44, 5], 5, 20, 65536, 18, 1, RangedAI, [], [0, 0, 0, 300, 0]],
	VarietySpiderG: [["PlasmaGun"], [7, 30, 44, 5], 5, 20, 65536, 18, 1, RangedAI, [], [0, 300, 0, 0, 300]],
	VarietySpiderB: [["UberLaser"], [3, 30, 44, 5], 5, 20, 65536, 18, 1, RangedAI, [], [300, 0, 0, 0, 0]],

	// Drone subclasses - base resistances: [0, 0, 50, -50, 0]
	SpikeDrone: [["LightLaser"], [6, 5, 3, 7], 8, 10, 8, 2, 1, DroneAI, [], [0, 0, 50, -50, 0]],
	BladeDrone: [["WimpyClaw"], [10, 7, 9, 4], 6, 10, 16, 4, 1, StupidAI, [], [0, 0, 50, -50, 0]],
	SawDrone: [["HeavyLaser"], [10, 15, 40, 5], 7, 15, 1024, 11, 1, DroneAI, [], [0, 0, 50, -50, 0]],
	JusticeDrone: [["UberLaser"], [4, 15, 30, 7], 6, 20, 32768, 14, 1, DroneAI, [], [0, 0, 50, -50, 0]],
	InjusticeDrone: [["RocketLauncher"], [10, 30, 150, 4], 5, 40, 262144, 18, 1, RangedAI, [], [0, 0, 50, -50, 300]],
	GiantBladeDrone: [[eweapspecs.bossdrill], [15, 30, 150, 4], 5, 40, 262144, 18, 1, StupidAI, [], [0, 300, 50, -50, 0]],
	NinjaDrone: [[eweapspecs.bossggun2], [20, 50, 500, 5], 5, 30, 1<<22, 25, 1, RangedAI, [], [0, 300, 50, -50, 0]],
	MiniSawDroneCW: [["HeavyLaser"], [3, 15, 10, 6], 7, 10, 256, 8, 1, DroneAI, [120, 50], [0, 0, 50, -50, 0]],
	MiniSawDroneCCW: [["HeavyLaser"], [3, 15, 10, 6], 7, 10, 256, 8, 1, DroneAI, [60, 25], [0, 0, 50, -50, 0]],
	
	// Tank subclasses - base resistances: [0, 50, 0, 0, -50]
	MiniTank: [[["LightLaser"], ["PopGun"]], [7, 5, 10, 3], 5, 12, 16, 3, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	MachineGunTank: [["MachineGun"], [15, 8, 25, 3], 5, 20, 128, 7, 1, RangedAI, [], [20, 70, 20, 20, -30]],
	DrillTank: [["Drill"], [5, 12, 20, 5], 6, 20, 128, 8, 1, StupidAI, [], [0, 50, 0, 0, -50]],
	HeavyTank: [["HeavyLaser"], [7, 15, 25, 4], 5, 30, 256, 9, 1, RangedAI, [], [30, 50, -20, -20, 50]],
	TownTank: [[eweapspecs.hprailgun], [4, 50, 100, 5], 6, 30, 4096, 8, 1, StupidAI, [], [0, 50, 0, 0, -50]],
	RailgunTank: [["Railgun"], [4, 20, 50, 5], 6, 30, 16384, 13, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	RocketTank: [["RocketLauncher"], [2, 15, 50, 5], 6, 30, 16384, 14, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	PincerTank: [["Drill"], [15, 20, 50, 5], 5, 35, 32768, 15, 1, StupidAI, [], [0, 50, 0, 0, -50]],
	TerrorTank: [["UberLaser"], [15, 40, 150, 4], 5, 40, 262144, 18, 1, RangedAI, [], [300, 50, 0, 0, -50]],
	SuperRocketTank: [[eweapspecs.bossrlaunch], [35, 50, 500, 7], 5, 30, 1<<22, 25, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	RedTank: [["Flamethrower", "LightLaser"], [1, 5, 10, 5], 5, 12, 16, 3, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	
	// Military subclasses - base resistances: [-50, 0, 0, 0, 50]
	SentryDroid: [["NinjaStarLauncher"], [8, 10, 20, 7], 10, 15, 128, 7, 1, SneakyAI, [0.5], [-50, 0, 0, 0, 50]],
	MechDroid: [["LightningGun"], [4, 20, 50, 4], 5, 30, 2048, 11, 1, StupidAI, [], [-50, 0, 0, 0, 50]],
	Copter: [["GatlingGun"], [4, 10, 100, 5], 5, 35, 8192, 12, 1, RangedAI, [], [-50, 0, 0, 0, 50]],
	WarChopper: [[eweapspecs.bossggun1], [8, 30, 200, 5], 5, 40, 262144, 18, 1, RangedAI, [], [-50, 300, 0, 0, 50]],
	CombatDroidZero: [[eweapspecs.bossnjstar2], [15, 20, 200, 7], 5, 30, 262144, 18, 1, SneakyAI, [], [-50, 300, 0, 0, 50]],
	AssassinDroid: [[eweapspecs.bossnjstar5], [35, 50, 500, 3], 5, 20, 1<<22, 25, 1, SneakyAI, [0.9, 100, true], [-50, 300, 0, 0, 50]],
	SupportCopter: [["GatlingGun", eweapspecs.summonmc, eweapspecs.summonsd],
		[1, 15, 100, 2], 5, 40, 16384, 12, 1, SneakyAI, [1], [-50, 0, 0, 0, 50]],
	MicroCopter: [["GatlingGun"], [2, 10, 20, 5], 5, 20, 4096, 10, 1, RangedAI, [], [-50, 0, 0, 0, 50]],

	// Direct subclasses of Enemy (mostly bosses)
	Minument: [["Taser"], [6, 10, 20, 3], 8, 25, 32, 4, 3, DroneAI, [], [25, -25, 0, 0, 0]],
	Monument: [[eweapspecs.montaser, eweapspecs.summonmin], [12, 10, 50, 2], 8, 75, 512, 6, 3, RangedAI, [], [25, -25, 0, 0, 0]],
	Arsenal: [[
		["MachineGun", [], ["Accurate", 5]],
		["HomingMissileLauncher"],
		["Flamethrower", [], ["Accurate", 5]],
		["Taser", [], ["Accurate", 5]],
		["HeavyLaser"],
	], [10, 15, 200, 2], 8, 75, 4096, 10, 3, RangedAI, [], [25, 25, 25, -25, 25]],
	Chalfont: [["MachineGun", "LightLaser"], [10, 5, 100, 10], 8, 10, 2048, 10, 3, DroneAI, [], [0, 0, 0, -100, 100]],
	Latimer: [["LightningGun"], [5, 5, 100, 4], 8, 15, 4096, 10, 3, RangedAI, [], [-50, 0, 50, 0, 0]],
	Goldhawk: [["GatlingGun", "Cannon", ["Shotgun", [], ["BOSS", 3]]],
		[4, 25, 150, 3], 8, 15, 32768, 14, 3, DroneAI, [60, 40, true], [0, 0, 0, 0, 0]],
	Hyde: [[
		["Drill", [], ["BOSS", 3, "Accurate", 1]],
		["Summon", ["Bat", 40, 10]],
	], [12, 50, 300, 8], 8, 100, 131072, 15, 3, StupidAI, [], [0, 0, 0, 0, 0]],
	ChalfontAndLatimer: [["LightningGun", ["HeavyLaser", [], ["BOSS", 2]]],
		[13, 50, 300, 10], 10, 25, 524288, 17, 1, DroneAI, [60, 15, true], [0, 0, 0, 0, 0]],
	GoldhawkReloaded: [[
		["GatlingGun", [], ["HighPowered", [], -8]],
		["Shotgun", [], ["BOSS", 2]],
		["RocketLauncher", [], ["BOSS", 2, "SuperCooled", 20]],
	], [9, 40, 500, 3], 8, 15, 1048576*4, 20, 3, DroneAI, [80, 30, true], [0, 0, 0, 0, 0]],
	Hornchurch: [[
		["LightLaser"],
		["Summon", ["Copter", null, 100]],
		["Summon", ["RailgunTank", null, 150]],
		["Summon", ["MoonSpider", null, 200]],
		["Summon", ["CombatDroidZero", null, 300]],
	], [1, 30, 200, 6], 12, 15, 2049152*4, 20, 3, SneakyAI, [1, 100, 20], [-50, 0, 50, 0, 0]],
	RoboCherub: [["Taser"], [5, 10, 100, 7], 8, 10, 32768, 0, 2, DroneAI, [80, 30], [0, 0, 0, 0, 0]],
	RoboSeraph: [["Taser"], [5, 10, 100, 7], 8, 10, 32768, 0, 2, DroneAI, [80, 30], [0, 0, 0, 0, 0]],
	StPancras: [[
		["UberLaser", [], ["BOSS", 1]],
		["Summon", ["RoboCherub", 1.5, 1, 4]],
		["Summon", ["RoboSeraph", 1.5, 1, 4]],
	], [10, 40, 1000, 4], 8, 50, 1, 24, 3, RangedAI, [], [0, 0, 0, 0, 0]],
	Pimlico: [[
		["UberLaser", [], ["BOSS", 3]],
		["GatlingGun", [], ["BOSS", 3]],
		["PlasmaGun", [], ["BOSS", 3]],
		["NapalmThrower", [], ["BOSS", 3]],
		["Railgun", [], ["BOSS", 3]],
		["RocketLauncher", [], ["BOSS", 3]],
	], [30, 100, 2500, 1000], 6, 15, 4294967296, 50, 3, DroneAI, [200, 60], [0, 0, 0, 0, 0]],
}
var enemynameinfo = {
	SmallScorpion: "Scorpion",
	TinyScorpion: "Scorpion",
	TownTank: "Railgun Tank",
	MiniSawDroneCW: "Mini Saw Drone (Clockwise)",
	MiniSawDroneCCW: "Mini Saw Drone (Counter-Clockwise)",
	ChalfontAndLatimer: "Chalfont/Latimer Fusion",
	GoldhawkReloaded: "Goldhawk",
	Hornchurch: "Robo-Pope Hornchurch 0x0D",
	RoboCherub: "Robo-Cherub",
	RoboSeraph: "Robo-Seraph",
	StPancras: "St. Pancras",
}
var packinfo = {
	ScorpionPack: ["Scorpion", 2, "SmallScorpion", 3, "TinyScorpion", 6],
	TankPack: ["MachineGunTank", 3, "HeavyTank", 1, "RedTank", 6],
	SawDronePack: ["SawDrone", 2, "MiniSawDroneCW", 6, "MiniSawDroneCCW", 6],
	SupportCopterPack: ["SupportCopter", 2, "Copter", 4, "MechDroid", 4],
	VarietySpiderPack: ["VarietySpiderR", 3, "VarietySpiderY", 3, "VarietySpiderG", 3, "VarietySpiderB", 3],
}

function makeEnemy(type, mission, pos, bearing) {
	if (type in enemyinfo) {
		var enemy = new Enemy()
		var info = enemyinfo[type], weaponspecs = info[0], stats = info[1], guardradius = info[2]
		var size = info[3], xpvalue = info[4], dropLevel = info[5], explosions = info[6]
		var ai = info[7], aiargs = info[8], resists = info[9]
		var name = enemynameinfo[type] || splitcap(type)
		var weapons = weaponspecs.map(makeWeapon)
		stats = CombatStats.apply(null, stats)
		enemy.init(mission, pos, weapons, stats, guardradius, size, xpvalue, name, bearing,
			explosions, ai, aiargs, dropLevel)
		enemy.resistances[Damage.laser] += resists[0]
		enemy.resistances[Damage.physical] += resists[1]
		enemy.resistances[Damage.fire] += resists[2]
		enemy.resistances[Damage.electric] += resists[3]
		enemy.resistances[Damage.explosion] += resists[4]
	} else if (type in packinfo) {
		var enemy = new PackSpawner()
		enemy.init(mission, pos, packinfo[type])
	} else {
		throw "Unknown enemy type: " + type
	}
	return enemy
}


// Mines moved from actor.py - seems more appropriate here
// I moved some stuff around between Mine, ProximityMine, and TimedMine constructors
function Mine() {
}
Mine.prototype = extend(Enemy.prototype, {
	dontlogdamage: true,
	init: function (owner, damageamt, blast, name, aiclass, aiargs) {
		var weap = makeWeapon(["SuicideBomb", [damageamt, Damage.explosion, blast]])
		var stats = CombatStats(1, 1, 1, 0)  // speed = 0 always
		Enemy.prototype.init.call(this, owner.mission, owner.pos, [weap], stats, 20, 10, 0, name,
			owner.bearing, 0, aiclass, aiargs)
		this.solid = false
	},
	
	die: function () {
		var mine = this, mission = this.mission
		this.allweapons.forEach(function (w) {
			w.fire(mine, null)
			mission.dispatch_event("on_explode", mine)
		})
		Enemy.prototype.die.call(this)
	},

	isObjective: function () {
		return false
	},
})

// A bit of a special case
// Inherits from Mine, but constructed with makeProjectile
function HomingMissile() {
}
HomingMissile.prototype = extend(Mine.prototype, {
	init: function (owner, bearing, damageamt) {
		var blast = 20, speed = 5
		var weap = makeWeapon(["SuicideBomb", [damageamt, Damage.explosion, blast]])
		var stats = CombatStats(1, 1, 1, speed)
		Enemy.prototype.init.call(this, owner.mission, owner.pos, [weap], stats, 20, 10, 0, "Rocket",
			bearing, 0, HomingAI, [owner])
		this.solid = false
	},
})

function makeMine(type, owner, damageamt, blast, weapid) {
	var mine = new Mine()
	if (type == "ProximityMine") {
		mine.init(owner, damageamt, blast, "Proximity Mine", ProximityMineAI, [owner])
	} else if (type == "TimedMine") {
		mine.init(owner, damageamt, blast, "Timed Mine", TimedMineAI, [120])
	}
	// Mine's weapon's kills are actually credited to the mine layer
	mine.weapon.id = weapid
	return mine
}







function GameCursor(modehandler) {
	this.modehandler = modehandler
	this.entity_under_cursor = null
	this.mode = "walk"
}
GameCursor.prototype = {
	update: function (x, y) {
		if (!this.modehandler) return
		if (!this.modehandler.can_click()) {
			this.mode = "inactive"
			return
		}
		this.mode = "walk"

		var mpos = this.modehandler.get_mouse_world_coordinates()
		var es = this.modehandler.mission.entities.entitiesWithin(mpos, CURSOR_RADIUS)
		var anactor = null, sometreasure = null, anentity = null, theprotag = null
		var broken = false
		for (var id in es) {
			var e = es[id]
			if (e.isactor) {
				anactor = e
				if (e.hostile) {
					this.entity_under_cursor = e
					this.mode = "fire"
					broken = true
					break
				}
				if (e.talkScript) {
					this.entity_under_cursor = e
					this.mode = "talk"
				}
			}
			if (e.istreasure) {
				sometreasure = e
			}
			if (e !== this.modehandler.mission.protag) {
				anentity = e
				continue
			}
			theprotag = e
		}
		if (!broken) {
			this.entity_under_cursor = anactor || sometreasure || anentity || theprotag
		}
	},
	draw: function () {
		if (settings.cursor) {
			var x = this.modehandler.mouse_x, y = this.modehandler.mouse_y
			graphics.drawcursor(this.mode, x, y, {hud: true})
			canvas.style.cursor = "none"
		} else {
			canvas.style.cursor = {
				"walk": "crosshair",
				"fire": "pointer",
				"inactive": "wait",
				"talk": "pointer",
			}[this.mode]
		
		}
	},
}



var treasuretables = {
	drop: function (mission, pos, dropLevel) {
		if (UFX.random() < this.noDropChance(dropLevel)) return
		if (UFX.random() < this.getMetalChance(dropLevel)) {
			this.dropMetal(mission, pos, dropLevel)
		} else {
			if (UFX.random() < 0.75) {
				var item = makeWeapon(this.getRandomWeaponSpec(dropLevel))
			} else {
				var item = makeArmour.apply(null, this.getRandomArmourSpec(dropLevel))
			}
			new DroppedEquippable(mission, item, pos)
		}
	},

	
	noDropChance: function (dropLevel) {
		return dropLevel ? Math.pow(0.9, dropLevel + 1) : 1
	},
	
	getMetalChance: function (dropLevel) {
		return Math.max(0.5, 1 - 0.02 * dropLevel)
	},
	
	getMetal: function (dropLevel) {
		while (!metaldrops[dropLevel]) --dropLevel
		var metal = metaldrops[dropLevel]
		var r = UFX.random()
		for (var j = 0 ; j < plotstate.act ; ++j) {
			if (metal[j+1] < r) return j
		}
		return plotstate.act - 1
	},
	
	dropMetal: function (mission, pos, dropLevel) {
		var which = this.getMetal(dropLevel)
		var amount = UFX.random.rand(1, dropLevel * 16 >> which)
		new Metal(mission, METALS[which], amount, pos)
	},
	
	// Returns a weapon spec rather than an actual instantiated weapon : replaces getRandomWeapon
	getRandomWeaponSpec: function (dropLevel) {
		if (dropLevel == 0) return null
		var totalLevel = UFX.random.rand(Math.floor(dropLevel * 5/8), Math.floor(dropLevel * 5/4) + 1)
		var weaponLevel = UFX.random.rand(1, totalLevel + 2)
		while (!weaponLevels[weaponLevel]) --weaponLevel
		var modLevel = totalLevel - weaponLevel
		var type = UFX.random.choice(weaponLevels[weaponLevel])
		var mods = this.randomMods(modLevel, weaponModTypes)
		var itemLevel = totalLevel
		return [type, null, mods, itemLevel]
	},

	// Returns an armour spec rather than an actual instantiated piece of armour : replaces getRandomArmour
	getRandomArmourSpec: function (dropLevel) {
		if (dropLevel == 0) return null
		var modLevel = UFX.random.rand(Math.floor(dropLevel / 2), dropLevel + 2)
		var mods = this.randomMods(modLevel, armourModTypes)
		var itemLevel = modLevel
		return [mods, itemLevel]
	},

	// Replaces addRandomMods
	randomMods: function (modLevel, availablemods) {
		var chosen = {}, mods = []
		while (modLevel > 0 && Object.keys(chosen).length < availablemods.length) {
			var level = UFX.random.rand(1, modLevel + 2)
			do {
				var modtype = UFX.random.choice(availablemods)
			} while (chosen[modtype])
			chosen[modtype] = true
			var modtypeLevel = modtypeLevels[modtype]
			var awesomeness = Math.floor(level / modtypeLevel)
			if (awesomeness > 0) {
				modLevel -= awesomeness * modtypeLevel
				mods.push(modtype, awesomeness)
			}
		}
		return mods.length ? mods : null
	},

}

var weaponLevels = {
	1: ["LightLaser", "LightRepairKit"],
	2: ["MachineGun"],
	3: ["Taser"],
	4: ["Shotgun"],
	5: ["Flamethrower", "TimedMineLayer"],
	6: ["HeavyLaser"],
	7: ["SniperRifle", "Bazooka"],
	8: ["LightningGun", "SuperRepairKit"],
	10: ["Cannon"],
	12: ["IncendiaryRifle", "ProximityMineLayer", "ChainLightningGun"],
	14: ["GatlingGun", "Railgun", "UberLaser", "NapalmThrower", "PlasmaGun", "RocketLauncher"],
}

var weaponModTypes = ["Accurate", "Assault", "Autofiring", "Efficient", "HighPowered", "Holy", 
	"MasterCrafted", "Overclocked", "RapidFire", "Scoped", "Smart", "SuperCooled"]

var armourModTypes = ["Rubber", "Iron", "Mercury", "Chrome", "Asbestos", "Spiky", "Lightning", "Phoenix", "Giants",
	"Chromatic", "Juggernaut", "Conductive", "Crystal", "Wooden", "Sturdy", "Shiny", "FlameRetardant", "Insulated",
	"BlastProof", "Warriors", "Tough", "Oiled", "Capacitative", "Inductive", "Medical", "Berserkers",
	"Glass", "Alcoholic", "Elemental", "Mighty", "Enchanted", "Energetic", "Overlords"]



metaldrops = {
    0: [1, 0, 0, 0, 0, 0],
    1: [1, 0, 0, 0, 0, 0],
    2: [1, 0, 0, 0, 0, 0],
    3: [1, 0, 0, 0, 0, 0],
    4: [1, 0, 0, 0, 0, 0],
    6: [1, 0.1, 0, 0, 0, 0],
    7: [1, 0.2, 0, 0, 0, 0],
    8: [1, 0.4, 0, 0, 0, 0],
    9: [1, 0.5, 0.1, 0, 0, 0],
    10: [1, 0.6, 0.1, 0, 0, 0],
    11: [1, 0.7, 0.2, 0, 0, 0],
    12: [1, 0.75, 0.3, 0.05, 0, 0],
    13: [1, 0.75, 0.4, 0.1, 0, 0],
    14: [1, 0.8, 0.4, 0.15, 0, 0],
    15: [1, 0.8, 0.5, 0.2, 0.05, 0],
    16: [1, 0.8, 0.6, 0.3, 0.1, 0],
    17: [1, 0.8, 0.6, 0.4, 0.2, 0],
    18: [1, 0.8, 0.6, 0.4, 0.2, 0],
    19: [1, 0.8, 0.6, 0.4, 0.2, 0],
    20: [1, 0.8, 0.6, 0.4, 0.2, 0],
}


function Mission(handler) {
	this.handler = handler
	// set map, protag, actors, scripts
	this.dead = {}
	this.born = {}
	
	this.ejectScript = null
	this.startScript = null
	this.clearScript = null
	this.canEject = false
	this.isTimed = false
	this.entities = new EntityIndex()
	this.style = "basic"
	this.bosses = []
	this.scripts = []

	setupMission(plotstate, this)
	
	this.isCutscene = false
	this.scriptQueue = []
	this.currentScript = null
}
Mission.prototype = {	
	addProtagAnywhere: function () {
		return this.addProtag(this.map.getClearSpace())
	},
	addProtag: function (pos) {
		this.protag = new Protag(this, pos)
		this.entities.add(this.protag)
		return this.protag
	},
	addScenery: function (type, pos, bearing) {
		var s = makeScenery(type, this, pos, bearing)
		this.entities.add(s)
		return s
	},
	// Partially replaces addEntity
	addNPC: function (pos, bearing, name) {
		var npc = new Actor(this, pos, undefined, undefined, bearing, false, name)
		this.entities.add(npc)
		return npc
	},
	addEnemy: function (type, pos, bearing) {
		var enemy = makeEnemy(type, this, pos, bearing)
		this.entities.add(enemy)
		return enemy
	},
	addBoss: function (type, pos, bearing) {
		var boss = this.addEnemy(type, pos, bearing)
		this.bosses.push(boss)
		return boss
	},
	placeEnemiesRandomlyAnywhere: function (enemies, outOfSight) {
		if (outOfSight === undefined) outOfSight = true
		var m = this.map, cells = m.cellkeys.splice(0), p = this.protag.pos
		if (outOfSight) {
			cells = cells.filter(function (n) { return !m.hasLOS(p, m.cellCentre(gridxy(n)))})
		}
		this.placeEnemiesRandomly(enemies, cells)
	},
	placeEnemiesRandomly: function (enemies, unusedCells) {
		UFX.random.shuffle(unusedCells)
		for (var type in enemies) {
			var nenemies = enemies[type]
			if (DEBUG.minidungeons) nenemies = Math.ceil(nenemies / 20)
			for (var j = 0 ; j < nenemies ; ++j) {
				var celln = unusedCells.pop()
				var abspos = this.map.cellCentre(gridxy(celln))
				var newEnemy = makeEnemy(type, this, abspos)
				// squad seems like it's always empty, so ignore it (leave off method placeSquad)
				this.entities.add(newEnemy)
			}
		}
	},
	
	runScript: function (myScript, delay) {
		if (delay || this.currentScript) {
			this.scriptQueue.push([delay || 0, myScript])
		} else {
			this.currentScript = myScript
			if (myScript.state !== "endConversation") {
				myScript.restart()
			}
			myScript.state = "running"
			this.advanceScript()
		}
	},
	advanceScript: function () {
		if (!this.currentScript) return
		if (this.currentScript.state === "frozen") {
			this.currentScript.freezeTicks--
			if (this.currentScript.freezeTicks <= 0) {
				this.currentScript.state = "running"
			}
		}
		if (this.currentScript.state === "running") {
			this.currentScript.advance()
		}
		switch (this.currentScript.state) {
			case "waitKey": case "waitChoice": break
			case "terminated": case "endConversation": this.currentScript = null ; break
			case "endMission": UFX.scene.swap("missionmode") ; break
			case "endGame": UFX.scene.pop() ; break
		}
	},

	tick: function () {
		if (this.scriptQueue.length && !this.currentScript) {
			this.scriptQueue.sort(function (s1, s2) { return s2[0] - s1[0] })
			if (this.scriptQueue[0][0] <= 0) {
				this.currentScript = this.scriptQueue.shift()[1]
				this.currentScript.state = "running"
			}
			for (var j = 0 ; j < this.scriptQueue.length ; ++j) {
				this.scriptQueue[j][0]--
			}
		}
		this.advanceScript()

		if (!this.currentScript) {
			var es = this.entities.entitiesWithin(this.protag.pos, ENTITY_TICK_DISTANCE)
			for (var id in es) { es[id].tick() }
			var clear = this.missionCleared()
			this.entities.removeSet(this.dead)
			this.dead = {}
			for (var id in this.born) {
				this.entities.add(this.born[id])
			}
			if (!clear) {
				if (this.missionCleared() && this.clearScript) {
					this.runScript(this.clearScript)
				}
			}
			this.born = {}
		}
	},
	
	closestHostileTo: function (pos, radius, requireLOS, requireAlive, requireObjective) {
		var hostiles = [], es = this.entities.entitiesWithin(pos, radius)
		for (var id in es) {
			var e = es[id]
			if (!(e instanceof Actor)) continue
			if (!e.hostile) continue
			if (requireObjective && !e.isObjective()) continue
			if (requireAlive && e.currenthp <= 0) continue
			hostiles.push(e)
		}
		if (!hostiles.length) return null
		var px = pos[0], py = pos[1]
		hostiles.sort(function (item) {
			var dx = px - item.pos[0], dy = py - item.pos[1]
			return dx * dx + dy * dy
		})
		if (!requireLOS) return hostiles[0]
		for (var j = 0 ; j < hostiles.length ; ++j) {
			if (this.map.hasLOS(pos, hostiles[j].pos)) {
				return hostiles[j]
			}
		}
		return null
	},

	missionCleared: function () {
		for (var n in this.entities.ei) {
			for (var id in this.entities.ei[n]) {
				var e = this.entities.ei[n][id]
				if (e instanceof Actor && e.isObjective()) {
					return false
				}
			}
		}
		return true
	},

	getHostileAt: function (pos) {
		var es = this.entities.entitiesAt(pos)
		for (var j = 0 ; j < es.length ; ++j) {
			var e = es[j]
			if (e instanceof Actor && e.hostile) {
				return e
			}
		}
		return null
	},
	
	getActorAt: function (pos, includeprotag) {
		if (includeprotag === undefined) includeprotag = true
		var es = this.entities.entitiesAt(pos)
		for (var j = 0 ; j < es.length ; ++j) {
			var e = es[j]
			if (e instanceof Actor && (includeprotag || e !== this.protag)) {
				return e
			}
		}
		return null
	},
	
	registerScript: function (script) {
		this.scripts.push(script)
	},

	actorTalkScript: function (spec, pos, name, stats, bearing, radius) {
		stats = stats || CombatStats(1, 1, 1, 1)
		bearing = bearing || 0
		radius = radius === undefined ? 15 : radius
		var e = new Actor(this, pos, stats, radius, bearing, false, name)
		this.entities.add(e)
		e.setTalkScript(spec)
	},
	enemyDeathScript: function (spec, etype, pos, bearing) {
		var e = makeEnemy(etype, this, pos)
		if (bearing !== undefined) e.bearing = bearing
		this.entities.add(e)
		e.setDeathScript(spec)
	},
	setStartScript: function (script) {
		this.startScript = new Script(script, this)
	},
	setEjectScript: function (script) {
		this.ejectScript = new Script(script, this)
	},
	setClearScript: function (script) {
		this.clearScript = new Script(script, this)
	},

	// I guess this is what this thing does in pyglet
	dispatch_event: function (type) {
		// Not sure if this is necessary, but events handled during the mission's constructor
		//   can fail otherwise if they reference this.mission
		if (this.handler.mission !== this) return
		if (!this.handler[type]) throw "Unable to handle " + type
		var args = Array.prototype.splice.call(arguments, 1)
		this.handler[type].apply(this.handler, args)
	},

}



UFX.scenes.missionmode = {
	start: function () {
		//This would be a great place to call text.cleanup() if it turns out to be necessary.

		this.setsizes()
		this.inventory_mode = false
		this.eject_mode = false
		
		this.choice_mode = false

		this.mission = new Mission(this)
		log.startscene()

		this.walls = this.mission.map.getWalls()
		// this.world_chunks = {}
		this.wall_colour = wall_colours[this.mission.style]
		this.floor_colour = floor_colours[this.mission.style]
		// Note: this was originally based on the screen size, but I want to have variable screen sizes
		this.world_chunk_x = 8
		this.world_chunk_y = 8
		graphics.makeworldchunks(this.mission.map, this.world_chunk_x, this.world_chunk_y)
		this.new_xp = 0
		this.new_xp_delay = 0
		this.last_get_float = 0

		this.lasers = {}
		this.lightnings = {}
		// I don't reuse textures so there's no reason for dead_floaties as far as I'm concerned.
		this.floaties = []
		this.bullets = []
		this.claws = {}
		this.trails = []
		
		this.last_bullet_sound = -100
		this.hud_mouseover_target = null
		
		this.hide_hud = false

		this.dialogue_changed = true

		this.frameno = 0
		this.totalframeno = 0  // also includes frames during scripts
		this.current_zoom = 1.0
		this.desired_zoom = 1.0
		this.current_hud_zoom = 1.0
		this.desired_hud_zoom = 1.0
		
		this.drag_to_move = false
		this.mouse_protected = 0
		this.mouse_x = this.mouse_y = 0
		this.cursor = new GameCursor(this)
		
		if (this.mission.startScript) {
			this.mission.runScript(this.mission.startScript)
		}
	},
	
	setsizes: function () {
		var scr_h = settings.scr_h, scr_w = settings.scr_w

		var equipment_icons = []
		while (equipment_icons.length < MAX_NUM_WEAPONS + 1) {
			var px = (HUD_MARGIN + (HUD_ICON_SIZE + HUD_SPACING) * equipment_icons.length) * scr_h
			var py = HUD_MARGIN * scr_h
			var sx = HUD_ICON_SIZE * scr_h, sy = sx
			var f = this.weapon_clicked.bind(this, equipment_icons.length)
			equipment_icons.push(new Button(f, px, py, sx, sy, null))
		}
		this.equip_icons = equipment_icons
		this.update_weapons()
		
		var px = scr_w - (HUD_ICON_SIZE + HUD_MARGIN) * scr_h, py = HUD_MARGIN * scr_h
		var sx = HUD_ICON_SIZE * scr_h, sy = sx
		this.eject_icon = new Button(this.eject_clicked.bind(this), px, py, sx, sy, gdata.eject)
		
		this.portrait_ypos = PORTRAIT_BOTTOM * scr_h
		this.portrait_height = (PORTRAIT_TOP - PORTRAIT_BOTTOM) * scr_h
		this.portrait_width = this.portrait_height * PORTRAIT_ASPECT
		this.portrait_l_xpos = PORTRAIT_PAD * scr_h
		this.portrait_r_xpos = scr_w - (PORTRAIT_PAD * scr_h) - this.portrait_width
		this.dialogue_gutter = BOX_GUTTER * scr_h
		
		this.hud_portrait_ypos = HUD_PORTRAIT_BOTTOM * scr_h
		this.hud_portrait_height = (1 - HUD_MARGIN - HUD_PORTRAIT_BOTTOM) * scr_h
		this.hud_portrait_width = this.hud_portrait_height * HUD_PORTRAIT_ASPECT
		this.hud_portrait_xpos = scr_w - HUD_MARGIN * scr_h - this.hud_portrait_width
		this.mouseover_pad = MOUSEOVER_PAD * scr_h

		// This is a little bit of a hack - the inventory menu will reset its state when you
		// resize the window. But it's much easier than resizing everything.
		this.inventory_menu = new ScrollingInventoryMenu(this.close_inventory.bind(this))
	},
	
	get_mouse_world_coordinates: function () {
		return this.mouse_to_world(this.mouse_x, this.mouse_y)
	},

	mouse_to_world: function (x, y) {
		var scale = settings.scr_h * this.current_zoom / WORLD_SCREEN_HEIGHT
		return [
			this.mission.protag.pos[0] + (x - settings.scr_w/2) / scale,
			this.mission.protag.pos[1] + (y - settings.scr_h/2) / scale,
		]
	},
	
	set_mouse: function (x, y) {
		this.mouse_x = x
		this.mouse_y = y
	},
	
	get_hud_mouseover_message: function () {
		var mx = this.mouse_x, my = this.mouse_y
		for (var idx = 0 ; idx < this.weapon_icons.length ; ++idx) {
			var btn = this.weapon_icons[idx]
			if (btn.point_within(mx, my)) {
				if (idx == robotstate.weaponry.length) break
				var wpn = robotstate.weaponry[idx]
				if (wpn) return wpn.description()
			}
		}
		
		if (this.armour_icon.point_within(mx, my) && robotstate.armoury)
			return robotstate.armoury.description()
		
		if (this.eject_icon.point_within(mx, my) && this.mission.canEject) {
			return this.eject_mode ? "Eject (click to confirm)" : "Eject (click twice to activate)"
		}
		
		var target = this.cursor.entity_under_cursor
		return target ? target.describe() : ""
	},

	draw_metal: function () {
		var fontsize = HUD_FONT_SMALL * settings.scr_h, dy = Math.round(fontsize * 1.3)
        var x = HUD_MARGIN * settings.scr_h, y = (HUD_MARGIN + HUD_ICON_SIZE) * settings.scr_h + dy
        var texts = []
        for (var j = 0 ; j < METALS.length ; ++j) {
        	var metal_name = METALS[j], amount = robotstate.metal[j]
        	if (!amount) continue
        	texts.push(metal_name + ": " + amount)
    	}
    	texts.reverse()
    	texts.forEach(function (t, j) {
    		text.drawhud(t, x, y, fontsize, "white", "left", "bottom")
        	y += dy
    	})
	},
	
	draw_mouseover: function () {
		var s = this.get_hud_mouseover_message()
		if (!s) return
		var x = 0.5 * settings.scr_w, y = 0.25 * settings.scr_h, p = MOUSEOVER_PAD * settings.scr_h
		var tw = HUD_MOUSEOVER_WIDTH * settings.scr_h
		var fontsize = Math.round(HUD_FONT_SMALL * settings.scr_h)
		text.drawhudborder(s, x, y, fontsize, "white", p, "center", "middle", tw, "center")
	},
	
	draw_portrait: function () {
		var protag = this.mission.protag
		var px = this.hud_portrait_xpos, py = this.hud_portrait_ypos
		var sx = this.hud_portrait_width, sy = this.hud_portrait_height
		var health = protag.currenthp / robotstate.getMaxHP()
		graphics.drawhudrect([px, py], [sx, sy], [1, 1, 1, 1], [0, 0, 0, 0.8])
		var colour = [1.0 - health, health, 0.0]
		graphics.draw(gdata.portraits.Camden, px, py, sy, 0, {colour: colour, hud: true})
	},
	
	draw_stats: function () {
		var protag = this.mission.protag
		var hp = Math.max(0, protag.currenthp), maxhp = robotstate.getMaxHP()
		var energy = Math.ceil(protag.currentEnergy * 100 / robotstate.getMaxEnergy())
		var level = robotstate.level, xp = this.format_xp(robotstate.xp)
		
		var x = settings.scr_w - HUD_MARGIN * settings.scr_h
		var y = (HUD_PORTRAIT_BOTTOM - HUD_SPACING) * settings.scr_h
		var fontsize = Math.ceil(HUD_FONT_SMALL * settings.scr_h), dy = Math.round(fontsize * 1.3)
		var texts = [
			hp.toFixed(0) + " / " + maxhp + " hp",
			energy + "% energy",
			"Level " + level,
			xp + " XP",
		]
		texts.forEach(function (t, j) {
			text.drawhud(t, x, y-j*dy, fontsize, "white", "right", "top")
		})
	},
	
	draw_targetinfo: function () {
		var target = this.mission.protag.targ
		if (!target || !target.hostile) return
		var txt = target.describe()
		var fontsize = HUD_FONT_SMALL * settings.scr_h
		var infotext = text.gettexture(txt, fontsize, "white", HUD_TARGETINFO_WIDTH*settings.scr_h)
		var r = Math.max(target.r, infotext.w1 / 2)
		var p = HUD_TARGETINFO_PAD * settings.scr_h
		var w = 2 * (r + p)

		var tx = HUD_TARGETINFO_LEFT * settings.scr_w, x = tx - p
		var ty = settings.scr_h - w - 2 * p, y = ty + p
		var h = infotext.h1 + p
		
		graphics.drawhudrect([x,y-h-p], [w,h+w], [1,1,1,1], [0,0,0,0.8])
		var opts = { frameno: this.frameno, state: target.anim_state, turretbearing: target.turretbearing, hud: true }
		graphics.draw(gdata.sprites[target.name], x+r+p, y+r, 2*target.r, target.bearing/57.3, opts)
		infotext.drawhud(tx, ty, "left", "top")
	},
	
	draw_hud: function () {
		this.draw_mouseover()
		this.draw_portrait()
		this.draw_stats()
		this.draw_metal()
		this.draw_targetinfo()
		
		// Mission timer
		if (this.mission.isTimed) {
			var ticks = ROBOT_DUNGEON_TIME_LIMIT - this.mission.protag.numticks
			var seconds = Math.floor(ticks / MAX_FRAME_RATE)
			if (seconds <= 0) {
				var timer_text = "0:00"
			} else {
				var mins = Math.floor(seconds / 60), secs = seconds - mins * 60
				var timer_text = mins + (secs < 10 ? ":0" : ":") + secs
			}
			var x = 0.5 * settings.scr_w, y = (1 - HUD_MARGIN) * settings.scr_h
			var fontsize = Math.round(HUD_FONT_LARGE * settings.scr_h)
			text.drawhud(timer_text, x, y, fontsize, "white", "center", "top")
		}
		
		this.weapon_icons.forEach(function (b) { b.draw() })
		this.armour_icon.draw()
		
		if (this.mission.canEject) this.eject_icon.draw()
	},
	
	draw_lightning: function (srcpos, targetpos) {
		var points = [], npoints = Math.floor(0.05 * distanceBetween(srcpos, targetpos)) + 1
		for (var n = 0 ; n < npoints + 1 ; ++n) {
			var a = n / npoints
			points.push(srcpos[0] * (1-a) + targetpos[0] * a + UFX.random.normal(0, 5))
			points.push(srcpos[1] * (1-a) + targetpos[1] * a + UFX.random.normal(0, 5))
		}
		graphics.setcolour([0.8, 0.8, 1.0])
		graphics.drawstrip(points)
	},
	
	draw_bullet: function (src, target, radius) {
		var angle = Math.atan2(src[1] - target[1], src[0] - target[0])
		var r = radius - 5, c = Math.cos(angle), s = Math.sin(angle)
		var offset = UFX.random.normal(5)
		var x = target[0] + r*c + offset*s, y = target[1] + r*s - offset*c
		graphics.draw(gdata.splash, x, y, 5, angle*57.3, {colour: [1,1,1]})
		if (UFX.random() < 0.5)
			graphics.drawstrip([src[0], src[1], x, y])
	},
	
	draw_claw: function (pos, is_left) {
		graphics.draw(gdata[is_left ? "leftclaw" : "rightclaw"], pos[0]-10, pos[1]-10, 20, 0, { colour: [1,0,0] })
	},
	
	draw_trail: function (pos, bearing, trailtype, time) {
		var c = trail_colours[trailtype]
		var f = 0.1 * time, g = 1 - f
		var colour = [f*c[0]+g*c[3], f*c[1]+g*c[4], f*c[2]+g*c[5]]
		graphics.draw(gdata.trail, pos[0], pos[1], 15 - time, bearing, {colour: colour})
	},
	
	draw_world: function (minx, miny, maxx, maxy) {
		var cs = this.mission.map.csize
		var mincx = Math.floor(Math.floor(minx/cs - 1) / this.world_chunk_x)
		var mincy = Math.floor(Math.floor(miny/cs - 1) / this.world_chunk_y)
		var maxcx = Math.floor(Math.floor(maxx/cs) / this.world_chunk_x)
		var maxcy = Math.floor(Math.floor(maxy/cs) / this.world_chunk_y)
		graphics.setcolour(this.floor_colour)
		for (var cx = mincx ; cx <= maxcx ; ++cx) {
			for (var cy = mincy ; cy <= maxcy ; ++cy) {
				graphics.drawworldchunk(cx, cy, this.floor_colour, this.wall_colour)
			}
		}
	},
	draw_world_chunk_slow: function (cx, cy) {
		var cs = this.mission.map.csize
		for (var dx = 0 ; dx < this.world_chunk_x ; ++dx) {
			var x = dx + this.world_chunk_x * cx
			for (var dy = 0 ; dy < this.world_chunk_y ; ++dy) {
				var y = dy + this.world_chunk_y * cy
				var n = gridn(x, y)
				if (this.mission.map.cells[n]) {
					graphics.setcolour(this.floor_colour)
					graphics.drawfloor(x, y, cs)
				}
				if (this.walls[n]) {
					graphics.setcolour(this.wall_colour)
					graphics.drawwall(this.walls[n], x, y, cs)
				}
			}
		}
	},
	make_world_chunk: function(cx, cy) {
		// The original used display lists but webGL doesn't support them. So build a big buffer
		// with all the floor and wall data
/*		var fdata = imagedata["scenery.floor1"]
		var wallps = [], floorps = []
		for (var dx = 0 ; dx < this.world_chunk_x ; ++dx) {
			var x = dx + this.world_chunk_x * cx
			for (var dy = 0 ; dy < this.world_chunk_y ; ++dy) {
				var y = dy + this.world_chunk_y * cy
				var n = gridn(x, y)
				if (this.mission.map.cells[n]) {
				}
			}
		}*/
	},

	draw_entity: function (e, pos) {
		if (!e.r) return  // size 0 explosions cause graphical glitches
		pos = pos || e.pos
		var opts = { frameno: this.frameno, state: e.anim_state, turretbearing: e.turretbearing }
		try {
			graphics.draw(gdata.sprites[e.name], pos[0], pos[1], Math.round(2 * e.r), e.bearing/57.3, opts)
		} catch (err) {
			console.log(e)
			console.log(opts)
			throw err + " ::: " + e.name
		}
		if (DEBUG.entitycircle) {
			graphics.debugcircle(pos[0], pos[1], e.r, [1,1,1])
			graphics.debugcircle(pos[0], pos[1], e.r + CURSOR_RADIUS, [0.6,0.6,0.6])
		}
	},
	draw_entities: function (minx, miny, maxx, maxy) {
		var es = this.mission.entities.entitiesWithinRect([minx, miny], [maxx-minx, maxy-miny])
		for (var id in es) {
			if (es[id].visible) this.draw_entity(es[id])
		}
		if (DEBUG.areamode) {
			var p = this.mission.protag
			for (var j = 0 ; j < p.areaScripts.length ; ++j) {
				var a = p.areaScripts[j]
				if (a.multifire) {
					graphics.drawworldrect(a.pos, a.size, [1,1,0,1], [1,1,0,0.1])
				} else {
					graphics.drawworldrect(a.pos, a.size, [0,1,0,1], [0,1,0,0.1])
				}
			}
		}
	},
	
	draw_weapon_fx: function () {
		var es = this.mission.entities.es
		for (var s in this.lasers) {
			var e0 = this.lasers[s][1], e1 = this.lasers[s][2]
			graphics.setcolour(e0 === this.mission.protag ? [1,0,0] : [0,0,1])
			graphics.drawstrip([e0.pos[0], e0.pos[1], e1.pos[0], e1.pos[1]])
		}
		for (var s in this.lightnings) {
			var e0 = this.lightnings[s][1], e1 = this.lightnings[s][2]
//			console.log(e0.pos, e1.pos, e0, e1)
			this.draw_lightning(e0.pos, e1.pos)
		}
		for (var s in this.bullets) {
			var e0 = this.bullets[s][0], e1 = this.bullets[s][1]
			this.draw_bullet(e0.pos, e1.pos, e1.r)
		}
		for (var s in this.claws) {
			var target = this.claws[s][1], left = this.claws[s][2]
			this.draw_claw(target.pos, left)
		}
		for (var j = 0 ; j < this.trails.length ; ++j) {
			this.draw_trail.apply(this, this.trails[j])
		}
	},

	draw_floaties: function () {
		for (var j = 0 ; j < this.floaties.length ; ++j) {
			var f = this.floaties[j]
			if (f.offset < 0) continue
			text.drawworld(
				f.text, f.x0, f.y0 + f.offset, Math.floor(FLOATY_FONT_SIZE * settings.scr_h),
				f.colour, "center", "middle"
			)
		}
	},
	
	draw_cursor_shadows: function () {
		var p = this.mission.protag
		if (p.scriptNodes.length) return
		if (p.dest) {
			graphics.drawcursor("walk", p.dest[0], p.dest[1], { colour: [0.5, 0.5, 0] })
		}
		if (p.targ) {
			graphics.drawcursor("fire", p.targ.pos[0], p.targ.pos[1], { colour: [0.5, 0, 0] })
		}
	},

	draw_inventory: function () {
		// NB: the original seems to reimplement this method?
		this.draw_metal()
		this.inventory_menu.draw()
	},
	
	draw_script: function () {
		var m = this.mission, s = m.currentScript, isLeft = s.speakerIsLeft

		// draw portraits
		if (s.currentLeftPortrait) {
			var px = this.portrait_l_xpos, py = this.portrait_ypos
			var sx = this.portrait_height * PORTRAIT_ASPECT, sy = this.portrait_height
			graphics.drawhudrect([px, py], [sx, sy], [1,1,1], [0,0,0,0.8])
			graphics.draw(s.currentLeftPortrait, px, py, sy, 0, {hud: true})
		}
		if (s.currentRightPortrait) {
			var px = this.portrait_r_xpos, py = this.portrait_ypos
			var sx = this.portrait_height * PORTRAIT_ASPECT, sy = this.portrait_height
			graphics.drawhudrect([px, py], [sx, sy], [1,1,1], [0,0,0,0.8])
			graphics.draw(s.currentRightPortrait, px, py, sy, 0, {hud: true})
		}
		
		var dtext = s.currentDialogue, stext = s.currentSpeaker
		var W = settings.scr_w, H = settings.scr_h
        var gutter = Math.round(BOX_GUTTER * H)
        var fontsize = Math.round(DIALOGUE_FONT_SIZE * H)
		
		if (s.menu) {
			s.menu.draw()
		} else if (dtext) {
			var tx = Math.round((isLeft ? DIALOGUE_BOX_PAD : (1 - DIALOGUE_BOX_PAD - DIALOGUE_BOX_WIDTH)) * W)
			var ty = Math.round(DIALOGUE_BOX_TOP * H)
			var tw = Math.round(DIALOGUE_BOX_WIDTH * W)
			text.drawhudborder(dtext, tx, ty, fontsize, "white", gutter, "left", "top", tw, "left", true)
		}
		
		if (stext) {
			var tx = Math.round((isLeft ? NAME_BOX_PAD : 1 - NAME_BOX_PAD) * W)
			var ty = Math.round(NAME_BOX_BOTTOM * H)
			var hanchor = isLeft ? "left" : "right"
			text.drawhudborder(stext, tx, ty, fontsize, "white", gutter, hanchor, "bottom")
		}
	},

	// ported from MissionMode.ondraw
	draw: function () {
		graphics.clear()
		var w = settings.scr_w, h = settings.scr_h, m = this.mission
		if (!m.currentScript || !m.currentScript.blankScreen) {
			graphics.cx = m.protag.pos[0]
			graphics.cy = m.protag.pos[1]
			graphics.cz = this.current_zoom * h / WORLD_SCREEN_HEIGHT
			var minp = this.mouse_to_world(0, 0), minx = minp[0], miny = minp[1]
			var maxp = this.mouse_to_world(w, h), maxx = maxp[0], maxy = maxp[1]
			this.draw_world(minx, miny, maxx, maxy)
			this.draw_entities(minx, miny, maxx, maxy)
			this.draw_weapon_fx()
			this.draw_floaties()
			this.draw_cursor_shadows()
		}
		if (this.inventory_mode) {
			this.draw_inventory()
		} else if (this.mission.currentScript && this.mission.currentScript.state != "terminated") {
			this.draw_script()
		} else {
			graphics.hz = this.current_hud_zoom
			this.draw_hud()
			graphics.hz = 1
		}
		var y = 8
		if (DEBUG.showscene) {
			text.drawhud("scene: " + plotstate.nextScene, settings.scr_w/2, y, 18, "#AAFFFF", "center", "bottom")
			y += 22
		}
		if (DEBUG.showfps) {
			if (!this.fpscount || this.frameno % 15 == 0)
				this.fpscount = UFX.ticker.wfps.toPrecision(2) + "fps"
			text.drawhud(this.fpscount, settings.scr_w/2, y, 18, "#AAFFFF", "center", "bottom")
			y += 22
		}
		this.cursor.draw()  // I'm guessing this is called automatically in pyglet
	},

	can_click: function () {
		var m = this.mission
		return !(this.mouse_protected > 0 || m.isCutscene || m.currentScript && m.currentScript.state === "frozen")
	},
	
	// Replaces on_mouse_motion, on_mouse_release, on_mouse_press, on_mouse_drag, on_mouse_scroll, and on_key_press
	handle_input: function (mstate, kstate) {
		if (mstate.pos) this.set_mouse(mstate.pos[0], settings.scr_h - mstate.pos[1])
		this.cursor.update(this.mouse_x, this.mouse_y)

		if (this.inventory_mode)
			return this.inventory_menu.handle_input(mstate, kstate)

		var mleft = mstate.left, mright = mstate.right
		if (mleft.down) this.on_mouse_press(mstate.pos, kstate.pressed.ctrl)
		if (mright.down) this.on_mouse_press(mstate.pos, true)

		if (mleft.dx || mleft.dy) this.on_mouse_drag(mstate.pos, [mleft.dx, mleft.dy], kstate.pressed.ctrl)
		if (mright.dx || mright.dy) this.on_mouse_drag(mstate.pos, [mright.dx, mright.dy], true)
		
		var s = this.mission.currentScript, smenu = s ? s.menu : null
		if (smenu) {
			smenu.handlemouse(this.mouse_x, this.mouse_y, mstate.left.down)
			smenu.handlekeys(kstate.down)
		}
		for (var key in kstate.down) {
			this.on_key_press(key, kstate.pressed)
		}
	},
	on_mouse_press: function (pos, targetonly) {
		// Note that pos here is in screen coordinates - Y-coordinate is flipped from HUD coordinates
		this.drag_to_move = false
		if (this.mouse_protected > 0) return
		var m = this.mission, s = m.currentScript
		if (s && s.state == "waitKey") {
			s.state = "running"
			return
		}
		if (s && s.state == "frozen") return
		if (s && s.menu) return  // handled elsewhere
		if (m.isCutscene) return

		for (var j = 0 ; j < this.weapon_icons.length ; ++j) {
			var b = this.weapon_icons[j]
			if (b.icon && b.on_mouse_press(this.mouse_x, this.mouse_y)) return
		}
		if (this.armour_icon.point_within(this.mouse_x, this.mouse_y)) return
		
		if (this.mission.canEject && this.eject_icon.on_mouse_press(this.mouse_x, this.mouse_y)) return
		
		// HUD stuff
		var e = this.cursor.entity_under_cursor
		if (e && e.isactor && e !== m.protag) {
			m.protag.targ = e
			if (!e.hostile) m.protag.set_dest(e.pos)
		} else if (!targetonly) {
			m.protag.set_dest(this.get_mouse_world_coordinates())
			this.drag_to_move = true
		}
	},
	on_mouse_drag: function (pos, drag, targetonly) {
		var m = this.mission
		if (this.drag_to_move && !targetonly) {
			m.protag.set_dest(this.get_mouse_world_coordinates())
		}
	},
	on_key_press: function (key, modifiers) {
		if (key == "esc") {
			UFX.scene.push("pause")
		} else if (key == "tab") {
			this.desired_hud_zoom = 2.5 - this.desired_hud_zoom  // 1.0 <-> 1.5
		} else if (this.mission.isCutscene) {
			return
		}
		var nindex = "123456789".indexOf(key)
		if (nindex > -1) {
			this.weapon_clicked(nindex)
		}
		// DEBUG stuff left out here
	},
	
	on_weapon_fire: function (weapon, shooter, target) {
		if (shooter === this.mission.protag) {
			for (var idx = 0 ; idx < robotstate.weaponry.length ; ++idx) {
				var wpn = robotstate.weaponry[idx]
				if (wpn === weapon) {
					this.weapon_icons[idx].border = WEAPON_ICON_BORDER_FIRING
					this.weapon_icons[idx].flashtime = WEAPON_ICON_BORDER_FLASH_FRAMES
				}
			}
		}
		var id = shooter.id + "," + target.id
		switch (weapon.effectname) {
			case Damage.electric:
				this.lightnings[id] = [weapon.basecooldown, shooter, target]
				playsound("lightning")
				break
			case Damage.physical:
				if (this.frameno - this.last_bullet_sound >= 20) playsound("bullet")
				this.bullets.push([shooter, target])
				break
			case Damage.fire:
				playsound("rifle")
				this.bullets.push([shooter, target])
				break
			case Damage.shotgun:
				playsound("shotgun")
				for (var j = 0 ; j < SHOTGUN_PELLETS ; ++j) this.bullets.push([shooter, target])
				break
			case Damage.laser:
				playsound("shot")
				this.lasers[id] = [5, shooter, target]
				break
			case Damage.claw:
				var hand = UFX.random() < 0.5 ? 1 : 0, id = target.id + "|" + hand
				if (id in this.claws) id = target.id + "|" + (1 - hand)
				this.claws[id] = [5, target, hand]
				break
		}
	},
	on_explode: function (exploder) {
		if (exploder.blast) {
			playsound("explosion")
		}
	},
	on_mine_lay: function (owner, mine) {
		playsound("click")
	},
	on_projectile_fire: function (owner, projectile) {
		switch (projectile.name) {
			case "Railgun Slug": playsound("railgun") ; break
			case "Plasma": playsound("plasma") ; break
			case "Cannonball": playsound("shotgun") ; break
			case "Napalm": case "Fireball": playsound("fireball") ; break
			case "FireSpider": playsound(UFX.random.choice(["plasma", "fireball"])) ; break
			case "Ninja Star": case "Rocket": case "Shell": break
			default: console.log("Unknown projectile type: " + projectile.name)
		}
	},
	on_projectile_move: function (pos, bearing, trailtype) {
		this.trails.push([pos, bearing, trailtype, 10])
	},
	on_gain_xp: function (amount) {
		this.new_xp += amount
		if (this.new_xp_delay <= 0) {
			this.new_xp_delay = XP_AGGREGATE_TIME
		}
	},
	on_damage: function (pos, amount) {
		this.add_floaty(amount.toFixed(1), pos, FLOATY_DAMAGE_COLOUR)
	},
	on_heal: function (pos, amount) {
		this.add_floaty(amount.toFixed(0), pos, FLOATY_HEALING_COLOUR, FLOAT_HEAL_DELAY)
	},
	on_pick_up: function () {
		playsound("pickup")
		if (this.frameno - this.last_get_float > PICKUP_AGGREGATE_TIME) {
			this.add_floaty("GET!", this.mission.protag.pos, FLOATY_PICKUP_COLOUR)
		}
	},
	on_time_out: function () {
	},
	on_level_up: function () {
		playsound("level_up")
		this.add_floaty("LEVEL UP!", this.mission.protag.pos, FLOATY_LEVEL_UP_COLOUR, FLOAT_LEVEL_DELAY)
	},
	on_multi_kill: function (pos, n) {
		this.add_floaty(n.toFixed(0) + " HIT!", pos, FLOATY_COMBO_COLOUR, FLOAT_COMBO_DELAY)
	},
	on_portrait_change: function () {
	},
	on_dialogue_change: function () {
		this.dialogue_changed = true
		var s = this.mission.currentScript
		if (s && s.state === "waitChoice") {
			this.mouse_protected = DIALOGUE_CLICK_PROTECTION_FRAMES
			this.choice_mode = true
		} else {
			this.choice_mode = false
			if (s && s.state === "waitKey") {
				this.mouse_protected = DIALOGUE_CLICK_PROTECTION_FRAMES
			}
		}
	},
	on_inventory: function () {
		this.inventory_mode = true
		this.inventory_menu.load_inventory()
		this.inventory_menu.set_mouse(this.mouse_x, this.mouse_y)
	},
	on_equipment_change: function () {
		var p = this.mission.protag
		p.currenthp = Math.min(p.currenthp, robotstate.getMaxHP())
		p.currentenergy = Math.min(p.currentenergy, robotstate.getMaxEnergy())
	},
	on_set_zoom: function (zoom) {
		this.desired_zoom = zoom
	},
	on_stop_mode: function () {
		this.cursor.modehandler = null
	},
	weapon_clicked: function (idx) {
		var wpn = robotstate.weaponry[idx]
		if (wpn) wpn.toggle(this.mission.protag)
		this.update_weapons()
	},
	eject_clicked: function () {
		if (this.eject_mode) {
			this.mission.runScript(this.mission.ejectScript)
		} else {
			this.eject_mode = true
			this.eject_icon.icon = gdata.eject_confirm
		}
	},
	update_weapons: function () {
		this.weapon_icons = []
		for (var idx = 0 ; idx < robotstate.weaponry.length ; ++idx) {
			var wpn = robotstate.weaponry[idx], icon = this.equip_icons[idx]
			icon.border = WEAPON_ICON_BORDER_NORMAL
			icon.flashtime = 0
			if (wpn) {
				icon.icon = gdata.weapon_icons[wpn.name]
				icon.colour = WEAPON_ICON_COLOURS[wpn.mode]
			} else {
				icon.icon = null
			}
			this.weapon_icons.push(icon)
		}
		this.armour_icon = this.equip_icons[idx]
		this.armour_icon.icon = gdata.armour
	},
	close_inventory: function () {
		this.inventory_mode = false
		this.update_weapons()
		if (this.mission.currentScript) this.mission.currentScript.state = "running"
	},
	add_floaty: function (text, pos, colour, delay) {
		delay = delay || 0
		this.floaties.push({
			text: text,
			colour: colour,
			x0: pos[0] + UFX.random.rand(-FLOAT_SCATTER, FLOAT_SCATTER+1),
			y0: pos[1] + UFX.random.rand(-FLOAT_SCATTER, FLOAT_SCATTER+1),
			offset: -delay,
		})
	},
	
	thinkargs: function (dt) {
		return [dt, UFX.mouse.state(), UFX.key.state()]
	},
	think: function (dt, mstate, kstate) {
		this.handle_input(mstate, kstate)
		this.current_zoom += 0.1 * (this.desired_zoom - this.current_zoom)
		this.current_hud_zoom += 0.05 * (this.desired_hud_zoom - this.current_hud_zoom)
		if (this.mouse_protected > 0) --this.mouse_protected

		for (var j = 0 ; j < this.weapon_icons.length ; ++j) {
			var wi = this.weapon_icons[j]
			wi.flashtime--
			if (wi.flashtime <= 0) wi.border = WEAPON_ICON_BORDER_NORMAL
		}
		if (this.new_xp_delay > 0) {
			this.new_xp_delay--
			if (this.new_xp_delay <= 0) {
				var s = "+" + this.format_xp(this.new_xp) + " XPs"
				this.add_floaty(s, this.mission.protag.pos, FLOATY_XP_COLOUR)
				this.new_xp = 0
			}
		}
		if (!this.mission.currentScript) {
			this.frameno++
			for (var s in this.lasers) if (!--this.lasers[s][0]) delete this.lasers[s]
			for (var s in this.claws) if (!--this.claws[s][0]) delete this.claws[s]
			for (var s in this.lightnings) if (!--this.lightnings[s][0]) delete this.lightnings[s]
			this.trails = this.trails.filter(function (t) { return --t[3] })
			this.floaties = this.floaties.filter(function (f) { return (f.offset += FLOAT_SPEED) < FLOAT_DIST })
			if (DEBUG.killme) this.mission.protag.takeDamage(4, "physical")
		}
		if (this.mission.currentScript && this.mission.currentScript.state == "waitKey" && DEBUG.skipcutscenes) {
			this.mission.currentScript.state = "running"
		}
		this.totalframeno++
		if (this.totalframeno % 100 == 0) log("fps", UFX.ticker.getrates())

		this.bullets = []
		this.mission.tick()
	},
	
	onadjust: function () {
		graphics.onadjust()
		this.setsizes()
	},

	// From helpers.format_xp
	format_xp: function (xp) {
		if (xp > 16777216) return (xp >> 20) + "M"
		if (xp > 16384) return (xp >> 10) + "K"
		return xp.toFixed(0)
	},
	
	stop: function () {
		log("nframes", this.frameno, this.totalframeno)
		log.send()
	},
}


// The original python version made heavy use of yields to achieve script advancement.
// That's not an option here, so the script engine is pretty much completely rewritten.
// A script spec is an Array of steps, each one is a line of dialogue, etc.
// If a step can either be a string (in which case script.state will be set to it)
//   or an Array consisting of a command name (string) and the corresponding arguments.

function Script(spec, mission, actor) {
	this.spec0 = spec
	this.mission = mission
	this.actor = actor || null
	this.restart()
	this.blankScreen = false
	this.freezeTicks = 0
	this.waitingOn = []
}
Script.prototype = {
	counters: {},

	blank: function (blank) {
		this.blankScreen = blank === undefined ? true : blank
	},

	save: function () {
		savegame()
	},

	say_l: function (text, speaker) {
		this.currentDialogue = text
		if (speaker) this.leftSpeaker = speaker
		this.currentSpeaker = this.leftSpeaker
		this.speakerIsLeft = true
		this.isQuestion = false
		this.state = "waitKey"
		this.mission.dispatch_event("on_dialogue_change")
	},
	say_l_unlabelled: function (text) {
		return this.say_l(text)
	},
	say_r: function (text, speaker) {
		this.currentDialogue = text
		if (speaker) this.rightSpeaker = speaker
		this.currentSpeaker = this.rightSpeaker
		this.speakerIsLeft = false
		this.isQuestion = false
		this.state = "waitKey"
		this.mission.dispatch_event("on_dialogue_change")
	},
	say_r_unlabelled: function (text) {
		return this.say_r(text)
	},

	speaker_l: function (svg) {  // calls setLeftPortrait
		this.currentLeftPortrait = gdata.portraits[svg]
		this.leftSpeaker = gdata.portraits[svg].name
		this.mission.dispatch_event("on_portrait_change")
	},
	speaker_r: function (svg) {  // setRightPortrait
		this.currentRightPortrait = gdata.portraits[svg]
		this.rightSpeaker = gdata.portraits[svg].name
		this.mission.dispatch_event("on_portrait_change")
	},
	
	clear_l: function () {
		this.currentLeftPortrait = null
		this.leftSpeaker = ""
		this.mission.dispatch_event("on_portrait_change")
	},
	clear_r: function () {
		this.currentRightPortrait = null
		this.rightSpeaker = ""
		this.mission.dispatch_event("on_portrait_change")
	},
	
	clearAll: function () {
		this.currentSpeaker = ""
		this.currentDiaolgue = ""
		this.speakerIsLeft = true
		this.isQuestion = false
		this.mission.dispatch_event("on_dialogue_change")
		this.clear_l()
		this.clear_r()
	},

	ask_l: function (text, choices, defaultOption) {
		this.say_l(text)
		// isQuestion seems pretty useless. Isn't it always the same as this.state == "waitChoice"?
		this.isQuestion = true
		this.state = "waitChoice"
		var x = DIALOGUE_BOX_PAD * settings.scr_w, y = DIALOGUE_BOX_TOP * settings.scr_h
		this.menu = this.makemenu(text, choices, x, y, defaultOption || 0)
	},
	ask_r: function (text, choices, defaultOption) {
		this.say_r(text)
		this.isQuestion = true
		this.state = "waitChoice"
		var x = (1 - DIALOGUE_BOX_PAD - DIALOGUE_BOX_WIDTH) * settings.scr_w
		var y = DIALOGUE_BOX_TOP * settings.scr_h
		this.menu = this.makemenu(text, choices, x, y, defaultOption || 0)
	},
	// TODO: handle window resize?
	makemenu: function (header, choices, x, y, defaultOption) {
		return new Menu(this.makechoices(choices), x, y, {
			header: header,
			fontsize: DIALOGUE_FONT_SIZE * settings.scr_h,
			gutter: BOX_GUTTER * settings.scr_h,
			scolour: [0,0,0,0.8],
			ocolour: [1,1,1,1],
			defaultOption: defaultOption,
			width: DIALOGUE_BOX_WIDTH * settings.scr_w,
			spacing: DIALOGUE_BOX_SPACING * settings.scr_h,
			vanchor: 1,
		})
	},
	makechoices: function (choices) {
		var that = this
		return choices.map(function (choice) {
			return [choice[0], that.answer.bind(that, choice.slice(1))]
		})
	},
	// Callback for the menu to invoke when a selection is made
	answer: function (newspec) {
		this.insert(newspec)
		this.menu = null
		this.state = "running"
	},

	heal: function (num) {
		this.actor.heal(num)
	},
	add_xp: function (num) {
		this.mission.protag.addXp(num)
	},
	deny: function (flag) {
		this.denyFlag = true
	},
	die: function () {
		this.actor.die()
	},
	kill_protag: function () {
		this.mission.entities.add(new Explosion(this.mission, this.mission.protag.pos, 100))
		this.mission.protag.kill()
	},
	kill_type: function (type) {
		this.mission.entities.forEach(function () {
			if (this.name === type) this.die()
		})
	},
	die_no_drop: function () {
		this.actor.die(false)
	},
	drop_metal: function (metal, amount) {
		// NB: this was originally assigned to last_choice, which seems pointless to me.
		new Metal(this.mission, metal, amount, this.actor.pos)
	},
	// replaces drop_item
	drop_weapon: function (wspec, sspec) {
		var t = new DroppedEquippable(this.mission, makeWeapon(wspec), this.actor.pos)
		if (sspec) t.setPickUpScript(sspec)
	},
	set_hostile: function (hostile) {
		this.actor.hostile = hostile
	},


	insert: function (newspec) {
		this.spec = newspec.concat(this.spec)
	},
	// Logic operations. Feels a little weird using if as a method name, huh? I say embrace the weird.
	if: function (condition, ifspec, elsespec) {
		if (condition) {
			if (ifspec) this.insert(ifspec)
		} else {
			if (elsespec) this.insert(elsespec)
		}
	},

	// replaces is_first
	if_first: function (key, ifspec, elsespec) {
		this.if(!plotstate[key], ifspec, elsespec)
		plotstate[key] = "done"
	},

	// replaces if key in plotstate
	if_plotstate: function (key, ifspec, elsespec) {
		this.if(plotstate[key], ifspec, elsespec)
	},
	// replaces if key not in plotstate
	if_not_plotstate: function (key, ifspec, elsespec) {
		this.if(!plotstate[key], ifspec, elsespec)
	},
	// replaces if plotstate[key] >= value
	if_plotstate_counter: function (key, value, ifspec, elsespec) {
		this.if(plotstate[key] >= value, ifspec, elsespec)
	},
	// replaces if plotstate[key] == value
	if_eq_plotstate: function (key, value, ifspec, elsespec) {
		this.if(plotstate[key] == value, ifspec, elsespec)
	},
	// replaces if robotstate.getMetal(type) >= amount
	if_has_metal: function (type, amount, ifspec, elsespec) {
		this.if(robotstate.getMetal(type) >= amount, ifspec, elsespec)
	},
	// if all members of mission.bosses are dead
	if_boss_dead: function (ifspec, elsespec) {
		this.if(this.mission.bosses.every(function (b) { return b.currenthp <= 0 }), ifspec, elsespec)
	},

	// replaces plotstate[key] = "done"
	set_plotstate: function (key, value) {
		plotstate[key] = value === undefined ? "done" : value
	},
	// replaces plotstate[key] += 1
	increment_plotstate: function (key) {
		plotstate[key]++
	},
	// replaces robotstate.changeMetal(amt, type)
	change_metal: function (amt, type) {
		robotstate.changeMetal(amt, type)
	},
	// replaces robotstate.addWeaponSlot
	addWeaponSlot: function () {
		robotstate.addWeaponSlot()
	},

	sound: function (sfx) {
		playsound(sfx)
	},
	change_music: function (song) {
		if (!song) stopmusic()
		else playmusic(song)
	},

	change_scene: function (next) {
		// TODO: save_log()
		plotstate.nextScene = next
		this.state = "endMission"
	},

	end_game: function (next) {
		this.state = "endGame"
	},

	inventory: function () {
		this.mission.dispatch_event("on_inventory")
	},

	freeze: function (ticks) {
		this.freezeTicks = ticks
		this.state = "frozen"
	},

	set_zoom: function (zoom) {
		this.mission.dispatch_event("on_set_zoom", zoom)
	},
	
	wait: function (ticks) {
		this.mission.runScript(this, ticks)
		this.state = "endConversation"
	},
	
	// Replaces mission.runScript(script, delay) - for dispatching the next script
	runScript: function (spec, delay, actor) {
		this.mission.runScript(new Script(spec, this.mission, actor), delay)
	},
	// This method is turning out to be a pain to get working, and I think it was primarily used
	//   for a training mission that's no longer used. I'm fine with removing it.
//	wait_until_moved: function (actors) {
//		console.log("wait_until_moved", actors)
//		this.waitingOn = actors.slice()
//		this.mission.isCutscene = true
//		this.mission.runScript(this, 1)
//		this.state = "endConversation"
//	},
	set_script_path: function (who, nodes, bearing) {
		who.setScriptPath(nodes, bearing)
	},

	// Catch-all for any one-off functions they put in the script
	do: function (fn) {
		fn()
	},


	// TODO log_record

	restart: function () {
		this.clearAll()
		this.state = "running"
		this.last_choice = null
		this.denyFlag = false
		this.spec = this.spec0.slice()
	},

	// Handle shared counters
	increment: function (countname, amount) {
		if (amount === undefined) amount = 1
		this.counters[countname] = (this.counters[countname] || 0) + amount
	},
	ifeq: function (countname, amount, ifspec, elsespec) {
		this.if((this.counters[countname] || 0) == amount, ifspec, elsespec)
	},

	canEject: function (can) {
		this.mission.canEject = can === undefined ? true : can
	},

	advance: function () {
		
		this.waitingOn = this.waitingOn.filter(function (a) { return a.scriptNodes })
		if (this.waitingOn.length) {
			this.state = "endConversation"
			this.mission.runScript(this, 1)
		} else {
			this.mission.isCutscene = false
		}
		
		while (this.state == "running") {
			if (this.spec.length) {
				var state = this.spec.shift()
				if (state.pop) {
					if (!this[state[0]]) throw "Unimplemented method " + state[0]
					this[state[0]].apply(this, state.slice(1))
				} else {
					this.state = state
				}
			} else {
				this.state = "terminated"
			}
		}
	},
}




var edgenum = { top: 1, bottom: 2, left: 4, right: 8, topleft: 16, topright: 32, bottomleft: 64, bottomright: 128 }

// JavaScript doesn't let you use tuples as keys. I could convert them to strings, but the
// deconversion would be tricky and probably expensive. This is a standard mapping between
// (int, int) pairs and uints to be used for keys.
// To keep the keys to 31-bits, the coordinates should remain in the range [-16k, 16k]

function gridn(x, y) { return (x + 16384 << 15) + y + 16384 }
function gridx(n) { return (+n >> 15) - 16384 }
function gridy(n) { return (+n & 32767) - 16384 }
function gridxy(n) { return [gridx(n), gridy(n)] }
function griddn(dx, dy) { return dx * (1 << 15) + dy }


function DungeonGrid(csize) {
	this.rooms = []
	this.corridors = {}
	this.csize = csize
	this.cells = {}
}
DungeonGrid.prototype = {
	// New function since I can't override setitem
	setCell: function (p, value) {
		this.cells[gridn(p[0], p[1])] = value
	},
	cellContaining: function (pos) {
		return [Math.floor(pos[0] / this.csize), Math.floor(pos[1] / this.csize)]
	},
	cellCentre: function (pos) {
		return [(pos[0] + 0.5) * this.csize, (pos[1] + 0.5) * this.csize]
	},
	pasteInto: function (othermap, offset) {
		var dn = griddn(offset[0], offset[1])
		for (var n in this.cells) {
			othermap.cells[(+n) + dn] = this.cells[n]
		}
	},
	getClearSpace: function () {
		// TODO: sortkeys
		var n = +UFX.random.choice(Object.keys(this.cells))
		var startcell = gridxy(n)
		return [(startcell[0] + 0.5) * this.csize, (startcell[1] + 0.5) * this.csize]
	},
	isClear: function (start, size) {
		for (var x = 0 ; x < size[0] ; ++x) {
			for (var y = 0 ; y < size[1] ; ++y) {
				if (this.cells[gridn(start[0] + x, start[1] + y)])
					return false
			}
		}
		return true
	},
	circleClear: function (pos, radius) {
		var mincx = Math.floor((pos[0] - radius) / this.csize)
		var maxcx = Math.floor((pos[0] + radius) / this.csize)
		var mincy = Math.floor((pos[1] - radius) / this.csize)
		var maxcy = Math.floor((pos[1] + radius) / this.csize)
		var cells = this.cells
		function fastCheck() {
			for (var cx = mincx ; cx <= maxcx ; ++cx) {
				for (var cy = mincy ; cy <= maxcy ; ++cy) {
					if (!cells[gridn(cx, cy)]) {
						return false
					}
				}
			}
			return true
		}
		if (fastCheck()) return true
		
		var cellradius = Math.floor(radius / this.csize) + 1
		var ecx = Math.floor(pos[0]/this.csize), ecy = Math.floor(pos[1]/this.csize)
		for (var cx = -cellradius ; cx <= cellradius ; ++cx) {
			for (var cy = -cellradius ; cy <= cellradius ; ++cy) {
				if (this.cells[gridn(ecx + cx, ecy + cy)]) continue
				var rx = cx < 0 ? this.csize*(ecx+cx+1) : cx > 0 ? this.csize*(ecx+cx) : pos[0]
				var ry = cy < 0 ? this.csize*(ecy+cy+1) : cy > 0 ? this.csize*(ecy+cy) : pos[1]
				var dx = pos[0] - rx, dy = pos[1] - ry
				if (dx * dx + dy * dy < radius * radius) return false
			}
		}
		return true
	},
	hasLOS: function (pos1, pos2) {
		if (pos2[0] < pos1[0]) {  // work left to right
			var tmp = pos1 ; pos1 = pos2 ; pos2 = tmp
		}
		var x1 = pos1[0] / this.csize, y1 = pos1[1] / this.csize
		var x2 = pos2[0] / this.csize, y2 = pos2[1] / this.csize
		var dy = y2 >= y1 ? 1 : -1 // traveling in the +y direction
		var ix1 = Math.floor(x1), ix2 = Math.floor(x2)
		var iy = Math.floor(y1)
		for (var ix = ix1 ; ix <= ix2 ; ++ix) {
			var xl = ix == ix1 ? x1 : ix
			var xr = ix == ix2 ? x2 : ix + 1
			var iyn = Math.floor(ix == ix2 ? y2 : y1 + (xr - x1) * (y2 - y1) / (x2 - x1))
			if (!this.cells[gridn(ix, iy)]) return false
			while (iy != iyn) {
				iy += dy
				if (!this.cells[gridn(ix, iy)]) return false
			}
		}
		return true
	},
	hasWideLOS: function (pos1, pos2, radius) {
		if (!radius) return this.hasLOS(pos1, pos2)
		var dx = pos2[0] - pos1[0], dy = pos2[1] - pos1[1], d = Math.sqrt(dx * dx + dy * dy)
		dx *= radius / d
		dy *= radius / d
		return this.hasLOS([pos1[0] + dy, pos1[1] - dx], [pos2[0] + dy, pos2[1] - dx]) &&
		       this.hasLOS([pos1[0] - dy, pos1[1] + dx], [pos2[0] - dy, pos2[1] + dx])
	},

	checkEdge: function (cell, edges, side) {
		if (!this.cells[cell]) {
			edges[cell] = edges[cell] || 0
			edges[cell] += side
		}
	},
	getCorners: function (edges) {
		var corners = {}
		for (var n in edges) corners[n] = edges[n]
		for (var cell in edges) {
			var x = gridx(cell), y = gridy(cell)
			if (edgenum.top & edges[cell]) {
				if ((edges[gridn(x+1, y+1)] || 0) && edgenum.left) {
					var corner = gridn(x+1, y)
					corners[corner] = (corners[corner] || 0) + edgenum.topleft
				}
				if ((edges[gridn(x-1, y+1)] || 0) && edgenum.right) {
					var corner = gridn(x-1, y)
					corners[corner] = (corners[corner] || 0) + edgenum.topright
				}
			}
			if (edgenum.bottom & edges[cell]) {
				if ((edges[gridn(x+1, y-1)] || 0) && edgenum.left) {
					var corner = gridn(x+1, y)
					corners[corner] = (corners[corner] || 0) + edgenum.bottomleft
				}
				if ((edges[gridn(x-1, y-1)] || 0) && edgenum.right) {
					var corner = gridn(x-1, y)
					corners[corner] = (corners[corner] || 0) + edgenum.bottomright
				}
			}
		}
		return corners
	},
	getWalls: function () {
		var edges = {}
		for (var n in this.cells) {
			var x = gridx(n), y = gridy(n)
			this.checkEdge(gridn(x, y+1), edges, edgenum.bottom)
			this.checkEdge(gridn(x+1, y), edges, edgenum.left)
			this.checkEdge(gridn(x, y-1), edges, edgenum.top)
			this.checkEdge(gridn(x-1, y), edges, edgenum.right)
		}
		return this.getCorners(edges)
	},

	getTopCell: function () {
		return gridxy(Object.keys(this.cells).sort(function (n1, n2) { return gridy(n2) - gridy(n1) })[0])
	},
	getBottomCell: function () {
		return gridxy(Object.keys(this.cells).sort(function (n1, n2) { return gridy(n1) - gridy(n2) })[0])
	},
	getRightCell: function () {
		return gridxy(Object.keys(this.cells).sort(function (n1, n2) { return gridx(n2) - gridx(n1) })[0])
	},
	getLeftCell: function () {
		return gridxy(Object.keys(this.cells).sort(function (n1, n2) { return gridx(n1) - gridx(n2) })[0])
	},

	topPos: function (pos) {
		return [this.top_offs[0] + pos[0], this.top_offs[1] + pos[1]]
	},
	bottomPos: function (pos) {
		return [this.bottom_offs[0] + pos[0], this.bottom_offs[1] + pos[1]]
	},
	leftPos: function (pos) {
		return [this.left_offs[0] + pos[0], this.left_offs[1] + pos[1]]
	},
	rightPos: function (pos) {
		return [this.right_offs[0] + pos[0], this.right_offs[1] + pos[1]]
	},
}


function Room(pos, size) {
	this.pos = pos
	this.size = size
}
Room.prototype = {
	addToDungeon: function (d) {
		d.rooms.push(this)
		var x0 = this.pos[0], y0 = this.pos[1]
		for (var dx = 0 ; dx < this.size[0] ; ++dx) {
			for (var dy = 0 ; dy < this.size[1] ; ++dy) {
				d.cells[gridn(x0 + dx, y0 + dy)] = this
			}
		}
	},
}






function loadFixedMap(name) {
	var map = new DungeonGrid(100)
	var img = mapdata[name]
	for (var y = img.h-1, j = 0 ; y >= 0 ; --y) {
		for (var x = 0 ; x < img.w ; ++x, ++j) {
			if (img.data[j]) map.setCell([x, y], 1)
		}
	}
	return map
}

// from content.town
function makeTown(m) {
	m.map = loadFixedMap("dollis")
	m.style = "town"
	;[
		["Fountain", [1000, 1200]],
		["FountainWater", [1000, 1200]],
		["Barrel", [20, 986], -25],
		["Barrel", [20, 946], -69],
		["Crates", [53, 1050], -44],
		["Bush", [1279,1432], -167], 
		["Bush", [1235,1475], -33], 
		["Bush", [1277,1476], -133], 
		["Tree1", [1204,996], 0], 
		["Tree2", [794,1396], 0], 
		["Column", [726,325], -125], 
		["Column", [468,325], 0], 
		["Barrel", [177,831], -127], 
		["Barrel", [154,799], 121], 
		["Barrel", [182,767], 9], 
		["Crates", [1346,2048], 157], 
		["Barrel", [1520,2080], -116], 
		["Barrel", [1548,2045], 37], 
		["Barrel", [1581,2046], 154], 
		["Barrel", [1552,2077], 40], 
		["Tree1", [1247,348], 178], 
		["Bush", [963,374], -26], 
		["Bush", [921,376], 69], 
	].forEach(m.addScenery.apply.bind(m.addScenery, m))
}


function makeDungeon2(args) {
	var map = makeDungeon1(args)
	var dirs = ["top", "bottom", "left", "right"]
	var Dirs = ["Top", "Bottom", "Left", "Right"]
	var dx = [0, 0, -1, 1], dy = [1, -1, 0, 0]
	for (var j = 0 ; j < 4 ; ++j) {
		var dir = dirs[j], Dir = Dirs[j], opDir = Dirs[j^1]
		if (!args[dir]) continue
		var my = map["get"+Dir+"Cell"]()
		var othermap = loadFixedMap(args[dir])
		var o = othermap["get"+opDir+"Cell"]()
		var xoffs = my[0] - o[0] + dx[j], yoffs = my[1] - o[1] + dy[j]
		othermap.pasteInto(map, [xoffs, yoffs])
		map[dir+"_offs"] = [xoffs * map.csize, yoffs * map.csize]
	}
	return map
}

function makeDungeon1(args) {
	args = args || {}
	var startpos = args.startpos || [100, 70]
	var minroomsize = args.minroomsize || 2
	var maxroomsize = args.maxroomsize || 5
	var maxrooms = args.maxrooms || 60
	var mindist = args.mindist || 6
	var maxdist = args.maxdist || 11
	var extratunnels = "extratunnels" in args ? args.extratunnels : true

	if (DEBUG.minidungeons) maxrooms = Math.ceil(maxrooms / 20)

	var map = new DungeonGrid(100)
	var r = new Room(startpos, [maxroomsize, maxroomsize])
	r.addToDungeon(map)

	while (map.rooms.length < maxrooms) {
		var start_room = UFX.random.choice(map.rooms)
		var newroomsize = [
			UFX.random.rand(minroomsize, maxroomsize + 1),
			UFX.random.rand(minroomsize, maxroomsize + 1)
		]
		var xoffs = -Math.floor(newroomsize[0] / 2)
		var yoffs = -Math.floor(newroomsize[1] / 2)
		var dir = UFX.random.rand(4), xv = [0, 0, -1, 1][dir], yv = [-1, 1, 0, 0][dir]
		var buffer = Math.floor(newroomsize[dir < 2 ? 1 : 0] / 2)
		var start_dig = start_room.pos.slice()
		var sx = start_room.size[0], sy = start_room.size[1]
		switch (dir) {
			case 0: start_dig[0] += UFX.random.rand(sx) ; start_dig[1] += -1 ; break
			case 1: start_dig[0] += UFX.random.rand(sx) ; start_dig[1] += sy ; break
			case 2: start_dig[0] += -1 ; start_dig[1] += UFX.random.rand(sy) ; break
			case 3: start_dig[0] += sx ; start_dig[1] += UFX.random.rand(sy) ; break
		}
		var okdist = null, wbox = [newroomsize[0]+2, newroomsize[1]+2]
		for (var d = mindist + buffer ; d < maxdist + buffer ; ++d) {
			var px = start_dig[0] + xv * d + xoffs, py = start_dig[1] + yv * d + yoffs
			if (map.isClear([px-1, py-1], wbox)) {
				okdist = d
				r = new Room([px, py], newroomsize)
				r.addToDungeon(map)
				break
			}
		}
		for (var ddig = 0 ; okdist && ddig < okdist ; ++ddig) {
			map.setCell([start_dig[0] + ddig * xv, start_dig[1] + ddig * yv], 1)
		}
		if (extratunnels && !okdist) {
			// TODO: looks like there's a bug here (ddig2 never used), so leave it for now
			var found = false
			for (ddig = mindist ; ddig < maxdist ; ++ddig) {
			}
		}
	}
	map.cellkeys = Object.keys(map.cells)
	return map
}








// radius, name
var scenerydata = {
	Fountain: [150],
	FountainWater: [100, "Fountain Water"],
	Barrel: [15],
	Bush: [20],
	Tree1: [45, "Tree 1"],
	Tree2: [45, "Tree 2"],
	Crates: [45],
	Column: [30],
	Rock: [15],
	Campfire: [35],
}

function BlastDoor(mission, pos, bearing, open) {
	var solid = !open
	Entity.call(this, mission, pos, 50, bearing || 0, solid, "Blast Door")
	this.targetpos = this.currentpos = solid ? 0 : 15
	this.anim_state = Math.floor(this.currentpos / 5)
}
BlastDoor.prototype = extend(Entity.prototype, {
	open: function () {
		this.targetpos = 15
		this.solid = false
	},
	close: function () {
		this.targetpos = 0
		this.solid = true
	},
	tick: function () {
		if (this.currentpos < this.targetpos) ++this.currentpos
		else if (this.currentpos > this.targetpos) --this.currentpos
		this.anim_state = Math.floor(this.currentpos / 5)
	},
	describe: function () {
		return this.solid ? "Blast Door" : ""
	},
})

function makeScenery(type, mission, pos, bearing, open) {
	if (type in scenerydata) {
		var data = scenerydata[type], radius = data[0], name = data[1] || type, solid = true
		return new Entity(mission, pos, radius, bearing || 0, solid, name)
	} else if (type == "BlastDoor") {
		return new BlastDoor(mission, pos, bearing, open)
	} else {
		throw "Unrecognized scenery type " + type
	}
}


function Button(fn, x, y, width, height, icon, color, border, box, centerbox) {
	this.x = x
	this.y = y
	this.width = width
	this.height = height
	this.icon = icon
	this.color = color || [1, 1, 1, 1]
	this.border = border || [1, 1, 1, 1]
	this.box = box === undefined ? true : box
	this.centerbox = centerbox
	this.fn = fn
}
Button.prototype = {
	draw: function () {
		if (this.box) {
			var x = this.centerbox ? this.x - this.width / 2 : this.x
			var y = this.centerbox ? this.y - this.height / 2 : this.y
			graphics.drawhudrect([x, y], [this.width, this.height], this.border, [0, 0, 0, 0.8])
		}
		if (this.icon) {
			graphics.draw(this.icon, this.x, this.y, this.height, 0, { colour: this.colour, hud: true })
		}
	},
	activate: function () {
		this.fn()
	},
	point_within: function (x, y) {
		if (this.centerbox) {
			x += this.width / 2
			y += this.height / 2
		}
		return this.x <= x && x - this.x <= this.width && this.y <= y && y - this.y <= this.height
	},
	on_mouse_press: function (x, y) {
		if (this.point_within(x, y)) {
			this.activate()
			return true
		}
	},
}



var canvas = document.getElementById("canvas")
canvas.width = settings.scr_w
canvas.height = settings.scr_h
var gl = canvas.getContext("experimental-webgl", { antialias: settings.antialias })

var graphics = {
	init: function () {
		function makeshader(gl, scriptId, shaderType) {
			var shader = gl.createShader(shaderType)
			var shaderScript = document.getElementById(scriptId)
			gl.shaderSource(shader, shaderScript.text)
			gl.compileShader(shader)
			return shader
		}
		var program = gl.createProgram()
		gl.attachShader(program, makeshader(gl, "2d-vertex-shader", gl.VERTEX_SHADER))
		gl.attachShader(program, makeshader(gl, "2d-fragment-shader", gl.FRAGMENT_SHADER))
		gl.linkProgram(program)
		gl.useProgram(program)
		this.svars = {  // shader variables
			// From the vertex shader
			pos: gl.getAttribLocation(program, "pos"),
			tcoord: gl.getAttribLocation(program, "tcoord"),
			xform: gl.getUniformLocation(program, "xform"),
			// From the fragment shader
			tfac: gl.getUniformLocation(program, "tfac"),
			sampler: gl.getUniformLocation(program, "sampler"),
			colour: gl.getUniformLocation(program, "colour"),
		}

		this.setlinewidth(settings.linewidth)
		
		gl.clearColor(0, 0, 0, 1)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

		this.imgbuffer = gl.createBuffer()
		this.bindbuffer(this.imgbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gdata.ps), gl.STATIC_DRAW)

		this.primbuffer = gl.createBuffer()  // for drawing procedurally-generated primitives

		// for caching floors and walls of the map
		this.worldchunkbuffer = gl.createBuffer()
		this.worldchunks = {}

		this.W = 2/settings.scr_w
		this.H = 2/settings.scr_h
		this.cx = 0
		this.cy = 0
		this.cz = 1  // world zoom level
		this.hz = 1  // hud zoom level
		
		// drawing the choppy rectangles
		var rectps = [0,0,1,0,1,1,0,1,0.5,0.5]
		for (var dir = 0 ; dir < 4 ; ++dir) {
			for (var j = 0 ; j < 10 ; ++j) {
				var p = [0,1,j/10,1-j/10], x = p[[2,1,3,0][dir]], y = p[[0,2,1,3][dir]]
				rectps.push(UFX.random.normal(x, 0.005))
				rectps.push(UFX.random.normal(y, 0.005))
			}
		}
		rectps.push(rectps[10])
		rectps.push(rectps[11])
		this.rectbuffer = gl.createBuffer()
		this.bindbuffer(this.rectbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectps), gl.STATIC_DRAW)

		gl.activeTexture(gl.TEXTURE0)
		gl.uniform1i(this.svars.sampler, 0)
		// The texture coordinate buffer is very simple - basically we only ever draw complete
		//   textures.
		this.texbuffer = gl.createBuffer()
		this.bindtexbuffer(this.texbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,1,1,1,1,0,0,0]), gl.STATIC_DRAW)
	},
	onadjust: function () {
		this.W = 2/settings.scr_w
		this.H = 2/settings.scr_h
	},

	// Set the vertex array buffer
	bindbuffer: function (buffer) {
		if (this.currentbuffer === buffer) return
		this.currentbuffer = buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.enableVertexAttribArray(this.svars.pos)
		gl.vertexAttribPointer(this.svars.pos, 2, gl.FLOAT, false, 0, 0)
	},
	// Set the texture coordinate array buffer
	bindtexbuffer: function (buffer) {
		if (this.currentbuffer === buffer) return
		this.currentbuffer = buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.enableVertexAttribArray(this.svars.tcoord)
		gl.vertexAttribPointer(this.svars.tcoord, 2, gl.FLOAT, false, 0, 0)
	},
	setcolour: function (colour) {
		if (colour.length == 3) colour.push(1)
		gl.uniform4fv(this.svars.colour, colour)
		gl.uniform1f(this.svars.tfac, 0)
		gl.disableVertexAttribArray(this.svars.tcoord)
	},
	settexture: function (texture) {
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.enableVertexAttribArray(this.svars.tcoord)
		gl.vertexAttribPointer(this.svars.tcoord, 2, gl.FLOAT, false, 0, 0)
		gl.uniform1f(this.svars.tfac, 1)
	},
	setlinewidth: function (lw) {
		settings.linewidth = lw
		gl.lineWidth(lw)
	},
	clear: function () {
		gl.clear(gl.COLOR_BUFFER_BIT)
	},
	// Set the alpha channel to 1 everywhere. Should call this at the end of the drawing loop
	// because webGL allows the canvas to bleed through to the background color
	onealpha: function () {
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.ONE, gl.ONE)
		this.setrectxform(0, 0, settings.scr_w, settings.scr_h, 1)
		this.bindbuffer(this.rectbuffer)
		this.setcolour([0, 0, 0, 1])
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	},
	worldtoscreen: function (x, y) {
		return [
			Math.round((x - this.cx) * this.cz + settings.scr_w/2),
			Math.round((y - this.cy) * this.cz + settings.scr_h/2),
		]
	},
	// World coordinates
	setxform: function (x, y, s, A) {
		var S = A ? Math.sin(A) : 0, C = A ? Math.cos(A) : 1
		s = s || 1
		x = x || 0
		y = y || 0
		gl.uniformMatrix3fv(this.svars.xform, false, new Float32Array([
			this.cz*this.W*C*s, this.cz*this.H*S*s, 0,
			-this.cz*this.W*S*s, this.cz*this.H*C*s, 0,
			(x*this.cz-Math.round(this.cx*this.cz))*this.W,
			(y*this.cz-Math.round(this.cy*this.cz))*this.H, 1
		]))
	},
	// HUD coordinates
	sethudxform: function (x, y, s, A) {
		var S = A ? Math.sin(A) : 0, C = A ? Math.cos(A) : 1
		s = s || 1
		x = x || 0
		y = y || 0
		gl.uniformMatrix3fv(this.svars.xform, false, new Float32Array([
			this.hz*this.W*C*s, this.hz*this.H*S*s, 0,
			-this.hz*this.W*S*s, this.hz*this.H*C*s, 0,
			(x*this.W-1)*this.hz, (y*this.H-1)*this.hz, 1
		]))
	},
	// HUD coordinates that allows no rotation but different x and y stretch factors
	setrectxform: function (x, y, sx, sy, z) {
		x = x || 0
		y = y || 0
		sx = sx || 1
		sy = sy || sx
		z = z || this.hz
		gl.uniformMatrix3fv(this.svars.xform, false, new Float32Array([
			z*this.W*sx, 0, 0,
			0, z*this.H*sy, 0,
			(x*this.W-1)*z, (y*this.H-1)*z, 1
		]))
	},
	trace: function (sprite, x, y, h, A, hud) {
		this.bindbuffer(this.imgbuffer)
		if (hud) this.sethudxform(x, y, h / sprite.height, A)
		else this.setxform(x, y, h / sprite.height, A)
		gl.drawArrays(gl.LINES, sprite.p0, sprite.np)
	},
	draw: function (img, x, y, h, A, opts) {
		if (opts && opts.colour) this.setcolour(opts.colour)
		else if (img.colour) this.setcolour(img.colour)

		if (img.np) {  // regular SVG
			this.trace(img, x, y, h, A, opts && opts.hud)
		} else if (img.frames) {  // AnimatedSVG
			var frameno = Math.floor(opts.frameno / img.framelength) % img.frames.length
			this.draw(img.frames[frameno], x, y, h, A, opts)
		} else if (img.states) {  // StatefulSVG
			this.draw(img.states[opts.state], x, y, h, A, opts)
		} else if (img.base) {  // TurretSVG
			this.draw(img.base, x, y, h, A, opts)
			this.draw(img.turret, x, y, h, opts.turretbearing, opts)
		}
	},
	drawfloor: function (cx, cy, cs) {
		this.draw(gdata.floor, cx*cs, cy*cs, cs, 0)
	},

	drawwall: function (code, cx, cy, cs) {
		this.draw(gdata.walls[code], cx*cs, cy*cs, cs, 0)
	},
	drawcursor: function (mode, x, y, opts) {
		this.draw(gdata.cursors[mode], x, y, 40, 0, opts)
	},
	
	// Draw procedurally-generated graphical primitives
	primload: function (ps) {
		this.bindbuffer(this.primbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ps), gl.DYNAMIC_DRAW)
	},
	drawstrip: function (ps) {
		this.setxform()
		this.primload(ps)
		gl.drawArrays(gl.LINE_STRIP, 0, ps.length / 2)
	},

	// Draw one of those jagged rectangles we like so much
	drawhudrect: function (pos, size, outline, solid, z) {
		this.setrectxform(pos[0], pos[1], size[0], size[1], z)
		this.bindbuffer(this.rectbuffer)
		if (solid) {
			this.setcolour(solid)
			gl.drawArrays(gl.TRIANGLE_FAN, 4, 42)
		}
		if (outline) {
			this.setcolour(outline)
			gl.drawArrays(gl.LINE_LOOP, 5, 41)
		}
	},
	drawworldrect: function (pos, size, outline, solid) {
		var spos = this.worldtoscreen(pos[0], pos[1]), ssize = [size[0] * this.cz, size[1] * this.cz]
		this.drawhudrect(spos, ssize, outline, solid, 1)
	},
	// For textures (basically, text)
	// Set z to 1 to override hud zoom and use screen coordinates
	tracehudrect: function (pos, size, z) {
		this.setrectxform(pos[0], pos[1], size[0], size[1], z)
		this.bindbuffer(this.rectbuffer)
		this.bindtexbuffer(this.texbuffer)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
	},
	
	// Draw the floor and walls of dungeons
	makeworldchunks: function (map, wcx, wcy) {
		var t0 = Date.now()
		var chunks = {}, gps = gdata.ps
		var fp0 = 2 * gdata.floor.p0, flen = 2 * gdata.floor.np
		var wp0 = {}, wlen = {}
		for (var v in gdata.walls) {
			wp0[v] = 2 * gdata.walls[v].p0
			wlen[v] = 2 * gdata.walls[v].np
		}
		var mapwalls = map.getWalls()
		var nps = 0
		for (var n in map.cells) nps += flen
		for (var n in mapwalls) nps += wlen[mapwalls[n]]
		var ps = new Float32Array(nps), pj = 0
		
		var t1 = Date.now()

		for (var n in map.cells) {
			var x = gridx(n), y = gridy(n)
			var cx = Math.floor(x/wcx), cy = Math.floor(y/wcy)
			var cn = gridn(cx, cy)
			if (!chunks[cn]) chunks[cn] = { floorxs: [], floorys: [], wallxs: [], wallys: [], wallvs: [] }
			chunks[cn].floorxs.push(x)
			chunks[cn].floorys.push(y)
		}
		for (var n in mapwalls) {
			var x = gridx(n), y = gridy(n)
			var cx = Math.floor(x/wcx), cy = Math.floor(y/wcy)
			var cn = gridn(cx, cy)
			if (!chunks[cn]) chunks[cn] = { floorxs: [], floorys: [], wallxs: [], wallys: [], wallvs: [] }
			chunks[cn].wallxs.push(x)
			chunks[cn].wallys.push(y)
			chunks[cn].wallvs.push(mapwalls[n])
		}

		var t2 = Date.now()

		this.worldchunks = { cs: map.csize }
		for (var cn in chunks) {
		
			var chunk = chunks[cn], floorxs = chunk.floorxs, floorys = chunk.floorys
			this.worldchunks[cn] = { floorp0: pj/2 }
			for (var fj = 0 ; fj < floorxs.length ; ++fj) {
				 var x = floorxs[fj], y = floorys[fj], h = gdata.floor.height
				 for (var j = 0, i = fp0 ; j < flen ; j += 2) {
				 	ps[pj++] = gps[i++] / h + x
				 	ps[pj++] = gps[i++] / h + y
			 	}
		 	}
		 	this.worldchunks[cn].floornp = pj/2 - this.worldchunks[cn].floorp0

			var wallxs = chunk.wallxs, wallys = chunk.wallys, wallvs = chunk.wallvs
		 	this.worldchunks[cn].wallp0 = pj/2
			for (var wj = 0 ; wj < wallxs.length ; ++wj) {
				 var x = wallxs[wj], y = wallys[wj], v = wallvs[wj]
				 var h = gdata.walls[v].height, i0 = wp0[v], jmax = wlen[v]
				 for (var j = 0, i = i0 ; j < jmax ; j += 2) {
				 	ps[pj++] = gps[i++] / h + x
				 	ps[pj++] = gps[i++] / h + y
			 	}
		 	}
		 	this.worldchunks[cn].wallnp = pj/2 - this.worldchunks[cn].wallp0
		}

		var t3 = Date.now()

		this.bindbuffer(this.worldchunkbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, ps, gl.STATIC_DRAW)
		var t4 = Date.now()
		
		log("makeworldchunk", ps.length, t4 - t0, t1 - t0, t2 - t1, t3 - t2, t4 - t3)
	},
	drawworldchunk: function (cx, cy, fcolour, wcolour) {
		var cn = gridn(cx, cy)
		var chunk = this.worldchunks[cn]
		if (!chunk) return
		this.bindbuffer(this.worldchunkbuffer)
		this.setxform(0, 0, this.worldchunks.cs, 0)
		this.setcolour(fcolour)
		gl.drawArrays(gl.LINES, chunk.floorp0, chunk.floornp)
		this.setcolour(wcolour)
		gl.drawArrays(gl.LINES, chunk.wallp0, chunk.wallnp)
	},

	debugcircle: function (x, y, r, colour, hud) {
		this.draw(gdata.debug_iface_circle, x-r, y-r, 2*r, 0, {colour: colour, hud: hud})
	},
}

wall_colours = {
	town: [1,.9,.8],
	cave: [.8,.8,.6],
	basic: [1,1,1],
}
floor_colours = {
	town: [.2,.1,0],
	cave: [.4,.4,.4],
	basic: [0,.1,.2],
}
trail_colours = {
	fire: [1,1,0,1,0,0],
	smoke: [1,1,1,0,0,0],
	railgun: [0,1,1,0,0,1],
}

// Handle text by rendering it to a 2d canvas and load it as a texture

// TODO: would it kill me to have some consistency with the method argument orderings?

var text = {
	textures: {},  // cached textures
	textotal: 0,  // total number of pixels of all currently stored textures

	// tick is incremented every time a texture is fetched. I'm not worried about overflow because
	//   that won't occur until tick = 9007199254740992, which means you can fetch 1000 textures
	//   per frame at 60fps continuously for over 4000 years.
	tick: 0,  // for keeping track of which textures were used most recently

	gettexture: function (text, fontsize, colour, twidth, talign, tfull) {
		var key = text + ":" + fontsize + ":" + colour + ":" + twidth + ":" + talign + ":" + tfull
		if (this.textures[key]) return this.textures[key]

		var d = Math.ceil(0.2 * fontsize), lh = Math.ceil(1.25 * fontsize)
		var can = document.createElement("canvas")
		var con = can.getContext("2d")
		con.font = fontsize + "px 'Hockey'"
		var texts = text.split("\n")
		if (twidth) {
			texts = [].concat.apply([], texts.map(function(t) { return wordwrap(t, twidth, con) }))
		}
		// Remove trailing empty lines. Not sure if pyglet does this automatically?
		while (texts.length > 1 && !texts[texts.length-1]) texts.splice(texts.length - 1)
		var w0 = Math.max.apply(null, texts.map(function (t) { return con.measureText(t).width }))
		if (tfull && twidth) w0 = twidth
		
		var h0 = fontsize + lh * (texts.length - 1)  // size of text box itself
		var w1 = w0 + 2 * d, h1 = h0 + 2 * d  // size of text box with buffer
		var w = 2, h = 2  // size of texture (must be power of 2)
		while (w < w1) w <<= 1
		while (h < h1) h <<= 1
		can.width = w ; can.height = h
		con.font = fontsize + "px 'Hockey'"
		if (DEBUG.textblock) {
			con.fillStyle = "rgba(255,0,0,0.06)"
			con.fillRect(0, 0, w, h)
			con.fillStyle = "rgba(255,255,0,0.08)"
			con.fillRect(0, 0, w1, h1)
			con.fillRect(d, d, w0, h0)
		}
		con.fillStyle = colour
		con.textBaseline = "top"
		// TODO: there's got to be a better way than converting this back and forth so many times
		talign = {0: "left", 0.5: "center", 1: "right"}[talign] || talign || "left"
		con.textAlign = talign
		//con.strokeStyle = "black"
		//con.lineWidth = 5
		var x0 = Math.round(d + {left: 0, center: 0.5, right: 1}[talign] * w0)

		texts.forEach(function (text, j) {
			//con.strokeText(text, x0, d + j * lh)
			con.fillText(text, x0, d + j * lh)
		})

		var t = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, t)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, can)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		
		t.drawhud = this.bounddrawhud
		t.drawworld = this.bounddrawworld
		t.w0 = w0 ; t.h0 = h0
		t.w1 = w1 ; t.h1 = h1
		t.w = w ; t.h = h
		t.d = d
		t.x0 = d ; t.y0 = d
		t.s = w * h
		this.textotal += t.s

		this.textures[key] = t
		return t
	},

	// Draw text in HUD coordinates
	// (hanchor, vanchor) is anchor point: (0,0) = bottom left, (1, 1) = top right
	// Can be specified as either a number or string: left/center/right, bottom/middle/top
	drawhud: function (text, x, y, fontsize, colour, hanchor, vanchor, twidth, talign, tfull) {
		this.gettexture(text, fontsize, colour, twidth, talign, tfull).drawhud(x, y, hanchor, vanchor)
	},
	
	drawworld: function (text, x, y, fontsize, colour, hanchor, vanchor, twidth, talign, tfull) {
		fontsize = Math.round(fontsize * graphics.cz)
		this.gettexture(text, fontsize, colour, twidth, talign, tfull).drawworld(x, y, hanchor, vanchor)
	},
	
	// apply this to a texture object before calling
	bounddrawhud: function (x, y, hanchor, vanchor) {
		//graphics.debugcircle(x, y, 4, [1,0,1], true)
		hanchor = hanchor ? hanchor.trim ? {left: 0, center: 0.5, right: 1}[hanchor] : hanchor : 0
		vanchor = vanchor ? vanchor.trim ? {bottom: 0, middle: 0.5, top: 1}[vanchor] : vanchor : 0
		this.tick = text.tick++
		graphics.settexture(this)
		// coordinates of bottom-left of inner box
		x -= hanchor * this.w0
		y -= vanchor * this.h0
		// coordinates of bottom-left of texture
		x -= this.d
		y -= this.h - this.h0 - this.d
		x = Math.round(x)
		y = Math.round(y)
		graphics.tracehudrect([x,y], [this.w, this.h])
	},
	// draw at the given x,y world coordinates (but not zoomed with current world zoom level)
	bounddrawworld: function (x, y, hanchor, vanchor) {
		hanchor = hanchor ? hanchor.trim ? {left: 0, center: 0.5, right: 1}[hanchor] : hanchor : 0
		vanchor = vanchor ? vanchor.trim ? {bottom: 0, middle: 0.5, top: 1}[vanchor] : vanchor : 0
		this.tick = text.tick++
		graphics.settexture(this)
		var spos = graphics.worldtoscreen(x, y), sx = spos[0], sy = spos[1]
		// coordinates of bottom-left of inner box
		sx -= hanchor * this.w0
		sy -= vanchor * this.h0
		// coordinates of bottom-left of texture
		sx -= this.d
		sy -= this.h - this.h0 - this.d
		sx = Math.round(sx)
		sy = Math.round(sy)
		graphics.tracehudrect([sx,sy], [this.w, this.h], 1)
	},


	// Draw text with one of those jagged borders around it
	drawhudborder: function (text, x, y, fontsize, colour, gutter, hanchor, vanchor, twidth, talign, tfull, ocolour, scolour) {
		hanchor = hanchor ? hanchor.trim ? {left: 0, center: 0.5, right: 1}[hanchor] : hanchor : 0
		vanchor = vanchor ? vanchor.trim ? {bottom: 0, middle: 0.5, top: 1}[vanchor] : vanchor : 0
		var ttex = this.gettexture(text, fontsize, colour, twidth, talign, tfull)
		var px = Math.round(x - hanchor * ttex.w0 - gutter)
		var py = Math.round(y - vanchor * ttex.h0 - gutter)
		var size = [ttex.w0 + 2 * gutter, ttex.h0 + 2 * gutter]
		graphics.drawhudrect([px, py], size, ocolour || [1,1,1,1], scolour || [0,0,0,0.8])
		ttex.drawhud(x, y, hanchor, vanchor)
		//graphics.draw(gdata.debug_iface_circle, px-4, py-4, 8, 0, {colour: [1,0,1], hud: true})
	},

	
	// Call this occasionally for garbage collection at the beginning of a loop, when it's okay
	//   to remove any unused textures.
	cleanup: function () {
		// Naive implementation: remove everything every frame
		this.clear()
	},

	clear: function () {
		for (var t in this.textures) {
			this.textotal -= this.textures[t].s
			gl.deleteTexture(this.textures[t])
			delete this.textures[t]
		}
	},

}


function wordwrap(text, twidth, con) {
	twidth = twidth || con.canvas.width
	var texts = [text], n = 0, s
	while (con.measureText(texts[n]).width > twidth && (s = texts[n].indexOf(" ")) > -1) {
		var t = texts[n], a = t.lastIndexOf(" ")
		while (con.measureText(t.substr(0, a)).width > twidth && a > s) a = t.lastIndexOf(" ", a-1)
		texts[n++] = t.substr(0, a)
		texts.push(t.substr(a+1))
	}
	return texts
}



// Good grief the original menu module is complicated. I'm just going to rewrite it rather than
//   try to understand it.

function Menu(choices, x, y, opts) {
	this.init(choices, x, y, opts)
}
Menu.prototype = {
	init: function (choices, x, y, opts) {
		opts = opts || {}
		//choices = choices.filter(function (c) { return c[0].split || c[0]() })
		this.texts = choices.map(function (c) { return c[0] })
		this.fns = choices.map(function (c) { return c[1] })
		this.n = choices.length
		this.current = opts.defaultOption || 0
		// (x,y) = coordinates of anchor point
		// (x0,y0,w0,h0) = box, not including gutter
		// (x1,y1,w1,h1) = box including gutter
		this.x = x
		this.y = y
		this.hanchor = opts.hanchor || 0
		this.vanchor = opts.vanchor || 0

		this.colour0 = opts.colour0 || "#888800"  // unfocused colour
		this.colour1 = opts.colour1 || "#FFFF00"  // focused colour
		
		this.scolour = opts.scolour  // solid background colour
		this.ocolour = opts.ocolour  // outline colour
		
		this.header = opts.header
		this.hcolour = opts.hcolour || "#FFFFFF"
		
		this.opts = opts
		this.setsizes()
	},
	
	// Texts can be strings or zero-argument functions
	gettext: function (j) {
		return this.texts[j].split ? this.texts[j] : this.texts[j]()
	},
	getkey: function () {
		return this.texts.map(function (t,j) { return t.split ? t : t() }).join("|")
	},

	setsizes: function () {
		// These options are pulled here from the init method because they change on adjust!
		this.fontsize = Math.round(this.opts.fontsize || MENU_FONT_LARGE * settings.scr_h)
		// gutter around the individual options (for drawing selected box)
		this.ogutter = Math.round("ogutter" in this.opts ? this.opts.ogutter : 0.25 * this.fontsize)
		// Vertical separation between options
		this.spacing = Math.round("spacing" in this.opts ? this.opts.spacing : MENU_TEXT_SPACING * settings.scr_h)
		// gutter of the menu itself
		this.gutter = Math.round("gutter" in this.opts ? this.opts.gutter : this.ogutter * 3)
		// text width, defaults to undefined
		this.twidth = this.opts.width

		this.x0s = [] ; this.x1s = [] ; this.y0s = [] ; this.y1s = []
		this.w0s = [] ; this.w1s = [] ; this.h0s = [] ; this.h1s = []

		// Determine the size of each text box
		this.w0 = 0
		this.h0 = (this.n - 1) * this.spacing
		for (var j = 0 ; j < this.n ; ++j) {
			var t = this.gettext(j)
			if (!t) {
				this.w0s.push(null)
				this.w1s.push(null)
				this.h0s.push(null)
				this.h1s.push(null)
				continue
			}
			var tex = text.gettexture(t, this.fontsize, this.colour0, this.twidth)
			this.w0s.push(tex.w0)
			this.w1s.push(tex.w0 + 2 * this.ogutter)
			this.w0 = Math.max(this.w0, tex.w0)
			this.h0s.push(tex.h0)
			this.h1s.push(tex.h0 + 2 * this.ogutter)
			this.h0 += tex.h0
		}
		if (this.header) {
			var tex = text.gettexture(this.header, this.fontsize, this.colour0, this.twidth)
			this.headw0 = tex.w0
			this.headw1 = tex.w0 + 2 * this.ogutter
			this.w0 = Math.max(this.w0, tex.w0)
			this.headh0 = tex.h0
			this.headh1 = tex.h0 + 2 * this.ogutter
			this.h0 += tex.h0 + this.spacing
		}
		this.h1 = this.h0 + 2 * this.gutter
		this.w1 = this.w0 + 2 * this.gutter

		// Determine the location of each text box
		this.x0 = this.x - this.w0 * this.hanchor
		this.x1 = this.x0 - this.gutter
		this.y0 = this.y - this.h0 * this.vanchor
		this.y1 = this.y0 - this.gutter
		var y = this.y0 + this.h0
		if (this.header) {
			this.headx0 = this.x - this.w0 * this.hanchor
			y -= this.headh0
			this.heady0 = y
			// Don't need headx1 and heady1 since header is never outlined
		}
		for (var j = 0 ; j < this.n ; ++j) {
			if (this.w0s[j] === null) {
				this.x0s.push(null)
				this.x1s.push(null)
				this.y0s.push(null)
				this.y1s.push(null)
				continue
			}
			this.x0s.push(this.x - this.w0s[j] * this.hanchor)
			this.x1s.push(this.x0s[j] - this.ogutter)
			y -= this.h0s[j] + this.spacing
			this.y0s.push(y)
			this.y1s.push(this.y0s[j] - this.ogutter)
		}
		this.sizekey = this.getkey()
	},
	draw: function (focused) {
		if (this.sizekey !== this.getkey()) this.setsizes()
		if (focused === undefined) focused = this.current
		if (this.ocolour || this.scolour) {
			graphics.drawhudrect([this.x1, this.y1], [this.w1, this.h1], this.ocolour, this.scolour)
		}
		if (this.header) {
			text.drawhud(this.header, this.headx0, this.heady0, this.fontsize, this.hcolour, 0, 0, this.twidth)
		}
		for (var j = 0 ; j < this.n ; ++j) {
			var t = this.gettext(j), x = this.x0s[j], y = this.y0s[j]
			if (!t || x === null) continue
			if (j == focused) {
				text.drawhudborder(t, x, y, this.fontsize, this.colour1, this.ogutter, 0, 0, this.twidth)
			} else {
				text.drawhud(t, x, y, this.fontsize, this.colour0, 0, 0, this.twidth)
			}
		}
	},
	handlekeys: function (kdown) {
		var dcurrent = (kdown.up ? -1 : 0) + (kdown.down ? 1 : 0)
		this.current += dcurrent + this.n
		this.current %= this.n
		while (this.x0s[this.current] === null) {
			this.current += (dcurrent || 1) + this.n
			this.current %= this.n
		}
		if (kdown.enter) this.activate()
	},
	handlemouse: function (mx, my, clicked) {
		for (var j = 0 ; j < this.n ; ++j) {
			if (this.x0s[j] === null) continue
			var dx = mx - this.x1s[j], dy = my - this.y1s[j]
			if (0 <= dx && dx <= this.w1s[j] && 0 <= dy && dy <= this.h1s[j]) {
				this.current = j
			}
		}
		if (clicked) this.activate()
	},
	activate: function () {
		this.fns[this.current]()
	},
}


function MenuScene(choices, opts) {
	this.choices = choices
	var opts0 = { hanchor: 0.5, vanchor: 1 }
	this.opts = opts ? extend(opts0, opts) : opts0
	this.mx = null
	this.my = null
}
MenuScene.prototype = {

	start: function () {
		this.setpos()
		this.menu = new Menu(this.choices, this.x, this.y, this.opts)
		if (this.opts.music) playmusic(this.opts.music)
		this.onadjust()
	},
	setpos: function () {
		this.x = "x" in this.opts ? this.opts.x : Math.floor(settings.scr_w/2)
		this.y = "y" in this.opts ? this.opts.y : Math.floor(0.7*settings.scr_h)
	},
	thinkargs: function (dt) {
		return [dt, UFX.mouse.state(), UFX.key.state()]
	},
	think: function (dt, mstate, kstate) {
		this.menu.handlekeys(kstate.down)
		if (mstate.pos) {
			this.mx = mstate.pos[0]
			this.my = settings.scr_h - mstate.pos[1]
			this.menu.handlemouse(this.mx, this.my, mstate.left.down)
		}
	},

	draw: function () {
		graphics.clear()
		graphics.draw(gdata.title, settings.scr_w/2, settings.scr_h/2, settings.scr_h/2, 0, {colour: [0.8,0.8,0], hud: true})
		this.menu.draw(this.suspended ? -1 : undefined)
		var s = settings.gamename + " js: version " + settings.version
		text.drawhud(s, 5, 5, MENU_FONT_SMALL * settings.scr_h, "#7F7F7F", 0, 0)
		canvas.style.cursor = settings.cursor ? "none" : "crosshair"
		if (this.mx !== null && !this.suspended && settings.cursor) {
			graphics.drawcursor("walk", this.mx, this.my, {hud: true})
		}
	},
	
	suspend: function () { this.suspended = true },
	resume: function () {
		this.onadjust()
		this.suspended = false
		if (this.opts.music) playmusic(this.opts.music)
	},
	
	onadjust: function () {
		graphics.onadjust()
		this.setpos()
		this.menu.x = this.x
		this.menu.y = this.y
		this.menu.setsizes()
	},
}

function pushscene(name) {
	return UFX.scene.push.bind(UFX.scene, name)
}
function swapscene(name) {
	return UFX.scene.swap.bind(UFX.scene, name)
}


// This is sort of a hack to make the "Continue Game" option only show up when there's a saved
//   game. Should reconsider once I've implemented multiple save slots, or I need another menu
//   with this functionality.
function MainMenuScene() {
	this.setup()
}
MainMenuScene.prototype = extend(MenuScene.prototype, {
	setup: function () {
		var choices = [
			[function () { return slotfilled() ? null : "New Game" },
				function () {
					initPlotState(plotstate)
					robotstate.init(null)
					UFX.scene.push("missionmode")
				},
			],
			[function () { return slotfilled() ? "Continue Game" : null },
				function () {
					loadgame()
					UFX.scene.push("missionmode")
				}
			],
			["Options", pushscene("options")],
			["Credits", pushscene("credits")],
		]
		var opts = { music: MENU_MUSIC }
		MenuScene.call(this, choices, opts)
	},
	resume: function () {
		this.setup()
		this.start()
		MenuScene.prototype.resume.apply(this)
	}
})
UFX.scenes.mainmenu = new MainMenuScene()

UFX.scenes.options = new MenuScene([
	[function () { return "Music: " + (settings.music ? "On" : "Off") },
		function () { setmusic(!settings.music) ; settings.save() }],
	[function () { return "Sound effects: " + (settings.sfx ? "On" : "Off") },
		function () { setsfx(!settings.sfx) ; settings.save() }],
	[function () { return "Soft Cursor: " + (settings.cursor ? "On" : "Off") },
		function () { settings.cursor = !settings.cursor ; settings.save() }],
	[function () { return "Line Width: " + settings.linewidth },
		function () { graphics.setlinewidth(settings.linewidth % 3 + 1) ; settings.save() }],
	// TODO: hack so you don't get this option within the game
	[function () { return slotfilled() && UFX.scene._stack.length <= 2 ? "Reset Saved Game" : null },
		pushscene("confirmreset")],
	["Back", UFX.scene.pop.bind(UFX.scene)],
])

UFX.scenes.confirmreset = new MenuScene([
	["Reset saved game", function () { deletesavedgame() ; UFX.scene.pop() }],
	["Nevermind", function () { UFX.scene.pop() }],
])


UFX.scenes.pause = new MenuScene([
	["Resume Game", UFX.scene.pop.bind(UFX.scene)],
	["Options", pushscene("options")],
	["Quit", UFX.scene.pop.bind(UFX.scene, 2)],
])



UFX.scenes.credits = {
	start: function () {
		var licenseurl = window.location.origin + window.location.pathname + "about.html"
		this.texts = [
		[
			"A Super Effective Production",
			"Original programming:\nAdam Biltcliffe\nMartin O'Leary\nRichard Thomas\nJohn-Joseph Wilks",
			"Graphics:\nCarrie Oliver",
		].join("\n\n"), [
			"Javascript version\nUniverse Factory Games",
			"Programming:\nChristopher Night",
		].join("\n\n"), [
			"Font 'Hockey is Lif' by Tom Murphy\nhttp://fonts.tom7.com/legal/",
			"Music by Kevin MacLeod (incompetech.com)\n* Chase *\n* Electro Sketch *\n* How it Begins *\n* Klockworx *\n* Long Time Coming *\n* Radio Martini *",
		].join("\n\n"), [
			"Robot Underground is free software.",
			"Game code, graphics, and sound effects\nare released under the BSD license.",
			"Please see\n" + licenseurl + "\nfor license text.",
		].join("\n\n")]
		this.jscreen = 0
	},
	thinkargs: function (dt) {
		return [dt, UFX.mouse.state(), UFX.key.state()]
	},
	think: function (dt, mstate, kstate) {
		if (mstate.left.down || kstate.down.space || kstate.down.enter || kstate.down.tab) this.jscreen++
		if (this.jscreen >= this.texts.length || kstate.down.esc) UFX.scene.pop()
		if (mstate.pos) this.mpos = [mstate.pos[0], settings.scr_h - mstate.pos[1]]
	},
	draw: function () {
		UFX.scenes.mainmenu.draw()
		var s = this.texts[this.jscreen]
		if (!s) return
		var x = settings.scr_w/2, y = settings.scr_h/2, fontsize = MENU_FONT_SMALL * settings.scr_h
		text.drawhudborder(s, x, y, fontsize, "#7F7F7F", 10, 0.5, 0.5, null, 0.5, null, [0,0,0.2,0.9])
		if (this.mpos) graphics.drawcursor("walk", this.mpos[0], this.mpos[1], {hud: true})
	},
	onadjust: function () {
		UFX.scenes.mainmenu.onadjust()
	},
}








function InventoryPixIcon(item) {
	this.item = item
	this.icon = gdata.weapon_icons[item.name] || gdata.armour
	this.x_pos = this.y_pos = 0
	this.width = this.height = 0
}
InventoryPixIcon.prototype = {
	color: INVMENU_ICON_COLORS.normal,
	background: INVMENU_ICON_BACKGROUND,
	contains: function (pos) {
		var dx = pos[0] - this.x_pos, dy = pos[1] - this.y_pos
		return 0 <= dx && dx < this.width && 0 <= dy && dy < this.height
	},
	activate: function () {
		if (this.activate_fn) this.activate_fn()
	},
	draw: function (dx, dy) {
		var x = this.x_pos + (dx || 0), y = this.y_pos + (dy || 0)
		graphics.drawhudrect([x, y], [this.width, this.height],
			this.color, this.background)
		graphics.draw(this.icon, x, y, this.height, 0, { hud: true })
		if (!this.item.isIdentified) {
			graphics.draw(gdata.appraised, x + 0.75 * this.width, y,
				this.width / 4, 0, { hud: true, colour: [0.8, 0, 0.8]})
		}
		if (robotstate.inventory.indexOf(this.item) == -1) {
			graphics.draw(gdata.equipped, x, y, this.width / 4, 0,
				{ hud: true, colour: [0, 0.8, 0] })
		}
	},
}

function ScrollingInventoryMenu(callback) {
	var scr_w = settings.scr_w, scr_h = settings.scr_h
	this.callback = callback
	
	var margin = INVMENU_MARGIN * scr_h, padding = INVMENU_PADDING * scr_h
	
	this.view_w = INVMENU_SIZE[0] * scr_w
	this.view_h = INVMENU_SIZE[1] * scr_h
	this.view_l = 0.5 * (scr_w - this.view_w)
	this.view_b = scr_h - this.view_h - margin - padding
	
	this.box_w = this.view_w + 2 * padding
	this.box_h = this.view_h + 2 * padding
	this.box_l = this.view_l - padding
	this.box_b = this.view_b - padding
	
	var icol = INVMENU_ICON_PERCOL, irow = INVMENU_ICON_PERROW, ipratio = INVMENU_ICON_PADDINGRATIO
	if (icol === null) {
		var iw = this.view_w / (irow * (1 + ipratio) - ipratio), ih = iw, ipad = ih * ipratio
	} else if (irow === null) {
		var ih = this.view_h / (icol * (1 + ipratio) - ipratio), iw = ih, ipad = ih * ipratio
	} else {
		var ih = this.view_h / (icol * (1 + ipratio) - ipratio), ipad = ih * ipratio,
			iw = Math.floor((this.view_w - (irow - 1) * ipad) / irow)
	}
	this.icon_height = ih ; this.icon_width = iw ; this.icon_padding = ipad
	this.button_size = INVMENU_BUTTON_SIZE * scr_h
	
	this.cur_scroll = 0
	this.max_scroll = 0
	this.scroll_off = this.view_b
	
	var s = this.button_size
	// Close inventory menu
	this.cross = new Button(this.callback,
		this.box_l, this.box_b + this.box_h, s, s,
		gdata.cross, null, null, true, true)
	this.arrow_up = new Button(this.scroll.bind(this, -1),
		this.box_l + this.box_w, this.box_b + this.box_h, s, s,
		gdata.triup, null, null, true, true)
	this.arrow_down = new Button(this.scroll.bind(this, 1),
		this.box_l + this.box_w, this.box_b, s, s,
		gdata.tridown, null, null, true, true)
	this.buttons = [this.cross, this.arrow_up, this.arrow_down]
	this.mouse_pos = [0, 0]
	this.current_idx = null
	this.load_inventory()
}
ScrollingInventoryMenu.prototype = {
	contains: function (pos) {
		return this.box_l <= pos[0] && pos[0] < this.box_l + this.box_w &&
			this.view_b <= pos[1] && pos[1] < this.view_b + this.view_h
	},

	set_left: function (item, force) {
		if (!item) {
			this.left_popup = null
			this.left_item = null
		} else if (item !== this.left_item || force) {
			this.left_popup = this.item_description(item, true)
			this.left_item = item
		}
	},
	set_right: function (item, force) {
		if (!item) {
			this.right_popup = null
			this.right_item = null
		} else if (item !== this.right_item || force) {
			this.right_popup = this.item_description(item, true)
			this.right_item = item
		}
	},

	set_current: function (idx) {
		if (idx === this.current_idx) return
		if (this.icons[this.current_idx])
			this.icons[this.current_idx].color = INVMENU_ICON_COLORS.normal
		this.current_idx = idx
		if (this.icons[this.current_idx])
			this.icons[this.current_idx].color = INVMENU_ICON_COLORS.selected
	},
	
	// Move the current selection with the keyboard
	_change_current: function (delta, rowlock) {
		var max_icon = this.icons.length - 1
		console.log(this.current_idx)
		if (this.current_idx === null) {
			var idx = 0
		} else {
			var idx = clip(this.current_idx + delta, 0, max_icon)
		}
		if (rowlock && this.current_idx !== null) {
			if (Math.floor(idx / this.icon_per_row) == Math.floor(this.current_idx / this.icon_per_row)) {
				return
			}
		}
		this.set_current(idx)

		var icon_b = this.icons[idx].y_pos, icon_t = icon_b + this.icon_height
		var min_b = this.max_scroll - this.cur_scroll
		var max_t = this.max_scroll - this.cur_scroll + this.view_h

		if (icon_b < min_b) this.cur_scroll = this.max_scroll - icon_b
		else if (icon_t > max_t) this.cur_scroll = this.max_scroll - icon_t + this.view_h
		this.scroll_off = this.view_b - (this.max_scroll - this.cur_scroll)
	},
	
	item_description: function (item, show_costs) {
		function cost_text(amounts) {
			var cost = []
			amounts.forEach(function (amt, idx) {
				if (amt > 0) cost.push(METAL_SYMS[idx] + ": " + amt)
			})
			return cost.join(", ")
		}
		var text_bits = [item.description()]
		if (show_costs) {
			var ided = item.isIdentified, had = robotstate.inventory.indexOf(item) > -1
			if (had || !ided) text_bits.push("")
			if (!ided) text_bits.push("Appraise cost - " + cost_text(item.appraisecost()))
			if (ided && had) text_bits.push("Equip cost - " + cost_text(item.equipcost()))
			if (had) text_bits.push("Sale value - " + cost_text(item.salevalue()))
		}
		return text_bits.join("\n")
	},

	// Replaces scroll_up and scroll_down
	scroll: function (amt) {
		if (amt === undefined) amt = 1
		this.cur_scroll += amt * this.icon_height * INVMENU_SCROLLSENSITIVITY
		this.cur_scroll = clip(this.cur_scroll, 0, this.max_scroll)
		this.scroll_off = this.view_b - (this.max_scroll - this.cur_scroll)
	},

	set_mouse: function (mpos) {
		var x = mpos[0], y = settings.scr_h - mpos[1]
		if (x == this.mouse_x && y == this.mouse_y) return
		this.mouse_x = x
		this.mouse_y = y
		
		var menu_popup = this.menu_popup
		if (menu_popup) {
			menu_popup.handlemouse(this.mouse_x, this.mouse_y)
			if (menu_popup.is_equip_weapon) {
				this.set_right(robotstate.weaponry[menu_popup.current])
			} else if (menu_popup.is_equip_armour) {
				this.set_right(menu_popup.current === 0 ? robotstate.armoury : null)
			} else {
				this.set_right()
			}
		} else {
			var x = this.mouse_x - this.view_l, y = this.mouse_y - this.scroll_off
			var newidx = null
			for (var idx = 0 ; idx < this.icons.length ; ++idx) {
				if (this.icons[idx].contains([x, y])) {
					newidx = idx
					break
				}
			}
			this.set_current(newidx)
			this.set_right()
		}
		this.set_left(this.icons[this.current_idx] ? this.icons[this.current_idx].item : null)
		
		for (var j = 0 ; j < this.buttons.length ; ++j) {
			this.buttons[j].color = this.buttons[j].point_within(this.mouse_x, this.mouse_y) ?
				INVMENU_BUTTON_COLORS.selected : INVMENU_BUTTON_COLORS.normal
		}
		if (this.cur_scroll <= 0) this.arrow_up.color = INVMENU_BUTTON_COLORS.greyed
		if (this.cur_scroll >= this.max_scroll) this.arrow_up.color = INVMENU_BUTTON_COLORS.greyed
		this.buttons.forEach(function (b) { b.border = b.color })
	},

	handle_input: function (mstate, kstate) {
		if (mstate.pos) this.set_mouse(mstate.pos)
		var menu_popup = this.menu_popup
		if (menu_popup) {
			if (mstate.left.down) menu_popup.activate()
			menu_popup.handlekeys(kstate.down)
			if (kstate.down.esc) this.close_menu()
			return
		}

		if (mstate.left.down) this.on_mouse_press()
		if (mstate.right.down) this.on_mouse_press(true, kstate.pressed.shift, kstate.pressed.ctrl)
		if (mstate.left.isdown && mstate.dpos[1]) {  // drag to scroll
			this.scroll(-mstate.dpos[1] / this.icon_height)
		}
		if (mstate.wheeldy) {  // mouse wheel to scroll
			this.scroll(-mstate.wheeldy)
		}
		if (kstate.down.up) this._change_current(-this.icon_per_row, true)
		if (kstate.down.down) this._change_current(this.icon_per_row, true)
		if (kstate.down.left) this._change_current(-1)
		if (kstate.down.right) this._change_current(1)
		if (kstate.down.enter && this.current_idx) this.icons[this.current_idx].activate()
		if (kstate.down.esc) this.callback()
	},
	on_mouse_press: function (right, shift, ctrl) {
		for (var j = 0 ; j < this.buttons.length ; ++j) {
			if (this.buttons[j].on_mouse_press(this.mouse_x, this.mouse_y))
				return true
		}
		if (!this.contains([this.mouse_x, this.mouse_y])) return
		var icon = this.icons[this.current_idx]
		if (!icon) return
		if (!right) icon.activate()
		else if (shift) this.do_appraise_item(icon.item)
		else if (ctrl) this.do_sell_item(icon.item)
		return true
	},

	popupmenu: function (choices, header) {
		var x = settings.scr_w/2, y = settings.scr_h/2
		this.menu_popup = new Menu(choices, x, y, {
			header: header,
			fontsize: 2 * INVMENU_TEXT_FONTSIZE * settings.scr_h,
			hanchor: 0.5,
			vanchor: 0.5,
			spacing: INVMENU_TEXT_SPACING * settings.scr_h,
			gutter: INVMENU_TEXT_PADDING * settings.scr_h,
			scolour: INVMENU_BACKGROUND,
			ocolour: INVMENU_BORDER,
		})
	},

	show_item: function (item) {
		if (robotstate.inventory.indexOf(item) == -1) return
		var choices = []
		if (item.isIdentified) {
			choices.push(["Equip", this.equip_item.bind(this, item)])
		} else {
			choices.push(["Appraise", this.appraise_item.bind(this, item)])
		}
		choices.push(["Sell", this.sell_item.bind(this, item)])
		choices.push(["Cancel", this.close_menu.bind(this)])
		this.popupmenu(choices, "Select an option:")
	},

	equip_item: function (item) {
		if (item.isweapon) {
			if (robotstate.canAfford(item.equipcost())) {
				this.equip_weapon(item)
			} else {
				this.notify_menu("You cannot afford to equip this weapon.", item)
			}
		} else if (item.isarmour) {
			if (robotstate.canAfford(item.equipcost())) {
				this.equip_armour(item)
			} else {
				this.notify_menu("You cannot afford to equip this armour.", item)
			}
		}
	},

	equip_weapon: function (item) {
		var choices = []
		for (var idx = 0 ; idx < robotstate.weaponry.length ; ++idx) {
			choices.push(["Slot " + (idx + 1), this.do_equip_weapon.bind(this, item, idx)])
		}
		choices.push(["Cancel", this.close_menu.bind(this)])
		this.popupmenu(choices)
		this.menu_popup.is_equip_weapon = true
	},

	equip_armour: function (item) {
		this.popupmenu([
			["Yes (replace current)", this.do_equip_armour.bind(this, item)],
			["Cancel", this.close_menu.bind(this)],
		], "Equip armour?")
		this.menu_popup.is_equip_armour = true
	},

	appraise_item: function (item) {
		if (robotstate.canAfford(item.salevalue())) {
			this.popupmenu([
				["Yes", this.do_appraise_item.bind(this, item)],
				["No", this.show_item.bind(this, item)],
			], "Appraise?")
		} else {
			this.notify_menu("You cannot afford to appraise this item.", item)
		}
	},
	
	sell_item: function (item) {
		this.popupmenu([
			["Yes", this.do_sell_item.bind(this, item)],
			["No", this.show_item.bind(this, item)],
		], "Sell?")
	},
	
	// NB: back_menu not needed, just set the back option explicitly
	
	notify_menu: function (text, item) {
		this.popupmenu([
			["Back", this.show_item.bind(this, item)],
		], text)
	},
	
	// NB: confirm menu typed out explicitly when needed
	
	close_menu: function () {
		this.menu_popup = null
	},
	
	do_equip_weapon: function (item, idx) {
		robotstate.setWeapon(item, idx)
		robotstate.removeMetals(item.equipcost())
		this.update_inventory()
		this.close_menu()
	},
	
	do_equip_armour: function (item) {
		robotstate.setArmour(item)
		robotstate.removeMetals(item.equipcost())
		this.update_inventory()
		this.close_menu()
	},
	
	do_appraise_item: function (item) {
		if (item.isIdentified) return
		if (!robotstate.canAfford(item.salevalue())) return
		robotstate.removeMetals(item.salevalue())
		// TODO gamelog
		item.isIdentified = true
		this.set_left(item, true)
		this.update_inventory()
		if (this.menu_popup) this.show_item(item)
	},
	
	do_sell_item: function (item) {
		var idx = robotstate.inventory.indexOf(item)
		if (idx == -1) return
		robotstate.addMetals(item.salevalue())
		robotstate.inventory.splice(idx, 1)
		this.remove_item(item)
		this.update_inventory()
		this.close_menu()
	},
	
	add_item: function (item) {
		//var icon = gdata.weapon_icons[item.name] || gdata.armour
		var icon = new InventoryPixIcon(item)  // TODO: support text icons
		this.icons.push(icon)
	},

	remove_item: function (item) {
		this.icons = this.icons.filter(function (i) { return i.item !== item })
	},		

	load_inventory: function () {
		this.icons = []
		var add = this.add_item.bind(this)
		robotstate.weaponry.filter(function (x) { return x }).forEach(add)
		add(robotstate.armoury)
		robotstate.inventory.forEach(add)
		this.update_inventory()
	},
	
	update_inventory: function () {
		var max_icon = this.icons.length - 1
		if (this.current_idx !== null) {
			this.current_idx = clip(this.current_idx, 0, max_icon)
			this.set_current(this.current_idx)
		}
		for (var j = 0 ; j <= max_icon ; ++j) {
			this.icons[j].activate_fn = this.show_item.bind(this, this.icons[j].item)
		}
		this.position_icons()
	},
	
	position_icons: function () {
		var iw = this.icon_width, ih = this.icon_height, ipad = this.icon_padding
		this.icon_per_row = INVMENU_ICON_PERROW
		var num_rows = Math.floor((this.icons.length - 1) / this.icon_per_row) + 1
		for (var idx = 0 ; idx < this.icons.length ; ++idx) {
			var icon = this.icons[idx]
			var row_idx = Math.floor(idx / this.icon_per_row), col_idx = idx % this.icon_per_row
			icon.x_pos = col_idx * (iw + ipad)
			icon.y_pos = (num_rows - row_idx - 1) * (ih + ipad)
			icon.width = iw
			icon.height = ih
		}
		this.max_scroll = Math.max(0, num_rows * (ih + ipad) - ipad - this.view_h)
		this.scroll_off = this.view_b - (this.max_scroll - this.cur_scroll)
	},

	draw_box: function () {
		graphics.drawhudrect([this.box_l, this.box_b], [this.box_w, this.box_h],
			INVMENU_BORDER, INVMENU_BACKGROUND)
	},
	
	draw_content: function () {
		var padding = INVMENU_TEXT_PADDING * settings.scr_h
		var max_b = this.max_scroll - this.cur_scroll + this.view_h + padding
		var min_t = this.max_scroll - this.cur_scroll - padding
		gl.scissor(Math.floor(this.box_l), Math.floor(this.view_b - padding / 2),
			Math.floor(this.box_w), Math.floor(this.view_h + padding))
		gl.enable(gl.SCISSOR_TEST)
		for (var j = 0 ; j < this.icons.length ; ++j) {
			this.icons[j].draw(this.view_l, this.scroll_off)
		}
		gl.disable(gl.SCISSOR_TEST)
	},
	
	draw: function () {
		this.draw_box()
		this.draw_content()
		this.buttons.forEach(function (b) { b.draw() })
		if (this.left_popup) {
			text.drawhudborder(this.left_popup, 0.25*settings.scr_w, 0.25*settings.scr_h,
				INVMENU_TEXT_FONTSIZE*settings.scr_h, "white", INVMENU_PADDING * settings.scr_h, 0.5, 0.5,
				0.45 * settings.scr_w, "center", false, INVMENU_BORDER, INVMENU_BACKGROUND)
		}
		if (this.right_popup) {
			text.drawhudborder(this.right_popup, 0.75*settings.scr_w, 0.25*settings.scr_h,
				INVMENU_TEXT_FONTSIZE*settings.scr_h, "white", INVMENU_PADDING * settings.scr_h, 0.5, 0.5,
				0.45 * settings.scr_w, "center", false, INVMENU_BORDER, INVMENU_BACKGROUND)
		}
		if (this.menu_popup) {
			this.menu_popup.draw()
		} else {
			var fontsize = HUD_FONT_SMALL * 1.2 * settings.scr_h, dy = Math.round(fontsize * 1.3)
		    var x = HUD_MARGIN * settings.scr_h, y = HUD_MARGIN * settings.scr_h
    		text.drawhud("Shift + right click: quick appraise", x, y + dy, fontsize, "white", "left", "bottom")
    		text.drawhud("Ctrl + right click: quick sell", x, y, fontsize, "white", "left", "bottom")
		}
	},
}







if (DEBUG.failhard) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
} else {
	window.onerror = function (error, url, line) {
		log.error(error, url, line)
	}
}

UFX.scenes.load = {
	start: function () {
		if (this.started) return
		this.canvas = document.getElementById("loadcanvas")
		this.canvas.style.display = "block"
		this.canvas.width = settings.scr_w ; this.canvas.height = settings.scr_h
		if (!DEBUG.fixcanvas) {
			UFX.maximize.fill(this.canvas, "aspect")
		}
		this.context = loadcanvas.getContext("2d")
		this.progress = 0
		this.loaded = false
		this.started = true
	},
	stop: function () {
		this.canvas.style.display = "none"
		canvas.style.display = "block"
	},
	onloading: function (f) {
		this.progress = f
	},
	onload: function () {
		if (!this.started) this.start()
		this.progress = 1
		gdata = UFX.resource.data.gdata
		mapdata = UFX.resource.data.mapdata
		graphics.init()
		"shot1 shot2 shot3 bullet4 radio railgun1".split(" ").forEach(function (s) {
			UFX.resource.sounds[s] = UFX.resource.Multisound(UFX.resource.sounds[s], 6)
		})
		UFX.resource.mergesounds("shot", "destroy", "pickup", "bullet", "lightning", "railgun")
		UFX.resource.sounds.level_up = UFX.resource.sounds.fanfare
		UFX.resource.sounds.shotgun = UFX.resource.sounds["44magnum"]
		UFX.resource.sounds.rifle = UFX.resource.sounds.gunshot1
		graphics.clear()
		UFX.mouse.capture.right = true
		UFX.mouse.capture.wheel = true
		UFX.mouse.init(canvas)
		UFX.key.watchlist = "up down left right enter space tab esc ctrl shift 1 2 3 4 5 6 7 8 9".split(" ")
		UFX.key.init()

		if (DEBUG.expose) {
			mode = UFX.scenes.missionmode
			zoomout = function () {	mode.desired_zoom /= 4 }
			zoomin = function () { mode.desired_zoom *= 4 }
		}
		this.loaded = true
		this.canvas.style.cursor = "pointer"
		this.canvas.onclick = function () {
			if (!DEBUG.fixcanvas) UFX.maximize.fill(canvas, "aspect")
			if (DEBUG.levelskip) {
				initPlotState(plotstate)
				robotstate.init(null)
				plotstate.nextScene = DEBUG.levelskip
				if (DEBUG.levelskip.indexOf("act") == 0) {
					plotstate.act = +DEBUG.levelskip[3]
				}
				UFX.scene.swap("missionmode")
			} else {
				UFX.scene.swap("mainmenu");
			}
		}
	},
	draw: function () {
		var s = this.loaded ? "Click~to~begin" : "Loading~(" + (this.progress * 100).toFixed(0) + "%)..."
		UFX.draw(this.context,
			"fs black f0",
			"textalign center [ t", this.canvas.width/2, this.canvas.height/2,
			"z", this.canvas.height/100, this.canvas.height/100,
			"t 0 -12 font 10px~Hockey",
			"fs yellow ft0 Robot~Underground",
			"t 0 12 ft0", s,
			"t 0 12 ft0 F11:~fullscreen",
			"]"
		)
	},
}

UFX.maximize.onadjust = function (canvas, sx, sy) {
	settings.scr_w = sx
	settings.scr_h = sy
	if (gl) gl.viewport(0, 0, sx, sy)
	var s = UFX.scene.top()
	if (s && s.onadjust) s.onadjust()
}
UFX.maximize.fillcolor = "#222"

// christopher@palimpsest:~/Downloads/robot-underground-1.0.4$ grep "\.wav" lib/sound.py | sed 's|.*\ "||;s|\..*||' | xargs -n 1 -I xxx oggenc data/sfx/xxx.wav -o ~/projects/unifac/robot-underground/data/sfx/xxx.ogg
// radio.wav is weird - had to convert it with audacity
var soundnames = (
	"shot1 shot2 shot3 destroy1 destroy2 destroy3 destroy4 pickup1 fanfare bullet4 radio click roar " +
	"lightning1 lightning2 lightning3 explosion eject railgun1 44magnum click plasma fireball " +
	"gunshot1"
).split(" ")
var songnames = "Chase ElectroSketch HowItBegins Klockworx LongTimeComing RadioMartini".split(" ")
//var songnames = "ElectroSketch HowItBegins RadioMartini".split(" ")

var res = {
	mapdata: "data/mapdata.json",
	gdata: "data/gdata.json",
}
songnames.forEach(function (sname) { res[sname] = "data/music/" + sname + ".ogg" })
soundnames.forEach(function (sname) { res[sname] = "data/sfx/" + sname + ".ogg" })

if (gl) {
	UFX.scene.init({fps: 30})
	UFX.scene.push("load")
	UFX.resource.onloading = UFX.scenes.load.onloading.bind(UFX.scenes.load)
	UFX.resource.onload = UFX.scenes.load.onload.bind(UFX.scenes.load)
	UFX.resource.load(res)
} else {
	throw "webGL is required: please see http://get.webgl.org"
}

function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

function splitcap(s) { return s.replace(/([A-Z])/g, ' $1').substr(1) }

// From helpers.py
function d2between(first, second) {
	var dx = first[0] - second[0], dy = first[1] - second[1]
	return dx * dx + dy * dy
}
function distanceBetween(first, second) {
	return Math.sqrt(d2between(first, second))
}

var musicplaying = null
var musicvolume = 1, sfxvolume = 1
function setsfx(on) {
	settings.sfx = on
}
function setmusic(on) {
	settings.music = on
	if (musicplaying) musicplaying.volume = settings.music ? musicvolume : 0
}

function playsound(name) {
	if (!UFX.resource.sounds[name]) {
		console.log("missing sound: " + name)
		return
	}
	if (!settings.sfx) return
	UFX.resource.sounds[name].volume = sfxvolume
	UFX.resource.sounds[name].play()
}

function stopmusic() {
	if (musicplaying) musicplaying.pause()
	musicplaying = null
}
function playmusic(songname) {
	if (!UFX.resource.sounds[songname]) {
		console.log("missing song: " + name)
		return
	}
	var m = UFX.resource.sounds[songname]
	if (m === musicplaying) return
	if (musicplaying) musicplaying.pause()
	// TODO: actually don't play the music if it's not on?
	m.volume = settings.music ? musicvolume : 0
	m.currentTime = 0
	m.loop = true
	m.play()
	musicplaying = m
}




