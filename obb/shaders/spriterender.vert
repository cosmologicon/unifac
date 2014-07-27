// Render from the spritescape to the screen

precision mediump float;

attribute vec2 spos;  // (unitless) position along the unit square
uniform vec2 posD0;  // lower-left corner of sprite on the spritescape in spritescape pixels
uniform vec2 spritesizeD;  // (w,h) of the sprite in spritescape pixels
uniform float DscaleG;  // size of 1 unit in spritescape pixels
uniform vec2 canvassizeD; // size of the panel in pixels
uniform vec2 vcenterG;  // center of the panel in game coordinates
uniform float VscaleG;  // size of 1 game unit in screen pixels
uniform float scapesizeD;  // size of the spritescape in pixels
uniform vec2 centerG;  // game coordinate of center of sprite
uniform float rotC;  // rotation matrix values
uniform float rotS;

varying vec2 tcoord;  // unitless texture coordinate within the spritescape
varying vec2 posG;  // game coordinates (used in the fragment shader for lighting calculations)

void main(void) {
	vec2 spritesizeG = spritesizeD / DscaleG;  // (w,h) size of the sprite in game coordinates
	vec2 aposG = (spos - 0.5) * spritesizeG;  // game coordinate position relative to center of sprite
	posG = centerG + mat2(rotC, -rotS, rotS, rotC) * aposG;

	vec2 posD = (posG - vcenterG) * VscaleG;  // position in device pixels relative to canvas cetner
	vec2 p = posD * 2.0 / canvassizeD;  // unitless position scaled to (-1,1)
	gl_Position = vec4(p, 0.0, 1.0);

	tcoord = (posD0 + spritesizeD * spos) / scapesizeD;
}

