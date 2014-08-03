// Fragment shader for drawing to the lanescape
// To be used with full.vert vertex shader

precision mediump float;

uniform vec2 pos0;  // A point along the lane
// For lnorm.z = 0, lnorm.xy is a unit normal vector perpendicular to the straight path.
// For lnorm.z != 0, pos0 + lnorm.xy / lnorm.z is the center of the circular path.
uniform vec3 lnorm;
uniform float lanewidth;

varying vec2 tcoord;

void main(void) {
	float d, h;
	if (lnorm.z == 0.0) {
		d = -dot(tcoord - pos0, lnorm.xy);
		h = dot(tcoord - pos0, vec2(-lnorm.y, lnorm.x));
	} else {
		vec2 radius = -lnorm.xy / lnorm.z;
		vec2 center = pos0 - radius;
		d = distance(tcoord, center) - length(radius);
		h = atan(tcoord.y - center.y, tcoord.x - center.x) * length(radius);
	}
	float b = abs(abs(d) - lanewidth / 2.0) < 0.06 * lanewidth ? 1.0 : 0.0;
	if (abs(d) < lanewidth / 2.0) {
		b = max(b, 0.8 + 0.2 * sin(14.0 * h));
	}
	gl_FragColor = vec4(b, 0.0, 0.0, b);
}

