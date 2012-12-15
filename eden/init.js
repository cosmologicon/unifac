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
UFX.scene.init(10, 10)
UFX.scene.playback.trimempty = true
UFX.scene.push(LoadScene)
UFX.resource.onloading = function (f) { LoadScene.f = f }
UFX.resource.onload = function () {
	UFX.scene.swap(TitleScene)
}

UFX.mouse.init(canvas)

UFX.resource.load({})
if (window.location.toString().indexOf("nofonts") == -1) {
	UFX.resource.loadwebfonts("Viga")
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
function fpos(pos) {
	if (!pos) return pos
	if (!canvas.style.width) return pos
	return [
		pos[0] * settings.sx / parseInt(canvas.style.width),
		pos[1] * settings.sy / parseInt(canvas.style.height),
	]
}

