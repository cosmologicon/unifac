

function loadFixedMap(name) {
	var map = new DungeonGrid(100)
	var img = mapdata[name]
	for (var y = img.h-1, j = 0 ; y >= 0 ; --y) {
		for (var x = 0 ; x < img.w ; ++x, ++j) {
			if (img.data[j]) map.setCell([x, y], 1)
		}
	}
	return map
}

// from content.town
function makeTown(m) {
	m.map = loadFixedMap("dollis")
	m.style = "town"
	;[
		["Fountain", [1000, 1200]],
		["FountainWater", [1000, 1200]],
		["Barrel", [20, 986], -25],
		["Barrel", [20, 946], -69],
		["Crates", [53, 1050], -44],
		["Bush", [1279,1432], -167], 
		["Bush", [1235,1475], -33], 
		["Bush", [1277,1476], -133], 
		["Tree1", [1204,996], 0], 
		["Tree2", [794,1396], 0], 
		["Column", [726,325], -125], 
		["Column", [468,325], 0], 
		["Barrel", [177,831], -127], 
		["Barrel", [154,799], 121], 
		["Barrel", [182,767], 9], 
		["Crates", [1346,2048], 157], 
		["Barrel", [1520,2080], -116], 
		["Barrel", [1548,2045], 37], 
		["Barrel", [1581,2046], 154], 
		["Barrel", [1552,2077], 40], 
		["Tree1", [1247,348], 178], 
		["Bush", [963,374], -26], 
		["Bush", [921,376], 69], 
	].forEach(m.addScenery.apply.bind(m.addScenery, m))
}


function makeDungeon2(args) {
	var map = makeDungeon1(args)
	var dirs = ["top", "bottom", "left", "right"]
	var Dirs = ["Top", "Bottom", "Left", "Right"]
	var dx = [0, 0, -1, 1], dy = [1, -1, 0, 0]
	for (var j = 0 ; j < 4 ; ++j) {
		var dir = dirs[j], Dir = Dirs[j], opDir = Dirs[j^1]
		if (!args[dir]) continue
		var my = map["get"+Dir+"Cell"]()
		var othermap = loadFixedMap(args[dir])
		var o = othermap["get"+opDir+"Cell"]()
		var xoffs = my[0] - o[0] + dx[j], yoffs = my[1] - o[1] + dy[j]
		othermap.pasteInto(map, [xoffs, yoffs])
		map[dir+"_offs"] = [xoffs * map.csize, yoffs * map.csize]
	}
	return map
}

function makeDungeon1(args) {
	args = args || {}
	var startpos = args.startpos || [100, 70]
	var minroomsize = args.minroomsize || 2
	var maxroomsize = args.maxroomsize || 5
	var maxrooms = args.maxrooms || 60
	var mindist = args.mindist || 6
	var maxdist = args.maxdist || 11
	var extratunnels = "extratunnels" in args ? args.extratunnels : true

	if (DEBUG.minidungeons) maxrooms = Math.ceil(maxrooms / 20)

	var map = new DungeonGrid(100)
	var r = new Room(startpos, [maxroomsize, maxroomsize])
	r.addToDungeon(map)

	while (map.rooms.length < maxrooms) {
		var start_room = UFX.random.choice(map.rooms)
		var newroomsize = [
			UFX.random.rand(minroomsize, maxroomsize + 1),
			UFX.random.rand(minroomsize, maxroomsize + 1)
		]
		var xoffs = -Math.floor(newroomsize[0] / 2)
		var yoffs = -Math.floor(newroomsize[1] / 2)
		var dir = UFX.random.rand(4), xv = [0, 0, -1, 1][dir], yv = [-1, 1, 0, 0][dir]
		var buffer = Math.floor(newroomsize[dir < 2 ? 1 : 0] / 2)
		var start_dig = start_room.pos.slice()
		var sx = start_room.size[0], sy = start_room.size[1]
		switch (dir) {
			case 0: start_dig[0] += UFX.random.rand(sx) ; start_dig[1] += -1 ; break
			case 1: start_dig[0] += UFX.random.rand(sx) ; start_dig[1] += sy ; break
			case 2: start_dig[0] += -1 ; start_dig[1] += UFX.random.rand(sy) ; break
			case 3: start_dig[0] += sx ; start_dig[1] += UFX.random.rand(sy) ; break
		}
		var okdist = null, wbox = [newroomsize[0]+2, newroomsize[1]+2]
		for (var d = mindist + buffer ; d < maxdist + buffer ; ++d) {
			var px = start_dig[0] + xv * d + xoffs, py = start_dig[1] + yv * d + yoffs
			if (map.isClear([px-1, py-1], wbox)) {
				okdist = d
				r = new Room([px, py], newroomsize)
				r.addToDungeon(map)
				break
			}
		}
		for (var ddig = 0 ; okdist && ddig < okdist ; ++ddig) {
			map.setCell([start_dig[0] + ddig * xv, start_dig[1] + ddig * yv], 1)
		}
		if (extratunnels && !okdist) {
			// TODO: looks like there's a bug here (ddig2 never used), so leave it for now
			var found = false
			for (ddig = mindist ; ddig < maxdist ; ++ddig) {
			}
		}
	}
	map.cellkeys = Object.keys(map.cells)
	return map
}







