// Blob outline fragment shader

precision mediump float;

varying float rpix;

void main(void) {
	float d = distance(gl_PointCoord.xy, vec2(0.5, 0.5)) * 2.0 * rpix;
	if (rpix <= 0.0 || d > rpix) discard;
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}

