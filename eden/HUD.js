var HUD = {
	init: function () {
		this.target = null
		this.cursorpos = [-1000, -1000]
		this.selected = null
		
		this.buttons = {
			"zoom~in": [settings.sx - 100, 20, 80, 60],
			"zoom~out": [settings.sx - 100, 100, 80, 60],
			"give~up": [settings.sx - 100, 180, 80, 60],
		}
		for (var j = 0 ; j < settings.sins.length ; ++j) {
			var sin = settings.sins[j]
			this.buttons[sin] = [10, 80*j + 10, 60, 60]
		}
		this.elapsed = 0
	},
	think: function (dt, mpos) {
		if (mpos) {
			this.cursorpos = fpos(mpos)
			this.target = this.gettarget(this.cursorpos)
		}
		this.elapsed += dt
	},
	gettarget: function (pos) {
		var mx = pos[0], my = pos[1]
		var p = vista.wpos(pos)
		var wx = p[0], wy = p[1]
		for (var bname in this.buttons) {
			var button = this.buttons[bname]
			var dx = mx - button[0], dy = my - button[1]
			if (0 <= dx && dx < button[2] && 0 <= dy && dy < button[3]) {
				return bname
			}
		}
		for (var j = 0 ; j < blobs.length ; ++j) {
			var b = blobs[j]
			if (b.state.dead) continue
			var dx = b.x - wx, dy = b.y - b.h - wy
			if (dx * dx + dy * dy < settings.tradius * settings.tradius) {
				return b
			}
		}
		return null
	},
	handleclick: function (pos) {
		var target = pos ? this.gettarget(fpos(pos)) : this.target
		if (!target) return
		if (target == "give~up") {
			ActionScene.incomplete()
		} else if (target == "zoom~in") {
			vista.zoom(3, [settings.vx0, settings.vy0])
		} else if (target == "zoom~out") {
			vista.zoom(-3, [settings.vx0, settings.vy0])
		} else if (target in this.buttons) {
			this.selected = this.selected == target ? null : target
			playsound("click-0")
		} else {
			n = gamestate.sincounts[this.selected]
			if (n < 1) {
			} else {
				if (target.applysin(this.selected)) {
					gamestate.sincounts[this.selected] -= 1
					playsound("click-0")
				}
			}
		}
	},
	draw: function () {
		UFX.draw("[ t 0 0 fs gray ss brown lw 6 font 30px~'Jolly~Lodger' textbaseline middle textalign center")
		for (var bname in this.buttons) {
			UFX.draw("[")
			var button = this.buttons[bname]
			if (bname in gamestate.sincounts && !gamestate.sincounts[bname]) {
				UFX.draw("alpha 0.3 fs white ss gray")
			} else if (bname == "zoom~in" && !vista.canzoomin()) {
				UFX.draw("alpha 0.3 fs white ss gray")
			} else if (bname == "zoom~out" && !vista.canzoomout()) {
				UFX.draw("alpha 0.3 fs white ss gray")
			} else if (bname == this.selected) {
				UFX.draw("fs rgb(200,200,200) ss white")
			} else {
				UFX.draw("fs rgb(180,90,0) ss rgb(240,120,0)")
			}
			UFX.draw("rr", button, "9 f s")
			if (bname in gamestate.sincounts) {
				var n = gamestate.sincounts[bname]
				UFX.draw("[ t", button[0], button[1], "fs black ft", bname, "30 16 ft", ""+n, "30 43 ]")
			} else {
				UFX.draw("[ t", button[0], button[1], "fs black ft", bname, "40 30 ]")
			}
			UFX.draw("]")
		}
		UFX.draw("]")
		var s0 = "time~elapsed:~" + Math.floor(this.elapsed)
		var s1 = "creatures~remaining:~" + gamestate.nblobs()
		UFX.draw("[ t", settings.sx - 10, settings.sy - 40, "textalign right textbaseline bottom",
			"fs black shadowxy 1 1 shadowcolor white font 30px~'New~Rocker' ft0", s0,
			"t 0 30 ft0", s1, "]")
	},
	drawcursor: function () {
		UFX.draw("[ t", this.cursorpos, "ss orange lw 2")
		var r = settings.tradius
		if (this.target in this.buttons) {
			canvas.style.cursor = "default"
		} else if (this.target) {
			canvas.style.cursor = "none"
			UFX.draw("b o 0 0", r, "s")
		} else {
			canvas.style.cursor = "none"
			UFX.draw("b m 0", r, "l 0", -r, "m", r, "0 l", -r, "0 s")
		}
		UFX.draw("]")
	},
}

var MenuHUD = {
	init: function () {
		this.cursorpos = [-1000, -1000]
		canvas.style.cursor = "default"
		
		this.buttons = {
			0: [100, 200, 300, 60],
			1: [100, 280, 300, 60],
			2: [100, 360, 300, 60],
			3: [100, 440, 300, 60],
			4: [500, 280, 300, 60],
			5: [500, 360, 300, 60],
			6: [500, 440, 300, 60],
		}
	},
	think: function (dt, mpos) {
		if (mpos) {
			this.cursorpos = fpos(mpos)
		}
	},
	handleclick: function (pos) {
		if (pos) this.cursorpos = fpos(pos)
		var mx = this.cursorpos[0], my = this.cursorpos[1]
		for (var bname in this.buttons) {
			var button = this.buttons[bname]
			if (!gamestate.unlocked[bname]) continue
			var dx = mx - button[0], dy = my - button[1]
			if (0 <= dx && dx < button[2] && 0 <= dy && dy < button[3]) {
				gamestate.stage = parseInt(bname)
				playsound("click-0")
				return true
			}
		}
		return false
	},
	draw: function () {
		UFX.draw("[ t 0 0 font 40px~'Jolly~Lodger' textbaseline middle textalign center")
		var ncomplete = 0, besttime = 0
		for (var bname in this.buttons) {
			var button = this.buttons[bname]
			if (gamestate.unlocked[bname]) {
				var s = "Stage~" + (+bname+1)
				if (gamestate.besttime[bname]) {
					s += "~(best~time:~" + gamestate.besttime[bname] + ")"
					ncomplete += 1
					besttime += gamestate.besttime[bname]
				}
				UFX.draw("lw 4 fs rgb(100,0,0) ss rgb(200,0,0) rr", button, "6 f s")
				UFX.draw("[ t", button[0] + button[2]/2, button[1] + button[3]/2, "fs white shadowcolor black shadowxy 1 1 ft0", s, "]")
			} else {
				var s = "Locked"
				UFX.draw("[ alpha 0.3 lw 4 fs red ss lightred rr", button, "6 f s")
				UFX.draw("[ t", button[0] + button[2]/2, button[1] + button[3]/2, "fs white shadowcolor black shadowxy 1 1 ft0", s, "] ]")
			}
		}
		if (ncomplete == 7) {
			UFX.draw("fs lightgray font 28px~'Jolly~Lodger' textalign right textbaseline bottom",
				"ft best~time~total:~" + besttime, settings.sx - 10, settings.sy - 2)
		}
		UFX.draw("]")
	},
}


