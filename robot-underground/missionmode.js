
UFX.scenes.missionmode = {
	start: function () {
		// TODO: scripts, inventory, hud, dialogue, etc.
		
		this.mission = new Mission(this)
		this.walls = this.mission.map.getWalls()
		this.world_chunks = {}
		// Note: this was originally based on the screen size, but I want to have variable screen sizes
		this.world_chunk_x = 8
		this.world_chunk_y = 8
		this.new_xp = 0
		this.new_xp_delay = 0
		this.last_get_float = 0

		this.lasers = {}
		this.lightnings = {}
		this.live_floaties = {}
		this.dead_floaties = {}
		this.bullets = []
		this.claws = {}
		this.trails = []
		
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
		}
		// TODO: debug circles
		// TODO: area mode
	},

	// TODO: draw_weapon_fx, draw_floaties
	
	draw_cursor_shadows: function () {
		var p = this.mission.protag
		if (p.scriptNodes.length) return
		if (p.dest) {
			graphics.drawcursor("walk", p.dest[0], p.dest[1], [0.5, 0.5, 0])
		}
		if (p.targ) {
			graphics.drawcursor("fire", p.targ.pos[0], p.targ.pos[1], [0.5, 0, 0])
		}
		// TODO: edit_npc
	},
	
	// TODO draw_inventory, draw_script

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
			
			this.draw_cursor_shadows()
			this.cursor.draw()  // I'm guessing this is called automatically in pyglet
		}
		// TODO: a bunch more drawing functions
	},

	can_click: function () {
		var m = this.mission
		return !(this.mouse_protected > 0 || m.isCutscene || m.currentScript && m.currentScript.state == "frozen")
	},
	
	// Replaces on_mouse_press, on_mouse_drag, on_mouse_scroll, and on_key_press
	handle_input: function (mstate, kstate) {
		if (mstate.pos) this.set_mouse(mstate.pos[0], settings.scr_h - mstate.pos[1])
		this.cursor.update(this.mouse_x, this.mouse_y)

		if (mstate.left.down) this.on_mouse_press(mstate.pos, kstate.pressed.ctrl)
		if (mstate.right.down) this.on_mouse_press(mstate.pos, true)

		if (mstate.left.drag) this.on_mouse_drag(mstate.pos, mstate.left.drag, kstate.pressed.ctrl)
		if (mstate.right.drag) this.on_mouse_drag(mstate.pos, mstate.right.drag, true)
	},
	on_mouse_press: function (pos, targetonly) {
		this.drag_to_move = false
		var m = this.mission
		// TODO: script and HUD stuff
		var e = this.cursor.entity_under_cursor
		if (e && (e instanceof Actor) && e !== m.protag) {
			m.protag.targ = e
			if (!e.hostile) m.protag.set_dest(e.pos)
		} else if (!targetonly) {
			m.protag.set_dest(this.get_mouse_world_coordinates())
			this.drag_to_move = true
		}
	},
	on_mouse_drag: function (pos, drag, targetonly) {
		// TODO: inventory mode etc
		var m = this.mission
		if (this.drag_to_move && !targetonly) {
			m.protag.set_dest(this.get_mouse_world_coordinates())
		}
	},
	
	on_weapon_fire: function (weapon, shooter, target) {
		if (shooter === this.mission.protag) {
			for (var idx = 0 ; idx < robotstate.weaponry.length ; ++idx) {
				var wpn = robotstate.weaponry[idx]
				if (wpn === weapon) {
//					this.weapon_icons[idx].border = WEAPON_ICON_BORDER_FIRING
//					this.weapon_icons[idx].flashtime = WEAPON_ICON_BORDER_FLASH_FRAMES
				}
			}
		}
		var id = shooter.id + "," + target.id
		switch (weapon.effectname) {
			case Damage.electric:
				this.lightnings[id] = weapon.basecooldown
				playsound("lightning")
				break
			case Damage.physical:
				if (this.frameno - this.last_bullet_sound >= 20) playsound("bullet")
				this.bullets.push([shooter, target])
				break
			case Damage.fire:
				playsound("rifle")
				this.bullets.push([shooter, target])
				break
			case Damage.shotgun:
				playsound("shotgun")
				for (var j = 0 ; j < SHOTGUN_PELLETS ; ++j) this.bullets.push([shooter, target])
				break
			case Damage.laser:
				playsound("shot")
				this.lasers[id] = 5
				break
			case Damage.claw:
				var hand = UFX.random() < 0.5 ? 1 : 0, id = target.id + "|" + hand
				if (id in this.claws) id = target.id + "|" + (1 - hand)
				this.claws[id] = 5
				break
		}
	},
	on_explode: function (exploder) {
		if (exploder.blast) {
			playsound("explosion")
		}
	},
	on_mine_lay: function (owner, mine) {
		playsound("mine_lay")
	},
	on_projectile_fire: function (owner, projectile) {
		// TODO: this horrible hack, probably should key off the projectile name
	},
	on_projectile_move: function (pos, bearing, trailtype) {
		this.trails.push([pos, bearing, trailtype, 10])
	},
	on_gain_xp: function (amount) {
		this.new_xp += amount
		if (this.new_xp_delay <= 0) {
			this.new_xp_delay = XP_AGGREGATE_TIME
		}
	},
	on_damage: function (pos, amount) {
		this.add_floaty(amount.toFixed(1), pos, FLOATY_DAMAGE_COLOUR)
	},
	on_heal: function (pos, amount) {
		this.add_floaty(amount.toFixed(0), pos, FLOATY_HEALING_COLOR, FLOAT_HEAL_DELAY)
	},
	on_pick_up: function () {
		playsound("pickup")
		if (this.frameno - this.last_get_float > PICKUP_AGGREGATE_TIME) {
			this.add_floaty("GET!", this.mission.protag.pos, FLOATY_PICKUP_COLOUR)
		}
	},
	on_time_out: function () {
	},
	on_level_up: function () {
		playsound("level_up")
		this.add_floaty("LEVEL UP!", this.mission.protag.pos, FLOATY_LEVEL_UP_COLOUR, FLOAT_LEVEL_DELAY)
	},
	on_multi_kill: function (pos, n) {
		this.add_floaty(n.toFixed(0) + " HIT!", pos, FLOATY_COMBO_COLOUR, FLOAT_COMBO_DELAY)
	},
	on_portrait_change: function () {
	},
	on_dialogue_change: function () {
		this.dialogue_changed = true
		var s = this.mission.currentScript
		if (s && s.state === "waitChoice") {
			this.mouse_protected = DIALOGUE_CLICK_PROTECTION_FRAMES
			this.choice_mode = true
			this.current_dialogue_menu = s.speakerIsLeft ? this.dialogue_menu_l : this.dialogue_menu_r
			// TODO: dialogue options
		} else {
			this.choice_mode = false
			if (s && s.state === "waitKey") {
				this.mouse_protected = DIALOGUE_CLICK_PROTECTION_FRAMES
			}
		}
	},
	// TODO: on_inventory, on_equipment_change
	on_set_zoom: function (zoom) {
		this.desired_zoom = zoom
	},
	on_stop_mode: function () {
		this.cursor.modehandler = null
	},
	// TODO: weapon_clicked, eject_clicked, update_weapons, close_inventory
	add_floaty: function (text, pos, colour, delay) {
		delay = delay || 0
		// TODO: labels, how do they work?
	},
	
	thinkargs: function (dt) {
		return [dt, UFX.mouse.state(), UFX.key.state()]
	},
	think: function (dt, mstate, kstate) {
		this.handle_input(mstate, kstate)
		this.current_zoom += 0.1 * (this.desired_zoom - this.current_zoom)
		this.current_hud_zoom += 0.05 * (this.desired_hud_zoom - this.current_hud_zoom)
		if (this.mouse_protected > 0) --this.mouse_protected
		// TODO update weapon icons
		// TODO xp delay
		// TODO currentscript
		this.bullets = []
		this.mission.tick()
		
	},
}


