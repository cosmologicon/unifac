
var gamestate = {}
var allitems = "kazoo sneakers meat airbag ladder ticket redgem greengem bluegem flask".split(" ")
var items = {
	kazoo: true,
//	meat: true,
	ticket: true,
//	sneakers: true,
	redgem: true,
	bluegem: true,
	greengem: true,
	ladder: true,
	airbag: true,
//	flask: true,
}

var itemnames = {
	kazoo: "The Spacetime Kazoo",
	meat: "A Big Thing of Meat",
	ticket: "Train Ticket",
	sneakers: "Enchanted Sneakers",
	redgem: "The Red Gem of Rolanda",
	bluegem: "The Blue Gem of Betsy",
	greengem: "The Green Gem of Gertrude",
	ladder: "A Rope Ladder",
	airbag: "A Bag of Air",
	flask: "Flajora's Flask",
}

var iteminfo = {
	kazoo: "It doesn't look like much, but this kazoo is actually a time machine! It's not a very good one, though. You'll only go back a few seconds. Hope that's enough. Press Backspace to use it at any time.",
	ticket: "What the heck are you going to do with an expired train ticket? Oh right, time travel. This whole business opens up all sorts of ethical quandries, doesn't it?",
	sneakers: "These have flashy colors and the name of your favorite athlete, so they'll be sure to give you an edge. Also they're enchanted by a powerful sorcerer so there's that.",
	meat: "No snacking, you're on an adventure. You'll have time for eating later. Well, actually, not, since the world's ending in a few seconds. Oh well.",
	airbag: "It looks like an empty bag, but in fact it's quite full! Full of air! You scoff, but you need that stuff to breathe. Now you can take your air with you.",
	ladder: "I know what you're thinking, but no, you can not use this ladder to climb to space and stop Flajora. You keep thinking outside the box, though. You'll go far.",
	flask: "An old whiskey flask hidden under Flajora's pillow. It's currently half-full of grape Kool-Aid, and appears to have great sentimental value.",
	redgem: "Yay, plot coupon collected.",
	bluegem: "Yep... that's a MacGuffin all right.",
	greengem: "Among the junk strewn in the corner of the treehouse you find this ancient artifact. Also some pretty cool limited edition pogs, but we'll save that for another time.",
}

function savegame() {
	localStorage["flajora-savegame"] = JSON.stringify([gamestate, items])
}
function loadgame() {
	var state = JSON.parse(localStorage["flajora-savegame"])
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

function Teleporter(x, y) {
	this.x = x
	this.y = y
	backeffects.push(this)
	this.t = 0
}
Teleporter.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp({
		draw: function () {
			var a = this.t * 2, da = tau/3
			if (items.redgem) UFX.draw("[ t", 5*Math.sin(a), 5*Math.cos(a), "alpha 0.5 fs #faa b o 0 0 8 f ]")
			if (items.bluegem) UFX.draw("[ t", 5*Math.sin(a+da), 5*Math.cos(a+da), "alpha 0.5 fs #aaf b o 0 0 8 f ]")
			if (items.greengem) UFX.draw("[ t", 5*Math.sin(a+2*da), 5*Math.cos(a+2*da), "alpha 0.5 fs #afa b o 0 0 8 f ]")
		},
		think: function (dt) {
			this.t += dt
		},
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
		people.push(new Giver(65, -25, "meat", "Linda",
			"And remember you never heard of me.",
			"Meat! Free raw meat!",
			"Hey you. I'm looking to dispose of some incriminating evidence. You want a slab of raw meat?")
		)
	},
}

quests.flajora = {
	init: function () {
		if (!items.kazoo && you.x * you.x + you.y * you.y < 2 * 2) {
			you.say("This does not look good. I better get the hell out of here using the arrow keys!")
		} else {
			you.shutup()
		}

		people.push(new Responder(-15, 5, "I've got a hot tip on where you can get some enchanted instruments. Go straight to the north of here."))
		people.push(new Giver(60, 25, "kazoo", "Raven",
			"Why didn't I go into the enchanted charm business instead?",
			"Psst hey you. You want an enchanted kazoo?",
			"I'm trying to get pepole hooked on enchanted novelty instruments. The market's just not there yet. Here, the first one's free. Use it frivolously!")
		)

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
		this.teleporter = new Teleporter(15, 40)
		new House(-25, -42, 25, 15)
		new House(-18, -65, 28, 15)
		new House(30, 18, 20, 10)
		new Placename("Doomburg")

	},
	think: function (dt) {
		this.teleporter.think(dt)
		if (items.redgem && items.bluegem && items.greengem) {
			var dx = this.teleporter.x - you.x, dy = this.teleporter.y - you.y
			if (dx * dx + dy * dy < 5 * 5) {
				UFX.scenes.game.fadeto("ship")
			}
		}
	},
}

quests.train = {
	init: function () {
		this.train = new Train(30, 10)
		this.traveller = new Traveller(50, -80)
		// Only make this quest available after you have the sneakers
		// so you don't get caught in the desert
		if (!items.sneakers) this.traveller.y -= 5000
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


quests.lake = {
	init: function () {
		this.lake = new Lake(-90, 0, 36)
	},
	think: function (dt) {
		var dx = this.lake.x - you.x, dy = this.lake.y - you.y
		if (dx * dx + dy * dy < 33 * 33) {
			UFX.scenes.game.fadeto("lake")
		}
	},
}


quests.tree = {
	init: function () {
		this.tree0 = new Tree(15, -15, 3.5)
		this.trees = [
			new Tree(3, 52, 2),
			new Tree(50, -10, 2),
			new Tree(-45, -55, 2),
		]
		frontscenery.push(this.tree0)
		frontscenery.push(this.trees[0])
		frontscenery.push(this.trees[1])
		frontscenery.push(this.trees[2])

		this.squirrel = new Squirrel(this.trees)
		people.push(this.squirrel)
	},
	think: function (dt) {
		var dx = this.tree0.x - you.x, dy = this.tree0.y - you.y
		if (items.ladder && dx * dx + dy * dy < 5 * 5) {
			UFX.scenes.game.fadeto("tree")
		}
	},
}



// New scene quests, boss fights
var lakequest = {
	init: function () {
		new Placename("Lake Blubb")
		new Marker(0, 3, [
			"[ z 0.2 0.2 fs rgba(0,0,0,0.3) ss rgba(0,0,0,0.3)",
			"( m 25 0 l 0 -15 l -25 0 ) f",
			"textalign center textbaseline top",
			"font 18px~'Mouse~Memoirs' ft This~way~to~the 0 0",
			"font 30px~'Mouse~Memoirs' ft Blue~Gem 0 25",
		"]"])
		new Marker(0, -40, [
			"[ ss rgba(0,0,0,0.3) lw 3 b o 0 0 5 s ]",
		])
		new Marker(0, -60, [
			"[ ss rgba(0,0,0,0.3) lw 3 b o 0 0 5 s ]",
		])
		new Marker(0, -80, [
			"[ ss rgba(0,0,0,0.3) lw 3 b o 0 0 5 s ]",
		])

		this.vortices = []
		for (var j = 0 ; j < 80 ; ++j) {
			var x = 0, y = -120, r = UFX.random(8, 16)
			var A = UFX.random(tau), R = 15 + 90 * Math.sqrt(UFX.random())
			var phi = (UFX.random() < 0.5 ? 1 : -1) * UFX.random(14, 30) / R
			var vortex = new Vortex(x, y, r, A, R, phi)
			this.vortices.push(vortex)
			frontscenery.push(vortex)
		}
	},
	think: function (dt) {
		this.vortices.forEach(function (vortex) { vortex.think(dt) })
	},
}
var desertquest = {
	init: function () {
		new Placename("Tostito Desert")
		new Marker(0, 3, [
			"[ z 0.2 0.2 fs rgba(255,0,0,0.3) ss rgba(255,0,0,0.3)",
			"( m 25 0 l 0 -15 l -25 0 ) f",
			"textalign center textbaseline top",
			"font 18px~'Mouse~Memoirs' ft This~way~to~the 0 0",
			"font 30px~'Mouse~Memoirs' ft Red~Gem 0 25",
		"]"])

		new Marker(0, -40, [
			"[ z 1 2 r", tau/8, "ss rgba(255,0,0,0.3) lw 3 sr -6 -6 12 12 ]",
		])
		new Marker(0, -90, [
			"[ z 1 2 r", tau/8, "ss rgba(255,0,0,0.3) lw 3 sr -6 -6 12 12 ]",
		])
		new Marker(0, -130, [
			"[ b o 0 0 5 ss red s ]",
		])


		this.rocks = []
		while (this.rocks.length < 20) this.addrock()
		this.t = 0
	},
	addrock: function () {
		var x0 = you.x, y0 = you.y - 30
		var rock = UFX.random() < 0.5 ? new Rock(
			x0 + UFX.random(20, 40), y0 + UFX.random(-30, -70),
			UFX.random(5, 8),
			UFX.random(-30, -15), UFX.random(10, 20)
		) : new Rock(
			x0 + UFX.random(-40, -20), y0 + UFX.random(-70, -30),
			UFX.random(5, 8),
			UFX.random(15, 30), UFX.random(10, 20)
		)
		this.rocks.push(rock)
		frontscenery.push(rock)
	},
	think: function (dt) {
		this.t += dt
		while (this.t > 0.05) {
			this.t -= 0.05
			this.addrock()
		}
		this.rocks.forEach(function (rock) { rock.think(dt) })
	},
}
// New scene quests, boss fights
var treequest = {
	init: function () {
		new Placename("Hoarder's Treehouse")
		new Marker(0, 3, [
			"[ z 0.2 0.2 fs rgba(255,255,255,0.3) ss rgba(255,255,255,0.3)",
			"( m 25 0 l 0 -15 l -25 0 ) f",
			"textalign center textbaseline top",
			"font 18px~'Mouse~Memoirs' ft This~way~to~the 0 0",
			"font 30px~'Mouse~Memoirs' ft Green~Gem 0 25",
		"]"])
		new Marker(0, -40, [
			"[ ss rgba(0,0,0,0.3) lw 3 ( m 0 -6 l -8 6 l 8 6 ) s ]",
		])
		new Marker(0, -60, [
			"[ ss rgba(0,0,0,0.3) lw 3 ( m 0 -6 l -8 6 l 8 6 ) s ]",
		])
		new Marker(0, -80, [
			"[ ss rgba(0,0,0,0.3) lw 3 ( m 0 -6 l -8 6 l 8 6 ) s ]",
		])
		this.windtunnels = []
		for (var x = -160 ; x < 160 ; x += 5) {
			var tunnel = new WindTunnel(x, -100, 5, 80)
			this.windtunnels.push(tunnel)
			backscenery.push(tunnel)
		}
	},
	think: function (dt) {
		this.windtunnels.forEach(function (tunnel) { tunnel.think(dt) })
	},
}

var shipquest = {
	init: function () {
		new Placename("Flajora's Spaceship")
		new Marker(0, 3, [
			"[ z 0.2 0.2 fs rgba(255,0,0,0.3) ss rgba(255,0,0,0.3)",
			"( m 25 0 l 0 -15 l -25 0 ) f",
			"textalign center textbaseline top",
			"font 18px~'Mouse~Memoirs' ft This~way~to 0 0",
			"font 30px~'Mouse~Memoirs' ft Flajora's~Flask 0 25",
		"]"])
		new Marker(0, -40, [
			"[ ss rgba(255,255,255,0.3) lw 3 sr -6 -6 12 12 ]",
		])
		new Marker(0, -60, [
			"[ ss rgba(255,255,255,0.3) lw 3 sr -6 -6 12 12 ]",
		])
		new Marker(0, -80, [
			"[ ss rgba(255,255,255,0.3) lw 3 sr -6 -6 12 12 ]",
		])
		this.bulkheads = []
		for (var y = 20 ; y < 100 ; y += 10) {
			this.addbulkhead(-60, -y, 18, 8, 20, 0)
			this.addbulkhead(-30, -y, 18, 8, 20, 0)
			this.addbulkhead(0, -y, 18, 8, 20, 0)
			this.addbulkhead(30, -y, 18, 8, 20, 0)
			this.addbulkhead(60, -y, 18, 8, 20, 0)
		}
		for (var x = -100 ; x < 100 ; x += 10) this.addbulkhead(x, -50, 8, 18, 0, 30)
	},
	addbulkhead: function (x, y, w, h, dx, dy) {
		var bulkhead = new Bulkhead(x, y, w, h, dx, dy, UFX.random(tau))
		this.bulkheads.push(bulkhead)
		frontscenery.push(bulkhead)
	},
	think: function (dt) {
		this.bulkheads.forEach(function (rock) { rock.think(dt) })
	},
}








