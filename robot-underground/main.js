
UFX.scenes.load = {
	start: function () {
		this.canvas = document.getElementById("loadcanvas")
		this.canvas.width = settings.scr_w ; this.canvas.height = settings.scr_h
		this.context = loadcanvas.getContext("2d")
		this.progress = 0
		this.loaded = false
	},
	stop: function () {
		this.canvas.style.display = "none"
		canvas.style.display = "block"
	},
	onloading: function (f) {
		this.progress = f
	},
	onload: function () {
		gdata = UFX.resource.data.gdata
		mapdata = UFX.resource.data.mapdata
		graphics.init()
		"shot1 shot2 shot3".split(" ").forEach(function (s) {
			UFX.resource.sounds[s] = UFX.resource.Multisound(UFX.resource.sounds[s], 10)
		})
		UFX.resource.mergesounds("shot", "destroy", "pickup", "bullet", "lightning", "railgun")
		graphics.clear()
		UFX.mouse.capture.right = true
		UFX.mouse.capture.wheel = true
		UFX.mouse.init(canvas)
		UFX.key.watchlist = "up down left right enter space tab esc".split(" ")
		UFX.key.init()

		if (DEBUG.expose) {
			mode = UFX.scenes.missionmode
			zoomout = function () {	mode.desired_zoom /= 4 }
			zoomin = function () { mode.desired_zoom *= 4 }
		}
		this.loaded = true
		this.canvas.style.cursor = "pointer"
		this.canvas.onclick = UFX.scene.swap.bind(UFX.scene, "mainmenu")
	},
	draw: function () {
		var s = this.loaded ? "Click~to~begin" : "Loading~(" + (this.progress * 100).toFixed(0) + "%)..."
		UFX.draw(this.context,
			"fs black f0",
			"font 48px~Hockey textalign center [ t", this.canvas.width/2, this.canvas.height/2 - 40,
			"fs yellow ft0 Robot~Underground",
			"t 0 60 ft0", s,
			"]"
		)
	},
}
UFX.scene.init({fps: 30})
UFX.scene.push("load")
UFX.resource.onloading = UFX.scenes.load.onloading.bind(UFX.scenes.load)
UFX.resource.onload = UFX.scenes.load.onload.bind(UFX.scenes.load)

// christopher@palimpsest:~/Downloads/robot-underground-1.0.4$ grep "\.wav" lib/sound.py | sed 's|.*\ "||;s|\..*||' | xargs -n 1 -I xxx oggenc data/sfx/xxx.wav -o ~/projects/unifac/robot-underground/data/sfx/xxx.ogg
// radio.wav is weird - had to convert it with audacity
var soundnames = (
	"shot1 shot2 shot3 destroy1 destroy2 destroy3 destroy4 pickup1 fanfare bullet4 radio click roar " +
	"lightning1 lightning2 lightning3 explosion eject railgun1 44magnum click plasma fireball gunshot1"
).split(" ")
var songnames = "Chase ElectroSketch HowItBegins Klockworx LongTimeComing RadioMartini".split(" ")
//var songnames = "ElectroSketch HowItBegins".split(" ")

var res = {
	mapdata: "data/mapdata.json",
	gdata: "data/gdata.json",
}
songnames.forEach(function (sname) { res[sname] = "data/music/" + sname + ".ogg" })
soundnames.forEach(function (sname) { res[sname] = "data/sfx/" + sname + ".ogg" })
UFX.resource.load(res)


function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

function splitcap(s) { return s.replace(/([A-Z])/g, ' $1').substr(1) }

var musicplaying = null
var musicvolume = 1, sfxvolume = 1
function setsfx(on) {
	settings.sfx = on
}
function setmusic(on) {
	settings.music = on
	if (musicplaying) musicplaying.volume = settings.music ? musicvolume : 0
}

function playsound(name) {
	if (!UFX.resource.sounds[name]) {
		console.log("missing sound: " + name)
		return
	}
	if (!settings.sfx) return
	UFX.resource.sounds[name].volume = sfxvolume
	UFX.resource.sounds[name].play()
}

function stopmusic() {
	if (musicplaying) musicplaying.pause()
	musicplaying = null
}
function playmusic(songname) {
	if (!UFX.resource.sounds[songname]) {
		console.log("missing song: " + name)
		return
	}
	var m = UFX.resource.sounds[songname]
	if (m === musicplaying) return
	if (musicplaying) musicplaying.pause()
	// TODO: actually don't play the music if it's not on?
	m.volume = settings.music ? musicvolume : 0
	m.currentTime = 0
	m.play()
	m.loop = true
	musicplaying = m
}


