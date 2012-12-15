var gamestate = {
	stage: 0,
	loadstage: function () {
		blobs = [new Blob(500, 100)]
		platforms = [
			new SinglePlatform(300, 300, 700, 300),
			new SinglePlatform(200, 200, 220, 500),
			new SinglePlatform(220, 500, 780, 500),
			new SinglePlatform(780, 500, 800, 200),
		]
		scenery = [
			new Turner(350, 300, true, platforms[0]),
			new Turner(650, 300, false, platforms[0]),
		]
		this.sincounts = {
			defy: 10,
			want: 10,
		}
	},
}

