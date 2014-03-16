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
	}
	this.parts = [core]
	var claimededges = this.claimededges = {}
	this.stumps = [0, 1, 2, 3, 4, 5].map(function (edge) {
		var pH = HnexthexH([0, 0], edge)
		var r = (edge + 3) % 6
		var pedgeN = NedgeofhexH([0, 0], edge)
		claimededges[pedgeN] = true
		return {
			pH: pH,
			pG: GconvertH(pH),
			pE: EconvertH(pH, r),
			shape: "stump" + (edge % 3),
			r: r,
			parent: core,
		}
	})
}
State.prototype = {
	addthing: function (thingspec) {
		if (!thingspec.id) thingspec.id = this.jthing++
		things[thingspec.id] = makething(thingspec)
		things[thingspec.id].state = this
	},
	canaddpart: function (shape, pH, edge) {
		if (shape.slice(0, 5) == "stalk") {
			for (var j = 6 ; j < shape.length ; ++j) {
				var nedge = (+shape[j] + edge) % 6
				var pedgeN = NedgeofhexH(pH, nedge)
				if (this.claimededges[pedgeN]) return false
			}
		}
		return true
	},
	addpart: function (shape, pH, edge) {
		var stumpE = EconvertH(pH, edge)
		this.stumps = this.stumps.filter(function (stump) { return stump.pE != stumpE })
		var part = {
			shape: shape,
			pH: pH,
			pG: GconvertH(pH),
			r: edge,
			f: 0,
		}
		this.parts.push(part)
		if (shape.slice(0, 5) == "stalk") {
			for (var j = 6 ; j < shape.length ; ++j) {
				var nedge = (+shape[j] + edge) % 6
				var pstumpH = HnexthexH(pH, nedge)
				var r = (nedge + 3) % 6
				this.stumps.push({
					pH: pstumpH,
					pG: GconvertH(pstumpH),
					pE: EconvertH(pstumpH, r),
					shape: "stump" + shape[5],
					r: r,
					parent: part,
				})
				var pedgeN = NedgeofhexH(pH, nedge)
				this.claimededges[pedgeN] = true
			}
		}
		return part
	},
	addrandompart: function () {
		while (true) {
			var stump = UFX.random.choice(this.stumps)
			var jsystem = stump.shape[5]
			var shape = "stalk" + jsystem + UFX.random.choice([
				"1", "2", "3", "4", "5", "13", "14", "23", "24", "25", "34", "35"])
			var pH = stump.pH
			var edge = stump.r
			if (!this.canaddpart(shape, pH, edge)) continue
			return this.addpart(shape, pH, edge)
		}
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
// This global object is the state that's currently active in the game. Normally I would make this
// a singleton, but I'm thinking it might be useful to have a secondary State object initialized
// and ready to go for quick swapping out.
var state = new State()


