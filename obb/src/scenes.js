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
	timers: {},
	alerttime: 6000,
	alert: function (text) {
		if (!settings.DEBUG) return
		this.alerts.push([text, Date.now()])
	},
	think: function (dt) {
		if (!settings.DEBUG) return
		this.alerts = this.alerts.filter(
			function (alert) { return Date.now() - alert[1] < debugHUD.alerttime }
		)
	},
	draw: function () {
		if (!settings.DEBUG) return
		text.setup()
		var h = Math.max(0.03 * canvas.height, 12)
		// FPS counter
		var fpsstr = UFX.ticker.getrates().split(" ")[0]
		text.draw(fpsstr, 0.2*h, 0.3*h, { fontsize: h })
		var alerts = this.alerts.slice()
		for (var tname in this.timers) {
			var timer = this.timers[tname]
			if (!timer.length) continue
			var avg = timer.reduce(function (a, b) { return a + b }) / timer.length
			alerts.push([
				tname + ": " + avg.toPrecision(3) + "ms",
				Date.now(),
			])
		}
		alerts.forEach(function (alert, j, alerts) {
			var y = canvas.height - 10 - 24 * (alerts.length - j - 1)
			var alpha = clamp((debugHUD.alerttime - (Date.now() - alert[1])) / 500, 0, 1)
			text.draw(alert[0], 0.2*h, (0.3 + 1.2 * (alerts.length - j)) * h, {
				fontsize: h,
				alpha: alpha,
			})
		})
	},
	starttimer: function (tname) {
		if (!settings.DEBUG) return
		if (!this.timers[tname]) this.timers[tname] = []
		this.timers[tname].t0 = Date.now()
	},
	stoptimer: function (tname) {
		if (!settings.DEBUG) return
		var timer = this.timers[tname]
		timer.push(Date.now() - timer.t0)
		if (timer.length > 20) timer.shift()
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
		this.fsquirm = 0
		this.squirming = true
	},

	thinkargs: function (dt) {
		return [dt, istate()]
	},
	think: function (dt, input) {
		debugHUD.think(dt)
		debugHUD.starttimer("control")
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
		debugHUD.stoptimer("control")

		state.think(dt)
		this.fsquirm = clamp(this.fsquirm + 0.5 * dt * (this.squirming ? 1 : -1), 0, 1)
	},
	draw: function () {
		graphics.clear()
		
		debugHUD.starttimer("paneldraw")
		playpanel.draw()
		stalkpanel.draw()
		debugHUD.stoptimer("paneldraw")
		
		debugHUD.starttimer("huddraw")
		debugHUD.draw()
		debugHUD.stoptimer("huddraw")
		
		graphics.onealpha()

	},
}

