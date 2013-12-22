// Cover the entire canvas
// Pass in uniforms:
//   canvassize (in pixels)
//   center (position in world coordinates)
//   zoom (pixels per world unit)

// (x,y) position
attribute vec2 pos;

uniform vec2 canvassize;
uniform vec2 center;
uniform float zoom;

// to pass the texture coordinate to the fragment shader
varying vec2 tcoord;

void main(void) {
    gl_Position = vec4(pos * 2.0 - 1.0, 1.0, 1.0);
    tcoord = center + (pos - 0.5) * canvassize / zoom;
}

