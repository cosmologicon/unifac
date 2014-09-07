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

		lanescape.setup()
		state.lanes.forEach(function (lane) {
			lanescape.drawtiles(lane.tiles)
		})

		debugHUD.starttimer("blobdraw")
		var parts = []
		state.stalks.forEach(function (part) {
			if (playpanel.GfromvisibleG(part.pG) < 1.1) {
				parts.push(part)
			}
		})
		state.stumps.forEach(function (stump) {
			if (playpanel.GfromvisibleG(stump.pG) < 1.1) {
				parts.push(stump)
			}
		})
		state.organs.forEach(function (part) {
			if (playpanel.GfromvisibleG(part.pG) < 1.1) {
				parts.push(part)
			}
		})
		blobscape.predrawparts(parts)
		graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)
		blobscape.drawparts(parts)
		debugHUD.stoptimer("blobdraw")
		debugHUD.starttimer("attackerdraw")
		spritescape.setup()
		spritescape.drawsprites(state.attackers)
		debugHUD.stoptimer("attackerdraw")
	},
	handlelclick: function (cevent) {
		if (!controlstate.selectedshape) return
		var pG = state.viewstate.GconvertD(cevent.posD)
		var edgeH = HnearestedgeG(pG)
		if (state.canaddpartatedgeH(controlstate.selectedshape, edgeH)) {
			var part = state.addpartatedgeH(controlstate.selectedshape, edgeH)
			if (controlstate.jselectedstalk !== undefined) {
				controlstate.pickrandomstalk(controlstate.jselectedstalk)
			}
			delete controlstate.selectedshape
			delete controlstate.jselectedstalk
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
	placeD: function (xD, yD, wD, hD) {
		panelproto.placeD.call(this, xD, yD, wD, hD)
		this.stalkpositions = []
		if (hD > wD) {
			var f = this.stalkscale = Math.min(wD / 3.5, hD / (10 * s3)) * 0.9
			for (var j = 0 ; j < 9 ; ++j) {
				this.stalkpositions.push([
					(j % 2 ? 1 : -1) * 0.75 * 1.1,
					(4 - j) * s3 * 1.1,
				])
			}
		} else {
			var f = this.stalkscale = Math.min(wD / 9.5, hD / (4 * s3)) * 0.9
			for (var j = 0 ; j < 6 ; ++j) {
				this.stalkpositions.push([
					(j - 2.5) * 1.5 * 1.1,
					(j % 2 ? 0 : 1) * s3 * 1.1,
				])
			}
			for (var j = 0 ; j < 3 ; ++j) {
				this.stalkpositions.push([
					(j*2 - 2.5) * 1.5 * 1.1,
					-1 * s3 * 1.1,
				])
			}
		}
	},
	draw: function () {
		var d = Math.ceil(Math.min(this.wD, this.hD) / 40)
		graphics.progs.uniform.use()
		graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)
		graphics.progs.uniform.setcolor(0, 0.2*1.2, 0.3*1.2, 1)
		graphics.drawunitsquare(graphics.progs.uniform.attribs.pos)
		graphics.setviewportD(this.xD + d, this.yD, this.wD - d, this.hD - d)
		graphics.progs.uniform.setcolor(0, 0.2/1.2, 0.3/1.2, 1)
		graphics.drawunitsquare(graphics.progs.uniform.attribs.pos)
		graphics.setviewportD(this.xD + d, this.yD + d, this.wD - 2 * d, this.hD - 2 * d)
		graphics.progs.uniform.setcolor(0, 0.2, 0.3, 1)
		graphics.drawunitsquare(graphics.progs.uniform.attribs.pos)

		var s = Math.floor(this.stalkscale)
		graphics.progs.paneltile.use()
		graphics.progs.paneltile.setcanvassize(2*s, 2*s)
		graphics.progs.paneltile.setzoom(0.95 * s)
		for (var j = 0 ; j < 9 ; ++j) {
			var x0 = Math.floor(0.5 * this.wD + s * this.stalkpositions[j][0])
			var y0 = Math.floor(0.5 * this.hD + s * this.stalkpositions[j][1])
			graphics.setviewportD(this.xD + x0 - s, this.yD + y0 - s, 2 * s, 2 * s)
			graphics.progs.paneltile.vsetcolor(constants.colors["system" + [0,0,1,1,2,2,0,1,2][j]])
			graphics.drawunitsquare(graphics.progs.paneltile.attribs.pos)
		}

		for (var j = 0 ; j < 9 ; ++j) {
			if (!controlstate.stalkoptions[j]) continue
			blobscape.getspotinfo({
				shape: controlstate.stalkoptions[j],
				f: 1,
			})
			graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)
			blobscape.setup()
			graphics.progs.blobrender.setcanvassizeD(this.wD, this.hD)
			graphics.progs.blobrender.setvcenterG(0, 0)
			graphics.progs.blobrender.setVscaleG(this.stalkscale)
			graphics.progs.blobrender.setfsquirm(0)
			graphics.progs.blobrender.setplight0(0, 0, 100, 0)

			blobscape.draw({
				shape: controlstate.stalkoptions[j],
				f: 1,
				r: 0,
				pG: this.stalkpositions[j],
				pH: [0, 0],
				fixes: [true, true, true, true, true, true, true],
			})
		}
		if (controlstate.selectedshape) {
			graphics.progs.uniform.use()
			graphics.progs.uniform.setcolor(0, 0, 0, 0.33)
			graphics.drawunitsquare(graphics.progs.uniform.attribs.pos)
			
			if (controlstate.jselectedstalk !== undefined) {
				var s = Math.floor(this.stalkscale), j = controlstate.jselectedstalk
				graphics.progs.paneltile.use()
				var x0 = Math.floor(0.5 * this.wD + s * this.stalkpositions[j][0])
				var y0 = Math.floor(0.5 * this.hD + s * this.stalkpositions[j][1])
				graphics.setviewportD(this.xD + x0 - s, this.yD + y0 - s, 2 * s, 2 * s)
				graphics.progs.paneltile.vsetcolor(constants.colors["system" + [0,0,1,1,2,2,0,1,2][j]])
				graphics.drawunitsquare(graphics.progs.paneltile.attribs.pos)

				graphics.setviewportD(this.xD, this.yD, this.wD, this.hD)
				blobscape.setup()
				graphics.progs.blobrender.setcanvassizeD(this.wD, this.hD)
				graphics.progs.blobrender.setvcenterG(0, 0)
				graphics.progs.blobrender.setVscaleG(this.stalkscale)
				graphics.progs.blobrender.setfsquirm(0)
				graphics.progs.blobrender.setplight0(0, 0, 100, 0)

				blobscape.draw({
					shape: controlstate.stalkoptions[controlstate.jselectedstalk],
					f: 1,
					r: 0,
					pG: this.stalkpositions[controlstate.jselectedstalk],
					pH: [0, 0],
					fixes: [true, true, true, true, true, true, true],
				})
			}
		}
	},
	handlelclick: function (cevent) {
		var pV = this.VfromcenterD(cevent.posD)
		var xG = pV[0] / this.stalkscale, yG = pV[1] / this.stalkscale
		var jclick = null
		for (var j = 0 ; j < 9 ; ++j) {
			var dxG = xG - this.stalkpositions[j][0], dyG = yG - this.stalkpositions[j][1]
			if (dxG * dxG + dyG * dyG < 1) jclick = j
		}
		if (jclick === null) {
			delete controlstate.selectedshape
			delete controlstate.jselectedstalk
		} else if (jclick === controlstate.jselectedstalk) {
			controlstate.pickrandomstalk(controlstate.jselectedstalk)
			delete controlstate.selectedshape
			delete controlstate.jselectedstalk
		} else {
			controlstate.jselectedstalk = jclick
			controlstate.selectedshape = controlstate.stalkoptions[jclick]
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



