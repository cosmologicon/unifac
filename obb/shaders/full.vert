// Cover the entire canvas.
// Game coordinates are passed along to the fragment shader.
// Used with: checker, paneltile, and lane fragment shaders.
// To restrict to a rectangular subregion of the canvas, use gl.scissor.

// To cover a rectangular region that you specify using game coordinates, see box.vert.

// The unit square is mapped to the entire canvas. Uniforms below specify the transformation into
// game coordinates, which is passed to the fragment shader.

// (x,y) position, where the visible area is the unit square 0 <= x, y < 1.
attribute vec2 pos;

uniform vec2 canvassize;  // size of the canvas in pixels
uniform vec2 center;  // position of the center of the canvas in game coordinates
uniform float zoom;   // pixels per game unit

// position in game coordinates
varying vec2 tcoord;

void main(void) {
    gl_Position = vec4(pos * 2.0 - 1.0, 1.0, 1.0);
    tcoord = center + (pos - 0.5) * canvassize / zoom;
}

