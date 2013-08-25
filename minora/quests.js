
var gamestate = {}
var items = {
	kazoo: true,
//	meat: true,
//	sneakers: true,
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
		this.runner1 = new Runner(47, -33, -37, -17)
		this.runner2 = new Runner(50, -27, -36, -13, true)
		people.push(this.runner1)
		people.push(this.runner2)
		
		new Marker(-35, -15, [
			"[ r", tau*0.2, "z 0.1 0.1 lw 5 b m 40 0 l -40 0 ss rgba(0,0,0,0.4) s",
			"textalign center textbaseline top fs rgba(0,0,0,0.4) font 22px~'Luckiest~Guy' ft FINISH 0 5 ]"
		])
		this.finished = 0
	},
}

quests.lostdog = {
	init: function () {
		this.done = false
		this.owner = new DogOwner(-15, 60)
		this.dog = new Dog(-60, 40)
		people.push(this.owner)
		people.push(this.dog)
		new House(-38, 25, 12, 35)
	},
}

quests.minora = {
	init: function () {
		if (!items.kazoo && you.x * you.x + you.y * you.y < 2 * 2) {
			you.say("This does not look good. I better get the hell out of here using the arrow keys!")
		} else {
			you.shutup()
		}

		people.push(new Responder(-15, 5, "You want a kazoo? I know where to get one. Go straight to the north of here. Just mention me!"))
		people.push(new Responder(60, 25, "Fine, here's your damn kazoo!"))

		new Marker(0, 0, [
			"[ z 2 2 lw 1 ss rgba(255,0,0,0.2) b o 0 0 0.5 s b o 0 0 2 s b o 0 0 3.5 s ]",
			"[ r -0.3 t 0 14 z 0.2 0.2 fs rgba(255,0,0,0.2) textalign center font 40px~'Mouse~Memoirs' ft0 ATTACK~HERE ]",
		])
		new Marker(-15, -80, [
			"[ z 0.2 0.2 r 2.1 fs rgba(0,0,255,0.3) ss rgba(0,0,255,0.3)",
			"( m 25 0 l 0 -15 l -25 0 ) f",
			"textalign center textbaseline top",
			"font 29px~'Mouse~Memoirs' ft North 0 0",
			"font 20px~'Mouse~Memoirs' ft is~that~way 0 25",
			"font 14px~'Mouse~Memoirs' ft just~so~you~know 0 45",
		"]"])
		new House(-25, -42, 25, 15)
		new House(-18, -65, 28, 15)
		new House(30, 18, 20, 10)

	}
}

quests.train = {
	init: function () {
		this.train = new Train(30, 10)
		this.traveller = new Traveller(50, -80)
		people.push(this.traveller)

		// train tracks
		new Marker(30, 10, [
			"[ lw 1 b m -14 -2 l 500 -2 m -14 2 l 500 2 ss gray s ]",
		])
	},
	
	think: function (dt) {
		this.train.think(dt)
	},

}




