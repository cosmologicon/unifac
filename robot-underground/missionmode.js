
UFX.scenes.missionmode = {
	start: function () {
		this.mission = new Mission()
		
		this.world_chunks = {}
		// TODO: should this be updated if the window is resized? Does it even need to depend on scr_w/h?
		this.world_chunk_x = Math.ceil(constants.scr_w / this.mission.map.csize)
		this.world_chunk_y = Math.ceil(constants.scr_h / this.mission.map.csize)
	},

	mouse_to_world: function (x, y) {
		return [
			this.mission.protag.pos[0] + (x - constants.scr_w/2) / scale,
			this.mission.protag.pos[1] + (y - constants.scr_h/2) / scale,
		]
	},
	
	draw_world: function (minx, miny, maxx, maxy) {
		var cs = this.mission.map.csize
		// TODO: they used int here, which rounds to 0. I think floor is better. verify.
		var mincx = Math.floor(minx/cs - 1) / this.world_chunk_x
		var mincy = Math.floor(miny/cs - 1) / this.world_chunk_y
		var maxcx = Math.floor(maxx/cs) / this.world_chunk_x
		var maxcy = Math.floor(maxy/cs) / this.world_chunk_y
		for (var cx = mincx ; cx <= maxcx ; ++cx) {
			for (var cy = mincy ; cy <= maxcy ; ++cy) {
				this.draw_world_chunk(cx, cy)
			}
		}
	},
	draw_world_chunk: function (cx, cy) {
		// Draw floor
		var cs = this.mission.map.csize
		for (var dx = 0 ; dx < self.world_chunk_x ; ++dx) {
			var x = dx + self.world_chunk_x * cx
			for (var dy = 0 ; dy < self.world_chunk_y ; ++dy) {
				var y = dy + self.world_chunk_y * cy
				var n = gridn(x, y)
				if (this.mission.map.cells[n]) {
//					graphics.drawsprite(
				}
			}
		}


		// TODO: get this caching right once I figure out VBOs
		//var cn = gridn(cx, cy)
		//if (!(cn in this.world_chunks) {
		//}
		//this.wall_chunks[cn].wallps, this.wall_color)
		
	},
	make_world_chunk: function(cx, cy) {
		// The original used display lists but webGL doesn't support them. So build a big buffer
		// with all the floor and wall data
		var fdata = imagedata["scenery.floor1"]
		var wallps = [], floorps = []
		for (var dx = 0 ; dx < self.world_chunk_x ; ++dx) {
			var x = dx + self.world_chunk_x * cx
			for (var dy = 0 ; dy < self.world_chunk_y ; ++dy) {
				var y = dy + self.world_chunk_y * cy
				var n = gridn(x, y)
				if (this.mission.map.cells[n]) {
				}
			}
		}
	},

	// ported from MissionMode.ondraw
	draw: function () {
		graphics.clear()
		var w = canvas.height, h = canvas.height
		if (false) {
			graphics.cx = this.protag.pos[0]
			graphics.cy = this.protag.pos[1]
			graphics.cz = this.current_zoom * h / constants.WORLD_SCREEN_HEIGHT
			var minp = this.mouse_to_world(0, 0), minx = minp[0], miny = minp[1]
			var maxp = this.mouse_to_world(w, h), maxx = maxp[0], maxy = maxp[1]
			this.draw_world(minx, miny, maxx, maxy)
			this.draw_entities(minx, miny, maxx, maxy)
		}
		graphics.cz = 0.1
		graphics.setxform()
		graphics.drawsprite("robots.goldhawk", [0, 0, 1], -200, -500)
	},
}


