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
}

levels[1] = {
	texts: [
		["Connect colony worlds with the\nresources they require", -2, -1.5],
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
}


levels[2] = {
	texts: [
		["Connections can be used for more than one resource.", -2, -1.5],
	],
	toids: [
		[2, 0, [0]],
		[-2, 1, [1]],
	],
	stroids: [
		[-2, 0, 0],
		[2, -1, 1],
	],
}


levels[3] = {
	texts: [
		["Resources are limited", -3, -3],
	],
	toids: [
		[2, 0, [0]],
		[2, 1, [1]],
	],
	stroids: [
		[-2, 0, 0],
		[-2, 1, 1],
	],
}


levels[4] = {
	texts: [
		["Tap to destroy", -3, -3],
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
}


