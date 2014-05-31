// Render from the blobscape to the screen

precision mediump float;

uniform vec2 tilelocation;
uniform float ntile;

uniform vec2 canvassizeD;
attribute vec2 posG;  // position of vertex with respect to shape center
uniform vec2 vcenterG;  // viewport center
uniform vec2 scenterG;  // shape center
uniform float VscaleG;  // size of 1 unit in screen pixels
uniform float DcscaleG;  // size of 1 unit in blobscape pixels for the color tile
uniform float DnscaleG;  // size of 1 unit in blobscape pixels for the normal tile
uniform vec2 cposD0;  // center of the color tile within the blobscape
uniform vec2 nposD0;  // center of the normal tile within the blobscape
uniform float rotC;
uniform float rotS;

// Squirm factors
attribute float jsquirm;
uniform float tsquirm;
uniform float fsquirm;

// Shading
attribute float shadefactor;

// coordinates within the tile (within the unit circle) in the rotated frame before any squirming
// used to locate the image on the blobscape texture
varying vec2 tcoordG;
// Overall game coordinates (used for lighting calculations)
varying vec2 tposG;

varying float tshadefactor;

float tau = 6.283185307179586;

void main(void) {
	mat2 invrotation = mat2(rotC, -rotS, rotS, rotC);
	tcoordG = invrotation * posG;

	tshadefactor = shadefactor;
	vec2 pG = posG + scenterG;
	vec2 squirmG = jsquirm == 0.0 ? vec2(0.0, 0.0) : vec2(
		sin((12.0 + mod(jsquirm, 12.0)) * tau * tsquirm + 1.1 * jsquirm),
		sin((13.0 + mod(jsquirm, 13.0)) * tau * tsquirm + 1.7 * jsquirm)
	);
	pG += fsquirm * squirmG;
	tposG = pG;
	vec2 p = (pG - vcenterG) * 2.0 * VscaleG / canvassizeD;
	gl_Position = vec4(p, 0.0, 1.0);
}

