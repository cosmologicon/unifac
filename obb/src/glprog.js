// Create a GL program with some convenience functions for setting uniforms
// The arguments for vertex shader and fragment shader should be either (1) strings of the shader
//   themselves, (2) a DOM element of the shader, or (3) the document ID of the shader script

// The program will automatically create some methods to set uniforms. For a uniform named "x",
// these will have the form prog.setx or prog.vsetx, depending on the type of x and the form of
// the arguments. I tried to provide the most useful functions while mirroring the webGL API where
// possible, but it's a bit confusing. Here's the rules....

// For non-array scalar or non-array vector uniforms, use either the "set" or "vset" form:
//   uniform int x;
//   prog.setx(10)
//   prog.vsetx([10])
//   uniform vec2 y;
//   prog.sety(1, 2)
//   prog.vsety([1, 2])

// For array scalar or array vector uniforms, use the "vset" form:
//   uniform int a[3];
//   prog.vseta([10, 11, 12])
//   uniform vec2 b[3];
//   prog.vsetb([1, 2, 3, 4, 5, 6])
// It's permissable to use a shorter array. This will set the first elements of the array on the
// shader accordingly.

// For both non-array and array matrix uniforms, use the "vset" form.
//   uniform mat3 m;
//   prog.vsetm([1, 2, 3, 4, 5, 6, 7, 8, 9])
//   uniform mat2 z[2];
//   prog.vsetz([1, 2, 3, 4, 5, 6, 7, 8])
// Do not include a transpose argument.

// Attribute locations will appear on the objects prog.attribs. eg with the following line:
//   attribute int x;
// means the location of this attribute will be prog.attribs.x.

function glprog(vshader, fshader, _gl) {
	if (this === window) return new glprog(vshader, fshader, _gl)
	this.gl = _gl || gl
	this.declines = []
	this.vshader = this.createshader(vshader, this.gl.VERTEX_SHADER)
	this.fshader = this.createshader(fshader, this.gl.FRAGMENT_SHADER)
	this.makeprogram()
	this.getlocations()
}
glprog.prototype = {
	enabledattribs: {},
	createshader: function (scriptId, shaderType) {
		var shader = this.gl.createShader(shaderType)
		
		var shaderScript, text, prog = this
		if (scriptId.split) {
			shaderScript = document.getElementById(scriptId)
			text = shaderScript ? shaderScript.text : scriptId
		} else {
			text = scriptId.text
		}
		// Get lines in which attributes and uniforms are declared.
		this.declines.push.apply(this.declines, text.split("\n").map(function (line) {
			return line.replace(/\/\/.*/g, "").replace(/;/g, "").replace(/,/g, " ").trim().split(/\s+/)
		}).filter(function (words) {
			return words[0] == "attribute" || words[0] == "uniform"
		}))
		this.gl.shaderSource(shader, text)
		this.gl.compileShader(shader)

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			throw "shader compile error: " + this.gl.getShaderInfoLog(shader)
		}

		return shader
	},
	makeprogram: function () {
		this.program = this.gl.createProgram()
		this.gl.attachShader(this.program, this.vshader)
		this.gl.attachShader(this.program, this.fshader)
		this.gl.linkProgram(this.program)
		if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
			throw "program link error: " + this.gl.getProgramInfoLog(this.program)
		}
	},
	getlocations: function () {
		this.use()
		var prog = this
		this.attribs = {}
		this.uniforms = {}
		this.declines.forEach(function (words) {
			if (words[0] == "attribute") {
				for (var j = 2 ; j < words.length ; ++j) {
					prog.makeattrib(words[j])
				}
			} else if (words[0] == "uniform") {
				var type = words[1]
				for (var j = 2 ; j < words.length ; ++j) {
					var uname = words[j]
					var umatch = /(.*)\[(.*)\]/.exec(uname)
					if (umatch) {
						var uname = umatch[1], veclength = +umatch[2]
						prog.makeuniform(uname, type, veclength)
					} else {
						prog.makeuniform(uname, type)
					}
				}
			}
		})
	},
	makeattrib: function (aname) {
		this.attribs[aname] = this.gl.getAttribLocation(this.program, aname)
	},
	makeuniform: function (uname, type, veclength) {
		var uniloc = this.uniforms[uname] = this.gl.getUniformLocation(this.program, uname)
		var ismatrix = type.indexOf("mat") == 0
		// "set"-form functions are available for non-array scalar and vector uniforms.
		var setfunc = !veclength && !ismatrix ? this.gl["uniform" + this.utypesetters[type]] : null
		// "vset"-form functions are always available.
		var vsetfunc = this.gl["uniform" + this.utypesetters[type] + "v"]
		
		if (ismatrix) {
			this["vset" + uname] = vsetfunc.bind(this.gl, uniloc, false)
		} else {
			if (setfunc) this["set" + uname] = setfunc.bind(this.gl, uniloc)
			this["vset" + uname] = vsetfunc.bind(this.gl, uniloc)
		}

		if (settings.DEBUG) {
			var error = "Error setting " + uname + " of type " + type
			if (veclength) error += "[" + veclength + "]"
			if (setfunc) {
				var argc = +this.utypesetters[type][0] || 1
				this["set" + uname] = this.checkargc(this["set" + uname], argc, error)
			}
			this["vset" + uname] = this.checkargc(this["vset" + uname], 1, error)
		}
	},
	// Decorator to check the argument length before invoking function
	checkargc: function (func, argc, error) {
		return function () {
			if (arguments.length != argc) {
				throw error + " (got " + arguments.length + " args, want " + argc + ")"
			}
			func.apply(this, arguments)
		}
	},
	// Call useProgram and also make sure the set of enabled vertex attrib arrays matches the
	// new program.
	use: function () {
		this.gl.useProgram(this.program)
		// TODO: seems disabling is not necessary http://stackoverflow.com/a/12436127/779948
		for (var a in this.enabledattribs) {
			this.gl.disableVertexAttribArray(a)
			delete this.enabledattribs[a]  // NB: this is safe http://es5.github.io/#x12.6.4
		}
		for (var a in this.attribs) {
			this.gl.enableVertexAttribArray(this.attribs[a])
			this.enabledattribs[this.attribs[a]] = 1
		}
	},
	set: function(name) {
		this.uniformsetters[name].apply(this.gl, [].slice.call(arguments, 1))
	},
	finish: function () {
		for (var a in this.attribs) {
			this.gl.disableVertexAttribArray(this.attribs[a])
		}
	},
	utypesetters: {
		bool: "1i",  // TODO: test
		int: "1i",
		float: "1f",
		vec2: "2f", vec3: "3f", vec4: "4f",
		bvec2: "2i", bvec3: "3i", bvec4: "4i",
		ivec2: "2i", ivec3: "3i", ivec4: "4i",
		mat2: "Matrix2f", mat3: "Matrix3f", mat4: "Matrix4f",
		sampler2D: "1i", samplerCube: "1i", // TODO: test
	},
}

