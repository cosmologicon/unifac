// Construct weapons via the makeWeapon factory.
// Takes 4 args: type, args, mods, itemLevel (args and mods can be null if empty, itemLevel = 0 for default)
// type is a string, usually the class name from the python version, eg "LightLaser", "GatlingGun"
// args are additional arguments passed to the weapon constructor, not used for the most part,
//   but Summon uses it (anything else?)
// mods are concatenated 2-arrays of (mod name, awesomeness) values

// Examples (python version -> js version)

// weapon.WimpyClaw() -> "WimpyClaw"
// weapon.Summon(Spider, 1.5, 40, 4) -> "Summon", ["Spider", 1.5, 40, 4]
// weapon.Railgun().applyMod(mod.HighPowered(10)) -> "Railgun", null, ["HighPowered", 10]
// weapon.Drill().applyMod(mod.BOSS(3)).applyMod(mod.Accurate(1))
//   -> "Drill", null, ["BOSS", 3, "Accurate", 1]


function Weapon() {
}
Weapon.prototype = extend(Equippable.prototype, {
	isweapon: true,
	init: function (damagetype, range, cooldowntime, damage, energydrain, name, effectname) {
		Equippable.prototype.init.call(this, name || "???")
		this.effectname = effectname || damagetype
		this.damagetype = damagetype
		this.baserange = WEAPON_RANGE_MULTIPLIER * range
		this.basecooldown = cooldowntime
		this.basedamage = damage
		this.cooldown = this.basecooldown
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
		if (distanceBetween(owner.pos, target.pos) > this.getRange()) return false
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
				var value = Math.round(this.getPercentage(type))
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
	// Note that the order of cooldowntime and damage are swapped! This is because that's how the
	//   numbers appear in most of the subclass constructors.
	init: function (cons, range, cooldowntime, damage, energydrain, name, cone, normal_los) {
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
		var bearing = truebearing + (this.cone ? UFX.random(-this.cone, this.cone) : 0)
		// This was originally damagefunc but I don't see any reason for that.
		var damageamt = this.getDamage() * owner.getAttack()
		var projectile = makeProjectile(this.cons, owner, bearing, damageamt)
		owner.mission.born[projectile.id] = projectile
		owner.mission.dispatch_event("on_projectile_fire", owner, projectile)
	},
})

function Summon() {
}
Summon.prototype = extend(Weapon.prototype, {
	init: function (cons, range, cooldowntime, limit, supply) {
		Weapon.prototype.init.call(this, null, range || 2, cooldowntime || 150, 0, 0, null)
		this.cons = cons
		this.limit = limit || 5
		this.children = []
		this.supply = supply || null
	},
	canFire: function (owner, target) {
		if (this.cooldown > 0) return false
		if (distanceBetween(owner.pos, target.pos) > owner.guardradius) return false
		this.children = this.children.filter(function (c) { return c.currenthp > 0 })
		if (this.supply !== null && this.supply < 1) return false
		return (this.limit === null) || this.children.length < this.limit
	},
	fire: function (owner, target) {
		var beast = makeEnemy(this.cons, owner.mission, owner.pos)
		var born = owner.mission.born
		function tooclose (id) {
			var r = beast.r + born[id].r
			return d2between(pos, born[id].pos) <= r * r
		}
		for (var tries = 0 ; tries < SUMMON_TRIES ; ++tries) {
			var xd = owner.pos[0] + UFX.random(-this.baserange, this.baserange)
			var yd = owner.pos[1] + UFX.random(-this.baserange, this.baserange)
			var pos = [xd, yd]
			if (!owner.mission.map.circleClear(pos, beast.r)) continue
			if (Object.keys(owner.mission.entities.entitiesWithin(pos, beast.r)).length) continue
			if (Object.keys(born).some(tooclose)) continue
			beast.pos = pos
			owner.mission.born[beast.id] = beast
			// Seems to be a no-op
			//owner.mission.dispatch_event("on_summon", beast, owner)
			this.children.push(beast)
			if (this.supply !== null) --this.supply
			this.cooldown = this.getCooldown()
			break
		}
	},
})

function MineLayer() {
}
MineLayer.prototype = extend(Weapon.prototype, {
	init: function (cons, damage, cooldowntime, energydrain, blast, name) {
		Weapon.prototype.init.call(this, null, 0, cooldowntime, damage, energydrain, name)
		this.cons = cons
		this.blast = blast
	},
	toggle: function (owner) {
		this.fire(owner, null)
	},
	fire: function (owner, target) {
		this.cooldown = this.getCooldown()
		// This was originally a callback damagefunc but that seems unnecessary
		var damageamt = this.getDamage() * owner.getAttack()
		var mine = makeMine(this.cons, owner, damageamt, this.blast)
		owner.mission.born[mine.id] = mine
		owner.mission.dispatch_event("on_mine_lay", owner, mine)
		return true
	},
})

// NB: SuicideBomb is merely a pseudo-weapon used by mines. No need for its spec to be JSONable
function SuicideBomb() {
}
SuicideBomb.prototype = extend(Weapon.prototype, {
	init: function (damageamt, damagetype, blast) {
		Weapon.prototype.init.call(this, null, 0, 0, 0, 0, "")
		this.damageamt = damageamt
		this.damagetype = damagetype
		this.blast = blast
		this.exploded = false
	},
	canFire: function (owner, target) {
		return false
	},
	fire: function (owner, target) {
		var mkt = new MultikillTracker(owner.mission)
		if (this.exploded) return false
		this.exploded = true
		if (!this.blast) return true
		var victims = owner.mission.entities.entitiesWithin(owner.pos, this.blast)
		for (var id in victims) {
			var v = victims[id]
			if (v === owner) continue
			if (v.isactor) mkt.applyDamage(v, this.damageamt, this.damagetype)
		}
		owner.mission.entities.add(new Explosion(owner.mission, owner.pos, this.blast, 2))
		owner.mission.entities.add(new Explosion(owner.mission, owner.pos, 0.6 * this.blast, 0))
		return true
	},
})

function ChainLightningGun() {
	this.init()
}
ChainLightningGun.prototype = extend(Weapon.prototype, {
	init: function () {
		Weapon.prototype.init.apply(this, weapondata.ChainLightningGun)
	},
	fire: function (owner, target) {
		if (owner !== owner.mission.protag) {
			return Weapon.prototype.fire.call(this, owner, target)
		}
		this.cooldown = this.getCooldown()
		var mkt = new MultikillTracker(owner.mission)
		var origin = owner, range = this.getRange(), hit = {}, mission = owner.mission
		var damage = this.getDamage() * owner.getAttack()
		while (damage > 0.5 && target) {
			mkt.applyDamage(target, damage, this.damagetype)
			mission.dispatch_event("on_weapon_fire", this, origin, target)
			damage *= 0.5
			origin = target
			hit[target.id] = true
			var viabletargets = mission.entities.entitiesWithin(target.pos, 0.5*range)
			target = null
			var t2d = (range + 1) * (range + 1)
			var vtkeys = Object.keys(viabletargets)
			vtkeys.sort()
			vtkeys.forEach(function (vtkey) {
				var vt = viabletargets[vtkey]
				if (vt.isenemy && vt.visible && !hit[vtkey] && mission.map.hasLOS(origin.pos, vt.pos)) {
					var vtd2 = d2between(vt.pos, origin.pos)
					if (vtd2 < td2) {
						target = vt
						td2 = vtd2
					}
				}
			})
		}
		return true
	},
})



// damage type, range, cooldowntime, damage, energydrain, name, effectname
var weapondata = {
	"Taser": [Damage.electric, 3, 40, 8, 50, "Taser"],
	"LightningGun": [Damage.electric, 6, 30, 12, 120, "Lightning Gun"],
	"ChainLightningGun": [Damage.electric, 6, 30, 12, 120, "Chain Lightning Gun"],
	"LightLaser": [Damage.laser, 5, 25, 1, 10, "Light Laser"],
	"HeavyLaser": [Damage.laser, 4, 30, 8, 30, "Heavy Laser"],
	"UberLaser": [Damage.laser, 5, 15, 30, 20, "Uber Laser"],
	"MachineGun": [Damage.physical, 3, 5, 0.5, 6, "Machine Gun"],
	"Shotgun": [Damage.physical, 1.5, 25, 10, 50, "Shotgun", Damage.shotgun],
	"SniperRifle": [Damage.physical, 10, 300, 75, 300, "Sniper Rifle"],
	"GatlingGun": [Damage.physical, 3, 3, 10, 20, "Gatling Gun"],
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
// cons, damage, cooldowntime, energydrain, blast, name
var minelayerdata = {
	TimedMineLayer: ["TimedMine", 50, 150, 200, 40, "Timed Mine Layer"],
	ProximityMineLayer: ["ProximityMine", 250, 250, 500, 60, "Proximity Mine Layer"],
}

function makeWeapon(type, args, mods, itemLevel, seed) {
	if (type.pop) return makeWeapon.apply(this, type)  // Also accepts 4-arrays as args
	seed = seed || UFX.random.rand()
	UFX.random.pushseed(seed)
	var w
	if (type == "ChainLightningGun") {
		w = new ChainLightningGun()
	} else if (type in weapondata) {
		w = new Weapon()
		w.init.apply(w, weapondata[type])
	} else if (type in healingdata) {
		w = new Healing()
		w.init.apply(w, healingdata[type])
	} else if (type in projweapondata) {
		w = new ProjectileWeapon()
		w.init.apply(w, projweapondata[type])
	} else if (type in minelayerdata) {
		w = new MineLayer()
		w.init.apply(w, minelayerdata[type])
	} else if (type == "SuicideBomb") {
		w = new SuicideBomb()
		w.init.apply(w, args)
	} else if (type == "Summon") {
		w = new Summon()
		w.init.apply(w, args)
	} else {
		throw "Unrecognized weapon type: " + type
	}

	if (mods) {
		for (var j = 0 ; j < mods.length ; j += 2) {
			applyWeaponMod(w, mods[j], mods[j+1])
		}
	}
	if (itemLevel) w.itemLevel = itemLevel
	w.spec = [].slice.call(arguments)
	UFX.random.popseed()
	return w
}

function Projectile() {
}
Projectile.prototype = extend(Entity.prototype, {
	init: function (owner, radius, bearing, damageamt, damagetype, velocity, name, onehit, blast, ttl, trail) {
		Entity.prototype.init.call(this, owner.mission, owner.pos, radius, 57.2957795 * bearing, false, name)
		this.owner = owner
		this.damageamt = damageamt
		this.damagetype = damagetype
		this.onehit = onehit
		this.blast = blast
		this.ttl = ttl
		this.trail = trail
		this.hitalready = {}
		this.exploded = false
		this.dx = Math.cos(bearing) * velocity
		this.dy = Math.sin(bearing) * velocity
		this.mkt = new MultikillTracker(owner.mission)
	},
	tick: function () {
		var newpos = [this.pos[0] + this.dx, this.pos[1] + this.dy]
		if (this.trail) {
			this.mission.dispatch_event("on_projectile_move", this.pos, this.bearing, this.trail)
		}
		var victims = this.mission.entities.entitiesWithin(newpos, this.r)
		var ids = Object.keys(victims)
		ids.sort()
		for (var j = 0 ; j < ids.length ; ++j) {
			var id = ids[j], v = victims[id]
			if (!v.solid || v === this.owner || this.hitalready[id]) continue
			if (v.isactor && !this.blast) {
				this.mkt.applyDamage(v, this.damageamt, this.damagetype)
				this.hitalready[id] = true
			}
			if (this.onehit) {
				this.explode()
				break
			}
		}
		if (!this.mission.map.circleClear(newpos, this.r)) {
			this.explode()
		}
		this.setPos(newpos)
		if (this.ttl !== null) {
			--this.ttl
			if (this.ttl <= 0) this.explode()
		}
	},
	explode: function () {
		if (this.exploded) return
		this.die()
		this.mission.dispatch_event("on_explode", this)
		if (!this.blast) return
		var victims = this.mission.entities.entitiesWithin(this.pos, this.blast)
		for (var id in victims) {
			var v = victims[id]
			if (v.isactor) {
				this.mkt.applyDamage(v, this.damageamt, this.damagetype)
			}
		}
		this.mission.entities.add(new Explosion(this.mission, this.pos, this.blast, 2))
		this.mission.entities.add(new Explosion(this.mission, this.pos, 0.6 * this.blast, 0))
	},
})

// radius=5, damagetype, velocity=20, name, onehit=true, blast=null, ttl=50, trail=null
var projdata = {
	Cannonball: [10, Damage.physical, 15, "Cannonball", true, null, null, null],
	RailgunSlug: [5, Damage.physical, 18, "Railgun Slug", false, null, null, "railgun"],
	Fireball: [10, Damage.fire, 3, "Fireball", false, null, 40, null],
	Napalm: [10, Damage.fire, 4, "Napalm", false, null, 80, null],
	Plasma: [8, Damage.electric, 5, "Plasma", true, null, 80, null],
	Shell: [15, Damage.explosion, 10, "Shell", true, 50, null, "smoke"],
	Rocket: [10, Damage.explosion, 12, "Rocket", true, 150, null, "fire"],
	NinjaStar: [6, Damage.physical, 8, "Ninja Star", true, null, null, null],
	// Not implemented: FireSpider
	
	// HomingMissile is a special case, since it's a subclass of Mine. Behaves differently.
	HomingMissile: [10, null, 5, "Rocket", null, 20],
}

function makeProjectile(type, owner, bearing, damageamt) {
	var p
	if (type == "HomingMissile") {
		p = new HomingMissile()
		p.init(owner, bearing, damageamt)
	} else if (type in projdata) {
		p = new Projectile()
		var data = projdata[type], radius = data[0], damagetype = data[1], velocity = data[2]
		var name = data[3], onehit = data[4], blast = data[5], ttl = data[6], trail = data[7]
		p.init(owner, radius, bearing, damageamt, damagetype, velocity, name, onehit, blast,
			ttl, trail)
	} else {
		throw "Unrecognized projectile type " + type
	}
	return p
}


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

function MultikillTracker(mission) {
	this.mission = mission
	this.kills = 0
}
MultikillTracker.prototype = {
	applyDamage: function (target, damage, effect) {
		target.takeDamage(damage, effect)
		if (target.currenthp <= 0) {
			if (++this.kills > 1) {
				this.mission.dispatch_event("on_multi_kill", target.pos, this.kills)
			}
		}
	},
}




