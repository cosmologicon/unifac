
var canvas = document.getElementById("canvas")
canvas.width = settings.scr_w
canvas.height = settings.scr_h
var gl = canvas.getContext("webgl", { antialias: true })

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
		this.colorLocation = gl.getUniformLocation(program, "color")
		this.positionLocation = gl.getAttribLocation(program, "pos")
		this.xform = gl.getUniformLocation(program, "xform")
		
		gl.clearColor(0, 0, 0, 1)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

		this.imgbuffer = gl.createBuffer()
		this.bindbuffer(this.imgbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gdata.ps), gl.STATIC_DRAW)

		this.primbuffer = gl.createBuffer()  // for drawing procedurally-generated primitives

		this.W = 2/canvas.width
		this.H = 2/canvas.height
		this.cx = 0
		this.cy = 0
		this.cz = 1  // world zoom level
		this.hz = 1  // hud zoom level
		
		// drawing the choppy rectangles
		var rectps = [0.5,0.5]
		for (var dir = 0 ; dir < 4 ; ++dir) {
			for (var j = 0 ; j < 10 ; ++j) {
				var p = [0,1,j/10,1-j/10], x = p[[2,1,3,0][dir]], y = p[[0,2,1,3][dir]]
				rectps.push(UFX.random.normal(x, 0.005))
				rectps.push(UFX.random.normal(y, 0.005))
			}
		}
		rectps.push(rectps[2])
		rectps.push(rectps[3])
		this.rectbuffer = gl.createBuffer()
		this.bindbuffer(this.rectbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rectps), gl.STATIC_DRAW)
	},
	bindbuffer: function (buffer) {
		this.currentbuffer = buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.enableVertexAttribArray(this.positionLocation)
		gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0)
	},
	setcolour: function (colour) {
		gl.uniform4f(this.colorLocation, colour[0], colour[1], colour[2], (colour.length === 4 ? colour[3] : 1))
	},
	clear: function () {
		gl.clear(gl.COLOR_BUFFER_BIT)
	},
	setxform: function (x, y, s, A) {
		var S = A ? Math.sin(A) : 0, C = A ? Math.cos(A) : 1
		s = s || 1
		x = x || 0
		y = y || 0
		var arr = new Float32Array([
			this.cz*this.W*C*s, this.cz*this.H*S*s, 0, 0,
			-this.cz*this.W*S*s, this.cz*this.H*C*s, 0, 0,
			0, 0, 1, 0,
			(x-this.cx)*this.cz*this.W, (y-this.cy)*this.cz*this.H, 0, 1
		])
		gl.uniformMatrix4fv(this.xform, false, arr)
	},
	sethudxform: function (x, y, sx, sy) {
		x = x || 0
		y = y || 0
		sx = sx || 1
		sy = sy || sx
		gl.uniformMatrix4fv(this.xform, false, new Float32Array(
			[this.hz*this.W*sx, 0, 0, 0, 0, this.hz*this.H*sy, 0, 0, 0, 0, 1, 0,
			x*this.hz*this.W-1, y*this.hz*this.H-1, 0, 1]
		))
	},
	trace: function (sprite, x, y, h, A) {
		if (this.currentbuffer !== this.imgbuffer) this.bindbuffer(this.imgbuffer)
		this.setxform(x, y, h / sprite.height, A)
		gl.drawArrays(gl.LINES, sprite.p0, sprite.np)
	},
	tracehud: function (sprite, x, y, h) {
		if (this.currentbuffer !== this.imgbuffer) this.bindbuffer(this.imgbuffer)
		this.sethudxform(x, y, h / sprite.height)
		gl.drawArrays(gl.LINES, sprite.p0, sprite.np)
	},
	draw: function (img, x, y, h, A, opts) {
		if (opts && opts.colour) this.setcolour(opts.colour)
		else if (img.colour) this.setcolour(img.colour)

		if (img.np) {  // regular SVG
			this.trace(img, x, y, h, A)
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
	drawhud: function (img, x, y, h, opts) {
		if (opts && opts.colour) this.setcolour(opts.colour)
		else if (img.colour) this.setcolour(img.colour)
		this.tracehud(img, x, y, h)
	},
	drawfloor: function (cx, cy, cs) {
		this.draw(gdata.floor, cx*cs, cy*cs, cs, 0)
	},

	drawwall: function (code, cx, cy, cs) {
		this.draw(gdata.walls[code], cx*cs, cy*cs, cs, 0)
	},
	drawcursor: function (mode, x, y) {
		this.draw(gdata.cursors[mode], x-20, y-20, 40, 0)
	},
	
	// Draw procedurally-generated graphical primitives
	primload: function (ps) {
		if (this.currentbuffer !== this.primbuffer) this.bindbuffer(this.primbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ps), gl.DYNAMIC_DRAW)
	},
	drawstrip: function (ps) {
		this.primload(ps)
		gl.drawArrays(gl.LINE_STRIP, 0, ps.length / 2)
	},
	drawhudrect: function (pos, size, outline, solid) {
		this.sethudxform(pos[0], pos[1], size[0], size[1])
		if (this.currentbuffer !== this.rectbuffer) this.bindbuffer(this.rectbuffer)
		if (solid) {
			this.setcolour(solid)
			gl.drawArrays(gl.TRIANGLE_FAN, 0, 42)
		}
		if (outline) {
			this.setcolour(outline)
			gl.drawArrays(gl.LINE_LOOP, 1, 40)
		}
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

