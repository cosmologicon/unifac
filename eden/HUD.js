var HUD = {
	init: function () {
		this.target = null
		this.cursorpos = [-1000, -1000]
	},
	think: function (dt, mpos, click) {
		if (mpos) {
			this.cursorpos = mpos
		}
		var mx = this.cursorpos[0], my = this.cursorpos[1]
		this.target = null
		for (var j = 0 ; j < blobs.length ; ++j) {
			var b = blobs[j]
			var dx = b.x - mx, dy = b.y - b.h - my
			if (dx * dx + dy * dy < settings.tradius * settings.tradius) {
				this.target = b
				break
			}
		}
	},
	drawcursor: function () {
		UFX.draw("[ t", this.cursorpos, "ss orange lw 2")
		var r = settings.tradius
		if (this.target) {
			UFX.draw("b o 0 0", r, "s")
		} else {
			UFX.draw("b m 0", r, "l 0", -r, "m", r, "0 l", -r, "0 s")
		}
		UFX.draw("]")
	},

}


