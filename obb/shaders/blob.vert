// Blob vertex shader

// A single blob is a circular point with certain properties.
// (xG, yG, zG) - position in 3-space. The z-coordinate is ignored within the shader. Blobs are
//   assumed to be sorted by z-component in the client.
// rG - radius in game units.
// (nx, ny, nz) - normal
// (c1, c2, c3) - colors in the 3 principle channels
// (ar, ag, ab) - additional color
// f - progress factor

// It's recommended to pack the blob spec like this, with a stride of 14*sizeof(float):
// xG, yG, zG, rG, nx, ny, nz, c1, c2, c3, ar, ag, ab, f

attribute vec3 pos;
attribute float rad;
attribute vec3 pcolor;  // color within the principle channels
attribute vec3 acolor;  // color within the additional color channels
attribute float f;

uniform vec2 canvassize;
uniform float scale;  // size of 1 unit in pixels
uniform float progress;
uniform mat3 colormap;  // map of principle colors to rgb

varying float r;
varying float rpix;
varying vec3 color;

void main(void) {
    vec2 p = pos.xy * (2.0 * scale) / canvassize;
    gl_Position = vec4(p, 0.0, 1.0);

    r = rad;
    rpix = progress > f ? rad * scale : -1.0;
    gl_PointSize = 2.0 * rpix;

	color = colormap * pcolor + acolor;  // Combine principle and additional colors
}



