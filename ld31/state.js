var state = {
	njump: 2,
	maxhp: 10,
	place: "lex",
	donebosses: {},
	bombs: {
		sally: true,
		tanya: true,
		eli: true,
	}
}
var state0 = JSON.stringify(state)
function resetstate() {
	state = JSON.parse(state0)
}

