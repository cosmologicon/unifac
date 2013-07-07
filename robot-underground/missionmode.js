
UFX.scenes.missionmode = {
	start: function () {
		// TODO: scripts, inventory, hud, dialogue, etc.
		
		this.mission = new Mission(this)
		this.walls = this.mission.map.getWalls()
		this.world_chunks = {}
		// TODO: should this be updated if the window is resized? Does it even need to depend on scr_w/h?
		this.world_chunk_x = Math.ceil(settings.scr_w / this.mission.map.csize)
		this.world_chunk_y = Math.ceil(settings.scr_h / this.mission.map.csize)
		this.new_xp = 0
		this.new_xp_delay = 0
		this.last_get_float = 0
		
		this.frameno = 0
		this.current_zoom = 1.0
		this.desired_zoom = 1.0
		this.current_hud_zoom = 1.0
		this.desired_hud_zoom = 1.0
		this.debug_circles = false
		this.area_mode = false
		
		this.drag_to_move = false
		this.mouse_protected = 0
		this.mouse_x = this.mouse_y = 0
		this.cursor = new GameCursor(this)
		
	},
	
	get_mouse_world_coordinates: function () {
		return this.mouse_to_world(this.mouse_x, this.mouse_y)
	},

	mouse_to_world: function (x, y) {
		var scale = settings.scr_h * this.current_zoom / WORLD_SCREEN_HEIGHT
		return [
			this.mission.protag.pos[0] + (x - settings.scr_w/2) / scale,
			this.mission.protag.pos[1] + (y - settings.scr_h/2) / scale,
		]
	},
	
	set_mouse: function (x, y) {
		this.mouse_x = x
		this.mouse_y = y
	},
	
	draw_world: function (minx, miny, maxx, maxy) {
		var cs = this.mission.map.csize
		// TODO: they used int here, which rounds to 0. I think floor is better. verify.
		var mincx = Math.floor(Math.floor(minx/cs - 1) / this.world_chunk_x)
		var mincy = Math.floor(Math.floor(miny/cs - 1) / this.world_chunk_y)
		var maxcx = Math.floor(Math.floor(maxx/cs) / this.world_chunk_x)
		var maxcy = Math.floor(Math.floor(maxy/cs) / this.world_chunk_y)
		for (var cx = mincx ; cx <= maxcx ; ++cx) {
			for (var cy = mincy ; cy <= maxcy ; ++cy) {
				this.draw_world_chunk(cx, cy)
			}
		}
	},
	draw_world_chunk: function (cx, cy) {
		// Draw floor
		var cs = this.mission.map.csize
		for (var dx = 0 ; dx < this.world_chunk_x ; ++dx) {
			var x = dx + this.world_chunk_x * cx
			for (var dy = 0 ; dy < this.world_chunk_y ; ++dy) {
				var y = dy + this.world_chunk_y * cy
				var n = gridn(x, y)
				if (this.mission.map.cells[n]) {
					graphics.drawsprite("scenery.floor1", [.3,.3,.5], x*cs, y*cs, cs, 0)
				}
				if (this.walls[n]) {
					graphics.drawwall(this.walls[n], [0, 0.6, 0.6], x*cs, y*cs, cs)
				}
			}
		}
	},
	make_world_chunk: function(cx, cy) {
		// The original used display lists but webGL doesn't support them. So build a big buffer
		// with all the floor and wall data
		var fdata = imagedata["scenery.floor1"]
		var wallps = [], floorps = []
		for (var dx = 0 ; dx < this.world_chunk_x ; ++dx) {
			var x = dx + this.world_chunk_x * cx
			for (var dy = 0 ; dy < this.world_chunk_y ; ++dy) {
				var y = dy + this.world_chunk_y * cy
				var n = gridn(x, y)
				if (this.mission.map.cells[n]) {
				}
			}
		}
	},

	draw_entity: function (e, pos) {
		pos = pos || e.pos
		// TODO: get colors into saved data
		// TODO: handle turret bearings
		var colour = [0.5, 0.5, 1]
		var sname = {Camden: "robots.overcamden3", Spider: "enemies.spider", Scorpion: "enemies.scorpion1"}
		graphics.drawsprite(sname[e.name], colour, pos[0], pos[1], e.r, e.bearing/57.3) // TODO...
		if (settings.DEBUG) {
			var r = e.r
			graphics.drawsprite("cursors.perfectcircle", [1,1,1], pos[0]-r, pos[1]-r, r*2)
			r += CURSOR_RADIUS
			graphics.drawsprite("cursors.perfectcircle", [0.6, 0.6, 0.6], pos[0]-r, pos[1]-r, r*2)
		}
	},
	draw_entities: function (minx, miny, maxx, maxy) {
		var es = this.mission.entities.entitiesWithinRect([minx, miny], [maxx-minx, maxy-miny])
		for (var id in es) {
			if (es[id].visible) this.draw_entity(es[id])
			// TODO: debug circles
		}
		// TODO: debug circles
		// TODO: area mode
	},

	// ported from MissionMode.ondraw
	draw: function () {
		graphics.clear()
		var w = settings.scr_w, h = settings.scr_h, m = this.mission
		if (!m.currentScript || !m.currentScript.blankScreen) {
			graphics.cx = m.protag.pos[0]
			graphics.cy = m.protag.pos[1]
			graphics.cz = this.current_zoom * h / WORLD_SCREEN_HEIGHT
			var minp = this.mouse_to_world(0, 0), minx = minp[0], miny = minp[1]
			var maxp = this.mouse_to_world(w, h), maxx = maxp[0], maxy = maxp[1]
			this.draw_world(minx, miny, maxx, maxy)
			this.draw_entities(minx, miny, maxx, maxy)
		}
		// TODO: a bunch more drawing functions
	},

	can_click: function () {
		var m = this.mission
		return !(this.mouse_protected > 0 || m.isCutscene || m.currentScript && m.currentScript.state == "frozen")
	},

	
	thinkargs: function (dt) {
		return [dt, UFX.mouse.state(), UFX.key.state()]
	},
	think: function (dt, mstate, kstate) {
		this.cursor.update(this.mouse_x, this.mouse_y)
		this.current_zoom += 0.1 * (this.desired_zoom - this.current_zoom)
		this.current_hud_zoom += 0.05 * (this.desired_hud_zoom - this.current_hud_zoom)
		if (this.mouse_protected > 0) --this.mouse_protected
		// TODO update weapon icons
		// TODO xp delay
		// TODO currentscript
		this.bullets = []
		this.mission.tick()
		
		if (mstate.pos) this.set_mouse(mstate.pos[0], settings.scr_h - mstate.pos[1])
	},
}


