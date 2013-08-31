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


function applyWeaponMod(weapon, type, a) {  // a = awesomeness
	var pcs = { damage: 0, range: 0, energy: 0, rate: 0 }, afire = false, name = type
	switch (type) {
		case "Smart": afire = true ; break
		case "HighPowered": pcs.damage = a ; name = "High-Powered" ; break
		case "Accurate": pcs.range = a ; break
		case "Efficient": ps.energy = -a ; break
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
	for (var t in pcs) weapon.percentages[type] += pcs[t]
	if (afire) {
		weapon.canAutofire = true
		weapon.mode = "Autofire"
	}
	weapon.modList.push([name, a])
}

/*
GatlingGun
Bazooka().applyMod(mod.Scoped(10))
weapon.WimpyClaw(),
weapon.LightLaser(),
weapon.PopGun()
weapon.Summon(Spider, 1.5, 40, 4)
weapon.Flamethrower(),
weapon.MachineGun(),
weapon.Drill(),
weapon.HeavyLaser(),
weapon.NinjaStarLauncher(),
weapon.NapalmThrower(),
weapon.Railgun().applyMod(mod.HighPowered(10)),
weapon.MachineGun().applyMod(mod.Accurate(5)),
weapon.LightningGun(),
weapon.RocketLauncher(),
weapon.UberLaser(),
weapon.PlasmaGun(),
weapon.RocketLauncher(),
weapon.Drill().applyMod(mod.BOSS(2)),
weapon.UberLaser(),
weapon.GatlingGun().applyMod(mod.BOSS(1)),
weapon.NinjaStarLauncher().applyMod(mod.BOSS(2)),
weapon.RocketLauncher().applyMod(mod.BOSS(2)),
weapon.NinjaStarLauncher().applyMod(mod.BOSS(5)),
weapon.GatlingGun().applyMod(mod.BOSS(2)),
weapon.PlasmaGun().applyMod(mod.BOSS(2)),
weapon.Taser(),
weapon.Taser().applyMod(mod.Scoped(10)),
weapon.Summon(Minument, range=5, cooldowntime=250, limit=3)
weapon.MachineGun().applyMod(mod.Accurate(5)),
weapon.HomingMissileLauncher(), 
weapon.Flamethrower().applyMod(mod.Accurate(5))
weapon.Taser().applyMod(mod.Accurate(5))
weapon.Shotgun().applyMod(mod.BOSS(3))
weapon.Drill().applyMod(mod.BOSS(3)).applyMod(mod.Accurate(1))
weapon.Summon(Bat, cooldowntime=40, limit=10)
weapon.HeavyLaser().applyMod(mod.BOSS(2))
weapon.GatlingGun().applyMod(mod.HighPowered(-8))
weapon.Shotgun().applyMod(mod.BOSS(2))
weapon.RocketLauncher().applyMod(mod.BOSS(2)).applyMod(mod.SuperCooled(20))
weapon.Summon(Copter, cooldowntime=100)
weapon.Summon(RailgunTank, cooldowntime=150)
weapon.Summon(MoonSpider, cooldowntime=200)
weapon.Summon(CombatDroidZero, cooldowntime=300)
weapon.UberLaser().applyMod(mod.BOSS(1))
weapon.Summon(RoboCherub, range=1.5, cooldowntime=1, limit=4)
weapon.Summon(RoboSeraph, range=1.5, cooldowntime=1, limit=4)
weapon.UberLaser().applyMod(mod.BOSS(3))
weapon.GatlingGun().applyMod(mod.BOSS(3))
weapon.PlasmaGun().applyMod(mod.BOSS(3))
weapon.NapalmThrower().applyMod(mod.BOSS(3))
weapon.Railgun().applyMod(mod.BOSS(3))
weapon.RocketLauncher().applyMod(mod.BOSS(3))
weapon.Summon(MicroCopter, 1.5, 150, limit=3, supply=6)
weapon.Summon(SentryDroid, 2.5, 25, limit=6, supply=12)

*/








