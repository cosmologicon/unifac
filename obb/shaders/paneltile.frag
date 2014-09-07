// Hexagonal outline to use as background for tiles

precision mediump float;

uniform vec3 color;
varying vec2 tcoord;

const float s3 = 0.8660254037844386;

void main (void) {
	vec2 pabs = abs(tcoord);
	float d = max(pabs.y, s3 * pabs.x + 0.5 * pabs.y);
	if (d > s3) discard;
	if (d > 0.9 * s3) {
		gl_FragColor = vec4(color * 0.6, 1.0);
	} else {
		gl_FragColor = vec4(color * 0.3, 1.0);
	}
}

