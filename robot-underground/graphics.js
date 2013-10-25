
var canvas = document.getElementById("canvas")
canvas.width = settings.scr_w
canvas.height = settings.scr_h
var gl = canvas.getContext("experimental-webgl", { antialias: settings.antialias })

var graphics = {
	init: function () {
		function makeshader(gl, scriptId, shaderType) {
			var shader = gl.createShader(shaderType)
			var shaderScript = document.getElementById(scriptId)
			gl.shaderSource(shader, shaderScript.text)
			gl.compileShader(shader)
			return shader
		}
		var program = gl.createProgram()
		gl.attachShader(program, makeshader(gl, "2d-vertex-shader", gl.VERTEX_SHADER))
		gl.attachShader(program, makeshader(gl, "2d-fragment-shader", gl.FRAGMENT_SHADER))
		gl.linkProgram(program)
		gl.useProgram(program)
		this.svars = {  // shader variables
			// From the vertex shader
			pos: gl.getAttribLocation(program, "pos"),
			tcoord: gl.getAttribLocation(program, "tcoord"),
			xform: gl.getUniformLocation(program, "xform"),
			// From the fragment shader
			tfac: gl.getUniformLocation(program, "tfac"),
			sampler: gl.getUniformLocation(program, "sampler"),
			colour: gl.getUniformLocation(program, "colour"),
		}

		this.setlinewidth(settings.linewidth)
		
		gl.clearColor(0, 0, 0, 1)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

		this.imgbuffer = gl.createBuffer()
		this.bindbuffer(this.imgbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gdata.ps), gl.STATIC_DRAW)

		this.primbuffer = gl.createBuffer()  // for drawing procedurally-generated primitives

		// for caching floors and walls of the map
		this.worldchunkbuffer = gl.createBuffer()
		this.worldchunks = {}

		this.W = 2/canvas.width
		this.H = 2/canvas.height
		this.cx = 0
		this.cy = 0
		this.cz = 1  // world zoom level
		this.hz = 1  // hud zoom level
		
		// drawing the choppy rectangles
		var rectps = [0,0,1,0,1,1,0,1,0.5,0.5]
		for (var dir = 0 ; dir < 4 ; ++dir) {
			for (var j = 0 ; j < 10 ; ++j) {
				var p = [0,1,j/10,1-j/10], x = p[[2,1,3,0][dir]], y = p[[0,2,1,3][dir]]
				rectps.push(UFX.random.normal(x, 0.005))
				rectps.push(UFX.random.normal(y, 0.005))
			}
		}
		rectps.push(rectps[10])
		rectps.push(rectps[11])
		this.rectbuffer = gl.createBuffer()
		this.bindbuffer(this.rectbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectps), gl.STATIC_DRAW)

		gl.activeTexture(gl.TEXTURE0)
		gl.uniform1i(this.svars.sampler, 0)
		// The texture coordinate buffer is very simple - basically we only ever draw complete
		//   textures.
		this.texbuffer = gl.createBuffer()
		this.bindtexbuffer(this.texbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,1,1,1,1,0,0,0]), gl.STATIC_DRAW)
	},

	// Set the vertex array buffer
	bindbuffer: function (buffer) {
		if (this.currentbuffer === buffer) return
		this.currentbuffer = buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.enableVertexAttribArray(this.svars.pos)
		gl.vertexAttribPointer(this.svars.pos, 2, gl.FLOAT, false, 0, 0)
	},
	// Set the texture coordinate array buffer
	bindtexbuffer: function (buffer) {
		if (this.currentbuffer === buffer) return
		this.currentbuffer = buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.enableVertexAttribArray(this.svars.tcoord)
		gl.vertexAttribPointer(this.svars.tcoord, 2, gl.FLOAT, false, 0, 0)
	},
	setcolour: function (colour) {
		if (colour.length == 3) colour.push(1)
		gl.uniform4fv(this.svars.colour, colour)
		gl.uniform1f(this.svars.tfac, 0)
		gl.disableVertexAttribArray(this.svars.tcoord)
	},
	settexture: function (texture) {
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.enableVertexAttribArray(this.svars.tcoord)
		gl.vertexAttribPointer(this.svars.tcoord, 2, gl.FLOAT, false, 0, 0)
		gl.uniform1f(this.svars.tfac, 1)
	},
	setlinewidth: function (lw) {
		settings.linewidth = lw
		gl.lineWidth(lw)
	},
	clear: function () {
		gl.clear(gl.COLOR_BUFFER_BIT)
	},
	// Set the alpha channel to 1 everywhere. Should call this at the end of the drawing loop
	// because webGL allows the canvas to bleed through to the background color
	onealpha: function () {
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.ONE, gl.ONE)
		this.setrectxform(0, 0, settings.scr_w, settings.scr_h, 1)
		this.bindbuffer(this.rectbuffer)
		this.setcolour([0, 0, 0, 1])
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
	},
	worldtoscreen: function (x, y) {
		return [
			Math.round((x - this.cx) * this.cz + settings.scr_w/2),
			Math.round((y - this.cy) * this.cz + settings.scr_h/2),
		]
	},
	// World coordinates
	setxform: function (x, y, s, A) {
		var S = A ? Math.sin(A) : 0, C = A ? Math.cos(A) : 1
		s = s || 1
		x = x || 0
		y = y || 0
		gl.uniformMatrix3fv(this.svars.xform, false, new Float32Array([
			this.cz*this.W*C*s, this.cz*this.H*S*s, 0,
			-this.cz*this.W*S*s, this.cz*this.H*C*s, 0,
			(x*this.cz-Math.round(this.cx*this.cz))*this.W,
			(y*this.cz-Math.round(this.cy*this.cz))*this.H, 1
		]))
	},
	// HUD coordinates
	sethudxform: function (x, y, s, A) {
		var S = A ? Math.sin(A) : 0, C = A ? Math.cos(A) : 1
		s = s || 1
		x = x || 0
		y = y || 0
		gl.uniformMatrix3fv(this.svars.xform, false, new Float32Array([
			this.hz*this.W*C*s, this.hz*this.H*S*s, 0,
			-this.hz*this.W*S*s, this.hz*this.H*C*s, 0,
			x*this.hz*this.W-1, y*this.hz*this.H-1, 1
		]))
	},
	// HUD coordinates that allows no rotation but different x and y stretch factors
	setrectxform: function (x, y, sx, sy, z) {
		x = x || 0
		y = y || 0
		sx = sx || 1
		sy = sy || sx
		z = z || this.hz
		gl.uniformMatrix3fv(this.svars.xform, false, new Float32Array([
			z*this.W*sx, 0, 0,
			0, z*this.H*sy, 0,
			x*z*this.W-1, y*z*this.H-1, 1
		]))
	},
	trace: function (sprite, x, y, h, A, hud) {
		this.bindbuffer(this.imgbuffer)
		if (hud) this.sethudxform(x, y, h / sprite.height, A)
		else this.setxform(x, y, h / sprite.height, A)
		gl.drawArrays(gl.LINES, sprite.p0, sprite.np)
	},
	draw: function (img, x, y, h, A, opts) {
		if (opts && opts.colour) this.setcolour(opts.colour)
		else if (img.colour) this.setcolour(img.colour)

		if (img.np) {  // regular SVG
			this.trace(img, x, y, h, A, opts && opts.hud)
		} else if (img.frames) {  // AnimatedSVG
			var frameno = Math.floor(opts.frameno / img.framelength) % img.frames.length
			this.draw(img.frames[frameno], x, y, h, A, opts)
		} else if (img.states) {  // StatefulSVG
			this.draw(img.states[opts.state], x, y, h, A, opts)
		} else if (img.base) {  // TurretSVG
			this.draw(img.base, x, y, h, A, opts)
			this.draw(img.turret, x, y, h, opts.turretbearing, opts)
		}
	},
	drawfloor: function (cx, cy, cs) {
		this.draw(gdata.floor, cx*cs, cy*cs, cs, 0)
	},

	drawwall: function (code, cx, cy, cs) {
		this.draw(gdata.walls[code], cx*cs, cy*cs, cs, 0)
	},
	drawcursor: function (mode, x, y, opts) {
		this.draw(gdata.cursors[mode], x, y, 40, 0, opts)
	},
	
	// Draw procedurally-generated graphical primitives
	primload: function (ps) {
		this.bindbuffer(this.primbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ps), gl.DYNAMIC_DRAW)
	},
	drawstrip: function (ps) {
		this.setxform()
		this.primload(ps)
		gl.drawArrays(gl.LINE_STRIP, 0, ps.length / 2)
	},

	// Draw one of those jagged rectangles we like so much
	drawhudrect: function (pos, size, outline, solid, z) {
		this.setrectxform(pos[0], pos[1], size[0], size[1], z)
		this.bindbuffer(this.rectbuffer)
		if (solid) {
			this.setcolour(solid)
			gl.drawArrays(gl.TRIANGLE_FAN, 4, 42)
		}
		if (outline) {
			this.setcolour(outline)
			gl.drawArrays(gl.LINE_LOOP, 5, 41)
		}
	},
	drawworldrect: function (pos, size, outline, solid) {
		var spos = this.worldtoscreen(pos[0], pos[1]), ssize = [size[0] * this.cz, size[1] * this.cz]
		this.drawhudrect(spos, ssize, outline, solid, 1)
	},
	// For textures (basically, text)
	// Set z to 1 to override hud zoom and use screen coordinates
	tracehudrect: function (pos, size, z) {
		this.setrectxform(pos[0], pos[1], size[0], size[1], z)
		this.bindbuffer(this.rectbuffer)
		this.bindtexbuffer(this.texbuffer)
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
	},
	
	// Draw the floor and walls of dungeons
	makeworldchunks: function (map, wcx, wcy) {
		var t0 = Date.now()
		var chunks = {}, gps = gdata.ps
		var fp0 = 2 * gdata.floor.p0, flen = 2 * gdata.floor.np
		var wp0 = {}, wlen = {}
		for (var v in gdata.walls) {
			wp0[v] = 2 * gdata.walls[v].p0
			wlen[v] = 2 * gdata.walls[v].np
		}
		var mapwalls = map.getWalls()
		var nps = 0
		for (var n in map.cells) nps += flen
		for (var n in mapwalls) nps += wlen[mapwalls[n]]
		var ps = new Float32Array(nps), pj = 0
		
		var t1 = Date.now()

		for (var n in map.cells) {
			var x = gridx(n), y = gridy(n)
			var cx = Math.floor(x/wcx), cy = Math.floor(y/wcy)
			var cn = gridn(cx, cy)
			if (!chunks[cn]) chunks[cn] = { floorxs: [], floorys: [], wallxs: [], wallys: [], wallvs: [] }
			chunks[cn].floorxs.push(x)
			chunks[cn].floorys.push(y)
		}
		for (var n in mapwalls) {
			var x = gridx(n), y = gridy(n)
			var cx = Math.floor(x/wcx), cy = Math.floor(y/wcy)
			var cn = gridn(cx, cy)
			if (!chunks[cn]) chunks[cn] = { floorxs: [], floorys: [], wallxs: [], wallys: [], wallvs: [] }
			chunks[cn].wallxs.push(x)
			chunks[cn].wallys.push(y)
			chunks[cn].wallvs.push(mapwalls[n])
		}

		var t2 = Date.now()

		this.worldchunks = { cs: map.csize }
		for (var cn in chunks) {
		
			var chunk = chunks[cn], floorxs = chunk.floorxs, floorys = chunk.floorys
			this.worldchunks[cn] = { floorp0: pj/2 }
			for (var fj = 0 ; fj < floorxs.length ; ++fj) {
				 var x = floorxs[fj], y = floorys[fj], h = gdata.floor.height
				 for (var j = 0, i = fp0 ; j < flen ; j += 2) {
				 	ps[pj++] = gps[i++] / h + x
				 	ps[pj++] = gps[i++] / h + y
			 	}
		 	}
		 	this.worldchunks[cn].floornp = pj/2 - this.worldchunks[cn].floorp0

			var wallxs = chunk.wallxs, wallys = chunk.wallys, wallvs = chunk.wallvs
		 	this.worldchunks[cn].wallp0 = pj/2
			for (var wj = 0 ; wj < wallxs.length ; ++wj) {
				 var x = wallxs[wj], y = wallys[wj], v = wallvs[wj]
				 var h = gdata.walls[v].height, i0 = wp0[v], jmax = wlen[v]
				 for (var j = 0, i = i0 ; j < jmax ; j += 2) {
				 	ps[pj++] = gps[i++] / h + x
				 	ps[pj++] = gps[i++] / h + y
			 	}
		 	}
		 	this.worldchunks[cn].wallnp = pj/2 - this.worldchunks[cn].wallp0
		}

		var t3 = Date.now()

		this.bindbuffer(this.worldchunkbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, ps, gl.STATIC_DRAW)
		var t4 = Date.now()
		

//		console.log(ps.length, t1 - t0, t2 - t1, t3 - t2, t4 - t3, (t4 - t0) + "ms")
	},
	drawworldchunk: function (cx, cy, fcolour, wcolour) {
		var cn = gridn(cx, cy)
		var chunk = this.worldchunks[cn]
		if (!chunk) return
		this.bindbuffer(this.worldchunkbuffer)
		this.setxform(0, 0, this.worldchunks.cs, 0)
		this.setcolour(fcolour)
		gl.drawArrays(gl.LINES, chunk.floorp0, chunk.floornp)
		this.setcolour(wcolour)
		gl.drawArrays(gl.LINES, chunk.wallp0, chunk.wallnp)
	},

	debugcircle: function (x, y, r, colour, hud) {
		this.draw(gdata.debug_iface_circle, x-r, y-r, 2*r, 0, {colour: colour, hud: hud})
	},
}

wall_colours = {
	town: [1,.9,.8],
	cave: [.8,.8,.6],
	basic: [1,1,1],
}
floor_colours = {
	town: [.2,.1,0],
	cave: [.4,.4,.4],
	basic: [0,.1,.2],
}
trail_colours = {
	fire: [1,1,0,1,0,0],
	smoke: [1,1,1,0,0,0],
	railgun: [0,1,1,0,0,1],
}

