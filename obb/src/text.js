// GL program for displaying text in screen coordinates

// text.draw(text, x, y, opts). options are:
//   fontname (defaults to "sans-serif")
//   fontsize (defaults to 18)
//   color (defaults to "white")
//   ocolor (outline color, defaults to none)
//   owidth (outline width as fraction of fontsize, defaults to 0.08)
//   scolor (shadow color, defaults to none)
//   shadowx, shadowy, shadowblur (as fraction of fontsize, delauts to 0.04, 0.04, 0)
//   hanchor (can either be "left", "center", "right", or number 0-1. defaults to 0)
//   vanchor (can either be "bottom", "middle", "top", or number 0-1. defaults to 0)
//   linespace (as a fraction of fontsize, defaults to 0.25)
//   talign (can either be "left", "center", "right", or 0, 0.5, 1. defaults to 0)
//   alpha (overall transparency, prefer this to setting the color transparent. defaults to 1)
// Default options can be set by assigning to text.defaultopts.fontname, etc.

var text = {
	textures: {},  // cached textures
	textotal: 0,  // total number of pixels of all currently stored textures
	tick: 0,  // for keeping track of which textures were used most recently
	defaultopts: {
		fontname: "sans-serif",
		fontsize: 18,
		color: "white",
		ocolor: null,
		owidth: 0.08,
		scolor: null,
		shadowx: 0.04,
		shadowy: 0.04,
		shadowblur: 0,
		hanchor: 0,
		vanchor: 0,
		linespace: 0.25,
		talign: 0,
		alpha: 1,
	},
	vertshader: [
		"attribute vec2 pos;",
		"uniform vec2 canvassize;",
		"uniform vec2 texturesize;",
		"uniform vec2 p0;",
		"varying vec2 vtcoord;",
		"void main(void) {",
		"    gl_Position = vec4((pos * texturesize + p0) / canvassize * 2.0 - 1.0, 1.0, 1.0);",
		"    vtcoord = pos;",
		"}",
	].join("\n"),
	fragshader: [
		"precision mediump float;",
		"uniform sampler2D sampler;",
		"uniform float alpha;",
		"varying vec2 vtcoord;",
		"void main(void) {",
		"	gl_FragColor = texture2D(sampler, vtcoord) * vec4(1.0, 1.0, 1.0, alpha);",
		"}",
	].join("\n"),
	// Call this once to create the gl program
	init: function () {
		this.program = glprog(this.vertshader, this.fragshader)
		var gl = this.program.gl
		this.squarebuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.squarebuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,1,0,1,1,0,1]), gl.STATIC_DRAW)
	},
	// Call this before rendering any text
	setup: function (_canvas) {
		this.program.use()
		var gl = this.program.gl
		gl.activeTexture(gl.TEXTURE0)
		var canvas = gl.canvas
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
		this.program.setcanvassize(gl.canvas.width, gl.canvas.height)
		this.program.setsampler(0)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.squarebuffer)
		gl.vertexAttribPointer(this.program.attribs.pos, 2, gl.FLOAT, false, 0, 0)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	},
	gettexture: function (text, fontname, fontsize, color, ocolor, owidth, scolor, shadowx,
		shadowy, shadowblur, linespace, talign) {
		var key = [].join.call(arguments, ":")
		if (this.textures[key]) return this.textures[key]

		var buffer = Math.ceil(0.3 * fontsize)
		var lineheight = Math.ceil((1 + linespace) * fontsize)
		var can = document.createElement("canvas")
		var con = can.getContext("2d")
		con.font = fontsize + "px '" + fontname + "'"
		var texts = text.split("\n")
		var w0 = Math.max.apply(null, texts.map(function (t) { return con.measureText(t).width }))
		
		var h0 = fontsize + lineheight * (texts.length - 1)  // size of text box itself
		var w1 = w0 + 2 * buffer, h1 = h0 + 2 * buffer  // size of text box with buffer
		var w = 2, h = 2  // size of texture (must be power of 2)
		while (w < w1) w <<= 1
		while (h < h1) h <<= 1

		can.width = w ; can.height = h
		con.font = fontsize + "px '" + fontname + "'"
		if (color) {
			con.fillStyle = color
			if (scolor) {
				con.shadowColor = scolor
				con.shadowOffsetX = shadowx * fontsize
				con.shadowOffsetY = shadowy * fontsize
				con.shadowBlur = shadowblur * fontsize
			}
		}
		con.textBaseline = "top"
		// TODO: there's got to be a better way than converting this back and forth so many times
		talign = {0: "left", 0.5: "center", 1: "right"}[talign] || talign
		con.textAlign = talign
		if (ocolor) {
			con.strokeStyle = ocolor
			con.lineWidth = Math.ceil(owidth * fontsize)
		}
		var x0 = Math.round(buffer + {left: 0, center: 0.5, right: 1}[talign] * w0)
		texts.forEach(function (text, j) {
			if (color) con.fillText(text, x0, buffer + j * lineheight)
			if (ocolor) con.strokeText(text, x0, buffer + j * lineheight)
		})

		var t = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, t)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, can)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		
		t.draw = this.bounddraw
		t.w0 = w0 ; t.h0 = h0
		t.w1 = w1 ; t.h1 = h1
		t.w = w ; t.h = h
		t.d = buffer
		t.x0 = buffer ; t.y0 = buffer
		t.s = w * h
		t.program = this.program
		this.textotal += t.s

		this.textures[key] = t
		return t
	},
	
	draw: function (text, x, y, opts) {
		opts = opts || {}
		var tex = this.gettexture(text,
			opts.fontname || this.defaultopts.fontname,
			opts.fontsize || this.defaultopts.fontsize,
			"color" in opts ? opts.color : this.defaultopts.color,
			"ocolor" in opts ? opts.ocolor : this.defaultopts.ocolor,
			"owidth" in opts ? opts.owidth : this.defaultopts.owidth,
			"scolor" in opts ? opts.scolor : this.defaultopts.scolor,
			"shadowx" in opts ? opts.shadowx : this.defaultopts.shadowx,
			"shadowy" in opts ? opts.shadowy : this.defaultopts.shadowy,
			"shadowblur" in opts ? opts.shadowblur : this.defaultopts.shadowblur,
			"linespace" in opts ? opts.linespace : this.defaultopts.linespace,
			"talign" in opts ? opts.talign : this.defaultopts.talign
		)
		tex.draw(x, y,
			"hanchor" in opts ? opts.hanchor : this.defaultopts.hanchor,
			"vanchor" in opts ? opts.vanchor : this.defaultopts.vanchor,
			"alpha" in opts ? opts.alpha : this.defaultopts.alpha
		)
		return tex
	},
	
	// Note: this method is not to be called with this = text. This method should be bound to
	// texture objects.
	bounddraw: function (x, y, hanchor, vanchor, alpha) {
		hanchor = hanchor.trim ? {left: 0, center: 0.5, right: 1}[hanchor] : hanchor
		vanchor = vanchor.trim ? {bottom: 0, middle: 0.5, top: 1}[vanchor] : vanchor
		this.tick = text.tick++
		// coordinates of bottom-left of inner box
		x -= hanchor * this.w0
		y -= vanchor * this.h0
		// coordinates of bottom-left of texture
		x -= this.d
		y -= this.h - this.h0 - this.d
		x = Math.round(x)
		y = Math.round(y)
		this.program.settexturesize(this.w, -this.h)
		this.program.setp0(x, y+this.h)
		this.program.setalpha(alpha)
		this.program.gl.bindTexture(this.program.gl.TEXTURE_2D, this)
		this.program.gl.drawArrays(this.program.gl.TRIANGLE_FAN, 0, 4)
	},

	// Call this occasionally for garbage collection at the beginning of a loop, when it's okay
	//   to remove any unused textures.
	cleanup: function () {
		// Naive implementation: remove everything every frame
		this.clear()
	},

	clear: function () {
		for (var t in this.textures) {
			this.textotal -= this.textures[t].s
			gl.deleteTexture(this.textures[t])
			delete this.textures[t]
		}
	},

}



