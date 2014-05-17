// The original python version made heavy use of yields to achieve script advancement.
// That's not an option here, so the script engine is pretty much completely rewritten.
// A script spec is an Array of steps, each one is a line of dialogue, etc.
// If a step can either be a string (in which case script.state will be set to it)
//   or an Array consisting of a command name (string) and the corresponding arguments.

function Script(spec, mission, actor) {
	this.spec0 = spec
	this.mission = mission
	this.actor = actor || null
	this.restart()
	this.blankScreen = false
	this.freezeTicks = 0
	this.waitingOn = []
}
Script.prototype = {
	blank: function (blank) {
		this.blankScreen = blank === undefined ? true : blank
	},

	save: function () {
		savegame()
	},

	say_l: function (text, speaker) {
		this.currentDialogue = text
		if (speaker) this.leftSpeaker = speaker
		this.currentSpeaker = this.leftSpeaker
		this.speakerIsLeft = true
		this.isQuestion = false
		this.state = "waitKey"
		this.mission.dispatch_event("on_dialogue_change")
	},
	say_l_unlabelled: function (text) {
		return this.say_l(text)
	},
	say_r: function (text, speaker) {
		this.currentDialogue = text
		if (speaker) this.rightSpeaker = speaker
		this.currentSpeaker = this.rightSpeaker
		this.speakerIsLeft = false
		this.isQuestion = false
		this.state = "waitKey"
		this.mission.dispatch_event("on_dialogue_change")
	},
	say_r_unlabelled: function (text) {
		return this.say_r(text)
	},

	speaker_l: function (svg) {  // calls setLeftPortrait
		this.currentLeftPortrait = gdata.portraits[svg]
		this.leftSpeaker = gdata.portraits[svg].name
		this.mission.dispatch_event("on_portrait_change")
	},
	speaker_r: function (svg) {  // setRightPortrait
		this.currentRightPortrait = gdata.portraits[svg]
		this.rightSpeaker = gdata.portraits[svg].name
		this.mission.dispatch_event("on_portrait_change")
	},
	
	clear_l: function () {
		this.currentLeftPortrait = null
		this.leftSpeaker = ""
		this.mission.dispatch_event("on_portrait_change")
	},
	clear_r: function () {
		this.currentRightPortrait = null
		this.rightSpeaker = ""
		this.mission.dispatch_event("on_portrait_change")
	},
	
	clearAll: function () {
		this.currentSpeaker = ""
		this.currentDiaolgue = ""
		this.speakerIsLeft = true
		this.isQuestion = false
		this.mission.dispatch_event("on_dialogue_change")
		this.clear_l()
		this.clear_r()
	},

	ask_l: function (text, choices, defaultOption) {
		this.say_l(text)
		// isQuestion seems pretty useless. Isn't it always the same as this.state == "waitChoice"?
		this.isQuestion = true
		this.state = "waitChoice"
		var x = DIALOGUE_BOX_PAD * settings.scr_w, y = DIALOGUE_BOX_TOP * settings.scr_h
		this.menu = this.makemenu(text, choices, x, y, defaultOption || 0)
	},
	ask_r: function (text, choices, defaultOption) {
		this.say_r(text)
		this.isQuestion = true
		this.state = "waitChoice"
		var x = (1 - DIALOGUE_BOX_PAD - DIALOGUE_BOX_WIDTH) * settings.scr_w
		var y = DIALOGUE_BOX_TOP * settings.scr_h
		this.menu = this.makemenu(text, choices, x, y, defaultOption || 0)
	},
	// TODO: handle window resize?
	makemenu: function (header, choices, x, y, defaultOption) {
		return new Menu(this.makechoices(choices), x, y, {
			header: header,
			fontsize: DIALOGUE_FONT_SIZE * settings.scr_h,
			gutter: BOX_GUTTER * settings.scr_h,
			scolour: [0,0,0,0.8],
			ocolour: [1,1,1,1],
			defaultOption: defaultOption,
			width: DIALOGUE_BOX_WIDTH * settings.scr_w,
			spacing: DIALOGUE_BOX_SPACING * settings.scr_h,
			vanchor: 1,
		})
	},
	makechoices: function (choices) {
		var that = this
		return choices.map(function (choice) {
			return [choice[0], that.answer.bind(that, choice.slice(1))]
		})
	},
	// Callback for the menu to invoke when a selection is made
	answer: function (newspec) {
		this.insert(newspec)
		this.menu = null
		this.state = "running"
	},

	heal: function (num) {
		this.actor.heal(num)
	},
	add_xp: function (num) {
		this.mission.protag.addXp(num)
	},
	deny: function (flag) {
		this.denyFlag = true
	},
	die: function () {
		this.actor.die()
	},
	kill_protag: function () {
		this.mission.entities.add(new Explosion(this.mission, this.mission.protag.pos, 100))
		this.mission.protag.kill()
	},
	kill_type: function (type) {
		this.mission.entities.forEach(function () {
			if (this.name === type) this.die()
		})
	},
	die_no_drop: function () {
		this.actor.die(false)
	},
	drop_metal: function (metal, amount) {
		// NB: this was originally assigned to last_choice, which seems pointless to me.
		new Metal(this.mission, metal, amount, this.actor.pos)
	},
	// replaces drop_item
	drop_weapon: function (wspec, sspec) {
		var t = new DroppedEquippable(this.mission, makeWeapon(wspec), this.actor.pos)
		if (sspec) t.setPickUpScript(sspec)
	},
	set_hostile: function (hostile) {
		this.actor.hostile = hostile
	},


	insert: function (newspec) {
		this.spec = newspec.slice().concat(this.spec)
	},
	// Logic operations. Feels a little weird using if as a method name, huh? I say embrace the weird.
	if: function (condition, ifspec, elsespec) {
		if (condition) {
			if (ifspec) this.insert(ifspec)
		} else {
			if (elsespec) this.insert(elsespec)
		}
	},

	// replaces is_first
	if_first: function (key, ifspec, elsespec) {
		this.if(!plotstate[key], ifspec, elsespec)
		plotstate[key] = "done"
	},

	// replaces if key in plotstate
	if_plotstate: function (key, ifspec, elsespec) {
		this.if(plotstate[key], ifspec, elsespec)
	},
	// replaces if key not in plotstate
	if_not_plotstate: function (key, ifspec, elsespec) {
		this.if(!plotstate[key], ifspec, elsespec)
	},
	// replaces if plotstate[key] >= value
	if_plotstate_counter: function (key, value, ifspec, elsespec) {
		this.if(plotstate[key] >= value, ifspec, elsespec)
	},
	// replaces if plotstate[key] == value
	if_eq_plotstate: function (key, value, ifspec, elsespec) {
		this.if(plotstate[key] == value, ifspec, elsespec)
	},
	// replaces if robotstate.getMetal(type) >= amount
	if_has_metal: function (type, amount, ifspec, elsespec) {
		this.if(robotstate.getMetal(type) >= amount, ifspec, elsespec)
	},
	// if all members of mission.bosses are dead
	if_boss_dead: function (ifspec, elsespec) {
		this.if(this.mission.bosses.every(function (b) { return b.currenthp <= 0 }), ifspec, elsespec)
	},

	// replaces plotstate[key] = "done"
	set_plotstate: function (key, value) {
		plotstate[key] = value === undefined ? "done" : value
	},
	// replaces plotstate[key] += 1
	increment_plotstate: function (key) {
		plotstate[key]++
	},
	// replaces robotstate.changeMetal(amt, type)
	change_metal: function (amt, type) {
		robotstate.changeMetal(amt, type)
	},
	// replaces robotstate.addWeaponSlot
	addWeaponSlot: function () {
		robotstate.addWeaponSlot()
	},

	sound: function (sfx) {
		playsound(sfx)
	},
	change_music: function (song) {
		if (!song) stopmusic()
		else playmusic(song)
	},

	change_scene: function (next) {
		// TODO: save_log()
		plotstate.nextScene = next
		this.state = "endMission"
	},

	end_game: function (next) {
		this.state = "endGame"
	},

	inventory: function () {
		this.mission.dispatch_event("on_inventory")
	},

	freeze: function (ticks) {
		this.freezeTicks = ticks
		this.state = "frozen"
	},

	set_zoom: function (zoom) {
		this.mission.dispatch_event("on_set_zoom", zoom)
	},
	
	wait: function (ticks) {
		this.mission.runScript(this, ticks)
		this.state = "endConversation"
	},
	
	// Replaces mission.runScript(script, delay) - for dispatching the next script
	runScript: function (spec, delay, actor) {
		this.mission.runScript(new Script(spec, this.mission, actor), delay)
	},
	// This method is turning out to be a pain to get working, and I think it was primarily used
	//   for a training mission that's no longer used. I'm fine with removing it.
//	wait_until_moved: function (actors) {
//		console.log("wait_until_moved", actors)
//		this.waitingOn = actors.slice()
//		this.mission.isCutscene = true
//		this.mission.runScript(this, 1)
//		this.state = "endConversation"
//	},
	set_script_path: function (who, nodes, bearing) {
		who.setScriptPath(nodes, bearing)
	},

	// Catch-all for any one-off functions they put in the script
	do: function (fn) {
		fn()
	},


	// TODO log_record

	restart: function () {
		this.clearAll()
		this.state = "running"
		this.last_choice = null
		this.denyFlag = false
		this.spec = this.spec0.slice()
	},

	canEject: function (can) {
		this.mission.canEject = can === undefined ? true : can
	},

	advance: function () {
		
		this.waitingOn = this.waitingOn.filter(function (a) { return a.scriptNodes })
		if (this.waitingOn.length) {
			this.state = "endConversation"
			this.mission.runScript(this, 1)
		} else {
			this.mission.isCutscene = false
		}
		
		while (this.state == "running") {
			if (this.spec.length) {
				var state = this.spec.shift()
				if (state.pop) {
					if (!this[state[0]]) throw "Unimplemented method " + state[0]
					this[state[0]].apply(this, state.slice(1))
				} else {
					this.state = state
				}
			} else {
				this.state = "terminated"
			}
		}
	},
}


