
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


// allweapons, [attack, defence, hp, speed], guardradius, size, xpvalue, dropLevel, explosions,
//  ai, aiargs, resistances [laser physical fire electric explosion], 
var enemyinfo = {
	"Spider": [["WimpyClaw"], [1, 2, 5, 4], 4, 15, 8, 1, 1, BlindAI, [], [50, 0, -50, 0, 0]],
	"Scorpion": [["WimpyClaw"], [2, 3, 5, 3], 4, 25, 8, 1, 1, StupidAI, [], [50, 0, -50, 0, 0]],
	"IntimidatingScorpion": [["PopGun"], [4, 4, 10, 2], 6, 40, 64, 2, 3, RangedAI, [], [20, 0, 0, 0, 0]],
}
for (var etype in enemyinfo) {
	enemyinfo[etype][0] = enemyinfo[etype][0].map(makeWeapon)
	enemyinfo[etype][1] = CombatStats.apply(null, enemyinfo[etype][1])
}


function makeEnemy(type, mission, pos) {
	var info = enemyinfo[type]
	var enemy = new Enemy()
	if (type in enemyinfo) {
		var info = enemyinfo[type], weaponspecs = info[0], stats = info[1], guardradius = info[2]
		var size = info[3], xpvalue = info[4], dropLevel = info[5], explosions = info[6]
		var ai = info[7], aiargs = info[8], resists = info[9]
		var name = splitcap(type)
		var bearing = null
		enemy.init(mission, pos, weaponspecs, stats, guardradius, size, xpvalue, name, bearing,
			explosions, ai, aiargs, dropLevel)
		enemy.resistances[Damage.laser] += resists[0]
		enemy.resistances[Damage.physical] += resists[1]
		enemy.resistances[Damage.fire] += resists[2]
		enemy.resistances[Damage.electric] += resists[3]
		enemy.resistances[Damage.explosion] += resists[4]
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






