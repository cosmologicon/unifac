// The spritescape
// Similar to the blobscape but it uses different shaders
// Also there's no explicit sense of tiles or subdivision

// spotinfo:
// x0, y0 (lower-left corner in pixels)
// cx, cy (spot center in pixels)
// w, h (size of spot in pixels)
// scale (1 game unit in pixels)


var spritescape = {
	init: function () {
		this.scapesize = 512
		
		this.spotinfo = {}

		// The primary color channel framebuffer
		gl.activeTexture(gl.TEXTURE0 + 3)
		this.ctexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.ctexture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.scapesize, this.scapesize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.bindTexture(gl.TEXTURE_2D, null)

		this.cfbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.cfbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ctexture, 0)
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) throw "Incomple color framebuffer"
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		// The normal channel framebuffer
		gl.activeTexture(gl.TEXTURE0 + 4)
		this.ntexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.ntexture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.scapesize, this.scapesize, 0, gl.RGB, gl.UNSIGNED_BYTE, null)
		gl.bindTexture(gl.TEXTURE_2D, null)

		this.nfbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.nfbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.ntexture, 0)
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) throw "Incomple normal framebuffer"
		gl.clearColor(0.5, 0.5, 0.5, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		gl.activeTexture(gl.TEXTURE0)



		// Programmer-art spaceship, for testing.
		this.spotinfo.square = {
			x0: 0, y0: 0,
			cx: 50, cy: 50,
			w: 100, h: 100,
			scale: 100,
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.cfbo)
		gl.disable(gl.DEPTH_TEST)
		gl.disable(gl.BLEND)
		gl.enable(gl.SCISSOR_TEST)
		gl.scissor(42, 30, 16, 60)
		gl.clearColor(0.8, 0.8, 0.8, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.scissor(36, 30, 28, 40)
		gl.clearColor(0.6, 0.8, 0.8, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.scissor(30, 20, 40, 30)
		gl.clearColor(0.4, 0.8, 0.8, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.scissor(15, 10, 20, 30)
		gl.clearColor(0.8, 0.8, 0.8, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.scissor(65, 10, 20, 30)
		gl.clearColor(0.8, 0.8, 0.8, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.disable(gl.SCISSOR_TEST)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		gl.activeTexture(gl.TEXTURE0 + 3)
		gl.bindTexture(gl.TEXTURE_2D, this.ctexture)
		gl.generateMipmap(gl.TEXTURE_2D)
		gl.activeTexture(gl.TEXTURE0 + 4)
		gl.bindTexture(gl.TEXTURE_2D, this.ctexture)
		gl.generateMipmap(gl.TEXTURE_2D)

	},

	setup: function () {
		graphics.progs.spriterender.use()
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
		graphics.progs.spriterender.setcsampler(3)
		graphics.progs.spriterender.setnsampler(4)
		var vs = state.viewstate
		graphics.progs.spriterender.setcanvassizeD(playpanel.wD, playpanel.hD)
		graphics.progs.spriterender.setvcenterG(vs.x0G, vs.y0G)
		graphics.progs.spriterender.setVscaleG(vs.VzoomG)
		graphics.progs.spriterender.setscapesizeD(this.scapesize)

		graphics.progs.spriterender.setdlight(0.5/s3, 0.5/s3, 0.5/s3, 1.0)
		if (controlstate.mposD) {
			var mposG = state.viewstate.GconvertD(controlstate.mposD)
			graphics.progs.spriterender.setplight0(mposG[0], mposG[1], 0.5, 0.3)
		} else {
			graphics.progs.spriterender.setplight0(0, 0, 100, 0)
		}
		gl.enableVertexAttribArray(graphics.progs.spriterender.attribs.spos)
		gl.bindBuffer(gl.ARRAY_BUFFER, graphics.unitsquarebuffer)
		gl.vertexAttribPointer(graphics.progs.spriterender.attribs.spos, 2, gl.FLOAT, false, 0, 0)
	},
	
	drawsprites: function (sprites) {
		for (var j = 0 ; j < sprites.length ; ++j) {
			var spotinfo = this.spotinfo[sprites[j].shape]
			if (!spotinfo) throw "Unrecognized sprite " + sprites[j].shape
			graphics.progs.spriterender.setposD0(spotinfo.x0, spotinfo.y0)
			graphics.progs.spriterender.setspritesizeD(spotinfo.w, spotinfo.h)
			graphics.progs.spriterender.setDscaleG(spotinfo.scale)
			graphics.progs.spriterender.setcenterG(sprites[j].pG[0], sprites[j].pG[1])
			graphics.progs.spriterender.setrotC(sprites[j].rotC)
			graphics.progs.spriterender.setrotS(sprites[j].rotS)
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
		}
	},

}

