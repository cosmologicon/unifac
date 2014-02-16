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
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		this.pfbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.pfbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ptexture, 0)

		gl.activeTexture(gl.TEXTURE0 + 6)
		this.ntexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.ntexture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.scapesize, this.scapesize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		this.nfbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.nfbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ntexture, 0)

		gl.activeTexture(gl.TEXTURE0)
		this.assemble("sphere")
		this.assemble("stalk0")
	},

	build: function (shape) {
		var data = this.getdata(shape)
		if (!data.length) throw "unrecognized blob shape " + shape
		data.sort(function (a, b) { return a[2] - b[2] })
		data = [].concat.apply([], data)
		this.blobspecs[shape] = {
			buffer: gl.createBuffer(),
			n: data.length / 14,
		}
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecs[shape].buffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
		this.rawdata[shape] = data
	},
	
	getdata: function (shape) {
		var data = []
		if (shape == "sphere") {
			var nblob = 2000
			while (data.length < nblob) {
				var xG = UFX.random(-1, 1)
				var yG = UFX.random(-1, 1)
				var zG = UFX.random(-1, 1)
				var rG = UFX.random(0.06, 0.12)
				var dG = Math.sqrt(xG * xG + yG * yG + zG * zG)
				if (dG + rG > 0.8 || dG < 0.0001) continue
				var nx = xG/dG + UFX.random(-0.05, 0.05)
				var ny = yG/dG + UFX.random(-0.05, 0.05)
				var nz = zG/dG + UFX.random(-0.05, 0.05)
				var c1 = UFX.random(0.6, 0.65), c2 = 0, c3 = 0
				var ar = 0, ag = 0, ab = 0
				var f = dG
				data.push([xG, yG, zG, rG, 0.5+0.5*nx, 0.5+0.5*ny, 0.5+0.5*nz, c1, c2, c3, ar, ag, ab, f])
			}
		} else if (shape == "stalk0") {
			var nblob = 500
			while (data.length < nblob) {
				var xp = UFX.random(-1, 1)
				var yp = UFX.random(-1, 1)
				var rG = UFX.random(0.06, 0.12)
				var dp = Math.sqrt(xp * xp + yp * yp)
				if (dp * 0.15 + rG > 0.15 || dp < 0.0001) continue
				var xG = xp/dp * 0.15
				var yG = UFX.random(-0.866, 0.866)
				var zG = yp/dp * 0.15
				var nx = xp/dp + UFX.random(-0.2, 0.2)
				var ny = 0 + UFX.random(-0.2, 0.2)
				var nz = yp/dp + UFX.random(-0.2, 0.2)
				var c1 = UFX.random(0.6, 0.62), c2 = 0, c3 = 0
				var ar = 0, ag = 0, ab = 0
				var f = 0.4  // should be a combination of yG and dp
				data.push([xG, yG, zG, rG, 0.5+0.5*nx, 0.5+0.5*ny, 0.5+0.5*nz, c1, c2, c3, ar, ag, ab, f])
			}
		}
		return data
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
		graphics.progs.blobrender.setpsampler(5)
		graphics.progs.blobrender.setnsampler(6)
		graphics.progs.blobrender.setntile(this.ntile)
		var vs = state.viewstate
		graphics.progs.blobrender.setcanvassize(playpanel.wD, playpanel.hD)
		graphics.progs.blobrender.setcenter(vs.x0G, vs.y0G)
		graphics.progs.blobrender.setscale(vs.VzoomG)

		var t = Date.now() * 0.001
		graphics.progs.blobrender.setdlight(0.8*Math.sin(t), 0.8*Math.cos(t), 0.6, 0.2)
		if (controlstate.mposD) {
			var mposG = state.viewstate.GconvertD(controlstate.mposD)
			graphics.progs.blobrender.setplight0(mposG[0], mposG[1], 1, 0.3)
		} else {
			graphics.progs.blobrender.setplight0(0, 0, 100, 0)
		}
	},
	
	draw: function (shape, posG) {
		var N = this.made[shape]
		var x = Math.floor(N/this.ntile)
		var y = N % this.ntile
		graphics.progs.blobrender.settilelocation(x, y)

		graphics.progs.blobrender.setscenter(posG[0], posG[1])
		graphics.progs.blobrender.setcolormap(false, [0, 0.5, 0.1, 1, 0, 0, 0, 0, 1])
		gl.enableVertexAttribArray(graphics.progs.blobrender.attribs.pos)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posbuffer)
		gl.vertexAttribPointer(graphics.progs.blobrender.attribs.pos, 2, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 8)
	},
	

}


