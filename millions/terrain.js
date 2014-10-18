var terrain = {
	size: 120,
	init: function () {
		this.img = document.createElement("canvas")
		this.img.width = this.img.height = this.size
		
		var R = this.size * 0.47
		var idata = context.createImageData(this.size, this.size)
		var data = idata.data
		for (var px = 0, j = 0 ; px < this.size ; ++px) {
			for (var py = 0 ; py < this.size ; ++py) {
				var x = (px - this.size / 2) / R
				var y = (py - this.size / 2) / R
				var z2 = 1 - x * x - y * y
				if (z2 < 0) {
					var color = [0, 0, 0, 0]
					var shade = 0
				} else {
					var z = Math.sqrt(z2)
					var h = this.getheight(x, y, z)
					var color = this.getcolor(h)
					color.push(255)
					var shade = this.getshade(x, y, z)
					if (h > 0) shade *= this.getgrad(x, y, z)
					//if (h > 0) shade *= UFX.random(0.7, 1.3)
				}
				data[j++] = color[0] * shade
				data[j++] = color[1] * shade
				data[j++] = color[2] * shade
				data[j++] = color[3]
			}
		}
		this.img.getContext("2d").putImageData(idata, 0, 0)
	},
	getheight: function (x, y, z) {
		var h = 0, f0 = 3.21, df = 1.876
		for (var f = f0, j = 0 ; j < 8 ; ++j, f *= df) {
			h += UFX.noise([x * f, y * f, z * f]) / f * f0
		}
		return h
	},
	getcolor: function (h) {
		var tgrad = [[-1.00, 0, 0, 192], // deeps
		             [-0.35, 0, 0, 255], // shallow
		             [-0.10, 0, 128, 255], // shore
		             [-0.04, 240, 240, 64], // sand
		             [0.08, 32, 160, 0], // grass
		             [0.35, 160, 160, 0], // dirt
		             [0.50, 128, 128, 128], // rock
		             [0.70, 255, 255, 255], // snow
		            ], ngrad = tgrad.length
		if (h <= tgrad[0][0]) return tgrad[0].slice(1)
		for (var j = 0 ; j < ngrad - 1 ; ++j) {
		    var tgrad0 = tgrad[j], tgrad1 = tgrad[j+1]
		    if (h >= tgrad0[0] && h < tgrad1[0]) {
		        var f = (h - tgrad0[0]) / (tgrad1[0] - tgrad0[0]), g = 1 - f
		        return [tgrad1[1]*f + tgrad0[1]*g,
		                tgrad1[2]*f + tgrad0[2]*g,
		                tgrad1[3]*f + tgrad0[3]*g]
		    }
		}
		return tgrad[ngrad-1].slice(1)
	},
	getshade: function (x, y, z) {
		return clamp(0.4 * (-x - y + z + 1), 0.1, 0.5) * clamp(4 * z, 0, 1)
	},
	getgrad: function (x, y, z) {
		var h = 0.0001
		var dn = this.getheight(x - h, y - h, z + h) - this.getheight(x + h, y + h, z - h)
		return 1 - 0.01 * dn / h
	},
	draw: function () {
		var scale = 1 / (this.size / 2)
		UFX.draw("[ z", scale, scale, "drawimage", this.img, -this.size / 2, -this.size / 2, "]")
	},
}

