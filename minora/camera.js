
var camera = {
	x: 0,
	y: 0,
	z: 20,
	think: function (dt) {
		this.zoom = this.z * Math.max(settings.sx/1200, settings.sy/900)
		var wx = 0.5*settings.sx/this.zoom, wy = 0.5*settings.sy/this.zoom
		this.xmin = this.x - wx, this.xmax = this.x + wx
		this.ymin = this.y - wy, this.ymax = this.y + wy
	},
	onscreen: function (x, y, r) {
		r = r || 0
		return x > this.xmin - r && x < this.xmax + r && y > this.ymxn - r && y < this.ymax + r 
	},
	draw: function () {
		UFX.draw("t", settings.sx/2, settings.sy/2, "z", this.zoom, this.zoom, "t", -this.x, -this.y)
	},
	
}



