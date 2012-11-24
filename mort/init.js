

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
window.onresize = function () {
	if ((document.webkitFullscreenElement || document.mozFullScreenElement) == canvas) {
		canvas.style.width = document.width + "px"
	} else {
		canvas.style.width = ""
	}
}

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||  
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
UFX.scene.init()
UFX.scene.push(LoadScene)
UFX.resource.onloading = function (f) { LoadScene.onloading(f) }
UFX.resource.onload = function () {
	UFX.scene.pop()
    UFX.scene.push(TitleScene)
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
UFX.resource.load(res)
UFX.resource.loadwebfonts("Contrail One", "Norican", "Kaushan Script", "Shojumaru", "Bangers",
    "Condiment", "Ceviche One", "Marko One", "Rosarivo", "Jolly Lodger", "Fugaz One", "Marcellus SC")

// sound and music
var soundcheck = document.getElementById("playsound"), musiccheck = document.getElementById("playmusic")
function playsound(soundname) {
	if (playsoundcheck.checked) UFX.resource.sounds[soundname].play()
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

