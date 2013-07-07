

function Actor(mission, pos, stats, radius, bearing, hostile, name) {
	this.init(mission, pos, stats, radius, bearing, hostile, name)
}
Actor.prototype = extend(Entity.prototype, {
	init: function (mission, pos, stats, radius, bearing, hostile, name) {
		if (bearing === undefined) bearing = UFX.random(360)
		if (radius === undefined) radius = 15
		Entity.prototype.init.call(this, mission, pos, radius, bearing, true, name)
		this.stats = stats || CombatStats(1, 1, 1, 5)
		this.currenthp = this.stats.maxhp
		this.hostile = hostile
		this.dest = null
		this.scriptNodes = []
		this.scriptBearing = null
		this.name = name
		this.deathScript = null
		this.talkScript = null
		this.areaScripts = {}
		var r = this.resistances = {}
		mod.rskeys.forEach(function (rskey) { r[Damage[rskey]] = 0 })
		
		this.pendingDamage = 0
		this.pendingDamageCtr = 0
	},

	// TODO: setTalkScript, addAreaScript, setDeathScript
	takeDamage: function (amount, type) {
		if (this.currenthp <= 0) return
		if (!this.hostile && this.mission.protag !== this) return
		amount /= this.getDefense() * (1 + this.getResistance(type)/100)
		this.currenthp -= amount
		if (this.currenthp <= 0) {
			if (this.deathScript) {
				this.mission.runScript(this.deathScript)
			}
			this.mission.dispatch_event("on_damage", this.pos, amount + this.pendingDamage)
			this.pendingDamage = 0
		} else {
			this.pendingDamage += amount
			if (this.pendingDamageCtr == 0) {
				this.pendingDamageCtr = DAMAGE_AGGREGATE_TIME
			}
		}
	},
	kill: function (silent) {
		if (!silent) {
			this.mission.dispatch_event("on_damage", this.pos, this.currenthp + this.pendingDamage)
		}
		this.currenthp = 0
		this.die()
	},
	set_dest: function (dest) {
		this.dest = dest
		var dx = dest[0] - this.pos[0], dy = dest[1] - this.pos[1]
		this.bearing = 57.3 * Math.atan2(dy, dx)
	},
	move: function (tripScripts) {
		if (tripScripts === undefined) tripScripts = true
		var m = this.mission, e = this
		function unobstructed(pos) {
			return m.map.circleClear(pos, e.r) && m.entities.canMove(e, pos, e.r)
		}
		if (this.dest) {
			var totalspeed = this.getSpeed()
			while (totalspeed) {
				if (!this.dest) break
				var dx = this.dest[0] - this.pos[0], dy = this.dest[1] - this.pos[1]
				var dist = Math.sqrt(dx*dx + dy*dy)
				var step = Math.min(totalspeed, MOVEMENT_STEP)
				totalspeed -= step
				if (dist <= step) {
					var newpos = this.dest
					this.dest = null
				} else {
					var newpos = [this.pos[0] + dx * step/dist, this.pos[1] + dy * step/dist]
				}
				if (unobstructed(newpos)) {
					this.realMove(newpos, tripScripts)
				} else {  // try sliding horizontally
					newpos = [this.pos[0] + ((dx>0)-(dx<0))*Math.min(step,Math.abs(dx)), this.pos[1]]
					if (dx && unobstructed(newpos)) {
						this.realMove(newpos, tripScripts)
					} else {  // try sliding vertically
						newpos = [this.pos[0], this.pos[1] + ((dy>0)-(dy<0))*Math.min(step,Math.abs(dy))]
						if (dy && unobstructed(newpos)) {
							this.realMove(newpos, tripScripts)
						} else {  // give up
							this.dest = null
						}
					}
				}
			}
		}
	},

	realMove: function (newpos, tripScripts) {
		if (!tripScripts) {
			this.setPos(newpos)
			return
		}
		var denied = false
		// TODO: handle areaScripts
		if (denied) {
			this.dest = null
		} else {
			this.setPos(newpos)
		}
	},
	
	// TODO: scriptMove, setScriptPath, describe
	
	tick: function () {
		if (this.scriptNodes.length) {
			this.scriptMove()
		} else {
			this.move()
		}
		if (this.pendingDamageCtr > 0) {
			this.pendingDamageCtr -= 1
			if (this.pendingDamageCtr <= 0) {
				this.mission.dispatch_event("on_damage", this.pos, this.pendingDamage)
				this.pendingDamage = 0
			}
		}
	},
	
	die: function () {
		this.mission.dispatch_event("on_destroy")
		Entity.prototype.die.apply(this)
	},
	
	heal: function (amount) {
		this.currenthp += amount
		this.mission.dispatch_event("on_heal", this.pos, amount)
	},
	
	getAttack: function () { return this.stats.attack },
	getDefence: function () { return this.stats.defence },
	getMaxHP: function () { return this.stats.maxhp },
	getSpeed: function () { return this.stats.speed },
	getResistance: function (damageType) {
		return 1 + this.resistances[damageType] * 0.01
	},

	isObjective: function () {
		return this.hostile
	},
})

function Protag(mission, pos) {
	this.init(mission, pos)
}
Protag.prototype = extend(Actor.prototype, {
	init: function (mission, pos) {
		Actor.prototype.init.call(this, mission, pos, robotstate.stats, PROTAGONIST_RADIUS, 0, false, "Camden")
		this.robotstate = robotstate
		this.weaponry = this.robotstate.weaponry
		this.currentEnergy = this.robotstate.getMaxEnergy()
		this.currenthp = this.robotstate.getMaxHP()
		this.targ = null
		this.numticks = 0
		this.explosions = 2
		this.anim_state = "static"
		
		// TODO: setDeathScript
	},
	move: function (tripScripts) {
		if (tripScripts === undefined) tripScripts = true
		if (this.targ && !this.targ.hostile) {
			var dx = this.pos[0] - this.targ.pos[0], dy = this.pos[1] - this.targ.pos[1]
			var dr = PROTAGONIST_TALKRANGE + this.targ.r
			if (dx * dx + dy * dy < dr * dr) return
		}
		Actor.prototype.move.call(this, tripScripts)
		var localStuff = this.mission.entities.entitiesWithin(this.pos, this.r)
		for (var j = 0 ; j < localStuff.length ; ++j) {
			var thing = localStuff[j]
			if (thing instanceof Treasure) {
				thing.pickUp()
				if (thing.pickUpScript) {
					this.mission.runScript(thing.pickUpScript)
				}
			}
		}
	},
	tick: function () {
		Actor.prototype.tick.call(this)
		this.numticks++
		// TODO: gamelog
		if (this.numticks == ROBOT_DUNGEON_TIME_LIMIT && this.mission.isTimed) {
			this.mission.dispatch_event("on_time_out")
		} else if (this.numticks < ROBOT_DUNGEON_TIME_LIMIT || !this.mission.isTimed) {
			this.currentEnergy = Math.min(this.robotstate.getMaxEnergy(),
				this.currentEnergy + this.robotstate.getEnergyRegen())
		}
		this.weaponry.forEach(function (w) { if (w) w.tick() })
		this.attack()
		if (this.targ && !this.targ.hostile) {
			var dx = this.pos[0] - this.targ.pos[0], dy = this.pos[1] - this.targ.pos[1]
			var dr = PROTAGONIST_TALKRANGE + this.targ.r
			if (dx * dx + dy * dy < dr * dr) {
				if (this.targ.talkScript) {
					// TODO: gamelog
					this.mission.runScript(this.targ.talkScript)
				}
			} else {
				if (!this.dest || this.dest !== this.targ.pos) {
					// Have hit a wall and failed, or changed mind
					this.targ = null
				}
			}
		}
		this.anim_state = this.dest ? "walking" : "static"
	},
	
	attack: function () {
		if (this.targ && this.targ.currenthp <= 0) {
			this.targ = null
		}
		for (var j = 0 ; j < this.weaponry.length ; ++j) {
			var w = this.weaponry[j]
			if (!w) continue
		}
		// TODO: finish this method
	},
	
	heal: function (amount) {
		Actor.prototype.heal.call(this, amount)
		this.currenthp = Math.min(currenthp, this.getMaxHP())
	},
	
	getAttack: function () { return this.robotstate.getAttack() },
	getDefense: function () { return this.robotstate.getDefense() },
	getMaxHP: function () { return this.robotstate.getMaxHP() },
	getSpeed: function () { return this.robotstate.getSpeed() },
	getResistance: function (damageType) {
		return this.robotstate.getResistance(damageType)
	},
	
	addXp: function (xpvalue) {
		var levelled_up = robotstate.addXP(xpvalue)
		this.mission.dispatch_event("on_gain_xp", xpvalue)
		if (levelled_up) {
			this.mission.dispatch_event("on_level_up")
			this.heal(robotstate.stats.maxhp)
		}
	},

	die: function () {
		var r = this.r * this.r
		for (var n = 0 ; n < this.explosions ; ++n) {
			this.mission.entities.add(new Explosion(this.mission, this.pos, r, n))
			r *= 0.6
		}
		Actor.prototype.die.apply(this)
	},
})



