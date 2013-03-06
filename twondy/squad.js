// A Squad is an object that coordinates the motion of a set of invaders.
// TODO: these should definitely be UFX.Things

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
	this.portal.settilt((this.vx > 0 ? 1 : -1) * 1.1)
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
}
StationSquad.prototype = {
	think: function (dt) {
		this.t += dt
		if (this.nfree == this.n) {
			for (var j = 0 ; j < this.n ; ++j) {
				var X = this.members[j].X
				for (var k = j+1 ; k < this.n ; ++k) {
					var dX = getdX(X, this.members[k].X)
					var dvx = dt * this.spreadspeed * (dX > 0 ? 1 : -1) / (1 + dX * dX)
					this.members[j].vx -= dvx
					this.members[k].vx += dvx
				}
			}
		}
	},
	onexitportal: function (obj) {
		obj.nextstate = [StationKeepingState, { targety: this.y, targetvx: this.vx }]
		this.nfree += 1
	},
}


