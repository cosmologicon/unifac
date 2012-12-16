var gamestate = {
	stage: 0,
	loadstage: function () {
		blobs = [
			new Blob(600, -100),
			new Blob(400, -400),
			new Blob(500, 100),
		]
		platforms = [
			new SinglePlatform(300, 300, 700, 300),
//			new MultiPlatform(200, 200, 220, 500, 780, 500, 800, 200),
		]
		this.gems = [
			new Gem(500, 150),
		]
		this.turners = [
			new Turner(350, 300, true, platforms[0]),
			new Turner(650, 300, false, platforms[0]),
		]
		scenery = []
		scenery.push.apply(scenery, this.gems)
		scenery.push.apply(scenery, this.turners)

		this.sincounts = {
			defy: 10,
			want: 10,
			rage: 10,
			gorge: 10,
		}
		
		this.xmin = 0 ; this.xmax = 1000
		this.ymin = 0 ; this.ymax = 1000
	},
	nblobs: function () {
		var n = 0
		for (var j = 0 ; j < blobs.length ; ++j) {
			if (!blobs[j].state.dead) n += 1
		}
		return n
	},
	complete: function () {
		return this.nblobs() == 0
	},
	nearestgem: function (x, y) {
		var nearest = null, d2min
		this.gems.forEach(function (gem) {
			var d2 = (gem.x - x) * (gem.x - x) + (gem.y - y) * (gem.y - y)
			if (!nearest || d2 < d2min) {
				d2min = d2
				nearest = gem
			}
		})
		return nearest
	},
}

