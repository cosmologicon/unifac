/*var music = null
function setmusic() {
    if (music) music.volume = document.getElementById("playmusic").checked ? 0.5 : 0
}*/
function playsound(soundname) {
    if (document.getElementById("playsound").checked) {
        UFX.resource.sounds[soundname].play()
    }
}


function setvo() {
    settings.voiceover = document.getElementById("playvo").checked
}
function setmusic() {
    if (document.getElementById("playmusic").checked && musicplaying) {
        UFX.resource.sounds.music.volume = 0.35
    } else {
        UFX.resource.sounds.music.volume = 0
    }
}
var musicplaying = false
function playmusic() {
    musicplaying = true
    if (document.getElementById("playsound").checked) {
        UFX.resource.sounds.music.volume = 0.35
    }
}
function stopmusic() {
    musicplaying = false
    UFX.resource.sounds.music.volume = 0
}


