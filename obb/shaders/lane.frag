// Fragment shader for drawing to the lanescape
// To be used with full.vert vertex shader

precision mediump float;

uniform vec2 ps[2];
uniform float ks[2], Ls[2], ns[2];
uniform float lanewidth;
uniform float borderwidth;  // relative to lane width

varying vec2 tcoord;

float tau = 6.283185307179586;
float s3 = 0.8660254037844386;


vec3 q(in vec2 p, in float k, in float L, in float n) {
	if (L == 0.0) return vec3(10.0, 0.0, 0.0);
	vec2 T = -p / s3;
	float w, v;
	vec2 Tperp = vec2(T.y, -T.x);
	if (k == 0.0) {
		w = dot(tcoord - p, T);
		v = dot(tcoord - p, Tperp);
	} else {
		vec2 offset = tcoord - (p + Tperp / k);
		v = length(offset) - abs(1.0/k);
		w = -atan(offset.y, offset.x) / k;
	}
	float lambda = n * (w + abs(v)) * tau / L;
	return vec3(v, w, lambda);
}

void main(void) {
	vec3 q0 = q(ps[0], ks[0], Ls[0], ns[0]);
	vec3 q1 = q(ps[1], ks[1], Ls[1], ns[1]);
	vec3 qf = abs(q0.x) < abs(q1.x) ? q0 : q1;
	float v = qf.x, w = qf.y, lambda = qf.z;
	float vnorm = abs(2.0 * v / lanewidth);
	float r = abs(vnorm - 1.0) < borderwidth ? 1.0 : 0.0, g = 0.5, b = 0.5;
	if (vnorm < 1.0) {
		g = 0.5 + 0.5 * cos(lambda);
		b = 0.5 + 0.5 * sin(lambda);
	}
//	float a = r > 0.0 || abs(dnorm) < 1.0 ? 1.0 : 0.0;
	float a = 1.0;
	gl_FragColor = vec4(r, g, b, a);
}

