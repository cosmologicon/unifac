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

xG, yG, zG, rG, nx, ny, nz, c1, c2, c3, ar, ag, ab, f

		debugHUD.starttimer("initblobs")
		this.nblob = 2000
		var blobspec = []
		while (blobspec.length < this.nblob) {
			var xG = UFX.random(-1, 1)
			var yG = UFX.random(-1, 1)
			var zG = UFX.random(-1, 1)
			var rG = UFX.random(0.06, 0.12)
			var dG = Math.sqrt(xG * xG + yG * yG + zG * zG)
			if (dG + rG > 0.8 || dG < 0.0001) continue
			var nx = xG/dG + UFX.random(-0.05, 0.05)
			var ny = yG/dG + UFX.random(-0.05, 0.05)
			var nz = zG/dG + UFX.random(-0.05, 0.05)
			var c1 = UFX.random(0.6, 0.62), c2 = 0, c3 = 0
			var ar = 0, ag = 0, ab = 0
			var f = dG
			blobspec.push([xG, yG, zG, rG, nx, ny, nz, c1, c2, c3, ar, ag, ab, f])
		}
		blobspec.sort(function (a, b) { return a[2] - b[2] })
		blobspec = [].concat.apply([], blobspec)

		this.blobspecbuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecbuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blobspec), gl.STATIC_DRAW)
		debugHUD.stoptimer("initblobs")
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
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		graphics.progs.blob.setcanvassize(this.wD, this.hD)
		graphics.progs.blob.setcenter(vs.x0G, vs.y0G)
		graphics.progs.blob.setscale(vs.VzoomG)
		graphics.progs.blob.setcolormap(false, [0, 0.5, 0.1, 0.2, 0.2, 0.2, 0.6, 0.6, 0.6])
		graphics.progs.blob.setprogress(1)
		var a = Date.now() * 0.001
		graphics.progs.blob.setlightpos0(2 * Math.sin(a), 2 * Math.cos(a), 1)
		graphics.progs.blob.setlight0(0.6)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.blobspecbuffer)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pos, 3, gl.FLOAT, false, 14*4, 0)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.rad, 1, gl.FLOAT, false, 14*4, 3*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.normal, 3, gl.FLOAT, false, 14*4, 4*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.pcolor, 3, gl.FLOAT, false, 14*4, 7*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.acolor, 3, gl.FLOAT, false, 14*4, 10*4)
		gl.vertexAttribPointer(graphics.progs.blob.attribs.f, 1, gl.FLOAT, false, 14*4, 13*4)
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



