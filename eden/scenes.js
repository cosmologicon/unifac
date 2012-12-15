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
	thinkargs: function (dt) {
		var clicks = UFX.mouse.getclicks()
		return [dt, fpos(clicks.down)]
	},
	think: function (dt, clicked) {
		if (clicked) {
			UFX.draw("[ t", clicked, "b o 0 0 2 fs orange f ]")
		}
	},
}


