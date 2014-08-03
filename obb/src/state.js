// The game state

// I have a feeling this is going to need to go through several iterations, so I'm not trying to
// get it right on the first try.

function State() {
	this.jthing = 1
	this.things = {}
	this.viewstate = new ViewState()

	var core = {
		pH: [0, 0],
		pG: [0, 0],
		shape: "sphere",
		r: 0,
		f: 1,
		parent: null,
		children: {},
	}
	this.parts = [core]
	this.stalks = []
	this.organs = [core]
	this.stumps = []
	this.partsbyedgeN = {}  // map pN -> part
	this.organsbyhexN = {}  // map pN -> organ
	this.organsbyhexN[NconvertH(core.pH)] = core
	var that = this
	;[0, 1, 2, 0, 1, 2].forEach(function (jsystem, jedge) {
		that.addstump(core, jedge, jsystem)
	})


	this.lanes = [
		Spacelane([[12,0], [6,0], [6,6], [12,0], [18,-6], [18,0], [12,0], [6,0]]),
	]

	this.attackers = []
	this.attackers.push(Attacker({
		pG: [0, 0],
		vG: 1.4,
		lane: this.lanes[0],
		r: 0,
		shape: "square",
	}))
	
}
State.prototype = {
	// Temporary API while developing - haven't figured it all out yet.
	
	addstump: function (parent, jedge, jsystem) {
		var oedge = (parent.r + jedge) % 6, iedge = (oedge + 3) % 6
		var pH = HnexthexH(parent.pH, oedge)
		var edgeH = HedgeofhexH(parent.pH, oedge)
		var edgeN = NconvertH(edgeH)
		var stump = {
			isstump: true,
			pH: pH,
			pG: GconvertH(pH),
			pE: EconvertH(pH, iedge),
			edgeH: edgeH,
			shape: "stump" + jsystem,
			r: iedge,
			parent: parent,
			jedge: jedge,
		}
		parent.children[jedge] = stump
		this.stumps.push(stump)
		this.partsbyedgeN[edgeN] = stump
		return stump
	},
	
	canextendstump: function (stumpshape, partshape) {
		if (partshape.substr(0, 5) == "stalk") {
			var jsystem = +partshape[5], stumpjsystem = +stumpshape[5]
			return jsystem == stumpjsystem
		}
		if (partshape.substr(0, 5) == "organ") {
			var jsystem = +partshape[5], stumpjsystem = +stumpshape[5]
			return jsystem == stumpjsystem
		}
		return false
	},

	canaddpartatedgeH: function (shape, edgeH) {
		var edgeN = NconvertH(edgeH)
		var stump = this.partsbyedgeN[edgeN]
		if (!stump || !stump.isstump) return false
		if (!this.canextendstump(stump.shape, shape)) return false
		var pH = stump.pH, r = stump.r
		if (shape.substr(0, 5) == "stalk") {
			for (var j = 6 ; j < shape.length ; ++j) {
				var jedge = +shape[j]
				var oedge = (r + jedge) % 6
				var oedgeN = NconvertH(HedgeofhexH(pH, oedge))
				if (this.partsbyedgeN[oedgeN]) return false
			}
		} else {
			if (this.organsbyhexN[NconvertH(stump.pH)]) return false
		}
		return true
	},
	
	addpartatedgeH: function (shape, edgeH) {
		var edgeN = NconvertH(edgeH)
		var stump = this.partsbyedgeN[edgeN]
		var pH = stump.pH, r = stump.r
		var part = {
			pH: pH,
			pG: GconvertH(pH),
			shape: shape,
			r: r,
			f: 0,
			parent: stump.parent,
			children: {},
			jedge: stump.jedge,
		}
		part.parent.children[part.jedge] = part
		this.partsbyedgeN[edgeN] = part
		this.parts.push(part)
		this.stumps = this.stumps.filter(function (s) { return s !== stump })
		if (shape.substr(0, 5) == "stalk") {
			var jsystem = +shape[5]
			for (var j = 6 ; j < shape.length ; ++j) {
				var jedge = +shape[j]
				this.addstump(part, jedge, jsystem)
			}
			this.stalks.push(part)
		} else {
			this.organsbyhexN[NconvertH(pH)] = part
			this.organs.push(part)
		}
		return part
	},
	sethighlight: function (shape) {
		var that = this
		this.stumps.forEach(function (stump) {
			var h = stump.highlit = that.canaddpartatedgeH(shape, stump.edgeH)
			stump.shademode = [h, h, h, h, h, h, h]
		})
		this.parts.forEach(function (part) {
			part.shademode = [false, false, false, false, false, false, false]
			for (var jedge = 0 ; jedge < 6 ; ++jedge) {
				if (part.children[jedge] && part.children[jedge].highlit) {
					var kedge = (jedge + 1) % 6
					part.shademode[(jedge + part.r) % 6 + 1] = true
					part.shademode[(kedge + part.r) % 6 + 1] = true
				}
			}
		})
	},

	// Actual API
	addthing: function (thingspec) {
		if (!thingspec.id) thingspec.id = this.jthing++
		things[thingspec.id] = makething(thingspec)
		things[thingspec.id].state = this
	},
	think: function (dt) {
		this.viewstate.think(dt)
		this.parts.forEach(function (part) {
			if (part.f < 1) {
				part.f = Math.min(part.f + dt * constants.growrate, 1)
			}
		})
		this.stumps.forEach(function (stump) {
			stump.f = stump.parent.f
		})
		this.attackers.forEach(function (attacker) {
			attacker.think(dt)
		})
	},
	getspec: function () {
		var thingspecs = {}
		for (var j in this.things) {
			thingspecs[j] = this.things[j].getspec()
		}
		return {
			jthing: this.jthing,
			things: thingspecs,
		}
	},
	setspec: function (spec) {
		this.jthing = spec.jthing
		this.things = {}
		for (var j in spec.things) {
			this.addthing(spec.things[j])
		}
	},
}


