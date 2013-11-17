

function InventoryPixIcon(item) {
	this.item = item
	this.icon = gdata.weapon_icons[item.name] || gdata.armour
	this.x_pos = this.y_pos = 0
	this.width = this.height = 0
}
InventoryPixIcon.prototype = {
	color: INVMENU_ICON_COLORS.normal,
	background: INVMENU_ICON_BACKGROUND,
	contains: function (pos) {
		var dx = pos[0] - this.x_pos, dy = pos[1] - this.y_pos
		return 0 <= dx && dx < this.width && 0 <= dy && dy < this.height
	},
	activate: function () {
		if (this.activate_fn) this.activate_fn()
	},
	draw: function (dx, dy) {
		var x = this.x_pos + (dx || 0), y = this.y_pos + (dy || 0)
		graphics.drawhudrect([x, y], [this.width, this.height],
			this.color, this.background)
		graphics.draw(this.icon, x, y, this.height, 0, { hud: true })
		if (!this.item.isIdentified) {
			graphics.draw(gdata.appraised, x + 0.75 * this.width, y,
				this.width / 4, 0, { hud: true, colour: [0.8, 0, 0.8]})
		}
		if (robotstate.inventory.indexOf(this.item) == -1) {
			graphics.draw(gdata.equipped, x, y, this.width / 4, 0,
				{ hud: true, colour: [0, 0.8, 0] })
		}
	},
}

// TODO: Allow resizing of canvas while inventory menu is up
function ScrollingInventoryMenu(callback) {
	var scr_w = settings.scr_w, scr_h = settings.scr_h
	this.callback = callback
	
	var margin = INVMENU_MARGIN * scr_h, padding = INVMENU_PADDING * scr_h
	
	this.view_w = INVMENU_SIZE[0] * scr_w
	this.view_h = INVMENU_SIZE[1] * scr_h
	this.view_l = 0.5 * (scr_w - this.view_w)
	this.view_b = scr_h - this.view_h - margin - padding
	
	this.box_w = this.view_w + 2 * padding
	this.box_h = this.view_h + 2 * padding
	this.box_l = this.view_l - padding
	this.box_b = this.view_b - padding
	
	var icol = INVMENU_ICON_PERCOL, irow = INVMENU_ICON_PERROW, ipratio = INVMENU_ICON_PADDINGRATIO
	if (icol === null) {
		var iw = this.view_w / (irow * (1 + ipratio) - ipratio), ih = iw, ipad = ih * ipratio
	} else if (irow === null) {
		var ih = this.view_h / (icol * (1 + ipratio) - ipratio), iw = ih, ipad = ih * ipratio
	} else {
		var ih = this.view_h / (icol * (1 + ipratio) - ipratio), ipad = ih * ipratio,
			iw = Math.floor((this.view_w - (irow - 1) * ipad) / irow)
	}
	this.icon_height = ih ; this.icon_width = iw ; this.icon_padding = ipad
	this.button_size = INVMENU_BUTTON_SIZE * scr_h
	
	this.cur_scroll = 0
	this.max_scroll = 0
	this.scroll_off = this.view_b
	
	var s = this.button_size
	// Close inventory menu
	this.cross = new Button(this.callback,
		this.box_l, this.box_b + this.box_h, s, s,
		gdata.cross, null, null, true, true)
	this.arrow_up = new Button(this.scroll.bind(this, -1),
		this.box_l + this.box_w, this.box_b + this.box_h, s, s,
		gdata.triup, null, null, true, true)
	this.arrow_down = new Button(this.scroll.bind(this, 1),
		this.box_l + this.box_w, this.box_b, s, s,
		gdata.tridown, null, null, true, true)
	this.buttons = [this.cross, this.arrow_up, this.arrow_down]
	this.mouse_pos = [0, 0]
	this.current_idx = null
	this.load_inventory()
}
ScrollingInventoryMenu.prototype = {
	contains: function (pos) {
		return this.box_l <= pos[0] && pos[0] < this.box_l + this.box_w &&
			this.view_b <= pos[1] && pos[1] < this.view_b + this.view_h
	},

	set_left: function (item, force) {
		if (!item) {
			this.left_popup = null
			this.left_item = null
		} else if (item !== this.left_item || force) {
			this.left_popup = this.item_description(item, true)
			this.left_item = item
		}
	},
	set_right: function (item, force) {
		if (!item) {
			this.right_popup = null
			this.right_item = null
		} else if (item !== this.right_item || force) {
			this.right_popup = this.item_description(item, true)
			this.right_item = item
		}
	},

	set_current: function (idx) {
		if (idx === this.current_idx) return
		if (this.icons[this.current_idx])
			this.icons[this.current_idx].color = INVMENU_ICON_COLORS.normal
		this.current_idx = idx
		if (this.icons[this.current_idx])
			this.icons[this.current_idx].color = INVMENU_ICON_COLORS.selected
	},
	
	// Move the current selection with the keyboard
	_change_current: function (delta, rowlock) {
		var max_icon = this.icons.length - 1
		console.log(this.current_idx)
		if (this.current_idx === null) {
			var idx = 0
		} else {
			var idx = clip(this.current_idx + delta, 0, max_icon)
		}
		if (rowlock && this.current_idx !== null) {
			if (Math.floor(idx / this.icon_per_row) == Math.floor(this.current_idx / this.icon_per_row)) {
				return
			}
		}
		this.set_current(idx)

		var icon_b = this.icons[idx].y_pos, icon_t = icon_b + this.icon_height
		var min_b = this.max_scroll - this.cur_scroll
		var max_t = this.max_scroll - this.cur_scroll + this.view_h

		if (icon_b < min_b) this.cur_scroll = this.max_scroll - icon_b
		else if (icon_t > max_t) this.cur_scroll = this.max_scroll - icon_t + this.view_h
		this.scroll_off = this.view_b - (this.max_scroll - this.cur_scroll)
	},
	
	item_description: function (item, show_costs) {
		function cost_text(amounts) {
			var cost = []
			amounts.forEach(function (amt, idx) {
				if (amt > 0) cost.push(METAL_SYMS[idx] + ": " + amt)
			})
			return cost.join(", ")
		}
		var text_bits = [item.description()]
		if (show_costs) {
			var ided = item.isIdentified, had = robotstate.inventory.indexOf(item) > -1
			if (had || !ided) text_bits.push("")
			if (!ided) text_bits.push("Appraise cost - " + cost_text(item.appraisecost()))
			if (ided && had) text_bits.push("Equip cost - " + cost_text(item.equipcost()))
			if (had) text_bits.push("Sale value - " + cost_text(item.salevalue()))
		}
		return text_bits.join("\n")
	},

	// Replaces scroll_up and scroll_down
	scroll: function (amt) {
		if (amt === undefined) amt = 1
		this.cur_scroll += amt * this.icon_height * INVMENU_SCROLLSENSITIVITY
		this.cur_scroll = clip(this.cur_scroll, 0, this.max_scroll)
		this.scroll_off = this.view_b - (this.max_scroll - this.cur_scroll)
	},

	set_mouse: function (mpos) {
		var x = mpos[0], y = settings.scr_h - mpos[1]
		if (x == this.mouse_x && y == this.mouse_y) return
		this.mouse_x = x
		this.mouse_y = y
		
		var menu_popup = this.menu_popup
		if (menu_popup) {
			menu_popup.handlemouse(this.mouse_x, this.mouse_y)
			if (menu_popup.is_equip_weapon) {
				this.set_right(robotstate.weaponry[menu_popup.current])
			} else if (menu_popup.is_equip_armour) {
				this.set_right(menu_popup.current === 0 ? robotstate.armoury : null)
			} else {
				this.set_right()
			}
		} else {
			var x = this.mouse_x - this.view_l, y = this.mouse_y - this.scroll_off
			var newidx = null
			for (var idx = 0 ; idx < this.icons.length ; ++idx) {
				if (this.icons[idx].contains([x, y])) {
					newidx = idx
					break
				}
			}
			this.set_current(newidx)
			this.set_right()
		}
		this.set_left(this.icons[this.current_idx] ? this.icons[this.current_idx].item : null)
		
		for (var j = 0 ; j < this.buttons.length ; ++j) {
			this.buttons[j].color = this.buttons[j].point_within(this.mouse_x, this.mouse_y) ?
				INVMENU_BUTTON_COLORS.selected : INVMENU_BUTTON_COLORS.normal
		}
		if (this.cur_scroll <= 0) this.arrow_up.color = INVMENU_BUTTON_COLORS.greyed
		if (this.cur_scroll >= this.max_scroll) this.arrow_up.color = INVMENU_BUTTON_COLORS.greyed
		this.buttons.forEach(function (b) { b.border = b.color })
	},

	handle_input: function (mstate, kstate) {
		if (mstate.pos) this.set_mouse(mstate.pos)
		var menu_popup = this.menu_popup
		if (menu_popup) {
			if (mstate.left.down) menu_popup.activate()
			menu_popup.handlekeys(kstate.down)
			if (kstate.down.esc) this.close_menu()
			return
		}

		if (mstate.left.down) this.on_mouse_press()
		if (mstate.right.down) this.on_mouse_press(true, kstate.pressed.alt, kstate.pressed.ctrl)
		if (mstate.left.isdown && mstate.dpos[1]) {  // drag to scroll
			this.scroll(-mstate.dpos[1] / this.icon_height)
		}
		if (mstate.wheeldy) {  // mouse wheel to scroll
			this.scroll(-mstate.wheeldy)
		}
		if (kstate.down.up) this._change_current(-this.icon_per_row, true)
		if (kstate.down.down) this._change_current(this.icon_per_row, true)
		if (kstate.down.left) this._change_current(-1)
		if (kstate.down.right) this._change_current(1)
		if (kstate.down.enter && this.current_idx) this.icons[this.current_idx].activate()
		if (kstate.down.esc) this.callback()
	},
	on_mouse_press: function (right, alt, ctrl) {
		for (var j = 0 ; j < this.buttons.length ; ++j) {
			if (this.buttons[j].on_mouse_press(this.mouse_x, this.mouse_y))
				return true
		}
		if (!this.contains([this.mouse_x, this.mouse_y])) return
		var icon = this.icons[this.current_idx]
		if (!icon) return
		if (!right) icon.activate()
		else if (alt) this.do_appraise_item(icon.item)
		else if (ctrl) this.do_sell_item(icon.item)
		return true
	},

	popupmenu: function (choices, header) {
		var x = settings.scr_w/2, y = settings.scr_h/2
		this.menu_popup = new Menu(choices, x, y, {
			header: header,
			fontsize: 2 * INVMENU_TEXT_FONTSIZE * settings.scr_h,
			hanchor: 0.5,
			vanchor: 0.5,
			spacing: INVMENU_TEXT_SPACING * settings.scr_h,
			gutter: INVMENU_TEXT_PADDING * settings.scr_h,
			scolour: INVMENU_BACKGROUND,
			ocolour: INVMENU_BORDER,
		})
	},

	show_item: function (item) {
		if (robotstate.inventory.indexOf(item) == -1) return
		var choices = []
		if (item.isIdentified) {
			choices.push(["Equip", this.equip_item.bind(this, item)])
		} else {
			choices.push(["Appraise", this.appraise_item.bind(this, item)])
		}
		choices.push(["Sell", this.sell_item.bind(this, item)])
		choices.push(["Cancel", this.close_menu.bind(this)])
		this.popupmenu(choices, "Select an option:")
	},

	equip_item: function (item) {
		if (item.isweapon) {
			if (robotstate.canAfford(item.equipcost())) {
				this.equip_weapon(item)
			} else {
				this.notify_menu("You cannot afford to equip this weapon.", item)
			}
		} else if (item.isarmour) {
			if (robotstate.canAfford(item.equipcost())) {
				this.equip_armour(item)
			} else {
				this.notify_menu("You cannot afford to equip this armour.", item)
			}
		}
	},

	equip_weapon: function (item) {
		var choices = []
		for (var idx = 0 ; idx < robotstate.weaponry.length ; ++idx) {
			choices.push(["Slot " + (idx + 1), this.do_equip_weapon.bind(this, item, idx)])
		}
		choices.push(["Cancel", this.close_menu.bind(this)])
		this.popupmenu(choices)
		this.menu_popup.is_equip_weapon = true
	},

	equip_armour: function (item) {
		this.popupmenu([
			["Yes (replace current)", this.do_equip_armour.bind(this, item)],
			["Cancel", this.close_menu.bind(this)],
		], "Equip armour?")
		this.menu_popup.is_equip_armour = true
	},

	appraise_item: function (item) {
		if (robotstate.canAfford(item.salevalue())) {
			this.popupmenu([
				["Yes", this.do_appraise_item.bind(this, item)],
				["No", this.show_item.bind(this, item)],
			], "Appraise?")
		} else {
			this.notify_menu("You cannot afford to appraise this item.", item)
		}
	},
	
	sell_item: function (item) {
		this.popupmenu([
			["Yes", this.do_sell_item.bind(this, item)],
			["No", this.show_item.bind(this, item)],
		], "Sell?")
	},
	
	// NB: back_menu not needed, just set the back option explicitly
	
	notify_menu: function (text, item) {
		this.popupmenu([
			["Back", this.show_item.bind(this, item)],
		], text)
	},
	
	// NB: confirm menu typed out explicitly when needed
	
	close_menu: function () {
		this.menu_popup = null
	},
	
	do_equip_weapon: function (item, idx) {
		robotstate.setWeapon(item, idx)
		robotstate.removeMetals(item.equipcost())
		this.update_inventory()
		this.close_menu()
	},
	
	do_equip_armour: function (item) {
		robotstate.setArmour(item)
		robotstate.removeMetals(item.equipcost())
		this.update_inventory()
		this.close_menu()
	},
	
	do_appraise_item: function (item) {
		if (item.isIdentified) return
		if (!robotstate.canAfford(item.salevalue())) return
		robotstate.removeMetals(item.salevalue())
		// TODO gamelog
		item.isIdentified = true
		this.set_left(item, true)
		this.update_inventory()
		if (this.menu_popup) this.show_item(item)
	},
	
	do_sell_item: function (item) {
		var idx = robotstate.inventory.indexOf(item)
		if (idx == -1) return
		robotstate.addMetals(item.salevalue())
		robotstate.inventory.splice(idx, 1)
		this.remove_item(item)
		this.update_inventory()
		this.close_menu()
	},
	
	add_item: function (item) {
		//var icon = gdata.weapon_icons[item.name] || gdata.armour
		var icon = new InventoryPixIcon(item)  // TODO: support text icons
		this.icons.push(icon)
	},

	remove_item: function (item) {
		this.icons = this.icons.filter(function (i) { return i.item !== item })
	},		

	load_inventory: function () {
		this.icons = []
		var add = this.add_item.bind(this)
		robotstate.weaponry.filter(function (x) { return x }).forEach(add)
		add(robotstate.armoury)
		robotstate.inventory.forEach(add)
		this.update_inventory()
	},
	
	update_inventory: function () {
		var max_icon = this.icons.length - 1
		if (this.current_idx !== null) {
			this.current_idx = clip(this.current_idx, 0, max_icon)
			this.set_current(this.current_idx)
		}
		for (var j = 0 ; j <= max_icon ; ++j) {
			this.icons[j].activate_fn = this.show_item.bind(this, this.icons[j].item)
		}
		this.position_icons()
	},
	
	position_icons: function () {
		var iw = this.icon_width, ih = this.icon_height, ipad = this.icon_padding
		this.icon_per_row = INVMENU_ICON_PERROW
		var num_rows = Math.floor((this.icons.length - 1) / this.icon_per_row) + 1
		for (var idx = 0 ; idx < this.icons.length ; ++idx) {
			var icon = this.icons[idx]
			var row_idx = Math.floor(idx / this.icon_per_row), col_idx = idx % this.icon_per_row
			icon.x_pos = col_idx * (iw + ipad)
			icon.y_pos = (num_rows - row_idx - 1) * (ih + ipad)
			icon.width = iw
			icon.height = ih
		}
		this.max_scroll = Math.max(0, num_rows * (ih + ipad) - ipad - this.view_h)
		this.scroll_off = this.view_b - (this.max_scroll - this.cur_scroll)
	},

	draw_box: function () {
		graphics.drawhudrect([this.box_l, this.box_b], [this.box_w, this.box_h],
			INVMENU_BORDER, INVMENU_BACKGROUND)
	},
	
	draw_content: function () {
		var padding = INVMENU_TEXT_PADDING * settings.scr_h
		var max_b = this.max_scroll - this.cur_scroll + this.view_h + padding
		var min_t = this.max_scroll - this.cur_scroll - padding
		gl.scissor(Math.floor(this.box_l), Math.floor(this.view_b - padding / 2),
			Math.floor(this.box_w), Math.floor(this.view_h + padding))
		gl.enable(gl.SCISSOR_TEST)
		for (var j = 0 ; j < this.icons.length ; ++j) {
			this.icons[j].draw(this.view_l, this.scroll_off)
		}
		gl.disable(gl.SCISSOR_TEST)
	},
	
	draw: function () {
		this.draw_box()
		this.draw_content()
		this.buttons.forEach(function (b) { b.draw() })
		if (this.left_popup) {
			text.drawhudborder(this.left_popup, 0.25*settings.scr_w, 0.25*settings.scr_h,
				INVMENU_TEXT_FONTSIZE*settings.scr_h, "white", INVMENU_PADDING * settings.scr_h, 0.5, 0.5,
				null, "center", false, INVMENU_BORDER, INVMENU_BACKGROUND)
		}
		if (this.right_popup) {
			text.drawhudborder(this.right_popup, 0.75*settings.scr_w, 0.25*settings.scr_h,
				INVMENU_TEXT_FONTSIZE*settings.scr_h, "white", INVMENU_PADDING * settings.scr_h, 0.5, 0.5,
				null, "center", false, INVMENU_BORDER, INVMENU_BACKGROUND)
		}
		if (this.menu_popup) this.menu_popup.draw()
	},
}






