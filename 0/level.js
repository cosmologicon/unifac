var levels = {}

levels[0] = {
	ppath: "b o 0 0 3.6",
	px: 0,
	py: 0,
	pr: 3.6,
	targetps: [
		[-8, -8],
		[8, -8],
		[-8, 8],
		[8, 8],
	],
	sisterps: [
		[-4, -12, 12, 4],
		[-12, -4, 4, 12],
		[4, -12, -12, 4],
		[12, -4, -4, 12],
	],
	daggerps: [
		[-12, -12],
		[12, -12],
		[-12, 12],
		[12, 12],
	],
	bitks: [
		[9, 5],
		[2, 11],
		[0, 3],
		[3, 4],
		[1, 2],
		[16, 6],
	],
	bitxs: [
		[1, 2, 5, 10],
		[5, 12, 3, 4],
		[14, 4, 0, 6],
		[11, 3, 2, 4],
		[9, 7, 0, 5],
		[14, 12, 5, 8],
	],
}

levels.north = {
	ppath: "[ r 3.1416 t 0 -1.8 ( m -4 0.2 q -3.9 1.7 -2.8 2.8 q -1.7 3.9 -0.2 4 l 0.2 4 q 1.7 3.9 2.8 2.8 q 3.9 1.7 4 0.2 ) ]",
	px: 0,
	py: -1.8,
	targetps: [
		[-5, -8],
		[5, -8],
		[10, 0],
		[5, 8],
		[-5, 8],
		[-10, 0],
	],
	bitks: [
		[0, 1, 0.7],
		[0, 2, 0.7],
		[0, 3, 0.7],
		[0, 4, 0.7],
		[0, 5, 0.7],
		[0, 6, 0.7],
		[1, 2],
	],
	bitxs: [
		[2, 4, 3, 5],
		[1, 5, 4, 6],
	],
}

levels.northwest = {
	ppath: "[ r 3.1416 t -1.8 -1.8 ( m 0.2 0.2 l 4 0.2 q 3.9 1.7 2.8 2.8 q 1.7 3.9 0.2 4 ) ]",
	px: -1.8,
	py: -1.8,
	targetps: [
		[-10, -10],
		[0, -10],
		[10, -10],
		[10, 0],
		[10, 10],
		[0, 10],
		[-10, 10],
		[-10, 0],
	],
	bitks: [
		[1, 2],
		[1, 8],
		[8, 7],
		[0, 3, 0.7],
		[0, 6, 0.7],
		[4, 6],
		[5, 6],
	],
	bitxs: [
		[1, 4, 2, 8],
		[2, 4, 3, 6],
		[0, 7, 5, 8],
	],
}

levels.northeast = {
	ppath: "[ r -1.5708 t -1.8 -1.8 ( m 0.2 0.2 l 4 0.2 q 3.9 1.7 2.8 2.8 q 1.7 3.9 0.2 4 ) ]",
	px: 1.8,
	py: -1.8,
	targetps: [
		[-9, -7],
		[-3, -7],
		[3, -7],
		[9, -7],
		[-9, 7],
		[-3, 7],
		[3, 7],
		[9, 7],
	],
	bitks: [
		[0, 8, 0.75],
		[0, 4],
		[2, 5, 0.75],
		[4, 7, 0.25],
	],
	bitxs: [
		[0, 1, 2, 6],
		[0, 5, 1, 6],
		[2, 8, 3, 5],
	],
}

levels.south = {
	ppath: "[ t 0 -1.8 ( m -4 0.2 q -3.9 1.7 -2.8 2.8 q -1.7 3.9 -0.2 4 l 0.2 4 q 1.7 3.9 2.8 2.8 q 3.9 1.7 4 0.2 ) ]",
	px: 0,
	py: 1.8,
	targetps: [
		[-10, -10],
		[-6, -6],
		[6, -6],
		[10, -10],
		[-10, 10],
		[-6, 6],
		[6, 6],
		[10, 10],
	],
	bitks: [
		[1, 4],
		[5, 8],
		[0, 2],
		[0, 3],
		[0, 6],
		[0, 7],
	],
	bitxs: [
		[1, 3, 2, 4],
		[1, 6, 2, 5],
		[3, 8, 4, 7],
		[5, 7, 6, 8],
	],
}


levels.southeast = {
	ppath: "[ t -1.8 -1.8 ( m 0.2 0.2 l 4 0.2 q 3.9 1.7 2.8 2.8 q 1.7 3.9 0.2 4 ) ]",
	px: 1.8,
	py: 1.8,
	targetps: [
		[-10, -10],
		[10, -10],
		[-10, 10],
		[10, 10],
	],
	daggerps: [
		[0, -10],
		[-10, 0],
		[10, 0],
		[0, 10],
	],
	bitks: [
		[1, 6],
		[1, 0],
		[5, 0],
		[2, 0],
		[2, 7],
		[6, 0],
		[7, 0],
		[3, 6],
		[6, 8],
		[0, 8],
		[7, 8],
		[4, 7],
	],
	bitxs: [
	],
}

levels.southwest = {
	ppath: "[ r 1.5708 t -1.8 -1.8 ( m 0.2 0.2 l 4 0.2 q 3.9 1.7 2.8 2.8 q 1.7 3.9 0.2 4 ) ]",
	px: -1.8,
	py: 1.8,
	targetps: [
	],
	sisterps: [
		[-10, -5, -5, -10],
		[5, -10, 10, -5],
		[-10, 5, -5, 10],
		[5, 10, 10, 5],
	],
	bitks: [
		[1, 4],
		[2, 6],
		[3, 7],
		[5, 8],
	],
	bitxs: [
		[2, 6, 5, 8],
		[5, 8, 3, 7],
	],
}

levels.west = {
	ppath: "[ r 1.5708 t 0 -1.8 ( m -4 0.2 q -3.9 1.7 -2.8 2.8 q -1.7 3.9 -0.2 4 l 0.2 4 q 1.7 3.9 2.8 2.8 q 3.9 1.7 4 0.2 ) ]",
	px: -1.8,
	py: 0,
	targetps: [
		[-24, 0],
		[-8, 0],
		[0, -10],
		[0, 10],
		[8, 0],
		[24, 0],
	],
	sisterps: [
		[-16, -10, -16, 10],
		[16, -10, 16, 10],
	],
	bitks: [
		[3, 9],
		[7, 8],
		[9, 10],
	],
	bitxs: [
		[1, 9, 2, 3],
		[7, 6, 3, 5],
		[8, 6, 5, 4],
		[10, 1, 2, 4],
		[0, 3, 1, 9],
		[0, 4, 1, 10],
	],
}


levels.east = {
	ppath: "[ r -1.5708 t 0 -1.8 ( m -4 0.2 q -3.9 1.7 -2.8 2.8 q -1.7 3.9 -0.2 4 l 0.2 4 q 1.7 3.9 2.8 2.8 q 3.9 1.7 4 0.2 ) ]",
	px: 1.8,
	py: 0,
	targetps: [
		[0, -12],
		[-8, -8],
		[8, -8],
		[-12, 0],
		[12, 0],
		[-8, 8],
		[8, 8],
		[0, 12],
	],
	daggerps: [
		[0, -8],
		[-8, 0],
		[8, 0],
		[0, 8],
	],
	bitks: [
		[1, 9],
		[8, 12],
		[4, 10],
		[11, 5],
		[2, 4],
		[5, 7],
		[9, 2],
		[12, 7],
	],
	bitxs: [
		[2, 6, 4, 8],
		[3, 7, 1, 5],
		[0, 1, 3, 4],
		[0, 8, 5, 6],
		[0, 4, 2, 8],
		[0, 5, 3, 8],
		[9, 4, 0, 2],
		[9, 5, 0, 3],
		[12, 4, 0, 6],
		[12, 5, 0, 7],
	],
}

