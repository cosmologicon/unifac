var vista = {
	init: function () {  // must be called after gamestate.loadstage
		this.x = 0
		this.y = 0
		this.z = 0
		this.scale = 1.0
		this.backdrop = UFX.Tracer(
			function (con) {
				platforms.forEach(function (platform) {
					con.save() ; platform.draw(con) ; con.restore()
				})
			},
			[gamestate.xmin, gamestate.ymin, gamestate.xmax-gamestate.xmin, gamestate.ymax-gamestate.ymin]
		)
		this.backdrop.makeimg(1)
		this.backdrop.makeimg(0.5)
//			this.backdrop.makeimg(0.25)
		if (settings.allowzoom) {
			this.backdrop.makeimg(2)
			this.backdrop.makeimg(4)
		}
		this.clouds = document.createElement("canvas")
		this.clouds.width = settings.sx ; this.clouds.height = settings.sy
		UFX.draw(this.clouds.getContext("2d"), 
			"fs blue f0 [ z 4 3 drawimage0", UFX.texture.clouds({ shadex: 0, shadey: 1}),
			"alpha 0.5 fs white f0 ]")
	},
	scootch: function (dx, dy) {
		var f = 700 / Math.sqrt(this.scale)
		this.x += dx * f
		this.y += dy * f
		this.target = null
	},
	zoom: function (dz, mpos) {
		var oldscale = this.scale
		this.z = clip(this.z + dz, -20, (settings.allowzoom ? 20 : 0))
		this.scale = Math.exp(settings.zfactor * this.z)
		this.x += mpos[0] * (1/oldscale - 1/this.scale)
		this.y += mpos[1] * (1/oldscale - 1/this.scale)
		this.target = null
	},
	pan: function (mpos) {
		this.target = this.wpos(mpos)
		this.target[0] -= settings.vx0 / this.scale
		this.target[1] -= settings.vy0 / this.scale
		this.tx = this.x
		this.ty = this.y
	},
	wpos: function (pos) {
		return pos && [pos[0] / this.scale + this.x, pos[1] / this.scale + this.y]
	},
	think: function (dt) {
		if (this.target) {
			var f = 1 - Math.exp(-8 * dt), dx = this.target[0] - this.tx, dy = this.target[1] - this.ty
			if (Math.abs(dx) + Math.abs(dy) < 1) {
				this.target = null
				f = 1
			}
			this.tx += f * dx
			this.ty += f * dy
			this.x = this.tx
			this.y = this.ty
		}
		var xmin = gamestate.xmin, xmax = gamestate.xmax - settings.sx / this.scale
		var ymin = gamestate.ymin, ymax = gamestate.ymax - settings.sy / this.scale
		this.x = xmin < xmax ? clip(this.x, xmin, xmax) : (xmin + xmax) / 2
		this.y = ymin < ymax ? clip(this.y, ymin, ymax) : (ymin + ymax) / 2
	},
	drawclouds: function () {
		UFX.draw("drawimage0", this.clouds)
	},
	draw: function () {
		UFX.draw("z", this.scale, this.scale, "t", -this.x, -this.y)
		this.backdrop.draw(this.scale)
		
	},
}


