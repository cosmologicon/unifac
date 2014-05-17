// Blob normal fragment shader

precision mediump float;

varying float r;
varying float rpix;
varying vec3 basenormal;
varying float z;

void main(void) {
	vec2 blobproj = (gl_PointCoord.xy - 0.5) * vec2(2.0, -2.0);
	float d = length(blobproj);
	if (rpix <= 0.0 || d > 1.0) discard;
	vec3 blobnormal = vec3(blobproj, sqrt(1.0 - d * d));

	float fbase = 0.6;
	vec3 normal = normalize(fbase * basenormal + (1.0 - fbase) * blobnormal);
	
	// TODO: put the depth into the alpha channel
	// Note that it really only makes sense if we can access the GL_EXT_Frag_Depth extension.
	// Otherwise the normals and colors will be inconsistent.
	float depth = z;
	gl_FragColor = (vec4(normal, depth) + 1.0) * 0.5;
}

