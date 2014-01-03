// Blob fragment shader

precision mediump float;

varying float r;
varying float rpix;
varying vec3 acolor;

void main(void) {
	float d = distance(gl_PointCoord.xy, vec2(0.5, 0.5)) * 2.0 * rpix;
	if (d > rpix) discard;
	float a = clamp(rpix - 1.0 - d, 0.0, 1.0);
//	a = 1.0;
	gl_FragColor = vec4(acolor.rgb, a);
}

