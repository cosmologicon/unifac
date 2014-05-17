if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}

var canvas = document.getElementById("canvas")
canvas.width = settings.sx
canvas.height = settings.sy

var context = canvas.getContext("2d")
UFX.draw.setcontext(context)
UFX.mouse.init(canvas)
UFX.mouse.qup = false
UFX.mouse.qdown = true
UFX.touch.active = false
UFX.touch.capture = {
	start: true,
}
canvas.ontouchstart = function (event) {
	UFX.touch.active = true
	UFX.touch.init(canvas)
	UFX.mouse.active = false
}


UFX.resource.onload = function () {
	UFX.maximize.resizemode = "total"
	UFX.scene.init({
		minups: 10,
		maxups: 200,
	})
	UFX.scene.push("menu")
}
UFX.resource.loadwebfonts("Condiment", "Allan", "Trade Winds", "Viga")

var nmusic = 0
function music() {
	nmusic += 1
	nmusic %= 5
	;[1,2,3,4].forEach(function (j) {
		if (j == nmusic) {
			document.getElementById("music" + j).play()
		} else {
			document.getElementById("music" + j).pause()
		}
	})
	document.getElementById("music").innerHTML = [
		"Music is off",
		"Track 1: Arcadia",
		"Track 2: Moonlight Hall",
		"Track 3: The Complex",
		"Track 4: Minima",
	][nmusic]
}
music()


