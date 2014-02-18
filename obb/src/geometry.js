// Procedural generation of blob specs

// Everything in this module is in game coordinates. The G suffix is omitted here.

// TODO: offload a bunch of the heavy arithmetic here into web workers
var geometry = {

	// Returns a blobspec for the specified shape
	getdata: function (shape) {
		var data = []
		if (shape == "sphere") {
			var R = 0.72
			var nblob = constants.blobdensity * 4.189 * R * R * R
			var nj = constants.normaljitter
			while (data.length < nblob) {
				var x = UFX.random(-R, R)
				var y = UFX.random(-R, R)
				var z = UFX.random(-R, R)
				var r = UFX.random(constants.blobsizemin, constants.blobsizemax)
				var d = Math.sqrt(x * x + y * y + z * z)
				if (d > R || d < 0.0001) continue
				var nx = x/d + UFX.random(-nj, nj)
				var ny = y/d + UFX.random(-nj, nj)
				var nz = z/d + UFX.random(-nj, nj)
				var c1 = UFX.random(0.6, 0.65), c2 = 0, c3 = 0
				var ar = 0, ag = 0, ab = 0
				var f = d
				data.push([x, y, z, r, 0.5+0.5*nx, 0.5+0.5*ny, 0.5+0.5*nz, c1, c2, c3, ar, ag, ab, f])
			}
		} else if (shape == "stalk0") {
			var nblob = 500
			data = this.buildstalk(0, 1, 0, 1)
		}

		if (!data.length) throw "unrecognized blob shape " + shape
		data.sort(function (a, b) { return a[2] - b[2] })
		data = [].concat.apply([], data)

		return new Float32Array(data)
	},
	
	// Cubic Bezier curves are described here:
	// https://en.wikipedia.org/wiki/B%C3%A9zier_curve#Cubic_B.C3.A9zier_curves
	// Note that I use h as the independent variable rather than t, so that h ranges from 0 to 1
	// over the path.

	// Given a Bezier specification, return a sequence of h-values from 0 to 1 such that the
	// distance between consecutive points is no greater than s. (It's not guaranteed that the arc
	// length along the path is less than s.)
	beziersegments: function (bspec, s) {
		// normalize to P0 = (0, 0, 0)
		var x1 = bspec[3] - bspec[0], y1 = bspec[4] - bspec[1], z1 = bspec[5] - bspec[2]
		var x2 = bspec[6] - bspec[0], y2 = bspec[7] - bspec[1], z2 = bspec[8] - bspec[2]
		var x3 = bspec[9] - bspec[0], y3 = bspec[10] - bspec[1], z3 = bspec[11] - bspec[2]
		var s2 = s * s
		var ret = [0, 1]
		function subdivide(h0, px0, py0, pz0, h1, px1, py1, pz1) {
			if ((px1-px0)*(px1-px0) + (py1-py0)*(py1-py0) + (pz1-pz0)*(pz1-pz0) <= s2) return
			var h = (h0 + h1) / 2
			ret.push(h)
			var px = 3*h*(1-h)*((1-h)*x1 + h*x2) + h*h*h*x3
			var py = 3*h*(1-h)*((1-h)*y1 + h*y2) + h*h*h*y3
			var pz = 3*h*(1-h)*((1-h)*z1 + h*z2) + h*h*h*z3
			subdivide(h0, px0, py0, pz0, h, px, py, pz)
			subdivide(h, px, py, pz, h1, px1, py1, pz1)
		}
		subdivide(0, 0, 0, 0, 1, x3, y3, z3)
		ret.sort()
		return ret
	},
	
	// Generate the blobspec for a single stalk. Branching stalks should be formed by combining
	// multiple single blobspecs.
	// Stalks are implemented as Bezier paths in 3 dimensions with starting and ending points and
	// tangents fixed to line up at the tile edges. The paths are split up into a number of segments
	// of small enough length. Within each segment we take the starting and ending position and
	// tangent from the Bezier path. We generate a number of blobs proportional to the length of
	// the segment (distance between endpoints). We generate two unit vectors perpendicular to the
	// tangent, and randomly position each blob along these two vectors (using a circular random
	// distribution). The unit vectors are themselves linearly interpolated along the segment as
	// well. Finally, there's a correction term depending on the segment's curvature, so that more
	// blobs get placed on the outside curve to keep the density of blobs more uniform.
	// See notebook pages dated 08-11 Feb 2014 for more information.
	buildstalk: function (edge0, T0, edge1, T1) {
		// Bezier control points and differences between them.
		var x0 = 0, y0 = -0.866025, z0 = 0
		var x3 = 0, y3 = 0.866025, z3 = 0
		var dx0 = T0*constants.That0[0], dy0 = T0*constants.That0[1], dz0 = T0*constants.That0[2]
		var dx2 = T1*constants.That0[0], dy2 = T1*constants.That0[1], dz2 = T1*constants.That0[2]
		var x1 = x0 + dx0, y1 = y0 + dy0, z1 = z0 + dz0
		var x2 = x3 - dx2, y2 = y3 - dy2, z2 = z3 - dz2
		var dx1 = x2 - x1, dy1 = y2 - y1, dz1 = z2 - z1
		// The h-values of the segment boundaries.
		var hs = this.beziersegments([x0,y0,z0,x1,y1,z1,x2,y2,z2,x3,y3,z3], constants.pathsegmentsize)
		var w = constants.stalkwidth, nj = constants.normaljitter
		function normcross(a, b) {
			var x = a[1] * b[2] - a[2] * b[1]
			var y = a[2] * b[0] - a[0] * b[2]
			var z = a[0] * b[1] - a[1] * b[0]
			var n = Math.sqrt(x*x + y*y + z*z)
			if (Math.abs(n) < 0.00001) throw "buildstalk failure"
			return [x/n, y/n, z/n]
		}
		var ps = [], Ts = [], data = []
		for (var j = 0 ; j < hs.length ; ++j) {
			// Generate the position and tangent for each segment boundary.
			var h = hs[j], g = 1 - h
			// p_j is the position at the beginning of the jth segment.
			var p = [
				g*g*g*x0 + 3*g*h*(g*x1+h*x2) + h*h*h*x3,
				g*g*g*y0 + 3*g*h*(g*y1+h*y2) + h*h*h*y3,
				g*g*g*z0 + 3*g*h*(g*z1+h*z2) + h*h*h*z3,
			]
			ps.push(p)
			// T_j is the unit tangent vector at the beginning of the jth segment.
			var Tx = 3*g*g*dx0 + 6*h*g*dx1 + 3*h*h*dx2
			var Ty = 3*g*g*dy0 + 6*h*g*dy1 + 3*h*h*dy2
			var Tz = 3*g*g*dz0 + 6*h*g*dz1 + 3*h*h*dz2
			var T = Math.sqrt(Tx*Tx + Ty*Ty + Tz*Tz)
			if (Math.abs(T) < 0.00001) throw "buildstalk failure"
			Ts.push([Tx/T, Ty/T, Tz/T])
			if (j == 0) continue
			// Generate the blobs for the (j-1)th segment, which runs from p_(j-1) to p_j.
			var p0 = ps[j-1], p1 = ps[j]
			var dpx = p1[0] - p0[0], dpy = p1[1] - p0[1], dpz = p1[2] - p0[2]
			
			// u and v are unit vectors perpendicular to T. The blobs are offset from the central
			// axis of the stalk along these vectors. For simplicity, choose u such that it's
			// perpendicular to both T_(j-1) and T_j, so that it doesn't need to be linearly
			// interpolated over the segment. Choose v0 perpendicular to T_(j-1) and u, and v1
			// perpendicular to T_j and u. The v-vector will vary between v0 and v1 over the
			// length of the segment.
			var u = normcross(Ts[j-1], Ts[j])
			var v0 = normcross(u, Ts[j-1])
			var v1 = normcross(u, Ts[j])
			var dvx = v1[0] - v0[0], dvy = v1[1] - v0[1], dvz = v1[2] - v0[2]

			// s is the length of the segment. The factor dTs = |T_j - T_(j-1)| / s is related to
			// the magnitude of the curvature of the segment, and used below in the mirror
			// transformation to compensate for curvature.
			var s = Math.sqrt(dpx*dpx + dpy*dpy + dpz*dpz)
			var dTx = Ts[j][0] - Ts[j-1][0], dTy = Ts[j][1] - Ts[j-1][1], dTz = Ts[j][2] - Ts[j-1][2]
			var dTs = Math.sqrt(dTx*dTx + dTy*dTy + dTz*dTz) / s

			// Distribute this many blobs uniformly distributed along the segment.
			var nblob = Math.ceil(constants.blobdensity * 4 * w * w * s)
			for (var k = 0 ; k < nblob ; ++k) {
				var g = k / nblob

				// Randomly generate the offset vector q. A and B are the magnitudes of q projected
				// onto the u and v unit vectors. The magnitude of q must be within the stalk width.
				var A = UFX.random(-w, w)
				var B = UFX.random(-w, w)
				var d = Math.sqrt(A*A + B*B)
				if (d > w) continue

				// The mirror transformation. The point of this is to compensate for the fact that
				// when the segment is curved, there's less volume on the inside of the curve than
				// the outside. This lets me get away with a slightly lower blob density (and fewer
				// blobs to draw!) while still maintaining a good visual fullness on the highly
				// curved segments.
				// When on the inside of the curve (B > 0), switch to the outside (B < 0) with
				// probability p(B*|dT|/s), where p(x) = 2x/(1+x).
				// For a derivation of this formula, please see notebook page dated 08 Feb 2014.
				if (UFX.random() < 2 * B * dTs / (1 + B * dTs)) B = -B

				// blob size
				var r = UFX.random(constants.blobsizemin, constants.blobsizemax)
				// v vector linearly interpolated between v0 and v1
				var vx = v0[0]+dvx*g, vy = v0[1]+dvy*g, vz = v0[2]+dvz*g
				
				// Blob position is p + q, where p is linearly interpolated between p_(j-1) and p_j,
				// and q is the offset vector determined above.
				var x = p0[0] + g * dpx + A * u[0] + B * (v0[0] + g * dvx)
				var y = p0[1] + g * dpy + A * u[1] + B * (v0[1] + g * dvy)
				var z = p0[2] + g * dpz + A * u[2] + B * (v0[2] + g * dvz)

				// Base normal vector is q = Au + Bv normalized to unit length.
				var nx = (A * u[0] + B * (v0[0] + g * dvx)) / d + UFX.random(-0.2, 0.2)
				var ny = (A * u[1] + B * (v0[1] + g * dvy)) / d + UFX.random(-0.2, 0.2)
				var nz = (A * u[2] + B * (v0[2] + g * dvz)) / d + UFX.random(-0.2, 0.2)

				var c1 = UFX.random(0.6, 0.62), c2 = 0, c3 = 0
				var ar = 0, ag = 0, ab = 0
				var f = 0.4
				data.push([x, y, z, r, 0.5+0.5*nx, 0.5+0.5*ny, 0.5+0.5*nz, c1, c2, c3, ar, ag, ab, f])
			}
		}
		return data
	},
	

}
