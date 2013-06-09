var leveldata = {
	train0: {
		planets: [
			[0, 0, 24, [[0, 18]]]
		],
		wheels: [
			[0, 0, 0],
		],
		suns: [
			[0, 0, 120],
		],
		moons: [
		],
	},
	train1: {
		planets: [
			[0, 0, 24, [[0.6, 18]]]
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[0, 0, 120],
			[1, 0.5, 200],
			[1, -0.5, 200],
		],
		moons: [
		],
	},
	train2: {
		planets: [
			[0, 0, 24, [[0.6, 18], [0, 18]]]
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[1, 0.5, 200],
			[1, -0.5, 200],
		],
		moons: [
			[0, 0, 150],
		],
	},
	offset: {
		planets: [
			[0, 0, 24, [[0, 18]]]
		],
		wheels: [
			[30, 0, 0],
			[-30, 0, 0],
		],
		suns: [
			[1, 0, 200],
			[1, tau/3, 200],
			[1, tau/3*2, 200],
		],
		moons: [
			[0, 0, 100],
			[0, tau/4, 100],
			[0, tau/2, 100],
			[0, tau/4*3, 100],
		],
	},
	crossbeam: {
		planets: [
			[0, 0, 24, [[0, 18], [tau/2, 18]]]
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[0, 1.5, 200],
			[1, -1.5, 200],
		],
		moons: [
			[0, 3.5, 120],
			[1, -3.5, 120],
		],
	},


	doubletrip: {
		planets: [
			[-200, 0, 24, [[0, 18], [tau/2, 18]]]
		],
		wheels: [
			[0, 0, 0],
			[200, 0, 0],
		],
		suns: [
			[1, 0, 50],
			[1, tau/3, 60],
			[1, -tau/3, 70],
		],
		moons: [
			[0, 0, 40],
			[0, tau/3, 50],
			[0, -tau/3, 60],
		],
	},

	sevenmoons: {
		planets: [
			[200, 0, 22, [[0, 24], [tau/2, 24]]]
		],
		wheels: [
			[-160, 0, 0],
			[-160, 0, 0],
		],
		suns: [
			[1, 0, 70],
			[1, tau/2, 70],
		],
		moons: [
			[0, 0, 100],
			[0, tau/7, 100],
			[0, 2*tau/7, 100],
			[0, 3*tau/7, 100],
			[0, 4*tau/7, 100],
			[0, 5*tau/7, 100],
			[0, 6*tau/7, 100],
		],
	},


	twoworlds: {
		planets: [
			[200, 0, 22, [[tau/2, 22]]],
			[-200, 0, 22, [[tau/6, 22]]],
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[1, 0, 30],
		],
		moons: [
			[0, 0, 69],
			[0, tau/3, 69],
			[0, -tau/3, 69],
		],
	},
	layercake: {
		planets: [
			[0, 0, 22, [[0, 22]]],
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[1, 0, 120],
			[1, 2, 120],
			[2, 0, 160],
			[2, 3, 160],
			[3, 0, 200],
			[3, 4, 200],
		],
		moons: [
			[0, 1.5, 80],
			[4, -1.5, 80],
		],
	},
	cornered: {
		planets: [
			[0, 0, 22, [[tau/4, 22]]],
			[0, 0, 22, [[-tau/4, 22]]],
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[0, -1, 140],
			[1, 0, 155],
			[2, 1, 170],
		],
		moons: [
			[0, -2, 80],
			[1, 2, 95],
			[2, -1, 110],
		],
	},
	pentacle: {
		planets: [
			[0, 0, 22, [[0, 22], [tau/5, 22], [tau/5*2, 22], [tau/5*3, 22], [-tau/5, 22]]],
		],
		wheels: [
			[40, 0, 0],
			[-40, 0, 0],
			[-40, 0, 0],
		],
		suns: [
			[0, 0, 260],
			[0, tau/2, 260],
		],
		moons: [
			[1, 0, 100],
			[1, tau/2, 100],
			[2, 0, 130],
			[2, tau/2, 130],
		],
	},
	couple: {
		planets: [
			[-70, 0, 22, [[0.4, 22], [tau/2-0.4, 22]]],
			[70, 0, 22, [[tau/2+0.4, 22], [-0.4, 22]]],
		],
		wheels: [
			[0, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[0, 0, 240],
			[0, tau/2, 240],
		],
		moons: [
			[1, 0, 160],
			[1, tau/2, 160],
		],
	},
	awash: {
		planets: [
			[0, 0, 22, [[0, 16]]],
		],
		wheels: [
			[0, 0, 0],
			[50, 0, 0],
			[-50, 0, 0],
			[0, 0, 0],
		],
		suns: [
			[0, 0, 240],
			[0, 1*tau/7, 240],
			[0, 2*tau/7, 240],
			[0, 3*tau/7, 240],
			[0, 4*tau/7, 240],
			[0, 5*tau/7, 240],
			[0, 6*tau/7, 240],
		],
		moons: [
			[1, 0, 110],
			[1, tau/4, 110],
			[1, tau/2, 110],
			[1, tau/4*3, 110],
			[2, 0, 120],
			[2, tau/4, 120],
			[2, tau/2, 120],
			[2, tau/4*3, 120],
			[3, tau/2, 210],
		],
	},
	0: {
		planets: [
			[0, 0, 22, [[0, 10]]]
		],
		wheels: [
			[60, 0, 0],
			[-60, 0, 0],
		],
		suns: [
			[0, 0, 100],
		],
		moons: [
			[1, 0, 100],
		],
	},
}

function loadlevel(lname) {
	var level = leveldata[lname]
	planets = []
	wheels = []
	suns = []
	moons = []
	level.planets.forEach(function (planet) {
		planets.push(new Planet(planet[0], planet[1], planet[2], planet[3]))
	})
	level.wheels.forEach(function (wheel) {
		wheels.push(new Wheel(wheel[0], wheel[1], wheel[2]))
	})
	level.moons.forEach(function (moon) {
		moons.push(new Moon(wheels[moon[0]], moon[1], moon[2]))
	})
	level.suns.forEach(function (sun) {
		suns.push(new Sun(wheels[sun[0]], sun[1], sun[2]))
	})
}
		
function getlevels() {
	var r = [
//		["test", "test"],
		["Lurff", "train0"],
	]
	if (beaten.train0) r = r.concat([
		["Trisol", "train1"],
		["Eclyn", "train2"],
	])
	if (beaten.train1 && beaten.train2) r = r.concat([
		["Mesel", "crossbeam"],
		["Pognon", "offset"],
		["Solena", "twoworlds"],
		["Wiptar", "layercake"],
		["Gorps", "couple"],
		["Nelda", "cornered"],
		["Tyz", "pentacle"],
		["Ofod", "awash"],
		["Fulcra", "doubletrip"],
	])
	return r
}




