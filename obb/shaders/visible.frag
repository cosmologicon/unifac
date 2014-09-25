// Visible areas, used for the fog shader

precision mediump float;
// passed in from vertex shader
varying vec2 tcoord;

void main(void) {
	float d = smoothstep(-1.0, -0.5, -length(tcoord.xy));
	gl_FragColor = vec4(0.0, 0.0, 0.0, d);
}

