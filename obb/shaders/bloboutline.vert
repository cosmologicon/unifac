// Blob outline vertex shader

attribute vec3 pos;
attribute float rad;
attribute float f;

uniform vec2 canvassize;
uniform float scale;  // size of 1 unit in pixels
uniform float progress;
uniform float width;

varying float rpix;

void main(void) {
    vec2 p = pos.xy * (2.0 * scale) / canvassize;
    gl_Position = vec4(p, 0.0, 1.0);

    rpix = progress > f ? (rad + width) * scale : -1.0;
    gl_PointSize = 2.0 * rpix;
}



