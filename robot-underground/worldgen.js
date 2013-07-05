
/*
function makeTown():
	var map = new DungeonGrid(100), r
	;(new Room([0, 0], [5, 5])).addToDungeon(map)
	;(new Room([6, 0], [3, 5])).addToDungeon(map)
	;[[5,2], [5,3], [5,4], [9,3], [9,4], [10,3], [10,4]].forEach(function (p) {
		map.setCell(p, 1)
	}
	return map
}*/

function extractImgData(img) {
	var can = document.createElement("canvas")
	can.width = img.width ; can.height = img.height
	var con = can.getContext("2d")
	con.drawImage(img, 0, 0)
	return con.getImageData(0, 0, img.width, img.height).data
}

function loadFixedMap(name) {
	var map = new DungeonGrid(100)
	var img = UFX.resource.images[name]
	var data = extractImgData(img)
	for (var y = 0, j = 0 ; y < img.height ; ++y, j += 4) {
		for (var x = 0 ; x < img.width ; ++x) {
			if (data[j]) map.setCell([x, y], 1)
		}
	}
	return map
}
	
// TODO: makeDungeon2
// TODO: makeDungeon1



