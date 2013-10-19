// Do things a little different than in the python version
// Don't instantiate these, instead call them and set the enemy to this

var AI = {
	tick: function () {
		for (var j = 0 ; j < this.allweapons.length ; ++j) {
			if (this.allweapons[j].canFire(this, this.protag)) {
				this.allweapons[j].fire(this, this.protag)
			}
		}
	},
}

var StupidAI = {
	tick: function () {
		AI.tick.apply(this)
		var protagDistance = distanceBetween(this.pos, this.protag.pos)
		if (protagDistance <= this.weapon.getRange() / 2) {
			if (this.mission.map.hasLOS(this.pos, this.protag.pos)) {
				this.dest = null
			}
		}
		if (protagDistance < this.guardradius || this.currenthp < this.getMaxHP()) {
			if (protagDistance > this.weapon.getRange() || !this.mission.map.hasLOS(this.pos, this.protag.pos)) {
				this.set_dest(this.protag.pos)
			}
		}
	},
}

// TODO TurretAI DroneAI

var SneakyAI = {
	init: function (ninjosity, movelength, wait_time) {
		this.ninjosity = ninjosity === undefined ? 0.9 : ninjosity
		this.movelength = movelength === undefined ? 100 : movelength
		this.wait_time = wait_time === undefined ? 30 : wait_time
		this.counter = 0
	},
	tick: function () {
		AI.tick.apply(this)
		if (this.dest) return
		if (this.counter > 0) {
			--this.counter
			return
		}
		protagDistance = distanceBetween(this.pos, this.protag.pos)
		if (protagDistance < this.guardradius || this.currenthp < this.getMaxHP()) {
			var is_brazen = UFX.random() > this.ninjosity
			for (var n = 0 ; n < NINJA_TRIES ; ++n) {
				var x = UFX.random.normal(this.pos[0], this.movelength)
				var y = UFX.random.normal(this.pos[1], this.movelength)
				if (is_brazen == this.mission.map.hasLOS([x, y], this.protag.pos)) break
			}
			this.set_dest([x, y])
			this.counter = this.wait_time
		}
	},
}

var RangedAI = {
	init: function (preferred_dist, aggressive, movelength, always_shoot) {
		this.preferred_dist = preferred_dist === undefined ? 0.9 : preferred_dist
		this.always_shoot = always_shoot === undefined ? true : always_shoot
		this.aggressive = aggressive == undefined ? true : aggressive
		if (this.aggressive) {
			this.ninjosity = 0
			this.movelength = movelength === undefined ? 100 : movelength
			this.wait_time = 0
			this.counter = 0
		}
	},
	tick: function () {
		var protagDistance = distanceBetween(this.pos, this.protag.pos)
		if (this.always_shoot || protagDistance >= this.preferred_dist * this.weapon.getRange()) {
			AI.tick.apply(this)
		}
		if (this.aggressive && !this.mission.map.hasLOS(this.pos, this.protag.pos)) {
			SneakyAI.tick.apply(this)
		} else {
			var ppos = this.protag.pos, px = ppos[0], py = ppos[1]
			if (protagDistance == 0) {
				var x = px + this.preferred_dist * this.weapon.getRange()
				var y = py
				this.set_dest([x, y])
			} else if (protagDistance < this.guardradius) {
				var scale = this.preferred_dist * this.weapon.getRange() / protagDistance
				var x = px + (this.pos[0] - px) * scale
				var y = py + (this.pos[1] - py) * scale
				this.set_dest([x, y])
			}
			this.bearing = 57.3 * Math.atan2(py - this.pos[1], px - this.pos[0])
		}
	},
}

var BlindAI = {
	tick: function () {
		if (this.mission.map.hasLOS(this.pos, this.protag.pos)) {
			StupidAI.tick.apply(this)
		}
	},
}

var ProximityMineAI = {
	init: function (owner) {
		this.owner = owner
	},
	tick: function () {
		var ents = this.mission.entities.entitiesAt(this.pos)
		for (var id in ents) {
			var e = ents[id]
			if (!e.solid || !(e.hostile || e === this.mission.protag)) continue
			if (e !== this.owner && e !== this) {
				this.takeDamage(this.getMaxHP(), Damage.explosion)
				return
			}
		}
	},
}

var TimedMineAI = {
	init: function (timer) {
		this.timer = timer
	},
	tick: function () {
		if (this.timer <= 0) this.takeDamage(this.getMaxHP(), Damage.explosion)
		--this.timer
	},
}

// I'm not going to bother with HomingAI, doesn't seem to be used



