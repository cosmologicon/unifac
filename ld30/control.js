
var control = {
	init: function () {
		this.buttons = {
			stroid: {
				main: true,
				offset: 0,
				text: "S",
			},
			toid: {
				main: true,
				offset: 1,
				text: "T",
			},
			bloid: {
				main: true,
				offset: 2,
				text: "B",
			},
			audio: {
				main: false,
				offset: 0,
				path: "b o 0.5 0.5 0.18 f b o 0.5 0.5 0.25 lw 0.06 s b o 0.5 0.5 0.35 lw 0.04 s",
				text: "sfx",
			},
			undo: {
				main: false,
				offset: 1,
				text: "redo",
			},
			prev: {
				main: false,
				offset: 2,
				text: "prev",
			},
			next: {
				main: false,
				offset: 3,
				text: "next",
			},
		}
		this.selectedbutton = null
		this.buildstart = null
	},
	// closest point to p that's directly horizontal or vertical to p0
	nearest: function (p0, p) {
		return Math.abs(p0[0] - p[0]) > Math.abs(p0[1] - p[1]) ? [p[0], p0[1]] : [p0[0], p[1]]
	},
	
	think: function (dt) {
		var sx = canvas.width, sy = canvas.height
		var bsize = Math.floor(0.2 * Math.min(sx, sy))
		for (var bname in this.buttons) {
			var button = this.buttons[bname]
			button.w = button.h = bsize
			if (sx < sy) {
				button.x = button.offset * bsize
				button.y = button.main ? sy - bsize : 0
			} else {
				button.x = button.main ? 0 : sx - bsize
				button.y = button.offset * bsize
			}
		}
	},
	
	isvisible: function (bname) {
		if (bname == "prev") {
			return state.level > 0
		} else if (bname == "next") {
			return state.level < window.localStorage[settings.savename]
		} else if (bname == "toid" || bname == "stroid" || bname == "bloid") {
			return settings.EDITOR
		}
		return true
	},

	buttonat: function (pos) {
		for (var bname in this.buttons) {
			if (!this.isvisible(bname)) continue
			var b = this.buttons[bname]
			if (b.x < pos[0] && pos[0] < b.x + b.w && b.y < pos[1] && pos[1] < b.y + b.h) {
				return bname
			}
		}
		return null
	},
	
	selectbutton: function (bname) {
		if (bname == "audio") {
			audio.toggle()
		} else if (bname == "undo") {
			gamescene.wincurtain = 1
			UFX.scene.swap(gamescene)
			audio.buzz()
		} else if (bname == "prev") {
			if (state.level) state.level -= 1
			gamescene.wincurtain = 1
			UFX.scene.swap(gamescene)
			audio.change()
		} else if (bname == "next") {
			state.level += 1
			gamescene.wincurtain = 1
			UFX.scene.swap(gamescene)
			audio.change()
		} else {
			this.selectedbutton = this.selectedbutton == bname ? null : bname
		}
	},
	
	start: function (pos) {
		this.buildstart = null
		var b = state.thingat(view.togame(pos[0], pos[1]))
		if (b) this.buildstart = b
	},
	
	end: function (pos) {
		if (!this.buildstart) return
		var gpos = view.togame(pos[0], pos[1])
		var p = this.nearest([this.buildstart.x, this.buildstart.y], gpos).map(Math.round)
		var b = state.thingat(p)
		if (b && b !== this.buildstart) {
			if (state.canbuild(this.buildstart, p[0], p[1])) {
				state.joinworlds(this.buildstart, b)
				audio.build()
			} else {
				audio.buzz()
			}
		}
		this.clear()
	},
	
	clear: function () {
		this.buildstart = null
	},
	
	setpos: function (pos) {
		this.pos = pos
	},

	drawcursor: function () {
		if (!this.buildstart) return
		var p = view.togame(this.pos[0], this.pos[1])
		var pnear = this.nearest([this.buildstart.x, this.buildstart.y], p)
		var xnear = Math.round(pnear[0]), ynear = Math.round(pnear[1])
		if (xnear == this.buildstart.x && ynear == this.buildstart.y) return
		var bridge = BridgeCursor(this.buildstart, xnear, ynear)
		context.save()
		bridge.draw()
		context.restore()
	},
	
	draw: function () {
		this.buttons.audio.path = audio.on ?
			"b o 0.5 0.5 0.18 f b o 0.5 0.5 0.25 lw 0.06 s b o 0.5 0.5 0.35 lw 0.04 s" :
			"b o 0.5 0.5 0.18 f"
		for (var bname in this.buttons) {
			if (!this.isvisible(bname)) continue
			var button = this.buttons[bname]
			UFX.draw(
				"[ t", button.x, button.y, "z", button.w, button.h,
				"b rr 0.05 0.05 0.9 0.9 0.15",
				"fs rgba(0,255,255," + (bname == this.selectedbutton ? 0.4 : 0.1) + ")",
				"ss rgba(0,255,255," + (bname == this.selectedbutton ? 0.8 : 0.4) + ")",
				"lw 0.04 f s",
				"fs rgba(255,255,255,0.3)",
				"t 0.5 0.5 z 0.03 0.03 font 12px~'Nova~Flat' textalign center textbaseline middle ft0", button.text,
				"]"
			)
		}
		var h = Math.ceil(0.09 * Math.min(canvas.width, canvas.height))
		UFX.draw("[ textalign right textbaseline bottom t", canvas.width - 0.2 * h, canvas.height - 0.2 * h,
			"font", h + "px~'Nova~Flat'", "fs rgba(255,255,255,0.5) ft money:~$" + state.money, "0 0 ]")
	},
}

