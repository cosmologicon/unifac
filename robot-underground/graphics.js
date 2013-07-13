
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
		
		this.matrix0 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])

		this.clearbuffer = gl.createBuffer()
		this.bindbuffer(this.clearbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW)

		this.imgbuffer = gl.createBuffer()
		this.bindbuffer(this.imgbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gdata.ps), gl.STATIC_DRAW)

		this.W = 2/canvas.width
		this.H = 2/canvas.height
		this.cx = 0
		this.cy = 0
		this.cz = 1
	},
	bindbuffer: function (buffer) {
		this.currentbuffer = buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.enableVertexAttribArray(this.positionLocation)
		gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0)
	},
	setcolour: function (colour) {
		gl.uniform4f(this.colorLocation, colour[0], colour[1], colour[2], 1)
	},
	clear: function (colour) {
		this.bindbuffer(this.clearbuffer)
		gl.uniformMatrix4fv(this.xform, false, this.matrix0)
		this.setcolour(colour || [0, 0, 0])
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
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
//	drawlinestrip: function (ps, color) {
//		gl.bufferData(gl.ARRAY_BUFFER, ps, gl.STATIC_DRAW)
//		gl.uniform4f(this.colorLocation, color[0], color[1], color[2], 1)
//		gl.drawArrays(gl.LINE_STRIP, 0, ps.length / 2)
//	},
	trace: function (sprite, x, y, h, A) {
		if (this.currentbuffer !== this.imgbuffer) this.bindbuffer(this.imgbuffer)
		this.setxform(x, y, h / sprite.height, A)
		gl.drawArrays(gl.LINES, sprite.p0, sprite.np)
	},
	draw: function (img, x, y, h, A, opts) {
		if (img.colour) this.setcolour(img.colour)

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
	drawfloor: function (cx, cy, cs) {
		this.draw(gdata.floor, cx*cs, cy*cs, cs, 0)
	},

	drawwall: function (code, cx, cy, cs) {
		this.draw(gdata.walls[code], cx*cs, cy*cs, cs, 0)
	},
	drawcursor: function (mode, x, y) {
		this.draw(gdata.cursors[mode], x-20, y-20, 40, 0)
	},
}


// cat graphics/__init__.py | grep "world\." | sed 's|world|edgenum|g;s|svg.SVG.||;s|images.||;s|\/|.|;s|).||;s|^ *|wallimgnames[|;s|:|] =|;s|.svgz||'
var wallimgnames = {}
wallimgnames[edgenum.top] = "scenery.wallup"
wallimgnames[edgenum.bottom] = "scenery.walldown"
wallimgnames[edgenum.left] = "scenery.wallleft"
wallimgnames[edgenum.right] = "scenery.wallright"
wallimgnames[edgenum.top + edgenum.bottom] = "scenery.equals"
wallimgnames[edgenum.left + edgenum.right] = "scenery.uprightequals"
wallimgnames[edgenum.left + edgenum.top] = "scenery.cornertl"
wallimgnames[edgenum.right + edgenum.top] = "scenery.cornertr"
wallimgnames[edgenum.left + edgenum.bottom] = "scenery.cornerbl"
wallimgnames[edgenum.right + edgenum.bottom] = "scenery.cornerbr"
wallimgnames[edgenum.top + edgenum.left + edgenum.bottom] = "scenery.deadright"
wallimgnames[edgenum.top + edgenum.right + edgenum.bottom] = "scenery.deadleft"
wallimgnames[edgenum.top + edgenum.left + edgenum.right] = "scenery.deaddown"
wallimgnames[edgenum.right + edgenum.left + edgenum.bottom] = "scenery.deadup"
wallimgnames[edgenum.topleft] = "scenery.cornerpieceul"
wallimgnames[edgenum.topright] = "scenery.cornerpieceur"
wallimgnames[edgenum.bottomleft] = "scenery.cornerpiecedl"
wallimgnames[edgenum.bottomright] = "scenery.cornerpiecedr"
wallimgnames[edgenum.topleft + edgenum.topright] = "scenery.dblcornertop"
wallimgnames[edgenum.topright + edgenum.bottomright] = "scenery.dblcornerright"
wallimgnames[edgenum.bottomleft + edgenum.bottomright] = "scenery.dblcornerbottom"
wallimgnames[edgenum.bottomleft + edgenum.topleft] = "scenery.dblcornerleft"
wallimgnames[edgenum.bottomleft + edgenum.topright] = "scenery.dblcornerdiagright"
wallimgnames[edgenum.topleft + edgenum.bottomright] = "scenery.dblcornerdiagleft"
wallimgnames[edgenum.left + edgenum.bottomright] = "scenery.linecornrightdown"
wallimgnames[edgenum.left + edgenum.topright] = "scenery.linecornrightup"
wallimgnames[edgenum.right + edgenum.bottomleft] = "scenery.linecornleftdown"
wallimgnames[edgenum.right + edgenum.topleft] = "scenery.linecornleftup"
wallimgnames[edgenum.top + edgenum.bottomleft] = "scenery.linecorndownleft"
wallimgnames[edgenum.top + edgenum.bottomright] = "scenery.linecorndownright"
wallimgnames[edgenum.bottom + edgenum.topleft] = "scenery.linecornupleft"
wallimgnames[edgenum.bottom + edgenum.topright] = "scenery.linecornupright"
wallimgnames[edgenum.left + edgenum.bottomright + edgenum.topright] = "scenery.linecornright"
wallimgnames[edgenum.top + edgenum.bottomright + edgenum.bottomleft] = "scenery.linecorndown"
wallimgnames[edgenum.right + edgenum.topleft + edgenum.bottomleft] = "scenery.linecornleft"
wallimgnames[edgenum.bottom + edgenum.topleft + edgenum.topright] = "scenery.linecornup"
wallimgnames[edgenum.left + edgenum.top + edgenum.bottomright] = "scenery.cornercornerbr"
wallimgnames[edgenum.right + edgenum.top + edgenum.bottomleft] = "scenery.cornercornerbl"
wallimgnames[edgenum.left + edgenum.bottom + edgenum.topright] = "scenery.cornercornertr"
wallimgnames[edgenum.right + edgenum.bottom + edgenum.topleft] = "scenery.cornercornertll"
wallimgnames[edgenum.topleft + edgenum.topright + edgenum.bottomleft] = "scenery.triplecornerdr"
wallimgnames[edgenum.topleft + edgenum.topright + edgenum.bottomright] = "scenery.triplecornerlr"
wallimgnames[edgenum.topleft + edgenum.bottomright + edgenum.bottomleft] = "scenery.triplecornerur"
wallimgnames[edgenum.bottomright + edgenum.topright + edgenum.bottomleft] = "scenery.triplecornerul"
wallimgnames[edgenum.topleft + edgenum.topright + edgenum.bottomleft + edgenum.bottomright] = "scenery.quadcorner"








