UFX.scenes.main = {
	start: function () {
		things.push(new Piece())
		things.push(new Target(3, 3))
		this.athing = null
		things[1].trans = new Deploy()
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

