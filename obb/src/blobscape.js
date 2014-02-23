// Managing the blobscape: the procedurally-generated texture atlases used for rendering objects
// (body parts) that use the blob shader

// Textures 5, 6, and 7 are reserved for the blobscape. They're used for the primary color channel
// (plus alpha), the additional color channel, and the normals, respectively.

// A blob shape is a set of blobs, each of which has the following properties:

// x, y, z, r, c0, c1, c2, nx, ny, nz, f



var blobscape = {
	init: function () {
		this.rawdata = {}
		this.blobspecs = {}

		this.nmade = 0
		this.made = {}
		
		this.ntile = 8
		var s = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 4096)
		this.scale = 16
		while (this.scale * this.ntile * 4 <= s) this.scale *= 2
		if (this.scale < 32) throw "blobscape texture is too small"

		this.tilesize = this.scale * 2
		this.scapesize = this.ntile * this.tilesize

		debugHUD.alert("blobscape scale " + this.scale)
		debugHUD.alert("blobscape size " + this.scapesize + "x" + this.scapesize)

		this.posbuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posbuffer)
		var s = Math.sqrt(3)/2
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,-1,0,-0.5,-s,0.5,-s,1,0,0.5,s,-0.5,s,-1,0]), gl.STATIC_DRAW)
		
		gl.activeTexture(gl.TEXTURE0 + 5)
		this.ptexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.ptexture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.scapesize, this.scapesize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		this.pfbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pfbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ptexture, 0)
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)

		gl.activeTexture(gl.TEXTURE0 + 6)
		this.ntexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.ntexture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.scapesize, this.scapesize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		this.nfbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.nfbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ntexture, 0)
		gl.clearColor(0.5, 0.5, 0.5, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)

		gl.activeTexture(gl.TEXTURE0)
	},

	build: function (shape) {
		var data = geometry.getdata(shape)
		this.blobspecs[shape] = {
			buffer: gl.createBuffer(),
			n: data.length / 14,
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[shape].buffer)
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
		this.rawdata[shape] = data
	},
	// Draw directly to the screen using the reference blob shader.
	draw0: function (shape, posG, progress) {
		if (!this.blobspecs[shape]) this.build(shape)
		graphics.progs.blob.setprogress(progress == undefined ? 1 : progress)
		graphics.progs.blob.setscenter(posG[0], posG[1])
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[shape].buffer)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.normal, 3, gl.FLOAT, false, 14*4, 4*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pcolor, 3, gl.FLOAT, false, 14*4, 7*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.acolor, 3, gl.FLOAT, false, 14*4, 10*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
		gl.drawArrays(gl.POINTS, 0, this.blobspecs[shape].n)
	},
	
	// Render the given shape to the blobscape
	assemble: function (shape) {
		if (!this.blobspecs[shape]) this.build(shape)
		var N = this.made[shape] = this.nmade++
		var x = Math.floor(N/this.ntile) * this.tilesize
		var y = N % this.ntile * this.tilesize

		graphics.progs.blob.use()
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		gl.viewport(x, y, this.tilesize, this.tilesize)
		graphics.progs.blob.setcanvassize(this.tilesize, this.tilesize)
		graphics.progs.blob.setscale(this.scale)
		graphics.progs.blob.setprogress(1)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[shape].buffer)

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pfbo)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pcolor, 3, gl.FLOAT, false, 14*4, 7*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
		gl.drawArrays(gl.POINTS, 0, this.blobspecs[shape].n)

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.nfbo)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pcolor, 3, gl.FLOAT, false, 14*4, 4*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
		gl.drawArrays(gl.POINTS, 0, this.blobspecs[shape].n)

		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
//		gl.viewport(0, 0, canvas.width, canvas.height)

	},

	setup: function () {
		graphics.progs.blobrender.use()
		gl.enable(gl.BLEND)
		// This blend function is appropriate since the texture has premultiplied alphas.
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
		graphics.progs.blobrender.setpsampler(5)
		graphics.progs.blobrender.setnsampler(6)
		graphics.progs.blobrender.setntile(this.ntile)
		var vs = state.viewstate
		graphics.progs.blobrender.setcanvassize(playpanel.wD, playpanel.hD)
		graphics.progs.blobrender.setcenter(vs.x0G, vs.y0G)
		graphics.progs.blobrender.setscale(vs.VzoomG)

		var t = Date.now() * 0.001
//		graphics.progs.blobrender.setdlight(0.8*Math.sin(t), 0.8*Math.cos(t), 0.6, 0.5)
		graphics.progs.blobrender.setdlight(0, 0.6, 0.8, 0.4)
		if (controlstate.mposD) {
			var mposG = state.viewstate.GconvertD(controlstate.mposD)
			graphics.progs.blobrender.setplight0(mposG[0], mposG[1], 0.5, 0.3)
		} else {
			graphics.progs.blobrender.setplight0(0, 0, 100, 0)
		}
		gl.enableVertexAttribArray(graphics.progs.blobrender.attribs.pos)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posbuffer)
		gl.vertexAttribPointer(graphics.progs.blobrender.attribs.pos, 2, gl.FLOAT, false, 0, 0)
	},
	
	draw: function (shape, posG, r) {
		if (!(shape in this.made)) {
			this.assemble(shape)
			this.setup()
		}
		var N = this.made[shape]
		var x = Math.floor(N/this.ntile)
		var y = N % this.ntile
		var s3 = 0.8660254037844386
		var C = [1,0.5,-0.5,-1,-0.5,0.5][r], S = [0,s3,s3,0,-s3,-s3][r]
		graphics.progs.blobrender.settilelocation(x, y)

		graphics.progs.blobrender.setscenter(posG[0], posG[1])
		graphics.progs.blobrender.setcolormap(false, [0, 0.5, 0.1, 1, 0, 0, 0, 0, 1])
		graphics.progs.blobrender.setrotation(false, [C, -S, S, C])
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 8)
	},
	

}


