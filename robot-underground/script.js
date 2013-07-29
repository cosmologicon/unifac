
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
	counters: {},

	blank: function (blank) {
		this.blankScreen = blank === undefined ? true : blank
	},

	// TODO save_log save load

	say_l: function (text, speaker) {
		this.currentDialogue = text
		if (speaker) this.leftSpeaker = speaker
		this.currentSpeaker = this.leftSpeaker
		this.speakerIsLeft = true
		this.isQuestion = false
		this.mission.dispatch_event("on_dialogue_change")
		this.state = "waitKey"
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
		this.mission.dispatch_event("on_dialogue_change")
		this.state = "waitKey"
	},
	say_r_unlabelled: function (text) {
		return this.say_r(text)
	},

	speaker_l: function (svg) {  // calls setLeftPortrait
		this.currentLeftPortrait = gdata.portraits[svg]
		this.leftSpeaker = svg
		this.mission.dispatch_event("on_portrait_change")
	},
	speaker_r: function (svg) {  // setRightPortrait
		this.currentRightPortrait = gdata.portraits[svg]
		this.rightSpeaker = svg
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

	// options needs to be an array, not separate arguments
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
	makemenu: function (header, choices, x, y, defaultOption) {
		return new Menu(this.makechoices(choices), x, y, {
			header: header,
			fontsize: DIALOGUE_FONT_SIZE * settings.scr_h,
			gutter: BOX_GUTTER * settings.scr_h,
			scolour: [0,0,0,0.8],
			ocolour: [1,1,1,1],
			defaultOption: defaultOption,
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
	addXp: function (num) {
		this.mission.protag.addXp(num)
	},
	deny: function (flag) {
		this.denyFlag = true
	},
	die: function () {
		this.actor.die()
	},
	die_no_drop: function () {
		this.actor.die(false)
	},
	drop_metal: function (metal, amount) {
		// NB: this was originally assigned to last_choice, which seems pointless to me.
		new Metal(this.mission, metal, amount, this.actor.pos)
	},
	// replaces drop_item. TODO: Is the item dropped always a weapon?
	drop_weapon: function (wspec, sspec) {
		var t = new DroppedEquippable(this.mission, makeWeapon(wspec), this.actor.pos)
		if (sspec) t.setPickUpScript(sspec)
	},


	insert: function (newspec) {
		this.spec = newspec.concat(this.spec)
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

	inventory: function () {
		this.mission.dispatch_event("on_inventory")
	},

	freeze: function (ticks) {
		this.freezeTicks = ticks
	},

	set_zoom: function (zoom) {
		this.mission.dispatch_event("on_set_zoom", zoom)
	},
	
	wait: function (ticks) {
		this.mission.runScript(this, ticks)
		this.state = "endConversation"
	},
	wait_until_moved: function (actors) {
		this.waitingOn = actors
		this.mission.isCutScene = true
		this.mission.runScript(this, 1)
		this.state = "endConversation"
	},

	// TODO log_record

	restart: function () {
		this.clearAll()
		this.state = "running"
		this.last_choice = null
		this.denyFlag = false
		this.spec = this.spec0.slice()
	},

	// Handle shared counters
	increment: function (countname, amount) {
		if (amount === undefined) amount = 1
		this.counters[countname] = (this.counters[countname] || 0) + amount
	},
	ifeq: function (countname, amount, ifspec, elsespec) {
		this.if((this.counters[countname] || 0) == amount, ifspec, elsespec)
	},

	canEject: function () {
		this.mission.canEject = true
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


