var vista = {
	init: function () {
		this.x = 0
		this.y = 0
		this.z = 0
		this.scale = 1.0
	},
	scootch: function (dx, dy) {
		var f = 700 / Math.sqrt(this.scale)
		this.x += dx * f
		this.y += dy * f
	},
	zoom: function (dz, mpos) {
		console.log(this.wpos(mpos))
		var oldscale = this.scale
		this.z = clip(this.z + dz, -20, 20)
		this.scale = Math.exp(settings.zfactor * this.z)
		console.log(this.x, this.y, mpos, this.scale, oldscale)
		this.x += mpos[0] * (1/oldscale - 1/this.scale)
		this.y += mpos[1] * (1/oldscale - 1/this.scale)
		console.log(this.x, this.y, mpos)
		console.log(this.wpos(mpos))
	},
	wpos: function (pos) {
		return pos && [pos[0] / this.scale + this.x, pos[1] / this.scale + this.y]
	},
	think: function (dt) {
		this.x = 0
		this.y = 0
	},
	draw: function () {
		UFX.draw("z", this.scale, this.scale, "t", -this.x, -this.y)
		
	},
}


