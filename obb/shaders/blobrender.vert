// Render from the blobscape to the screen

precision mediump float;

uniform vec2 tilelocation;
uniform float ntile;

uniform vec2 canvassizeD;
attribute vec2 posG;  // position of vertex with respect to shape center
uniform vec2 vcenterG;  // viewport center
uniform vec2 scenterG;  // shape center
uniform float DscaleG;  // size of 1 unit in pixels
uniform float rotC;
uniform float rotS;

// Squirm factors
attribute float jsquirm;
uniform float tsquirm;
uniform float fsquirm;

// Shading
attribute float shadefactor;


varying vec2 tcoord;
varying vec2 tpos;
varying float tshadefactor;

float tau = 6.283185307179586;

void main(void) {
	mat2 invrotation = mat2(rotC, -rotS, rotS, rotC);
	tcoord = (tilelocation + (invrotation * posG + 1.0) * 0.5) / ntile;
//	tcoord = (tilelocation + (posG + 1.0) * 0.5) / ntile;
	tshadefactor = shadefactor;
	vec2 pG = posG + scenterG;

	vec2 squirmG = jsquirm == 0.0 ? vec2(0.0, 0.0) : vec2(
		sin((12.0 + mod(jsquirm, 12.0)) * tau * tsquirm + 1.1 * jsquirm),
		sin((13.0 + mod(jsquirm, 13.0)) * tau * tsquirm + 1.7 * jsquirm)
	);

	pG += fsquirm * squirmG;
	tpos = pG;
	vec2 p = (pG - vcenterG) * 2.0 * DscaleG / canvassizeD;
	gl_Position = vec4(p, 0.0, 1.0);
}

