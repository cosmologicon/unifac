
function Mission() {
	// set map, protag, actors, scripts
	//content.setupMission(plotstate, this)
}
Mission.prototype = {	
	addProtagAnywhere: function () {
		return this.addProtag(this.map.getClearSpace())
	},
	addProtag: function (pos) {
		this.protag = new Protag(pos)
		this.entities.push(this.protag)
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


