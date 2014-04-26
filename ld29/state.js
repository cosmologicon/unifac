var state = {
	init: function () {
		this.you = new You(0, 2)
		this.buildings = []
		this.taken = {}
		this.platforms = [
			new Platform(-2, 0, 4),
			new Platform(1, 2, 4),
		]
		for (var j = 3 ; j < 5000 ; ++j) {
			this.platforms.push(new Platform(UFX.random.rand(-j, j), j, 3))
		}
		this.addhouse(-10, -3)
		this.sortplatforms()
		
		this.monsters = [
			new Bat(2, 3),
		]
		
		this.njump = 1
	},
	addhouse: function (x, y) {
		var p = new Platform(x - 4, y, 8)
		var h = new House(x, y)
		h.parent = p
		p.house = h
		this.buildings.push(h)
		this.platforms.push(p)
	},
	nearhouse: function (you) {
		if (!you.parent) return false
		if (!you.parent.house) return false
		if (Math.abs(you.x - you.parent.house.x) > 2) return false
		return you.parent.house
	},
	sortplatforms: function () {
		this.platforms.sort(function (p1, p2) { return p1.y - p2.y })
	},
	claimtiles: function (platform) {
		var y = platform.y
		this.taken[y] = this.taken[y] || {}
		for (var j = 0 ; j < platform.dx ; ++j) {
			this.taken[y][platform.x + j] = 1
		}
	},
	canplace: function (platform) {
		var y = platform.y
		if (!this.taken[y]) return true
		for (var j = 0 ; j < platform.dx ; ++j) {
			if (this.taken[y][platform.x + j]) return false
		}
		return true
	},
	forplatforms: function (y0, y1, callback) {
		// j = lowest index <= y0, k = highest index > y0
		var j = 0, k = this.platforms.length
		while (j + 1 < k) {
			var i = Math.floor((j + k) / 2)
			if (this.platforms[i].y > y0) {
				k = i
			} else {
				j = i
			}
		}
		for ( ; j < this.platforms.length && this.platforms[j].y <= y1 ; ++j) {
			callback(this.platforms[j])
		}
	},
}

