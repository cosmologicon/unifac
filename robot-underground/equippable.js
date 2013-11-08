
function Equippable (name) {
	this.init(name)
}
Equippable.prototype = {
	init: function (name) {
		this.name = name
		this.basedescription = name
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
		return this.modList.map(function (mod) { return getModName(mod[0]) + " " }).join("") + this.name
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
	getItemSpec: function () {
		return [
			this.isweapon ? "weapon" : this.isarmour ? "armour" : "",
			this.spec,
			this.isIdentified,
		]
	},
}

function makeItem(type, spec, isIdentified) {
	if (type.pop) return makeItem.apply(this, type)
	if (type == "weapon") {
		var item = makeWeapon(spec)
	} else if (type == "armour") {
		var item = makeArmour(spec)
	} else {
		throw "Unknown item type: " + type
	}
	item.isIdentified = isIdentified
	return item
}




