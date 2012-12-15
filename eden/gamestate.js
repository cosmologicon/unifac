var gamestate = {
	stage: 0,
	loadstage: function () {
		blobs = [new Blob(400, 100)]
		platforms = [
			new SinglePlatform(200, 300, 420, 400),
			new SinglePlatform(420, 400, 600, 330),
			new SinglePlatform(600, 330, 800, 480),
		]
	},
}

