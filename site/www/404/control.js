// The control state

// Handles interpreting mouse and touch inputs into device-ignorant game events.
// Handler methods of current scene should be called onclick, etc.

// Events are as follows:

// click: mouseup when the mouse hasn't moved too far or been held too long
//    properties: 
// down: mouse button begins to be held down


var control = {
	ddrag: 5,  // distance in pixels before a click becomes a drag
	tdrag: 0.3,  // time in seconds before a click becomes a drag
	reset: function () {
		this.isdown = false  // the mouse is currently being held down
		this.tdown = 0  // time that mouse has been held down
		this.dragging = false  // the mouse has been held down long enough to be dragging
		this.mpos0 = null  // screen position when mouse was first held down
		this.dragmpos = null  // screen position of last drag update
		this.pointed = null  // object currently pointed at, for cursor purposes
		this.dragthing = null  // object currently being dragged from, if any
	},
	// Fire an event to be handled by the current scene, if a handler exists.
	fire: function (ename, event) {
		var mname = "on" + ename, scene = UFX.scene.top()
		if (scene && scene[mname]) scene[mname](event)
	},
	think: function (dt) {
		var mstate = UFX.mouse.state()
		var mpos = mstate.pos
		if (!mpos) return
		var pos = camera.togame(mpos)
		this.pointed = this.thingat(pos)
		if (mstate.left.down) {
			this.fire("down", { pos: pos })
			this.isdown = true
			this.mpos0 = mpos
			this.dragmpos = mpos
			this.dragthing = this.pointed
		}
		if (this.isdown) {
			this.tdown += dt
			if (!this.dragging) {
				var dx = mpos[0] - this.mpos0[0], dy = mpos[1] - this.mpos0[1]
				if (dx * dx + dy * dy > this.ddrag * this.ddrag) this.dragging = true
				if (this.tdown > this.tdrag) this.dragging = true
			}
		}
		if (this.dragging) {
			var dx = mpos[0] - this.dragmpos[0], dy = mpos[1] - this.dragmpos[1]
			this.fire("drag", { dmpos: [dx, dy], thing: this.dragthing, pos: pos })
			this.dragmpos = mpos
		}
		if (this.isdown && mstate.left.up) {
			if (this.dragging) {
				this.fire("drop", { dragthing: this.dragthing, dropthing: this.pointed })
			} else {
				this.fire("click", { thing: this.pointed })
			}
			this.reset()
		}
	},
	thingat: function (pos) {
		for (var j = 0 ; j < state.thinglist.length ; ++j) {
			var thing = state.thinglist[j]
			if (thing.collide && thing.collide(pos)) return thing
		}
		return null
	},
}
control.reset()

