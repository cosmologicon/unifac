// Blob fragment shader

precision mediump float;

varying float r;
varying float rpix;
varying vec3 color;

void main(void) {
	float d = distance(gl_PointCoord.xy, vec2(0.5, 0.5)) * 2.0 * rpix;
	if (rpix <= 0.0 || d > rpix) discard;
	// TODO: looks weird (white outlines). What's up with that?
	//float a = clamp(rpix - d, 0.0, 1.0);

	float a = 1.0;
	gl_FragColor = vec4(color, a);
}

