
precision mediump float;
varying vec2 tcoord;
uniform float time;
uniform float alpha;


const float wrap = 24.0;
const float tau = 6.28318530718;

float hash(in float x, in float y) {
	return fract(183.7212 * sin(0.8732 + 8.3819 * x + 43.6611 * y)) * 2.0 - 1.0;
}

vec2 fade(in vec2 t) {
	return t * t * (3.0 - 2.0 * t);
}

float lerp(in float t, in float a, in float b) {
	return a + (b - a) * t;
}

float noise(in vec2 p) {
	vec2 q = floor(p);
	vec2 Q = q + 1.0;
	vec2 d = p - q;
	q = mod(q, wrap);
	Q = mod(Q, wrap);
	vec2 f = fade(d);
	// Get the noise function at each of the bounding lattice points
	float N00 = hash(q.x, q.y);
	float N10 = hash(Q.x, q.y);
	float N01 = hash(q.x, Q.y);
	float N11 = hash(Q.x, Q.y);
	
	// Interpolate along x axis
	float N0 = lerp(f.x, N00, N10);
	float N1 = lerp(f.x, N01, N11);
	
	// Interpolate along y axis
	float N = lerp(f.y, N0, N1);

	return N;
}



void main(void) {
	float ax = atan(tcoord.x + 0.001, tcoord.y + 0.001) * wrap / tau;
	float r = length(tcoord.xy);
	float ay = 8.0 * r - 3.0 * time;
	float h = clamp(2.0 - 3.0 * r + 0.5 * noise(vec2(ax, ay)), 0.0, 1.0);
	float g = 1.0 - h;

	gl_FragColor = vec4(1.0 - 0.2 * g, 1.0 - 1.2 * g, 1.0 - 3.5 * g, h * alpha);
}

