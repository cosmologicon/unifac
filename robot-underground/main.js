
if (DEBUG.failhard) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}

UFX.scenes.load = {
	start: function () {
		this.canvas = document.getElementById("loadcanvas")
		this.canvas.style.display = "block"
		this.canvas.width = settings.scr_w ; this.canvas.height = settings.scr_h
		if (!DEBUG.fixcanvas) {
			UFX.maximize.fill(this.canvas, "aspect")
		}
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
		"shot1 shot2 shot3 bullet4 radio railgun1".split(" ").forEach(function (s) {
			UFX.resource.sounds[s] = UFX.resource.Multisound(UFX.resource.sounds[s], 6)
		})
		UFX.resource.mergesounds("shot", "destroy", "pickup", "bullet", "lightning", "railgun")
		UFX.resource.sounds.level_up = UFX.resource.sounds.fanfare
		UFX.resource.sounds.shotgun = UFX.resource.sounds["44magnum"]
		UFX.resource.sounds.rifle = UFX.resource.sounds.gunshot1
		graphics.clear()
		UFX.mouse.capture.right = true
		UFX.mouse.capture.wheel = true
		UFX.mouse.init(canvas)
		UFX.key.watchlist = "up down left right enter space tab esc ctrl shift 1 2 3 4 5 6 7 8 9".split(" ")
		UFX.key.init()

		if (DEBUG.expose) {
			mode = UFX.scenes.missionmode
			zoomout = function () {	mode.desired_zoom /= 4 }
			zoomin = function () { mode.desired_zoom *= 4 }
		}
		this.loaded = true
		this.canvas.style.cursor = "pointer"
		this.canvas.onclick = function () {
			if (!DEBUG.fixcanvas) UFX.maximize.fill(canvas, "aspect")
			if (DEBUG.levelskip) {
				initPlotState(plotstate)
				robotstate.init(null)
				plotstate.nextScene = DEBUG.levelskip
				if (DEBUG.levelskip.indexOf("act") == 0) {
					plotstate.act = +DEBUG.levelskip[3]
				}
				UFX.scene.swap("missionmode")
			} else {
				UFX.scene.swap("mainmenu");
			}
		}
	},
	draw: function () {
		var s = this.loaded ? "Click~to~begin" : "Loading~(" + (this.progress * 100).toFixed(0) + "%)..."
		UFX.draw(this.context,
			"fs black f0",
			"textalign center [ t", this.canvas.width/2, this.canvas.height/2,
			"z", this.canvas.height/100, this.canvas.height/100,
			"t 0 -12 font 10px~Hockey",
			"fs yellow ft0 Robot~Underground",
			"t 0 12 ft0", s,
			"t 0 12 ft0 F11:~fullscreen",
			"]"
		)
	},
}
document.title = settings.gamename
UFX.scene.init({fps: 30})
UFX.scene.push("load")
UFX.resource.onloading = UFX.scenes.load.onloading.bind(UFX.scenes.load)
UFX.resource.onload = UFX.scenes.load.onload.bind(UFX.scenes.load)

UFX.maximize.onadjust = function (canvas, sx, sy) {
	settings.scr_w = sx
	settings.scr_h = sy
	if (gl) gl.viewport(0, 0, sx, sy)
	var s = UFX.scene.top()
	if (s && s.onadjust) s.onadjust()
}
UFX.maximize.fillcolor = "#222"

// christopher@palimpsest:~/Downloads/robot-underground-1.0.4$ grep "\.wav" lib/sound.py | sed 's|.*\ "||;s|\..*||' | xargs -n 1 -I xxx oggenc data/sfx/xxx.wav -o ~/projects/unifac/robot-underground/data/sfx/xxx.ogg
// radio.wav is weird - had to convert it with audacity
var soundnames = (
	"shot1 shot2 shot3 destroy1 destroy2 destroy3 destroy4 pickup1 fanfare bullet4 radio click roar " +
	"lightning1 lightning2 lightning3 explosion eject railgun1 44magnum click plasma fireball " +
	"gunshot1"
).split(" ")
var songnames = "Chase ElectroSketch HowItBegins Klockworx LongTimeComing RadioMartini".split(" ")
//var songnames = "ElectroSketch HowItBegins RadioMartini".split(" ")

var res = {
	mapdata: "data/mapdata.json",
	gdata: "data/gdata.json",
}
songnames.forEach(function (sname) { res[sname] = "data/music/" + sname + ".ogg" })
soundnames.forEach(function (sname) { res[sname] = "data/sfx/" + sname + ".ogg" })
UFX.resource.load(res)


function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

function clone(obj) { return JSON.parse(JSON.stringify(obj)) }

function splitcap(s) { return s.replace(/([A-Z])/g, ' $1').substr(1) }

// From helpers.py
function d2between(first, second) {
	var dx = first[0] - second[0], dy = first[1] - second[1]
	return dx * dx + dy * dy
}
function distanceBetween(first, second) {
	return Math.sqrt(d2between(first, second))
}

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
	m.loop = true
	m.play()
	musicplaying = m
}




