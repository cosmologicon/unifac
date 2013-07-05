
function Equippable (name) {
	this.init(name)
}
Equippable.prototype = {
	init: function (name) {
		this.name = name
		this.basedescription = name
		this.mods = []
		this.isIdentified = false
		this.itemLevel = 1
	},
	// These are properties/cached in the original, but there's not a lot I can do about that!
	description: function () {
		return this.isIdentified ? this.appraisedname() + "\n" + this.effects() : "Unappraised " + this.name
	},
	fullname: function () {
		return this.isIdentified ? this.appraisedname() : "Unappraised " + this.name
	},
	appraisedname: function () {
		return this.mods.map(function (mod) { return mod.getName() }).join("") + this.name
	},
	effects: function () {
		return ""
	},
	equipcost: function () {
		var level = this.itemLevel
		return [
			1 << Math.min(8, level),
			level >  6 ? 1 << Math.min(8, level -  7) : 0,
			level > 11 ? 1 << Math.min(7, level - 12) : 0,
			level > 15 ? 1 << Math.min(6, level - 16) : 0,
			level > 19 ? 1 << Math.min(6, level - 10) : 0,
		]
	},
	salevalue: function () {
		var level = this.itemLevel
		return [
			1 << Math.min(6, level),
			level >  7 ? 1 << Math.min(5, level -  8) : 0,
			level > 12 ? 1 << Math.min(4, level - 13) : 0,
			level > 16 ? 1 << Math.min(3, level - 17) : 0,
			level > 20 ? 1 << Math.min(3, level - 21) : 0,
		]
	},
	appraisecost: function () {
		return this.salevalue()
	},
	getPercentage: function (which) {
		return clip(this.percentages[which], -80, 300)
	},
	getResistance: function (which) {
		return clip(this.resistances[which], -80, 300)
	},
}


