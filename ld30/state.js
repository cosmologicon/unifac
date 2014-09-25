
var state = {
	init: function () {
		this.level = +window.localStorage[settings.savename] || 0
		if (settings.EDITOR) this.level = "editor"
	},
	advance: function () {
		this.level += 1
		if (this.level > window.localStorage[settings.savename]) {
			window.localStorage[settings.savename] = this.level
		}
	},
	load: function () {
		var leveldata = levels[this.level]
		this.toids = []
		this.bloids = []
		this.bridges = []
		this.connections = {}
		var toids = leveldata.toids || []
		var stroids = leveldata.stroids || []
		var bloids = leveldata.bloids || []
		for (var j = 0 ; j < toids.length ; ++j) {
			var t = toids[j]
			this.toids.push(Toid(t[0], t[1], t[2]))
		}
		for (var j = 0 ; j < stroids.length ; ++j) {
			var t = stroids[j]
			this.toids.push(Stroid(t[0], t[1], t[2]))
		}
		for (var j = 0 ; j < bloids.length ; ++j) {
			var t = bloids[j]
			this.bloids.push(Bloid(t[0], t[1]))
		}
		this.money = leveldata.money
		this.complete = false
	},
	dump: function () {
		var leveldata = {
			toids: [],
			bloids: [],
			stroids: [],
			money: this.money
		}
		this.toids.forEach(function (toid) {
			if (toid instanceof Toid) {
				leveldata.toids.push([toid.x, toid.y, toid.needs])
			} else {
				leveldata.stroids.push([toid.x, toid.y, toid.res0])
			}
		})
		this.bloids.forEach(function (bloid) {
			leveldata.bloids.push([bloid.x, bloid.y])
		})
		console.log(JSON.stringify(leveldata))
	},
	thingat: function (pos) {
		var x = Math.round(pos[0]), y = Math.round(pos[1])
		for (var j = 0 ; j < this.toids.length ; ++j) {
			if (this.toids[j].x == x && this.toids[j].y == y) {
				return this.toids[j]
			}
		}
		return null
	},
	bloidat: function (pos) {
		var x = Math.round(pos[0]), y = Math.round(pos[1])
		for (var j = 0 ; j < this.bloids.length ; ++j) {
			if (this.bloids[j].x == x && this.bloids[j].y == y) {
				return j
			}
		}
		return null
	},
	removebloid: function (j) {
		if (this.money < settings.bloidcost) {
			audio.buzz()
			return
		}
		this.money -= settings.bloidcost
		this.bloids.splice(j, 1)
	},
	canbuild: function (obj0, x, y) {
		var x0 = Math.min(obj0.x, x), x1 = Math.max(obj0.x, x)
		var y0 = Math.min(obj0.y, y), y1 = Math.max(obj0.y, y)
		for (var j = 0 ; j < this.bloids.length ; ++j) {
			var b = this.bloids[j]
			if (x0 <= b.x && b.x <= x1 && y0 <= b.y && b.y <= y1) return false
		}
		return (x1 - x0) + (y1 - y0) <= this.money
	},
	addconnection: function (w1, w2) {
		var p = w1.x + "," + w1.y
		if (!this.connections[p]) this.connections[p] = []
		this.connections[p].push(w2)
	},
	reconcile: function (obj) {
		var p = obj.x + "," + obj.y, cs = this.connections[p]
		for (var j = 0 ; j < cs.length ; ++j) {
			var obj2 = cs[j]
			if (obj2.hookup(obj)) {
				this.reconcile(obj2)
			}
		}
	},
	joinworlds: function (w1, w2) {
		this.money -= Math.abs(w1.x - w2.x) + Math.abs(w1.y - w2.y)
		this.bridges.push(Bridge(w1, w2))
		this.addconnection(w1, w2)
		this.addconnection(w2, w1)
		this.reconcile(w1)
		this.reconcile(w2)
		if (!this.complete) {
			this.complete = this.toids.every(function (t) { return !t.needs || t.met })
		}
	},

	think: function (dt) {
		this.toids.forEach(function (toid) { toid.think(dt) })
		this.bloids.forEach(function (bloid) { bloid.think(dt) })
		this.bridges.forEach(function (bridge) { bridge.think(dt) })
		
	},
}

if (!(settings.savename in window.localStorage)) {
	window.localStorage[settings.savename] = 0
}


