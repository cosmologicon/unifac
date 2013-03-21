
// Camera states - what to look at, and how responsively to look there
var CameraStates = {}

// Standard gameplay mode - follows Zoop around
CameraStates.action = {
	enter: function () {
		this.Y1 = this.Y
		this.Y2 = this.Y
		this.fX = 0
	},
	think: function (dt) {

		var h1 = 0.2, h2 = 0.8, zmax = 2.5, zmin = 1.5
		var Y1 = gamestate.worldr, Y2 = 40 + you.y + gamestate.worldr
		var f = 2.5 * dt
		this.Y1 += (Y1 - this.Y1) * f
		this.Y2 += (Y2 - this.Y2) * f
		if ((this.Y2 - this.Y1) * zmax < settings.sy * (h2 - h1)) {
			this.zoom = zmax
			this.Y = this.Y1 + (0.5 - h1) * settings.sy / this.zoom
		} else if ((this.Y2 - this.Y1) * zmin > settings.sy * (h2 - h1)) {
			this.zoom = zmin
			this.Y = this.Y2 - (h2 - 0.5) * settings.sy / this.zoom
		} else {
			this.zoom = (h2 - h1) * settings.sy / (this.Y2 - this.Y1)
			this.Y = this.Y1 + (0.5 - h1) * settings.sy / this.zoom
		}

		var X = you.X + (you.facingright ? 25 : -25) / (you.y + gamestate.worldr)
		this.targetX = X
		var dX = getdX(this.X, this.targetX)
		if (this.dX * dX <= 0) this.fX = 0
		this.dX = dX
		if (this.fX == 0 && Math.abs(dX) * this.Y < 60) {
		} else if (Math.abs(dX) < 0.01) {
			this.X = this.targetX
			this.dX = 0
		} else {
			this.fX = this.fX ? this.fX + 3 * dt : 1
			this.X += dX * this.fX * dt
		}
			
	},
}


// Transition to CameraStates.follow
CameraStates.tofollow = {
	enter: function (obj, z, tscale) {
		this.obj = obj || you
		this.X0 = this.X
		this.Y0 = this.Y
		this.z0 = this.z
		this.zfix = z || 3
		this.tscale = tscale || 1
		this.t = 0
	},
	think: function (dt) {
		this.t += dt
		if (this.t >= this.tscale) {
			this.nextstate = [CameraStates.follow, this.obj, this.zfix]
			return
		}
		var f = this.t / this.tscale
		this.X = this.X0 + getdX(this.X0, this.obj.X) * f
		this.Y = this.Y0 * (1-f) + (this.obj.y + gamestate.worldr) * f
		this.zoom = Math.exp(Math.log(this.zoom) * (1-f) + Math.log(this.zfix) * f)
	},
}

CameraStates.follow = {
	enter: function (obj, z) {
		this.obj = obj || you
		this.zfix = z || 3
	},
	think: function (dt) {
		this.X = this.obj.X
		this.Y = this.obj.y + gamestate.worldr
		this.z = this.zfix
	},
}



var camera = UFX.Thing()
	.addcomp(HasStates, ["think"])
	.addcomp({
		init: function () {
			this.X = 0
			this.Y = 0
			this.zoom = 1
			this.nextstate = CameraStates.action
		},
		think: function (dt) {
			this.S = Math.sin(this.X)
			this.C = Math.cos(this.X)
			this.p0 = getPos(this.X, this.Y)
			if (dt) this.updatestate()
		},
		orient: function () {
			context.translate(settings.sx/2, settings.sy/2)
			context.scale(this.zoom, -this.zoom)
			context.translate(0, -this.Y)
			context.rotate(this.X)
		},
	})

// Convert world coordinates to screen coordinates
// TODO: update this when we can have an x-offset plz thx
function worldtoscreen(X, y) {
	var p = getpos(X, y)
	var dx = p[0] - camera.p0[0], dy = p[1] - camera.p0[1]
	return [
		settings.sx / 2 + (dx * camera.C + dy * -camera.S) * camera.zoom,
		settings.sy / 2 - (dx * camera.S + dy * camera.C) * camera.zoom,
	]
}
// Is the position (X, y) within d units of a point that's currently visible?
// TODO: needs work
function isvisible(X, y, d) {
	return true
}


