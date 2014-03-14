// The game state

// I have a feeling this is going to need to go through several iterations, so I'm not trying to
// get it right on the first try.

function State() {
	this.jthing = 1
	this.things = {}
	this.viewstate = new ViewState()
	
	
	var temptiles = this.temptiles = []
	this.temptiles.push({
		pG: [0, 0],
		shape: "sphere",
		r: 0,
	})
	var taken = {}
	HedgesofhexH([0, 0]).map(NconvertH).forEach(function (pN) {
		taken[pN] = true
	})
	var nodes = [
		[[0, 0], 0],
		[[0, 0], 1],
		[[0, 0], 2],
		[[0, 0], 3],
		[[0, 0], 4],
		[[0, 0], 5],
	]
	function Hnexttile(pH, r, e) {
		e = (e + r + 3) % 6
		var xH = pH[0] + [0, 6, 6, 0, -6, -6][e]
		var yH = pH[1] + [-6, -6, 0, 6, 6, 0][e]
		return [[xH, yH], e]
	}
	for (var j = 0 ; j < 1000 && nodes.length ; ++j) {
		var node = UFX.random.choice(nodes, true), tileH = node[0], edge = node[1]
		var nextH = HnexthexH(tileH, edge)
		var shape = UFX.random.choice(["stalk1", "stalk2", "stalk3", "stalk4", "stalk5", "stalk13",
			"stalk14", "stalk23", "stalk24", "stalk25", "stalk34", "stalk35"])
		var nextnodes = []
		for (var k = 5 ; k < shape.length ; ++k) {
			nextnodes.push([nextH, (+shape[k] + edge + 3) % 6])
		}
		var nextedgesN = nextnodes.map(function (node) { return NconvertH(HedgeofhexH(node[0], node[1])) })
		if (nextedgesN.some(function (pN) { return taken[pN] })) {
			nodes.push(node)
			continue
		}

		nextedgesN.forEach(function (pN) { taken[pN] = true })
		nodes = nodes.concat(nextnodes)
		this.temptiles.push({
			pG: GconvertH(nextH),
			shape: shape,
			r: (edge + 3) % 6,
		})
	}
	nodes.forEach(function (node) {
		temptiles.push({
			pG: GconvertH(HnexthexH(node[0], node[1])),
			shape: "stump",
			r: (node[1] + 3) % 6,
		})
	})
}
State.prototype = {
	addthing: function (thingspec) {
		if (!thingspec.id) thingspec.id = this.jthing++
		things[thingspec.id] = makething(thingspec)
		things[thingspec.id].state = this
	},
	think: function (dt) {
		this.viewstate.think(dt)
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


