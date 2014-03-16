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
	GconvertD: function () {
	
	},
	// (Lower limit of) how far off the panel the given point is (0 = visible)
	GfromvisibleG: function (pG) {
		return Math.max(0,
			Math.abs(pG[0] - state.viewstate.x0G) - this.wD / (2 * state.viewstate.VzoomG),
			Math.abs(pG[1] - state.viewstate.y0G) - this.hD / (2 * state.viewstate.VzoomG)
		)
	},
	draw: function () {
		var vs = state.viewstate
		graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)

		graphics.progs.checker.use()
		graphics.progs.checker.setcanvassize(this.wD, this.hD)
		graphics.progs.checker.setcenter(vs.x0G, vs.y0G)
		graphics.progs.checker.setzoom(vs.VzoomG)
		graphics.drawunitsquare(graphics.progs.checker.attribs.pos)

		debugHUD.starttimer("blobsetup")
		state.parts.forEach(function (part) {
			if (playpanel.GfromvisibleG(part.pG) < 1.1) {
				blobscape.gettile(part.shape, part.f)
			}
		})
		state.stumps.forEach(function (stump) {
			if (playpanel.GfromvisibleG(stump.pG) < 1.1) {
				blobscape.gettile(stump.shape, stump.parent.f)
			}
		})
		graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)
		blobscape.setup()
		debugHUD.stoptimer("blobsetup")
		debugHUD.starttimer("blobdraw")
		state.parts.forEach(function (part) {
			if (playpanel.GfromvisibleG(part.pG) < 1.1) {
				blobscape.draw(part.shape, part.pG, part.r, part.f)
			}
		})
		state.stumps.forEach(function (stump) {
			if (playpanel.GfromvisibleG(stump.pG) < 1.1) {
				blobscape.draw(stump.shape, stump.pG, stump.r, stump.parent.f)
			}
		})
		debugHUD.stoptimer("blobdraw")
	},
	handlelclick: function (cevent) {
		var part = state.addrandompart()
		state.viewstate.target(part.pG)
	},
	handleldrag: function (cevent) {
		state.viewstate.snap(-cevent.dposD[0], -cevent.dposD[1])
	},
	handletdrag: function (cevent) {
		this.handleldrag(cevent)
	},
	handletap: function (cevent) {
		debugHUD.alert("tap " + cevent.posD)
		var part = state.addrandompart()
		state.viewstate.target(part.pG)
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



