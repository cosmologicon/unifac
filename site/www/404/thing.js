// Things

// Game objects relevant to the game state. Anything that needs to be saved during a save/load
// cycle should be in this module.

// For serialization purposes, things have a JSONable representation (spec), from which they can be
// rebuilt.

// Components should have a setspec method, which copies the relevant portions from a spec object,
// along with a corresponding getspec method, which sets the relevant portions on the spec object.

// If a component needs a type-specific default, it can be set in the component's init method.

// Things should not hold references to other things directly, as these may be invalidated during a
// save/load cycle. Instead store the thing's id, and refer to it using state.things[id]. Thing ids
// are always truthy, so 0 or null can be used to refer to no thing.

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
	die: function () {
		state.removething(this)
	},
}

var KeepsTime = {
	setspec: function (spec) {
		this.t = spec.t || 0
	},
	getspec: function (spec) {
		spec.t = this.t
	},
	think: function (dt) {
		this.t += dt
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

var Targetable = {
	setspec: function (spec) {
		this.targeters = spec.targeters || []
	},
	getspec: function (spec) {
		spec.targeters = this.targeters
	},
	addtargeter: function (thing) {
		this.targeters.push(thing.id)
	},
	removetargeter: function (thing) {
		this.targeters = this.targeters.filter(function (id) { return id !== thing.id })
	},
	blocked: function () {
		return this.targeters.some(function (id) {
			var thing = state.things[id]
			return thing.blocks && thing.blocks()
		})
	},
	canclick: function () {
		return !this.blocked()
	},
	candrag: function () {
		return !this.blocked()
	},
	onclick: function () {
		this.targeters.forEach(function (id) { state.things[id].ontargetclick(this) }.bind(this))
	},
	die: function () {
		this.targeters.forEach(function (id) { state.things[id].ontargetdie(this) }.bind(this))
	},
}

var SettableTarget = {
	init: function () {
		this.setmethodmode("cantarget", "every")
	},
	setspec: function (spec) {
		this.target = spec.target || null
	},
	getspec: function (spec) {
		spec.target = this.target
	},
	cantarget: function (thing) {
		return true
	},
	settarget: function (thing) {
		this.target = thing.id
		thing.addtargeter(this)
	},
	ontargetclick: function () {
	},
	ontargetdie: function () {
		this.target = null
	},
	die: function () {
		if (this.target) state.things[this.target].removetargeter(this)
	},
}

var CantClick = {
	init: function () {
		this.unclickable = true  // not clickable even in principle
	},
	canclick: function () {
		return false
	},
}
var CantDrag = {
	candrag: function () {
		return false
	},
}

var DragToRetarget = {
	init: function () {
		this.setmethodmode("candrag", "every")
	},
	candrag: function () {
		return true
	},
	ondrag: function (pos) {
		this.target = null
		this.dragpos = pos
	},
	ondrop: function (thing) {
		if (thing && this.cantarget(thing)) this.settarget(thing)
		this.dragpos = null
	},
	settarget: function (thing) {
		this.dragpos = null
	},
	drawfront: function () {
		if (!this.dragpos) return
		var target = { x: this.dragpos[0], y: this.dragpos[1], r: 0 }
		drawing.linkage(this, target)
		drawing.base(this, target)
		drawing.arrowhead(this, target)
	},
}

// Calls this.act() once every second (or however long tact is)
var AutoAct = {
	init: function (tact0) {
		this.tact0 = tact0 || 1
	},
	setspec: function (spec) {
		this.acttime = spec.acttime || 0
		this.tact = spec.tact || this.tact0
	},
	getspec: function (spec) {
		spec.acttime = this.acttime
		spec.tact = this.tact
	},
	think: function (dt) {
		this.acttime += dt
		while (this.acttime > this.tact) {
			this.act()
			this.acttime -= this.tact
		}
	},
}

var ClicksTarget = {
	cantarget: function (thing) {
		return !thing.unclickable
	},
	act: function () {
		var obj = state.things[this.target]
		if (!obj) return
		if (obj.canclick && !obj.canclick()) return
		obj.onclick()
	},
	drawback: function () {
		if (this.target) drawing.linkage(this, state.things[this.target])
	},
	drawfront: function () {
		if (!this.target) return
		drawing.base(this, state.things[this.target])
		drawing.arrowhead(this, state.things[this.target])
	},
}

var AutoClicksTarget = [AutoAct, SettableTarget, ClicksTarget]

var Round = {
	init: function (r0, color0) {
		this.r0 = r0 || 10
		this.color0 = color0 || "#44f"
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
		drawing.disk({ r: this.r, color: this.color, })
	},
}

var HasText = {
	init: function (text0, tcolor0) {
		this.text0 = text0 || 0
		this.tcolor = tcolor0 || "white"
	},
	setspec: function (spec) {
		this.text = spec.text || this.text0
		this.tcolor = spec.tcolor || this.tcolor
		this.tocolor = spec.tocolor || "black"
	},
	getspec: function (spec) {
		spec.text = this.text
		spec.tcolor = this.tcolor
		spec.tocolor = this.tocolor
	},
	draw: function () {
		var s = 0.14 * this.r / Math.max(this.text.length, 2)
		UFX.draw("[ tab center middle z", s, s, "fs", this.tcolor, "ss", this.tocolor,
			"font 18px~bold~'Bigshot~One' lw 1.2 sft", this.text, "0 0 ]")
	},
}

var HasCounter = {
	setspec: function (spec) {
		this.n0 = spec.n0 || 10
		this.n = "n" in spec ? spec.n : this.n0
	},
	getspec: function (spec) {
		spec.n0 = this.n0
		spec.n = this.n
	},
	think: function (dt) {
		this.text = "" + this.n
	},
}

var Decrements = [HasCounter, {
	canclick: function () {
		return this.n > 0
	},
	onclick: function () {
		this.n -= 1
		if (!this.n) this.onempty()
	},
	onempty: function () {
	},
}]

// Dies when reaching 0 for the first time.
var SingleDecrements = [Decrements, {
	onempty: function () {
		this.die()
	},
}]

var CanBlock = {
	drawback: function () {
		if (this.target) {
			drawing.linkage(this, state.things[this.target])
		}
	},
	drawfront: function () {
		if (this.target) {
			drawing.base(this, state.things[this.target])
			drawing.clasp(this, state.things[this.target], { open: !this.blocks() })
		}
	},
}

var BlocksOnNonzero = {
	blocks: function () {
		return this.n > 0
	},
	ontargetclick: function () {
		this.n = this.n0
	},
}

var UnlocksOnDecrement = {
	onclick: function () {
		unlock(this.n)
	},
}

var GhostOnDisable = {
	draw: function () {
		if (this.canclick && this.canclick()) return
		if (this.candrag && this.candrag()) return
		drawing.ghost({ r: this.r })
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
	.addcomp(Targetable)
	.addcomp(Round, 10)
	.addcomp(HasText)
	.addcomp(GhostOnDisable)
	.addcomp(Decrements)
	.addcomp(CantDrag)

UFX.Thing()
	.addcomp(RegisterType, "mainbutton")
	.addcomp(WorldBound)
	.addcomp(Targetable)
	.addcomp(Round, 28)
	.addcomp(HasText)
	.addcomp(GhostOnDisable)
	.addcomp(Decrements)
	.addcomp(CantDrag)
	.addcomp(UnlocksOnDecrement)

UFX.Thing()
	.addcomp(RegisterType, "decblocker")
	.addcomp(WorldBound)
	.addcomp(Targetable)
	.addcomp(Round, 10)
	.addcomp(HasText)
	.addcomp(Decrements)
	.addcomp(GhostOnDisable)
	.addcomp([SettableTarget, CanBlock, BlocksOnNonzero])
	.addcomp(CantDrag)

UFX.Thing()
	.addcomp(RegisterType, "consumeblocker")
	.addcomp(WorldBound)
	.addcomp(Targetable)
	.addcomp(Round, 10)
	.addcomp(HasText)
	.addcomp(GhostOnDisable)
	.addcomp(SingleDecrements)
	.addcomp([SettableTarget, CanBlock, BlocksOnNonzero])
	.addcomp(CantDrag)

UFX.Thing()
	.addcomp(RegisterType, "autoclicker")
	.addcomp(WorldBound)
	.addcomp(Targetable)
	.addcomp(Round, 14)
	.addcomp(HasText, "1/s")
	.addcomp(GhostOnDisable)
	.addcomp(AutoClicksTarget)
	.addcomp(DragToRetarget)
	.addcomp(CantClick)



