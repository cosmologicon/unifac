UFX.scenes.main = {
	start: function () {
		var level = levels.northwest
		
		this.piece = new Piece(level.ppath)
		this.athing = this.piece
		this.piece.active = true
		things.push(this.piece)
		level.targetps.forEach(function (p) {
			things.push(new Target(p[0], p[1]))
		})
		level.bitks.forEach(function (kspec) {
			var thing0 = things[kspec[0]], thing1 = things[kspec[1]]
			things.push(new Bit(
				0.5 * (thing0.x + thing1.x),
				0.5 * (thing0.y + thing1.y)
			))
		})
		things.forEach(function (thing) {
			thing.trans = new Deploy(thing)
		})
		things.reverse()
	},
	thinkargs: function (dt) {
		var clicked = false
		UFX.mouse.events().forEach(function (event) {
			clicked = clicked || event.type == "up"
		})
		return [dt, camera.screentoworld(UFX.mouse.pos), clicked]
	},
	think: function (dt, mpos, clicked) {
		this.dirty = true
		var halted = false
		things.forEach(function (thing) {
			halted = halted || thing.halts()
		})
		if (!halted && clicked) {
			var mx = mpos[0], my = mpos[1]
			var atarget = null
			things.forEach(function (thing) {
				if (thing.active) return
				if (thing.hits(mx, my)) {
					atarget = thing
				}
			})
			if (atarget) {
				if (this.athing) {
					this.athing.active = false
					this.collect(this.athing, atarget)
					if (this.athing.disposible) {
						this.athing.done = true
					}
					things.push(new Ghost(this.athing, atarget))
				}
				this.athing = atarget
				this.athing.active = true
			}
		}
		things.forEach(function (thing) {
			thing.think(dt)
		})
		things = things.filter(function (thing) { return !thing.done })
		camera.think(dt)
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
			}
		})
	},
	draw: function () {
		if (!this.dirty) return
		UFX.draw("[ fs black f0 fs white ss white")
		camera.draw()
		things.forEach(function (thing) {
			context.save()
			thing.draw()
			context.restore()
		})
		UFX.draw("]")
		
		if (settings.DEBUG) {
			var text = canvas.width + "x" + canvas.height + "  " + UFX.ticker.getrates()
			UFX.draw(
				"textbaseline top font 36px~monospace fs white ss black lw 1",
				"fst", text.replace(/ /g, "~"), "12 12"
			)
		}
	},
}

