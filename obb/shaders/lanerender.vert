// Render from the lanescape to the screen
// Simplified version of the blobscape rendering shader

precision mediump float;

uniform vec2 tilelocation;
uniform float ntile;

uniform vec2 canvassizeD;
uniform float scapesizeD;
attribute vec2 posG;  // position of vertex with respect to shape center
uniform vec2 vcenterG;  // viewport center
uniform vec2 scenterG;  // shape center
uniform float VscaleG;  // size of 1 unit in screen pixels
uniform float DscaleG;  // size of 1 unit in lanescape pixels
uniform vec2 posD0;  // center of the tile within the lanescape
uniform float rotC;
uniform float rotS;

varying vec2 tpos;  // position within the lanescape

void main(void) {
	mat2 rot = mat2(rotC, -rotS, rotS, rotC);
	tpos = (posD0 + DscaleG * (rot * posG)) / scapesizeD;

	vec2 pG = posG + scenterG;  // game coordinate of vertex
	vec2 p = (pG - vcenterG) * 2.0 * VscaleG / canvassizeD;
	gl_Position = vec4(p, 0.0, 1.0);
}

