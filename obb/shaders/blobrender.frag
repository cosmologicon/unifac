precision mediump float;

uniform sampler2D psampler;
uniform sampler2D nsampler;
uniform mat3 colormap;
uniform vec4 dlight;  // directional light
uniform vec4 plight0;  // point light 0
uniform mat2 rotation;

varying vec2 tcoord;
varying vec2 tpos;

void main(void) {
	vec4 color = texture2D(psampler, tcoord);

	vec3 p = vec3(tpos, 0.0); // TODO: this somehow needs to use depth for the z coordinate
	vec3 normal = texture2D(nsampler, tcoord).xyz * 2.0 - 1.0;
	normal.xy = rotation * normal.xy;

	float lfactor = clamp(dlight.w * dot(normal, dlight.xyz), 0.0, 0.4);

	vec3 rlight = plight0.xyz - p;
	lfactor += clamp(plight0.w * dot(normal, rlight) / dot(rlight, rlight), 0.0, 0.4);

	gl_FragColor = vec4((colormap * color.rgb) * (0.6 + clamp(lfactor, 0.0, 0.4)), color.a);
}

