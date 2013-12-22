// Red and green checkerboard in world coordinates

precision mediump float;
varying vec2 tcoord;

const float s3 = 1.73205080757;
void main(void) {
/*
	if (floor(mod(tcoord.x, 2.0)) == floor(mod(tcoord.y, 2.0))) {
		gl_FragColor = vec4(0.3, 0.25, 0.25, 1.0);
	} else {
		gl_FragColor = vec4(0.25, 0.3, 0.25, 1.0);
	}
*/
	// Convert to hex coordinates
	float xh = 4.0 * tcoord.x;
	float yh = -2.0 * tcoord.x + 2.0 * s3 * tcoord.y;
	
	float d = floor(xh / 6.0) - floor(yh / 6.0);
	xh = mod(xh, 6.0);
	yh = mod(yh, 6.0);
	// Algorithm for nearest hex
	float A = xh - yh;
	float B = xh + 2.0 * yh;
	float C = 2.0 * xh + yh;
	if (B < 6.0 && C < 6.0) {
	} else if (B > 12.0 && C > 12.0) {
	} else if (A > 0.0) {
		d += 1.0;
	} else {
		d -= 1.0;
	}
	// TODO: tablet fails along the section -1 < yh < 0 without this +0.01. Investigate.
	int id = int(mod(d + 0.01, 3.0));
	if (id == 0) {
		gl_FragColor = vec4(0.3, 0.25, 0.25, 1.0);
	} else if (id == 1) {
		gl_FragColor = vec4(0.25, 0.3, 0.25, 1.0);
	} else {
		gl_FragColor = vec4(0.25, 0.25, 0.3, 1.0);
	}
}

