UFX.scenes.select = {
	start: function (lastlevel, victory) {
		var levelnames = getlevels()
		things = []
		var selected = null
		levelnames.forEach(function (levelname) {
			var level = levels[levelname]
			var piece = new Piece(levelname, level.ppath, level.px, level.py, level.pr)
			if (!victory && levelname == lastlevel) {
				piece.trans = new Deploy(piece)
				selected = piece
			} else {
				things.push(piece)
			}
		})
		if (!selected && lastlevel) {
			selected = new Piece(lastlevel, levels[lastlevel].ppath, 0, 0, levels[lastlevel].pr)
			selected.trans = new GrowFadeHalt(selected)
		}
		if (selected) things.push(selected)
		this.selected = selected
		this.done = false
	},
	thinkargs: function (dt) {
		var clicked = false, pos = [-1000, -1000]
		if (UFX.mouse.active) {
			UFX.mouse.events().forEach(function (event) {
				clicked = clicked || event.type == "down"
			})
			pos = UFX.mouse.pos
		} else if (UFX.touch.active) {
			UFX.touch.events().forEach(function (event) {
				clicked = clicked || event.type == "start"
				pos = event.pos
			})
		}
		return [dt, camera.screentoworld(pos), clicked]
	},
	think: function (dt, mpos, clicked) {
		if (this.selected && !this.done) {
			if (!this.selected.trans) {
				this.selected = null
			}
		}
		var halted = this.selected && this.selected.trans
		things.forEach(function (thing) {
			halted = halted || thing.halts()
		})
		if (!halted && clicked) {
			var mx = mpos[0], my = mpos[1]
			var chosen = null
			things.forEach(function (thing) {
				if (thing.hits(mx, my)) {
					chosen = thing
				}
			})
			if (chosen) {
				play("note-34")
				this.done = true
				this.selected = chosen
				chosen.trans = new Undeploy(chosen)
				things.splice(things.indexOf(chosen), 1)
				things.push(chosen)
			}
		}
		things.forEach(function (thing) {
			thing.think(dt)
		})
		things = things.filter(function (thing) { return !thing.done })
		if (this.selected && this.done) {
			if (!this.selected.trans) {
				UFX.scene.swap("main", this.selected.name)
			}
		}

		this.f = 1
		if (this.selected) {
			//this.f = this.selected.trans ? this.selected.trans.t / this.selected.trans.T : 1
			this.f = this.selected.trans ? this.selected.trans.f : 1
			if (this.done) this.f = 1 - this.f
			this.f = clip(this.f, 0, 1)
		}
		camera.think(dt, 1 + this.f)

	},
	draw: function () {

		var c = clip(Math.floor(255 * this.f), 0, 255)
		var bcolor = "rgb(" + c + "," + c + "," + c + ")"

		UFX.draw("[ fs", bcolor, "f0 fs black ss black")
		camera.draw()
		var selected = this.selected, f = this.f
		things.forEach(function (thing) {
			context.save()
			thing.draw(true, thing === selected, f)
			context.restore()
		})
		UFX.draw("]")
		
		drawdebuginfo()
	},
}

UFX.scenes.main = {
	start: function (levelname) {
		this.levelname = levelname
		var level = levels[levelname]
		things = []

		this.piece = new Piece(levelname, level.ppath, 0, 0, level.pr)
		this.athing = this.piece
		this.piece.active = true
		things.push(this.piece)
		level.targetps.forEach(function (p) {
			things.push(new Target(p[0], p[1]))
		})
		if (level.sisterps) {
			level.sisterps.forEach(function (p) {
				var s0 = new Sister(p[0], p[1])
				var s1 = new Sister(p[2], p[3], s0)
				s0.sister = s1
				things.push(s0)
				things.push(s1)
			})
		}
		if (level.daggerps) {
			level.daggerps.forEach(function (p) {
				things.push(new Dagger(p[0], p[1]))
			})
		}
		level.bitks.forEach(function (kspec) {
			var thing0 = things[kspec[0]], thing1 = things[kspec[1]], f = kspec[2] || 0.5
			things.push(new Bit(
				(1-f) * thing0.x + f * thing1.x,
				(1-f) * thing0.y + f * thing1.y
			))
		})
		level.bitxs.forEach(function (xspec) {
			// http://en.wikipedia.org/wiki/Line-line_intersection
			var x = xspec.map(function (k) { return things[k].x })
			var y = xspec.map(function (k) { return things[k].y })
			var D = (x[0] - x[1]) * (y[2] - y[3]) - (y[0] - y[1]) * (x[2] - x[3])
			var px = (x[0]*y[1]-y[0]*x[1])*(x[2]-x[3]) - (x[0]-x[1])*(x[2]*y[3]-y[2]*x[3])
			var py = (x[0]*y[1]-y[0]*x[1])*(y[2]-y[3]) - (y[0]-y[1])*(x[2]*y[3]-y[2]*x[3])
			things.push(new Bit(px/D, py/D))
		})
		things.forEach(function (thing) {
			thing.trans = new Deploy(thing)
		})
		things.reverse()
		this.clickedhome = false
		this.scored = false
		this.homet = 0.3
	},
	thinkargs: function (dt) {
		var clicked = false, pos = [-1000, -1000]
		if (UFX.mouse.active) {
			UFX.mouse.events().forEach(function (event) {
				clicked = clicked || event.type == "down"
			})
			pos = UFX.mouse.pos
		} else if (UFX.touch.active) {
			UFX.touch.events().forEach(function (event) {
				clicked = clicked || event.type == "start"
				pos = event.pos
			})
		}
		return [dt, camera.screentoworld(pos), clicked]
	},
	think: function (dt, mpos, clicked) {
		this.dirty = true
		var halted = false
		things.forEach(function (thing) {
			halted = halted || thing.halts()
		})
		var atarget = null
		this.ptarget = null
		if (!halted && !this.clickedhome) {
			var mx = mpos[0], my = mpos[1]
			things.forEach(function (thing) {
				if (thing.hits(mx, my)) {
					atarget = thing
				}
			})
			if (!clicked && atarget && !atarget.active) {
				this.ptarget = atarget
			}
			if (clicked && atarget && !atarget.active) {
				if (atarget instanceof Dagger) {
					if (this.athing && !(this.athing instanceof Piece)) {
						this.collect(this.athing, atarget)
						atarget.done = true
						things.unshift(new Ghost(atarget, this.athing))
						play("note-3")
					}
				} else {
					if (this.athing) {
						this.athing.active = false
						this.collect(this.athing, atarget)
						if (this.athing.disposible) {
							this.athing.done = true
						}
						things.unshift(new Ghost(this.athing, atarget))
						play("note-3")
					}
					this.athing = atarget
					this.athing.active = true
				}
			}
		}
		things.forEach(function (thing) {
			thing.think(dt)
		})
		things = things.filter(function (thing) { return !thing.done })
		camera.think(dt)

		if (this.clickedhome) {
			this.homet -= dt
			if (this.homet <= 0) {
				if (!this.scored) {
					this.score()
				}
				if (things.length == 1) {
					if (this.superfluous) {
						UFX.scene.swap("select", this.levelname)
						play("note-543")
					} else {
						beaten[this.levelname] = true
						UFX.scene.swap("select", this.levelname, true)
						play(this.levelname == "0" ? "fin" : "note-346")
					}
				}
			}
		}
		if (clicked && atarget === this.piece) {
			this.clickedhome = true
			this.piece.active = false
		}

		if (settings.DEBUG) this.dirty = true
	},
	collect: function (thing0, thing1) {
		var px = thing1.x - thing0.x, py = thing1.y - thing0.y, p2 = px * px + py * py
		things.forEach(function (thing) {
			if (!thing.collectible) return
			var dx = thing.x - thing0.x, dy = thing.y - thing0.y //, d = Math.sqrt(dx * dx + dy * dy)
			var dot = dx * px + dy * py
			var a = clip(dot / p2, 0, 1)
			var ax = thing.x - (thing0.x + a * px)
			var ay = thing.y - (thing0.y + a * py)
			if (ax * ax + ay * ay <= settings.Dmin * settings.Dmin) {
				thing.trans = new GrowFade()
				play("note-68")
			}
		})
	},
	score: function () {
		var athings = things.filter(function (thing) {
			return !thing.done && !(thing.trans && thing.trans.kills)
		})
		if (athings.length > 1) {
			this.superfluous = true
			var piece = this.piece
			athings.forEach(function (thing) {
				if (thing !== piece && !thing.trans) {
					thing.trans = new Undeploy(thing)
				}
			})
		} else {
			this.superfluous = false
		}
		this.scored = true
	},
	draw: function () {
		if (!this.dirty) return
		UFX.draw("[ fs black f0 fs white ss white")
		camera.draw()
		if (this.ptarget && this.athing) {
			UFX.draw("lw 0.05 m", this.athing.x, this.athing.y, "l", this.ptarget.x, this.ptarget.y, "s")
		}
		things.forEach(function (thing) {
			context.save()
			thing.draw()
			context.restore()
		})
		UFX.draw("]")
		
		drawdebuginfo()
	},
}

function drawdebuginfo() {
	if (!settings.DEBUG) return
	var text = canvas.width + "x" + canvas.height + "  " + UFX.ticker.getrates()
	UFX.draw(
		"textbaseline top font 36px~monospace fs white ss black lw 1",
		"fst", text.replace(/ /g, "~"), "12 12"
	)
}



