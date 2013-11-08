
armournames = ["Breastplate", "Helmet", "Greaves", "Gauntlets", "Gloves", "Vambraces", "Bracer", "Visor",
               "Suit", "Mail", "Shield", "Great Shield", "Tower Shield", "Plate", "Backpack", "Exoskeleton",
               "Armour", "Scale", "Medallion", "Talisman", "Dogtags", "Faceplate", "Keychain", "Armlet",
               "Bracelet", "Amulet", "Dustbin Lid", "Shades", "Rollcage", "Kneepads", "Sunglasses", "Boots",
               "Thong", "Sandals", "Jetpack", "Battery Pack", "Rollerblades"]

function Armour(name) {
	this.init(name)
}
Armour.prototype = extend(Equippable.prototype, {
	isarmour: true,
	init: function (name) {
		Equippable.prototype.init.call(this, name)
		var pc = this.percentages = {}
		mod.pckeys.forEach(function (key) {
			pc[key] = 0
		})
		var rs = this.resistances = {}
		mod.rskeys.forEach(function (key) {
			rs[Damage[key]] = 0
		})
		this.modList = []
	},
	effects: function () {
		var efx = []
		if (this.isIdentified) {
			for (var type in this.percentages) {
				var value = Math.round(this.getPercentage(type))
				if (value > 0) efx.push(value + "% increased " + type + ".")
				if (value < 0) efx.push(-value + "% decreased " + type + ".")
			}
			for (var type in this.resistances) {
				var value = Math.round(this.getResistance(type))
				if (value > 0) efx.push(value + "% increased resistance to " + type + " damage.")
				if (value < 0) efx.push(-value + "% decreased resistance to " + type + " damage.")
			}
		}
		return efx.join("\n")
	},
})

function makeArmour(seed, mods, itemLevel) {
	if (seed.pop) return makeArmour.apply(this, seed)  // Also accepts 3-arrays as args
	UFX.random.pushseed(seed)
	var a = new Armour(UFX.random.choice(armournames))
	if (mods) {
		for (var j = 0 ; j < mods.length ; j += 2) {
			applyArmourMod(a, mods[j], mods[j+1])
		}
	}
	if (itemLevel) a.itemLevel = itemLevel
	a.spec = [].slice.call(arguments)
	UFX.random.popseed()
	return a
}

