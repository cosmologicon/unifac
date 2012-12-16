var LoadScene = {
	init: function () {
		this.f = 0
	},
	draw: function () {
		var s = "Loading....~(" + Math.floor(this.f*100) + "%)"
		UFX.draw("fs darkblue f0 font 80px~Viga fs white ss black textalign center textbaseline middle",
			"[ t", settings.sx/2, settings.sy/2, "fst0", s, "]")
	},
}

var TitleScene = {
	thinkargs: function (dt) {
		var mstate = UFX.mouse.state()
		return [dt, mstate.left.down]
	},
	think: function (dt, clicked) {
		if (clicked) {
			UFX.scene.swap(ActionScene)
		}
	},
	draw: function () {
		var s = "Click~to~begin"
		UFX.draw("fs darkblue f0 font 80px~Viga fs white ss black textalign center textbaseline middle",
			"[ t", settings.sx/2, settings.sy/2, "fst0", s, "]")
	},
}

var ActionScene = {
	start: function () {
		gamestate.loadstage()
		vista.init()
		HUD.init()
		this.endtime = 0
	},
	thinkargs: function (dt) {
		var mstate = UFX.mouse.state()
		var kstate = UFX.key.state()
		return [dt, mstate, kstate]
	},
	think: function (dt, mstate, kstate) {
		dt = dt || 0
		
		var kpress = kstate.pressed
		var dx = (kpress.right ? 1 : 0) - (kpress.left ? 1 : 0)
		var dy = (kpress.down ? 1 : 0) - (kpress.up ? 1 : 0)
		if (dx || dy) vista.scootch(dx * dt, dy * dt)
		if (mstate.wheeldy) vista.zoom(mstate.wheeldy, mstate.pos)
		if (mstate.right.down) vista.pan(mstate.right.down)
		vista.think(dt)

		HUD.think(dt, mstate.pos)
		for (var j = 0 ; j < settings.sins.length ; ++j) {
			if (kpress[j+1]) {
				HUD.selected = settings.sins[j]
			}
		}
		
		function think(obj) { obj.think(dt) }
		blobs.forEach(think)
//		platforms.forEach(think)

		blobs.forEach(function (blob) {
			if (blob.state.dead) return
			scenery.forEach(function (obj) {
				if (obj.withinrange(blob)) {
					obj.interact(blob)
				}
			})
			if (blob.platform) return
			platforms.forEach(function (platform) {
				if (platform.catches(blob)) {
					if (platform.canhold(blob.x, blob.y)) {
						blob.land(platform)
					} else {
						blob.bounce(platform)
					}
				}
			})
		})
		if (mstate.left.down) HUD.handleclick()
		this.endtime = gamestate.complete() ? this.endtime + dt : 0
		if (this.endtime > 1) this.complete()
	},
	draw: function () {
		UFX.draw("fs lightblue f0 font 18px~Viga fs white ft", UFX.ticker.getfpsstr(), "700 10 [")
		vista.draw()
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		scenery.forEach(draw)
		platforms.forEach(draw)
		blobs.forEach(draw)
		UFX.draw("]")
		HUD.draw()
		HUD.drawcursor()
	},
	complete: function () {
		UFX.scene.swap(TitleScene)
	},
}


