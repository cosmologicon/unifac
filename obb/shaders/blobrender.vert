// Render from the blobscape to the screen

uniform vec2 tilelocation;
uniform float ntile;

uniform vec2 canvassize;
uniform vec2 center;  // viewport center
uniform vec2 scenter;  // shape center
uniform float scale;  // size of 1 unit in pixels


attribute vec2 pos;

varying vec2 tcoord;

void main(void) {
    tcoord = (tilelocation + pos + 1.0) * 0.5 / ntile;
    vec2 p = (pos - (center - scenter)) * 2.0 * scale / canvassize;
    gl_Position = vec4(p, 0.0, 1.0);
}

