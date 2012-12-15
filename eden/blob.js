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



function Blob(x, y) {
	this.x = x
	this.y = y
	this.h = settings.blobheight
	this.setstate(ChillState)
}
Blob.prototype = UFX.Thing()
	.addcomp(WorldBound)
	.addcomp(FacesDirection)
	.addcomp(HasStates, ["think", "draw"])

var blobs = []


