// Put as much code here to keep the HTML minimal
if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}
function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}
function rmod(x,z){return(x%z+z)%z}

var canvas = null, context = null
window.onload = function () {
	canvas = document.createElement("canvas")
	document.body.insertBefore(canvas)
	context = canvas.getContext("2d")
	UFX.draw.setcontext(context)
	UFX.maximize.resizemode = "total"
	UFX.maximize.fill(canvas)


window.requestAnimationFrame = window.requestAnimationFrame
	|| window.mozRequestAnimationFrame
	|| window.webkitRequestAnimationFrame
	|| window.msRequestAnimationFrame
window.cancelAnimationFrame = window.cancelAnimationFrame
	|| window.mozCancelAnimationFrame
	|| window.webkitCancelAnimationFrame
	|| window.msCancelAnimationFrame
UFX.ticker.sync = true


	UFX.scene.init({
		minups: 10,
		maxups: 200,
	})
	UFX.scene.push("main")
	UFX.mouse.init(canvas)
	UFX.mouse.qdown = false
}

