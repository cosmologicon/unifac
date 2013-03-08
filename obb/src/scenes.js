// Current input state from keys, mouse, and touch
function istate() {
	return {
		key: UFX.key.active ? UFX.key.state() : undefined,
		mouse: UFX.mouse.active ? UFX.mouse.state() : undefined,
		touch: UFX.touch.active ? UFX.touch.state() : undefined,
	}
}

var debugHUD = {
	alerts: [],
	alert: function (text) {
		if (!settings.DEBUG) return
		this.alerts.push([text, Date.now()])
	},
	think: function (dt) {
		if (!settings.DEBUG) return
	},
	draw: function () {
		if (!settings.DEBUG) return
		// FPS counter
		UFX.draw("[ fs white ss gray font 40px~'Contrail~One'",
			"t 10 10 textalign left textbaseline top lw 1 fst0",
			UFX.ticker.getfpsstr(), "]")
		this.alerts.forEach(function (alert, j, alerts) {
			var h = canvas.height - 10 - 24 * (alerts.length - j - 1)
			var alpha = clip(4 - (Date.now() - alert[1]) / 500, 0, 1)
			UFX.draw("[ t 10", h, "textalign left textbaseline bottom lw 0.1",
				"alpha", alpha, "font 20px~'Contrail~One' fs white ss black")
			context.fillText(alert[0], 0, 0)
			context.strokeText(alert[0], 0, 0)
			UFX.draw("]")
		})
		this.alerts = this.alerts.filter(
			function (alert) { return Date.now() - alert[1] < 2000 }
		)
	},
}

// The play scene, where the main gameplay happens
UFX.scenes.play = {
	thinkargs: function (dt) {
		return [dt, istate()]
	},
	think: function (dt, input) {
		var kstate = input.key, mstate = input.mouse, tstate = input.touch
		debugHUD.think(dt)
	},
	draw: function () {
		UFX.draw("fs gray f0")
		debugHUD.draw()
	},
}

