
function Shade(source, bodies) {
	this.source = source
	this.x = source.x
	this.y = source.y
	this.build(bodies)
}
Shade.prototype = {
	build: function (bodies) {
		this.specs = []
		for (var j = 0 ; j < bodies.length ; ++j) {
			var body = bodies[j]
			var dx = body.x - this.x, dy = body.y - this.y
			var d = Math.sqrt(dx * dx + dy * dy), A0 = Math.atan2(dx, -dy)
			if (body.r >= 0.999 * d) continue  // too close to body to cast shadow
			var h = Math.sqrt(d * d - body.r * body.r)
			var dA = Math.asin(body.r / d)
			this.specs.push({
				A0: A0,  // angle of body center
				dA: dA,  // angular radius of body
				d: d,    // distance to body center
				h: h,    // distance to body horizon
				A1: A0 - dA,
				S1: Math.sin(A0 - dA),
				C1: Math.cos(A0 - dA),
				A2: A0 + dA,
				S2: Math.sin(A0 + dA),
				C2: Math.cos(A0 + dA),
			})
//			console.log(dx, dy, d, h)
		}
	},
	draw: function () {
		context.save()
		UFX.draw("t", this.x, this.y)
		var R = 2000
		this.specs.forEach(function (spec) {
			UFX.draw(
				"( m", spec.h * spec.S2, spec.h * -spec.C2,
				"l", R * spec.S2, R * -spec.C2,
				"a", 0, 0, R, spec.A2 - tau/4, spec.A1 - tau/4 + tau,
				"l", spec.h * spec.S1, spec.h * -spec.C1,
				") clip"
			)
		})
		UFX.draw("fs white alpha 0.25 fr -10000 -10000 20000 20000")
		context.restore()
	},
	shaded: function (obj) {
		var dx = obj.x - this.x, dy = obj.y - this.y
		var d = Math.sqrt(dx * dx + dy * dy), A = Math.atan2(dx, -dy)
		for (var j = 0 ; j < this.specs.length ; ++j) {
		}
		return false
	},
}


