if (settings.DEBUG) {
	window.onerror = function (error, url, line) {
		document.body.innerHTML = "<p>Error in: "+url+"<p>line "+line+"<pre>"+error+"</pre>"
	}
}
function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}


var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")
UFX.draw.setcontext(context)
UFX.resource.loadwebfonts("Viga", "Contrail One")
UFX.maximize.resizemode = "total"
UFX.maximize.onadjust = function (c, x, y) {
	debugHUD.alert("Resized to " + x + "x" + y)
}
UFX.maximize.fill(canvas)
UFX.scene.init()
UFX.scene.push("play")


