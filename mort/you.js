var WorldBound = {
	draw: function () {
		UFX.draw("t", this.x, -this.y)
	},
}

var LooksAhead = {
	lookingat: function () {
		return [this.x + (this.facingright ? 200 : -200), this.y + 60]
	},
}


var PerformCombos = {
	move: function (kdown, kpressed, kcombo) {
		for (var j = 0 ; j < kcombo.length ; ++j) {
			var combo = kcombo[j]
			if (this.facingright) {
				combo = combo.replace("right", "forward").replace("left", "back")
			} else {
				combo = combo.replace("left", "forward").replace("right", "back")
			}
			var feat = settings.featkeys[combo]
			if (!feat) continue
			if (this.grounded && feat === "turn") continue
		}
	},
}

var RunAlongGround = {
	move: function (kdown, kpressed, kcombo) {
		if (!this.grounded) return
		var dx = (kpressed.right || 0) - (kpressed.left || 0)
		if (dx) this.facingright = dx > 0
		this.vx = mechanics.runvx * dx
		
	},
	think: function (dt) {
		if (!this.grounded) retrun
		if (this.vx) {
			this.x += this.vx * dt
			this.frame = "run0"
		} else {
			this.frame = "stand"
		}
	},
}


var You = UFX.Thing()
             .addcomp(WorldBound)
             .addcomp(LooksAhead)
             .addcomp(PerformCombos)
             .addcomp(RunAlongGround)
             .addcomp(DrawSprite)

You.reset = function () {
	this.x = 100 ; this.y = -200
	this.facingright = true
	this.grounded = true
	this.think(0)
}

