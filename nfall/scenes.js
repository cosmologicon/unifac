
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
		
		this.selected = null
	},
	
	thinkargs: function (dt) {
		var clicked = false
		var mstate = UFX.mouse.active && UFX.mouse.state()
		return [dt, mstate]
	},
	think: function (dt, mstate) {
//		suns[0].wheel.A0 += dt
//		moons[0].wheel.A0 += dt * 0.789

		if (mstate && mstate.pos) {
			var mx = mstate.pos[0] - 0.5 * settings.sx
			var my = mstate.pos[1] - 0.5 * settings.sy
			if (mstate.left.down) {
				var selected = camera
				suns.concat(moons).forEach(function (obj) {
					var p = camera.worldtoscreen([obj.x, obj.y])
					var dx = mx - p[0], dy = my - p[1]
					if (dx * dx + dy * dy < settings.clickr * settings.clickr) {
						selected = obj
					}
				})
				this.selected = selected
				console.log(selected)
			}
			if (mstate.left.up) {
				this.selected = null
			}
			
			if (this.selected && mstate.left.drag) {
				if (this.selected === camera) {
					camera.pan(mstate.left.drag.dx, mstate.left.drag.dy)
				} else {
					var dx = mx - this.selected.wheel.x, dy = my - this.selected.wheel.y
					this.selected.wheel.A0 = Math.atan2(dx, -dy) - this.selected.A
				}
			}
		}


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



