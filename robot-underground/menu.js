// Good grief the original menu module is complicated. I'm just going to rewrite it rather than
//   try to understand it.

function Menu(choices, x, y, opts) {
	this.init(choices, x, y, opts)
}
Menu.prototype = {
	init: function (choices, x, y, opts) {
		opts = opts || {}
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
			var tex = text.gettexture(this.gettext(j), this.fontsize, this.colour0, this.twidth)
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
			if (j == focused) {
				text.drawhudborder(t, x, y, this.fontsize, this.colour1, this.ogutter, 0, 0, this.twidth)
			} else {
				text.drawhud(t, x, y, this.fontsize, this.colour0, 0, 0, this.twidth)
			}
		}
	},
	handlekeys: function (kdown) {
		this.current += (kdown.up ? -1 : 0) + (kdown.down ? 1 : 0) + this.n
		this.current %= this.n
		if (kdown.enter) this.activate()
	},
	handlemouse: function (mx, my, clicked) {
		for (var j = 0 ; j < this.n ; ++j) {
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
			["New Game", function () {
				initPlotState(plotstate)
				robotstate.init(null)
				UFX.scene.push("missionmode")
			}],
			["Options", pushscene("options")],
			["Credits", pushscene("credits")],
		]
		if (slotfilled()) {
			choices.splice(1, 0, 
				["Continue Game", function () {
					loadgame()
					UFX.scene.push("missionmode")
				}]
			)
		}
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

// TODO menuingame menustart confirmsaveover menuload menuoptions

UFX.scenes.options = new MenuScene([
	[function () { return "Music: " + (settings.music ? "On" : "Off") }, function () { setmusic(!settings.music) }],
	[function () { return "Sound effects: " + (settings.sfx ? "On" : "Off") }, function () { setsfx(!settings.sfx) }],
	[function () { return "Soft Cursor: " + (settings.cursor ? "On" : "Off") }, function () { settings.cursor = !settings.cursor }],
	[function () { return "Line Width: " + settings.linewidth }, function () { graphics.setlinewidth(settings.linewidth % 3 + 1) }],
	["Back", UFX.scene.pop.bind(UFX.scene)],
])

UFX.scenes.pause = new MenuScene([
	["Resume Game", UFX.scene.pop.bind(UFX.scene)],
	["Options", pushscene("options")],
	["Quit", UFX.scene.pop.bind(UFX.scene, 2)],
])



UFX.scenes.credits = {
	start: function () {
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






