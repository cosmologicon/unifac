var HasStates = {
	init: function (methodnames) {
		var methods = {}
		methodnames.forEach(function (methodname) {
			methods[methodname] = function () {
				return this.state[methodname] ? this.state[methodname].apply(this, arguments) : null
			}
		})
		this.addcomp(methods)
	},
	setstate: function (state) {
		if (this.state && this.state.exit) {
			this.state.exit.call(this)
		}
		this.state = state
		if (this.state.enter) this.state.enter.call(this)
		this.nextstate = null
		this.think(0)
	},
	updatestate: function () {
		if (this.nextstate) {
			if (this.state.exit) this.state.exit.call(this)
			this.state = this.nextstate
			if (this.state.enter) this.state.enter.call(this)
			this.nextstate = null
			this.think(0)
		}
	},
}

var ChillState = {
	draw: function () {
		UFX.draw("b o 0", -this.h, this.h + 2, "fs blue ss darkblue lw 2 f s")
	},
}

var HopState = {
	enter: function () {
		this.hoptick = 0
	},
	think: function (dt) {
		if (this.platform) {
			this.hoptick += dt
			if (this.hoptick > settings.hopdelay) {
				this.vx = settings.hopvx * (this.facingright ? 1 : -1)
				this.vy = -settings.hopvy
				this.platform = null
			}
		} else {
			this.x += this.vx * dt
			this.y += this.vy * dt + 0.5 * settings.gravity * dt * dt
			this.vy += settings.gravity * dt
		}
	},
	draw: function () {
		UFX.draw("b o 0", -this.h, this.h + 2, "fs blue ss darkblue lw 2 f s")
		UFX.draw("b o 0 0 2 fs orange f")
	},
	land: function (platform) {
		this.platform = platform
		var p = this.platform.constrain(this.x, this.y)
		this.x = p[0] ; this.y = p[1]
		this.hoptick = 0
		this.vx = 0 ; this.vy = 0
	},
	bounce: function (platform) {
		var p = platform.constrain(this.x, this.y)
		var v = platform.bouncevector(this.vx, this.vy)
		console.log(this.x, this.y, this.vx, this.vy)
		console.log(p[0], p[1], v[0], v[1])
		this.vx = v[0]
		this.vy = v[1]
		this.facingright = this.vx > 0
		this.x = p[0] + this.vx * 0.001
		this.y = p[1] + this.vy * 0.001
	},
}

var DefyState = Object.create(HopState)
DefyState.defiant = true

var WantState = {
	greedy: true,
	enter: function () {
		this.vx = 0
		this.vy = 0
		this.platform = null
		this.target = gamestate.nearestgem(this.x, this.y)
	},
	think: function (dt) {
		this.x += this.vx * dt
		this.y += this.vy * dt
		var dx = this.target.x - this.x, dy = this.target.y - this.y
		var d = Math.sqrt(dx * dx + dy * dy)
		this.vx += settings.wanta * dt * dx / d
		this.vy += settings.wanta * dt * dy / d
		var v = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
		if (v > settings.wantv) {
			this.vx *= settings.wantv / v
			this.vy *= settings.wantv / v
		}
	},
	draw: function () {
		UFX.draw("b o 0", -this.h, this.h + 2, "fs blue ss darkblue lw 2 f s")
		UFX.draw("b o 0 0 2 fs orange f")
	},
	land: function (platform) {
	},
	bounce: function (platform) {
	},
}

var RageState = Object.create(HopState)
RageState.enter = function () {
	this.hoptick = 0
	this.ragetick = 0
}
RageState.think = function (dt) {
	this.ragetick += dt
	if (this.platform) {
		if (this.ragetick > settings.ragetime) {
			this.nextstate = HopState
		} else {
			this.vx = 0
			this.vy = -settings.ragehopvy
			this.platform = null
		}
	} else {
		this.x += this.vx * dt
		this.y += this.vy * dt + 0.5 * settings.ragegravity * dt * dt
		this.vy += settings.ragegravity * dt
	}
}
RageState.draw = function () {
	UFX.draw("b o 0", -this.h, this.h + 2, "fs red ss darkred lw 2 f s")
	UFX.draw("b o 0 0 2 fs orange f")
}


var Squishes = {
	draw: function () {
		if (this.vx || this.vy) {
			UFX.draw("r", -0.2 * Math.sin(2 * Math.atan2(this.vy, this.vx)))
		}
		var s = 1 + clip(this.vy / 600, -0.2, 0.2)
		UFX.draw("z", 1/s, s)
	},
}

function Blob(x, y) {
	this.x = x
	this.y = y
	this.vx = 0
	this.vy = 0
	this.h = settings.blobheight
	this.setstate(HopState)
}
Blob.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(KeepsLastPosition)
	.addcomp(Squishes)
	.addcomp(FacesDirection)
	.addcomp(HasStates, ["think", "draw", "land", "bounce"])
	.addcomp({
		applysin: function (sin) {
			if (sin == "defy" && this.state !== DefyState) this.nextstate = DefyState
			if (sin == "want" && this.state !== WantState) this.nextstate = WantState
			if (sin == "rage" && this.state !== RageState) this.nextstate = RageState
		},
	})
	.addcomp({ think: function (dt) { this.updatestate() } })

var blobs = []


