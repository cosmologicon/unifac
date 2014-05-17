

var background = {
	init: function () {
		// Starscape
		this.nstar = 5000
		this.starposdata = []
		while (this.starposdata.length < this.nstar * 3) {
			this.starposdata.push(UFX.random())
		}
		this.starposbuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.starposbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.starposdata), gl.STATIC_DRAW)
		// Grid
		this.gridbuffer = gl.createBuffer()
		this.updategrid()
	},
	updategrid: function () {
		var Ns = {}, edgedata = []
		function addlines(part) {
			var vpHs = HverticesofhexH(part.pH)
			for (var j = 0 ; j < 6 ; ++j) {
				var pH0 = vpHs[j], pH1 = vpHs[(j + 1) % 6]
				var N = NconvertH([pH0[0] + pH1[0], pH0[1] + pH1[1]])
				if (Ns[N]) continue
				Ns[N] = true
				var pG0 = GconvertH(pH0), pG1 = GconvertH(pH1)
				edgedata.push(pG0[0], pG0[1], pG1[0], pG1[1])
			}
		}
		state.parts.forEach(addlines)
		state.stumps.forEach(addlines)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gridbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(edgedata), gl.STATIC_DRAW)
		this.ngrid = edgedata.length / 2
	},
	drawstarscape: function () {
		graphics.progs.starscape.use()
		graphics.progs.starscape.setcanvassizeD(playpanel.wD, playpanel.hD)
		graphics.progs.starscape.setvcenterG(state.viewstate.x0G, state.viewstate.y0G)
		graphics.progs.starscape.setDscaleG(state.viewstate.VzoomG)
		gl.enableVertexAttribArray(graphics.progs.starscape.attribs.pos)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.starposbuffer)
		gl.vertexAttribPointer(graphics.progs.starscape.attribs.pos, 3, gl.FLOAT, false, 0, 0)

		var n = Math.min(this.nstar, Math.ceil(0.005 * playpanel.wD * playpanel.hD))
		gl.drawArrays(gl.POINTS, 0, n)
	},
	drawgrid: function () {
		var vs = state.viewstate
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		graphics.progs.grid.use()
		graphics.progs.grid.setcanvassizeD(playpanel.wD, playpanel.hD)
		graphics.progs.grid.setvcenterG(vs.x0G, vs.y0G)
		graphics.progs.grid.setDscaleG(vs.VzoomG)
		var afactor = clamp(vs.VzoomG * 0.02, 0.2, 1)
		graphics.progs.grid.setcolor(0.4, 0.4, 0.9, controlstate.gridalpha * afactor)

		gl.enableVertexAttribArray(graphics.progs.grid.attribs.posD)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gridbuffer)
		gl.vertexAttribPointer(graphics.progs.grid.attribs.posD, 2, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.LINES, 0, this.ngrid)
	},
}

