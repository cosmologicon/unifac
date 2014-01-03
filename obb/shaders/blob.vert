// Blob vertex shader
// z coordinate is ignored - blobs should be sorted by z-coordinate


attribute vec4 spec;  // x,y,z,r tuples
attribute vec3 color;

uniform vec2 canvassize;
uniform vec2 center;  // viewport center
uniform float scale;  // size of 1 unit in pixels

varying float r;
varying float rpix;
varying vec3 acolor;

void main(void) {
    vec2 p = (spec.xy - center) * 2.0 * scale / canvassize;
    gl_Position = vec4(p, 0.0, 1.0);

    r = spec.w;
    rpix = spec.w * scale;
    gl_PointSize = 2.0 * rpix;
    
    acolor = color;  // pass it along to the fragment shader
}



