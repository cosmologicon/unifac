// Starscape fragment shader

precision mediump float;
varying float depth;

void main(void) {
	gl_FragColor = vec4(vec3(0.8, 0.8, 1.0) * depth, 1.0);
}

