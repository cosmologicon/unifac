// Blob normal vertex shader

attribute vec3 pos;
attribute float rad;
attribute vec3 normal;
attribute float f;

uniform vec2 canvassize;
uniform float scale;  // size of 1 unit in pixels
uniform float progress;

varying float r;
varying float rpix;
varying vec3 basenormal;
varying float z;

void main(void) {
    vec2 p = pos.xy * (2.0 * scale) / canvassize;
    gl_Position = vec4(p, 0.0, 1.0);

    r = rad;
    rpix = progress > f ? rad * scale : -1.0;
    gl_PointSize = 2.0 * rpix;

    z = pos.z;
    basenormal = normal;
}



