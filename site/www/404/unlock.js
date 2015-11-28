// When things are unlocked as you progress through the game.

// These functions are called when the main button reaches the corresponding value.
var unlocks = {
	403: function () {
		state.addthing({ type: "decblocker", id: "blocker1", x: 30, y: 40, r: 15, n0: 3 })
		state.things.blocker1.settarget(state.things.main)
		state.addthing({ type: "decblocker", id: "blocker2", x: -20, y: -70, r: 15, n0: 4 })
		state.things.blocker2.settarget(state.things.main)
		state.addthing({ type: "decblocker", id: "blocker3", x: -30, y: 50, r: 15, n0: 3 })
		state.things.blocker3.settarget(state.things.main)
		state.addthing({ type: "decblocker", id: "blocker4", x: -60, y: 10, r: 12, n0: 2 })
		state.things.blocker4.settarget(state.things.blocker3)
		state.addthing({ type: "autoclicker", id: "auto1", x: 20, y: -50, tact: 1, text: "1/sec" })
		state.addthing({ type: "autoclicker", id: "auto2", x: -50, y: -20, tact: 1/3, text: "3/sec" })
		state.addthing({ type: "consumeblocker", id: "blockerx", x: -80, y: -60, n0: 5 })
		state.things.blockerx.settarget(state.things.auto2)
	},
}
function unlock(n) {
	if (unlocks[n]) {
		unlocks[n]()
	}
}


