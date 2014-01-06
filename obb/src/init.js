if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}
function clamp(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}


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
})

UFX.resource.onload = function () {
	graphics.init()
	text.init()
	UFX.scene.init()
	UFX.scene.push("play")
}

