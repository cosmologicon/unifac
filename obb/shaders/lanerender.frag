precision mediump float;

uniform sampler2D sampler;
uniform vec3 bordercolor;
uniform float alpha;

varying vec2 tpos;

void main(void) {
	vec4 color = texture2D(sampler, tpos);
	gl_FragColor = vec4(bordercolor * color.r, alpha * color.a);
}

