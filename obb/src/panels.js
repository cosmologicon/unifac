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

		background.drawstarscape()

		if (controlstate.gridalpha) background.drawgrid()

//		graphics.progs.checker.use()
//		graphics.progs.checker.setcanvassize(this.wD, this.hD)
//		graphics.progs.checker.setcenter(vs.x0G, vs.y0G)
//		graphics.progs.checker.setzoom(vs.VzoomG)
//		graphics.drawunitsquare(graphics.progs.checker.attribs.pos)

		debugHUD.starttimer("blobdraw")
		var parts = []
		state.parts.forEach(function (part) {
			if (playpanel.GfromvisibleG(part.pG) < 1.1) {
				parts.push(part)
			}
		})
		state.stumps.forEach(function (stump) {
			if (playpanel.GfromvisibleG(stump.pG) < 1.1) {
				parts.push(stump)
			}
		})
		blobscape.predrawparts(parts)
		graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)
		blobscape.drawparts(parts)
		debugHUD.stoptimer("blobdraw")
	},
	handlelclick: function (cevent) {
		if (!controlstate.selectedshape) return
		var pG = state.viewstate.GconvertD(cevent.posD)
		var edgeH = HnearestedgeG(pG)
		if (state.canaddpartatedgeH(controlstate.selectedshape, edgeH)) {
			var part = state.addpartatedgeH(controlstate.selectedshape, edgeH)
			delete controlstate.selectedshape
			background.updategrid()
		}
	},
	handleldrag: function (cevent) {
		state.viewstate.snap(-cevent.dposD[0], -cevent.dposD[1])
	},
	handletdrag: function (cevent) {
		this.handleldrag(cevent)
	},
	handletap: function (cevent) {
		debugHUD.alert("tap " + cevent.posD)
		this.handlelclick(cevent)
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

var stalkpanel = Panel({
	draw: function () {
		graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)
		if (controlstate.selectedshape) {
			var c = controlstate.selectedshape[5]
			var color = constants.colors["system" + c]
		} else {
			var color = [0.4, 0.4, 0.4]
		}
		graphics.progs.uniform.use()
		graphics.progs.uniform.setcolor(color[0]/3, color[1]/3, color[2]/3, 1)
		graphics.drawunitsquare(graphics.progs.uniform.attribs.pos)

		if (controlstate.selectedshape) {
			blobscape.getspotinfo({
				shape: controlstate.selectedshape,
				f: 1,
			})
			graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)
			blobscape.setup()
			graphics.progs.blobrender.setcanvassizeD(this.wD, this.hD)
			graphics.progs.blobrender.setvcenterG(0, 0)
			graphics.progs.blobrender.setVscaleG(Math.min(this.wD, this.hD) / 2)
			graphics.progs.blobrender.setfsquirm(0)
			graphics.progs.blobrender.setplight0(0, 0, 100, 0)

			blobscape.draw({
				shape: controlstate.selectedshape,
				f: 1,
				r: 0,
				pG: [0, 0],
				pH: [0, 0],
				fixes: [true, true, true, true, true, true, true],
			})
		}
	},
	handlelclick: function () {
		if (controlstate.selectedshape) {
			delete controlstate.selectedshape
		} else {
			var jsystem = UFX.random.choice(["0", "1", "2"])
			var branches = UFX.random.choice(["1", "2", "3", "4", "5", "13", "14", "23", "24", "25", "34", "35"])
			controlstate.selectedshape = "stalk" + jsystem + branches
			state.sethighlight(controlstate.selectedshape)
			blobscape.addshape(controlstate.selectedshape)
		}
	},
	handletap: function (cevent) {
		this.handlelclick(cevent)
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



