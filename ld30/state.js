
var state = {
	init: function () {
		this.toids = [
			Toid(0, 0),
			Toid(2, 1),
			Toid(2, -1),
		]
		this.bridges = [
			Bridge(this.toids[1], this.toids[2]),
		]
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

	think: function (dt) {
	},
}



