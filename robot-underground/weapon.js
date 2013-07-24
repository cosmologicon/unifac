
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

function Healing() {
}
Healing.prototype = extend(Weapon.prototype, {
	init: function (healing, cooldowntime, energydrain, name) {
		Weapon.prototype.init.call(this, null, 20, cooldowntime, healing, energydrain, name || "Repair Kit")
		applyWeaponMod(this, "Smart", 1)
		this.mode = "Inactive"
		this.allowactive = false
	},
	canFire: function (owner, target) {
		if (this.mode == "Inactive") return false
		if (this.cooldown > 0) return false
		return owner.currenthp < owner.getMaxHP()
	},
	fire: function (owner, target) {
		this.cooldown = this.getCooldown()
		owner.heal(this.getDamage())
		return true
	},
})

function ProjectileWeapon() {
}
ProjectileWeapon.prototype = extend(Weapon.prototype, {
	init: function (cons, range, damage, cooldowntime, energydrain, name, cone, normal_los) {
		Weapon.prototype.init.call(this, null, range, cooldowntime, damage, energydrain, name)
		this.cons = cons
		this.cone = cone * 0.0174532925
		this.normal_los = normal_los
	},
	canFire: function (owner, target) {
		if (this.mode == "Inactive") return false
		if (!target) return false
		if (this.cooldown > 0) return false
		if (distanceBetween(owner.pos, target.pos) > this.getRange()) return false
		if (this.normal_los) {
			return owner.mission.map.hasLOS(owner.pos, target.pos)
		}
		var radius = projdata[this.cons][0]
		return owner.mission.map.hasWideLOS(owner.pos, target.pos, radius)
	},
	fire: function (owner, target) {
		this.cooldown = this.getCooldown()
		var truebearing = Math.atan2(target.pos[1] - owner.pos[1], target.pos[0] - owner.pos[0])
		var bearing = truebearing + UFX.random(-this.cone, this.cone)
		var weap = this, damagefunc = function () { return weap.getDamage() * owner.getAttack() }
		var projectile = makeProjectile(owner, bearing, damagefunc)
		owner.mission.born[projectile.id] = projectile
		owner.mission.dispatch_event("on_projectile_fire", owner, projectile)
	},
})
// TODO: MineLayer, SuicideBomb, Summon



// damage type, range, cooldowntime, damage, energydrain, name, effectname
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
// healing, cooldowntime, energydrain, name
var healingdata = {
	"LightRepairKit": [5, 5, 50, "Light Repair Kit"],
	"SuperRepairKit": [15, 5, 100, "Super Repair Kit"],
}
// cons, range, cooldowntime, damage, energydrain, name, cone, normal_los
var projweapondata = {
	"Flamethrower": ["Fireball", 1.5, 4, 2, 10, "Flamethrower", 30, true],
	"Bazooka": ["Shell", 5, 20, 10, 30, "Bazooka"],
	"Cannon": ["Cannonball", 5, 60, 15, 30, "Cannon"],
	"Railgun": ["RailgunSlug", 10, 50, 120, 150, "Railgun"],
	"NapalmThrower": ["Napalm", 3, 4, 7, 10, "Napalm Thrower", 10, true],
	"PlasmaGun": ["Plasma", 5, 3, 9, 10, "Plasma Gun", 3],
	"RocketLauncher": ["Rocket", 8, 100, 200, 200, "Rocket Launcher"],
	// Spider thrower?
	"NinjaStarLauncher": ["NinjaStar", 8, 30, 10, 0, "NinjaStarLauncher"],
	"HomingMissileLauncher": ["HomingMissile", 6, 60, 20, 0, "HomingMissileLauncher"],
}

function makeWeapon(type, args, mods) {
	if (type.pop) return makeWeapon.apply(this, type)  // Also accepts 3-arrays as args
	var w
	if (type in weapondata) {
		w = new Weapon()
		w.init.apply(w, weapondata[type])
	} else if (type in healingdata) {
		w = new Healing()
		w.init.apply(w, healingdata[type])
	} else if (type in projweapondata) {
		w = new ProjectileWeapon()
		w.init.apply(w, projweapondata[type])
	}


	if (mods) {
		for (var j = 1 ; j < mods.length ; j += 2) {
			applyWeaponMod(w, mods[j], mods[j+1])
		}
	}
	return w
}

// TODO: makeProjectile


// radius, damagetype, velocity, name, onehit, ttl, blast, trail
// projdata

function Explosion(mission, pos, blast, number) {
	this.init(mission, pos, blast, number)
}
Explosion.prototype = extend(Entity.prototype, {
	init: function (mission, pos, blast, number) {
		Entity.prototype.init.call(this, mission, pos, 0, UFX.random(360), false, "Explosion " + (number || 0))
		this.blast = blast
		this.age = 0
	},
	tick: function () {
		this.r += 0.1 * (this.blast - this.r)
		if (UFX.random() < EXPLOSION_BRANCH_P) {
			var r = UFX.random(this.blast - this.r)
			if (r > EXPLOSION_MINIMUM) {
				var A = UFX.random(360)
				var x = this.r * Math.cos(A) + this.pos[0]
				var y = this.r * Math.sin(A) + this.pos[1]
				this.mission.entities.add(new Explosion(this.mission, [x,y], r, (UFX.random() < 0.5 ? 1 : 0)))
			}
		}
		if (++this.age > EXPLOSION_TIME) this.die()
	},
})




