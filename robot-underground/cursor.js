
function GameCursor(modehandler) {
	this.modehandler = modehandler
	this.entity_under_cursor = null
	this.mode = "walk"
}
GameCursor.prototype = {
	update: function (x, y) {
		if (!this.modehandler) return
		if (!this.modehandler.can_click()) {
			this.mode = "inactive"
			return
		}
		this.mode = "walk"

		var mpos = this.modehandler.get_mouse_world_coordinates()
		var es = this.modehandler.mission.entities.entitiesWithin(mpos, CURSOR_RADIUS)
		var anactor = null, sometreasure = null, anentity = null, theprotag = null
		for (var j = 0 ; j < es.length ; ++j) {
			var e = es[j]
			if (e instanceof Actor) {
				anactor = e
				if (e.hostile) {
					this.entity_under_cursor = e
					this.mode = "fire"
					break
				}
				if (e.talkScript) {
					this.entity_under_cursor = e
					this.mode = "talk"
				}
			}
			if (e instanceof Treasure) {
				sometreasure = e
				
			}
			if (e !== this.modehandler.mission.protag) {
				anentity = e
				continue
			}
			theprotag = e
		}
		if (j == es.length) {
			this.entity_under_cursor = anactor || sometreasure || anentity || theprotag
		}
	},
	draw: function (x, y) {
		if (this.modehandler) {
			this.modehandler.set_mouse(x, y)
		}
		// TODO: self.graphic.draw_at(x-20,y-20,40,self.colour)
	},
}


