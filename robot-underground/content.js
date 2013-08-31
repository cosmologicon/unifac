
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
	} else if (ps.nextScene == "gameover") {
		setupGameOver(ps, m)
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
		["say_l", "This is it ... I've had it."],
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

	if (DEBUG.testdialogue) {
		m.actorTalkScript([
			["speaker_r", "Putney"],
			["speaker_l", "Camden"],
			["if_first", "act1.putney.intro", [
				["say_r", "Everyone else seems to be doing such important things."],
				["say_r", "Do you think there's room in life for everyone to make an important contribution in their own way?"],
				["ask_l", "What should I say?", [
					["Absolutely.",
						["say_r", "Sometimes I wonder."],
					],
					["Life is what you make of it.", 
						["say_r", "I don't know whether I should be pleased to hear that, or terrified."],
					],
					["What a philosophical question.",
						["say_r", "Sorry."],
						["say_r", "You probably aren't interested at all."],
					],
				]],
			], [
				["say_r","What a funny old world it is."],
			]],
		], m.map.bottomPos([50, 250]), "Putney", null, 240)
	}

	if (DEBUG.testinventory) {
		m.actorTalkScript([
			["speaker_l", "Camden"],
			["speaker_r", "Hammersmith"],
			["say_l", "Hello!"],
			["say_r", "Hello there, son."],
			["ask_r", "Need anything?", [
				["Inventory",
					["inventory"],
				],
				["Leave",
				],
			]],
			["say_r", "Come back any time."],
		], m.map.bottomPos([50, 50]), "Hammersmith", null, 270)
	}

	
	camden.addAreaScript([
		["wait", 25],
		["sound", "radio"],
		["wait", 5],
		["say_r", "Good work.", "Goldhawk"],
		["say_r", "Now, in the next room there's an enemy."],
		["say_r", "If you click on an enemy, it becomes your current target, and you'll continue to attack it until you select a different target or it dies."],
		["say_r", "You can move around while attacking, as long as you keep the target in sight and within range of your weapons, and as long as you have at least one active weapon."],
		["say_r", "You have a longer range than this enemy, so keep your distance and he can't hit you."],
//TODO		["say_r", "You can activate and deactivate your weapons by clicking the weapon icons on the lower left, or pressing the number key corresponding to their position."],
		["say_r", "You can activate and deactivate your weapons by clicking the weapon icons on the lower left."],
		["say_r", "Right now you only have one weapon, though, so probably best to keep it on."],
		["say_r", "Good luck, soldier."],
	], [300 + m.map.bottom_offs[0], 0 + m.map.bottom_offs[1]], [300, 300])	

	m.enemyDeathScript([
		["drop_metal", METALS[0], 4],
		["die"],
		["wait", 15],
		["sound", "radio"],
		["wait", 5],
		["say_r", "Good work!", "Goldhawk"],
		["say_r", "You'll notice that the enemy dropped some precious " + METALS[0].toLowerCase() + ", which you can pick up by moving over it."],
		["say_r", "Now, I'm working on restoring the extraction mechanism so that you can get out of there, but you'll need to get a little closer."],
		["say_r", "Move to the top of this area. There are more enemies on the way, but I'm sure you can handle them."],
		["speaker_l", "Camden"],
		["say_l", "Right, I'll do what I can."],
		["say_r", "Just keep your distance, and remember: if you're getting hurt, switch on your repair kit. Just like a weapon, click the icon."],
		["say_r", "Be careful, though. If you leave it switched on, it could drain energy from your weapons in a pinch."],
		["change_music", MISSION_MUSIC],
	], "Spider", [250 + m.map.bottom_offs[0], 650 + m.map.bottom_offs[1]])

	camden.addAreaScript([
		["sound", "radio"],
        ["wait", 5],
        ["say_r", "Nearly there, soldier.", "Goldhawk"],
        ["say_r", "In the room up ahead are a powerful enemy and two minions."],
        ["say_r", "Defeat those three and I should be able to get you out."],
	], [300 + m.map.top_offs[0], 0 + m.map.top_offs[1]], [2000, 300])

	var killScorpions = [
		["die_no_drop"],
		["increment", "killedScorpions"],
		["ifeq", "killedScorpions", 3, [
			["drop_weapon", ["MachineGun", null, ["Autofiring", 1]], [  // TODO
				["wait", 25],
				["sound", "radio"],
				["wait", 5],
				["say_r", "Ah, a weapon. When you get back to town, Colonel Hammersmith should be able to help you out with that.", "Goldhawk"],
				["say_r", "Now, I've managed to restore the extraction mechanism."],
				["say_r", "There should be an eject button in the bottom right corner of your screen."],
				["say_r", "You'll need to click on it, and then click again to confirm."],
				["say_r", "You can do so as soon as you're ready."],
				["canEject", true],
			]],
			["wait", 25],
			["sound", "radio"],
			["wait", 5],
			["say_r", "Excellent work.", "Goldhawk"],
			["say_r", "I see the scorpions were hoarding something of worth. You should pick it up and bring it with you."],
		]],
	]
	m.enemyDeathScript(killScorpions, "IntimidatingScorpion", [550 + m.map.top_offs[0], 750 + m.map.top_offs[1]], 270)
	m.enemyDeathScript(killScorpions, "Scorpion", [350 + m.map.top_offs[0], 650 + m.map.top_offs[1]], 290)
	m.enemyDeathScript(killScorpions, "Scorpion", [750 + m.map.top_offs[0], 650 + m.map.top_offs[1]], 250)
	
	m.canEject = false

	m.setEjectScript([
		["set_zoom", 0.1],
		["freeze", 25],
		["end_game"],
// TODO		["change_scene", "act1.town"],
	])

}

function setupGameOver(ps, m) {
	m.map = new DungeonGrid(100)
	m.addProtag([0, 0])
	m.setStartScript([
		["blank"],
		["say_l", "Camden was never seen again."],
		["say_l", "The world was destroyed in flames."],
		["say_l", "Your game is over."],
		["end_game"],
		// TODO: option to load saved game
	])
}




