
function initPlotState(ps) {
	for (var s in ps) delete ps[s]
	ps.act = 1
	ps.sweetheart = "Victoria"
	ps["angel.rescued"] = true
	ps.nextScene = "act1.firstmission"
}

function setupMission(ps, m) {
	if (ps.nextScene == "act1.firstmission") {
		setupFirstMission(ps, m)
	}
}

function setupFirstMission(ps, m) {
	m.map = makeDungeon2({
		top: "controlroom",
		bottom: "3rooms",
		maxrooms: 6,
	})
	var camden = m.addProtag(m.map.bottomPos([150, 150]))
}


