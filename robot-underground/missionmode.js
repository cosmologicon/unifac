
UFX.scenes.missionmode = {
	start: function () {
		var scr_h = settings.scr_h, scr_w = settings.scr_w

		// TODO: dialogue boxes dialogue_text_l/r speaker_text_l/r dialogue_menu_l/r
		// TODO: hud_targetinfo_text hud_mouseover_text hud_metal_text 
		this.old_metal = []
		// TODO: hud_stats_text hud_timer_text
		
		this.inventory_mode = false
		// TODO this.inventory_menu = new ScrollingInventoryMenu(...)
		
		var equipment_icons = []
		while (equipment_icons.length < MAX_NUM_WEAPONS + 1) {
			var px = (HUD_MARGIN + (HUD_ICON_SIZE + HUD_SPACING) * equipment_icons.length) * scr_h
			var py = HUD_MARGIN * scr_h
			var sx = HUD_ICON_SIZE * scr_h, sy = sx
			var f = this.weapon_clicked.bind(this, equipment_icons.length)
			equipment_icons.push(new Button(f, px, py, sx, sy, null))
		}
		this.equip_icons = equipment_icons
		this.update_weapons()
		
		var px = scr_w - (HUD_ICON_SIZE + HUD_MARGIN) * scr_h, py = HUD_MARGIN * scr_h
		var sx = HUD_ICON_SIZE * scr_h, sy = sx
		this.eject_icon = new Button(this.eject_clicked.bind(this), px, py, sx, sy, gdata.eject)
		
		this.eject_mode = false
		
		this.choice_mode = false
		// TODO: current_dialogue_menu
		this.portrait_ypos = PORTRAIT_BOTTOM * scr_h
		this.portrait_height = (PORTRAIT_TOP - PORTRAIT_BOTTOM) * scr_h
		this.portrait_width = this.portait_height * PORTRAIT_ASPECT
		this.portrait_l_xpos = PORTRAIT_PAD * scr_h
		this.portrait_r_xpos = scr_w - (PORTRAIT_PAD * scr_h) - this.portrait_width
		this.dialogue_changed = true
		this.dialogue_gutter = BOX_GUTTER * scr_h
		
		this.mission = new Mission(this)
		this.walls = this.mission.map.getWalls()
		this.world_chunks = {}
		this.wall_colour = wall_colours[this.mission.style]
		this.floor_colour = floor_colours[this.mission.style]
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
		
		this.last_bullet_sound = -100
		this.hud_mouseover_target = null
		
		this.hide_hud = false
		this.hud_portrait_ypos = HUD_PORTRAIT_BOTTOM * scr_h
		this.hud_portrait_height = (1 - HUD_MARGIN - HUD_PORTRAIT_BOTTOM) * scr_h
		this.hud_portrait_width = this.hud_portrait_height * HUD_PORTRAIT_ASPECT
		this.hud_portrait_xpos = scr_w - HUD_MARGIN * scr_h - this.hud_portrait_width
		this.mouseover_pad = MOUSEOVER_PAD * scr_h
		
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
		
		if (this.mission.startScript) {
			// TODO: this.mission.runScript(this.mission.startScript)
		}
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
	
	get_hud_mouseover_message: function () {
		var mx = this.mouse_x, my = this.mouse_y
		for (var idx = 0 ; idx < this.weapon_icons.length ; ++idx) {
			var btn = this.weapon_icons[idx]
			if (btn.point_within(mx, my)) {
				if (idx == robotstate.weaponry.length) break
				var wpn = robotstate.weaponry[idx]
				if (wpn) return wpn.description
			}
		}
		
		if (this.armour_icon.point_within(mx, my) && robotstate.armoury)
			return robotstate.armoury.description
		
		if (this.eject_icon.point_within(mx, my) && this.mission.canEject) {
			return this.eject_mode ? "Eject (click to confirm)" : "Eject (click twice to activate)"
		}
		
		var target = this.cursor.entity_under_cursor
		return target ? target.describe() : ""
	},
	
	// TODO: draw_metal draw_mouseover
	
	draw_portrait: function () {
		var protag = this.mission.protag
		var px = this.hud_portrait_xpos, py = this.hud_portrait_ypos
		var sx = this.hud_portrait_width, sy = this.hud_portrait_height
		var health = protag.currenthp / robotstate.getMaxHP()
		graphics.drawhudrect([px, py], [sx, sy], [1, 1, 1, 1], [0, 0, 0, 0.8])
		var colour = [1.0 - health, health, 0.0]
		graphics.drawhud(gdata.portraits.Camden, px, py, sy, {colour: colour})
	},
	
	// TODO: draw_stats draw_targetinfo 
	
	draw_hud: function () {
		var scr_w = settings.scr_w, scr_h = settings.scr_h
		// TODO
		//this.draw_mouseover()
		this.draw_portrait()
		//this.draw_stats()
		//this.draw_metal()
		//this.draw_targetinfo()
		
		//TODO: mission timer
		
		this.weapon_icons.forEach(function (b) { b.draw() })
		this.armour_icon.draw()
		
		if (this.mission.canEject) this.eject_icon.draw()
	},
	
	draw_lightning: function (src, target) {
		var points = [], npoints = Math.floor(0.05 * distanceBetween(src, target)) + 1
		while (points.length < 2 * npoints) {
			var a = 0.5 * points.length / npoints
			points.push(src[0] * (1-a) + target[0] * a + UFX.random.normal(5))
			points.push(src[1] * (1-a) + target[1] * a + UFX.random.normal(5))
		}
		graphics.setcolour([0.8, 0.8, 1.0])
		graphics.drawstrip(points)
	},
	
	draw_bullet: function (src, target, radius) {
		var angle = Math.atan2(src[1] - target[1], src[0] - target[0])
		var r = radius - 5, c = Math.cos(angle), s = Math.sin(angle)
		var offset = UFX.random.normal(5)
		var x = target[0] + r*c + offset*s, y = target[1] + r*s - offset*c
		graphics.draw(gdata.splash, x, y, 5, angle*57.3, {colour: [1,1,1]})
		if (UFX.random() < 0.5)
			graphics.drawstrip([src[0], src[1], x, y])
	},
	
	draw_claw: function (pos, is_left) {
		graphics.draw(gdata[is_left ? "leftclaw" : "rightclaw"], pos[0]-10, pos[1]-10, 20, 0, { colour: [1,0,0] })
	},
	
	draw_trail: function (pos, bearing, trailtype, time) {
		var c = trail_colours[trailtype]
		var f = 0.1 * time, g = 1 - f
		var colour = [f*c[0]+g*c[3], f*c[1]+g*c[4], f*c[2]+g*c[5]]
		graphics.draw(gdata.trail, pos[0], pos[1], 15 - time, bearing, {colour: colour})
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
	// TODO: cache world chunks so we're not drawing the entire floor every frame
	draw_world_chunk: function (cx, cy) {
		var cs = this.mission.map.csize
		for (var dx = 0 ; dx < this.world_chunk_x ; ++dx) {
			var x = dx + this.world_chunk_x * cx
			for (var dy = 0 ; dy < this.world_chunk_y ; ++dy) {
				var y = dy + this.world_chunk_y * cy
				var n = gridn(x, y)
				if (this.mission.map.cells[n]) {
					graphics.setcolour(this.floor_colour)
					graphics.drawfloor(x, y, cs)
				}
				if (this.walls[n]) {
					graphics.setcolour(this.wall_colour)
					graphics.drawwall(this.walls[n], x, y, cs)
				}
			}
		}
	},
	make_world_chunk: function(cx, cy) {
		// The original used display lists but webGL doesn't support them. So build a big buffer
		// with all the floor and wall data
/*		var fdata = imagedata["scenery.floor1"]
		var wallps = [], floorps = []
		for (var dx = 0 ; dx < this.world_chunk_x ; ++dx) {
			var x = dx + this.world_chunk_x * cx
			for (var dy = 0 ; dy < this.world_chunk_y ; ++dy) {
				var y = dy + this.world_chunk_y * cy
				var n = gridn(x, y)
				if (this.mission.map.cells[n]) {
				}
			}
		}*/
	},

	draw_entity: function (e, pos) {
		pos = pos || e.pos
		var opts = { frameno: this.frameno, state: e.anim_state, turretbearing: e.turretbearing }
		graphics.draw(gdata.sprites[e.name], pos[0], pos[1], e.r, e.bearing/57.3, opts)
		if (settings.DEBUG) {
			var r = e.r
			graphics.setcolour([1,1,1])
			graphics.draw(gdata.debug_iface_circle, pos[0]-r, pos[1]-r, r*2)
			r += CURSOR_RADIUS
			graphics.setcolour([0.6,0.6,0.6])
			graphics.draw(gdata.debug_iface_circle, pos[0]-r, pos[1]-r, r*2)
		}
	},
	draw_entities: function (minx, miny, maxx, maxy) {
		var es = this.mission.entities.entitiesWithinRect([minx, miny], [maxx-minx, maxy-miny])
		for (var id in es) {
			if (es[id].visible) this.draw_entity(es[id])
		}
		// TODO: area_mode
	},
	
	draw_weapon_fx: function () {
		var es = this.mission.ei.es
		for (var s in this.lasers) {
			var ids = s.split(","), e0 = es[ids[0]], e1 = es[ids[1]]
			graphics.setcolour(e0 === this.mission.protag ? [1,0,0] : [0,0,1])
			graphics.drawstrip([e0.pos[0], e0.pos[1], e1.pos[0], e1.pos[1]])
		}
		for (var s in this.ligthnings) {
			var ids = s.split(","), e0 = es[ids[0]], e1 = es[ids[1]]
			this.draw_lightning(e0.pos, e1.pos)
		}
		for (var s in this.bullets) {
			var ids = s.split(","), e0 = es[ids[0]], e1 = es[ids[1]]
			this.draw_bullet(e0.pos, e1.pos)
		}
		for (var s in this.claws) {
			var ids = s.split("|"), target = es[ids[0]], left = +ids[1]
			this.draw_claw(target.pos, left)
		}
		for (var j = 0 ; j < this.trails.length ; ++j) {
			this.draw_trail.apply(this, this.trails[j])
		}
	},

	// TODO: draw_floaties
	
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
	
	// TODO draw_inventory
	
	draw_script: function () {
		var m = this.mission, s = m.currentScript
		// draw portraits
		if (s.currentLeftPortrait) {
			var px = this.portrait_l_xpos, py = this.portrait_ypos
			var sx = this.portrait_height * PORTRAIT_ASPECT, sy = this.portrait_height
			graphics.drawrect([px, py], [sx, sy], [1,1,1], [0,0,0,0.8])
			graphics.draw(gdata.portraits[s.currentLeftPortrait], px, py, sy)
		}
		if (s.currentRightPortrait) {
			var px = this.portrait_r_xpos, py = this.portrait_ypos
			var sx = this.portrait_height * PORTRAIT_ASPECT, sy = this.portrait_height
			graphics.drawrect([px, py], [sx, sy], [1,1,1], [0,0,0,0.8])
			graphics.draw(gdata.portraits[s.currentRightPortrait], px, py, sy)
		}
		
		// TODO: handle dialogue
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
			// TODO
			//this.draw_weapon_fx()
			//this.draw_floaties()
			this.draw_cursor_shadows()
			this.cursor.draw()  // I'm guessing this is called automatically in pyglet

		}
		graphics.hz = this.current_hud_zoom
		if (this.inventory_mode) {
			this.draw_inventory()
		} else if (this.mission.currentScript && this.mission.currentScript.state != "terminated") {
			//this.draw_script()  // TODO
		} else {
			this.draw_hud()
		}
	},

	can_click: function () {
		var m = this.mission
		return !(this.mouse_protected > 0 || m.isCutscene || m.currentScript && m.currentScript.state == "frozen")
	},
	
	
	// TODO: still need to finish mouse and key handling functions
	// Replaces on_mouse_motion, on_mouse_release, on_mouse_press, on_mouse_drag, on_mouse_scroll, and on_key_press
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
					this.weapon_icons[idx].border = WEAPON_ICON_BORDER_FIRING
					this.weapon_icons[idx].flashtime = WEAPON_ICON_BORDER_FLASH_FRAMES
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
	on_inventory: function () {
		this.inventory_mode = true
		this.inventory_menu.load_inventory()
		this.inventory_menu.set_mouse(this.mouse_x, this.mouse_y)
	},
	on_equipment_change: function () {
		var p = this.mission.protag
		p.currenthp = Math.min(p.currenthp, robotstate.getMaxHP())
		p.currentenergy = Math.min(p.currentenergy, robotstate.getMaxEnergy())
	},
	on_set_zoom: function (zoom) {
		this.desired_zoom = zoom
	},
	on_stop_mode: function () {
		this.cursor.modehandler = null
	},
	weapon_clicked: function (idx) {
		var wpn = robotstate.weaponry[idx]
		if (wpn) wpn.toggle(this.mission.protag)
		this.update_weapons()
	},
	eject_clicked: function () {
		if (this.eject_mode) {
			this.mission.runScript(this.mission.ejectScript)
		} else {
			this.eject_mode = true
			this.eject_icon.icon = gdata.eject_confirm
		}
	},
	update_weapons: function () {
		this.weapon_icons = []
		for (var idx = 0 ; idx < robotstate.weaponry.length ; ++idx) {
			var wpn = robotstate.weaponry[idx], icon = this.equip_icons[idx]
			icon.border = WEAPON_ICON_BORDER_NORMAL
			icon.flashtime = 0
			if (wpn) {
				icon.icon = gdata.weapon_icons[wpn.name]
				icon.colour = WEAPON_ICON_COLOURS[wpn.mode]
			} else {
				icon.icon = null
			}
			this.weapon_icons.push(icon)
		}
		this.armour_icon = this.equip_icons[idx + 1]
		this.armour_icon.icon = gdata.armour
	},
	close_inventory: function () {
		this.inventory_mode = false
		this.update_weapons()
		if (this.mission.currentScript) this.mission.currentScript.state = "running"
	},
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

		for (var j = 0 ; j < this.weapon_icons.length ; ++j) {
			var wi = this.weapon_icons[j]
			wi.flashtime--
			if (wi.flashtime <= 0) wi.border = WEAPON_ICON_BORDER_NORMAL
		}
		if (this.new_xp_delay > 0) {
			this.new_xp_delay--
			if (this.new_xp_delay <= 0) {
				var s = "+" + helpers.format_xp(this.new_xp) + " XPs"
				this.add_floaty(s, this.mission.protag.pos, FLOATY_XP_COLOUR)
			}
		}
		if (!this.mission.currentScript) {
			this.frameno++
			for (var s in this.lasers) if (!--this.lasers[s]) delete this.lasers[s]
			for (var s in this.claws) if (!--this.claws[s]) delete this.claws[s]
			for (var s in this.lightnings) if (!--this.lightnings[s]) delete this.lightnings[s]
			this.trails = this.trails.filter(function (t) { return --t[3] })
			// TODO: update this.live_floaties
		}
		this.bullets = []
		this.mission.tick()
	},
}


