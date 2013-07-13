



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
		this.armoury = new Armour()
		this.maxenergy = ROBOT_INITIAL_MAX_ENERGY
		if (protag_level && protag_level > 4) {
			// TODO: cheat code
		}
		this.armoury.isIdentified = true
		// TODO (identify weapons)
		this.inventory = []
		this.metal = [0,0,0,0,0]
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
	// TODO: canAfford, getMetal, addMetals, removeMetals, setWeapon, addWeaponSlot, setArmour
	levelup: function () {
		this.level += 1
		// TODO: gamelog
		this.stats.attack += ROBOT_ATTACK_INCREASE
		this.stats.defence += ROBOT_DEFENCE_INCREASE
		this.stats.maxhp += ROBOT_HP_INCREASE
	},

	getAttack: function () {
		return this.stats.attack * (1 + 0.01 * this.armoury.getPercentage(mod.attack))
	},
	getDefence: function () {
		return this.stats.defence * (1 + 0.01 * this.armoury.getPercentage(mod.defence))
	},
	getMaxHP: function () {
		return this.stats.maxhp * (1 + 0.01 * this.armoury.getPercentage(mod.hp))
	},
	getSpeed: function () {
		return this.stats.speed * (1 + 0.01 * this.armoury.getPercentage(mod.speed))
	},
	getMaxEnergy: function () {
		return this.maxenergy * (1 + 0.01 * this.armoury.getPercentage(mod.maxenergy))
	},
	getEnergyRegen: function () {
		return 1 + 0.01 * this.armoury.getPercentage(mod.energyregen)
	},
	getResistance: function (damageType) {
		return 1 + 0.01 * this.armoury.getResistance(damageType)
	},
}



