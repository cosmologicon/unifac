var mod = {
	// Weapons percentages
	damage: "damage",
	range: "range",
	energy: "energy",
	rate: "rate",
	wpckeys: "damage range energy rate".split(" "),

	// Character percentages
	attack: "offensive power",
	defence: "defensive strength",
	hp: "hit points",
	speed: "speed",
	maxenergy: "energy capacity",
	energyregen: "energy regeneration",
	pckeys: "attack defence hp speed maxenergy energyregen".split(" "),

	physical: Damage.physical,
	laser: Damage.laser,
	fire: Damage.fire,
	electric: Damage.electric,
	explosion: Damage.explosion,
	rskeys: "physical laser fire electric explosion".split(" "),
}

// Make sure you set the UFX.random seed appropriately before calling this
function applyWeaponMod(weapon, type, a) {  // a = awesomeness
	var pcs = { damage: 0, range: 0, energy: 0, rate: 0 }, afire = false, name = type
	switch (type) {
		case "Smart": afire = true ; break
		case "HighPowered": pcs.damage = a ; name = "High-Powered" ; break
		case "Accurate": pcs.range = a ; break
		case "Efficient": pcs.energy = -a ; break
		case "SuperCooled": pcs.rate = a ; break
		case "Overclocked": pcs.damage = a ; pcs.energy = a ; name = "Over-clocked" ; break
		case "RapidFire": pcs.rate = a ; pcs.damage = -a ; name = "Rapid-fire" ; break
		case "Scoped": pcs.range = a ; pcs.rate = -Math.floor(a/2) ; break
		case "Assault": pcs.damage = a ; pcs.energy = a ; pcs.range = -(5-Math.floor(a/2)) ; break
		case "Autofiring": pcs.damage = a-5 ; afire = true ; name = "Auto-firing" ; break
		case "MasterCrafted": pcs.energy = -a ; pcs.range = a ; break
		case "Holy": pcs.damage = a*2 ; pcs.range = a ; break
		case "BOSS": pcs.damage = (a+1)*(a+1) ; pcs.range = a*2 ; pcs.rate = a*2 ; pcs.energy = -3*a ; afire = true ; break
	}
	for (var t in pcs) {
		if (pcs[t]) weapon.percentages[t] += (pcs[t] + UFX.random(-0.5, 0.5)) * 10
	}
	if (afire) {
		weapon.canAutofire = true
		weapon.mode = "Autofire"
	}
	weapon.modList.push([name, a])
}


// Make sure you set the UFX.random seed appropriately before calling this
// I'm not crazy about how armour mod strengths are calculated, but that's the way it is
//   in the python version.
function applyArmourMod(armour, type, c) {  // c = cool
	var ps = { attack: 0, defence: 0, hp: 0, speed: 0, maxenergy: 0, energyregen:0 }  // percentages
	var rs = { physical: 0, laser: 0, fire: 0, electric: 0, explosion: 0 }   // resistances
	switch (type) {
		case "Rubber": rs.electric = c*3 ; ps.speed = -c/2 ; break
		case "Iron": rs.physical = c*3 ; ps.speed = -c/2 ; break
		case "Mercury": rs.fire = -c ; ps.speed = c ; break
		case "Chrome": rs.laser = c*3 ; ps.attack = -c ; break
		case "Asbestos": rs.fire = c*3 ; ps.hp = -c/2 ; break
		case "Spiky": ps.attack = c*2 ; ps.speed = -c/2 ; break
		case "Lightning": rs.electric = c*2 ; ps.energyregen = c*2 ; break
		case "Phoenix": rs.fire = c*2 ; ps.hp = c ; break
		case "Giants": rs.explosion = c*3 ; ps.maxenergy = c*2 ; break
		case "Chromatic": rs.laser = c*2 ; ps.speed = c ; break
		case "Turtles": rs.physical = c*3 ; ps.defence = 1.5*c ; ps.speed = -c ; break
		case "Juggernaut": rs.physical = c*2 ; ps.attack = c ; break
		case "Conductive": rs.electric = -c ; ps.speed = 1.5*c ; break
		case "Crystal": rs.laser = c*3 ; ps.defence = -c ; break
		case "Wooden": rs.fire = -c ; rs.electric = c*3 ; break
		case "Sturdy": rs.physical = c*2 ; break
		case "Shiny": rs.laser = c*2 ; break
		case "FlameRetardant": rs.fire = c*2 ; break
		case "Insulated": rs.electric = c*2 ; break
		case "BlastProof": rs.explosion = c*2 ; break
		case "Warriors": ps.attack = c ; break
		case "Tough": ps.defence = c ; break
		case "Oiled": ps.speed = c ;  break
		case "Capacitative": ps.maxenergy = c ; break
		case "Inductive": ps.energyregen = c ; break
		case "Medical": ps.hp = c ; break
		case "Berserkers": ps.attack = c*2 ; ps.speed = c*2 ; ps.hp = -c ; break
		case "Glass": rs.explosion = -c ; rs.laser = c*3 ; break
		case "Alcoholic": rs.fire = -c*3 ; ps.defence = -c ; rs.electric = c*6 ; break
		case "Elemental": rs.fire = c*4 ; rs.electric = c*4 ; rs.laser = c*4 ; rs.physical = -c*2 ; break
		case "Mighty": rs.physical = c*3 ; ps.attack = c*2 ; rs.explosion = c*3 ; rs.electric = -c*2 ; break
		case "Enchanted": rs.laser = c*4 ; ps.speed = c*2 ; ps.energyregen = c*4 ; ps.hp = -c ; break
		case "Energetic": ps.maxenergy = c*2 ; ps.energyregen = c*4 ; break
		case "Overlords": rs.physical = c*4 ; ps.hp = c ; ps.attack = c*3 ; ps.defence = c*3 ; ps.speed = -c ; break
		default: throw "Unrecognized armour mod type " + type ; break
	}
	// If I made a typo in the above table, this should catch it.
	if (Object.keys(ps).length != mod.pckeys.length || Object.keys(rs).length != mod.rskeys.length) {
		throw "Incorrect assignment on armour mod type " + type
	}
	mod.pckeys.forEach(function (pckey) {
		if (ps[pckey]) armour.percentages[pckey] += (ps[pckey] + UFX.random(-0.5, 0.5)) * 10
	})
	mod.rskeys.forEach(function (rskey) {
		if (rs[rskey]) armour.resistances[rskey] += (rs[rskey] + UFX.random(-0.5, 0.5)) * 10
	})
	armour.modList.push([type, c])
}

//dict((name, getattr(mod, name).level) for name in dir(mod) if inspect.isclass(getattr(mod, name)) and (issubclass(getattr(mod, name), mod.ArmourMod) or issubclass(getattr(mod, name), mod.WeaponMod)))
var modtypeLevels = {'Mercury': 1, 'FlameRetardant': 1, 'Phoenix': 2, 'Chrome': 1, 'Warriors': 1, 'RapidFire': 1, 'Turtles': 2, 'Elemental': 2, 'Rubber': 1, 'WeaponMod': 1, 'SuperCooled': 1, 'Autofiring': 2, 'Conductive': 1, 'Overlords': 3, 'Overclocked': 1, 'Smart': 2, 'Berserkers': 2, 'Insulated': 1, 'BlastProof': 1, 'Holy': 2, 'Enchanted': 2, 'Asbestos': 1, 'Oiled': 1, 'Chromatic': 2, 'Glass': 1, 'Assault': 2, 'Scoped': 1, 'Inductive': 1, 'Giants': 2, 'Spiky': 1, 'Capacitative': 1, 'Sturdy': 1, 'Wooden': 1, 'Medical': 1, 'BOSS': 3, 'Crystal': 1, 'Iron': 1, 'Lightning': 2, 'Shiny': 1, 'MasterCrafted': 2, 'Energetic': 2, 'Tough': 1, 'Juggernaut': 2, 'Alcoholic': 1, 'Accurate': 1, 'ArmourMod': 1, 'Efficient': 1, 'Mighty': 2, 'HighPowered': 1}


function getWeaponModName(mod) {
	var modtype = mod[0], a = mod[1]
	var cname = ({
		HighPowered: "High-Powered",
		Overclocked: "Over-clocked",
		RapidFire: "Rapid-fire",
		Autofiring: "Auto-firing",
	}[modtype] || modtype) + " "
	var adjs = WEAPON_ADJECTIVES.length
	if (a <= 1) return cname
	if (a <= adjs + 1) return WEAPON_ADJECTIVES[a - 2] + cname
	return WEAPON_ADJECTIVES[adjs-1] + cname + "+" + (a - adjs - 1) + " "
}

function getArmourModName(mod) {
	var modtype = mod[0], cool = mod[1]
	if (modtype == "Giants") return "Giant's+" + cool  // Seems a little strange this one is different....
	var cname = ({
		Turtles: "Turtle's",
		FlameRetardant: "Flame-Retardant",
		Warriors: "Warrior's",
		Berserkers: "Berserker's",
		Overlords: "Overlord's",
	}[modtype] || modtype) + " "
	var adjs = ARMOUR_ADJECTIVES.length
	if (cool > adjs + 1) {
		cname = ARMOUR_ADJECTIVES[adjs-1] + cname
		cool -= adjs + 1
	}
	if (cool <= 1) return cname
	return ARMOUR_ADJECTIVES[cool-2] + cname
}
	


