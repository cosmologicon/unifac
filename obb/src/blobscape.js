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

		this.nblock = 8

		this.jblock = 0  // The next available block to be claimed
		this.blocks = {}  // Map from subscales to block positions

		// Map from a tile specification to the tile identifier.
		this.tiles = {}

		// scale0 is the number of pixels per game unit in non-subdivided blocks
		var s = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 4096)
		this.scale0 = 16
		while (this.scale0 * this.nblock * 4 <= s) this.scale0 *= 2
		if (this.scale0 < 32) throw "blobscape texture is too small"

		this.blocksize = this.scale0 * 2
		this.scapesize = this.nblock * this.blocksize

		debugHUD.alert("blobscape scale0 " + this.scale0)
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

		gl.activeTexture(gl.TEXTURE0 + 5)
		this.texture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.scapesize, this.scapesize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.bindTexture(gl.TEXTURE_2D, null)

		this.fbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) throw "Incomple primary framebuffer"
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		gl.activeTexture(gl.TEXTURE0)
	},

	// Get the tile spot (position) information (and claim the tile spot if it doesn't exist).
	claimedspots: {},
	getspot: function (tilespecid, subscale) {
		if (this.claimedspots[tilespecid]) return this.claimedspots[tilespecid]
		if (!this.blocks[subscale]) {
			this.blocks[subscale] = {
				jblock: this.jblock++,
				jtile: 0,
			}
		}
		var jblock = this.blocks[subscale].jblock
		var jtile = this.blocks[subscale].jtile++
		if (this.blocks[subscale].jtile == subscale * subscale) {
			delete this.blocks[subscale]
		}
		var xblock = jblock % this.nblock, yblock = Math.floor(jblock / this.nblock)
		var xtile = jtile % subscale, ytile = Math.floor(jtile / subscale)
		var tilesize = this.blocksize / subscale
		var scale = this.scale0 / subscale
		var x0 = xblock * this.blocksize + xtile * tilesize
		var y0 = yblock * this.blocksize + ytile * tilesize
		this.claimedspots[tilespecid] = {
			x0: x0,
			y0: y0,
			cx: x0 + scale,
			cy: y0 + scale,
			tilesize: tilesize,
			scale: scale,
		}
		return this.claimedspots[tilespecid]
	},

	assembledtiles: {},
	gettile: function (tilespec) {
		tilespec.f = "f" in tilespec ? Math.round(tilespec.f * constants.growframes) / constants.growframes : 1
		var tilespecid = ([tilespec.shape, tilespec.type, tilespec.f]).join("")
		var subscale = tilespec.f == 1 ? 1 : 4
		var spot = this.getspot(tilespecid, subscale)
		if (!this.assembledtiles[tilespecid]) {
			this.assemble(tilespec, spot)
			this.assembledtiles[tilespecid] = true
		}
		return spot
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
	assemble: function (tilespec, spot) {
		if (!this.blobspecs[tilespec.shape]) this.build(tilespec.shape)

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
		gl.enable(gl.BLEND)

		gl.enable(gl.SCISSOR_TEST)
		gl.scissor(spot.x0, spot.y0, spot.tilesize, spot.tilesize)
		if (tilespec.type == "color") {
			gl.clearColor(0, 0, 0, 0)
		} else if (tilespec.type == "normal") {
			gl.clearColor(0.5, 0.5, 0.5, 0)
		}
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.disable(gl.SCISSOR_TEST)

		gl.viewport(spot.x0, spot.y0, spot.tilesize, spot.tilesize)
		if (tilespec.type == "color") {
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
			if (constants.outlinewidth) {
				graphics.progs.bloboutline.use()
				graphics.progs.bloboutline.setcanvassize(spot.tilesize, spot.tilesize)
				graphics.progs.bloboutline.setscale(spot.scale)
				graphics.progs.bloboutline.setprogress(tilespec.f)
				graphics.progs.bloboutline.setwidth(constants.outlinewidth)
				gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[tilespec.shape].buffer)
				gl.vertexAttribPointer(graphics.progs.bloboutline.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
				gl.vertexAttribPointer(graphics.progs.bloboutline.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
				gl.vertexAttribPointer(graphics.progs.bloboutline.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
				gl.drawArrays(gl.POINTS, 0, this.blobspecs[tilespec.shape].n)
			}

			graphics.progs.blob.use()
			graphics.progs.blob.setcanvassize(spot.tilesize, spot.tilesize)
			graphics.progs.blob.setscale(spot.scale)
			graphics.progs.blob.setprogress(tilespec.f)
			var cs = constants.colors
			var colormap = cs.system0.concat(cs.system1, cs.system2)
			graphics.progs.blob.setcolormap(false, colormap)
			gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[tilespec.shape].buffer)

			gl.vertexAttribPointer(graphics.progs.blob.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
			gl.vertexAttribPointer(graphics.progs.blob.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
			gl.vertexAttribPointer(graphics.progs.blob.attribs.pcolor, 3, gl.FLOAT, false, 14*4, 7*4)
			gl.vertexAttribPointer(graphics.progs.blob.attribs.acolor, 3, gl.FLOAT, false, 14*4, 10*4)
			gl.vertexAttribPointer(graphics.progs.blob.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
			gl.drawArrays(gl.POINTS, 0, this.blobspecs[tilespec.shape].n)
		} else if (tilespec.type == "normal") {
			graphics.progs.blobnormal.use()
			gl.blendFunc(gl.ONE, gl.ZERO)
			graphics.progs.blobnormal.setcanvassize(spot.tilesize, spot.tilesize)
			graphics.progs.blobnormal.setscale(spot.scale)
			graphics.progs.blobnormal.setprogress(tilespec.f)
			gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[tilespec.shape].buffer)

			gl.vertexAttribPointer(graphics.progs.blobnormal.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
			gl.vertexAttribPointer(graphics.progs.blobnormal.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
			gl.vertexAttribPointer(graphics.progs.blobnormal.attribs.normal, 3, gl.FLOAT, false, 14*4, 4*4)
			gl.vertexAttribPointer(graphics.progs.blobnormal.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
			gl.drawArrays(gl.POINTS, 0, this.blobspecs[tilespec.shape].n)
		}

		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
//		gl.viewport(0, 0, canvas.width, canvas.height)
//		gl.disable(gl.DEPTH_TEST)

		// http://stackoverflow.com/questions/5291980/is-regeneration-of-mipmaps-when-using-render-to-target-via-fbos-required
		gl.activeTexture(gl.TEXTURE0 + 5)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.generateMipmap(gl.TEXTURE_2D)
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
		graphics.progs.blobrender.setsampler(5)
		var vs = state.viewstate
		graphics.progs.blobrender.setcanvassizeD(playpanel.wD, playpanel.hD)
		graphics.progs.blobrender.setvcenterG(vs.x0G, vs.y0G)
		graphics.progs.blobrender.setVscaleG(vs.VzoomG)
		graphics.progs.blobrender.setscapesize(this.scapesize)

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
		var colorspot = this.gettile({
			shape: part.shape,
			f: part.f,
			type: "color",
		})
		var normalspot = this.gettile({
			shape: part.shape,
			f: part.f,
			type: "normal",
		})
		var C = [1,0.5,-0.5,-1,-0.5,0.5][part.r], S = [0,s3,s3,0,-s3,-s3][part.r]
		graphics.progs.blobrender.use()
		graphics.progs.blobrender.setscenterG(part.pG[0], part.pG[1])
		graphics.progs.blobrender.setrotC(C)
		graphics.progs.blobrender.setrotS(S)
		
		graphics.progs.blobrender.setDcscaleG(colorspot.scale)
		graphics.progs.blobrender.setDnscaleG(normalspot.scale)
		graphics.progs.blobrender.setcposD0(colorspot.cx, colorspot.cy)
		graphics.progs.blobrender.setnposD0(normalspot.cx, normalspot.cy)

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


