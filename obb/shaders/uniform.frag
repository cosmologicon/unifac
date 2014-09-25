// Fill everything with a uniform color
// Use with cover.vert
// Not super useful on its own - intended to be used along with gl.blendFunc

precision mediump float;
uniform vec4 color;

void main(void) {
	gl_FragColor = color;
}

