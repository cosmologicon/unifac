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
		var clicks = UFX.mouse.getclicks()
		return [dt, clicks.down]
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
		HUD.init()
	},
	thinkargs: function (dt) {
		var clicks = UFX.mouse.getclicks()
		return [dt, fpos(UFX.mouse.pos), fpos(clicks.down)]
	},
	think: function (dt, mpos, clicked) {
		HUD.think(dt, mpos, clicked)
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
					if (platform.canhold()) {
						blob.land(platform)
					} else {
						blob.bounce(platform)
					}
				}
			})
		})
		if (clicked) HUD.handleclick()
	},
	draw: function () {
		UFX.draw("fs black f0 font 18px~Viga fs white ft", UFX.ticker.getfpsstr(), "700 10")
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		blobs.forEach(draw)
		scenery.forEach(draw)
		platforms.forEach(draw)
		HUD.draw()
		HUD.drawcursor()
	},
}


