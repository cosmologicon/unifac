
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
	
	runScript: function (myScript, delay) {
		if (delay || this.currentScript) {
			this.scriptQueue.push([delay || 0, myScript])
		} else {
			this.currentScript = myScript
			if (myScript.state !== "endConversation") {
				myScript.restart()
			}
			myScript.state = "running"
			this.advanceScript()
		}
	},
	advanceScript: function () {
		if (!this.currentScript) return
		if (this.currentScript.state === "frozen") {
			this.currentScript.freezeTicks--
			if (this.currentScript.freezeTicks <= 0) {
				this.currentScript.state = "running"
			}
		}
		if (this.currentScript.state === "running") {
			this.currentScript.advance()
		}
		switch (this.currentScript.state) {
			case "waitKey": case "waitChoice": break
			case "terminated": case "endConversation": this.currentScript = null ; break
			case "endMission": UFX.scene.swap("missionmode") ; break
			case "endGame": UFX.scene.pop() ; break
		}
	},

	tick: function () {
		if (this.scriptQueue.length && !this.currentScript) {
			this.scriptQueue.sort(function (s1, s2) { return s2[0] - s1[0] })
			if (this.scriptQueue[0][0] <= 0) {
				this.currentScript = this.scriptQueue.shift()[1]
				this.currentScript.state = "running"
			}
			for (var j = 0 ; j < this.scriptQueue.length ; ++j) {
				this.scriptQueue[j][0]--
			}
		}
		this.advanceScript()

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
		var px = pos[0], py = pos[1]
		hostiles.sort(function (item) {
			var dx = px - item.pos[0], dy = py - item.pos[1]
			return dx * dx + dy * dy
		})
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

	actorTalkScript: function (spec, pos, name, stats, bearing, radius) {
		stats = stats || CombatStats(1, 1, 1, 1)
		bearing = bearing || 0
		radius = radius === undefined ? 15 : radius
		var e = new Actor(this, pos, stats, radius, bearing, false, name)
		this.entities.add(e)
		e.setTalkScript(spec)
	},
	enemyDeathScript: function (spec, etype, pos, bearing) {
		var e = makeEnemy(etype, this, pos)
		if (bearing !== undefined) e.bearing = bearing
		this.entities.add(e)
		e.setDeathScript(spec)
	},
	setStartScript: function (script) {
		this.startScript = new Script(script, this)
	},
	setEjectScript: function (script) {
		this.ejectScript = new Script(script, this)
	},
	setClearScript: function (script) {
		this.clearScript = new Script(script, this)
	},

	// I guess this is what this thing does in pyglet
	dispatch_event: function (type) {
		// Not sure if this is necessary, but events handled during the mission's constructor
		//   can fail otherwise if they reference this.mission
		if (this.handler.mission !== this) return
		if (!this.handler[type]) throw "Unable to handle " + type
		var args = Array.prototype.splice.call(arguments, 1)
		this.handler[type].apply(this.handler, args)
	},

}


