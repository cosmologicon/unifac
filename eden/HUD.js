var HUD = {
	init: function () {
		this.target = null
		this.cursorpos = [-1000, -1000]
		this.selected = null
		
		this.buttons = {
			reload: [10, settings.sy - 100, 80, 80],
		}
		for (var j = 0 ; j < settings.sins.length ; ++j) {
			var sin = settings.sins[j]
			this.buttons[sin] = [10, 100*j + 10, 80, 80]
		}
	},
	think: function (dt, mpos) {
		if (mpos) {
			this.cursorpos = mpos
		}
		var mx = this.cursorpos[0], my = this.cursorpos[1]
		var p = vista.wpos(this.cursorpos)
		var wx = p[0], wy = p[1]
		this.target = null
		for (var j = 0 ; j < blobs.length ; ++j) {
			var b = blobs[j]
			if (b.state.dead) continue
			var dx = b.x - wx, dy = b.y - b.h - wy
			if (dx * dx + dy * dy < settings.tradius * settings.tradius) {
				this.target = b
				break
			}
		}
		for (var bname in this.buttons) {
			var button = this.buttons[bname]
			var dx = mx - button[0], dy = my - button[1]
			if (0 <= dx && dx < button[2] && 0 <= dy && dy < button[3]) {
				this.target = bname
				break
			}
		}
	},
	handleclick: function () {
		if (!this.target) return
		if (this.target == "reload") {
		} else if (this.target in this.buttons) {
			this.selected = this.selected == this.target ? null : this.target
		} else {
			n = gamestate.sincounts[this.selected]
			if (n < 1) {
			} else {
				if (this.target.applysin(this.selected)) {
					gamestate.sincounts[this.selected] -= 1
				}
			}
		}
	},
	draw: function () {
		UFX.draw("[ t 0 0 fs gray ss brown lw 4 font 30px~Viga textbaseline middle textalign center")
		for (var bname in this.buttons) {
			var button = this.buttons[bname]
			if (bname == this.selected) {
				UFX.draw("fs white ss lightbrown")
			} else {
				UFX.draw("fs gray ss brown")
			}
			UFX.draw("fr", button, "sr", button)
			if (bname in gamestate.sincounts) {
				n = gamestate.sincounts[bname]
				UFX.draw("[ t", button[0], button[1], "fs black ft", bname, "40 30 ft", ""+n, "40 70 ]")
			}
		}
		UFX.draw("]")
	},
	drawcursor: function () {
		UFX.draw("[ t", this.cursorpos, "ss orange lw 2")
		var r = settings.tradius
		if (this.target in this.buttons) {
			
		} else if (this.target) {
			UFX.draw("b o 0 0", r, "s")
		} else {
			UFX.draw("b m 0", r, "l 0", -r, "m", r, "0 l", -r, "0 s")
		}
		UFX.draw("]")
	},

}


