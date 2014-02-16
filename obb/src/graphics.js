// Abstracts away most of the GL calls from the other modules


var canvas = null, gl = null

var graphics = {
	progs: {},  // GL programs

	init: function () {
		canvas = document.getElementById("canvas")
		// TODO: Firefox gives an error here:
		// Error: WebGL: Retrieving a WebGL context from a canvas via a request id ('webgl') different from the id used to create the context ('experimental-webgl') is not allowed.
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
		// TODO: better error message for missing webgl
		if (!gl) throw "Unable to get webgl context"
		UFX.maximize.fill(canvas, "total")

		gl.clearColor(0, 0, 0, 1)

		this.initunitsquare()

		this.progs.checker = glprog(UFX.resource.data.fullvert, UFX.resource.data.checkerfrag)
		this.progs.blob = glprog(UFX.resource.data.blobvert, UFX.resource.data.blobfrag)
		this.progs.blobrender = glprog(UFX.resource.data.blobrendervert, UFX.resource.data.blobrenderfrag)
		
		debugHUD.alert("max texture: " + gl.getParameter(gl.MAX_TEXTURE_SIZE) + " " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS))
	},

	clear: function () {
		gl.viewport(0, 0, canvas.width, canvas.height)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
	},

	setviewportD: function (xD, yD, wD, hD) {
		gl.viewport(xD, yD, wD, hD)
	},
		
	// The unit square buffer is used in several shaders that operate in rectangular areas.
	// By calling drawunitsquare a unit square is passed into the specified attribute
	initunitsquare: function () {
		this.unitsquarebuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.unitsquarebuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,1,0,1,1,0,1]), gl.STATIC_DRAW)
	},
	drawunitsquare: function (attrib) {
		gl.enableVertexAttribArray(attrib)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.unitsquarebuffer)
		gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
	},

	openscreenshot: function () {
		// TODO: this doesn't work because I don't preserve the drawing buffer.
		window.open(canvas.toDataURL())
	},

}	



