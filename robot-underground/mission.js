
function Mission() {
	// set map, protag, actors, scripts
	this.dead = {}
	this.born = {}
	
	this.ejectScript = null
	this.startScript = null
	this.clearScript = null
	this.canEject = false
	this.isTimed = false
	this.entities = new EntityIndex()
	this.style = "basic"
	this.scripts = []

	setupMission(plotstate, this)
	
	this.isCutscene = false
	this.scriptQueue = []
	this.currentScript = null
}
Mission.prototype = {	
	addProtagAnywhere: function () {
		return this.addProtag(this.map.getClearSpace())
	},
	addProtag: function (pos) {
		this.protag = new Protag(this, pos)
		this.entities.add(this.protag)
		return this.protag
	},
	// TODO: addScenery, addEntity
	// TODO: placeEnemiesRandomlyAnywhere, placeEnemiesRandomly
	// TODO: placeSquad
	// TODO: runScript, advanceScript
	

	draw_world: function () {
		var cs = this.mission.map.csize
		
	},
}


