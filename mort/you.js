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
			if (!this.grounded) gamestate.incrementcombo()
			if (feat === "turn") this.facingright = !this.facingright
			this.vx = mechanics.feat[feat].vx * (this.facingright ? 1 : -1)
			this.vy = mechanics.feat[feat].vy
			this.feattime = mechanics.feat[feat].time
			// TODO: play a joyful noise
		}
	},
	think: function (dt) {
		if (!this.grounded) {
			this.x += this.vx * dt
			this.y += this.vy * dt - 0.5 * mechanics.g * dt * dt
			// TODO: no falling whilst nabbing
			this.vy -= mechanics.g * dt
			
			if (this.y <= 0) {
				this.y = 0
				this.vy = 0
				this.grounded = true
				this.currentfeat = null
				var r = gamestate.resetcounts()
			}
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
		if (!this.grounded) return
		if (this.vx) {
			this.x += this.vx * dt
			this.frame = "run0"
		} else {
			this.frame = "stand"
		}
	},
}

var BoxConstrain = {
	init: function (xborder, yborder) {
		this.xborder = xborder || 0
		this.yborder = yborder || 0
	},
	think: function (dt) {
		this.x = clip(this.x, this.xborder, vista.vx - this.xborder)
		this.y = clip(this.y, this.yborder, vista.vy - this.yborder)
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

