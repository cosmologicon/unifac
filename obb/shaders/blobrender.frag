precision mediump float;

uniform sampler2D psampler;
uniform sampler2D nsampler;
uniform sampler2D asampler;
uniform mat3 colormap;
uniform vec4 dlight;  // directional light
uniform vec4 plight0;  // point light 0
uniform float rotC;
uniform float rotS;

varying vec2 tcoord;
varying vec2 tpos;
varying float tshadefactor;  // 0.0 = gray, 1.0 = full color

void main(void) {
	vec4 color = texture2D(psampler, tcoord);
	color.rgb = colormap * color.rgb;
	color.rgb += texture2D(asampler, tcoord).rgb;

	vec3 p = vec3(tpos, 0.0); // TODO: this somehow needs to use depth for the z coordinate
	vec3 normal = texture2D(nsampler, tcoord).xyz * 2.0 - 1.0;
	mat2 rotation = mat2(rotC, rotS, -rotS, rotC);
	normal.xy = rotation * normal.xy;

	float lfactor = max(dlight.w * dot(normal, dlight.xyz), 0.0);

	vec3 rlight = plight0.xyz - p;
	lfactor += max(plight0.w * dot(normal, rlight) / dot(rlight, rlight), 0.0);

	vec3 bcolor = color.rgb * (0.6 + 0.4 * min(lfactor, 1.0));
	
	// http://stackoverflow.com/questions/687261/converting-rgb-to-grayscale-intensity
	float gshade = 0.5 * dot(bcolor, vec3(0.2989, 0.5870, 0.1140));
	vec3 gcolor = vec3(gshade);

	float shadefactor = clamp(1.0 - 4.0 * (1.0 - tshadefactor), 0.2, 1.0);
	gl_FragColor = vec4((1.0 - shadefactor) * gcolor + shadefactor * bcolor, color.a);
}

