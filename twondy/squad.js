// A Squad is an object that coordinates the motion of a set of invaders.
// TODO: these should definitely be UFX.Things

// Typical behavior for an invader in a squad is:
// Invaders are assigned to a squad and a portal when they're created
// Their motion is controlled by the portal until they're through it.
// At that point their motion is controlled by the squad.
// The squad can "release" an invader at any time by giving it a rogue state.
// Rogue refers to any invader that's been released from its squad. From that point on
//   it operates without any orders from its former squad.
// Once all invaders have been released, the squad can be eliminated.
// The squad must take care that any invader may be killed at any point.

var squads = []

// A squad consisting of a single Aphid
function LonelySquad() {
	this.portal = new Portal(UFX.random(tau), UFX.random(100, 200))
	beffects.push(this.portal)
	this.members = [new Aphid(this)]
	monsters.push(this.members[0])
	this.t = 0
}
LonelySquad.prototype = {
	think: function (dt) {
		this.t += dt
	},
	onexitportal: function (obj) {
		obj.nextstate = [StationKeepingState, 50, 50]
	},
}

// A squad of station keeping aphids
function StationSquad(n, y, vx) {
	this.n = n
	this.y = y
	this.vx = vx
	this.portal = new Portal(UFX.random(tau), this.y + 50)
	this.portal.settilt((this.vx > 0 ? 1 : -1) * 0.9)
	beffects.push(this.portal)
	this.members = []
	for (var j = 0 ; j < this.n ; ++j) {
		var member = new Aphid(this)
		member.squad = this
		member.joinportal(this.portal)
		this.members.push(member)
		monsters.push(member)
	}
	this.t = 0
	this.nfree = 0
	this.spreadspeed = 20
	this.alive = true
}
StationSquad.prototype = {
	think: function (dt) {
		if (!this.members.length) {
			this.alive = false
			return
		}
		var allfree = allprop(this.members, "joinedsquad")
		this.n = this.members.length
		if (allfree) {
			this.t += dt
			for (var j = 0 ; j < this.n ; ++j) {
				var X = this.members[j].X
				for (var k = j+1 ; k < this.n ; ++k) {
					var dX = getdX(X, this.members[k].X)
					var dvx = dt * this.spreadspeed * (dX > 0 ? 1 : -1) / (1 + dX * dX)
					this.members[j].vx -= dvx
					this.members[k].vx += dvx
				}
			}
			if (this.t > 10) {
				var member = UFX.random.choice(this.members)
				this.release(member)
				member.release()
				this.t = 5
			}
		}
		this.members = fprop(this.members, "alive")
	},
	release: function (member) {
		this.members = this.members.filter(function (m) { return m !== member })
	},
	onexitportal: function (obj) {
		obj.joinedsquad = true
		obj.nextstate = [StationKeepingState, {
			targety: this.y, approachyA: UFX.random(25,50), approachyphi: UFX.random(2, 4),
			targetvx: this.vx,
		}]
		this.nfree += 1
	},
}


