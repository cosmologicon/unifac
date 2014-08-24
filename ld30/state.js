
var state = {
	init: function () {
		this.level = 0
	},
	load: function () {
		var leveldata = levels[this.level]
		this.toids = []
		this.bridges = []
		this.connections = {}
		for (var j = 0 ; j < leveldata.toids.length ; ++j) {
			var t = leveldata.toids[j]
			this.toids.push(Toid(t[0], t[1], t[2]))
		}
		for (var j = 0 ; j < leveldata.stroids.length ; ++j) {
			var t = leveldata.stroids[j]
			this.toids.push(Stroid(t[0], t[1], t[2]))
		}
		this.complete = false
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
		this.bridges.forEach(function (bridge) { bridge.think(dt) })
		
	},
}



