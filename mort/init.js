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
	UFX.scene.push(WorldMapScene)
}

UFX.key.init()
UFX.key.remaparrows(true)
UFX.key.remap({ space: "act", enter: "act" })
UFX.key.watchlist = "left right up act esc".split(" ")

UFX.resource.load({
})


