// The game state

"use strict"

var state = {
	reset: function () {
		this.things = {}
		this.thinglist = []
		this.nextid = 1
	},
	get: function () {
		var obj = {
			nextid: this.nextid,
			thingspecs: {},
			camera: camera.getstate(),
		}
		for (var id in this.things) {
			obj.thingspecs[id] = { id: id }
			this.things[id].getspec(obj.thingspecs[id])
		}
		return JSON.stringify(obj)
	},
	set: function (state) {
		this.reset()
		var obj = JSON.parse(state)
		this.nextid = obj.nextid
		for (var id in obj.thingspecs) this.addthing(obj.thingspecs[id])
		this.thinglist.sort(function (t0, t1) { return t0.id - t1.id })
		camera.setstate(obj.camera)
	},
	save: function (gamename) {
		localStorage[gamename] = this.get()
	},
	load: function (gamename) {
		this.set(localStorage[gamename])
	},

	addthing: function (spec) {
		var thing = makething(spec)
		thing.id = "id" in spec ? spec.id : this.nextid++
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

