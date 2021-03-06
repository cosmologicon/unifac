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

		this.initunitsquare()

		this.progs.uniform = glprog(UFX.resource.data.coververt, UFX.resource.data.uniformfrag)
		this.progs.checker = glprog(UFX.resource.data.fullvert, UFX.resource.data.checkerfrag)
		this.progs.paneltile = glprog(UFX.resource.data.fullvert, UFX.resource.data.paneltilefrag)
		this.progs.grid = glprog(UFX.resource.data.gameposvert, UFX.resource.data.uniformfrag)
		this.progs.blob = glprog(UFX.resource.data.blobvert, UFX.resource.data.blobfrag)
		this.progs.blobnormal = glprog(UFX.resource.data.blobnormalvert, UFX.resource.data.blobnormalfrag)
		this.progs.bloboutline = glprog(UFX.resource.data.bloboutlinevert, UFX.resource.data.bloboutlinefrag)
		this.progs.blobrender = glprog(UFX.resource.data.blobrendervert, UFX.resource.data.blobrenderfrag)
		this.progs.starscape = glprog(UFX.resource.data.starscapevert, UFX.resource.data.starscapefrag)
		this.progs.spriterender = glprog(UFX.resource.data.spriterendervert, UFX.resource.data.spriterenderfrag)
		this.progs.lane = glprog(UFX.resource.data.fullvert, UFX.resource.data.lanefrag)
		this.progs.lanerender = glprog(UFX.resource.data.lanerendervert, UFX.resource.data.lanerenderfrag)
		this.progs.fogvisible = glprog(UFX.resource.data.boxvert, UFX.resource.data.visiblefrag)
		
		debugHUD.alert("max texture: " + gl.getParameter(gl.MAX_TEXTURE_SIZE) + " " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS))
	},

	clear: function () {
		gl.clearColor(0, 0, 0, 1)
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

		this.unithexbuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.unithexbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,-1,0,-0.5,-s3,0.5,-s3,1,0,0.5,s3,-0.5,s3,-1,0]), gl.STATIC_DRAW)

	},
	drawunitsquare: function (attrib) {
		gl.enableVertexAttribArray(attrib)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.unitsquarebuffer)
		gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
	},

	// Set the alpha channel to 0 everywhere (used for the fog shader).
	zeroalpha: function () {
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.ZERO, gl.SRC_COLOR)
		this.progs.uniform.use()
		this.progs.uniform.setcolor(1, 1, 1, 0)
		this.drawunitsquare(this.progs.uniform.attribs.pos)
	},

	// Set the alpha channel to 1 everywhere. This should be called at the end of the drawing loop
	// because webGL allows the canvas to bleed through to the background color
	onealpha: function () {
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.ONE, gl.ONE)
		this.progs.uniform.use()
		this.progs.uniform.setcolor(0, 0, 0, 1)
		this.drawunitsquare(this.progs.uniform.attribs.pos)
	},

	openscreenshot: function () {
		if (!settings.canscreenshot) return false
		// TODO: this doesn't work because I don't preserve the drawing buffer.
		window.open(canvas.toDataURL())
		return true
	},

}	



