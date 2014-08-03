// Fragment shader for drawing to the lanescape
// To be used with full.vert vertex shader

precision mediump float;

uniform vec2 pos0;  // A point along the lane
// For lnorm.z = 0, lnorm.xy is a unit normal vector perpendicular to the straight path.
// For lnorm.z != 0, pos0 + lnorm.xy / lnorm.z is the center of the circular path.
uniform vec3 lnorm;
uniform float lanewidth;
uniform float borderwidth;  // relative to lane width
uniform float inddist;  // distance along path between inidactors

varying vec2 tcoord;

float tau = 6.283185307179586;

void main(void) {
	// d = distance from center of lane
	// h = distance along lane path, starting at pos0 = 0
	float d, h;
	if (lnorm.z == 0.0) {
		d = abs(dot(tcoord - pos0, lnorm.xy));
		h = dot(tcoord - pos0, vec2(-lnorm.y, lnorm.x));
	} else {
		vec2 radius = -lnorm.xy / lnorm.z;  // vector from the lane curvature center to pos0
		vec2 center = pos0 - radius;  // lane curvature center
		vec2 offset = tcoord - center;  // position relative to curvature center
		d = abs(length(offset) - length(radius));
		h = -atan(offset.y, offset.x) / lnorm.z;
	}
	float dnorm = 2.0 * d / lanewidth;  // normalized distance from lane center (= 1 at border)
	float r = abs(dnorm - 1.0) < borderwidth ? 1.0 : 0.0, g = 0.5, b = 0.5;
	if (dnorm < 1.0) {
		float lambda = (h + d) * tau / inddist;
		g = 0.5 + 0.5 * cos(lambda);
		b = 0.5 + 0.5 * sin(lambda);
	}
	float a = r > 0.0 || abs(dnorm) < 1.0 ? 1.0 : 0.0;
	gl_FragColor = vec4(r, g, b, a);
}

