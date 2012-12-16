var DrawSurface = {
	draw: function () {
		UFX.draw("b m 0 0 l", this.dx, this.dy, "ss purple lw 4 s")
	},
}

var SingleDivider = {
	isabove: function (x, y) {
		var dx = x - this.x, dy = y - this.y
		return dy * this.dx < this.dy * dx
	},
	getA: function () {
		return this.A
	},
	constrain: function (x, y) {
		var p = (x - this.x) * this.ix + (y - this.y) * this.iy
		return [this.x + p * this.ix + 1 * this.iy, this.y + p * this.iy - 1 * this.ix]
	},
	distance2: function (x, y) {
		var dx = x - this.x, dy = y - this.y
		var p = dx * this.ix + dy * this.iy
		var x0 = p < 0 ? 0 : p > this.d ? this.dx : p * this.ix
		var y0 = p < 0 ? 0 : p > this.d ? this.dy : p * this.iy
		return (x0 - dx) * (x0 - dx) + (y0 - dy) * (y0 - dy)
	},
	bouncevector: function (x, y, vx, vy) {
		var p = vx * this.ix + vy * this.iy
		var px = p * this.ix, py = p * this.iy
		return [px + 0.5 * (px - vx), py + 0.5 * (py - vy)]
	},
	catches: function (obj) {
		if (!this.isabove(obj.oldx, obj.oldy)) return false
		if (this.isabove(obj.x, obj.y)) return false
		var p = (obj.x - this.x) * this.ix + (obj.y - this.y) * this.iy
		return 0 <= p && p <= this.d
	},
	canhold: function () {
		return Math.abs(this.iy) < 0.8
	},
}

var DrawGrass = {
	maketracer: function () {
		this.drawspec = []
		for (var j = 0 ; j < this.d ; ++j) {
			var x = UFX.random(15, this.d - 15), y = UFX.random(), r = UFX.random(12, 20)
			y = 10 + y * x * (1 - x/this.d)
			var color = "rgb(" + UFX.random.rand(80,120) + "," + UFX.random.rand(40,60) + ",0)"
			this.drawspec.push(["b o", x*this.ix - y * this.iy, x*this.iy + y*this.ix, r, "fs", color, "f"])
		}
		for (var j = 0 ; j < this.d ; ++j) {
			var x = UFX.random(this.d), y = UFX.random(-5, 5), r = UFX.random(4, 8)
			if (UFX.random() < 0.5) {
				y = UFX.random(-5, 15)
				if (UFX.random() < 0.2) {
					y = UFX.random(-5, 22)
				}
			}
			var color = "rgb(" + UFX.random.rand(10, 20) + "," + UFX.random.rand(140,240) + ",0)"
			this.drawspec.push(["b o", x*this.ix - y * this.iy, x*this.iy + y*this.ix, r, "fs", color, "f"])
		}
	},
	draw: function (con) {
		con = con || context
		UFX.draw(con, this.drawspec)
	},
//	draw: function () {
//		this.tracer.draw(vista.scale)
//	},
}


function SinglePlatform (x0, y0, x1, y1) {
	this.x = x0
	this.y = y0
	this.dx = x1 - x0
	this.dy = y1 - y0
	this.d = Math.sqrt(this.dx * this.dx + this.dy * this.dy)
	this.ix = this.dx / this.d
	this.iy = this.dy / this.d
	this.A = Math.atan2(this.dy, this.dx)
	this.maketracer()
}
SinglePlatform.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(DrawGrass)
	.addcomp(SingleDivider)


function MultiPlatform () {
	this.platforms = []
	for (var j = 2 ; j < arguments.length ; j += 2) {
		this.platforms.push(new SinglePlatform(arguments[j-2], arguments[j-1], arguments[j], arguments[j+1]))
	}
	this.first = this.platforms[0]
	this.last = this.platforms[this.platforms.length - 1]
}
MultiPlatform.prototype = {
	nearest: function (x, y) {
		var n = this.first, d2min = this.first.distance2(x, y)
		for (var j = 1 ; j < this.platforms.length ; ++j) {
			var d2 = this.platforms[j].distance2(x, y)
			if (d2 < d2min) {
				n = this.platforms[j]
				d2min = d2
			}
		}
		return n
	},
	isabove: function (x, y) {
		return this.nearest(x, y).isabove(x, y)
	},
	getA: function (x, y) {
		return this.nearest(x, y).A
	},
	constrain: function (x, y) {
		var p = this.nearest(x, y).constrain(x, y)
		if (!this.isabove(p[0], p[1])) {
			p = this.nearest(p[0], p[1]).constrain(p[0], p[1])
			if (!this.isabove(p[0], p[1])) {
				console.log(x, y, p)
			}
		}
		return p
	},
	bouncevector: function (x, y, vx, vy) {
		return this.nearest(x, y).bouncevector(x, y, vx, vy)
	},
	catches: function (obj) {
		if (!this.nearest(obj.oldx, obj.oldy).isabove(obj.oldx, obj.oldy)) return false
		var plat = this.nearest(obj.x, obj.y)
		if (plat.isabove(obj.x, obj.y)) return false
		if (plat === this.first) {
			var p = (obj.x - plat.x) * plat.ix + (obj.y - plat.y) * plat.iy
			return 0 <= p
		} else if (plat === this.last) {
			var p = (obj.x - plat.x) * plat.ix + (obj.y - plat.y) * plat.iy
			return p <= plat.d
		} else {
			return true
		}
	},
	canhold: function (x, y) {
		return this.nearest(x, y).canhold()
	},
	draw: function (con) {
		if (!this.drawspec) {
			this.drawspec = []
			var D = 0, ps = this.platforms
			ps.forEach(function (p) { D += p.d })
			function palong(p, x, y) {
				return [p.x + x * p.ix - y * p.iy, p.y + x * p.iy + y * p.ix]
			}
			var ts = [0]
			for (var j = 0 ; j < ps.length - 1 ; ++j) {
				var dA = (ps[j+1].A - ps[j].A) / 2
				ts.push(Math.tan((ps[j+1].A - ps[j].A) / 2))
			}
			ts.push(0)
			function along(x, y) {
				var j = 0
				while (j < ps.length - 1 && x > ps[j].d) x -= ps[j++].d
				x += y * (ts[j] - (ts[j+1] + ts[j]) * x / ps[j].d)
				return palong(ps[j], x, y)
			}
			var depths = { 0: 0, 1: 0 }, n = 2 + Math.floor(D / 200)
			for (var j = 0 ; j < n ; ++j) {
				var x = (j + 1) / (n + 2.)
				var y = UFX.random(0.2, 1) * Math.min(x*D/200,1,(1-x)*D/200)
				depths[x] = y
			}
			function depthat(xa) {
				var less = [], more = []
				for (var x in depths) {
					if (+x < xa) { less.push(+x) }
					else { more.push(+x) }
				}
				if (!less.length || !more.length) return 0
				var x0 = Math.max.apply(Math, less), x1 = Math.min.apply(Math, more)
				if (x1 - x0 < 0.0001) return depths[x0]
				return ((xa - x0) * depths[x1] + (x1 - xa) * depths[x0]) / (x1 - x0)
			}

			for (var j = 0 ; j < 2*D ; ++j) {
				var xf = UFX.random(), yf = UFX.random()
				var x = xf*D, y = 10 + 100 * depthat(xf) * yf, r = UFX.random(12, 24) * (1 - 0.2*j*j/D/D)
				var red = Math.floor(UFX.random(80, 120) * (1 - 0.5 * yf))
				var green = Math.floor(UFX.random(40, 60) * (1 - 0.5 * yf))
				var color = "rgb(" + red + "," + green + ",0)"
				this.drawspec.push(["b o", along(x, y), r, "fs", color, "f"])
			}

			for (var j = 0 ; j < D ; ++j) {
				var x = UFX.random(-15,D+15), y = UFX.random() < 0.1 ? UFX.random(-15,25) : UFX.random(-10,15)
				var r = UFX.random(6, 12) * (1 - 0.8*j*j/D/D)
				var red = Math.floor(UFX.random(10, 20))
				var green = Math.floor(UFX.random(140, 240))
				var color = "rgb(" + red + "," + green + ",0)"
				this.drawspec.push(["b o", along(x, y), r, "fs", color, "f"])
			}
	/*
			for (var j = 0 ; j < this.d ; ++j) {
				var x = UFX.random(this.d), y = UFX.random(-5, 5), r = UFX.random(4, 8)
				if (UFX.random() < 0.5) {
					y = UFX.random(-5, 15)
					if (UFX.random() < 0.2) {
						y = UFX.random(-5, 22)
					}
				}
				var color = "rgb(" + UFX.random.rand(10, 20) + "," + UFX.random.rand(140,240) + ",0)"
				this.drawspec.push(["b o", x*this.ix - y * this.iy, x*this.iy + y*this.ix, r, "fs", color, "f"])
			}*/
		}
		con = con || context
		UFX.draw(con, this.drawspec)
	},
}


var platforms = []

