var LoadScene = Object.create(UFX.scene.Scene)

LoadScene.think = function (dt) {
	UFX.draw("fs rgb(20,0,20) fr 0 0", settings.sx, settings.sy, "fs rgb(200,0,200) ss black",
		"textalign center textbaseline middle")
	context.font = settings.fonts.loading
	context.fillText("Loading....", settings.sx/2, settings.sy/2)
	context.strokeText("Loading....", settings.sx/2, settings.sy/2)
}


var WorldMapScene = Object.create(UFX.scene.Scene)

WorldMapScene.think = function (dt) {
	UFX.draw("fs rgb(20,0,20) fr 0 0", settings.sx, settings.sy, "fs rgb(200,0,200) ss black",
		"textalign center textbaseline middle")
	context.font = settings.fonts.loading
	context.fillText("World Map", settings.sx/2, settings.sy/2)
}




