
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

// TODO: BlastDoors
function makeScenery(type, mission, pos, bearing, open) {
	if (type in scenerydata) {
		var data = scenerydata[type], radius = data[0], name = data[1] || type, solid = true
		return new Entity(mission, pos, radius, bearing || 0, solid, name)
	} else {
		throw "Unrecognized scenery type " + type
	}
}

