// The control state object

// The basic setup for input/event handling in this game is:

// 1. input originates as JavaScript objects
// 2. these are captured by UFX and translated into a JSON-able data structures called the istate
// 3. the istate is passed to the controlstate object, which converts it into a set of
//    (non-JSONable) cevent objects. These represent events relevant to the game

// Size of the logical canvas also lives here. This could be different from the size of the physical
// canvas in playbacks.

// controlstate is separate from the game state, and will not be saved if you save the game state.

// Here are the types of cevents:

// MOUSE EVENTS
//   lstart (when the left mouse button is initially held down)
//   lclick
//   ldrag (occurs every frame that a drag is occuring)
//   ldrop (occurs when the mouse is released)
//   scroll
// TOUCH EVENTS
//   tstart (will become tap, touch drag, or swipe)
//   tap
//   tdrag
//   trelease


// Mouse/touch events have the following members:
//   panel: the panel where the event originated
//   tpanel: the panel where the event ended (or continued to)

var controlstate = {
	reset: function () {
		// TODO: replace the functionality of UFX.maximize here and actually set the canvas
		// manually
		this.wD = canvas.width
		this.hD = canvas.height
		
		this.lstart = null
		this.tstart = null
		this.tstuck = false
		
		this.fsquirm = 1
		this.gridalpha = 0
	},
	// Call this once per frame, passing in dt and input.
	// Will return an object with all relevant state.
	think: function (dt, input) {
	
		this.fsquirm = clamp(this.fsquirm + (this.selectedshape ? -0.5 : 0.3) * dt, 0, 1)
		this.gridalpha = clamp(this.gridalpha + (this.selectedshape ? 2 : -4) * dt, 0, 0.6)
		
		var kstate = input.key, mstate = input.mouse, tstate = input.touch
		var kdown = kstate ? kstate.down : {}

		// Set the size of the canvas and the panels		
		this.wD = canvas.width
		this.hD = canvas.height

		if (this.wD > 1.5 * this.hD) {  // three-panel horizontal
			var swD = Math.floor(0.25 * this.hD), pwD = this.wD - 2 * swD
			stalkpanel.placeD(0, 0, swD, this.hD)
			playpanel.placeD(swD, 0, pwD, this.hD)
		} else if (this.wD > this.hD) { // two-panel horizontal
			var swD = Math.floor(this.wD / 6), pwD = this.wD - swD
			stalkpanel.placeD(0, 0, swD, this.hD)
			playpanel.placeD(swD, 0, pwD, this.hD)
		} else if (this.hD < 1.5 * this.wD) {  // two-panel vertical
			var shD = Math.floor(this.hD / 6), phD = this.hD - shD
			stalkpanel.placeD(0, phD, this.wD, shD)
			playpanel.placeD(0, 0, this.wD, phD)
		} else {  // three-panel vertical
			var shD = Math.floor(0.25 * this.wD), phD = this.hD - 2 * shD
			stalkpanel.placeD(0, shD+phD, this.wD, shD)
			playpanel.placeD(0, shD, this.wD, phD)
		}
		
		panels = [playpanel, stalkpanel]

		var cevents = []

		// Handle left mouse clicks
		if (mstate) {
			var mposD = mstate.pos && [mstate.pos[0], this.hD - mstate.pos[1]]
			this.mposD = mposD
			var panel = catcherD(mposD)
			// TODO: do a better job when a mousedown and mouseup events occur in the same update
			if (mstate.left.down) {
				var posD = [mstate.left.down[0], this.hD - mstate.left.down[1]]
				var panel0 = catcherD(posD)
				this.lstart = {
					pos0D: posD,
					posD: posD,
					panel: panel0,
					t: 0,
					dragged: false,
				}
				cevents.push({
					type: "lstart",
					posD: posD,
					panel: panel0,
				})
			}
			if (this.lstart) {
				this.lstart.t += dt
				if (!this.lstart.dragged) {
					if (this.lstart.t > constants.dragtime) this.lstart.dragged = true
					var dxD = mposD[0] - this.lstart.posD[0], dyD = mposD[1] - this.lstart.posD[1]
					if (Math.abs(dxD) + Math.abs(dyD) > constants.dragdistanceD) this.lstart.dragged = true
				}
				if (this.lstart.dragged) {
					cevents.push({
						type: "ldrag",
						pos0D: this.lstart.posD,
						panel: this.lstart.panel,
						posD: mposD,
						dposD: [mposD[0] - this.lstart.posD[0], mposD[1] - this.lstart.posD[1]],
						tpanel: panel,
						t: this.lstart.t,
					})
					this.lstart.posD = mposD
				}
			}
			if (mstate.left.up && this.lstart) {
				if (this.lstart.dragged) {
					cevents.push({
						type: "ldrop",
						pos0D: this.lstart.posD,
						panel: this.lstart.panel,
						posD: mposD,
						tpanel: panel,
						t: this.lstart.t,
					})
				} else {
					cevents.push({
						type: "lclick",
						posD: this.lstart.posD,
						panel: this.lstart.panel,
					})
				}
				this.lstart = null
			}
			if (mstate.wheeldy) {
				cevents.push({
					type: "scroll",
					dy: mstate.wheeldy,
					posD: mposD,
					panel: panel,
				})
			}
		}
		// Handle touches
		if (tstate) {
			var ntouch = tstate.ids.length
			for (var j = 0 ; j < tstate.start.length ; ++j) {
				var otouches = ntouch - (tstate.start[j].id in tstate.ps ? 1 : 0)
				if (otouches) continue
				var posM = tstate.start[j].pos
				var posD = DconvertM(posM)
				var panel = catcherD(posD)
				cevents.push({
					type: "tstart",
					posD: posD,
					panel: panel,
				})
				this.tstart = {
					id: tstate.start[j].id,
					pos0D: posD,
					posD: posD,
					panel: panel,
					t: 0,
				}
			}
			if (this.tstart) {
				this.tstart.t += dt
				if (ntouch == 1 && tstate.ps[this.tstart.id]) {
					// TODO: only drag after the touch event has progressed passed tap
					var posD = DconvertM(tstate.ps[this.tstart.id])
					cevents.push({
						type: "tdrag",
						pos0D: this.tstart.posD,
						panel: this.tstart.panel,
						posD: posD,
						dposD: [posD[0] - this.tstart.posD[0], posD[1] - this.tstart.posD[1]],
						tpanel: panel,
						t: this.tstart.t,
					})
					this.tstart.posD = posD
				}
				for (var j = 0 ; j < tstate.tap.length ; ++j) {
					if (!this.tstart || tstate.tap[j].id != this.tstart.id) continue
					cevents.push({
						type: "tap",
						posD: this.tstart.posD,
						panel: this.tstart.panel,
					})
					this.tstart = null
				}
				for (var j = 0 ; j < tstate.release.length ; ++j) {
					if (!this.tstart || tstate.release[j].id != this.tstart.id) continue
					var posM = tstate.release[j].pos
					var posD = [posM[0], this.hD - posM[1]]
					cevents.push({
						type: "trelease",
						pos0D: this.tstart.posD,
						panel: this.tstart.panel,
						posD: posD,
						tpanel: catcherD(posD),
						t: this.tstart.t,
						vD: [tstate.release[j].v[0], -tstate.release[j].v[1]],
					})
					this.tstart = null
				}
			}
			
			if (ntouch == 0) {
				this.tstuck = false
				this.tstart = null
			} else if (ntouch == 1) {
			} else if (ntouch == 2) {
				this.tstart = null
				var t2state = UFX.touch.twotouchstate(tstate)
				if (t2state.rratio != 1) {
					var posD = DconvertM(t2state.center)
					cevents.push({
						type: "pinch",
						posD: posD,
						panel: catcherD(posD),
						dz: Math.log(t2state.rratio),
					})
				}
			} else {  // more than 2 touches at once? who does that? just give up until they're all let up
				this.tstuck = true
				this.tstart = null
			}
		}


		return cevents
		
/*		{
			dx: (kdown.right || kdown.D ? 1 : 0) - (kdown.left || kdown.A ? 1 : 0),
			dy: (kdown.up || kdown.W ? 1 : 0) - (kdown.down || kdown.S ? 1 : 0),
			dz: (kdown.ins || kdown.E ? 1 : 0) - (kdown.del || kdown.Q ? 1 : 0),
			
			screenshot: kdown.F12,
		}*/
	},
}


