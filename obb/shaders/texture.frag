// Draw a specified texture

precision mediump float;
// the texture
uniform sampler2D sampler;

// passed in from vertex shader
varying vec2 tcoord;

void main(void) {
    gl_FragColor = texture2D(sampler, tcoord);
}

