if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}
function clamp(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
var tau = 6.283185307179586
var s3 = 0.8660254037844386  // sqrt(3)/2

var canvas = document.getElementById("canvas")
var gl = canvas.getContext("experimental-webgl")
UFX.maximize.resizemode = "total"
UFX.maximize.onadjust = function (c, x, y) {
	debugHUD.alert("Resized to " + x + "x" + y)
}
UFX.maximize.fill(canvas)

UFX.resource.loadwebfonts("Viga", "Contrail One")
UFX.resource.load({
	// shaders
	"coververt": "shaders/cover.vert",
	"fullvert": "shaders/full.vert",
	"boxvert": "shaders/box.vert",
	"uniformfrag": "shaders/uniform.frag",
	"checkerfrag": "shaders/checker.frag",
	"fogfrag": "shaders/fog.frag",
	"visiblefrag": "shaders/visible.frag",
	"rflamefrag": "shaders/rflame.frag",
	"blobfrag": "shaders/blob.frag",
	"blobvert": "shaders/blob.vert",
	"blobnormalfrag": "shaders/blobnormal.frag",
	"blobnormalvert": "shaders/blobnormal.vert",
	"blobrenderfrag": "shaders/blobrender.frag",
	"blobrendervert": "shaders/blobrender.vert",
})

UFX.touch.active = false
canvas.ontouchstart = function () {
	UFX.touch.active = true
	UFX.touch.init()
}

UFX.resource.onload = function () {
	graphics.init()
	blobscape.init()
	text.init()
	UFX.scene.init({ fps: 60 })
	UFX.scene.push("play")
	UFX.key.init()
	if (!UFX.touch.active) {
		canvas.ontouchstart = function (event) {
			UFX.touch.active = true
			UFX.mouse.active = false
			UFX.touch.init(canvas)
			UFX.touch._ontouchstart(event)
		}
		UFX.mouse.capture.wheel = true
		UFX.mouse.capture.right = true
		UFX.mouse.init(canvas)
	}
}

