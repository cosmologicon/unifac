// Starscape vertex shader

attribute vec3 pos;
uniform vec2 canvassizeD;
uniform vec2 vcenterG;
uniform float DscaleG;

varying float depth;

void main(void) {
	vec2 p = mod(pos.xy - 0.001 * pos.z * DscaleG * vcenterG, 1.0);
    p = 2.0 * p - 1.0;
    gl_Position = vec4(p, 0.0, 1.0);
    gl_PointSize = 1.0;
    depth = pos.z;
}

