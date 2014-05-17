
var treasuretables = {
	drop: function (mission, pos, dropLevel) {
		if (UFX.random() < this.noDropChance(dropLevel)) return
		if (UFX.random() < this.getMetalChance(dropLevel)) {
			this.dropMetal(mission, pos, dropLevel)
		} else {
			if (UFX.random() < 0.75) {
				var item = makeWeapon(this.getRandomWeaponSpec(dropLevel))
			} else {
				var item = makeArmour.apply(null, this.getRandomArmourSpec(dropLevel))
			}
			new DroppedEquippable(mission, item, pos)
		}
	},

	
	noDropChance: function (dropLevel) {
		return dropLevel ? Math.pow(0.9, dropLevel + 1) : 1
	},
	
	getMetalChance: function (dropLevel) {
		return Math.max(0.5, 1 - 0.02 * dropLevel)
	},
	
	getMetal: function (dropLevel) {
		while (!metaldrops[dropLevel]) --dropLevel
		var metal = metaldrops[dropLevel]
		var r = UFX.random()
		for (var j = 0 ; j < plotstate.act ; ++j) {
			if (metal[j+1] < r) return j
		}
		return plotstate.act - 1
	},
	
	dropMetal: function (mission, pos, dropLevel) {
		var which = this.getMetal(dropLevel)
		var amount = UFX.random.rand(1, dropLevel * 16 >> which)
		new Metal(mission, METALS[which], amount, pos)
	},
	
	// Returns a weapon spec rather than an actual instantiated weapon : replaces getRandomWeapon
	getRandomWeaponSpec: function (dropLevel) {
		if (dropLevel == 0) return null
		var totalLevel = UFX.random.rand(Math.floor(dropLevel * 5/8), Math.floor(dropLevel * 5/4) + 1)
		var weaponLevel = UFX.random.rand(1, totalLevel + 2)
		while (!weaponLevels[weaponLevel]) --weaponLevel
		var modLevel = totalLevel - weaponLevel
		var type = UFX.random.choice(weaponLevels[weaponLevel])
		var mods = this.randomMods(modLevel, weaponModTypes)
		var itemLevel = totalLevel
		return [type, null, mods, itemLevel]
	},

	// Returns an armour spec rather than an actual instantiated piece of armour : replaces getRandomArmour
	getRandomArmourSpec: function (dropLevel) {
		if (dropLevel == 0) return null
		var modLevel = UFX.random.rand(Math.floor(dropLevel / 2), dropLevel + 2)
		var mods = this.randomMods(modLevel, armourModTypes)
		var itemLevel = modLevel
		return [mods, itemLevel]
	},

	// Replaces addRandomMods
	randomMods: function (modLevel, availablemods) {
		var chosen = {}, mods = []
		while (modLevel > 0 && Object.keys(chosen).length < availablemods.length) {
			var level = UFX.random.rand(1, modLevel + 2)
			do {
				var modtype = UFX.random.choice(availablemods)
			} while (chosen[modtype])
			chosen[modtype] = true
			var modtypeLevel = modtypeLevels[modtype]
			var awesomeness = Math.floor(level / modtypeLevel)
			if (awesomeness > 0) {
				modLevel -= awesomeness * modtypeLevel
				mods.push(modtype, awesomeness)
			}
		}
		return mods.length ? mods : null
	},

}

var weaponLevels = {
	1: ["LightLaser", "LightRepairKit"],
	2: ["MachineGun"],
	3: ["Taser"],
	4: ["Shotgun"],
	5: ["Flamethrower", "TimedMineLayer"],
	6: ["HeavyLaser"],
	7: ["SniperRifle", "Bazooka"],
	8: ["LightningGun", "SuperRepairKit"],
	10: ["Cannon"],
	12: ["IncendiaryRifle", "ProximityMineLayer", "ChainLightningGun"],
	14: ["GatlingGun", "Railgun", "UberLaser", "NapalmThrower", "PlasmaGun", "RocketLauncher"],
}

var weaponModTypes = ["Accurate", "Assault", "Autofiring", "Efficient", "HighPowered", "Holy", 
	"MasterCrafted", "Overclocked", "RapidFire", "Scoped", "Smart", "SuperCooled"]

var armourModTypes = ["Rubber", "Iron", "Mercury", "Chrome", "Asbestos", "Spiky", "Lightning", "Phoenix", "Giants",
	"Chromatic", "Juggernaut", "Conductive", "Crystal", "Wooden", "Sturdy", "Shiny", "FlameRetardant", "Insulated",
	"BlastProof", "Warriors", "Tough", "Oiled", "Capacitative", "Inductive", "Medical", "Berserkers",
	"Glass", "Alcoholic", "Elemental", "Mighty", "Enchanted", "Energetic", "Overlords"]



metaldrops = {
    0: [1, 0, 0, 0, 0, 0],
    1: [1, 0, 0, 0, 0, 0],
    2: [1, 0, 0, 0, 0, 0],
    3: [1, 0, 0, 0, 0, 0],
    4: [1, 0, 0, 0, 0, 0],
    6: [1, 0.1, 0, 0, 0, 0],
    7: [1, 0.2, 0, 0, 0, 0],
    8: [1, 0.4, 0, 0, 0, 0],
    9: [1, 0.5, 0.1, 0, 0, 0],
    10: [1, 0.6, 0.1, 0, 0, 0],
    11: [1, 0.7, 0.2, 0, 0, 0],
    12: [1, 0.75, 0.3, 0.05, 0, 0],
    13: [1, 0.75, 0.4, 0.1, 0, 0],
    14: [1, 0.8, 0.4, 0.15, 0, 0],
    15: [1, 0.8, 0.5, 0.2, 0.05, 0],
    16: [1, 0.8, 0.6, 0.3, 0.1, 0],
    17: [1, 0.8, 0.6, 0.4, 0.2, 0],
    18: [1, 0.8, 0.6, 0.4, 0.2, 0],
    19: [1, 0.8, 0.6, 0.4, 0.2, 0],
    20: [1, 0.8, 0.6, 0.4, 0.2, 0],
}

