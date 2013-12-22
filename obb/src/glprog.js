// Create a GL program with some convenience functions for setting uniforms
// The arguments for vertex shader and fragment shader should be either (1) strings of the shader
//   themselves, (2) a DOM element of the shader, or (3) the document ID of the shader script

// The program will automatically create some methods to set uniforms. eg the following line:
//   uniform int x;
// means that the uniform x can be set like this:
//   prog.setx(10)

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
	createshader: function (scriptId, shaderType) {
		var shader = this.gl.createShader(shaderType)
		
		var shaderScript, text, prog = this
		if (scriptId.split) {
			shaderScript = document.getElementById(scriptId)
			text = shaderScript ? shaderScript.text : scriptId
		} else {
			text = scriptId.text
		}
		// Recognizes uniform and attribute declaration lines of the form
		// uniform vartype varname; // optional comment
		// TODO: can you have multiple values declared on a single line?
		this.declines.push.apply(this.declines, text.split("\n").map(function (line) {
			return line.replace(/\/\/.*/g, "").replace(/;/g, "").trim().split(/\s+/)
		}).filter(function (words) {
			return words.length == 3 && (words[0] == "attribute" || words[0] == "uniform")
		}))
		this.gl.shaderSource(shader, text)
		this.gl.compileShader(shader)

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			throw "shader compile error:" + this.gl.getShaderInfoLog(shader)
		}

		return shader
	},
	makeprogram: function () {
		this.program = this.gl.createProgram()
		this.gl.attachShader(this.program, this.vshader)
		this.gl.attachShader(this.program, this.fshader)
		this.gl.linkProgram(this.program)
	},
	getlocations: function () {
		this.use()
		var prog = this
		this.attribs = {}
		this.uniforms = {}
		this.uniformsetters = {}
		this.declines.forEach(function (words) {
			if (words[0] == "attribute") {
				prog.attribs[words[2]] = prog.gl.getAttribLocation(prog.program, words[2])
			} else if (words[0] == "uniform") {
				var uni = prog.uniforms[words[2]] = prog.gl.getUniformLocation(prog.program, words[2])
				var setfunc = prog.gl["uniform" + prog.utypesetters[words[1]]]
				prog["set" + words[2]] = prog.uniformsetters[words[2]] = setfunc.bind(prog.gl, uni)
			}
		})
	},
	use: function () {
		this.gl.useProgram(this.program)
	},
	set: function(name) {
		this.uniformsetters[name].apply(this.gl, [].slice.call(arguments, 1))
	},
	utypesetters: {
		float: "1f",
		vec2: "2f",
		vec3: "3f",
		vec4: "4f",
		int: "1i",
		sampler2D: "1i",
	},
}

