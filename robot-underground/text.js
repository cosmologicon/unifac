// Handle text by rendering it to a 2d canvas and load it as a texture

var text = {
	textures: {},  // cached textures
	textotal: 0,  // total number of pixels of all currently stored textures
	tick: 0,  // for keeping track of which textures were used most recently

	gettexture: function (text, fontsize, colour) {
		var key = text + ":" + fontsize + ":" + colour
		if (this.textures[key]) return this.textures[key]

		var d = Math.ceil(0.2 * fontsize)
		var can = document.createElement("canvas")
		var con = can.getContext("2d")
		con.font = fontsize + "px 'Hockey'"
		var w0 = con.measureText(text).width, h0 = fontsize  // size of text box itself
		var w1 = w0 + 2 * d, h1 = h0 + 2 * d  // size of text box with buffer
		var w = 2, h = 2  // size of texture (must be power of 2)
		while (w < w1) w <<= 1
		while (h < h1) h <<= 1
		can.width = w ; can.height = h
		con.font = fontsize + "px 'Hockey'"
		if (settings.DEBUG) {
			con.fillStyle = "rgba(255,255,0,0.08)"
			con.fillRect(0, 0, w1, h1)
			con.fillRect(d, d, w0, h0)
		}
		con.fillStyle = colour
		con.textBaseline = "top"
		con.textAlign = "left"
		con.fillText(text, d, d)

		var t = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, t)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, can)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		
		t.w0 = w0 ; t.h0 = h0
		t.w1 = w1 ; t.h1 = h1
		t.w = w ; t.h = h
		t.d = d
		t.x0 = d ; t.y0 = h0 + d
		t.s = w * h
		this.textotal += t.s

		this.textures[key] = t
		return t
	},

	// Draw text in HUD coordinates
	drawhud: function (text, x, y, fontsize, colour, hanchor, vanchor) {
		hanchor = hanchor ? hanchor.trim ? {left: 0, center: 0.5, right: 1}[hanchor] : hanchor : 0
		vanchor = vanchor ? vanchor.trim ? {bottom: 0, middle: 0.5, top: 1}[vanchor] : vanchor : 0
		var texture = this.gettexture(text, fontsize, colour)
		texture.tick = this.tick++
		graphics.settexture(texture)
		x = Math.round(x - texture.x0 - hanchor * texture.w0)
		y = Math.round(y - texture.y0 - (vanchor - 1) * texture.h0)
		graphics.tracehudrect([x,y], [texture.w, texture.h])
	},

	width: function (text, fontsize, colour) {
		colour = colour || "white"
		return this.gettexture(text, fontsize, colour).w1
	},

	
	// Call this occasionally for garbage collection at the beginning of a loop, when it's okay
	//   to remove any unused textures.
	cleanup: function () {
		// Naive implementation: remove everything every frame
		for (var t in this.textures) {
			this.textotal -= this.textures[t].s
			delete this.textures[t]
		}
	},

}


