var state = {
	init: function () {
		this.effects = []
		this.splats = []
		this.buildings = []
		this.houses = {}
		this.taken = {}
		this.platforms = []
		this.newplatforms = []
		this.hsectors = {}
		this.addhouse(0, 0, "elgo")
		this.addhouse(-2, 1, "wari")
		this.addhouse(3, 1, "semt")
		this.addhouse(-3, 3, "pald")
		this.addhouse(0, 5, "lume")
		this.addhouse(2, 3, "lige")
		this.addhouse(-3, -4, "sank")
		this.addhouse(-6, 4, "mian")
		this.addhouse(3, 8, "sarf")
		this.load(UFX.resource.data.gamedata)
		this.you = new You(this.houses.elgo.x, this.houses.elgo.y + 4)
		this.sortplatforms()
		
		this.monsters = []
		this.basesector = null
		this.filledsectors = {}
		
		this.njump = 1
		this.jhang = 0
		this.canbuild = false
		this.canwarp = false
		this.sun = false
		this.gp = 0
		this.builddepth = 110
		
		this.lastlanding = this.houses.elgo.parent

		this.done = {
			knowelgo: true,
			rescueelgo: true,
			rescuewari: true,
			rescuesarf: true,
		}
		
		this.bosses = {
			semt: [],
			pald: [],
			lume: [],
			lige: [],
			sank: [],
			mian: [],
		}
		this.loadgame()
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
		this.hsectors[sx + "," + sy] = h
	},
	nearhouse: function (you) {
		if (!you.parent) return false
		if (!you.parent.house) return false
		if (Math.abs(you.x - you.parent.house.x) > 2) return false
		if (!this.done["rescue" + you.parent.house.name]) return false
		return you.parent.house
	},
	talk: function (house) {
		content["talk" + house.name]()
		this.you.hp = this.you.maxhp
		this.gp = Math.max(this.gp, settings.housegp)
		this.savegame()
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
		if (y > this.builddepth) return false
		if (this.gp < settings.pcost) return false
		if (!this.taken[y]) return true
		for (var j = 0 ; j < platform.dx ; ++j) {
			if (this.taken[y][platform.x + j]) return false
		}
		return true
	},
	fillsector: function (sx, sy) {
		var s = settings.sectorsize
		var h = this.hsectors[sx + "," + sy]
		if (h) {
			if (this.done["rescue" + h.name]) return
			hx = h.x, hy = h.y + 1
			this.bosses[h.name] = []
			if (h.name == "semt") {
				for (var j = 0 ; j < 9 ; ++j) {
					this.bosses[h.name].push(new Lance(hx, hy, j/9))
				}
			} else if (h.name == "pald") {
				for (var j = 0 ; j < 11 ; ++j) {
					this.bosses[h.name].push(new Wilson(hx, hy, j/11))
				}
			} else if (h.name == "lume") {
				for (var j = 0 ; j < 10 ; ++j) {
					this.bosses[h.name].push(new Percy(hx, hy))
				}
			} else if (h.name == "lige") {
				for (var j = 0 ; j < 9 ; ++j) {
					this.bosses[h.name].push(new Lance(hx, hy, j/9))
					this.bosses[h.name].push(new Percy(hx, hy))
				}
			} else if (h.name == "mian") {
				for (var j = 0 ; j < 11 ; ++j) {
					this.bosses[h.name].push(new Wilson(hx, hy, j/11))
					this.bosses[h.name].push(new Percy(hx, hy))
				}
			} else if (h.name == "sank") {
				for (var j = 0 ; j < 11 ; ++j) {
					this.bosses[h.name].push(new Wilson(hx, hy, j/11))
					this.bosses[h.name].push(new Lance(hx, hy, j/11))
				}
			}
		} else if (sy < 8) {
			var batprob = 16
			var zatprob = 2 * Math.max(this.you.maxhp - 3, 0)
			var watprob = 4 * Math.max(this.you.maxhp - 5, 0)
			UFX.random.spread(200).forEach(function (p) {
				var r = UFX.random(200)
				r -= batprob
				if (r < 0) { new Bat(s * (sx + p[0]), s * (sy + p[1])) ; return }
				r -= zatprob
				if (r < 0) { new Zat(s * (sx + p[0]), s * (sy + p[1])) ; return }
				r -= watprob
				if (r < 0) { new Wat(s * (sx + p[0]), s * (sy + p[1])) ; return }
			})
		}
	},
	clearsector: function (key) {
		this.monsters = this.monsters.filter(function (m) { return m.sectorkey != key })
	},
	checksectors: function () {
		var sx0 = Math.floor(this.you.x / settings.sectorsize)
		var sy0 = Math.floor(this.you.y / settings.sectorsize)
		var nbasesector = sx0 + "," + sy0
		if (this.basesector == nbasesector) return
		var nfilledsectors = {}
		for (var dx = -1 ; dx <= 1 ; ++dx) {
			for (var dy = -1 ; dy <= 1 ; ++dy) {
				var sx = sx0 + dx, sy = sy0 + dy, key = sx + "," + sy
				if (!this.filledsectors[key]) this.fillsector(sx, sy)
				nfilledsectors[key] = 1
			}
		}
		for (var key in this.filledsectors) {
			if (!nfilledsectors[key]) this.clearsector(key)
		}
		this.basesector = nbasesector
		this.filledsectors = nfilledsectors
		console.log(this.monsters.length)
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
			if (this.done["rescue" + h]) continue
			if (this.bosses[h].length && !this.bosses[h].some(function (b) { return b.alive })) {
				delete this.bosses[h]
				this.done["rescue" + h] = true
				playsound("defeat")
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
		var pdata = this.newplatforms.map(function (p) {
			return [p.x, p.y, p.dx]
		})
		var obj = {
			youpos: [this.you.x, this.you.y],
			maxhp: this.you.maxhp,
			done: this.done,
			njump: this.njump,
			jhang: this.jhang,
			canbuild: this.canbuild,
			canwarp: this.canwarp,
			gp: this.gp,
			pdata: pdata,
			sun: this.sun,
		}
		localStorage[this.gamename] = JSON.stringify(obj)
	},
	loadgame: function () {
		if (!localStorage[this.gamename]) return null
		var obj = JSON.parse(localStorage[this.gamename])
		this.you.x = obj.youpos[0]
		this.you.y = obj.youpos[1] + 0.4
		this.you.hp = this.you.maxhp = obj.maxhp
		this.you.drop()
		this.done = obj.done
		this.njump = obj.njump
		this.jhang = obj.jhang
		this.canbuild = obj.canbuild
		this.canwarp = obj.canwarp
		this.gp = obj.gp
		this.sun = obj.sun
		for (var j = 0 ; j < obj.pdata.length ; ++j) {
			var p = obj.pdata[j]
			var platform = new Platform(p[0], p[1], p[2])
			console.log(platform)
			this.platforms.push(platform)
			this.newplatforms.push(platform)
		}
		this.sortplatforms()
	},
}

