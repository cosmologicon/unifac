// Visible areas through the fog

precision mediump float;
// passed in from vertex shader
varying vec2 tcoord;
uniform float radius;

float ease(in float t) {
	return t * t * (3.0 - 2.0 * t);
}

void main(void) {
	float d = ease(clamp(2.0 * (1.0 - length(tcoord.xy)), 0.0, 1.0));
	gl_FragColor = vec4(0.0, 0.0, 0.0, d);
}

