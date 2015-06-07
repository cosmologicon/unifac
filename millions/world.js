var world = {
	AU: 5000,
	ncities: 24,
	init: function () {
		this.theta = 0
		this.omega = 0
		
		this.beta = 0
		this.zeta = 0.4


		this.pops = []
		this.citythetas = []
		this.cityrects = []
		this.cityrates = []
		for (var j = 0 ; j < this.ncities ; ++j) {
			this.pops.push(0)
			this.citythetas.push(j * tau / this.ncities)
			this.cityrects.push([])
			this.cityrates.push(5 + j)
		}
		UFX.random.shuffle(this.cityrates)
		
		this.incoming = []
		this.splosions = []
		this.laserlock = 0
		this.atime = 0
		this.arate = 2
		
		this.ending = 0
	},
	think: function (dt, keys) {
		var domega = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
		this.omega += 8 * domega * dt * (domega * this.omega < 0 ? 3 : 1)
		if (!domega) this.omega *= Math.exp(-2 * dt)
		this.theta += this.omega * dt

		this.laserlock += dt * (0.7 - 0.5 * Math.abs(this.omega))
		this.laserlock = clamp(this.laserlock, 0, 1)
		
		this.beta += this.zeta * dt
		this.orbitpos = [Math.sin(this.beta) * this.AU, Math.cos(this.beta) * this.AU]
		
		for (var jcity = 0 ; jcity < this.ncities ; ++jcity) {
			if (UFX.random() * 10 * this.ncities < dt * this.cityrates[jcity]) {
				this.pops[jcity] += UFX.random.rand(20, 400)
				var w = UFX.random(5, 12), h = Math.sqrt(this.pops[jcity])
				var x0 = UFX.random(-(14-w)/2, (14-w)/2)
				var spec = building.getspec(x0, w, h)
				this.cityrects[jcity].unshift(spec)
			}
		}
		
		this.atime += dt
		if (this.atime > this.arate + 0.6) {
			this.incoming.push(Asteroid(UFX.random(tau), 4))
			this.arate *= 0.95
			this.atime = 0
		}
		if (this.laserlock >= 1 && this.incoming.length) {
			UFX.resource.sounds.laser.play()
			for (var j = 0 ; j < this.incoming.length ; ++j) {
				var a = this.incoming[j]
				this.splosions.push(Smoke(a.theta, a.x, a.y))
			}
			this.incoming = []
			this.laserlock = 0
		}


		this.R = Math.min(sx, sy) / 3
		
		function think(obj) { obj.think(dt) }
		this.incoming.forEach(think)
		this.splosions.forEach(think)
		
		function isalive(obj) { return obj.alive }
		this.incoming = this.incoming.filter(isalive)
		this.splosions = this.splosions.filter(isalive)

		if (this.ending) {
			this.ending -= dt
			if (this.ending <= 0) {
				UFX.scene.pop()
				UFX.resource.sounds.music.pause()
			}
		} else if (this.totalpop() > 20000) {
			this.ending = 1
		}
	},

	drawstars: function () {
	
	},
	draw: function () {
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		for (var j = 0 ; j < this.ncities ; ++j) {
			var p = this.pops[j]
			if (!p) continue
			UFX.draw("[ r", this.theta + this.citythetas[j], "t", 0, 0.9, "z", 0.02, 0.02)
			for (var k = 0 ; k  < this.cityrects[j].length ; ++k) {
				UFX.draw(this.cityrects[j][k])
			}
//			this.cityrects[j].forEach(UFX.draw)
			UFX.draw("]")
		}
		this.incoming.forEach(draw)
		this.splosions.forEach(draw)

		UFX.draw("font 20px~'Archivo~Black' textalign center textbaseline middle")
		this.incoming.forEach(function (obj) {
			var theta = obj.theta, S = Math.sin(theta), C = Math.cos(theta)
			var t = (obj.height * 10).toFixed(0)
			UFX.draw("[ t", 0.8 * -S, 0.8 * C)
			var color = obj.height > 3 ? "#77F" : obj.height > 2 ? "#AA7" : obj.height > 1 ? "#FA7" : "#F77"
//			UFX.draw("b o 0 0 0.08 lw 0.05 ss", color, "s")
			UFX.draw("[ z 0.05 0.05 r", theta, "( m -2 1.5 l 0 3 l 2 1.5 ) fs", color, "f lw 0.2 ss black s ]")
			UFX.draw("z", 0.007, 0.01)
			UFX.draw("fs", color, "ss black lw 3 st0", t, "ft0", t, "]")
		})
		
	},
	impact: function (obj) {
		UFX.resource.sounds.boom.play()
		var theta = obj.theta - this.theta
		var j = Math.round(theta / tau * this.ncities)
		j = (j % this.ncities + this.ncities) % this.ncities
		this.pops[j] = 0
		this.cityrects[j] = []
		this.cityrates[j] = Math.max.apply(Math, this.cityrates) + 1
	},

	totalpop: function () {
		return this.pops.reduce(function (a, b) { return a + b } )
	},

}


