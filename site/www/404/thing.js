// Things

// Game objects relevant to the game state. Anything that needs to be saved during a save/load
// cycle should be in this module.

// For serialization purposes, things have a JSONable representation (spec), from which they can be
// rebuilt.

// Components should have a setspec method, which copies the relevant portions from a spec object,
// along with a corresponding getspec method, which sets the relevant portions on the spec object.

// If a component needs a type-specific default, it can be set in the component's init method.

// Things should not hold references to other things directly, as these may be invalidated during a
// save/load cycle. Instead store the thing's id, and refer to it using state.things[id].

"use strict"

function makething(spec) {
	var thing = Object.create(thingprotos[spec.type])
	thing.setspec(spec)
	thing.think(0)
	return thing
}
var thingprotos = {}

// COMPONENTS

var RegisterType = {
	init: function (name) {
		thingprotos[name] = this
	},
	setspec: function (spec) {
		this.type = spec.type
	},
	getspec: function (spec) {
		spec.type = this.type
	},
}

var WorldBound = {
	setspec: function (spec) {
		this.x = spec.x || 0
		this.y = spec.y || 0
	},
	getspec: function (spec) {
		spec.x = this.x
		spec.y = this.y
	},
	draw: function () {
		UFX.draw("t", this.x, this.y)
	},
}

var Round = {
	init: function (r0, color0) {
		this.r0 = r0 || 10
		this.color0 = color0 || "gray"
		this.setmethodmode("canclick", "every")
	},
	setspec: function (spec) {
		this.r = spec.r || this.r0
		this.color = spec.color || this.color0
	},
	getspec: function (spec) {
		spec.r = this.r
		spec.color = this.color
	},
	collide: function (pos) {
		var dx = this.x - pos[0], dy = this.y - pos[1]
		return dx * dx + dy * dy <= this.r * this.r
	},
	draw: function () {
		UFX.draw("b o 0 0", this.r, "fs", this.color, "f")
	},
}

var HasText = {
	init: function (text0, tcolor0) {
		this.text0 = text0 || 0
		this.tcolor = tcolor0 || "black"
	},
	setspec: function (spec) {
		this.text = spec.text || this.text0
		this.tcolor = spec.tcolor || this.tcolor
	},
	getspec: function (spec) {
		spec.text = this.text
		spec.tcolor = this.tcolor
	},
	draw: function () {
		var s = 0.14 * this.r / Math.max(this.text.length, 2)
		UFX.draw("tab center middle z", s, s, "fs", this.tcolor,
			"font 18px~bold~sans-serif ft0", this.text)
	},
}

var HasCounter = {
	setspec: function (spec) {
		this.n = spec.n || 10
	},
	getspec: function (spec) {
		spec.n = this.n
	},
	think: function (dt) {
		this.text = "" + this.n
	},
}

var Decrements = {
	canclick: function () {
		return this.n > 0
	},
	onclick: function () {
		this.n -= 1
		if (!this.n) this.onempty()
	},
	onempty: function () {
	},
}

// THING TYPES

UFX.Thing()
	.addcomp(RegisterType, "button")
	.addcomp(WorldBound)
	.addcomp(Round, 10)
	.definemethod("think")

UFX.Thing()
	.addcomp(RegisterType, "decrementer")
	.addcomp(WorldBound)
	.addcomp(Round, 10)
	.addcomp(HasText)
	.addcomp(HasCounter)
	.addcomp(Decrements)



