
function Treasure(mission, pos, radius, name) {
	this.init(mission, pos, radius, name)
}
Treasure.prototype = extend(Entity.prototype, {
	init: function (mission, pos, radius, name) {
		Entitiy.prototype.init.call(this, mission, pos, radius, 0, name || "???", false)
		this.mission.born[this.id] = this
		this.pickUpScript = null
	},
	
	// TODO: setPickUpScript
	
	pickUp: function () {
		this.mission.dispatch_event("on_pick_up")
		Entity.prototype.die.apply(this)
	},
})


// TODO: Metal, DroppedEquippable

