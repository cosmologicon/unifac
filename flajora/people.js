
var DrawCircle = {
	draw: function () {
		if (this.invisible) return
		UFX.draw("z 0.1 0.1 b o 0 0", this.r * 10, "lw 1 fs blue ss black lw 1 f s")
	},
}


var Steps = {
	step: function (dx, dy) {
		this.x += dx
		this.y += dy
		var x0 = this.x, y0 = this.y
		for (var j = 0 ; j < colliders.length ; ++j) {
			if (colliders[j] === this) continue
			colliders[j].scootch(this)
		}
		if (this.x !== x0 || this.y !== y0) this.bumped()
	},
	bumped: function () {
	},
}

var StopOnBump = {
	bumped: function () {
		this.target = null
	},
}

var MovesWithArrows = {
	init: function () {
	},
	move: function (kdown) {
		var dx = (kdown.right || 0) - (kdown.left || 0)
		var dy = (kdown.down || 0) - (kdown.up || 0)
		
		if (dx && dy) {
			dx *= 0.707
			dy *= 0.707
		}
		this.v = items.sneakers ? mechanics.runspeed : mechanics.walkspeed
		this.vx = dx * this.v
		this.vy = dy * this.v
	},
	think: function (dt) {
		this.step(dt * this.vx, dt * this.vy)
	},
}


var SeeksTarget = {
	init: function (v) {
		this.v = v || 10
		this.vx = this.vy = 0
	},
	seek: function (x, y) {
		this.target = [x, y]
	},
	think: function (dt) {
		if (!this.target) return
		var dx = this.target[0] - this.x, dy = this.target[1] - this.y
		var d = Math.sqrt(dx * dx + dy * dy)
		var step = this.v * dt
		if (d <= step) {
			this.vx = this.vy = 0
			this.x = this.target[0]
			this.y = this.target[1]
			this.target = null
			return
		}
		this.step(step * dx / d, step * dy / d)
		this.vx = this.v * dx / d
		this.vy = this.v * dy / d
	},
}


// Saying/responding refers to the speech bubbles that come up without pressing space.
// Chatting refers to a popup that stops the action

var SaysStuff = {
	say: function (text) {
		if (this.bubble && text === this.bubble.text) return
		if (this.bubble) this.shutup()
		if (text) this.bubble = new SpeechBubble(this, text)
	},
	shutup: function () {
		if (this.bubble) this.bubble.die()
		this.bubble = null
	},
}

// Say a speech bubble when the player gets close enough
var Responds = {
	init: function (rsay) {
		this.rsay = rsay || 4
	},
	think: function (dt) {
		var dx = you.x - this.x, dy = you.y - this.y
		if (dx * dx + dy * dy < this.rsay * this.rsay) {
			this.say(this.response())
		} else {
			this.shutup()
		}
	},
}

var SwingsArms = {
	init: function (hcolor, scolor, pcolor) {
		this.hcolor = hcolor || "#a80"
		this.scolor = scolor || "#0a0"
		this.pcolor = pcolor || "brown"
		this.walkt = 0
	},
	setrandomcolors: function (name) {
		var s = UFX.random.seed
		UFX.random.setseed(name)
		this.hcolor = UFX.random.choice("#000 #333 #666 #999 #a80 #a77 #955".split(" "))
		this.scolor = UFX.random.choice("red blue brown orange green pink".split(" "))
		this.pcolor = UFX.random.choice("brown black gray".split(" "))
		UFX.random.setseed(s)
	},
	think: function (dt) {
		if (this.facing === undefined) this.facing = UFX.random(tau)
		if (this.vx || this.vy) {
			this.facing = Math.atan2(-this.vx, this.vy)
			this.walkt += dt * Math.sqrt(this.vx * this.vx + this.vy * this.vy)
		} else {
			this.walkt = 0
		}
	},
	draw: function () {
		if (!camera.onscreen(this.x, this.y, this.r + 2)) return
		var a = Math.sin(this.walkt * 0.5)
		UFX.draw("z 0.1 0.1 r", this.facing)
		UFX.draw("[ t 4.5", -5*a, "z 3 3 b o 0 0 2 fs", this.pcolor, "f ]")
		UFX.draw("[ t -4.5", 5*a, "z 3 3 b o 0 0 2 fs", this.pcolor, "f ]")
		UFX.draw("[ r", 0.3*a, "z 2 1 b o 0 -1 6 fs", this.scolor, "f ]")
		UFX.draw("[ r", 0.4*a, "t 11 4 z 1 1.5 b o 0 0 4 fs", this.scolor, "f ]")
		UFX.draw("[ r", 0.4*a, "t -11 4 z 1 1.5 b o 0 0 4 fs", this.scolor, "f ]")
		UFX.draw("[ z 1 1.2 b o 0 0 6 fs", this.hcolor, "f ]")
//		UFX.draw("b m 0 0 l 0 20 lw 1 ss white s")
	},

}



function You() {
}
You.prototype = UFX.Thing()
	.addcomp(WorldBound, 0, 0)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(MovesWithArrows)
	.addcomp(SaysStuff)
	.addcomp(SwingsArms)

// Generic responder, for giving clues
function Responder(x, y, text) {
	this.x = x
	this.y = y
	this.text = text
	this.setrandomcolors(this.text)
}
Responder.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SwingsArms)
	.addcomp({
		response: function () {
			return this.text
		},
	})

// Someone who just gives you an item
function Giver(x, y, item, name, nohaveresp, haveresp, chattext) {
	this.x = x
	this.y = y
	this.item = item
	this.name = name
	this.nohaveresp = nohaveresp
	this.haveresp = haveresp
	this.chattext = chattext
	this.setrandomcolors(this.name)
}
Giver.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SwingsArms)
	.addcomp({
		response: function () {
			return items[this.item] ? this.haveresp : this.nohaveresp
		},
		canchat: function () {
			return !items[this.item]
		},
		chat: function () {
			UFX.scenes.game.toget = this.item
			return this.chattext
		},
	})



// Race runner
function Runner(x, y, targetx, targety, cheater) {
	this.x = x
	this.y = y
	this.seek(targetx, targety)
	this.cheater = cheater
	this.name = cheater ? "Vince" : "Vance"
	this.setrandomcolors(this.name)
}
Runner.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SeeksTarget, 12)
	.addcomp(SwingsArms)
	.addcomp({
		think: function (dt) {
			if (!this.target && !this.finished) {
				this.finished = true
				if (quests.runners.finished++ == 0) {
					this.winner = true
				}
			}
		},
		response: function () {
			if (this.target) return "Get out of the way! I'm racing here!"
			if (this.finished) {
				if (this.cheater) {
					if (this.winner) return "That's right, I won fair and square!"
					return "I can't believe I lost! Why did you let me lose??"
				} else {
					return "Nobody like a sore loser."
				}
			}
		},
		canchat: function () {
			return this.cheater && this.winner && !items.sneakers
		},
		chat: function () {
			UFX.scenes.game.toget = "sneakers"
			return "Thanks for helping me cheat, you big cheater! I like your style. Take my lucky sneakers, Cheaty McCheaterson. And hey... keep on cheating!"
		},
	})


// Dog owner
function DogOwner(x, y) {
	this.x = x
	this.y = y
	this.name = "Timmy"
	this.setrandomcolors(this.name)
}
DogOwner.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SeeksTarget)
	.addcomp(SwingsArms)
	.addcomp({
		think: function (dt) {
			if (!quests.lostdog.done && dist(this, quests.lostdog.dog) < 4) {
				quests.lostdog.done = true
			}
		},
		response: function () {
			if (quests.lostdog.done) {
				return "Ah, got my dog back. Now to go sell her on the puppy black market."
			}
			return "Have you seen my lost dog? I tried calling her, but her hearing is much worse than her sense of smell...."
		},
		canchat: function () {
			return quests.lostdog.done && !items.airbag
		},
		chat: function () {
			UFX.scenes.game.toget = "airbag"
			return "Wow you brought my dog to me! And no wonder, you smell terrible! I wish I could give you something valuable. Oh wait, no I don't. But you can have this bag."
		},
	})

function Dog(x, y) {
	this.x = x
	this.y = y
	this.t = 0
	this.facing = UFX.random(tau)
}
Dog.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(StopOnBump)
	.addcomp(SaysStuff)
	.addcomp(SeeksTarget, 1)
	.addcomp({
		draw: function () {
			UFX.draw("r", this.facing, "z 0.1 0.1 rr -4 -6 8 12 3 fs #666 ss #999 f s")
		},
		think: function (dt) {
			if (!this.target && !quests.lostdog.done && items.meat && dist(this, you) < 14) {
				this.target = [you.x, you.y]
				this.v = 10
			} else if (!this.target) {
				this.target = [this.x + UFX.random(-4, 4), this.y + UFX.random(-4, 4)]
				this.v = 1
			}
			this.t += dt
			this.say(this.t % 3 < 1 ? "arf!" : "")
			if (this.vx || this.vy) {
				this.facing = Math.atan2(-this.vx, this.vy)
			}
		},
	})

function Traveller(x, y) {
	this.x = x
	this.y = y
	var train = quests.train.train
	this.target = [train.x + train.w/2, train.y + train.h/2]
	this.hasticket = true
	this.name = "Emmett"
	this.setrandomcolors(this.name)
}
Traveller.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SeeksTarget, 13.3)
	.addcomp(SwingsArms)
	.addcomp({
		response: function () {
			if (this.target) {
				return "Excuse me, I have to catch the last train out of town!"
			}
			return "I hope you're happy! I missed the train!"
		},
		canchat: function () {
			return !items.ticket && !this.target
		},
		chat: function () {
			UFX.scenes.game.toget = "ticket"
			return "I missed the train thanks to you, and now I'm stuck here for the end of the world. I paid good money for this ticket, and now it's worthless! Here, you take it, jerk!"
		},
	})

function Squirrel(trees) {
	this.trees = trees.slice(0)
	var tree = this.trees.shift()
	this.x = tree.x + tree.r + this.r
	this.y = tree.y + tree.r + this.r
	this.name = "Skwirlle"
	this.setrandomcolors(this.name)
}
Squirrel.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SeeksTarget, 40)
	.addcomp(SwingsArms)
	.addcomp({
		think: function (dt) {
			if (this.target) {
				this.say("Aaaaah!")
				var dx = this.target[0] - this.x, dy = this.target[1] - this.y, dr = this.r + 2
				if (dx * dx + dy * dy < 1.1 * dr * dr) {
					this.target = null
					this.shutup()
				}
			} else {
				if (this.trees.length) {
					var dx = you.x - this.x, dy = you.y - this.y, dr = 6
					if (dx * dx + dy * dy < dr * dr) {
						var tree = this.trees.shift()
						this.target = [tree.x, tree.y]
					}
				}
			}
		},
		response: function () {
			if (!this.trees.length && !this.target) {
				return "Fine, you caught me."
			} else {
				return "Aaaaah!"
			}
		},
		canchat: function () {
			return !this.trees.length && !this.target && !items.ladder
		},
		chat: function () {
			UFX.scenes.game.toget = "ladder"
			return "You scared me! Look, would you take this ladder for me? It's just slowing me down. You can use it to reach my treehouse... er... I forget which tree it's in."
		},
	})

function Conversator(x, y, name, angle, even) {
	this.x = x
	this.y = y
	this.name = name
	this.setrandomcolors(this.name)
	this.facing = angle
	this.even = even
	this.t = 0
}
Conversator.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(SaysStuff)
	.addcomp(SwingsArms)
	.addcomp({
		think: function (dt) {
			this.t += dt
			var j = clip(Math.floor(this.t / 2), 0, 4)
			var conversation = [
				"What is up with all these alien invasion attempts lately?",
				"Also it doesn't really make sense with the fantasy setting. It's too sci-fi.",
				"Oh but there was an alien invasion minigame in Majora's Mask too. Remember, on Romani Ranch?",
				"Is that the one where they're abducting cattle and you need to shoot them with your bow?",
				"Yeah... the whole thing is pretty strange, when you think about it.",
			]
			if ((j % 2 == 0) == this.even) {
				this.say(conversation[j])
			} else {
				this.shutup()
			}
		},
		canchat: function () {
			return true
		},
		chat: function () {
			return "Can't you see we're having a conversation?"
		},
	})



