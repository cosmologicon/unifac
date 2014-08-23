
var control = {
	// closest point to p that's directly horizontal or vertical to p0
	nearest: function (p0, p) {
		return Math.abs(p0[0] - p[0]) > Math.abs(p0[1] - p[1]) ? [p[0], p0[1]] : [p0[0], p[1]]
	},
}

