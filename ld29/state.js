var state = {
	init: function () {
		this.effects = []
		this.splats = []
		this.buildings = []
		this.houses = {}
		this.taken = {}
		this.platforms = []
		this.addhouse(0, 0, "elgo")
		this.addhouse(-2, 1, "wari")
		this.addhouse(3, 1, "semt")
		this.addhouse(-3, 3, "pald")
		this.load(UFX.resource.data.gamedata)
		this.you = new You(this.houses.elgo.x, this.houses.elgo.y + 4)
		this.sortplatforms()
		
		this.monsters = []
		this.fillsector(-1, 0)
		this.fillsector(-2, 0)
		this.fillsector(-1, 1)
		this.fillsector(0, 1)
		this.fillsector(1, 1)
		this.fillsector(2, 1)
		this.fillsector(1, 0)
		this.fillsector(2, 0)
		this.fillsector(3, 0)
		
		this.njump = 1
		this.jhang = 1
		
		this.lastlanding = this.houses.elgo.parent

		this.done = {
			rescueelgo: true,
			rescuewari: true,
		}
		
		this.bosses = {
			semt: [],
			pald: [],
		}

		this.loadgame()
		if (!this.done.rescuesemt) {
			var x = this.houses.semt.x, y = this.houses.semt.y + 1
			for (var j = 0 ; j < 9 ; ++j) {
				this.bosses.semt.push(new Lance(x, y, j/9))
			}
		}
		if (!this.done.rescuepald) {
			var x = this.houses.pald.x, y = this.houses.pald.y + 1
			for (var j = 0 ; j < 11 ; ++j) {
				this.bosses.pald.push(new Wilson(x, y, j/11))
			}
		}
	},
	resetfall: function () {
		this.you.x = this.lastlanding.x + this.lastlanding.dx * 0.5
		this.you.y = this.lastlanding.y + 0.8
		this.you.kjump = 999
		this.you.drop()
	},
	addhouse: function (sx, sy, hname) {
		var x = (sx + 0.5) * settings.sectorsize, y = (sy + 0.5) * settings.sectorsize
		var p = new Platform(x - 4, y, 8)
		var h = new House(x, y, hname)
		h.parent = p
		p.house = h
		this.buildings.push(h)
		this.platforms.push(p)
		this.houses[hname] = h
	},
	nearhouse: function (you) {
		if (!you.parent) return false
		if (!you.parent.house) return false
		if (Math.abs(you.x - you.parent.house.x) > 2) return false
		if (!this.rescued[you.parent.house.name]) return false
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
	removeplatform: function (platform) {
		this.platforms = this.platforms.filter(function (p) { return p !== platform })
		this.taken = {}
		for (var j = 0 ; j < this.platforms.length ; ++j) {
			this.claimtiles(this.platforms[j])
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
	fillsector: function (sx, sy) {
		var s = settings.sectorsize
		UFX.random.spread(16).forEach(function (p) {
			new Bat(s * (sx + p[0]), s * (sy + p[1]))
		})
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
	checkbosses: function () {
		for (var h in this.bosses) {
			if (this.rescued[h]) continue
			if (!this.bosses[h].some(function (b) { return b.alive })) {
				delete this.bosses[h]
				this.done["rescue" + h] = true
				this.savegame()
				console.log("saved", h)
			}
		}
	},
	dump: function () {
		var pdata = this.platforms.filter(function (p) {
			return !p.house
		}).map(function (p) {
			return [p.x, p.y, p.dx, p.ischeck ? 1 : 0]
		})
		var obj = {
			pdata: pdata,
		}
		window.open("data:text/json," + JSON.stringify(obj))
	},
	load: function (obj) {
		for (var j = 0 ; j < obj.pdata.length ; ++j) {
			var p = obj.pdata[j]
			var platform = new Platform(p[0], p[1], p[2])
			if (p[3]) platform.ischeck = true
			this.platforms.push(platform)
		}
	},
	gamename: "LD29save",
	savegame: function () {
		console.log("saving")
		var obj = {
			youpos: [this.you.x, this.you.y],
			hp: this.you.hp,
			done: this.done,
		}
		localStorage[this.gamename] = JSON.stringify(obj)
	},
	loadgame: function () {
		if (!localStorage[this.gamename]) return null
		var obj = JSON.parse(localStorage[this.gamename])
		this.you.x = obj.youpos[0]
		this.you.y = obj.youpos[1] + 0.4
		this.you.hp = obj.hp
		this.you.drop()
		this.done = obj.done
	},
}

