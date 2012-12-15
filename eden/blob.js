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
		this.platform = null
		this.vx = 0
		this.vy = 0
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
}



function Blob(x, y) {
	this.x = x
	this.y = y
	this.h = settings.blobheight
	this.setstate(HopState)
}
Blob.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(KeepsLastPosition)
	.addcomp(FacesDirection)
	.addcomp(HasStates, ["think", "draw", "land"])

var blobs = []


