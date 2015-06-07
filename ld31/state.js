var state = {
	njump: settings.EASY ? 4 : 2,
	maxhp: settings.EASY ? 20 : 6,
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

