
function Enemy() {
}
Enemy.prototype = extend(Actor.prototype, {
	isenemy: true,
	init: function (mission, pos, weapons, stats, guardradius, size, xpvalue, name, bearing,
			explosions, ai, aiargs, dropLevel) { 
		Actor.prototype.init.call(this, mission, pos, stats, size, bearing, true, name)
		this.guardradius = this.mission.map.csize * guardradius
		this.xpvalue = xpvalue
		this.allweapons = weapons
		this.weapon = this.allweapons[0]
		this.protag = this.mission.protag
		this.level = dropLevel || 0
		this.explosions = explosions
		this.ai = ai
		if (ai.init) ai.init.apply(this, aiargs)
	},
	
	tick: function () {
		Actor.prototype.tick.apply(this)
		if (!this.hostile) return
		if (this.protag.currenthp <= 0) return
		for (var j = 0 ; j < this.allweapons.length ; ++j) this.allweapons[j].tick()
		this.ai.tick.apply(this)
	},
	
	// Leaving out getSquad since it doesn't seem to ever be used
	
	dropStuff: function () {
		treasuretables.drop(this.mission, this.pos, this.level)
	},
	
	die: function (allowDrop) {
		if (allowDrop === undefined || allowDrop) this.dropStuff()
		var r = this.r
		for (var n = 0 ; n < this.explosions ; ++n) {
			this.mission.entities.add(new Explosion(this.mission, this.pos, r, n))
			r *= 0.6
		}
		if (this.xpvalue > 0) this.mission.protag.addXp(this.xpvalue)
		// TODO gamelog
		Actor.prototype.die.apply(this)
	},
})

// packs should be an interleaved Array of enemy types + counts eg ["Spider", 4, "Scorpion", 8]
function PackSpawner() {
}
PackSpawner.prototype = extend(Enemy.prototype, {
	init: function (mission, pos, pack, spawnradius) {
		spawnradius = spawnradius || 2
		var ws = []
		for (var j = 0 ; j < pack.length ; j += 2) {
			var etype = pack[j], ecount = pack[j+1]
			ws.push(makeWeapon("Summon", [etype, spawnradius, 0, null, ecount]))
		}
		var speed = mission.protag.stats.speed * 2
		var stats = CombatStats(1, 1, 1, speed)
		Enemy.prototype.init.call(this, mission, pos, ws, stats, 100, 1, 0, "Pack Spawner", 0, 1,
			RangedAI, [0, false, 100, false])
		this.visible = false
		this.solid = false
		this.preferred_dist = PACK_SPAWN_DISTANCE / ws[0].getRange()
	},
	takeDamage: function () {
	},
	isObjective: function () {
		return false
	},
	tick: function () {
		Enemy.prototype.tick.apply(this)
		if (this.allweapons.every(function (w) { return w.supply <= 0 })) {
			this.die()
		}
	},
})


// Only used below in enemyinfo - this is pulled out for readability
var eweapspecs = {
	summonspider: ["Summon", ["Spider", 1.5, 40, 4]],
	accmachgun: ["MachineGun", [], ["Accurate", 5]],
	bosspgun: ["PlasmaGun", [], ["BOSS", 2]],
	bossdrill: ["Drill", [], ["BOSS", 2]],
	bossggun1: ["GatlingGun", [], ["BOSS", 1]],
	bossggun2: ["GatlingGun", [], ["BOSS", 2]],
	bossrlaunch: ["RocketLauncher", [], ["BOSS", 2]],
	hprailgun: ["Railgun", [], ["HighPowered", 10]],
	montaser: ["Taser", [], ["Scoped", 10]],
	summonmin: ["Summon", ["Minument", 5, 250, 3]],
	summonmc: ["Summon", ["MicroCopter", 1.5, 150, 3, 6]],
	summonsd: ["Summon", ["SentryDroid", 2.5, 25, 6, 12]],
	bossnjstar2: ["NinjaStarLauncher", [], ["BOSS", 2]],
	bossnjstar5: ["NinjaStarLauncher", [], ["BOSS", 5]],
}
// allweapons, [attack, defence, hp, speed], guardradius, size, xpvalue, dropLevel, explosions,
//  ai, aiargs, resistances [laser physical fire electric explosion], 
var enemyinfo = {
	// Insect subclasses - base resistances: [50, 0, -50, 0, 0]
	Spider: [["WimpyClaw"], [1, 2, 5, 4], 4, 15, 8, 1, 1, BlindAI, [], [50, 0, -50, 0, 0]],
	Scorpion: [["WimpyClaw"], [2, 3, 5, 3], 4, 25, 8, 1, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	StagBeetle: [["WimpyClaw"], [7, 5, 10, 4], 5, 25, 16, 3, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	SpiderQueen: [[eweapspecs.summonspider], [1, 9, 25, 4], 12, 30, 32, 5, 1, SneakyAI, [1], [70, 0, -50, 0, 0]],
	FireScorpion: [["Flamethrower"], [5, 9, 25, 4], 4, 20, 64, 6, 1, BlindAI, [], [50, 0, 50, 0, 0]],
	GreaterFireScorpion: [["NapalmThrower"], [5, 15, 50, 4], 5, 40, 1024, 11, 1, RangedAI, [], [50, 0, 50, 0, 0]],
	JadeBeetle: [["Drill"], [10, 15, 30, 5], 5, 25, 512, 10, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	NinjaSpider: [["NinjaStarLauncher"], [8, 15, 20, 6], 8, 20, 1024, 10, 1, SneakyAI, [], [50, 0, -50, 0, 0]],
	Bat: [[eweapspecs.accmachgun], [10, 10, 50, 7], 5, 40, 16384, 10, 1, DroneAI, [75, 20, true], [50, 0, -50, 0, 0]],
	MoonSpider: [["PlasmaGun"], [5, 10, 150, 4], 5, 25, 32768, 15, 1, RangedAI, [], [50, 0, -50, 0, 0]],
	FlameAvatar: [["NapalmThrower"], [25, 30, 200, 5], 5, 40, 262144, 18, 1, RangedAI, [], [50, 0, 250, 0, 0]],
	Arachne: [[eweapspecs.bosspgun], [35, 50, 500, 7], 5, 30, 1<<22, 25, 1, StupidAI, [], [50, 300, -50, 0, 0]],
	IntimidatingScorpion: [["PopGun"], [4, 4, 10, 2], 6, 40, 64, 2, 3, RangedAI, [], [20, 0, 0, 0, 0]],
	SmallScorpion: [["WimpyClaw"], [2, 3, 3, 4], 4, 20, 4, 1, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	TinyScorpion: [["WimpyClaw"], [1, 1, 1, 5], 4, 15, 2, 1, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	// Note: in the original, Variety Spiders do not show HP when targeted. Seems like this is just a bug.
	VarietySpiderR: [["NapalmThrower"], [7, 30, 44, 5], 5, 20, 65536, 18, 1, RangedAI, [], [0, 0, 300, 0, 0]],
	VarietySpiderY: [["LightningGun"], [7, 30, 44, 5], 5, 20, 65536, 18, 1, RangedAI, [], [0, 0, 0, 300, 0]],
	VarietySpiderG: [["PlasmaGun"], [7, 30, 44, 5], 5, 20, 65536, 18, 1, RangedAI, [], [0, 300, 0, 0, 300]],
	VarietySpiderB: [["UberLaser"], [3, 30, 44, 5], 5, 20, 65536, 18, 1, RangedAI, [], [300, 0, 0, 0, 0]],

	// Drone subclasses - base resistances: [0, 0, 50, -50, 0]
	SpikeDrone: [["LightLaser"], [6, 5, 3, 7], 8, 10, 8, 2, 1, DroneAI, [], [0, 0, 50, -50, 0]],
	BladeDrone: [["WimpyClaw"], [10, 7, 9, 4], 6, 10, 16, 4, 1, StupidAI, [], [0, 0, 50, -50, 0]],
	SawDrone: [["HeavyLaser"], [10, 15, 40, 5], 7, 15, 1024, 11, 1, DroneAI, [], [0, 0, 50, -50, 0]],
	JusticeDrone: [["UberLaser"], [4, 15, 30, 7], 6, 20, 32768, 14, 1, DroneAI, [], [0, 0, 50, -50, 0]],
	InjusticeDrone: [["RocketLauncher"], [10, 30, 150, 4], 5, 40, 262144, 18, 1, RangedAI, [], [0, 0, 50, -50, 300]],
	GiantBladeDrone: [[eweapspecs.bossdrill], [15, 30, 150, 4], 5, 40, 262144, 18, 1, StupidAI, [], [0, 300, 50, -50, 0]],
	NinjaDrone: [[eweapspecs.bossggun2], [20, 50, 500, 5], 5, 30, 1<<22, 25, 1, RangedAI, [], [0, 300, 50, -50, 0]],
	MiniSawDroneCW: [["HeavyLaser"], [3, 15, 10, 6], 7, 10, 256, 8, 1, DroneAI, [120, 50], [0, 0, 50, -50, 0]],
	MiniSawDroneCCW: [["HeavyLaser"], [3, 15, 10, 6], 7, 10, 256, 8, 1, DroneAI, [60, 25], [0, 0, 50, -50, 0]],
	
	// Tank subclasses - base resistances: [0, 50, 0, 0, -50]
	MiniTank: [[["LightLaser"], ["PopGun"]], [7, 5, 10, 3], 5, 12, 16, 3, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	MachineGunTank: [["MachineGun"], [15, 8, 25, 3], 5, 20, 128, 7, 1, RangedAI, [], [20, 70, 20, 20, -30]],
	DrillTank: [["Drill"], [5, 12, 20, 5], 6, 20, 128, 8, 1, StupidAI, [], [0, 50, 0, 0, -50]],
	HeavyTank: [["HeavyLaser"], [7, 15, 25, 4], 5, 30, 256, 9, 1, RangedAI, [], [30, 50, -20, -20, 50]],
	TownTank: [[eweapspecs.hprailgun], [4, 50, 100, 5], 6, 30, 4096, 8, 1, StupidAI, [], [0, 50, 0, 0, -50]],
	RailgunTank: [["Railgun"], [4, 20, 50, 5], 6, 30, 16384, 13, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	RocketTank: [["RocketLauncher"], [2, 15, 50, 5], 6, 30, 16384, 14, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	PincerTank: [["Drill"], [15, 20, 50, 5], 5, 35, 32768, 15, 1, StupidAI, [], [0, 50, 0, 0, -50]],
	TerrorTank: [["UberLaser"], [15, 40, 150, 4], 5, 40, 262144, 18, 1, RangedAI, [], [300, 50, 0, 0, -50]],
	SuperRocketTank: [[eweapspecs.bossrlaunch], [35, 50, 500, 7], 5, 30, 1<<22, 25, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	RedTank: [["Flamethrower", "LightLaser"], [1, 5, 10, 5], 5, 12, 16, 3, 1, RangedAI, [], [0, 50, 0, 0, -50]],
	
	// Military subclasses - base resistances: [-50, 0, 0, 0, 50]
	SentryDroid: [["NinjaStarLauncher"], [8, 10, 20, 7], 10, 15, 128, 7, 1, SneakyAI, [0.5], [-50, 0, 0, 0, 50]],
	MechDroid: [["LightningGun"], [4, 20, 50, 4], 5, 30, 2048, 11, 1, StupidAI, [], [-50, 0, 0, 0, 50]],
	Copter: [["GatlingGun"], [4, 10, 100, 5], 5, 35, 8192, 12, 1, RangedAI, [], [-50, 0, 0, 0, 50]],
	WarChopper: [[eweapspecs.bossggun1], [8, 30, 200, 5], 5, 40, 262144, 18, 1, RangedAI, [], [-50, 300, 0, 0, 50]],
	CombatDroidZero: [[eweapspecs.bossnjstar2], [15, 20, 200, 7], 5, 30, 262144, 18, 1, SneakyAI, [], [-50, 300, 0, 0, 50]],
	AssassinDroid: [[eweapspecs.bossnjstar5], [35, 50, 500, 3], 5, 20, 1<<22, 25, 1, SneakyAI, [0.9, 100, true], [-50, 300, 0, 0, 50]],
	SupportCopter: [["GatlingGun", eweapspecs.summonmc, eweapspecs.summonsd],
		[1, 15, 100, 2], 5, 40, 16384, 12, 1, SneakyAI, [1], [-50, 0, 0, 0, 50]],
	MicroCopter: [["GatlingGun"], [2, 10, 20, 5], 5, 20, 4096, 10, 1, RangedAI, [], [-50, 0, 0, 0, 50]],

	// Direct subclasses of Enemy (mostly bosses)
	Minument: [["Taser"], [6, 10, 20, 3], 8, 25, 32, 4, 3, DroneAI, [], [25, -25, 0, 0, 0]],
	Monument: [[eweapspecs.montaser, eweapspecs.summonmin], [12, 10, 50, 2], 8, 75, 512, 6, 3, RangedAI, [], [25, -25, 0, 0, 0]],
	Arsenal: [[
		["MachineGun", [], ["Accurate", 5]],
		["HomingMissileLauncher"],
		["Flamethrower", [], ["Accurate", 5]],
		["Taser", [], ["Accurate", 5]],
		["HeavyLaser"],
	], [10, 15, 200, 2], 8, 75, 4096, 10, 3, RangedAI, [], [25, 25, 25, -25, 25]],
	Chalfont: [["MachineGun", "LightLaser"], [10, 5, 100, 10], 8, 10, 2048, 10, 3, DroneAI, [], [0, 0, 0, -100, 100]],
	Latimer: [["LightningGun"], [5, 5, 100, 4], 8, 15, 4096, 10, 3, RangedAI, [], [-50, 0, 50, 0, 0]],
	Goldhawk: [["GatlingGun", "Cannon", ["Shotgun", [], ["BOSS", 3]]],
		[4, 25, 150, 3], 8, 15, 32768, 14, 3, DroneAI, [60, 40, true], [0, 0, 0, 0, 0]],
	Hyde: [[
		["Drill", [], ["BOSS", 3, "Accurate", 1]],
		["Summon", ["Bat", 40, 10]],
	], [12, 50, 300, 8], 8, 100, 131072, 15, 3, StupidAI, [], [0, 0, 0, 0, 0]],
	ChalfontAndLatimer: [["LightningGun", ["HeavyLaser", [], ["BOSS", 2]]],
		[13, 50, 300, 10], 10, 25, 524288, 17, 1, DroneAI, [60, 15, true], [0, 0, 0, 0, 0]],
	GoldhawkReloaded: [[
		["GatlingGun", [], ["HighPowered", [], -8]],
		["Shotgun", [], ["BOSS", 2]],
		["RocketLauncher", [], ["BOSS", 2, "SuperCooled", 20]],
	], [9, 40, 500, 3], 8, 15, 1048576*4, 20, 3, DroneAI, [80, 30, true], [0, 0, 0, 0, 0]],
	Hornchurch: [[
		["LightLaser"],
		["Summon", ["Copter", null, 100]],
		["Summon", ["RailgunTank", null, 150]],
		["Summon", ["MoonSpider", null, 200]],
		["Summon", ["CombatDroidZero", null, 300]],
	], [1, 30, 200, 6], 12, 15, 2049152*4, 20, 3, SneakyAI, [1, 100, 20], [-50, 0, 50, 0, 0]],
	RoboCherub: [["Taser"], [5, 10, 100, 7], 8, 10, 32768, 0, 2, DroneAI, [80, 30], [0, 0, 0, 0, 0]],
	RoboSeraph: [["Taser"], [5, 10, 100, 7], 8, 10, 32768, 0, 2, DroneAI, [80, 30], [0, 0, 0, 0, 0]],
	StPancras: [[
		["UberLaser", [], ["BOSS", 1]],
		["Summon", ["RoboCherub", 1.5, 1, 4]],
		["Summon", ["RoboSeraph", 1.5, 1, 4]],
	], [10, 40, 1000, 4], 8, 50, 1, 24, 3, RangedAI, [], [0, 0, 0, 0, 0]],
	Pimlico: [[
		["UberLaser", [], ["BOSS", 3]],
		["GatlingGun", [], ["BOSS", 3]],
		["PlasmaGun", [], ["BOSS", 3]],
		["NapalmThrower", [], ["BOSS", 3]],
		["Railgun", [], ["BOSS", 3]],
		["RocketLauncher", [], ["BOSS", 3]],
	], [30, 100, 2500, 1000], 6, 15, 4294967296, 50, 3, DroneAI, [200, 60], [0, 0, 0, 0, 0]],
}
var enemynameinfo = {
	SmallScorpion: "Scorpion",
	TinyScorpion: "Scorpion",
	TownTank: "Railgun Tank",
	MiniSawDroneCW: "Mini Saw Drone (Clockwise)",
	MiniSawDroneCCW: "Mini Saw Drone (Counter-Clockwise)",
	ChalfontAndLatimer: "Chalfont/Latimer Fusion",
	GoldhawkReloaded: "Goldhawk",
	Hornchurch: "Robo-Pope Hornchurch 0x0D",
	RoboCherub: "Robo-Cherub",
	RoboSeraph: "Robo-Seraph",
	StPancras: "St. Pancras",
}
var packinfo = {
	ScorpionPack: ["Scorpion", 2, "SmallScorpion", 3, "TinyScorpion", 6],
	TankPack: ["MachineGunTank", 3, "HeavyTank", 1, "RedTank", 6],
	SawDronePack: ["SawDrone", 2, "MiniSawDroneCW", 6, "MiniSawDroneCCW", 6],
	SupportCopterPack: ["SupportCopter", 2, "Copter", 4, "MechDroid", 4],
	VarietySpiderPack: ["VarietySpiderR", 3, "VarietySpiderY", 3, "VarietySpiderG", 3, "VarietySpiderB", 3],
}

function makeEnemy(type, mission, pos, bearing) {
	if (type in enemyinfo) {
		var enemy = new Enemy()
		var info = enemyinfo[type], weaponspecs = info[0], stats = info[1], guardradius = info[2]
		var size = info[3], xpvalue = info[4], dropLevel = info[5], explosions = info[6]
		var ai = info[7], aiargs = info[8], resists = info[9]
		var name = enemynameinfo[type] || splitcap(type)
		var weapons = weaponspecs.map(makeWeapon)
		stats = CombatStats.apply(null, stats)
		enemy.init(mission, pos, weapons, stats, guardradius, size, xpvalue, name, bearing,
			explosions, ai, aiargs, dropLevel)
		enemy.resistances[Damage.laser] += resists[0]
		enemy.resistances[Damage.physical] += resists[1]
		enemy.resistances[Damage.fire] += resists[2]
		enemy.resistances[Damage.electric] += resists[3]
		enemy.resistances[Damage.explosion] += resists[4]
	} else if (type in packinfo) {
		var enemy = new PackSpawner()
		enemy.init(mission, pos, packinfo[type])
	} else {
		throw "Unknown enemy type: " + type
	}
	return enemy
}


// Mines moved from actor.py - seems more appropriate here
// I moved some stuff around between Mine, ProximityMine, and TimedMine constructors
function Mine() {
}
Mine.prototype = extend(Enemy.prototype, {
	dontlogdamage: true,
	init: function (owner, damageamt, blast, name, aiclass, aiargs) {
		var weap = makeWeapon(["SuicideBomb", [damageamt, Damage.explosion, blast]])
		var stats = CombatStats(1, 1, 1, 0)  // speed = 0 always
		Enemy.prototype.init.call(this, owner.mission, owner.pos, [weap], stats, 20, 10, 0, name,
			owner.bearing, 0, aiclass, aiargs)
		this.solid = false
	},
	
	die: function () {
		var mine = this, mission = this.mission
		this.allweapons.forEach(function (w) {
			w.fire(mine, null)
			mission.dispatch_event("on_explode", mine)
		})
		Enemy.prototype.die.call(this)
	},

	isObjective: function () {
		return false
	},
})

// A bit of a special case
// Inherits from Mine, but constructed with makeProjectile
function HomingMissile() {
}
HomingMissile.prototype = extend(Mine.prototype, {
	init: function (owner, bearing, damageamt) {
		var blast = 20, speed = 5
		var weap = makeWeapon(["SuicideBomb", [damageamt, Damage.explosion, blast]])
		var stats = CombatStats(1, 1, 1, speed)
		Enemy.prototype.init.call(this, owner.mission, owner.pos, [weap], stats, 20, 10, 0, "Rocket",
			bearing, 0, HomingAI, [owner])
		this.solid = false
	},
})

function makeMine(type, owner, damageamt, blast, weapid) {
	var mine = new Mine()
	if (type == "ProximityMine") {
		mine.init(owner, damageamt, blast, "Proximity Mine", ProximityMineAI, [owner])
	} else if (type == "TimedMine") {
		mine.init(owner, damageamt, blast, "Timed Mine", TimedMineAI, [120])
	}
	// Mine's weapon's kills are actually credited to the mine layer
	mine.weapon.id = weapid
	return mine
}






