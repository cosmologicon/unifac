
UFX.resource.onload = function () {
	initPlotState(plotstate)
	robotstate.init(null)
	graphics.clear()
	UFX.mouse.capture.right = true
	UFX.mouse.capture.wheel = true
	UFX.mouse.init(canvas)
	UFX.key.init(canvas)
	UFX.scene.init({fps: 50})
	UFX.scene.push("missionmode")

	if (DEBUG.expose) {
		mode = UFX.scenes.missionmode
		zoomout = function () {	mode.desired_zoom /= 4 }
		zoomin = function () { mode.desired_zoom *= 4 }
	}

}


UFX.resource.load({
	"3rooms": "data/maps/3rooms.bmp",
	"controlroom": "data/maps/controlroom.bmp",
	"dollis": "data/maps/dollis.bmp",
})
graphics.init()


function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

function splitcap(s) { return s.replace(/([A-Z])/g, ' $1').substr(1) }

function playsound(name) {
	//TODO: port sound module, need a few UFX.multisounds
}
function stopmusic() {
}
function playmusic(song) {
}



