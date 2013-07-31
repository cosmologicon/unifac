
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
		var broken = false
		for (var id in es) {
			var e = es[id]
			if (e.isactor) {
				anactor = e
				if (e.hostile) {
					this.entity_under_cursor = e
					this.mode = "fire"
					broken = true
					break
				}
				if (e.talkScript) {
					this.entity_under_cursor = e
					this.mode = "talk"
				}
			}
			if (e.istreasure) {
				sometreasure = e
			}
			if (e !== this.modehandler.mission.protag) {
				anentity = e
				continue
			}
			theprotag = e
		}
		if (!broken) {
			this.entity_under_cursor = anactor || sometreasure || anentity || theprotag
		}
	},
	draw: function () {
		var x = this.modehandler.mouse_x, y = this.modehandler.mouse_y
		graphics.drawcursor(this.mode, x, y, {hud: true})
	},
}


