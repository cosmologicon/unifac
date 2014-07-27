precision mediump float;

uniform sampler2D csampler;
uniform sampler2D nsampler;
uniform vec4 dlight;  // directional light
uniform vec4 plight0;  // point light 0
uniform float rotC;
uniform float rotS;

varying vec2 tcoord;
varying vec2 posG;

void main(void) {
	vec4 color = texture2D(csampler, tcoord);
	vec3 normal = texture2D(nsampler, tcoord).xyz * 2.0 - 1.0;
	normal.xy = mat2(rotC, rotS, -rotS, rotC) * normal.xy;

	float lfactor = max(dlight.w * dot(normal, dlight.xyz), 0.0);
	vec3 p = vec3(posG, 0.0);
	vec3 rlight = plight0.xyz - p;
	lfactor += max(plight0.w * dot(normal, rlight) / dot(rlight, rlight), 0.0);

	vec3 bcolor = color.rgb * (0.6 + 0.4 * min(lfactor, 1.0));
	
	gl_FragColor = vec4(bcolor, color.a);
}

