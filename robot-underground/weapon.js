
function Weapon() {
}
Weapon.prototype = extend(Equippable.prototype, {
	init: function (damagetype, range, cooldowntime, damage, energydrain, name, effectname) {
		Equippable.prototype.init.call(this, name || "???")
		this.effectname = effectname || damagetype
		this.damagetype = damagetype
		this.baserange = WEAPON_RANGE_MULTIPLIER * range
		this.basecooldown = cooldowntime
		this.basedamage = damage
		this.cooldotn = this.basecooldown
		this.baseenergydrain = energydrain === undefined ? 1 : energydrain
		var pc = this.percentages = {}
		mod.wpckeys.forEach(function (key) {
			pc[mod[key]] = 0
		})
		this.mode = "Active"
		this.canAutofire = false
		this.allowactive = true
		this.modList = []
	},
	getDamage: function () {
		return UFX.random(0.8, 1.2) * this.basedamage * (1 + 0.01 * this.getPercentage(mod.damage))
	},
	getRange: function () {
		return this.baserange * (1 + 0.01 * this.getPercentage(mod.range))
	},
	getEnergyUse: function () {
		return this.baseenergydrain * (1 + 0.01 * this.getPercentage(mod.energy))
	},
	getCooldown: function () {
		return this.basecooldown / (1 + 0.01 * this.getPercentage(mod.rate))
	},
	canFire: function (owner, target) {
		if (this.mode == "Inactive") return false
		if (!target) return false
		if (this.cooldown > 0) return false
		if (distanceBetween(owner, target) > this.getRange()) return false
		return owner.mission.map.hasLOS(owner.pos, target.pos)
	},
	fire: function (owner, target) {
		target.takeDamage(this.getDamage() * owner.getAttack(), this.damagetype)
		this.cooldown = this.getCooldown()
		owner.mission.dispatch_event("on_weapon_fire", this, owner, target)
		return true
	},
	tick: function () {
		this.cooldown -= 1
	},
	toggle: function (owner) {
		switch (this.mode) {
			case "Autofire": this.mode = this.allowactive ? "Active" : "Inactive" ; break
			case "Active": this.mode = "Inactive" ; break
			case "Inactive": this.mode = this.canAutofire ? "Autofire" : "Active" ; break
		}
	},
	effects: function () {
		var efx = []
		if (this.isIdentified) {
			for (var type in this.percentages) {
				var value = this.getPercentage(type)
				if (value > 0) efx.push(value + "% increased " + type + ".")
				if (value < 0) efx.push(-value + "% decreased " + type + ".")
			}
			if (this.canAutofire) efx.push("Autofire mode available.")
		}
		return efx.join("\n")
	},
})

var weapondata = {
	"Taser": [Damage.electric, 3, 40, 8, 50, "Taser"],
	"LightningGun": [Damage.electric, 6, 30, 12, 120, "Lightning Gun"],
	"LightLaser": [Damage.laser, 5, 25, 1, 10, "Light Laser"],
	"HeavyLaser": [Damage.laser, 4, 30, 8, 30, "Heavy Laser"],
	"UberLaser": [Damage.laser, 5, 15, 30, 20, "Uber Laser"],
	"MachineGun": [Damage.physical, 3, 5, 0.5, 6, "Machine Gun"],
	"Shotgun": [Damage.physical, 1.5, 25, 10, 50, "Shotgun", Damage.shotgun],
	"SniperRifle": [Damage.physical, 10, 300, 75, 300, "Sniper Rifle"],
	"IncendiaryRifle": [Damage.fire, 6, 20, 15, 30, "Incendiary Rifle"],
	"WimpyClaw": [Damage.physical, 0.75, 20, 1, 0, "Claw", Damage.claw],
	"Drill": [Damage.physical, 0.75, 15, 8, 0, "Claw", Damage.claw],
	"PopGun": [Damage.physical, 5, 25, 1, 1],
}

function makeWeapon(type, args, mods) {
	if (type.pop) return makeWeapon.apply(this, type)  // Also accepts 3-arrays as args
	var w
	if (type in weapondata) {
		w = new Weapon()
		w.init.apply(w, weapondata[type])
	}


	if (mods) {
		for (var j = 1 ; j < mods.length ; j += 2) {
			applyWeaponMod(w, mods[j], mods[j+1])
		}
	}
	return w
}





