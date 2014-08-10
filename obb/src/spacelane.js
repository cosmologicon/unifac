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
				shape: "tile0" + jedge,
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

		this.dbuffer = gl.createRenderbuffer()
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.dbuffer)
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.scapesize, this.scapesize)

		this.fbo = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0)
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.dbuffer)
		if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) throw "Incomple color framebuffer"
		gl.clearColor(0, 0.5, 0.5, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)
		gl.clear(gl.DEPTH_BUFFER_BIT)
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
		graphics.progs.lanerender.setalpha(0.2 + 0.05 * Math.sin(0.002 * Date.now()))
		var mu = Date.now() * 0.005 % tau
		graphics.progs.lanerender.setcosmu(Math.cos(mu))
		graphics.progs.lanerender.setsinmu(Math.sin(mu))
		graphics.progs.lanerender.setClimit(0.4)
		gl.enableVertexAttribArray(graphics.progs.lanerender.attribs.posG)
		gl.bindBuffer(gl.ARRAY_BUFFER, graphics.unithexbuffer)
		gl.vertexAttribPointer(graphics.progs.lanerender.attribs.posG, 2, gl.FLOAT, false, 0, 0)
	},

	completeassembly: function (shape, spotinfo) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo)
		gl.viewport(spotinfo.x0, spotinfo.y0, this.blocksize, this.blocksize)
		gl.enable(gl.SCISSOR_TEST)
		gl.disable(gl.DEPTH_TEST)
		gl.scissor(spotinfo.x0, spotinfo.y0, this.blocksize, this.blocksize)
		graphics.progs.lane.use()
		graphics.progs.lane.setcanvassize(2, 2)
		graphics.progs.lane.setcenter(0, 0)
		graphics.progs.lane.setzoom(1)
		graphics.progs.lane.setlanewidth(0.4)
		graphics.progs.lane.setborderwidth(0.14)
		var ps = [0, 0, 0, 0], ks = [0, 0], Ls = [0, 0], ns = [0, 0]
		for (var j = 4, i = 0 ; j < shape.length ; j += 2, ++i) {
			var iedge = +shape[j], oedge = +shape[j+1], jedge = (oedge - iedge + 6) % 6
			ps[2*i] = [0, 0.75, 0.75, 0, -0.75, -0.75][iedge]
			ps[2*i+1] = [-s3, -0.5*s3, 0.5*s3, s3, 0.5*s3, -0.5*s3][iedge]
			ks[i] = [0, 2, 2/3, 0, -2/3, -2][jedge]
			Ls[i] = [0, tau/6, tau/4, s3*2, tau/4, tau/6][jedge]
			ns[i] = [0, 2, 3, 3, 3, 2][jedge]
		}
		graphics.progs.lane.vsetps(ps)
		graphics.progs.lane.vsetks(ks)
		graphics.progs.lane.vsetLs(Ls)
		graphics.progs.lane.vsetns(ns)
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




