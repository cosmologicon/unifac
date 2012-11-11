var LooksAhead = {
	lookingat: function () {
		return [this.x + (this.facingright ? 200 : -200), this.y + 60]
	},
}

var PerformCombos = {
	init: function () {
		this.ctime = 0
	},
	move: function (kdown, kpressed, kcombo) {
		for (var combo in kcombo) {
			if (this.facingright) {
				combo = combo.replace("right", "forward").replace("left", "back")
			} else {
				combo = combo.replace("left", "forward").replace("right", "back")
			}
			var feat = mechanics.featlookup[combo]
			console.log(combo, feat)
			if (!feat) continue
			if (this.grounded && feat === "turn") continue  // can't perform a turn from the ground
			if (!gamestate.attempt(feat)) continue
			this.currentfeat = feat
			if (feat !== "nab") this.grounded = false
			if (this.grounded) gamestate.resetcounts()
			else gamestate.incrementcombo()
			if (feat === "turn") this.facingright = !this.facingright
			this.vx = mechanics.feat[feat].vx * (this.facingright ? 1 : -1)
			this.vy = mechanics.feat[feat].vy
			this.feattime = mechanics.feat[feat].time
			this.ctime = 0
			// TODO: play a joyful noise
		}
	},
	think: function (dt) {
		this.ctime += dt
		if (!this.grounded) {
			this.x += this.vx * dt
			var g = this.currentfeat == "nab" && this.ctime < mechanics.nabtime ? 0 : mechanics.g
			this.y += this.vy * dt - 0.5 * g * dt * dt
			this.vy -= g * dt
			
			if (this.y <= 0) {
				this.y = 0
				this.vy = 0
				this.grounded = true
				this.currentfeat = null
				var r = gamestate.resetcounts()
			}
			switch (this.currentfeat) {
				case "turn": case "leap":
					this.frame = "run2" ; break
				case "nab":
					var n = Math.floor(4 * this.ctime / mechanics.nabtime)
					this.frame = n < 4 ? "skynab" + n : "run2" ; break
				case "twirl":
					this.frame = "twirl" + (Math.floor(16 * this.ctime) % 4) ; break
				case "bound": case "dart": case "roll":
					this.frame = this.currentfeat ; break
			}
		}
	},
	draw: function () {
		if (this.currentfeat == "roll" && this.frame == "roll") {
			UFX.draw("t 0 -50 r", 18 * this.ctime * (this.facingright ? 1 : -1), "t 0 50")
		}
	}
}

var RunAlongGround = {
	move: function (kdown, kpressed, kcombo) {
		if (!this.grounded) return
		var dx = (kpressed.right || 0) - (kpressed.left || 0)
		if (dx) this.facingright = dx > 0
		this.vx = mechanics.runvx * dx
	},
	think: function (dt) {
		if (!this.grounded) return
		if (this.currentfeat == "nab") {
			this.vx = 0
			var n = Math.floor(4 * this.ctime / mechanics.nabtime)
			if (n >= 4) {
				this.currentfeat = null
			} else {
				this.frame = "nab" + n
			}
		} else if (this.vx) {
			this.x += this.vx * dt
			this.frame = "run" + [0, 1, 2, 1][Math.floor(10 * this.ctime) % 4]
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
             .addcomp(BoxConstrain, 30, 0)
             .addcomp(DrawSprite)

You.reset = function () {
	this.x = 100 ; this.y = 0
	this.facingright = true
	this.grounded = true
	this.currentfeat = null
	this.think(0)
}

