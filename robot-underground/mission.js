
function Mission(handler) {
	this.handler = handler
	// set map, protag, actors, scripts
	this.dead = {}
	this.born = {}
	
	this.ejectScript = null
	this.startScript = null
	this.clearScript = null
	this.canEject = false
	this.isTimed = false
	this.entities = new EntityIndex()
	this.style = "basic"
	this.scripts = []

	setupMission(plotstate, this)
	
	this.isCutscene = false
	this.scriptQueue = []
	this.currentScript = null
}
Mission.prototype = {	
	addProtagAnywhere: function () {
		return this.addProtag(this.map.getClearSpace())
	},
	addProtag: function (pos) {
		this.protag = new Protag(this, pos)
		this.entities.add(this.protag)
		return this.protag
	},
	// TODO: addScenery, addEntity
	placeEnemiesRandomlyAnywhere: function (enemies, outOfSight) {
		if (outOfSight === undefined) outOfSight = true
		var m = this.map, cells = m.cellkeys.splice(0), p = this.protag.pos
		if (outOfSight) {
			cells = cells.filter(function (n) { return !m.hasLOS(p, m.cellCentre(gridxy(n)))})
		}
		this.placeEnemiesRandomly(enemies, cells)
	},
	placeEnemiesRandomly: function (enemies, unusedCells) {
		UFX.random.shuffle(unusedCells)
		for (var type in enemies) {
			for (var j = 0 ; j < enemies[type] ; ++j) {
				var celln = unusedCells.pop()
				var abspos = this.map.cellCentre(gridxy(celln))
				var newEnemy = makeEnemy(type, this, abspos)
				// squad seems like it's always empty, so ignore it (leave off method placeSquad)
				this.entities.add(newEnemy)
			}
		}
	},
	// TODO: runScript, advanceScript
	tick: function () {
		// TODO script stuff
		if (!this.currentScript) {
			var es = this.entities.entitiesWithin(this.protag.pos, ENTITY_TICK_DISTANCE)
			for (var id in es) { es[id].tick() }
			var clear = this.missionCleared()
			this.entities.removeSet(this.dead)
			this.dead = {}
			for (var id in this.born) {
				this.entities.add(this.born[id])
			}
			if (!clear) {
				if (this.missionCleared() && this.clearScript) {
					this.runScript(this.clearScript)
				}
			}
			this.born = {}
		}
	},
	
	closestHostileTo: function (pos, radius, requireLOS, requireAlive, requireObjective) {
		var hostiles = [], es = this.entities.entitiesWithin(pos, radius)
		for (var id in es) {
			var e = es[id]
			if (!(e instanceof Actor)) continue
			if (!e.hostile) continue
			if (requireObjective && !e.isObjective()) continue
			if (requireAlive && e.currenthp <= 0) continue
			hostiles.push(e)
		}
		if (!hostiles.length) return null
		hostiles.sort(function (item) { return distanceBetween(pos, item.pos) })
		if (!requireLOS) return hostiles[0]
		for (var j = 0 ; j < hostiles.length ; ++j) {
			if (this.map.hasLOS(pos, hostiles[j].pos)) {
				return hostiles[j]
			}
		}
		return null
	},

	missionCleared: function () {
		for (var n in this.entities.ei) {
			for (var id in this.entities.ei[n]) {
				var e = this.entities.ei[n][id]
				if (e instanceof Actor && e.isObjective()) {
					return false
				}
			}
		}
		return true
	},

	getHostileAt: function (pos) {
		var es = this.entities.entitiesAt(pos)
		for (var j = 0 ; j < es.length ; ++j) {
			var e = es[j]
			if (e instanceof Actor && e.hostile) {
				return e
			}
		}
		return null
	},
	
	getActorAt: function (pos, includeprotag) {
		if (includeprotag === undefined) includeprotag = true
		var es = this.entities.entitiesAt(pos)
		for (var j = 0 ; j < es.length ; ++j) {
			var e = es[j]
			if (e instanceof Actor && (includeprotag || e !== this.protag)) {
				return e
			}
		}
		return null
	},
	
	registerScript: function (script) {
		this.scripts.push(script)
	},
	
	actorTalkScript: function (pos, name, stats, bearing, radius) {
		var e = new Actor(pos, stats, radius, bearing, false, name)
		this.entities.add(e)
		return e.setTalkScript
	},
	
	// TODO: enemyDeathScript, setStartScript, setEjectScript, setClearScript	
}


