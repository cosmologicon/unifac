var tau = 6.283185307179586
var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)
if (!DEBUG) {
	UFX.key.watchlist = "up down left right space tab".split(" ")
}
UFX.key.init()
UFX.key.remaparrows(true)
UFX.key.qdown = true

UFX.maximize.fill(canvas, "total")

UFX.scenes.title = {
	think: function () {
		if (loadf >= 1 && UFX.key.ispressed.space) {
			UFX.scene.swap("play")
		}
	},
	draw: function () {
		UFX.draw("fs #444 f0")
		UFX.draw("fs white ss black")
		var h = Math.floor(Math.min(canvas.width / 20, canvas.height / 10))
		UFX.draw("[ lw 2 textalign center t", canvas.width / 2, canvas.height / 2)
		UFX.draw("font", 2*h + "px~'Piedra' fst Ad~Astra 0", -2.4*h)
		UFX.draw("font", h + "px~'Piedra' fst by~Christopher~Night 0 0")
		UFX.draw("font", h + "px~'Piedra' fst Universe~Factory~Games 0", 1.2*h)
		if (loadf >= 1) {
			UFX.draw("font", 1.4*h + "px~'Piedra' fst press~Space~to~" + (localStorage.LD29save ? "continue" : "begin"), 0, 4*h)
		} else {
			UFX.draw("font", 1.4*h + "px~'Piedra' fst Loading:~" + Math.round(100*loadf) + "%", 0, 4*h)
		}
		UFX.draw("]")
	},
}

UFX.scenes.death = {
	start: function () {
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
		if (this.t > 2) UFX.scene.swap("title")
	},
	draw: function () {
		if (this.t < 1) {
			UFX.scenes.play.draw()
		} else {
			UFX.scenes.title.draw()
		}
		var alpha = Math.min(Math.max(1 - Math.abs(this.t - 1), 0), 1)
		UFX.draw("[ fs red alpha", alpha, "f0 ]")
	},
}

UFX.scenes.reset = {
	start: function () {
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
		if (this.t > 2) UFX.scene.swap("title")
	},
	draw: function () {
		if (this.t < 1) {
			UFX.scenes.play.draw()
		} else {
			UFX.scenes.title.draw()
		}
		var alpha = Math.min(Math.max(1 - Math.abs(this.t - 1), 0), 1)
		UFX.draw("[ fs white alpha", alpha, "f0 ]")
	},
}

var loadf = 0
UFX.scene.init({ ups: 60, maxupf: 6 })
UFX.scene.push("title")

UFX.resource.onloading = function (f) {
	loadf = f
}
UFX.resource.onload = function () {
	loadf = 1
	UFX.resource.mergesounds("jump")
}


function playsound(sname) {
	try {
		UFX.resource.sounds[sname].play()
	} catch (e) {
	}
}

var musicplaying = null, musicvolume = settings.musicvolume
function playmusic(mname) {
	try {
		var m = UFX.resource.sounds[mname]
		if (m === musicplaying) return
		if (musicplaying) musicplaying.pause()
		m.volume = musicvolume
		m.currentTime = 0
		m.play()
		m.loop = true
		musicplaying = m
	} catch (e) {
	}
}

UFX.resource.loadwebfonts("Viga", "Pirata One", "Sansita One", "Piedra")
UFX.resource.load({
	gamedata: "gamedata.json",
	jump0: "sfx/jump0.ogg",
	jump1: "sfx/jump1.ogg",
	jump2: "sfx/jump2.ogg",
	jump3: "sfx/jump3.ogg",
	hurt: "sfx/hurt.ogg",
	powerup: "sfx/powerup.ogg",
	pickup: "sfx/pickup.ogg",
	explosion: "sfx/explosion.ogg",
	warp: "sfx/warp.ogg",
	defeat: "sfx/defeat.ogg",
	song1: "sfx/cheese.ogg",
	song2: "sfx/hands.ogg",
	song3: "sfx/tired.ogg",
})

