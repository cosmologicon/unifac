
UFX.scenes.menu = {
	start: function () {
		planets.push(new Planet(22, [[0, 10]]))
		var wheel = { x: 60, y: 0, A0: 0 }
		suns.push(new Sun(wheel, 20, 100))
		suns.push(new Sun(wheel, 20 + tau/2, 100))
//		suns.push(new Sun(wheel, 20 + tau/4, 100))
		var wheel = { x: -60, y: 0, A0: 1 }
		moons.push(new Moon(wheel, 20, 100))
		moons.push(new Moon(wheel, 20 + tau/3, 100))
		moons.push(new Moon(wheel, 20 - tau/3, 100))
	},

	think: function (dt) {
		suns[0].wheel.A0 += dt
		moons[0].wheel.A0 += dt * 0.789

		function think(obj) { obj.think(dt) }
		planets.forEach(think)
		moons.forEach(think)
		suns.forEach(think)
		
		planets.forEach(function (planet) { planet.stowers() })
	},
	
	draw: function () {
		UFX.draw("fs black f0")
		
		context.save()
		context.translate(0.5 * canvas.width, 0.5 * canvas.height)
		camera.draw()
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		moons.forEach(draw)
		planets.forEach(draw)
		suns.forEach(function (sun) { sun.drawshade() })
		suns.forEach(draw)
		context.restore()
	},

}



