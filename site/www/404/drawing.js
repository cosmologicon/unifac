var drawing = {
	diskshades: {},
	getdiskshade: function (color, r) {
		var key = color + "," + r
		if (this.diskshades[key]) return this.diskshades[key]
		var gcolor = color.replace(/./g, function (c) {
			var i = "0123456789abcdef".indexOf(c.toLowerCase())
			return i < 0 ? c : "0011234567789abc"[i]
		})
		this.diskshades[key] = UFX.draw.radgrad(
			0, 0, r,
			-0.3 * r, -0.3 * r, 0.5 * r,
			0, gcolor,
			1, color
		)
		return this.diskshades[key]
	},

	disk: function (spec) {
		var owidth = "owidth" in spec ? spec.owidth : 0.8
		var color = spec.color || "#44f"
		var ocolor = spec.ocolor || "black"
		var r = spec.r

		color = this.getdiskshade(color, r)
		UFX.draw("b o 0 0", r - owidth)
		if (owidth) UFX.draw("lw", 2 * owidth, "ss", ocolor, "s")
		UFX.draw("fs", color, "f")
	},
	ghost: function (spec) {
		var color = spec.color || "black"
		var alpha = "alpha" in spec ? spec.alpha : 0.6
		var r = spec.r
		UFX.draw("[ b o 0 0", r - 0.01, "alpha", alpha, "fs", color, "f ]")
	},
	linkage: function (thing1, thing2, spec) {
		spec = spec || {}
		var width = spec.width || 1.8
		var owidth = "owidth" in spec ? spec.owidth : 0.8
		var color = spec.color || "#77f"
		var ocolor = spec.ocolor || "black"
		
		var dx = thing2.x - thing1.x, dy = thing2.y - thing1.y
		var dr = Math.sqrt(dx * dx + dy * dy) - thing2.r

		UFX.draw("[ t", thing1.x, thing1.y, "r", Math.atan2(-dx, dy),
			"b m 0", thing1.r, "l 0", dr)
		if (owidth) UFX.draw("lw", width + 2 * owidth, "ss", ocolor, "s")
		UFX.draw("lw", width, "ss", color, "s ]")
	},
	base: function (thing1, thing2, spec) {
		spec = spec || {}
		var width = spec.width || 1.8
		var owidth = "owidth" in spec ? spec.owidth : 0.8
		var color = spec.color || "#77f"
		var ocolor = spec.ocolor || "black"
		
		var dx = thing2.x - thing1.x, dy = thing2.y - thing1.y
		var dr = Math.sqrt(dx * dx + dy * dy) - thing2.r

		UFX.draw("[ t", thing1.x, thing1.y, "r", Math.atan2(-dx, dy), "t", 0, thing1.r,
			"fs", color, "ss", ocolor, "lw", 2 * owidth,
			"( m 3 -1.5 a 0 -1.5 3 0 3.1416 ) s f ]")
	},
	arrowhead: function (thing1, thing2, spec) {
		spec = spec || {}
		var width = spec.width || 1.8
		var owidth = "owidth" in spec ? spec.owidth : 0.8
		var color = spec.color || "#77f"
		var ocolor = spec.ocolor || "black"

		var x1 = width / 2, x2 = 3
		var y0 = -0.2, y1 = 1, y2 = 2, y3 = 6

		var dx = thing2.x - thing1.x, dy = thing2.y - thing1.y
		var dr = Math.sqrt(dx * dx + dy * dy) - thing2.r
		
		UFX.draw("[ t", thing2.x, thing2.y, "r", Math.atan2(-dx, dy), "t", 0, -thing2.r,
			"b m", x1, y0, "l", x1, y2, "l", x2, y1, "l", 0, y3, "l", -x2, y1,
			"l", -x1, y2, "l", -x1, y0)
		if (owidth) UFX.draw("lw", 2 * owidth, "ss", ocolor, "s")
		UFX.draw("fs", color, "f",
			"lw", width, "b m 0 -0.5 l 0 0.5 ss", color, "s ]")
	},
	clasp: function (thing1, thing2, spec) {
		spec = spec || {}
		var width = spec.width || 1.8
		var owidth = "owidth" in spec ? spec.owidth : 0.8
		var color = spec.color || "#77f"
		var ocolor = spec.ocolor || "black"
		var ccolor = spec.ccolor || "gray"

		var r1 = width / 2 + 0.8
		var x0 = 1.2, x1 = 2.6, x2 = 4.2
		var y0 = 0.4, y1 = 2.1, y2 = 3, y3 = 3.4, y4 = 6, y5 = 7, y6 = 8

		var dx = thing2.x - thing1.x, dy = thing2.y - thing1.y
		var dr = Math.sqrt(dx * dx + dy * dy) - thing2.r
		
		UFX.draw("[ t", thing2.x, thing2.y, "r", Math.atan2(-dx, dy), "t", 0, -thing2.r,
			"lw", 2 * owidth, "ss", ocolor, "fs", color)
		if (spec.open) {
			UFX.draw("sfr", -4, y0, 8, 3)
		} else {
			UFX.draw("sfr", -4, y0, 8, 6)
			UFX.draw("( m", 0, y0, "l", x0, y3, "l", x0, y6, "l", -x0, y6, "l", -x0, y3, ") s f")
		}
//		UFX.draw("( m", 0, y0, "l", x2, y1, "l", x2, y4, "l", x1, y5, "l", x1, y2, "l", 0, y0, "s f")
		UFX.draw("b o", 0, y0, r1, "s fs", ccolor, "f ]")
	},
}


