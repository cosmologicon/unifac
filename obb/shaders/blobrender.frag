precision mediump float;

uniform sampler2D sampler;

varying vec2 tcoord;

void main(void) {
	gl_FragColor = texture2D(sampler, tcoord);
}

