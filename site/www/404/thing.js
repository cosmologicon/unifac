// Things

// Game objects relevant to the game state. Anything that needs to be saved during a save/load
// cycle should be in this module.

// For serialization purposes, things have a JSONable representation (spec), from which they can be
// rebuilt.

// Components should have a setspec method, which copies the relevant portions from a spec object,
// along with a corresponding getspec method, which sets the relevant portions on the spec object.

// Things should not hold references to other things directly, as these may be invalidated during a
// save/load cycle. Instead store the thing's id, and refer to it using state.things[id].

"use strict"

function makething(spec) {
	var thing = new thingtypes[spec.type]()
	thing.setspec(spec)
	return thing
}
var thingtypes = {}
function addthingtype(name, prototype) {
	thingtypes[name] = new Function("return function " + name + "(){}")()
	thingtypes[name].prototype = prototype
}

// COMPONENTS

var WorldBound = {
	setspec: function (spec) {
		this.x = spec.x || 0
		this.y = spec.y || 0
	},
	getspec: function (spec) {
		spec.x = this.x
		spec.y = this.y
	},
}

var Round = {
	init: function (r0) {
		this.r0 = r0 || 10
	},
	setspec: function (spec) {
		this.r = spec.r || this.r0
	},
	getspec: function (spec) {
		spec.r = this.r
	},
}

// THING TYPES

addthingtype("button", UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(Round, 10)
)



