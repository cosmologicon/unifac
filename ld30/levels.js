var levels = {}

levels[0] = {
	texts: [
		[settings.gamename + "\nby Christopher Night", -2, -1.5],
	],
	toids: [
		[1, 0, [0]],
	],
	stroids: [
		[-1, 0, 0],
	],
	money: 2,
}

levels[1] = {
	texts: [
		["Connect worlds with the\nresources they require", -2.5, -2.5],
	],
	toids: [
		[1, 0, [0]],
		[2, 1, [1]],
		[0, -1, [2]],
	],
	stroids: [
		[-2, 0, 0],
		[-1, 1, 1],
		[0, 2, 2],
	],
	money: 9,
}


levels[2] = {
	texts: [
		["Connections can be\nused for more\nthan one resource.", -3, -2],
	],
	toids: [
		[2, 0, [0]],
		[-2, 1, [1]],
	],
	stroids: [
		[-2, 0, 0],
		[2, -1, 1],
	],
	money: 6,
}


levels[3] = {
	texts: [
		["Tap/click to\ndestroy ($4)", -1, 1],
	],
	bloids: [
		[-1, 0],
		[0, 0],
		[1, 0],
	],
	toids: [
		[2, 0, [0]],
	],
	stroids: [
		[-2, 0, 0],
	],
	money: 16,
}

levels[4] = {
	texts: [
		["Resources are limited", -3, -1],
	],
	toids: [
		[2, 0, [0]],
		[2, 1, [1]],
	],
	stroids: [
		[-2, 0, 0],
		[-2, 1, 1],
	],
	money: 6,
}

levels[5] = {
	texts: [
		["Drag to pan\npinch/scroll to zoom", -3, -1.5],
	],
	toids: [
		[0, 0, [0]],
	],
	stroids: [
		[1, 1, 0],
		[-12, 1],
		[-12, 12],
		[0, 12],
	],
	money: 48,
}


levels[6] = {
	texts: [
		["Good luck....", -2, -2],
	],
	"toids":[[0,-1,[0]]],
	"bloids":[],
	"stroids":[[1,0,null],[2,1,null],[3,2,null],[1,3,null],[4,2,null],[4,0,null],[3,-2,null],[2,-3,null],[4,-4,null],[0,-3,null],[1,-4,null],[1,-5,null],[-1,-5,null],[-2,-4,null],[-3,-2,null],[-5,-3,null],[-5,-1,null],[-7,-1,null],[-7,1,null],[-5,1,null],[-3,1,null],[-7,2,null],[-6,3,null],[-7,4,null],[-5,5,null],[-3,5,null],[-2,4,null],[-2,3,null],[-1,2,null],[-4,0,0],[-4,-4,null],[-6,-4],[-8,0],[-8,3]],
	"money": 29,
}

levels[7] = {
	texts: [
	],
	"toids":[[-4,1,[0]],[-3,2,[0]],[-2,3,[0]]],
	"bloids":[[0,0],[0,1],[1,-1],[1,-2],[0,-2],[2,0],[-2,1],[-1,2],[-1,3],[0,3],[4,1],[-4,0]],
	"stroids":[[2,-2,0],[3,-1,0],[4,0,0],[-1,-2,null],[0,-1,null],[1,0,null],[2,1,null],[3,2,null],[4,3,null],[-4,-2,null],[-3,-1,null],[-2,0,null],[-1,1,null],[0,2,null],[1,3,null]],
	"money":50,
}

levels[8] = {
	texts: [
	],
	"toids":[[-1,2,[0]],[1,0,[0]]],
	"bloids":[],
	"stroids":[[0,1,0],[2,1,null],[2,-1,null],[3,0,null],[4,-3,null],[3,-4,null],[0,-4,null],[0,-2,null],[-2,-2,null],[-2,-3,null],[2,-2,null],[4,2,null],[2,4,null],[0,5,null],[2,6,null],[-2,5,null],[-2,3,null],[1,3,null],[-3,-3,null],[-3,-1,null],[-4,-1,null],[-4,1,null],[-3,2,null],[-3,4,null],[-5,3,null],[-5,6,null]],
	"money":25,
}

levels[9] = {
	texts: [
		["This is the end.\nGood luck.", -3, 0],
	],
	"toids":[[1,2,[0]],[2,1,[1]],[3,0,[2]]],
	"bloids":[[-3,-10],[-4,-7],[-9,-3],[-6,-4],[-4,-1],[-8,0],[-7,1],[-6,4],[-5,3],[1,4],[1,5],[0,6],[-2,4],[0,9],[5,7],[5,4],[6,0],[7,-3],[1,-3],[-1,-5],[2,-6],[1,-8],[-3,-2],[0,1]],
	"stroids":[[-2,-1,0],[-1,-2,1],[0,-3,2],[-5,-2,null],[-7,-1,null],[-8,-2,null],[-10,-1,null],[-10,1,null],[-9,3,null],[-8,4,null],[-7,5,null],[-5,6,null],[-7,8,null],[-4,7,null],[-5,9,null],[-2,10,null],[0,11,null],[1,11,null],[0,7,null],[0,5,null],[1,3,null],[2,4,null],[4,6,null],[4,9,null],[7,7,null],[7,8,null],[5,10,null],[8,6,null],[8,5,null],[8,4,null],[7,3,null],[9,0,null],[10,-2,null],[10,-3,null],[8,-4,null],[9,-5,null],[7,-6,null],[6,-7,null],[5,-7,null],[8,-8,null],[4,-8,null],[3,-9,null],[6,-10,null],[1,-11,null],[-2,-10,null],[-3,-9,null],[-4,-10,null],[-4,-11,null],[-5,-8,null],[-7,-7,null],[-8,-8,null],[-9,-5,null],[-9,-4,null],[-3,-5,null],[-4,-5,null],[-1,-6,null],[5,-2,null]],
	"money":151,
}

levels[9] = {
	texts: [
		["This is the end.\nGood luck.", -3, 0],
	],
	"toids":[[1,2,[0]],[2,1,[1]],[3,0,[2]]],
	"bloids":[[-3,-10],[-4,-7],[-9,-3],[-6,-4],[-4,-1],[-8,0],[-7,1],[-6,4],[-5,3],[1,4],[1,5],[0,6],[-2,4],[0,9],[5,7],[5,4],[6,0],[7,-3],[1,-3],[-1,-5],[2,-6],[1,-8],[-3,-2],[0,1]],
	"stroids":[[-2,-1,0],[-1,-2,1],[0,-3,2],[-5,-2,null],[-7,-1,null],[-8,-2,null],[-10,-1,null],[-10,1,null],[-9,3,null],[-8,4,null],[-7,5,null],[-5,6,null],[-7,8,null],[-4,7,null],[-5,9,null],[-2,10,null],[0,11,null],[1,11,null],[0,7,null],[0,5,null],[1,3,null],[2,4,null],[4,6,null],[4,9,null],[7,7,null],[7,8,null],[5,10,null],[8,6,null],[8,5,null],[8,4,null],[7,3,null],[9,0,null],[10,-2,null],[10,-3,null],[8,-4,null],[9,-5,null],[7,-6,null],[6,-7,null],[5,-7,null],[8,-8,null],[4,-8,null],[3,-9,null],[6,-10,null],[1,-11,null],[-2,-10,null],[-3,-9,null],[-4,-10,null],[-4,-11,null],[-5,-8,null],[-7,-7,null],[-8,-8,null],[-9,-5,null],[-9,-4,null],[-3,-5,null],[-4,-5,null],[-1,-6,null],[5,-2,null]],
	"money":151,
}

levels[10] = {
	texts: [],
	"toids":[[20,1,[0]]],
	"bloids":[],
	"stroids":[[-16,-4,null],[-15,-4,null],[-14,-4,null],[-13,-4,null],[-12,-4,null],[-14,-3,null],[-14,-2,null],[-14,-1,null],[-14,0,null],[-14,1,null],[-10,-4,null],[-10,-3,null],[-10,-2,null],[-10,-1,null],[-10,0,null],[-10,1,null],[-9,-2,null],[-8,-1,null],[-8,0,null],[-8,1,null],[-6,0,null],[-5,1,null],[-4,1,null],[-4,0,null],[-4,-1,null],[-6,-1,null],[-5,-2,null],[-4,-2,null],[-2,-2,null],[-2,-1,null],[-2,0,null],[-2,1,null],[-1,-2,null],[0,-1,null],[0,0,null],[0,1,null],[2,1,null],[2,0,null],[2,-1,null],[2,-2,null],[2,-3,null],[2,-4,null],[3,-1,null],[4,-2,null],[4,0,null],[4,1,null],[8,-2,null],[8,-1,null],[8,0,null],[9,1,null],[10,1,null],[10,0,null],[10,-1,null],[10,-2,null],[10,2,null],[9,3,null],[8,3,null],[12,-1,null],[12,0,null],[13,1,null],[14,0,null],[14,-1,null],[13,-2,null],[16,-2,null],[16,-1,null],[16,0,null],[17,1,null],[18,1,null],[18,0,null],[18,-1,null],[18,-2,null],[20,-1,null],[20,-2,null],[20,-3,null],[20,-3,null],[20,-4,null]],
	"money":10000,
}

levels.editor = {
	texts: [],
	toids: [[999, 999, [0]]],
	money: 1000,
}



