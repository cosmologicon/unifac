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
		for (var j = 0 ; j < this.ncities ; ++j) {
			this.pops.push(0)
			this.citythetas.push(j * tau / this.ncities)
		}
		
		this.incoming = []
		this.splosions = []
	},
	think: function (dt, keys) {
		var domega = (keys.right ? 1 : 0) - (keys.left ? 1 : 0)
		this.omega += 8 * domega * dt * (domega * this.omega < 0 ? 3 : 1)
		if (!domega) this.omega *= Math.exp(-2 * dt)
		this.theta += this.omega * dt
		
		this.beta += this.zeta * dt
		this.orbitpos = [Math.sin(this.beta) * this.AU, Math.cos(this.beta) * this.AU]
		
		if (UFX.random() * 0.1 < dt) {
			this.pops[UFX.random.rand(this.ncities)] += UFX.random.rand(1, 50)
		}
		
		if (UFX.random() < dt) {
			this.incoming.push(Asteroid(UFX.random(tau), 1))
		}

		this.R = Math.min(sx, sy) / 3
		
		function think(obj) { obj.think(dt) }
		this.incoming.forEach(think)
		this.splosions.forEach(think)
		
		function isalive(obj) { return obj.alive }
		this.incoming = this.incoming.filter(isalive)
		this.splosions = this.splosions.filter(isalive)
	},

	drawstars: function () {
	
	},
	draw: function () {
		function draw(obj) { context.save() ; obj.draw() ; context.restore() }
		for (var j = 0 ; j < this.ncities ; ++j) {
			var p = this.pops[j]
			if (!p) continue
			UFX.draw("[ r", this.theta + this.citythetas[j], "t", 0, 0.9, "z", 0.02, 0.02)
			UFX.draw("fs green fillrect", -5, 0, 10, Math.sqrt(p))
			UFX.draw("]")
		}
		this.incoming.forEach(draw)
		this.splosions.forEach(draw)

		UFX.draw("font 20px~bold~'sans-serif' textalign center textbaseline middle")
		this.incoming.forEach(function (obj) {
			var theta = obj.theta, S = Math.sin(theta), C = Math.cos(theta)
			var t = obj.height.toFixed(1)
			UFX.draw("[ t", 0.65 * -S, 0.65 * C)
			UFX.draw("b o 0 0 0.08 lw 0.05 ss red s")
			UFX.draw("[ z 0.05 0.05 r", theta, "( m -2 3.5 l 0 5 l 2 3.5 ) fs red f ]")
			UFX.draw("z", 0.007, 0.01)
			UFX.draw("fs orange ss black lw 4 st0", t, "ft0", t, "]")
		})
	},
	impact: function (obj) {
		var theta = obj.theta - this.theta
		var j = Math.round(theta / tau * this.ncities)
		j = (j % this.ncities + this.ncities) % this.ncities
		this.pops[j] = 0
	},

	totalpop: function () {
		return this.pops.reduce(function (a, b) { return a + b } )
	},

}


