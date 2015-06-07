function clamp(x, a, b) { return x < a ? a : x > b ? b : x }
var tau = 2 * Math.PI
function wordwrap(text, twidth, con) {
    con = con || context
    twidth = twidth || con.canvas.width
    var texts = [text], n = 0, s
    while (con.measureText(texts[n]).width > twidth && (s = texts[n].indexOf(" ")) > -1) {
        var t = texts[n], a = t.lastIndexOf(" ")
        while (con.measureText(t.substr(0, a)).width > twidth && a > s) a = t.lastIndexOf(" ", a-1)
        texts[n++] = t.substr(0, a)
        texts.push(t.substr(a+1))
    }
    return texts
}

var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")

UFX.draw.setcontext(context)
var sx, sy
UFX.maximize.onadjust = function (canvas, width, height) {
	sx = width
	sy = height
}
UFX.maximize.fill(canvas, "total")
UFX.scene.init({ minups: 5, maxups: 60 })
UFX.scene.push("menu")
UFX.key.init()
UFX.key.remaparrows(true)
UFX.key.watchlist = ["right", "left", "space"]

setTimeout(function () {
	terrain.init()
}, 10)

UFX.resource.onload = function () {
	UFX.resource.sounds.music.loop = true
	UFX.resource.mergesounds("boom")
	UFX.scenes.menu.ready = true
}
UFX.resource.onloading = function (f) {
	UFX.scenes.menu.f = f
}

UFX.resource.loadwebfonts("Anton", "Archivo Black", "Miltonian Tattoo", "Aclonica", "Jockey One")
UFX.resource.load({
	"music": "014action.ogg",
	"laser": "laser.ogg",
	"boom1": "boom1.ogg",
	"boom2": "boom2.ogg",
	"boom3": "boom3.ogg",
})

