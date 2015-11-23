// When things are unlocked as you progress through the game.

// These functions are called when the main button reaches the corresponding value.
var unlocks = {
	388: function () {
		state.addthing({ type: "decblocker", id: "blocker1", x: 30, y: 40, r: 15, n0: 3 })
		state.things.blocker1.settarget(state.things.main)
	},
	382: function () {
		state.addthing({ type: "autoclicker", id: "auto1", x: 20, y: -50, tact: 3, text: "3sec" })
	},

}
function unlock(n) {
	if (unlocks[n]) {
		unlocks[n]()
	}
}


