// The control state

// Handles interpreting mouse and touch inputs into device-ignorant game events.
// Handler methods of current scene should be called onclick, etc.

// Events are as follows:

// click: mouseup when the mouse hasn't moved too far or been held too long
//    properties: 
// down: mouse button begins to be held down


var control = {
	reset: function () {
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
		if (mstate.left.down) {
			this.fire("down", { pos: pos })
		}
	},
}
control.reset()

