precision mediump float;

uniform sampler2D sampler;
uniform vec3 bordercolor;
uniform float alpha;
uniform float cosmu;
uniform float sinmu;
uniform float Climit;

varying vec2 tpos;

void main(void) {
	vec4 color = texture2D(sampler, tpos);
	float cvalue = color.r;
	float C = cosmu * (2.0 * color.g - 1.0) + sinmu * (2.0 * color.b - 1.0);
	cvalue = max(cvalue, C > Climit ? 1.0 : 0.0);
	gl_FragColor = vec4(bordercolor, cvalue * alpha * color.a);
}

