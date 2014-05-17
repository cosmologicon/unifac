
// radius, name
var scenerydata = {
	Fountain: [150],
	FountainWater: [100, "Fountain Water"],
	Barrel: [15],
	Bush: [20],
	Tree1: [45, "Tree 1"],
	Tree2: [45, "Tree 2"],
	Crates: [45],
	Column: [30],
	Rock: [15],
	Campfire: [35],
}

function BlastDoor(mission, pos, bearing, open) {
	var solid = !open
	Entity.call(this, mission, pos, 50, bearing || 0, solid, "Blast Door")
	this.targetpos = this.currentpos = solid ? 0 : 15
	this.anim_state = Math.floor(this.currentpos / 5)
}
BlastDoor.prototype = extend(Entity.prototype, {
	open: function () {
		this.targetpos = 15
		this.solid = false
	},
	close: function () {
		this.targetpos = 0
		this.solid = true
	},
	tick: function () {
		if (this.currentpos < this.targetpos) ++this.currentpos
		else if (this.currentpos > this.targetpos) --this.currentpos
		this.anim_state = Math.floor(this.currentpos / 5)
	},
	describe: function () {
		return this.solid ? "Blast Door" : ""
	},
})

function makeScenery(type, mission, pos, bearing, open) {
	if (type in scenerydata) {
		var data = scenerydata[type], radius = data[0], name = data[1] || type, solid = true
		return new Entity(mission, pos, radius, bearing || 0, solid, name)
	} else if (type == "BlastDoor") {
		return new BlastDoor(mission, pos, bearing, open)
	} else {
		throw "Unrecognized scenery type " + type
	}
}

