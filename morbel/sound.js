/*var music = null
function setmusic() {
    if (music) music.volume = document.getElementById("playmusic").checked ? 0.5 : 0
}*/
function playsound(soundname) {
//    if (document.getElementById("playsound").checked) {
        UFX.resource.sounds[soundname].play()
//    }
}

