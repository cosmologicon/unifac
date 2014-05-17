// Maps the unit square a rectangle of size with lower left corner at screen coordinates boxcorner
// Pass in uniforms:
//   canvassize
//   size
//   boxcorner

// Also generates texture coordinates that run over the unit square

attribute vec2 pos;

uniform vec2 canvassize;

uniform vec2 size;  // box size
uniform vec2 boxcorner;   // box corner

varying vec2 tcoord;

void main(void) {
	tcoord = pos;
    vec2 p = (boxcorner + pos * size) * 2.0 / canvassize - 1.0;
    gl_Position = vec4(p, 1.0, 1.0);
}

