
function Enemy() {
}
Enemy.prototype = extend(Actor.prototype, {
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
	bossggun: ["GatlingGun", [], ["BOSS", 2]],
	bossrlaunch: ["RocketLauncher", [], ["BOSS", 2]],
	hprailgun: ["Railgun", [], ["HighPowered", 10]],
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
	// TODO: VarietySpiders

	// Drone subclasses - base resistances: [0, 0, 50, -50, 0]
	SpikeDrone: [["LightLaser"], [6, 5, 3, 7], 8, 10, 8, 2, 1, DroneAI, [], [0, 0, 50, -50, 0]],
	BladeDrone: [["WimpyClaw"], [10, 7, 9, 4], 6, 10, 16, 4, 1, StupidAI, [], [0, 0, 50, -50, 0]],
	SawDrone: [["HeavyLaser"], [10, 15, 40, 5], 7, 15, 1024, 11, 1, DroneAI, [], [0, 0, 50, -50, 0]],
	JusticeDrone: [["UberLaser"], [4, 15, 30, 7], 6, 20, 32768, 14, 1, DroneAI, [], [0, 0, 50, -50, 0]],
	InjusticeDrone: [["RocketLauncher"], [10, 30, 150, 4], 5, 40, 262144, 18, 1, RangedAI, [], [0, 0, 50, -50, 300]],
	GiantBladeDrone: [[eweapspecs.bossdrill], [15, 30, 150, 4], 5, 40, 262144, 18, 1, StupidAI, [], [0, 300, 50, -50, 0]],
	NinjaDrone: [[eweapspecs.bossggun], [20, 50, 500, 5], 5, 30, 1<<22, 25, 1, RangedAI, [], [0, 300, 50, -50, 0]],
	
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
}
var enemynameinfo = {
	SmallScorpion: "Scorpion",
	TinyScorpion: "Scorpion",
}
var packinfo = {
	ScorpionPack: ["Scorpion", 2, "SmallScorpion", 3, "TinyScorpion", 6],
	TankPack: ["MachineGunTank", 3, "HeavyTank", 1, "RedTank", 6],
	SawDronePack: ["SawDrone", 2, "MiniSawDroneCW", 6, "MiniSawDroneCCW", 6],
	SupportCopterPack: ["SupportCopter", 2, "Copter", 4, "MechDroid", 4],
	VarietySpiderPack: ["VarietySpiderR", 3, "VarietySpiderY", 3, "VarietySpiderG", 3, "VarietySpiderB", 3],
}

// Left out: everything labeled EXPERIMENTAL (below line 1400 in enemies.py)
for (var etype in enemyinfo) {
	enemyinfo[etype][0] = enemyinfo[etype][0].map(makeWeapon)
	enemyinfo[etype][1] = CombatStats.apply(null, enemyinfo[etype][1])
}


function makeEnemy(type, mission, pos, bearing) {
	if (type in enemyinfo) {
		var enemy = new Enemy()
		var info = enemyinfo[type], weaponspecs = info[0], stats = info[1], guardradius = info[2]
		var size = info[3], xpvalue = info[4], dropLevel = info[5], explosions = info[6]
		var ai = info[7], aiargs = info[8], resists = info[9]
		var name = enemynameinfo[type] || splitcap(type)
		enemy.init(mission, pos, weaponspecs, stats, guardradius, size, xpvalue, name, bearing,
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
// HomingMissiles left out - thankfully they don't seem to ever be used
function Mine() {
}
Mine.prototype = extend(Enemy.prototype, {
	init: function (owner, damageamt, blast, name, aiclass, aiargs) {
		var weap = makeWeapon(["SuicideBomb", [damageamt, Damage.explosion, blast]])
		var stats = [1, 1, 1, 0]  // speed = 0 always
		Enemy.prototype.init.call(this, owner.mission, owner.pos, [weap], stats, 20, 10, 0, name,
			owner.bearing, 0, aiclass, aiargs)
		this.solid = false
	},
	
	die: function () {
		var mine = this, mission = this.mission
		this.allweapons.forEach(function (w) {
			w.fire(this, null)
			this.mission.dispatch_event("on_explode", this)
		})
		Enemy.prototype.die.call(this)
	},

	isObjective: function () {
		return false
	},
})

function makeMine(type, owner, damageamt, blast) {
	var mine = new Mine()
	if (type == "ProximityMine") {
		mine.init(owner, damageamt, blast, "Proximity Mine", ProximityMineAI, [owner])
	} else if (type == "TimedMine") {
		mine.init(owner, damageamt, blast, "Timed Mine", TimedMineAI, [120])
	}
	return mine
}






