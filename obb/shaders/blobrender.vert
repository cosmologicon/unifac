// Render from the blobscape to the screen

precision mediump float;

uniform vec2 tilelocation;
uniform float ntile;

uniform vec2 canvassize;
uniform vec2 center;  // viewport center
uniform vec2 scenter;  // shape center
uniform float scale;  // size of 1 unit in pixels
uniform mat2 rotation;

attribute vec2 pos;

varying vec2 tcoord;
varying vec2 tpos;

void main(void) {
	tcoord = (tilelocation + (pos + 1.0) * 0.5) / ntile;
	tpos = rotation * pos + scenter;
	vec2 p = (rotation * pos + scenter - center) * 2.0 * scale / canvassize;
	gl_Position = vec4(p, 0.0, 1.0);
}

