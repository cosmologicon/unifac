
var canvas = document.getElementById("canvas")
canvas.width = settings.scr_w
canvas.height = settings.scr_h
var gl = canvas.getContext("webgl", { antialias: true })

var graphics = {
	init: function () {
		function makeshader(gl, scriptId, shaderType) {
			var shader = gl.createShader(shaderType)
			var shaderScript = document.getElementById(scriptId)
			gl.shaderSource(shader, shaderScript.text)
			gl.compileShader(shader)
			return shader
		}
		var program = gl.createProgram()
		gl.attachShader(program, makeshader(gl, "2d-vertex-shader", gl.VERTEX_SHADER))
		gl.attachShader(program, makeshader(gl, "2d-fragment-shader", gl.FRAGMENT_SHADER))
		gl.linkProgram(program)
		gl.useProgram(program)
		this.colorLocation = gl.getUniformLocation(program, "color")
		this.positionLocation = gl.getAttribLocation(program, "pos")
		this.xform = gl.getUniformLocation(program, "xform")
		
		this.matrix0 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
		this.xforms.push(this.matrix0)

		this.clearps = new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1])

		var buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.enableVertexAttribArray(this.positionLocation)
		gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0)

		// Converrt JSONed imagedata into Float32Arrays
		for (var sname in imagedata) {
			var paths = imagedata[sname].paths
			for (var j = 0 ; j < paths.length ; ++j) {
				paths[j] = new Float32Array(paths[j])
			}
		}

		this.W = 2/canvas.width
		this.H = 2/canvas.height
		this.cx = 0
		this.cy = 0
		this.cz = 1
	},
	xforms: [],
	clear: function(color) {
		color = color || [0, 0, 0]
		gl.uniformMatrix4fv(this.xform, false, this.matrix0)
		gl.bufferData(gl.ARRAY_BUFFER, this.clearps, gl.STATIC_DRAW)
		gl.uniform4f(this.colorLocation, color[0], color[1], color[2], 1)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
	},
	setxform: function (x, y, s, r) {
		var S = r ? Math.sin(r) : 0, C = r ? Math.cos(r) : 1
		s = s || 1
		x = x || 0
		y = y || 0
		var arr = new Float32Array([
			this.cz*this.W*C*s, -this.cz*this.H*S*s, 0, 0,
			this.cz*this.W*S*s, this.cz*this.H*C*s, 0, 0,
			0, 0, 1, 0,
			(x-this.cx)*this.cz*this.W, (y-this.cy)*this.cz*this.H, 0, 1
		])
		gl.uniformMatrix4fv(this.xform, false, arr)
	},
	drawlinestrip: function (ps, color) {
		gl.bufferData(gl.ARRAY_BUFFER, ps, gl.STATIC_DRAW)
		gl.uniform4f(this.colorLocation, color[0], color[1], color[2], 1)
		gl.drawArrays(gl.LINE_STRIP, 0, ps.length / 2)
	},
	drawsprite: function (name, color, x, y, h, r) {
		var idata = imagedata[name]
		this.setxform(x, y, h / idata.height, r)
		idata.paths.forEach(function (ps, j) {
			graphics.drawlinestrip(ps, color)
		})
	},
}



