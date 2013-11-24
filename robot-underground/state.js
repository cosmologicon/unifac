



function CombatStats(attack, defence, hp, speed) {
	return { attack: attack, defence: defence, maxhp: hp, speed: speed }
}

// renamed from main.control.plotstate and main.control.robotstate
var plotstate = {}

var robotstate = {
	init: function (protag_level) {
		this.xp = 0
		this.level = 0
		this.stats = CombatStats(
			ROBOT_INITIAL_ATTACK,
			ROBOT_INITIAL_DEFENCE,
			ROBOT_INITIAL_HP,
			ROBOT_BASE_SPEED
		)
		this.weaponslots = 2
		this.weaponry = [makeWeapon("LightLaser"), makeWeapon("LightRepairKit")]
		this.armoury = makeArmour()
		this.maxenergy = ROBOT_INITIAL_MAX_ENERGY
		if (protag_level && protag_level > 4) {
			// TODO: cheat code
		}
		this.armoury.isIdentified = true
		this.weaponry.forEach(function (weap) { weap.isIdentified = true })
		this.inventory = []
		this.metal = [0,0,0,0,0]

		if (DEBUG.testinventory) {
			for (var level = 1 ; level <= 22 ; ++level) {
				this.addItem(makeWeapon(treasuretables.getRandomWeaponSpec(level)))
				this.addItem(makeArmour.apply(null, treasuretables.getRandomArmourSpec(level)))
			}
			//for (var j = 0 ; j < 50 ; ++j) this.addItem(makeWeapon("LightLaser"))
			this.metal = [1000000, 1000000, 1000000, 1000000, 1000000]
		}
	},
	addXP: function (amt) {
		this.xp += amt
		var levelled_up = false
		while (this.xp >= 1 << (this.level + LEVEL_0_EXPONENT)) {
			this.levelup()
			levelled_up = true
		}
		return levelled_up
	},
	addMetal: function (amt, metal_name) {
		if (!metal_name) metal_name = UFX.random.choice(METALS)
		var idx = METALS.indexOf(metal_name)
		this.metal[idx] += amt
		// TODO: gamelog
	},
	changeMetal: function () { return this.addMetal.apply(this, arguments) },
	
	addItem: function (newItem) {
		this.inventory.push(newItem)
		// TODO: gamelog
	},
	canAfford: function (metals) {
		for (var j = 0 ; j < this.metal.length ; ++j) {
			if (this.metal[j] < metals[j]) return false
		}
		return true
	},
	getMetal: function (metaltype) {
		return this.metal[METALS.indexOf(metaltype)]
	},
	addMetals: function (metals) {
		for (var j = 0 ; j < this.metal.length ; ++j) {
			this.metal[j] += metals[j]
		}
	},
	removeMetals: function (metals) {
		for (var j = 0 ; j < this.metal.length ; ++j) {
			this.metal[j] -= metals[j]
		}
	},
	setWeapon: function (weapon, slotNumber) {
		if (slotNumber >= this.weaponSlots) return
		if (this.weaponry[slotNumber]) {
			this.inventory.push(this.weaponry[slotNumber])
		}
		this.weaponry[slotNumber] = weapon
		this.inventory.splice(this.inventory.indexOf(weapon), 1)
	},
	addWeaponSlot: function () {
		this.weaponslots += 1
		this.weaponry.push(null)
	},
	setArmour: function (armour) {
		if (this.armoury) {
			this.inventory.push(this.armoury)
		}
		this.armoury = armour
		this.inventory.splice(this.inventory.indexOf(armour), 1)
	},
	levelup: function () {
		this.level += 1
		// TODO: gamelog
		this.stats.attack += ROBOT_ATTACK_INCREASE
		this.stats.defence += ROBOT_DEFENCE_INCREASE
		this.stats.maxhp += ROBOT_HP_INCREASE
	},

	getAttack: function () {
		return this.stats.attack * (1 + 0.01 * this.armoury.getPercentage("attack"))
	},
	getDefence: function () {
		return this.stats.defence * (1 + 0.01 * this.armoury.getPercentage("defence"))
	},
	getMaxHP: function () {
		return this.stats.maxhp * (1 + 0.01 * this.armoury.getPercentage("hp"))
	},
	getSpeed: function () {
		return this.stats.speed * (1 + 0.01 * this.armoury.getPercentage("speed"))
	},
	getMaxEnergy: function () {
		return this.maxenergy * (1 + 0.01 * this.armoury.getPercentage("maxenergy"))
	},
	getEnergyRegen: function () {
		return 1 + 0.01 * this.armoury.getPercentage("energyregen")
	},
	getResistance: function (damageType) {
		return 1 + 0.01 * this.armoury.getResistance(damageType)
	},
}

function getstate() {
	var weaponspecs = robotstate.weaponry.map(function (w) { return w && w.getItemSpec() })
	var armourspec = robotstate.armoury.getItemSpec()
	var inventoryspecs = robotstate.inventory.map(function (i) { return i.getItemSpec() })
	return [plotstate, robotstate.xp, robotstate.level, robotstate.stats, robotstate.weaponslots,
		weaponspecs, armourspec, robotstate.maxenergy, inventoryspecs, robotstate.metal]
}

function setstate(state) {
	plotstate = state[0]
	robotstate.xp = state[1]
	robotstate.level = state[2]
	robotstate.stats = state[3]
	robotstate.weaponslots = state[4]
	robotstate.weaponry = state[5].map(makeItem)
	robotstate.armoury = makeItem(state[6])
	robotstate.maxenergy = state[7]
	robotstate.inventory = state[8].map(makeItem)
	robotstate.metal = state[9]
}

function savegame(slot) {
	localStorage[settings.savename + "|" + slot] = JSON.stringify(getstate())
}
function slotfilled(slot) {
	return (settings.savename + "|" + slot) in localStorage
}
function loadgame(slot) {
	setstate(JSON.parse(localStorage[settings.savename + "|" + slot]))
}
function deletesavedgame(slot) {
	delete localStorage[settings.savename + "|" + slot]
}




