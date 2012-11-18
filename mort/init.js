

var canvas = document.getElementById("canvas")
canvas.width = settings.sx
canvas.height = settings.sy
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||  
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
UFX.scene.init()
UFX.scene.push(LoadScene)
UFX.resource.onloading = LoadScene.onloading
UFX.resource.onload = function () {
	UFX.scene.pop()
//	UFX.scene.push(record.maxvisited ? MapScene : CutScene)
    gamestate.startlevel()
    record.bank = 123
//	UFX.scene.push(ShopScene)
    UFX.scene.push(MapScene)
}

UFX.key.init()
UFX.key.remaparrows(true)
UFX.key.remap({ space: "act", enter: "act" })
UFX.key.watchlist = "left right up down act tab esc".split(" ")
UFX.key.qdown = true
UFX.key.qcombo = true

var res = {}
for (var fname in frameoffsets) {
	res[fname] = "img/" + fname + ".png"
}
UFX.resource.load(res)
UFX.resource.loadwebfonts("Contrail One", "Norican", "Kaushan Script", "Shojumaru", "Bangers",
    "Condiment", "Ceviche One", "Marko One", "Rosarivo", "Jolly Lodger")

// utilities
function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

// cheats
record.unlocked = 6
record.maxvisited = 6
record.knownfeats = {
	nab: 6,
	leap: 5,
	turn: 4,
	twirl: 3,
	dart: 2,
	bound: 1,
	roll: 1,
}

