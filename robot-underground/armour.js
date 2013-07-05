
armournames = ["Breastplate", "Helmet", "Greaves", "Gauntlets", "Gloves", "Vambraces", "Bracer", "Visor",
               "Suit", "Mail", "Shield", "Great Shield", "Tower Shield", "Plate", "Backpack", "Exoskeleton",
               "Armour", "Scale", "Medallion", "Talisman", "Dogtags", "Faceplate", "Keychain", "Armlet",
               "Bracelet", "Amulet", "Dustbin Lid", "Shades", "Rollcage", "Kneepads", "Sunglasses", "Boots",
               "Thong", "Sandals", "Jetpack", "Battery Pack", "Rollerblades"]

function Armour() {
	this.init()
}
Armour.prototype = extend(Equippable.prototype, {
	init: function () {
		Equippable.prototype.init.call(this, UFX.random.choice(armournames))
		var pc = this.percentages = {}
		mod.pckeys.forEach(function (key) {
			pc[mod[key]] = 0
		})
		var rs = this.resistances = {}
		mod.rskeys.forEach(function (key) {
			rs[mod[key]] = 0
		})
		this.mods = []
	},
	applyMod: function (mod) {
		for (var key in mod.percentages) this.percentages[key] += mod.percentages[key]
		for (var key in mod.resistances) this.resistances[key] += mod.resistances[key]
		this.mods.push(mod)
		return this
	},
	effects: function () {
		var efx = []
		if (this.isIdentified) {
			for (var type in this.percentages) {
				var value = this.getPercentage(type)
				if (value > 0) efx.append(value + "% increased " + type + ".")
				if (value < 0) efx.append(-value + "% decreased " + type + ".")
			}
			for (var type in this.resistances) {
				var value = this.getResistance(type)
				if (value > 0) efx.append(value + "% increased resistance to " + type + " damage.")
				if (value < 0) efx.append(-value + "% decreased resistance to " + type + " damage.")
			}
		}
		return efx.join("\n")
	},
})
