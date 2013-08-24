
var gamestate = {}
var items = {
	kazoo: true,
}

function savegame() {
	localStorage["minora-savegame"] = [gamestate, items]
}
function loadgame() {
	var state = JSON.parse(localStorage["minora-savegame"])
	gamestate = state[0]
	items = state[1]
}


// hints drawn on the ground
function Marker(x, y, dstring) {
	this.x = x
	this.y = y
	this.dstring = dstring
	backeffects.push(this)
}
Marker.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp({
		draw: function () {
			UFX.draw(this.dstring)
		}
	})


var quests = {}

quests.runners = {
	init: function () {
		this.runner1 = new Runner(35, 21, -6, 21.5, true)
		this.runner2 = new Runner(32, 26, -6, 26)
		people.push(this.runner1)
		people.push(this.runner2)
		
		new Marker(-5, 24, [
			"[ r", tau/4, "z 0.1 0.1 lw 5 b m 40 0 l -40 0 ss rgba(0,0,0,0.4) s",
			"textalign center textbaseline top fs rgba(0,0,0,0.4) font 22px~'Luckiest~Guy' ft FINISH 0 5 ]"
		])
		this.finished = 0
	},
}

quests.minora = {
	init: function () {
		new Marker(0, 0, [
			"[ lw 1 ss rgba(255,0,0,0.2) b o 0 0 0.5 s b o 0 0 2 s b o 0 0 3.5 s ]",
			"[ r -0.3 t 0 8 z 0.1 0.1 fs rgba(255,0,0,0.2) textalign center font 40px~'Mouse~Memoirs' ft0 ATTACK~HERE ]",
		])
	}
}



