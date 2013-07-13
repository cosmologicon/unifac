
function EntityIndex(csize) {
	this.ei = {}
	this.max_entity_radius = 0
	this.csize = csize || 1000
}
EntityIndex.prototype = {
	// This is the original function, returns an [x,y] pair
	indexForPos: function (pos) {
		return [Math.floor(pos[0]/this.csize), Math.floor(pos[1]/this.csize)]
	},
	// Convenience function that returns a single index
	indexPos: function (pos) {
		return gridn(Math.floor(pos[0]/this.csize), Math.floor(pos[1]/this.csize))
	},
	add: function (e) {
		var n = this.indexPos(e.pos)
		if (!this.ei[n]) this.ei[n] = {}
		this.ei[n][e.id] = e
		e.indices.push(this)
		this.max_entity_radius = Math.max(this.max_entity_radius, e.r)
	},
	remove: function (e) {
		var that = this
		e.indices = e.indices.filter(function (index) { return index !== that })
		delete this.ei[this.indexPos(e.pos)][e.id]
	},
	addSet: function (es) {
		for (var id in es) { this.add(es[id]) }
	},
	removeSet: function (es) {
		for (var id in es) { this.remove(es[id]) }
	},
	moveEntity: function (e, oldpos, newpos) {
		delete this.ei[this.indexPos(oldpos)][e.id]
		var n = this.indexPos(newpos)
		if (!this.ei[n]) this.ei[n] = {}
		this.ei[n][e.id] = e
	},
	entitiesAt: function (pos) {
		return this.entitesWithin(pos, 0)
	},
	entitiesWithin: function (pos, radius) {
		var tx = pos[0], ty = pos[1], rmax = radius + this.max_entity_radius
		var cmin = this.indexForPos([tx - rmax, ty - rmax]), cxmin = cmin[0], cymin = cmin[1]
		var cmax = this.indexForPos([tx + rmax, ty + rmax]), cxmax = cmax[0], cymax = cmax[1]
		var res = {}
		for (var cx = cxmin ; cx <= cxmax ; ++cx) {
			for (var cy = cymin ; cy <= cymax ; ++cy) {
				var n = gridn(cx, cy), ei = this.ei[n]
				if (!ei) continue
				for (var id in ei) {
					var e = ei[id], dx = e.pos[0] - tx, dy = e.pos[1] - ty, dr = e.r + radius
					if (dx * dx + dy * dy < dr * dr) {
						res[id] = e
					}
				}
			}
		}
		return res
	},
	canMove: function (entity, pos, radius) {
		if (!entity.solid) return true
		// I'm reusing some code here, hope I'm doing it right!
		var es = this.entitiesWithin(pos, radius)
		for (var id in es) {
			if (es[id].solid && es[id] !== entity) return false
		}
		return true
	},
	entitiesWithinRect: function (pos, size, precise) {
		var tx = pos[0], ty = pos[1], rmax = this.max_entity_radius
		var sx = size[0], sy = size[1]
		var cmin = this.indexForPos([tx - rmax, ty - rmax]), cxmin = cmin[0], cymin = cmin[1]
		var cmax = this.indexForPos([tx + sx + rmax, ty + sx + rmax]), cxmax = cmax[0], cymax = cmax[1]
		var res = {}
		for (var cx = cxmin ; cx <= cxmax ; ++cx) {
			for (var cy = cymin ; cy <= cymax ; ++cy) {
				var n = gridn(cx, cy), ei = this.ei[n]
				if (!ei) continue
				for (var id in ei) {
					// Note: precise is always false, so let's make this a little simpler....
					var e = ei[id]
					if (e.pos[0] + e.r > tx && e.pos[0] - e.r < tx + sx + 1 &&
					    e.pos[1] + e.r > ty && e.pos[1] - e.r < ty + sy + 1) {
						res[id] = e
					}
				}
			}
		}
		return res
	},
}


var nentities = 0
function Entity(mission, pos, radius, bearing, solid, name) {
	this.init(mission, pos, radius, bearing, solid, name)
}
Entity.prototype = {
	init: function (mission, pos, radius, bearing, solid, name) {
		this.id = nentities++
		this.mission = mission
		this.pos = pos
		this.r = radius
		this.bearing = bearing || 0
		this.solid = solid === undefined ? true : solid
		this.indices = []
		this.anim_state = null
		this.name = name || "???"
		this.visible = true
	},
	setPos: function (newpos) {
		for (var j = 0 ; j < this.indices.length ; ++j) {
			this.indices[j].moveEntity(this, this.pos, newpos)
		}
		this.pos = newpos
	},
	
	describe: function () {
		return this.name
	},
	die: function () {
		console.log("killing", this.id)
		this.mission.dead[this.id] = this
	},
}

function extend(obj, attribs) {
	var ret = Object.create(obj)
	for (var x in attribs) ret[x] = attribs[x]
	return ret
}




