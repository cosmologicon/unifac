// The game state

"use strict"

var state = {
	reset: function () {
		this.things = {}
		this.thinglist = []
		this.nextid = 0
	},
	save: function (gamename) {
		var obj = {
			nextid: this.nextid,
			thingspecs: {},
		}
		for (var id in this.things) {
			obj.thingspecs[id] = { id: id }
			this.things[id].getspec(obj.thingspecs[id])
		}
		localStorage[gamename] = obj
	},
	load: function (gamename) {
		this.reset()
		var obj = JSON.parse(localStorage[gamename])
		this.nextid = obj.nextid
		for (var id in obj.things) this.addthing(obj.things[id])
		this.thinglist.sort(function (t0, t1) { return t0.id - t1.id })
	},

	addthing: function (spec) {
		var thing = makething(spec)
		if (!("id" in spec)) {
			thing.id = this.nextid++
		}
		this.things[thing.id] = thing
		this.thinglist.push(thing)
		return thing
	},
	removething: function (thing) {
		this.thinglist = this.thinglist.filter(function (obj) { return obj !== thing })
		delete this.things[thing.id]
	},
}
state.reset()

