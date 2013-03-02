// Geometric and other utilities

// http://tauday.com/tau-manifesto
var tau = 6.283185307179586

// Value closest to 0 that's equal to (X1 - X0) mod tau
function getdX(X0, X1) {
    return ((X1 - X0 + tau/2) % tau + tau) % tau - tau/2
}

// Canonical conversion between the sorta-polar coordinates I'm using and rectangular
function getpos(X, y) {
    var r = y + gamestate.worldr
    return [r * Math.sin(X), r * Math.cos(X)]
}

// Clip x to the range [a,b]
function clip(x,a,b){return b===undefined?x>a?a:x<-a?-a:x:x>b?b:x<a?a:x}

// A cubic Bezier path through the given control points as a function of t
//   with t(h) = t0 h. That is, 0 <= t <= t0 and 0 <= h <= 1
// Even though I'm using lowercase x's here, it could just as easily work with X's.
function BezierPath(x0, y0, x1, y1, x2, y2, x3, y3, t0) {
	this.x0 = x0 ; this.y0 = y0
	this.x1 = x1 ; this.y1 = y1
	this.x2 = x2 ; this.y2 = y2
	this.x3 = x3 ; this.y3 = y3
	this.t0 = t0
	this.t = 0
}
BezierPath.prototype = {
	// You can also just say path.t += dt. I won't be offended.
	advance: function (dt) {
		this.t += dt
	},
	complete: function () {
		return this.t >= this.t0
	},
	pos: function (t) {
		if (t == undefined) t = this.t
		var h = t / this.t0, g = 1 - h
		return [
			this.x0*g*g*g + this.x1*3*g*g*h + this.x2*3*g*h*h + this.x3*h*h*h,
			this.y0*g*g*g + this.y1*3*g*g*h + this.y2*3*g*h*h + this.y3*h*h*h,
		]
	},
	// Position, velocity, and acceleration
	// returns: [x, y, vx, vy, ax, ay]
	pva: function (t) {
		if (t == undefined) t = this.t
		var h = t / this.t0, g = 1 - h
		return [
			this.x0*g*g*g + this.x1*3*g*g*h + this.x2*3*g*h*h + this.x3*h*h*h,
			this.y0*g*g*g + this.y1*3*g*g*h + this.y2*3*g*h*h + this.y3*h*h*h,
			(this.x0*-g*g + this.x1*g*(1-3*h) + this.x2*h*(2-3*h) + this.x3*h*h) * 3 / this.t0,
			(this.y0*-g*g + this.y1*g*(1-3*h) + this.y2*h*(2-3*h) + this.y3*h*h) * 3 / this.t0,
			(this.x0*g + this.x1*(3*h-2) + this.x2*(1-3*h) + this.x3*h) * 6 / (this.t0 * this.t0),
			(this.y0*g + this.y1*(3*h-2) + this.y2*(1-3*h) + this.y3*h) * 6 / (this.t0 * this.t0),
		]
	},
}

// Return a BezierPath object that starts at (X0, y0) and ends at (X1, y1)
//   with initial velocity (vx0, vy0) and final velocity (vx1, vy1)
//   that's as fast as possible while at no point exceeding a speed of vmax
//   or an acceleration of amax
// To avoid insane runaway situations, include a dmax term that's a hard upper limit
//   on the total length of the path (defaults to some reasonable value)
function anchoredbezier(X0, y0, vx0, vy0, X1, y1, vx1, vy1, vmax, amax, dmax) {
	var r = gamestate.worldr
	var t0 = 1
	var dX = getdX(X0, X1), dy = y1 - y0, yavg = (y0 + y1) / 2, dx = dX * (yavg + r)
	X1 = X0 + dX
	dmax = dmax || 3 * Math.sqrt(Math.max(vx0*vx0 + vy0*vy0, vx1*vx1 + vy1*vy1, dx*dx + dy*dy))
	for (var j = 0 ; j < 10 ; ++j) {
		var c = t0 / 3
		// Construct the candidate path
		var path = new BezierPath(
			X0, y0, X0 + c * vx0 / (y0 + r), y0 + c * vy0,
			X1 - c * vx1 / (y1 + r), y1 - c * vy1, X1, y1,
			t0
		)
		// Sample the speed and acceleration of various points along the path
		//   and estimate the total path length
		var v2max = 0, a2max = 0, d = 0, Xf = X0, yf = y0
		for (var k = 0 ; k <= 10 ; ++k) {
			var pva = path.pva(t0 * k / 10)
			var X = pva[0], y = pva[1], vx = pva[2]*(y+r), vy = pva[3], ax = pva[4]*(y+r), ay = pva[5]
			v2max = Math.max(v2max, vx*vx + vy*vy)
			a2max = Math.max(a2max, ax*ax + ay*ay)
			dX = X - Xf ; dx = dX * ((yf + y) / 2 + r) ; dy = y - yf
			Xf = X ; yf = y
			d += Math.sqrt(dx*dx + dy*dy)
		}
//		console.log(j, t0, Math.sqrt(v2max), Math.sqrt(a2max), d, dmax)
		// Adjust by an approximately appropriate amount
		var f = Math.min(Math.max(Math.sqrt(v2max) / vmax, Math.sqrt(a2max) / amax), dmax / d)
		if (0.98 < f && f < 1.02) break
		t0 *= f
	}
	return path
}
// A BezierPath that gets the given object from its current position to (X1, y1)
function objbezier(obj, X1, y1, vx1, vy1) {
	// Guard against requesting an impossible vmax
	var vmax = Math.max(
		Math.sqrt(obj.vx*obj.vx + obj.vy*obj.vy) * 1.02,
		Math.sqrt(vx1*vx1 + vy1*vy1) * 1.02,
		obj.vmax
	)
	return anchoredbezier(
		obj.X, obj.y, obj.vx, obj.vy,
		X1, y1, (vx1 || 0), (vy1 || 0),
		vmax, obj.amax
	)
}



