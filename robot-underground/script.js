
function Script(spec, mission, actor) {
	this.spec = spec.splice(0)  // replaces runmethod
	this.mission = mission
	this.actor = actor || null
	this.restart()
	this.blankScreen = false
	this.freezeTicks = 0
	this.waitingOn = []
}
Script.prototype = {
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

	// TODO: choose, clearDialogue, setQuestion
	speaker_l: function (svg) {  // calls setLeftPortrait
		this.currentLeftPortrait = svg
		this.leftSpeaker = gdata.portraits[svg]
		this.mission.dispatch_event("on_portrait_change")
	},
	speaker_r: function (svg) {  // setRightPortrait
		this.currentRightPortrait = svg
		this.rightSpeaker = gdata.portraits[svg]
		this.mission.dispatch_event("on_portrait_change")
	},
	// clearLeftPortrait, clearRightPortrait, clearAll
	// TODO: setBlank
	heal: function (num) {
		this.actor.heal(num)
	},
	addXp: function (num) {
		this.mission.protag.addXp(num)
	},
	setDeny:  function (flag) {
		this.deny = flag
	},
	die: function () {
		this.actor.die()
	},
	dieNoDrop: function () {
		this.actor.die(false)
	},
	// TODO: dropMetal, dropItem, setNextScene, inventory
	setZoom: function (zoom) {
		this.mission.dsipact_event("on_set_zoom", zoom)
	},
	setFreeze: function (ticks) {
		this.freezeTicks = ticks
	},
	wait: function (ticks) {
		this.mission.runScript(this, ticks)
	},
	waitUntilMoved: function (actors) {
		this.waitingOn = actors
		this.mission.isCutScene = true
		this.mission.runScript(this, 1)
	},
	restart: function () {
		//TODO: this.clearAll()
		this.state = "running"
		this.last_choice = null
		this.deny = false
		// TODO: this.generator = ...
	},
	sound: function (sfx) {
		playsound(sfx)
	},
	change_music: function (song) {
		if (!song) stopmusic()
		else playmusic(song)
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
					this[state[0]].apply(this, state.splice(1))
				} else {
					this.state = state
				}
			} else {
				this.state = "terminated"
			}
		}
	},
}


