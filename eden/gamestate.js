var gamestate = {
	stage: 0,
	completed: {},
	besttime: {},
	unlocked: { 0: true },
	seen: {},
	
	getstate: function () {
		return [this.completed, this.besttime, this.unlocked, this.seen]
	},
	setstate: function (c, b, u, s) {
		this.completed = c
		this.besttime = b
		this.unlocked = u
		this.seen = s
	},
	loadstage: function () {
		leveldata[this.stage].apply(this)
		scenery = []
		scenery.push.apply(scenery, this.gems)
		scenery.push.apply(scenery, this.turners)
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
	save: function () {
		localStorage[settings.savegamename] = JSON.stringify(this.getstate())
	},
	load: function () {
		var s = localStorage[settings.savegamename]
		if (s) {
			var obj = JSON.parse(s)
			this.setstate.apply(this, obj)
		}
	},
	reset: function () {
		if (!window.confirm("Reset saved game and start from the beginning?")) return
		delete localStorage[settings.savegamename]
		window.location.reload()
	},
}
gamestate.load()
gamestate.save()


