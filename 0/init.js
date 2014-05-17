// Put as much code here to keep the HTML minimal
if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}
function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
function rmod(x,z){return(x%z+z)%z}
function zmod(x,z){return((x+z/2)%z+z)%z-z/2}
var tau = 6.283185307179586

var canvas = null, context = null
window.onload = function () {
	document.title = settings.gamename
	canvas = document.createElement("canvas")
	document.body.insertBefore(canvas, null)
	context = canvas.getContext("2d")
	UFX.draw.setcontext(context)
	UFX.maximize.resizemode = "total"
	UFX.maximize.fill(canvas)
	UFX.scene.init({
		minups: 10,
		maxups: 200,
	})
	UFX.scene.push("select")
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
}


UFX.resource.onload = function () {
	for (var s in UFX.resource.sounds) {
		if (s.indexOf("note") > -1) {
			UFX.resource.sounds[s] = new UFX.resource.Multisound(UFX.resource.sounds[s])
		}
	}
}
UFX.resource.load({
	"note-3": "sound/note-3.ogg",
	"note-34": "sound/note-34.ogg",
	"note-68": "sound/note-68.ogg",
	"note-346": "sound/note-346.ogg",
	"note-543": "sound/note-543.ogg",
	"fin": "sound/fin.ogg",
})

function play(sname) {
	if (settings.silent) return
	if (UFX.resource.sounds[sname] && UFX.resource.sounds[sname].play) {
		UFX.resource.sounds[sname].play()
	}
}


