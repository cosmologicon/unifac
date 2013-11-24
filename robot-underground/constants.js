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




