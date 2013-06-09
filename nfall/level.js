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


	test: {
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
		wheels.push({ x: wheel[0], y: wheel[1], A0: wheel[2] })
	})
	level.suns.forEach(function (sun) {
		suns.push(new Sun(wheels[sun[0]], sun[1], sun[2]))
	})
	level.moons.forEach(function (moon) {
		moons.push(new Moon(wheels[moon[0]], moon[1], moon[2]))
	})
}
		

