// Abstracts away most of the GL calls from the other modules


var canvas = null, gl = null

var graphics = {
	progs: {},  // GL programs

	init: function () {
		canvas = document.getElementById("canvas")
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
		// TODO: better error message for missing webgl
		if (!gl) throw "Unable to get webgl context"
		UFX.maximize.fill(canvas, "total")

		gl.clearColor(0, 0, 0, 1)

		this.initunitsquare()
	},

	clear: function () {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
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
		gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.unitsquarebuffer)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
	},

}	



