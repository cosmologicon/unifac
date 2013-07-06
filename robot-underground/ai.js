// Do things a little different than in the python version
// Don't instantiate these, instead call them and set the enemy to this

// Taken from helpers.py
function distanceBetween(first, second) {
	var dx = first.pos[0] - second.pos[0], dy = first.pos[1] - second.pos[1]
	return Math.sqrt(dx * dx + dy * dy)
}

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
		var protagDistance = distanceBetween(this, this.protag)
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

var BlindAI = {
	tick: function () {
		if (this.mission.map.hasLOS(this.pos, this.protag.pos)) {
			StupidAI.tick.apply(this)
		}
	},
}




