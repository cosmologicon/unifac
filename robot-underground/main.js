
UFX.resource.onload = function () {
	initPlotState(plotstate)
	robotstate.init(null)
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
	UFX.scene.init({fps: 30})
//	UFX.scene.push("missionmode")
	UFX.scene.push("mainmenu")

	if (DEBUG.expose) {
		mode = UFX.scenes.missionmode
		zoomout = function () {	mode.desired_zoom /= 4 }
		zoomin = function () { mode.desired_zoom *= 4 }
	}

}


// christopher@palimpsest:~/Downloads/robot-underground-1.0.4$ grep "\.wav" lib/sound.py | sed 's|.*\ "||;s|\..*||' | xargs -n 1 -I xxx oggenc data/sfx/xxx.wav -o ~/projects/unifac/robot-underground/data/sfx/xxx.ogg
// radio.wav is weird - had to convert it with audacity
var soundnames = (
	"shot1 shot2 shot3 destroy1 destroy2 destroy3 destroy4 pickup1 fanfare bullet4 radio click roar " +
	"lightning1 lightning2 lightning3 explosion eject railgun1 44magnum click plasma fireball gunshot1"
).split(" ")
var songnames = "Chase ElectroSketch HowItBegins Klockworx LongTimeComing RadioMartini".split(" ")
//var songnames = "ElectroSketch HowItBegins".split(" ")

var mapnames = "3rooms controlroom dollis".split(" ")



var res = {}
songnames.forEach(function (sname) { res[sname] = "data/music/" + sname + ".ogg" })
soundnames.forEach(function (sname) { res[sname] = "data/sfx/" + sname + ".ogg" })
mapnames.forEach(function (mname) { res[mname] = "data/maps/" + mname + ".bmp" })
UFX.resource.load(res)
graphics.init()


function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

function splitcap(s) { return s.replace(/([A-Z])/g, ' $1').substr(1) }

var musicplaying = null
var musicon = true, sfxon = true
var musicvolume = 1, sfxvolume = 1
function setsfx(on) {
	sfxon = on
}
function setmusic(on) {
	musicon = on
	if (musicplaying) musicplaying.volume = musicon ? musicvolume : 0
}

function playsound(name) {
	if (!UFX.resource.sounds[name]) {
		console.log("missing sound: " + name)
		return
	}
	if (!sfxon) return
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
	m.volume = musicon ? musicvolume : 0
	m.currentTime = 0
	m.play()
	m.loop = true
	musicplaying = m
}



