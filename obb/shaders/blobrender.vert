// Render from the blobscape to the screen

precision mediump float;

uniform vec2 tilelocation;
uniform float ntile;

uniform vec2 canvassize;
uniform vec2 center;  // viewport center
uniform vec2 scenter;  // shape center
uniform float scale;  // size of 1 unit in pixels
uniform mat2 rotation;
uniform float t;
uniform int jsquirm;
uniform float fsquirm;

attribute vec2 pos;

varying vec2 tcoord;
varying vec2 tpos;
varying float shadefactor;

vec2 squirm(vec2 p, float t) {
	return 0.08 * sin(vec2(p.y*19.876+0.7*t, p.x*12.923+0.8*t));
}

void main(void) {
	tcoord = (tilelocation + (pos + 1.0) * 0.5) / ntile;
	shadefactor = 1.0;
	vec2 p = rotation * pos + scenter;
	if (length(p) > 1.2) {
		p += fsquirm * squirm(p, t + (length(pos) > 0.5 ? 0.0 : 18.73) * float(jsquirm));
	}
	tpos = p;
	p = p - center;
	p = p * 2.0 * scale / canvassize;
	gl_Position = vec4(p, 0.0, 1.0);
}

