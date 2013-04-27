UFX.scenes.main = {
	thinkargs: function (dt) {
		var clicked = false
		UFX.mouse.events().forEach(function (event) {
			clicked = clicked || event.type == "up"
		})
		return [dt, UFX.mouse.pos, clicked]
	},
	think: function (dt, mpos, clicked) {
		this.dirty = false
	},
	draw: function () {
		if (!this.dirty) return
		UFX.draw("fs black f0")

		if (settings.DEBUG) {
			var text = canvas.width + "x" + canvas.height + "  " + UFX.ticker.getrates()
			UFX.draw(
				"textbaseline top font 36px~monospace fs white ss black lw 1",
				"fst", text.replace(/ /g, "~"), "12 12"
			)
		}
	},
}

