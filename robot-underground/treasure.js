
function Treasure(mission, pos, radius, name) {
	this.init(mission, pos, radius, name)
}
Treasure.prototype = extend(Entity.prototype, {
	init: function (mission, pos, radius, name) {
		Entity.prototype.init.call(this, mission, pos, radius, 0, name || "???", false)
		this.mission.born[this.id] = this
		this.pickUpScript = null
	},
	
	setPickUpScript: function (spec) {
		this.pickUpScript = new Script(spec, this.mission, this)
	},
	
	pickUp: function () {
		this.mission.dispatch_event("on_pick_up")
		Entity.prototype.die.apply(this)
	},
})

function Metal(mission, name, amount, pos) {
	this.init(mission, name, amount, pos)
}
Metal.prototype = extend(Treasure.prototype, {
	init: function (mission, name, amount, pos) {
		Treasure.prototype.init.call(this, mission, pos, 7, name)
		this.amount = amount
	},
	
	pickUp: function () {
		robotstate.addMetal(this.amount, this.name)
		Treasure.prototype.pickUp.apply(this)
	},
	
	describe: function () {
		return this.name + "(" + this.amount + ")"
	},
})

function DroppedEquippable(mission, item, pos) {
	this.init(mission, item, pos)
}
DroppedEquippable.prototype = extend(Treasure.prototype, {
	init: function (mission, item, pos) {
		Treasure.prototype.init.call(this, mission, pos, 16, "DroppedEquipment")
		this.item = item
	},
	
	pickUp: function () {
		robotstate.addItem(this.item)
		Treasure.prototype.pickUp.apply(this)
	},
	
	describe: function () {
		return this.item.fullname
	},
})

