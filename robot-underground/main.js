

UFX.resource.onload = function () {
	initPlotState(plotstate)
	robotstate.init(null)
	graphics.clear()
	UFX.mouse.init(canvas)
	UFX.key.init(canvas)
	UFX.scene.init()
	UFX.scene.push("missionmode")
}


UFX.resource.load({
	"3rooms": "data/maps/3rooms.bmp",
	"controlroom": "data/maps/controlroom.bmp",
	"dollis": "data/maps/dollis.bmp",
})
graphics.init()


function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

