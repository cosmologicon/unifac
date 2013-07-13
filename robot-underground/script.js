
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
	// TODO: setDialogue, choose, clearDialogue, setQuestion
	// TODO: setLeftPortrait, setRightPortrait, clearLeftPortrait, clearRightPortrait, clearAll
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


