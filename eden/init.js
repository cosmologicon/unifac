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
		canvas.style.height = (document.width * settings.sy / settings.sx) + "px"
	} else {
		canvas.style.border = "10px lightgrey outset"
		canvas.style.width = ""
		canvas.style.height = ""
	}
}
window.onresize = setcanvassize
setcanvassize()

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||  
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
UFX.ticker.registersync(UFX.scene.think, UFX.scene.draw, 300, 10)
UFX.scene.playback.trimempty = true
UFX.scene.push(LoadScene)
UFX.resource.onloading = function (f) { LoadScene.f = f }
UFX.resource.onload = function () {
	UFX.scene.swap(IntroScene)
	UFX.resource.mergesounds("jump")
	UFX.resource.sounds.fall = UFX.resource.Multisound(UFX.resource.sounds.fall, 5)
	UFX.resource.sounds.zzzz = UFX.resource.Multisound(UFX.resource.sounds.zzzz, 3)
	UFX.resource.sounds["click-0"] = UFX.resource.Multisound(UFX.resource.sounds["click-0"], 3)
	UFX.resource.sounds.pound = UFX.resource.Multisound(UFX.resource.sounds.pound, 10)
	UFX.resource.sounds.stun = UFX.resource.Multisound(UFX.resource.sounds.stun, 10)
	UFX.resource.sounds.eat = UFX.resource.Multisound(UFX.resource.sounds.eat, 3)
	UFX.resource.sounds.get = UFX.resource.Multisound(UFX.resource.sounds.get, 3)
	UFX.resource.sounds.pop = UFX.resource.Multisound(UFX.resource.sounds.pop, 3)
	UFX.resource.sounds.bolt = UFX.resource.Multisound(UFX.resource.sounds.bolt, 3)
	UFX.resource.sounds.jump.volume = 0.15
	UFX.resource.sounds.fall.volume = 0.4
}

UFX.mouse.init(canvas)
UFX.mouse.capture.right = true
UFX.mouse.capture.wheel = true

UFX.key.init()
UFX.key.remaparrows(true)
UFX.key.watchlist = "up down left right 1 2 3 4 5 6 7 space enter tab esc".split(" ")

var res = {
	tofuslow: "music/black-tofu-slow.ogg",
	ninja: "music/ninja-ages.ogg",
}
//for (var fname in frameoffsets) {
//	res[fname] = "img/" + fname + ".png"
//}
var soundnames = (
	"jump-0 jump-1 jump-2 jump-3 click-0 complete fall grow pound stun zzzz bolt eat get pop"
).split(" ")
soundnames.forEach(function (sname) {
	res[sname] = "sfx/" + sname + ".ogg"
})
UFX.resource.load(res)
UFX.resource.loadwebfonts("Viga", "Almendra SC", "Germania One", "Jolly Lodger", "Eater", "New Rocker")

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
function fpos(pos) {
	if (!pos) return pos
	if (!canvas.style.width) return pos
	return [
		pos[0] * settings.sx / parseInt(canvas.style.width),
		pos[1] * settings.sy / parseInt(canvas.style.height),
	]
}

