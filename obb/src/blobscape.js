// Managing the blobscape: the procedurally-generated texture atlases used for rendering objects
// (body parts) that use the blob shader

// Textures 5 and 6 are reserved for the blobscape. They're used for the color channel (plus alpha)
// and the normals, respectively.

// A blob shape is a set of blobs, each of which has the following properties:

// x, y, z, r, c0, c1, c2, nx, ny, nz, f

// (I decided at some point that I need to use texture atlases rather than texture arrays. I don't
// remember the reason for this choice now, but at any rate texture atlases seem to work fine.)


var blobscape = {
	init: function () {
		this.rawdata = {}
		this.blobspecs = {}

		// The blobscape itself is square, and consists of ntile x ntile square tiles, which are
		// filled in as requested. Tiles are numbered starting at 0 in the lower left and counting
		// up left to right and bottom to top.
		this.ntile = 8

		// Map from a tile specification (generally the name of the shape) to the tile number.
		this.made = {}
		// Number of tiles assembled so far.
		this.nmade = 0

		// A certain number of tiles are "quick" tiles. These can be overdrawn as needed, and are
		// used for tile specifications that are only needed briefly (typically 1 frame). The main
		// use case is growth transition frames. The top nquick tile spots are reserved for quick
		// tiles.
		this.nquick = 8
		// The next quick tile to assemble. This value rotates through the available quick tiles so
		// that once they're assembled they stick around in case they need to be reused.
		this.jquick = 0
		// Tile number of first quick tile.
		this.quick0 = this.ntile * this.ntile - this.nquick
		// Maps from tile spec to quick tile number and back (these are deleted when a quick tile
		// is overwritten).
		this.qmade = {}
		this.qspec = {}

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
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,-1,0,-0.5,-s3,0.5,-s3,1,0,0.5,s3,-0.5,s3,-1,0]), gl.STATIC_DRAW)

		this.jsquirmbuffer = gl.createBuffer()
		this.jsquirmdata = []
		gl.bindBuffer(gl.ARRAY_BUFFER, this.jsquirmbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.jsquirmdata), gl.STATIC_DRAW)

		this.shadefactorbuffer = gl.createBuffer()
		this.shadefactordata = []
		gl.bindBuffer(gl.ARRAY_BUFFER, this.shadefactorbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.shadefactordata), gl.STATIC_DRAW)

		// https://www.khronos.org/registry/webgl/sdk/tests/conformance/textures/mipmap-fbo.html

		// The primary color channel framebuffer
		gl.activeTexture(gl.TEXTURE0 + 5)
		this.ptexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.ptexture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.scapesize, this.scapesize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.bindTexture(gl.TEXTURE_2D, null)

		this.pfbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pfbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ptexture, 0)
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) throw "Incomple primary framebuffer"
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		// The normal channel framebuffer
		gl.activeTexture(gl.TEXTURE0 + 6)
		this.ntexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.ntexture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.scapesize, this.scapesize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.bindTexture(gl.TEXTURE_2D, null)

		this.nfbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.nfbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ntexture, 0)
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) throw "Incomple normal framebuffer"
		gl.clearColor(0.5, 0.5, 0.5, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

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
	assemble: function (N, shape, f, clear) {
		if (!this.blobspecs[shape]) this.build(shape)
		if (f === undefined) f = 1
		var x = N % this.ntile * this.tilesize
		var y = Math.floor(N/this.ntile) * this.tilesize

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pfbo)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		gl.viewport(x, y, this.tilesize, this.tilesize)
		if (clear) {
			gl.enable(gl.SCISSOR_TEST)
			gl.scissor(x, y, this.tilesize, this.tilesize)
			gl.clearColor(0, 0, 0, 0)
			gl.clear(gl.COLOR_BUFFER_BIT)
			gl.disable(gl.SCISSOR_TEST)
		}
		if (constants.outlinewidth) {
			graphics.progs.bloboutline.use()
			graphics.progs.bloboutline.setcanvassize(this.tilesize, this.tilesize)
			graphics.progs.bloboutline.setscale(this.scale)
			graphics.progs.bloboutline.setprogress(f)
			graphics.progs.bloboutline.setwidth(constants.outlinewidth)
			gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[shape].buffer)
			gl.vertexAttribPointer(graphics.progs.bloboutline.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
			gl.vertexAttribPointer(graphics.progs.bloboutline.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
			gl.vertexAttribPointer(graphics.progs.bloboutline.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
			gl.drawArrays(gl.POINTS, 0, this.blobspecs[shape].n)
		}

		graphics.progs.blob.use()
		graphics.progs.blob.setcanvassize(this.tilesize, this.tilesize)
		graphics.progs.blob.setscale(this.scale)
		graphics.progs.blob.setprogress(f)
		var cs = constants.colors
		var colormap = cs.system0.concat(cs.system1, cs.system2)
		graphics.progs.blob.setcolormap(false, colormap)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[shape].buffer)

		gl.vertexAttribPointer(graphics.progs.blob.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pcolor, 3, gl.FLOAT, false, 14*4, 7*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.acolor, 3, gl.FLOAT, false, 14*4, 10*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
		gl.drawArrays(gl.POINTS, 0, this.blobspecs[shape].n)

		graphics.progs.blobnormal.use()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.nfbo)
		if (clear) {
			gl.enable(gl.SCISSOR_TEST)
			gl.scissor(x, y, this.tilesize, this.tilesize)
			gl.clearColor(0.5, 0.5, 0.5, 1)
			gl.clear(gl.COLOR_BUFFER_BIT)
			gl.disable(gl.SCISSOR_TEST)
		}
		gl.blendFunc(gl.ONE, gl.ZERO)
		gl.viewport(x, y, this.tilesize, this.tilesize)
		graphics.progs.blobnormal.setcanvassize(this.tilesize, this.tilesize)
		graphics.progs.blobnormal.setscale(this.scale)
		graphics.progs.blobnormal.setprogress(f)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[shape].buffer)

		gl.vertexAttribPointer(graphics.progs.blobnormal.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
		gl.vertexAttribPointer(graphics.progs.blobnormal.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
		gl.vertexAttribPointer(graphics.progs.blobnormal.attribs.normal, 3, gl.FLOAT, false, 14*4, 4*4)
		gl.vertexAttribPointer(graphics.progs.blobnormal.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
		gl.drawArrays(gl.POINTS, 0, this.blobspecs[shape].n)

		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
//		gl.viewport(0, 0, canvas.width, canvas.height)
//		gl.disable(gl.DEPTH_TEST)

		// http://stackoverflow.com/questions/5291980/is-regeneration-of-mipmaps-when-using-render-to-target-via-fbos-required
		gl.activeTexture(gl.TEXTURE0 + 5)
		gl.bindTexture(gl.TEXTURE_2D, this.ptexture)
		gl.generateMipmap(gl.TEXTURE_2D)
		gl.activeTexture(gl.TEXTURE0 + 6)
		gl.bindTexture(gl.TEXTURE_2D, this.ntexture)
		gl.generateMipmap(gl.TEXTURE_2D)
	},
	
	gettile: function (shape, f) {
		if (f === undefined || f == 1) {
			if (shape in this.made) return this.made[shape]
			var N = this.made[shape] = this.nmade++
			this.assemble(N, shape)
			this.setup()
			return N
		} else {
			f = Math.round(f * constants.growframes) / constants.growframes
			var spec = shape + "|" + f
			if (spec in this.qmade) return this.qmade[spec]
			var N = this.qmade[spec] = this.quick0 + this.jquick
			this.jquick = (this.jquick + 1) % this.nquick
			if (this.qspec[N]) {
				delete this.qmade[this.qspec[N]]
				delete this.qspec[N]
			}
			this.qspec[N] = spec
			this.assemble(N, shape, f, true)
			this.setup()
			return N
		}
	},
	
	jsquirmindices: {},
	getjsquirmindex: function (part) {
		var key = part.pH[0] + "," + part.pH[1] + "," + part.r + "," + part.fixes
		if (key in this.jsquirmindices) return this.jsquirmindices[key]
		var dvHs = [[0,0], [-4,2], [-2,-2], [2,-4], [4,-2], [2,2], [-2,4], [-4,2]]
		var data = dvHs.map(function (dvH, j) {
			var vpH = [part.pH[0] + dvH[0], part.pH[1] + dvH[1]]
			var vpG = GconvertH(vpH)
			if (vpG[0]*vpG[0] + vpG[1]*vpG[1] < 1.2*1.2) return 0
			var vpN = NconvertH(vpH)
			if (j == 0) vpN += part.r
			UFX.random.pushseed(vpN)
			UFX.random.rand()
			UFX.random.rand()
			UFX.random.rand()
			var n = UFX.random.rand(1, 100)
			UFX.random.popseed()
			return n
		})
		var index = this.jsquirmindices[key] = 4 * this.jsquirmdata.length
		this.jsquirmdata = this.jsquirmdata.concat(data)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.jsquirmbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.jsquirmdata), gl.STATIC_DRAW)
		return index
	},

	shadefactorindices: {},
	getshadefactorindex: function (mode) {
		var key = "" + mode
		if (key in this.shadefactorindices) return this.shadefactorindices[key]
		var data = mode ? [0, 6, 1, 2, 3, 4, 5, 6].map(function (k) { return mode[k] ? 1 : 0 }) : [1, 1, 1, 1, 1, 1, 1, 1]
		var index = this.shadefactorindices[key] = 4 * this.shadefactordata.length
		this.shadefactordata = this.shadefactordata.concat(data)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.shadefactorbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.shadefactordata), gl.STATIC_DRAW)
		return index
	},

	setup: function () {
		graphics.progs.blobrender.use()
		gl.enable(gl.BLEND)
		// This blend function is appropriate since the texture has premultiplied alphas.
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
		graphics.progs.blobrender.setpsampler(5)
		graphics.progs.blobrender.setnsampler(6)
		graphics.progs.blobrender.setasampler(7)
		graphics.progs.blobrender.setntile(this.ntile)
		var vs = state.viewstate
		graphics.progs.blobrender.setcanvassizeD(playpanel.wD, playpanel.hD)
		graphics.progs.blobrender.setvcenterG(vs.x0G, vs.y0G)
		graphics.progs.blobrender.setDscaleG(vs.VzoomG)

		var tsquirm = Date.now() * 0.001 / constants.Tsquirm % 1
		graphics.progs.blobrender.settsquirm(tsquirm)
		var f = controlstate.fsquirm, g = f * f * (3 - 2 * f)
		graphics.progs.blobrender.setfsquirm(constants.fsquirm0 * g)

		graphics.progs.blobrender.setdlight(0.5/s3, 0.5/s3, 0.5/s3, 1.0)
		if (controlstate.mposD) {
			var mposG = state.viewstate.GconvertD(controlstate.mposD)
			graphics.progs.blobrender.setplight0(mposG[0], mposG[1], 0.5, 0.3)
		} else {
			graphics.progs.blobrender.setplight0(0, 0, 100, 0)
		}
		gl.enableVertexAttribArray(graphics.progs.blobrender.attribs.posG)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posbuffer)
		gl.vertexAttribPointer(graphics.progs.blobrender.attribs.posG, 2, gl.FLOAT, false, 0, 0)

		var shadeindex = this.getshadefactorindex()
		gl.enableVertexAttribArray(graphics.progs.blobrender.attribs.shadefactor)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.shadefactorbuffer)
		gl.vertexAttribPointer(graphics.progs.blobrender.attribs.shadefactor, 1, gl.FLOAT, false, 0, shadeindex)

	},
	
	draw: function (part) {
		var N = this.gettile(part.shape, part.f)
		var x = N % this.ntile
		var y = Math.floor(N/this.ntile)
		var C = [1,0.5,-0.5,-1,-0.5,0.5][part.r], S = [0,s3,s3,0,-s3,-s3][part.r]
		graphics.progs.blobrender.settilelocation(x, y)
		graphics.progs.blobrender.setscenterG(part.pG[0], part.pG[1])
		graphics.progs.blobrender.setrotC(C)
		graphics.progs.blobrender.setrotS(S)

		gl.enableVertexAttribArray(graphics.progs.blobrender.attribs.jsquirm)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.jsquirmbuffer)
		gl.vertexAttribPointer(graphics.progs.blobrender.attribs.jsquirm, 1, gl.FLOAT, false, 0, this.getjsquirmindex(part))

		if (controlstate.selectedshape) {
			var shadeindex = this.getshadefactorindex(part.shademode)
			gl.enableVertexAttribArray(graphics.progs.blobrender.attribs.shadefactor)
			gl.bindBuffer(gl.ARRAY_BUFFER, this.shadefactorbuffer)
			gl.vertexAttribPointer(graphics.progs.blobrender.attribs.shadefactor, 1, gl.FLOAT, false, 0, shadeindex)
		}

		gl.drawArrays(gl.TRIANGLE_FAN, 0, 8)
	},
}


