

var canvas = document.getElementById("canvas")
canvas.width = settings.sx
canvas.height = settings.sy
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

function gofullscreen() {
	if (canvas.webkitRequestFullScreen) {
		canvas.webkitRequestFullScreen(true)
	} else if (canvas.mozRequestFullScreen) {
		canvas.mozRequestFullScreen()
	} else if (canvas.requestFullScreen) {
		canvas.requestFullScreen()
	}
}
function setcanvassize() {
	if ((document.webkitFullscreenElement || document.mozFullScreenElement) == canvas) {
		canvas.style.border = "none"
		canvas.style.width = document.width + "px"
	} else {
		canvas.style.border = "10px lightgrey outset"
		canvas.style.width = ""
	}
}
window.onresize = setcanvassize
setcanvassize()

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||  
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
UFX.scene.init()
UFX.scene.playback.trimempty = true
UFX.scene.push("load")
UFX.resource.onloading = function (f) { UFX.scenes.load.onloading(f) }
UFX.resource.onload = function () {
	UFX.scene.pop()
	UFX.scene.push("title")
//	UFX.scene.push(EndScene)
	UFX.resource.mergesounds("jump", "pickup", "ejump", "whiff", "ewhiff")
	UFX.resource.sounds.jump.volume = 0.3
}

UFX.key.init()
UFX.key.remaparrows(true)
UFX.key.remap({ space: "act", enter: "act", Q: "esc" })
UFX.key.watchlist = "left right up down act tab esc".split(" ")
UFX.key.qdown = true
UFX.key.qcombo = true

var res = {
	girl: "music/another-girl.ogg",
	gnos: "music/gnossienne1.ogg",
	one: "music/one-five-nine.ogg",
	xylo: "music/xylophone-symposium.ogg",
}
for (var fname in frameoffsets) {
	res[fname] = "img/" + fname + ".png"
}
var soundnames = (
	"jump-0 jump-1 jump-2 jump-3 jump-4 jump-5 jump-6 jump-7 " +
	"ejump-0 ejump-1 ejump-2 ejump-3 ejump-4 ejump-5 ejump-6 ejump-7 " +
	"whiff-0 whiff-1 whiff-2 whiff-3 whiff-4 whiff-5 whiff-6 " +
	"ewhiff-0 ewhiff-1 ewhiff-2 ewhiff-3 ewhiff-4 ewhiff-5 ewhiff-6 " +
	"pickup-0 pickup-1 pickup-2 pickup-3 pickup-4 pickup-5 " +
	"pickup-6 pickup-7 pickup-8 pickup-9 pickup-10 pickup-11 pickup-12"
).split(" ")
soundnames.forEach(function (sname) {
	res[sname] = "sfx/" + sname + ".ogg"
})
UFX.resource.load(res)
if (window.location.toString().indexOf("nofonts") == -1) {
	UFX.resource.loadwebfonts("Contrail One", "Norican", "Kaushan Script", "Shojumaru", "Bangers",
		"Condiment", "Ceviche One", "Marko One", "Rosarivo", "Jolly Lodger", "Fugaz One", "Marcellus SC")
}

// sound and music
var soundcheck = document.getElementById("playsound"), musiccheck = document.getElementById("playmusic")
function playsound(soundname) {
	if (soundcheck.checked) UFX.resource.sounds[soundname].play()
}

var musicplaying = null, musicvolume = settings.musicvolume
document.getElementById("playmusic").onclick = function () {
	musicvolume = this.checked ? settings.musicvolume : 0.0
	if (musicplaying) musicplaying.volume = musicvolume
}
function playmusic(mname) {
	var m = UFX.resource.sounds[mname]
	if (m === musicplaying) return
	if (musicplaying) musicplaying.pause()
	m.volume = musicvolume
	m.currentTime = 0
	m.play()
	m.loop = true
	musicplaying = m
}
function stopmusic() {
    musicplaying = false
    UFX.resource.sounds.music.volume = 0
}

// utilities
function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

// cheats
function cheat() {
    record.unlocked = 6
    record.maxvisited = 6
    record.knownfeats = {
	    nab: 5,
	    leap: 5,
	    turn: 5,
	    twirl: 5,
	    dart: 5,
	    bound: 5,
	    roll: 5,
    }
    record.bank = 20000
}


