

var background = {
	init: function () {
		this.nstar = 5000
		this.starposdata = []
		while (this.starposdata.length < this.nstar * 3) {
			this.starposdata.push(UFX.random())
		}
		this.starposbuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.starposbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.starposdata), gl.STATIC_DRAW)
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
}

