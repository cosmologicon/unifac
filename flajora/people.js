
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
			this.x = this.target[0]
			this.y = this.target[1]
			this.target = null
			return
		}
		this.step(step * dx / d, step * dy / d)
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


function You() {
}
You.prototype = UFX.Thing()
	.addcomp(WorldBound, 0, 0)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(MovesWithArrows)
	.addcomp(SaysStuff)
	.addcomp(DrawCircle)

// Generic responder, for giving clues
function Responder(x, y, text) {
	this.x = x
	this.y = y
	this.text = text
}
Responder.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(DrawCircle)
	.addcomp({
		response: function () {
			return this.text
		},
	})

// Race runner
function Runner(x, y, targetx, targety, cheater) {
	this.x = x
	this.y = y
	this.seek(targetx, targety)
	this.name = "Runner"
	this.cheater = cheater
}
Runner.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SeeksTarget, 12)
	.addcomp(DrawCircle)
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
			if (this.target) return "Get out of my way! I'm racing here!"
			if (this.cheater && this.finished) {
				if (this.winner) return "That's right, I won fair and square!"
				return "I can't believe I lost! Why did you let me lose??"
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
}
DogOwner.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SeeksTarget)
	.addcomp(DrawCircle)
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
			return quests.lostdog.done && !items.cereal
		},
		chat: function () {
			UFX.scenes.toget = "airbag"
			return "Wow you brought my dog to me! And no wonder, you smell terrible! I wish I could give you something valuable. Oh wait, no I don't. But you can have this bag."
		},
	})

function Dog(x, y) {
	this.x = x
	this.y = y
	this.t = 0
}
Dog.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(StopOnBump)
	.addcomp(SaysStuff)
	.addcomp(SeeksTarget, 3)
	.addcomp(DrawCircle)
	.addcomp({
		think: function (dt) {
			if (!this.target && !quests.lostdog.done && items.meat && dist(this, you) < 14) {
				this.target = [you.x, you.y]
				this.v = 10
			} else if (!this.target) {
				this.target = [this.x + UFX.random(-4, 4), this.y + UFX.random(-4, 4)]
				this.v = 3
			}
			this.t += dt
			this.say(this.t % 3 < 1 ? "arf!" : "")
		},
	})

function Traveller(x, y) {
	this.x = x
	this.y = y
	var train = quests.train.train
	this.target = [train.x + train.w/2, train.y + train.h/2]
	this.hasticket = true
}
Traveller.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SeeksTarget, 13.3)
	.addcomp(DrawCircle)
	.addcomp({
		response: function () {
			if (this.target) {
				return "Excuse me, I have to catch the last train out of town!"
			}
			return "Well I hope you're happy! I missed the train!"
		},
		canchat: function () {
			return !items.ticket && !this.target
		},
		chat: function () {
			items.ticket = true
			return "I missed the train thanks to you! My ticket is worthless now! You take it, jerk!"
		},
	})

function Squirrel(trees) {
	this.trees = trees.slice(0)
	var tree = this.trees.shift()
	this.x = tree.x + tree.r + this.r
	this.y = tree.y + tree.r + this.r
	this.name = "Skwirlle"
}
Squirrel.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(IsRound)
	.addcomp(Steps)
	.addcomp(SaysStuff)
	.addcomp(Responds)
	.addcomp(SeeksTarget, 40)
	.addcomp(DrawCircle)
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
			return "You scared me! Look, would you take this ladder for me? It's just slowing me down. You can use it to reach my treehouse... er... I forget which tree it's in."
		},
	})



