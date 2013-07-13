
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
	m.placeEnemiesRandomlyAnywhere({ Spider: 12, Scorpion: 8 })
	m.setStartScript([
		["change_music", null],
		["speaker_l", "Camden"],
        ["say_l", "How did I get myself into this mess? My first proper mission, and I'm going to die alone in this wasteland."],
        ["say_l", "Dammit!"],
        ["sound", "radio"],
        ["say_r", "... you hear me? Repeat, can you hear me?"],
        ["say_l", "What? Who's that? Is salvation at hand?"],
        ["say_l", "Who is that?"],
        ["say_r", "This is Commander Goldhawk of the Order of Knightsbridge.", "Goldhawk"],
        ["say_r", "I can get you out of there, but you're going to have to follow my instructions carefully."],
        ["say_l", "I'll do my best!"],
        ["say_r", "First, make sure you can move."],
        ["say_r", "Clicking on a patch of ground will move you there, assuming there's nothing in the way."],
        ["say_r", "You will keep moving towards the cursor until you let go of the button, and then keep going to the latest target."],
        ["say_r", "Try this now by moving into the room to your right."],
	])
	
	
}


