

var canvas = document.getElementById("canvas")
canvas.width = settings.sx
canvas.height = settings.sy
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||  
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
UFX.scene.init()
UFX.scene.push(LoadScene)
UFX.resource.onload = function () {
	UFX.scene.pop()
	UFX.scene.push(record.maxvisited ? MapScene : CutScene)
}

UFX.key.init()
UFX.key.remaparrows(true)
UFX.key.remap({ space: "act", enter: "act" })
UFX.key.watchlist = "left right up act esc".split(" ")

UFX.resource.load({
})

record.unlocked = 6
record.maxvisited = 6

// utilities
function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

