
var treasuretables = {
	drop: function (mission, pos, dropLevel) {
		if (UFX.random() < this.noDropChance(dropLevel)) return
		if (UFX.random() < this.getMetalChance(dropLevel)) {
			this.dropMetal(mission, pos, dropLevel)
		} else {
			var item = UFX.random() < 0.75 ? this.getRandomWeapon(dropLevel) : this.getRandomArmour(dropLevel)
			makeTreasure(mission, item, pos)
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
	
	// TODO: getRandomWeapon, getRandomArmour, addRandomMods
}


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

