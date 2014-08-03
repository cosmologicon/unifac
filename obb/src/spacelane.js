// A path along hexes that sprites follow

// Lanespec is a sequence of pH values.

// For edge numbering conventions, please see notes dated 24 Feb 2014.

function Spacelane(spec) {
	if (!(this instanceof Spacelane)) return new Spacelane(spec)
	this.init(spec)
}
Spacelane.prototype = {
	init: function (spec) {
		this.spec = spec
		this.tiles = []
		var LGs = [0, tau/6, tau/4, Math.sqrt(3), tau/4, tau/6]
		var rotCs = [1, 0.5, -0.5, -1, -0.5, 0.5]
		var rotSs = [0, s3, s3, 0, -s3, -s3]
		for (var j = 1 ; j < spec.length - 1 ; ++j) {
			var pH = spec[j]
			var pG = GconvertH(pH)
			// Edge through which the lane enters this tile, also controls orientation of the tile.
			var iedge = edgebetweenH(pH, spec[j-1])
			// Edge through which the lane exits this tile.
			var oedge = edgebetweenH(pH, spec[j+1])
			// exiting edge relative to entering edge, determines curvature of lane in this tile.
			var jedge = (oedge - iedge + 6) % 6
			this.tiles.push({
				pH: pH,
				pG: pG,
				iedge: iedge,
				oedge: oedge,
				jedge: jedge,
				shape: "tile" + jedge,
				rotC: rotCs[iedge],
				rotS: rotSs[iedge],
				L: LGs[jedge],
			})
		}
	},
	place: function (obj, d) {
		obj.dtile = 0
		obj.jtile = 0
		this.advance(obj, d || 0)
	},
	advance: function (obj, dd) {
		obj.dtile += dd
		while (obj.dtile > this.tiles[obj.jtile].L) {
			obj.dtile -= this.tiles[obj.jtile].L
			obj.jtile = (obj.jtile + 1) % this.tiles.length
		}
		this.setpos(obj)
	},
	setpos: function (obj) {
		var tile = this.tiles[obj.jtile], d = obj.dtile, x, y, dx, dy
		if (tile.jedge == 3) {
			x = 0 ; y = -s3 + d ; dx = 0 ; dy = 1
		} else {
			var r = tile.jedge == 1 || tile.jedge == 5 ? 0.5 : 1.5
			var theta = d / r, C = Math.cos(theta), S = Math.sin(theta)
			var xflip = tile.jedge < 3 ? 1 : -1
			x = xflip * r * (1 - C)
			y = -s3 + r * S
			dx = xflip * S
			dy = C
		}
		obj.pG = [
			tile.pG[0] + x * tile.rotC - y * tile.rotS,
			tile.pG[1] + x * tile.rotS + y * tile.rotC,
		]
		obj.rotC = dy * tile.rotC + dx * tile.rotS
		obj.rotS = dx * tile.rotC - dy * tile.rotS
	},
}

var lanescape = {
	init: function () {
		this.scapesize = 512
		
		this.spotinfo = {}
		this.scale = 64
		this.blocksize = 2 * this.scale
		this.nblock = this.scapesize / this.blocksize
		this.jblock = 0

		gl.activeTexture(gl.TEXTURE0 + 2)
		this.texture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.scapesize, this.scapesize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.generateMipmap(gl.TEXTURE_2D)
		gl.bindTexture(gl.TEXTURE_2D, null)

		this.fbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) throw "Incomple color framebuffer"
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		gl.activeTexture(gl.TEXTURE0)

	},

	setup: function () {
		graphics.progs.lanerender.use()
		gl.activeTexture(gl.TEXTURE0 + 2)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		graphics.progs.lanerender.setsampler(2)
		var vs = state.viewstate
		graphics.progs.lanerender.setcanvassizeD(playpanel.wD, playpanel.hD)
		graphics.progs.lanerender.setvcenterG(vs.x0G, vs.y0G)
		graphics.progs.lanerender.setVscaleG(vs.VzoomG)
		graphics.progs.lanerender.setscapesizeD(this.scapesize)
		graphics.progs.lanerender.setbordercolor(0, 0.3, 0.8)
		graphics.progs.lanerender.setalpha(0.4 + 0.06 * Math.sin(0.002 * Date.now()))
		gl.enableVertexAttribArray(graphics.progs.lanerender.attribs.posG)
		gl.bindBuffer(gl.ARRAY_BUFFER, graphics.unithexbuffer)
		gl.vertexAttribPointer(graphics.progs.lanerender.attribs.posG, 2, gl.FLOAT, false, 0, 0)
	},

	completeassembly: function (shape, spotinfo) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
		gl.enable(gl.SCISSOR_TEST)
		gl.viewport(spotinfo.x0, spotinfo.y0, this.blocksize, this.blocksize)
		gl.scissor(spotinfo.x0, spotinfo.y0, this.blocksize, this.blocksize)
		graphics.progs.lane.use()
		graphics.progs.lane.setcanvassize(2, 2)
		graphics.progs.lane.setcenter(0, 0)
		graphics.progs.lane.setzoom(1)
		graphics.progs.lane.setpos0(0, -s3)
		var k = [0, 2, 2/3, 0, -2/3, -2][+shape[4]]
		graphics.progs.lane.setlnorm(1, 0, k)
		graphics.progs.lane.setlanewidth(0.4)
		graphics.drawunitsquare(graphics.progs.lane.attribs.pos)
		gl.disable(gl.SCISSOR_TEST)
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.activeTexture(gl.TEXTURE0 + 2)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.generateMipmap(gl.TEXTURE_2D)
	},
	
	getspotinfo: function (shape) {
		if (shape in this.spotinfo) return this.spotinfo[shape]
		var jblock = this.jblock++, xblock = jblock % this.nblock, yblock = Math.floor(jblock / this.nblock)
		var spotinfo = this.spotinfo[shape] = {
			shape: shape,
			x0: xblock * this.blocksize,
			y0: yblock * this.blocksize,
			cx: (xblock + 0.5) * this.blocksize,
			cy: (yblock + 0.5) * this.blocksize,
			scale: this.scale,
		}
		this.completeassembly(shape, spotinfo)
		this.setup()
		return spotinfo
	},
	
	drawtiles: function (tiles) {
		for (var j = 0 ; j < tiles.length ; ++j) {
			var tile = tiles[j], spotinfo = this.getspotinfo(tile.shape)
			graphics.progs.lanerender.setposD0(spotinfo.cx, spotinfo.cy)
			graphics.progs.lanerender.setDscaleG(spotinfo.scale)
			graphics.progs.lanerender.setscenterG(tile.pG[0], tile.pG[1])
			graphics.progs.lanerender.setrotC(tile.rotC)
			graphics.progs.lanerender.setrotS(tile.rotS)
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 8)
		}
	},

}




