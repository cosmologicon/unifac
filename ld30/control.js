
var control = {
	init: function () {
		this.buttons = {
			bridge: {
				main: true,
				offset: 0,
				path: "b o 0.3 0.5 0.1 o 0.6 0.5 0.1 f",
			},
			relay: {
				main: true,
				offset: 1,
				path: "b o 0.5 0.5 0.25 lw 0.1 s",
			},
			settings: {
				main: false,
				offset: 0,
				path: "b m 0.2 0.2 l 0.8 0.2 lw 0.1 s",
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
				button.y = button.main ? 0 : sy - bsize
			} else {
				button.x = button.main ? 0 : sx - bsize
				button.y = button.offset * bsize
			}
		}
	},

	buttonat: function (pos) {
		for (var bname in this.buttons) {
			var b = this.buttons[bname]
			if (b.x < pos[0] && pos[0] < b.x + b.w && b.y < pos[1] && pos[1] < b.y + b.h) {
				return bname
			}
		}
		return null
	},
	
	selectbutton: function (bname) {
		this.selectedbutton = this.selectedbutton == bname ? null : bname
	},
	
	start: function (pos) {
		this.buildstart = null
		var b = state.thingat(view.togame(pos[0], pos[1]))
		if (b) this.buildstart = b
	},
	
	end: function (pos) {
		var b = state.thingat(view.togame(pos[0], pos[1]))
		if (b && b !== this.buildstart) {
			state.joinworlds(this.buildstart, b)
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
		for (var bname in this.buttons) {
			var button = this.buttons[bname]
			UFX.draw(
				"[ t", button.x, button.y, "z", button.w, button.h,
				"b rr 0.05 0.05 0.9 0.9 0.15",
				"fs rgba(0,255,255," + (bname == this.selectedbutton ? 0.4 : 0.1) + ")",
				"ss rgba(0,255,255," + (bname == this.selectedbutton ? 0.8 : 0.4) + ")",
				"lw 0.04 f s",
				button.path,
				"]"
			)
		}
	},
}

