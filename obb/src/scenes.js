// Current input state from keys, mouse, and touch
function istate() {
	return {
		key: UFX.key.active ? UFX.key.state() : undefined,
		mouse: UFX.mouse.active ? UFX.mouse.state() : undefined,
		touch: UFX.touch.active ? UFX.touch.state() : undefined,
	}
}

// A pseudo-scene, this goes "on top" of the currently active scene.
// This is for messages that I would normally just send to console.log, but I want to be able to
// see them on mobile as well.
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
		text.setup()
		var h = Math.max(0.06 * canvas.height, 12)
		// FPS counter
		var fpsstr = UFX.ticker.getrates().split(" ")[0]
		text.draw(fpsstr, 0.2*h, 0.3*h, { fontsize: h })
		this.alerts.forEach(function (alert, j, alerts) {
			var y = canvas.height - 10 - 24 * (alerts.length - j - 1)
			var alpha = clamp(4 - (Date.now() - alert[1]) / 500, 0, 1)
			text.draw(alert[0], 0.2*h, (0.3 + 1.2 * (alerts.length - j)) * h, {
				fontsize: h,
				alpha: alpha,
			})
		})
		this.alerts = this.alerts.filter(
			function (alert) { return Date.now() - alert[1] < 2000 }
		)
	},
}

// The play scene, where the main gameplay happens
UFX.scenes.play = {
	startargs: function () {
		return []
	},
	start: function () {
		panels = []
		panels.push(playpanel)
		controlstate.reset()
	},

	thinkargs: function (dt) {
		return [dt, istate()]
	},
	think: function (dt, input) {
		debugHUD.think(dt)
		var cevents = controlstate.think(dt, input)
		cevents.forEach(function (cevent) {
			var fname = "handle" + cevent.type
			if (cevent.panel && cevent.panel[fname]) {
				cevent.panel[fname](cevent)
			}
			if (cevents.tpanel && cevents.tpanel !== cevents.panel) {
				fname = "handlet" + cevent.type
				if (cevent.tpanel[fname]) {
					cevent.tpanel[fname](cevent)
				}
			}
		})

		state.think(dt)
	},
	draw: function () {
		graphics.clear()
		
		playpanel.draw()
		
		debugHUD.draw()
	},
}

