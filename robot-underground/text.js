// Handle text by rendering it to a 2d canvas and load it as a texture

// TODO: would it kill me to have some consistency with the method argument orderings?

var text = {
	textures: {},  // cached textures
	textotal: 0,  // total number of pixels of all currently stored textures

	// tick is incremented every time a texture is fetched. I'm not worried about overflow because
	//   that won't occur until tick = 9007199254740992, which means you can fetch 1000 textures
	//   per frame at 60fps continuously for over 4000 years.
	tick: 0,  // for keeping track of which textures were used most recently

	gettexture: function (text, fontsize, colour, twidth, talign) {
		var key = text + ":" + fontsize + ":" + colour + ":" + twidth + ":" + talign
		if (this.textures[key]) return this.textures[key]

		var d = Math.ceil(0.2 * fontsize), lh = Math.ceil(1.25 * fontsize)
		var can = document.createElement("canvas")
		var con = can.getContext("2d")
		con.font = fontsize + "px 'Hockey'"
		var texts = text.split("\n")
		if (twidth) {
			texts = [].concat.apply([], texts.map(function(t) { return wordwrap(t, twidth, con) }))
		}
		var w0 = Math.max.apply(null, texts.map(function (t) { return con.measureText(t).width }))
		var h0 = fontsize + lh * (texts.length - 1)  // size of text box itself
		var w1 = w0 + 2 * d, h1 = h0 + 2 * d  // size of text box with buffer
		var w = 2, h = 2  // size of texture (must be power of 2)
		while (w < w1) w <<= 1
		while (h < h1) h <<= 1
		can.width = w ; can.height = h
		con.font = fontsize + "px 'Hockey'"
		if (settings.DEBUG) {
			con.fillStyle = "rgba(255,0,0,0.06)"
			con.fillRect(0, 0, w, h)
			con.fillStyle = "rgba(255,255,0,0.08)"
			con.fillRect(0, 0, w1, h1)
			con.fillRect(d, d, w0, h0)
		}
		con.fillStyle = colour
		con.textBaseline = "top"
		// TODO: there's got to be a better way than converting this back and forth so many times
		talign = {0: "left", 0.5: "center", 1: "right"}[talign] || talign || "left"
		con.textAlign = talign
		//con.strokeStyle = "black"
		//con.lineWidth = 5
		var x0 = Math.round(d + {left: 0, center: 0.5, right: 1}[talign] * w0)

		texts.forEach(function (text, j) {
			//con.strokeText(text, x0, d + j * lh)
			con.fillText(text, x0, d + j * lh)
		})

		var t = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, t)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, can)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		
		t.drawhud = this.bounddrawhud
		t.drawworld = this.bounddrawworld
		t.w0 = w0 ; t.h0 = h0
		t.w1 = w1 ; t.h1 = h1
		t.w = w ; t.h = h
		t.d = d
		t.x0 = d ; t.y0 = d
		t.s = w * h
		this.textotal += t.s

		this.textures[key] = t
		return t
	},

	// Draw text in HUD coordinates
	// (hanchor, vanchor) is anchor point: (0,0) = bottom left, (1, 1) = top right
	// Can be specified as either a number or string: left/center/right, bottom/middle/top
	drawhud: function (text, x, y, fontsize, colour, hanchor, vanchor, twidth, talign) {
		this.gettexture(text, fontsize, colour, twidth, talign).drawhud(x, y, hanchor, vanchor)
	},
	
	drawworld: function (text, x, y, fontsize, colour, hanchor, vanchor, twidth, talign) {
		fontsize = Math.round(fontsize * graphics.cz)
		this.gettexture(text, fontsize, colour, twidth, talign).drawworld(x, y, hanchor, vanchor)
	},
	
	// apply this to a texture object before calling
	bounddrawhud: function (x, y, hanchor, vanchor) {
		//graphics.debugcircle(x, y, 4, [1,0,1], true)
		hanchor = hanchor ? hanchor.trim ? {left: 0, center: 0.5, right: 1}[hanchor] : hanchor : 0
		vanchor = vanchor ? vanchor.trim ? {bottom: 0, middle: 0.5, top: 1}[vanchor] : vanchor : 0
		this.tick = text.tick++
		graphics.settexture(this)
		// coordinates of bottom-left of inner box
		x -= hanchor * this.w0
		y -= vanchor * this.h0
		// coordinates of bottom-left of texture
		x -= this.d
		y -= this.h - this.h0 - this.d
		x = Math.round(x)
		y = Math.round(y)
		graphics.tracehudrect([x,y], [this.w, this.h])
	},
	// draw at the given x,y world coordinates (but not zoomed with current world zoom level)
	bounddrawworld: function (x, y, hanchor, vanchor) {
		hanchor = hanchor ? hanchor.trim ? {left: 0, center: 0.5, right: 1}[hanchor] : hanchor : 0
		vanchor = vanchor ? vanchor.trim ? {bottom: 0, middle: 0.5, top: 1}[vanchor] : vanchor : 0
		this.tick = text.tick++
		graphics.settexture(this)
		var spos = graphics.worldtoscreen(x, y), sx = spos[0], sy = spos[1]
		// coordinates of bottom-left of inner box
		sx -= hanchor * this.w0
		sy -= vanchor * this.h0
		// coordinates of bottom-left of texture
		sx -= this.d
		sy -= this.h - this.h0 - this.d
		sx = Math.round(sx)
		sy = Math.round(sy)
		graphics.tracehudrect([sx,sy], [this.w, this.h], 1)
	},


	// Draw text with one of those jagged borders around it
	drawhudborder: function (text, x, y, fontsize, colour, gutter, hanchor, vanchor, twidth, talign) {
		hanchor = hanchor ? hanchor.trim ? {left: 0, center: 0.5, right: 1}[hanchor] : hanchor : 0
		vanchor = vanchor ? vanchor.trim ? {bottom: 0, middle: 0.5, top: 1}[vanchor] : vanchor : 0
		var ttex = this.gettexture(text, fontsize, colour, twidth, talign)
		var px = Math.round(x - hanchor * ttex.w0 - gutter)
		var py = Math.round(y - vanchor * ttex.h0 - gutter)
		var size = [ttex.w0 + 2 * gutter, ttex.h0 + 2 * gutter]
		graphics.drawhudrect([px, py], size, [1,1,1,1], [0,0,0,0.8])
		ttex.drawhud(x, y, hanchor, vanchor)
		//graphics.draw(gdata.debug_iface_circle, px-4, py-4, 8, 0, {colour: [1,0,1], hud: true})
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


function wordwrap(text, twidth, con) {
	twidth = twidth || con.canvas.width
	var texts = [text], n = 0, s
	while (con.measureText(texts[n]).width > twidth && (s = texts[n].indexOf(" ")) > -1) {
		var t = texts[n], a = t.lastIndexOf(" ")
		while (con.measureText(t.substr(0, a)).width > twidth && a > s) a = t.lastIndexOf(" ", a-1)
		texts[n++] = t.substr(0, a)
		texts.push(t.substr(a+1))
	}
	return texts
}



