// Convert game position to screen position

attribute vec2 posG;

uniform vec2 canvassizeD;
uniform vec2 vcenterG;
uniform float DscaleG;

void main(void) {
    vec2 posD = DscaleG * (posG - vcenterG);
    vec2 p = posD / canvassizeD;
    gl_Position = vec4(2.0 * p, 1.0, 1.0);
}

