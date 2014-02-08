// Controls what part of the screen various control panels take up, including gameplay area.
// Going for an extremely repsonsive design here. The screen should be able to be resized
//   arbitrarily at any point in the game without interrupting the flow of gameplay.


var panelproto = {
	placeD: function (xD, yD, wD, hD) {
		this.xD = xD || 0
		this.yD = yD || 0
		this.wD = wD
		this.hD = hD
	},
	catchesD: function (posD) {
		return this.withinD(posD)
	},
	withinD: function (posD) {
		var dxD = posD[0] - this.xD, dyD = posD[1] - this.yD
		return 0 <= dxD && dxD < this.wD && 0 <= dyD && dyD < this.hD
	},
	VconvertD: function (posD) {
		return [
			posD[0] - this.xD,
			posD[1] - this.yD,
		]
	},
	VfromcenterD: function (posD) {
		return [
			posD[0] - this.xD - this.wD / 2,
			posD[1] - this.yD - this.hD / 2,
		]
	},
}

// TODO: I think this might work better as a UFX.Thing
function Panel(methods) {
	var panel = Object.create(panelproto)
	for (var methodname in methods) {
		panel[methodname] = methods[methodname]
	}
	return panel
}

var playpanel = Panel({

	initblobs: function () {
		this.nblob = 1000
		var blobspec = [], blobcolor = []
		for (var j = 0 ; j < this.nblob ; ++j) {
			var pG = GconvertH([6*UFX.random.rand(-10, 10), 6*UFX.random.rand(-10, 10)])
			blobspec.push(pG[0], pG[1], 0, UFX.random(0.2, 0.4))
			blobcolor.push(UFX.random(0.6, 1), UFX.random(0.6, 1), UFX.random(0.6, 1))
		}
		this.blobspecbuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blobspec), gl.STATIC_DRAW)
		this.blobcolorbuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobcolorbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blobcolor), gl.STATIC_DRAW)
	},

	draw: function () {
		if (!this.blobspecbuffer) this.initblobs()

		var vs = state.viewstate
		graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)

		graphics.progs.checker.use()
		graphics.progs.checker.setcanvassize(this.wD, this.hD)
		graphics.progs.checker.setcenter(vs.x0G, vs.y0G)
		graphics.progs.checker.setzoom(vs.VzoomG)
		graphics.drawunitsquare(graphics.progs.checker.attribs.pos)

		graphics.progs.blob.use()
		graphics.progs.blob.setcanvassize(this.wD, this.hD)
		graphics.progs.blob.setcenter(vs.x0G, vs.y0G)
		graphics.progs.blob.setscale(vs.VzoomG)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecbuffer)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.spec, 4, gl.FLOAT, false, 0, 0)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobcolorbuffer)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.color, 3, gl.FLOAT, false, 0, 0)
		gl.drawArrays(gl.POINTS, 0, this.nblob)
	},
	handleldrag: function (cevent) {
		state.viewstate.snap(-cevent.dposD[0], -cevent.dposD[1])
	},
	handletdrag: function (cevent) {
		this.handleldrag(cevent)
	},
	handletap: function (cevent) {
		debugHUD.alert("tap " + cevent.posD)
	},
	handletrelease: function (cevent) {
		var vV = [-cevent.vD[0], -cevent.vD[1]]
		state.viewstate.fly(vV)
	},
	handlescroll: function (cevent) {
		state.viewstate.scootch(0, 0, cevent.dy * constants.scrollzoomfactor, this.VfromcenterD(cevent.posD))
	},
	handlepinch: function (cevent) {
		state.viewstate.scootch(0, 0, cevent.dz, this.VfromcenterD(cevent.posD))
	},
})

var panels = []

// Get the topmost panel that catches the given position, or null if none
function catcherD(posD) {
	if (!posD) return null
	for (var j = panels.length - 1 ; j >= 0 ; --j) {
		if (panels[j].catchesD(posD)) return panels[j]
	}
	return null
}



