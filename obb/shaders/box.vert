// Maps the unit square to a rectangle of size size centered at world coordinates pcenter
// The texture coordinates go form (-1, -1) to (1, 1)

attribute vec2 pos;

uniform vec2 canvassize;
uniform vec2 center;  // viewport center
uniform float zoom;

uniform vec2 size;  // box size
uniform vec2 pcenter;   // box center

varying vec2 tcoord;

void main(void) {
    tcoord = (pos - 0.5) * 2.0;
    vec2 p = (pcenter - center + (pos - 0.5) * size) * 2.0 * zoom / canvassize;
    gl_Position = vec4(p, 1.0, 1.0);
}

