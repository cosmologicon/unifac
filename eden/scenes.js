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
		function think(obj) { obj.think(dt) }
		blobs.forEach(think)
//		platforms.forEach(think)

		blobs.forEach(function (blob) {
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
	},
	draw: function () {
		UFX.draw("fs black f0 font 18px~Viga fs white ft", UFX.ticker.getfpsstr(), "700 10 [")
		vista.draw()
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		scenery.forEach(draw)
		platforms.forEach(draw)
		blobs.forEach(draw)
		UFX.draw("]")
		HUD.draw()
		HUD.drawcursor()
	},
}


