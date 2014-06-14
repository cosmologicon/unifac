// Procedural generation of blob specs

// Everything in this module is in game coordinates. The G suffix is omitted here.

// TODO: offload a bunch of the heavy arithmetic here into web workers
var geometry = {

	// Returns a blobspec for the specified shape
	getdata: function (shape) {
		var data = []
		if (shape == "sphere") {
			var R = 0.55
			var nblob = constants.blobsize.sphere.density * 4.189 * R * R * R
			var nj = constants.normaljitter
			while (data.length < nblob) {
				var x = UFX.random(-R, R)
				var y = UFX.random(-R, R)
				var z = UFX.random(-R, R)
				var r = UFX.random(constants.blobsize.sphere.min, constants.blobsize.sphere.max)
				var d = Math.sqrt(x * x + y * y + z * z)
				if (d > R || d < 0.0001) continue
				var nx = x/d + UFX.random(-nj, nj)
				var ny = y/d + UFX.random(-nj, nj)
				var nz = z/d + UFX.random(-nj, nj)
				var c1 = 0, c2 = 0, c3 = 0
				var ar = constants.colors.core[0] * 0.6
				var ag = constants.colors.core[1] * 0.6
				var ab = constants.colors.core[2] * 0.6
				var f = d/R * 0.95
				data.push([x, y, z, r, nx, ny, nz, c1, c2, c3, ar, ag, ab, f])
			}
			for (var j = 0 ; j < 6 ; ++j) {
				var jsystem = j % 3
				data = data.concat(
					this.buildshoulder(j, jsystem),
					this.stalkjoiner(j, true, false, jsystem)
				)
			}
		} else if (shape.indexOf("stalk") == 0) {
			var jsystem = +shape[5]
			data = this.stalkjoiner(0, false, false, jsystem)
			for (var j = 6 ; j < shape.length ; ++j) {
				var T0 = UFX.random(0.2, 1.3)
				var T1 = UFX.random(0.2, 1.3)
				var T1 = 0.15 * (+shape[j])
				var T0 = 0.9 - T1
				var T0 = [0, 0.3, 0.8, 0.9, 0.8, 0.5][+shape[j]]
				var T1 = [0, 0.5, 0.8, 0.9, 0.8, 0.3][+shape[j]]
				data = data.concat(
					this.buildstalk(0, T0, +shape[j], T1, jsystem),
					this.stalkjoiner(+shape[j], true, false, jsystem)
				)
			}
		} else if (shape.indexOf("stump") == 0) {
			var jsystem = +shape[5]
			data = this.stalkjoiner(0, false, true, jsystem).concat(this.buildstump(jsystem))
		} else if (shape.indexOf("organ") == 0) {  // generic ball-shaped organ
			var jsystem = +shape[5]
			var T0 = 0.5
			data = data.concat(
				this.stalkjoiner(0, false, false, jsystem),
				this.buildstalk(0, T0, 3, T0, jsystem, 0.5),
				this.buildball(0, 0, 0.32, jsystem, null, 0.5, 0.95),
				this.buildball(0, -0.24, 0.16, jsystem, null, 0.3, 0.6)
			)
			//data.push([0, 0, 1, 0.28, 0, 0, 0, 0, 0, 0, 0.8, 0.8, 0.8, 0.99])
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
		var hs = [0, 1]
		function subdivide(h0, px0, py0, pz0, h1, px1, py1, pz1) {
			if ((px1-px0)*(px1-px0) + (py1-py0)*(py1-py0) + (pz1-pz0)*(pz1-pz0) <= s2) return
			var h = (h0 + h1) / 2
			hs.push(h)
			var px = 3*h*(1-h)*((1-h)*x1 + h*x2) + h*h*h*x3
			var py = 3*h*(1-h)*((1-h)*y1 + h*y2) + h*h*h*y3
			var pz = 3*h*(1-h)*((1-h)*z1 + h*z2) + h*h*h*z3
			subdivide(h0, px0, py0, pz0, h, px, py, pz)
			subdivide(h, px, py, pz, h1, px1, py1, pz1)
		}
		subdivide(0, 0, 0, 0, 1, x3, y3, z3)
		hs.sort()
		var px0 = 0, py0 = 0, pz0 = 0, Ls = [0]
		for (var j = 1 ; j < hs.length ; ++j) {
			var h = hs[j]
			var px1 = 3*h*(1-h)*((1-h)*x1 + h*x2) + h*h*h*x3
			var py1 = 3*h*(1-h)*((1-h)*y1 + h*y2) + h*h*h*y3
			var pz1 = 3*h*(1-h)*((1-h)*z1 + h*z2) + h*h*h*z3
			var d = Math.sqrt((px1-px0)*(px1-px0) + (py1-py0)*(py1-py0) + (pz1-pz0)*(pz1-pz0))
			Ls.push(Ls[j-1] + d)
			px0 = px1 ; py0 = py1 ; pz0 = pz1
		}
		return [hs, Ls]
	},

	normcross: function (a, b) {
		var x = a[1] * b[2] - a[2] * b[1]
		var y = a[2] * b[0] - a[0] * b[2]
		var z = a[0] * b[1] - a[1] * b[0]
		var n = Math.sqrt(x*x + y*y + z*z)
		if (Math.abs(n) < 0.00001) throw "normcross failure"
		return [x/n, y/n, z/n]
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
	buildstalk: function (edge0, T0, edge1, T1, jsystem, hmax) {
		var color = [0, 0, 0]
		color[jsystem] = 0.6
		// Bezier control points and differences between them.
		var That0 = constants.That0[jsystem]
		var Thx = That0[0], Thy = That0[1], Thz = That0[2]
		var S = [0, s3, s3, 0, -s3, -s3][edge0], C = [1, 1/2, -1/2, -1, -1/2, 1/2][edge0]
		var x0 = s3*S, y0 = -s3*C, z0 = 0
		var dx0 = T0*(Thx*C-Thy*S), dy0 = T0*(Thx*S+Thy*C), dz0 = T0*Thz
		var S = [0, s3, s3, 0, -s3, -s3][edge1], C = [1, 1/2, -1/2, -1, -1/2, 1/2][edge1]
		var x3 = s3*S, y3 = -s3*C, z3 = 0
		var dx2 = -T1*(Thx*C-Thy*S), dy2 = -T1*(Thx*S+Thy*C), dz2 = -T1*Thz
		var x1 = x0 + dx0, y1 = y0 + dy0, z1 = z0 + dz0
		var x2 = x3 - dx2, y2 = y3 - dy2, z2 = z3 - dz2
		var dx1 = x2 - x1, dy1 = y2 - y1, dz1 = z2 - z1
		// The h-values of the segment boundaries.
		var hLs = this.beziersegments([x0,y0,z0,x1,y1,z1,x2,y2,z2,x3,y3,z3], constants.pathsegmentsize)
		var hs = hLs[0], Ls = hLs[1]
		var L = Ls[Ls.length - 1], fa = 0.5 * (3 - L * constants.growdf0), fb = 1 - fa
		var w = constants.stalkwidth, nj = constants.normaljitter, ow = constants.outlinewidth
		var rf = constants.stalkrfactor
		var ps = [], Ts = [], data = []
		for (var j = 0 ; j < hs.length ; ++j) {
			// Generate the position and tangent for each segment boundary.
			var h = hs[j], g = 1 - h
			if (hmax !== undefined && h > hmax) break
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
			var u = this.normcross(Ts[j-1], Ts[j])
			var v0 = this.normcross(u, Ts[j-1])
			var v1 = this.normcross(u, Ts[j])
			var dvx = v1[0] - v0[0], dvy = v1[1] - v0[1], dvz = v1[2] - v0[2]

			// s is the length of the segment. The factor dTs = |T_j - T_(j-1)| / s is related to
			// the magnitude of the curvature of the segment, and used below in the mirror
			// transformation to compensate for curvature.
			var s = Math.sqrt(dpx*dpx + dpy*dpy + dpz*dpz)
			var dTx = Ts[j][0] - Ts[j-1][0], dTy = Ts[j][1] - Ts[j-1][1], dTz = Ts[j][2] - Ts[j-1][2]
			var dTs = Math.sqrt(dTx*dTx + dTy*dTy + dTz*dTz) / s

			// Distribute this many blobs uniformly distributed along the segment.
			var nblob = Math.ceil(constants.blobsize.stalk.density * 4 * w * w * s)
			for (var k = 0 ; k < nblob ; ++k) {
				var g = k / nblob

				if (UFX.random() < 0.001) {
					do {
						var theta = UFX.random(tau)
						var d = w, A = d * Math.sin(theta), B = d * Math.cos(theta)
					} while (Math.abs(B) < 0.7 * d)
					var r = 1.2 * constants.blobsize.stalk.max
				} else {
					// Randomly generate the offset vector q. A and B are the magnitudes of q projected
					// onto the u and v unit vectors. The magnitude of q must be within the stalk width.
					var A = UFX.random(-w, w)
					var B = UFX.random(-w, w)
					var d = Math.sqrt(A*A + B*B)

					// blob size
					var r = UFX.random(constants.blobsize.stalk.min, constants.blobsize.stalk.max)

					if (d + rf * r > w) continue
				}

				// The mirror transformation. The point of this is to compensate for the fact that
				// when the segment is curved, there's less volume on the inside of the curve than
				// the outside. This lets me get away with a slightly lower blob density (and fewer
				// blobs to draw!) while still maintaining a good visual fullness on the highly
				// curved segments.
				// When on the inside of the curve (B > 0), switch to the outside (B < 0) with
				// probability p(B*|dT|/s), where p(x) = 2x/(1+x).
				// For a derivation of this formula, please see notebook page dated 08 Feb 2014.
				if (UFX.random() < 2 * B * dTs / (1 + B * dTs)) B = -B

				// v vector linearly interpolated between v0 and v1
				var vx = v0[0]+dvx*g, vy = v0[1]+dvy*g, vz = v0[2]+dvz*g
				
				// Blob position is p + q, where p is linearly interpolated between p_(j-1) and p_j,
				// and q is the offset vector determined above.
				var x = p0[0] + g * dpx + A * u[0] + B * (v0[0] + g * dvx)
				var y = p0[1] + g * dpy + A * u[1] + B * (v0[1] + g * dvy)
				var z = p0[2] + g * dpz + A * u[2] + B * (v0[2] + g * dvz)
				
				// To ensure seamless matchup between tiles, blobs that cross the tile border are
				// left out here, and a common set of overlap blobs will be added in.
				var bound = s3 - (r + ow)
				if (Math.abs(y) > bound) continue
				if (Math.abs(s3 * x + 0.5 * y) > bound) continue
				if (Math.abs(s3 * x - 0.5 * y) > bound) continue

				// Base normal vector is q = Au + Bv normalized to unit length.
				var nx = (A * u[0] + B * (v0[0] + g * dvx)) / d + UFX.random(-0.2, 0.2)
				var ny = (A * u[1] + B * (v0[1] + g * dvy)) / d + UFX.random(-0.2, 0.2)
				var nz = (A * u[2] + B * (v0[2] + g * dvz)) / d + UFX.random(-0.2, 0.2)

				var ar = 0, ag = 0, ab = 0
				var C = Ls[j-1] + g * (Ls[j] - Ls[j-1])
				C -= constants.stumplength * (1 - d / w)
				var fx = -1 + 2 * C/L, fy = fx * (fa + fb * fx * fx)
				var f = 0.5 + 0.5 * fy
				f = clamp(f, 0.01, 0.99)
				data.push([x, y, z, r, nx, ny, nz, color[0], color[1], color[2], ar, ag, ab, f])
			}
		}
		return data
	},
	// Returns the blobspec for a stalk end cap at the specified edge. Blobs that appear near the
	// edges use a predetermined set of blobs, so that when different tiles are placed adjacent
	// they align properly at the edge. Edge numbers go from 0 to 5, and outward is a boolean
	// representing whether the stalk is exiting or entering the tile at that point. For more
	// detals on this convention, please see notebook page dated 17 Feb 2014.
	stalkjoindata: {},  // Memoized return values
	stalkjoindata0: {},
	stalkjoiner: function (edge, outward, advanced, jsystem) {
		var key = edge + (outward ? 6 : 0) + (advanced ? 12 : 0) + (jsystem * 36)
		if (key in this.stalkjoindata) return this.stalkjoindata[key]
		if (!this.stalkjoindata0[jsystem]) {
			// Generate the blobs that are used for all end caps. This part is similar to buildstalk
			// with some simplifications. See the buildstalk method and notebook page dated
			// 11 Feb 2014 for more information.
			var w = constants.stalkwidth, nj = constants.normaljitter, ow = constants.outlinewidth
			var rf = constants.stalkrfactor
			var That0 = constants.That0[jsystem]
			var Thx = That0[0], Thy = That0[1], Thz = That0[2]
			var data = this.stalkjoindata0[jsystem] = []

			// Generate a single segment of blobs. d is 1/2 the segment length, chosen so that any
			// blob that intersects the edge is definitely within this segment.
			var d = w * Math.sqrt(1 - Thy * Thy) + constants.blobsize.stalk.max, s = 2 * d
			// Starting position and displacement over the blob.
			var p0 = [-d*Thx, -d*Thy, d*Thz]
			var dpx = s*Thx, dpy = s*Thy, dpz = s*Thz
			// Normal vectors perpendicular to That, to form a basis for the displacement of blobs
			// along the segment.
			var u = this.normcross(That0, [0, 0, 1])
			var v = this.normcross(u, That0)

			var nblob = Math.ceil(constants.blobsize.stalk.density * 4 * w * w * s)
			for (var k = 0 ; k < nblob ; ++k) {
				var g = k / nblob
				// Random displacement with respect to the central stalk axis
				var A = UFX.random(-w, w)
				var B = UFX.random(-w, w)
				var d = Math.sqrt(A*A + B*B)
				// Blob size
				var r = UFX.random(constants.blobsize.stalk.min, constants.blobsize.stalk.max)
				if (d + rf * r > w) continue
				// Blob position is p + q, where q is offset vector given by A u + B v.
				var x = p0[0] + g * dpx + A * u[0] + B * v[0]
				var y = p0[1] + g * dpy + A * u[1] + B * v[1]
				var z = p0[2] + g * dpz + A * u[2] + B * v[2]
				// We only want to keep blobs that overlap the edge. Blobs that don't overlap the
				// edge are already covered by the stalk itself.
				if (Math.abs(y) > r + ow) continue
				// Base normal vector is q = Au + Bv normalized to unit length.
				var nx = (A * u[0] + B * v[0]) / d + UFX.random(-0.2, 0.2)
				var ny = (A * u[1] + B * v[1]) / d + UFX.random(-0.2, 0.2)
				var nz = (A * u[2] + B * v[2]) / d + UFX.random(-0.2, 0.2)
				var c1 = UFX.random(0.6, 0.62), c2 = 0, c3 = 0
				var ar = 0, ag = 0, ab = 0
				var C = g*s - s/2
				var f = constants.stumplength * constants.growdf0 * (C/constants.stumplength + d*d/(w*w) - 1)
				data.push([x, y, z, r, nx, ny, nz, c1, c2, c3, ar, ag, ab, f])
			}
		}
		// The edge number determines the offset and the rotation matrix of the blobs within the
		// requested edge spec.
		var dx = [0, 0.75, 0.75, 0, -0.75, -0.75][edge], dy = [-s3, -s3/2, s3/2, s3, s3/2, -s3/2][edge]
		var S = [0, s3, s3, 0, -s3, -s3][edge], C = [1, 0.5, -0.5, -1, -0.5, 0.5][edge]
		if (outward) { S = -S ; C = -C }
		this.stalkjoindata[key] = this.stalkjoindata0[jsystem].map(function (blob) {
			blob = blob.slice()
			var x = blob[0], y = blob[1], nx = blob[4], ny = blob[5]
			// Offset and rotate the blobs as needed
			blob[0] = C*x - S*y + dx
			blob[1] = S*x + C*y + dy
			blob[4] = C*nx - S*ny
			blob[5] = S*nx + C*ny
			var c = blob[7]
			blob[7] = blob[8] = blob[9] = 0
			blob[7+jsystem] = c
			if (outward || advanced) blob[13] += 1
			blob[13] = clamp(blob[13], 0.01, 0.99)
			// TODO: handle f
			return blob
		})
		return this.stalkjoindata[key]
	},
	buildstump: function (jsystem) {
		var color = [0, 0, 0]
		color[jsystem] = 0.6
		var w0 = constants.stalkwidth, nj = constants.normaljitter
		var s = constants.stumplength, rf = constants.stalkrfactor, ow = constants.outlinewidth
		var That0 = constants.That0[jsystem]
		var Thx = That0[0], Thy = That0[1], Thz = That0[2]
		var data = []
		var p0 = [0, -s3, 0]
		var dpx = s*Thx, dpy = s*Thy, dpz = s*Thz
		var u = this.normcross(That0, [0, 0, 1])
		var v = this.normcross(u, That0)
		var nblob = Math.ceil(constants.blobsize.stalk.density * 4 * w0 * w0 * s)
		for (var k = 0 ; k < nblob ; ++k) {
			var g = k / nblob, b = Math.sqrt(1 - g) * 0.8 + 0.2
			var w = w0 * b
			var A = UFX.random(-w, w)
			var B = UFX.random(-w, w)
			var d = Math.sqrt(A*A + B*B)
			var r = UFX.random(constants.blobsize.stalk.min, constants.blobsize.stalk.max) * b
			if (d + rf * r > w) continue
			// Blob position is p + q, where q is offset vector given by A u + B v.
			var x = p0[0] + g * dpx + A * u[0] + B * v[0]
			var y = p0[1] + g * dpy + A * u[1] + B * v[1]
			var z = p0[2] + g * dpz + A * u[2] + B * v[2]
			if (y - (r + ow) < p0[1]) continue
			// Base normal vector is q = Au + Bv normalized to unit length.
			var nx = (A * u[0] + B * v[0]) / d + UFX.random(-0.2, 0.2)
			var ny = (A * u[1] + B * v[1]) / d + UFX.random(-0.2, 0.2)
			var nz = (A * u[2] + B * v[2]) / d + UFX.random(-0.2, 0.2)
			var ar = 0, ag = 0, ab = 0
			// See notes dated 15 Mar 2014
			var C = g * s
			var f = clamp(1 + s * constants.growdf0 * (C/s + d*d/(w0*w0) - 1), 0.01, 0.99)
			data.push([x, y, z, r, nx, ny, nz, color[0], color[1], color[2], ar, ag, ab, f])
		}
		return data
	},
	buildshoulder: function (edge, jsystem) {
		var color = [0, 0, 0]
		color[jsystem] = 0.6
		var w0 = constants.stalkwidth, nj = constants.normaljitter, ow = constants.outlinewidth
		var s = constants.stumplength, rf = constants.stalkrfactor
		var That0 = constants.That0[jsystem]
		var Thx = That0[0], Thy = That0[1], Thz = That0[2]
		var data = []
		var x0 = [0, 0.75, 0.75, 0, -0.75, -0.75][edge], y0 = [-s3, -s3/2, s3/2, s3, s3/2, -s3/2][edge]
		var S = [0, s3, s3, 0, -s3, -s3][edge], C = [1, 0.5, -0.5, -1, -0.5, 0.5][edge]
		var s = 0.6
		var nThx = (C*Thx-S*Thy), nThy = (S*Thx+C*Thy)
		Thx = nThx ; Thy = nThy
		var dpx = s*Thx, dpy = s*Thy, dpz = s*Thz
		var p0 = [x0, y0, 0]
		var u = this.normcross([Thx, Thy, Thz], [0, 0, 1])
		var v = this.normcross(u, [Thx, Thy, Thz])
		var nblob = Math.ceil(constants.blobsize.stalk.density * 4 * w0 * w0 * s)
		for (var k = 0 ; k < nblob ; ++k) {
			var g = k / nblob, b = 1 + 0.9 * g
			var w = w0 * b
			var A = UFX.random(-w, w)
			var B = UFX.random(-w, w)
			var d = Math.sqrt(A*A + B*B)
			var r = UFX.random(constants.blobsize.stalk.min, constants.blobsize.stalk.max) * b
			if (d + rf * r > w) continue
			var x = p0[0] + g * dpx + A * u[0] + B * v[0]
			var y = p0[1] + g * dpy + A * u[1] + B * v[1]
			var z = p0[2] + g * dpz + A * u[2] + B * v[2]
			var bound = s3 - (r + ow)
			if (Math.abs(y) > bound) continue
			if (Math.abs(s3 * x + 0.5 * y) > bound) continue
			if (Math.abs(s3 * x - 0.5 * y) > bound) continue
			// Base normal vector is q = Au + Bv normalized to unit length.
			var nx = (A * u[0] + B * v[0]) / d + UFX.random(-0.2, 0.2)
			var ny = (A * u[1] + B * v[1]) / d + UFX.random(-0.2, 0.2)
			var nz = (A * u[2] + B * v[2]) / d + UFX.random(-0.2, 0.2)
			var sg = g
			var c0 = color[0] * (1 - sg)
			var c1 = color[1] * (1 - sg)
			var c2 = color[2] * (1 - sg)
			var ar = constants.colors.core[0] * 0.6 * sg
			var ag = constants.colors.core[1] * 0.6 * sg
			var ab = constants.colors.core[2] * 0.6 * sg
			// See notes dated 15 Mar 2014
			var C = -g * s
			var f = clamp(1 + constants.stumplength * constants.growdf0 * (C/constants.stumplength + d*d/(w*w) - 1), 0.01, 0.99)
			data.push([x, y, z, r, nx, ny, nz, c0, c1, c2, ar, ag, ab, f])
		}
		return data
	},
	buildball: function (x0, y0, R, jsystem, acolor, f0, f1) {
		var data = []
		var color = [0, 0, 0]
		if (jsystem === 0 || jsystem == 1 || jsystem == 2) color[jsystem] = 0.6
		acolor = acolor || [0, 0, 0]
		// TODO: the ball density and constants should actually depend on R
		var blobsize = constants.blobsize.ball(R)
		var nblob = blobsize.density * 4.189 * R * R * R
		var nj = constants.normaljitter
		while (data.length < nblob) {
			var x = UFX.random(-R, R)
			var y = UFX.random(-R, R)
			var z = UFX.random(-R, R)
			var r = UFX.random(blobsize.min, blobsize.max)
			var d = Math.sqrt(x * x + y * y + z * z)
			if (d > R || d < 0.0001) continue
			var nx = x/d + UFX.random(-nj, nj)
			var ny = y/d + UFX.random(-nj, nj)
			var nz = z/d + UFX.random(-nj, nj)
			var c1 = color[0]
			var c2 = color[1]
			var c3 = color[2]
			var ar = acolor[0] * 0.6
			var ag = acolor[1] * 0.6
			var ab = acolor[2] * 0.6
			var f = d/R * (f1 - f0) + f0
			data.push([x0+x, y0+y, z, r, nx, ny, nz, c1, c2, c3, ar, ag, ab, f])
		}
		return data
	},

}

