// Fragment shader for drawing to the lanescape
// To be used with full.vert vertex shader

precision mediump float;

// Values describing the lane path - all values in game coordinates
// q = (v, w): path coordinates. This is a curved coordinate system describing where a point is
//    relative to the path. abs(v) is distance from the center of the path, with v > 0 to the right
//    and v < 0 to the left. w is distance along path, with w = 0 where the path enters the hex and
//    w = L where the path exits the hex.
// p: origin reference point in game coordinates, where (v, w) = (0, 0). This is the point at which
//    the path enters the hex.
// k: curvature of path within the hex. The path is a circular segment with radius 1/abs(k). k = 0
//    for straight paths. k > 0 for rightward-curving paths, and k < 0 for leftward-curving paths.
// T: unit tangent vector at point p - points inward toward origin.
// L: game-coordinate distance the path travels within the hex.
// n: number of indicator cycles along the path within the hex.
// lambda: indicator phase. Value increases from 0 where the path enters the hex to (n tau) where it
//    exits the hex.
// For more information, see notebook page dated 04 Aug 2014.

uniform vec2 ps[2];
uniform float ks[2], Ls[2], ns[2];

uniform float lanewidth;
uniform float borderwidth;  // relative to lane width
uniform float alpha0, alpha1;

varying vec2 tcoord;

float tau = 6.283185307179586;
float s3 = 0.8660254037844386;

// Returns v, w/L, lambda.
vec3 q(in vec2 p, in float k, in float L, in float n) {
	if (L == 0.0) return vec3(10.0, 0.0, 0.0);
	vec2 T = -p / s3;
	float w, v;
	vec2 Tperp = vec2(T.y, -T.x);
	if (k == 0.0) {
		v = dot(tcoord - p, Tperp);
		w = dot(tcoord - p, T);
	} else {
		vec2 offset = tcoord - (p + Tperp / k);
		float r = abs(1.0 / k);
		v = length(offset) - r;
		offset = vec2(dot(offset, Tperp), dot(offset, T));
		w = atan(offset.y, k > 0.0 ? -offset.x : offset.x) * r;
	}
	float lambda = n * (w + abs(v)) * tau / L;
	return vec3(v, w / L, lambda);
}

void main(void) {
	// Can have up to 2 paths in a tile. In the case of multiple paths covering a point, draw the
	// one for which v is smaller.
	vec3 q0 = q(ps[0], ks[0], Ls[0], ns[0]);
	vec3 q1 = q(ps[1], ks[1], Ls[1], ns[1]);
	vec3 qf = abs(q0.x) < abs(q1.x) ? q0 : q1;
	float v = qf.x, wL = qf.y, lambda = qf.z;
	float vnorm = abs(2.0 * v / lanewidth);
	float r = abs(vnorm - 1.0) < borderwidth ? 1.0 : 0.0, g = 0.5, b = 0.5;
	if (vnorm < 1.0) {
		g = 0.5 + 0.5 * cos(lambda);
		b = 0.5 + 0.5 * sin(lambda);
	}
	float a = clamp(mix(alpha0, alpha1, wL), 0.0, 1.0);
	gl_FragColor = vec4(r, g, b, a);
}

