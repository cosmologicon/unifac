if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}
function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
function rmod(x,z){return(x%z+z)%z}
function zmod(x,z){return((x+z/2)%z+z)%z-z/2}
var tau = 6.283185307179586

var canvas = document.getElementById("canvas")
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


window.onload = function () {
	UFX.maximize.resizemode = "total"
//	UFX.maximize.fill(canvas)
	UFX.scene.init({
		minups: 10,
		maxups: 200,
	})
	UFX.scene.push("menu")
}


