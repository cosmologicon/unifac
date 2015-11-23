// When things are unlocked as you progress through the game.

// These functions are called when the main button reaches the corresponding value.
var unlocks = {
	403: function () {
		state.addthing({ type: "decblocker", id: "blocker1", x: 30, y: 40, r: 15, n0: 3 })
		state.things.blocker1.settarget(state.things.main)
	},
	402: function () {
		state.addthing({ type: "autoclicker", id: "auto1", x: 20, y: -50, tact: 3, text: "3sec" })
	},
	401: function () {
		state.addthing({ type: "autoclicker", id: "auto2", x: -50, y: -20, tact: 1, text: "1sec" })
		state.addthing({ type: "consumeblocker", id: "blocker2", x: -80, y: -60, n0: 5 })
		state.things.blocker2.settarget(state.things.auto2)
	},

}
function unlock(n) {
	if (unlocks[n]) {
		unlocks[n]()
	}
}


