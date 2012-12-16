var gamestate = {
	stage: 0,
	loadstage: function () {
		blobs = [
			new Blob(950, 0, false),
			new Blob(1000, -100, true),
			new Blob(1650, 0, true),
			new Blob(1720, -300, false),
			new Blob(1600, 300, false),
			new Blob(1700, 300, false),
			new Blob(1100, 800, false),
		]
		platforms = [
//			new SinglePlatform(300, 300, 700, 300),
//			new MultiPlatform(200, 200, 220, 500, 780, 500, 800, 200),
			new MultiPlatform(1300, 100, 1680, 80, 1880, 120),
			new MultiPlatform(720, 290, 920, 180, 1110, 200, 1270, 300, 1450, 330),
			new MultiPlatform(1170, 590, 1700, 480, 1960, 350, 2100, 0),
			new MultiPlatform(50, 50, 280, 150, 380, 220, 400, 400, 620, 500, 820, 500, 920, 600, 940, 800, 1400, 1000, 1950, 900, 2020, 770, 2050, 580, 2200, 450),
		]
		this.gems = [
//			new Gem(500, 150),
		]
		this.turners = [
			new Turner(1550, 50, true, platforms[0]),
			new Turner(1850, 100, false, platforms[0]),
			new Turner(750, 300, true, platforms[1]),
			new Turner(1450, 350, false, platforms[1]),
			new Turner(1350, 550, true, platforms[2]),
			new Turner(844, 500, false, platforms[3]),
		]
		scenery = []
		scenery.push.apply(scenery, this.gems)
		scenery.push.apply(scenery, this.turners)

		this.sincounts = {
			defy: 10,
			want: 10,
			rage: 10,
			gorge: 10,
			pride: 10,
			laze: 10,
		}
		
		this.xmin = -100 ; this.xmax = 2300
		this.ymin = -100 ; this.ymax = 1100
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

