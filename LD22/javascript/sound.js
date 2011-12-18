
var volume = 0.5
var sounds = {}

function play(name, delay) {
    if (!volume) return
    if (!sounds[name]) {
        sounds[name] = new Array(10)
        // if there's a sound you need to play more than 10 of at a time, cry me a river
        for (var j = 0 ; j < 10 ; ++j) sounds[name][j] = new Audio("sound/" + name + ".ogg")
        sounds[name].next = 0
    }
    var sound = sounds[name][sounds[name].next]
    sounds[name].next = (sounds[name].next + 1) % 10
    sound.volume = volume
    if (delay) {
        setTimeout(sound.play, delay)
    } else {
        sound.play()
    }
}

var musicvolume = 0.3
var music = null
var musicname = null
function playmusic(name) {
    if (musicname == name) return // already playing
    musicname = name
    if (music) music.stop()
    music = new Audio("music/" + name + ".ogg")
    music.loop = true
    music.volume = musicvolume
    music.play()
}

exports.play = play
exports.playmusic = playmusic


