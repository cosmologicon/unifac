// Cover a box, specified in world coordinates.
// Used with visible.frag for the fog shader.

// Expects a unit square for pos.

// Maps the unit square to a rectangle of size size centered at world coordinates pcenter
// The fragment shader coordinates go from (-1, -1) to (1, 1)

// (x,y) position, where the visible area is the unit square 0 <= x, y < 1.
attribute vec2 pos;

uniform vec2 canvassize;  // size of the canvas in pixels
uniform vec2 center;  // position of the center of the canvas in game coordinates
uniform float zoom;   // pixels per game unit

uniform vec2 size;  // box size in game coordinates
uniform vec2 pcenter;   // box center in game coordinates

varying vec2 tcoord;

void main(void) {
    tcoord = (pos - 0.5) * 2.0;
    vec2 p = (pcenter - center + (pos - 0.5) * size) * 2.0 * zoom / canvassize;
    gl_Position = vec4(p, 1.0, 1.0);
}

