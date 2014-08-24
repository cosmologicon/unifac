
var state = {
	init: function () {
		this.toids = [
			Stroid(0, 0, 0),
			Stroid(0, 2, 1),
			Toid(-3, 0, [0,1]),
		]
		this.bridges = [
		]
		this.connections = {}
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
	},

	think: function (dt) {
		this.toids.forEach(function (toid) { toid.think(dt) })
		this.bridges.forEach(function (bridge) { bridge.think(dt) })
		
	},
}



